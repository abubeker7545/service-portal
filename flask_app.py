import os
import requests
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
from models import init_db, Service, User, DeviceRecord, APIUsage, Payment
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
import models, db_utils
from datetime import datetime

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(basedir, 'bot.db')}")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "password")
FLASK_SECRET = os.environ.get("FLASK_SECRET", "secret-key")

engine = init_db(DATABASE_URL)
db_utils.init_session_factory(engine)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

app = Flask(__name__)
app.secret_key = FLASK_SECRET


# Add permissive CORS headers for development (allows the Vite frontend to call the API)
@app.after_request
def add_cors_headers(response):
    # When requests include credentials (cookies), the Access-Control-Allow-Origin
    # header must be an explicit origin (not '*'). For development we'll echo
    # the request Origin header back to the client so credentialed requests
    # (fetch with credentials: 'include') are permitted.
    origin = request.headers.get('Origin')
    if origin:
        # In production you should validate origin against an allow-list.
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'

    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    # Allow cookies to be sent to this server from the browser
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


# ============================================================
# ADMIN LOGIN MIDDLEWARE
# ============================================================
def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("login", next=request.path))
        return fn(*args, **kwargs)
    return wrapped


# ============================================================
# LOGIN / LOGOUT
# ============================================================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if request.form.get("password") == ADMIN_PASSWORD:
            session["admin_logged_in"] = True
            return redirect(url_for("users"))
        flash("Invalid password", "danger")
    return render_template("login.html")


# JSON API for admin login (used by SPA)
@app.route('/api/admin/login', methods=['POST'])
def api_admin_login():
    data = request.json or {}
    pwd = data.get('password')
    if not pwd:
        return jsonify({'success': False, 'error': 'Missing password'}), 400
    if pwd == ADMIN_PASSWORD:
        session['admin_logged_in'] = True
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Invalid password'}), 401


@app.route('/api/admin/logout', methods=['POST'])
def api_admin_logout():
    session.pop('admin_logged_in', None)
    return jsonify({'success': True})


@app.route("/logout")
def logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("login"))


# ============================================================
# ADMIN PAGES
# ============================================================
@app.route("/")
@admin_required
def users():
    db = SessionLocal()
    users = db.query(User).order_by(User.id.desc()).all()
    db.close()
    return render_template("users.html", users=users)


@app.route("/user/<int:user_id>")
@admin_required
def user_detail(user_id):
    db = SessionLocal()
    user = db.query(User).filter_by(id=user_id).first()
    devices = db.query(DeviceRecord).filter_by(user_id=user_id).all()
    usages = db.query(APIUsage).filter_by(user_id=user_id).order_by(APIUsage.created_at.desc()).limit(200).all()
    db.close()
    return render_template("user_detail.html", user=user, devices=devices, usages=usages)


@app.route("/services", methods=["GET", "POST"])
@admin_required
def services():
    db = SessionLocal()
    if request.method == "POST":
        svc = Service(
            code=request.form["code"],
            name=request.form["name"],
            group=request.form["group"],
            api_url=request.form["api_url"],
            api_key=request.form.get("api_key")
        )
        db.add(svc)
        db.commit()
        return redirect(url_for("services"))

    services = db.query(Service).order_by(Service.id).all()
    db.close()
    return render_template("services.html", services=services)


@app.route("/payments")
@admin_required
def payments():
    db = SessionLocal()
    payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(200).all()
    db.close()
    return render_template("payments.html", payments=payments)


@app.route("/user/<int:user_id>/set_quota", methods=["POST"])
@admin_required
def set_quota(user_id):
    free = int(request.form.get("free_calls", 0))
    db = SessionLocal()
    u = db.query(User).filter_by(id=user_id).first()
    if u:
        u.free_calls = free
        db.commit()
    db.close()
    return redirect(url_for("user_detail", user_id=user_id))


# ============================================================
# API FOR TELEGRAM BOT
# ============================================================

# ---------- GET USER DATA ----------
@app.route("/api/user/<int:user_id>")
def api_get_user(user_id):
    db = SessionLocal()
    # optional username can be provided as a query param (from bot) to populate new users
    username = request.args.get('username')
    user = db.query(User).filter_by(telegram_id=user_id).first()

    if not user:
        # Auto-create new user, include username if provided
        user = User(telegram_id=user_id, username=username, free_calls=10, paid_calls=0, registered=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # If a username was provided and user record lacks it or it changed, update it
        if username and (not user.username or user.username != username):
            user.username = username
            db.commit()
            db.refresh(user)

    result = {
        "user_id": user.id,
        "free_calls": user.free_calls,
        "paid_calls": user.paid_calls,
        "username": user.username
    }

    db.close()
    return jsonify(result)


@app.route("/api/add_service", methods=["POST"])
def api_add_service():
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON data"}), 400

    code = data.get("code")
    name = data.get("name")
    group = data.get("group", "General")
    api_url = data.get("api_url")

    if not code or not name or not api_url:
        return jsonify({"error": "Missing required fields: code, name, api_url"}), 400

    db = SessionLocal()
    # Check if service with same code already exists
    existing = db.query(Service).filter_by(code=code).first()
    if existing:
        db.close()
        return jsonify({"error": "Service with this code already exists"}), 400

    # Create new service
    svc = Service(code=code, name=name, group=group, api_url=api_url)
    db.add(svc)
    db.commit()
    db.refresh(svc)
    db.close()

    return jsonify({
        "message": "Service added successfully",
        "service": {
            "id": svc.id,
            "code": svc.code,
            "name": svc.name,
            "group": svc.group,
            "api_url": svc.api_url,
            "api_key": svc.api_key
        }
    }), 201

# ---------- GET SERVICE GROUPS ----------
@app.route("/api/services")
def api_services():
    db = SessionLocal()
    all_services = db.query(Service).order_by(Service.group, Service.name).all()
    result = []
    for svc in all_services:
        result.append({
            "id": svc.id,
            "code": svc.code,
            "name": svc.name,
            "description": svc.description,
            "api_url": svc.api_url,
            "api_key": svc.api_key,
            "is_public": bool(svc.is_public),
            "group": svc.group
        })
    db.close()
    return jsonify(result)

@app.route("/api/services/grouped")
def api_services_grouped():
    db = SessionLocal()
    all_services = db.query(Service).order_by(Service.group, Service.name).all()

    groups = {}
    for svc in all_services:
        if svc.group not in groups:
            groups[svc.group] = []
        groups[svc.group].append({
            "code": svc.code,
            "name": svc.name,
            "api_url": svc.api_url
        })

    db.close()
    return jsonify(groups)

@app.route('/api/payments')
def api_payments():
    db = SessionLocal()
    payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(200).all()
    result = []
    for p in payments:
        result.append({
            'id': p.id,
            'user_id': p.user_id,
            'amount': p.amount,
            'method': p.method,
            'note': p.note,
            'created_at': p.created_at.isoformat() if p.created_at else None
        })
    db.close()
    return jsonify(result)


# =========================
# Generic CRUD endpoints
# =========================

# --------- SERVICES CRUD ----------
@app.route('/api/services/<int:svc_id>')
def api_get_service(svc_id: int):
    db = SessionLocal()
    svc = db.query(Service).filter_by(id=svc_id).first()
    if not svc:
        db.close()
        return jsonify({'error': 'Service not found'}), 404
    result = {
        'id': svc.id,
        'code': svc.code,
        'name': svc.name,
        'description': svc.description,
        'api_url': svc.api_url,
        'api_key': svc.api_key,
        'is_public': bool(svc.is_public),
        'group': svc.group
    }
    db.close()
    return jsonify(result)


@app.route('/api/services', methods=['POST'])
def api_create_service():
    # reuse validation from existing add_service but accept json
    data = request.json
    if not data:
        return jsonify({'error': 'Missing JSON data'}), 400
    code = data.get('code')
    name = data.get('name')
    group = data.get('group', 'General')
    api_url = data.get('api_url')
    api_key = data.get('api_key')
    description = data.get('description', '')

    if not code or not name or not api_url:
        return jsonify({'error': 'Missing required fields: code, name, api_url'}), 400

    db = SessionLocal()
    existing = db.query(Service).filter_by(code=code).first()
    if existing:
        db.close()
        return jsonify({'error': 'Service with this code already exists'}), 400

    svc = Service(code=code, name=name, group=group, api_url=api_url, description=description, api_key=api_key)
    db.add(svc)
    db.commit()
    db.refresh(svc)
    result = {
        'id': svc.id,
        'code': svc.code,
        'name': svc.name,
        'description': svc.description,
        'api_url': svc.api_url,
        'api_key': svc.api_key,
        'is_public': bool(svc.is_public),
        'group': svc.group
    }
    db.close()
    return jsonify({'message': 'Service created', 'service': result}), 201


@app.route('/api/services/<int:svc_id>', methods=['PUT'])
def api_update_service(svc_id: int):
    data = request.json
    if not data:
        return jsonify({'error': 'Missing JSON data'}), 400
    db = SessionLocal()
    svc = db.query(Service).filter_by(id=svc_id).first()
    if not svc:
        db.close()
        return jsonify({'error': 'Service not found'}), 404

    # allow updating a subset of fields
    for field in ('code', 'name', 'description', 'api_url', 'group', 'is_public', 'api_key'):
        if field in data:
            setattr(svc, field, data[field])
    db.commit()
    db.refresh(svc)
    result = {
        'id': svc.id,
        'code': svc.code,
        'name': svc.name,
        'description': svc.description,
        'api_url': svc.api_url,
        'api_key': svc.api_key,
        'is_public': bool(svc.is_public),
        'group': svc.group
    }
    db.close()
    return jsonify({'message': 'Service updated', 'service': result})


@app.route('/api/services/<int:svc_id>', methods=['DELETE'])
def api_delete_service(svc_id: int):
    db = SessionLocal()
    svc = db.query(Service).filter_by(id=svc_id).first()
    if not svc:
        db.close()
        return jsonify({'error': 'Service not found'}), 404
    db.delete(svc)
    db.commit()
    db.close()
    return jsonify({'message': 'Service deleted'})


# --------- USERS CRUD ----------
@app.route('/api/users')
def api_get_users():
    db = SessionLocal()
    users = db.query(User).order_by(User.id.desc()).all()
    result = []
    for u in users:
        result.append({
            'id': u.id,
            'telegram_id': u.telegram_id,
            'username': u.username,
            'registered': bool(u.registered),
            'free_calls': u.free_calls,
            'paid_calls': u.paid_calls,
            'created_at': u.created_at.isoformat() if u.created_at else None
        })
    db.close()
    return jsonify(result)


@app.route('/api/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
def api_user_detail(user_id: int):
    db = SessionLocal()
    # GET by internal id
    if request.method == 'GET':
        u = db.query(User).filter_by(id=user_id).first()
        if not u:
            db.close()
            return jsonify({'error': 'User not found'}), 404
        result = {
            'id': u.id,
            'telegram_id': u.telegram_id,
            'username': u.username,
            'registered': bool(u.registered),
            'free_calls': u.free_calls,
            'paid_calls': u.paid_calls,
            'created_at': u.created_at.isoformat() if u.created_at else None
        }
        db.close()
        return jsonify(result)

    # PUT update
    if request.method == 'PUT':
        data = request.json
        if not data:
            db.close()
            return jsonify({'error': 'Missing JSON data'}), 400
        u = db.query(User).filter_by(id=user_id).first()
        if not u:
            db.close()
            return jsonify({'error': 'User not found'}), 404
        for field in ('username', 'registered', 'free_calls', 'paid_calls'):
            if field in data:
                setattr(u, field, data[field])
        db.commit()
        db.refresh(u)
        db.close()
        return jsonify({'message': 'User updated'})

    # DELETE
    if request.method == 'DELETE':
        u = db.query(User).filter_by(id=user_id).first()
        if not u:
            db.close()
            return jsonify({'error': 'User not found'}), 404
        db.delete(u)
        db.commit()
        db.close()
        return jsonify({'message': 'User deleted'})


# --------- DEVICES CRUD ----------
@app.route('/api/devices')
def api_get_devices():
    db = SessionLocal()
    devices = db.query(DeviceRecord).order_by(DeviceRecord.id.desc()).all()
    result = []
    for d in devices:
        result.append({
            'id': d.id,
            'user_id': d.user_id,
            'imei': d.imei,
            'serial': d.serial,
            'note': d.note,
            'created_at': d.created_at.isoformat() if d.created_at else None
        })
    db.close()
    return jsonify(result)


@app.route('/api/devices', methods=['POST'])
def api_create_device():
    data = request.json
    if not data:
        return jsonify({'error': 'Missing JSON data'}), 400
    user_id = data.get('user_id')
    imei = data.get('imei')
    serial = data.get('serial')
    note = data.get('note', '')
    if not user_id or not imei:
        return jsonify({'error': 'Missing required fields: user_id, imei'}), 400
    db = SessionLocal()
    device = DeviceRecord(user_id=user_id, imei=imei, serial=serial, note=note)
    db.add(device)
    db.commit()
    db.refresh(device)
    result = {
        'id': device.id,
        'user_id': device.user_id,
        'imei': device.imei,
        'serial': device.serial,
        'note': device.note,
        'created_at': device.created_at.isoformat() if device.created_at else None
    }
    db.close()
    return jsonify({'message': 'Device created', 'device': result}), 201


# --------- USAGE / LOGS READ ONLY ----------
@app.route('/api/usages')
def api_get_usages():
    db = SessionLocal()
    usages = db.query(APIUsage).order_by(APIUsage.created_at.desc()).limit(500).all()
    result = []
    for u in usages:
        result.append({
            'id': u.id,
            'user_id': u.user_id,
            'service_id': u.service_id,
            'imei': u.imei,
            'success': bool(u.success),
            'cost': u.cost,
            'created_at': u.created_at.isoformat() if u.created_at else None
        })
    db.close()
    return jsonify(result)


# --------- PAYMENTS CRUD ----------
@app.route('/api/payments/<int:pay_id>', methods=['GET', 'DELETE'])
def api_payment_detail(pay_id: int):
    db = SessionLocal()
    p = db.query(Payment).filter_by(id=pay_id).first()
    if not p:
        db.close()
        return jsonify({'error': 'Payment not found'}), 404
    if request.method == 'GET':
        result = {
            'id': p.id,
            'user_id': p.user_id,
            'amount': p.amount,
            'method': p.method,
            'note': p.note,
            'created_at': p.created_at.isoformat() if p.created_at else None
        }
        db.close()
        return jsonify(result)
    if request.method == 'DELETE':
        db.delete(p)
        db.commit()
        db.close()
        return jsonify({'message': 'Payment deleted'})


@app.route('/api/payments', methods=['POST'])
def api_create_payment():
    data = request.json
    if not data:
        return jsonify({'error': 'Missing JSON data'}), 400
    user_id = data.get('user_id')
    amount = data.get('amount')
    method = data.get('method')
    note = data.get('note')
    if amount is None or method is None:
        return jsonify({'error': 'Missing required fields: amount, method'}), 400
    db = SessionLocal()
    p = Payment(user_id=user_id, amount=amount, method=method, note=note)
    db.add(p)
    db.commit()
    db.refresh(p)
    result = {
        'id': p.id,
        'user_id': p.user_id,
        'amount': p.amount,
        'method': p.method,
        'note': p.note,
        'created_at': p.created_at.isoformat() if p.created_at else None
    }
    db.close()
    return jsonify({'message': 'Payment created', 'payment': result}), 201


# --------- DASHBOARD STATUS ----------
@app.route('/api/status')
def api_status():
    db = SessionLocal()
    users_count = db.query(User).count()
    services_count = db.query(Service).count()
    devices_count = db.query(DeviceRecord).count()
    usages_count = db.query(APIUsage).count()
    payments_sum = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).scalar()

    # recent usages sample
    recent_usages = db.query(APIUsage).order_by(APIUsage.created_at.desc()).limit(10).all()
    recent = []
    for u in recent_usages:
        recent.append({
            'id': u.id,
            'user_id': u.user_id,
            'service_id': u.service_id,
            'imei': u.imei,
            'success': bool(u.success),
            'cost': u.cost,
            'created_at': u.created_at.isoformat() if u.created_at else None
        })
    db.close()
    return jsonify({
        'users_count': users_count,
        'services_count': services_count,
        'devices_count': devices_count,
        'usages_count': usages_count,
        'payments_total': float(payments_sum or 0.0),
        'recent_usages': recent
    })


# --------- ADDITIONAL HELPERS / FILTERED ENDPOINTS ----------
@app.route('/api/devices/<int:device_id>', methods=['GET', 'PUT', 'DELETE'])
def api_device_detail(device_id: int):
    db = SessionLocal()
    d = db.query(DeviceRecord).filter_by(id=device_id).first()
    if not d:
        db.close()
        return jsonify({'error': 'Device not found'}), 404
    if request.method == 'GET':
        result = {
            'id': d.id,
            'user_id': d.user_id,
            'imei': d.imei,
            'serial': d.serial,
            'note': d.note,
            'created_at': d.created_at.isoformat() if d.created_at else None
        }
        db.close()
        return jsonify(result)
    if request.method == 'PUT':
        data = request.json
        if not data:
            db.close()
            return jsonify({'error': 'Missing JSON data'}), 400
        for field in ('imei', 'serial', 'note', 'user_id'):
            if field in data:
                setattr(d, field, data[field])
        db.commit()
        db.refresh(d)
        res = {
            'id': d.id,
            'user_id': d.user_id,
            'imei': d.imei,
            'serial': d.serial,
            'note': d.note,
            'created_at': d.created_at.isoformat() if d.created_at else None
        }
        db.close()
        return jsonify({'message': 'Device updated', 'device': res})
    if request.method == 'DELETE':
        db.delete(d)
        db.commit()
        db.close()
        return jsonify({'message': 'Device deleted'})


@app.route('/api/usages/<int:usage_id>')
def api_get_usage(usage_id: int):
    db = SessionLocal()
    u = db.query(APIUsage).filter_by(id=usage_id).first()
    if not u:
        db.close()
        return jsonify({'error': 'Usage not found'}), 404
    result = {
        'id': u.id,
        'user_id': u.user_id,
        'service_id': u.service_id,
        'imei': u.imei,
        'success': bool(u.success),
        'cost': u.cost,
        'created_at': u.created_at.isoformat() if u.created_at else None
    }
    db.close()
    return jsonify(result)


@app.route('/api/users/<int:user_id>/usages')
def api_get_user_usages(user_id: int):
    db = SessionLocal()
    usages = db.query(APIUsage).filter_by(user_id=user_id).order_by(APIUsage.created_at.desc()).limit(500).all()
    result = []
    for u in usages:
        result.append({
            'id': u.id,
            'user_id': u.user_id,
            'service_id': u.service_id,
            'imei': u.imei,
            'success': bool(u.success),
            'cost': u.cost,
            'created_at': u.created_at.isoformat() if u.created_at else None
        })
    db.close()
    return jsonify(result)


@app.route('/api/users/<int:user_id>/payments')
def api_get_user_payments(user_id: int):
    db = SessionLocal()
    payments = db.query(Payment).filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
    result = []
    for p in payments:
        result.append({
            'id': p.id,
            'user_id': p.user_id,
            'amount': p.amount,
            'method': p.method,
            'note': p.note,
            'created_at': p.created_at.isoformat() if p.created_at else None
        })
    db.close()
    return jsonify(result)


@app.route('/api/services/code/<string:code>')
def api_get_service_by_code(code: str):
    db = SessionLocal()
    svc = db.query(Service).filter_by(code=code).first()
    if not svc:
        db.close()
        return jsonify({'error': 'Service not found'}), 404
    result = {
        'id': svc.id,
        'code': svc.code,
        'name': svc.name,
        'description': svc.description,
        'api_url': svc.api_url,
        'api_key': svc.api_key,
        'is_public': bool(svc.is_public),
        'group': svc.group
    }
    db.close()
    return jsonify(result)


# =========================================
# /api/lookup endpoint – now calls REAL provider APIs correctly
# =========================================
@app.route("/api/lookup", methods=["POST"])
def api_lookup_flask():
    data = request.json
    user_id = data.get("user_id")
    service_code = data.get("service")
    imei = data.get("imei")

    db = SessionLocal()

    # ----------------------------
    # USER HANDLING
    # ----------------------------
    username = data.get("username")
    user = db.query(User).filter_by(telegram_id=user_id).first()

    if not user:
        user = User(
            telegram_id=user_id,
            username=username,
            free_calls=10,
            paid_calls=0,
            registered=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if username and username != user.username:
            user.username = username
            db.commit()

    # ----------------------------
    # SERVICE LOOKUP
    # ----------------------------
    svc = db.query(Service).filter_by(code=service_code).first()
    if not svc:
        db.close()
        return jsonify({"error": "Service not found"}), 404

    # QUOTA
    if user.free_calls <= 0:
        db.close()
        return jsonify({"error": "No free calls left"}), 403

    # ----------------------------
    # CALL REAL IMEI PROVIDER API
    # ----------------------------
    success = False
    service_result = None
    error_msg = None

    # ----------------------------
    # CALL REAL IMEI PROVIDER API
    # ----------------------------
    success = False
    service_result = None
    error_msg = None

    # Prepare payload and headers
    params = {"imei": imei}
    headers = {
        "User-Agent": "TGService/1.0",
        "Accept": "application/json"
    }

    if svc.api_key:
        params["apikey"] = svc.api_key
        params["key"] = svc.api_key
        params["token"] = svc.api_key
        headers["Authorization"] = f"Bearer {svc.api_key}"
        headers["key"] = svc.api_key

    try:
        # Default to POST for known services or if explicitly needed
        # Since we don't have a method field, we'll try to infer or default to POST for these providers
        if "imei.info" in svc.api_url or "imeicheck.net" in svc.api_url:
             response = requests.post(svc.api_url, json=params, headers=headers, timeout=30)
        else:
             # Default to GET for others
             response = requests.get(svc.api_url, params=params, headers=headers, timeout=30)
        
        # Check if we got a valid response
        if response.status_code == 405: # Method Not Allowed -> Try the other one
             if "imei.info" in svc.api_url or "imeicheck.net" in svc.api_url:
                 response = requests.get(svc.api_url, params=params, headers=headers, timeout=30)
             else:
                 response = requests.post(svc.api_url, json=params, headers=headers, timeout=30)

        response.raise_for_status()

        try:
            service_result = response.json()
            success = True
            
            # Check for common API error fields in 200 OK responses
            if isinstance(service_result, dict):
                if "error" in service_result and service_result["error"]:
                    success = False
                    error_msg = str(service_result["error"])
                elif "status" in service_result and service_result["status"] == "failed":
                    success = False
                    error_msg = service_result.get("message", "Unknown error")

        except ValueError:
            error_msg = "Provider returned invalid JSON: " + response.text[:100]
    except requests.exceptions.RequestException as e:
        error_msg = f"Provider API call failed: {str(e)}"

    # ----------------------------
    # QUOTA REDUCTION (only on success)
    # ----------------------------
    if success and user.free_calls > 0:
        user.free_calls -= 1

    # ----------------------------
    # SAVE USAGE + DEVICE
    # ----------------------------
    usage = APIUsage(
        user_id=user.id,
        service_id=svc.id,
        imei=imei,
        success=success,
        cost=0.0
    )

    device = db.query(DeviceRecord).filter_by(user_id=user.id, imei=imei).first()
    if not device:
        device = DeviceRecord(user_id=user.id, imei=imei)

    db.add(usage)
    db.add(device)
    db.commit()
    db.close()

    # ----------------------------
    # RETURN RESULT
    # ----------------------------
    if success:
        return jsonify(service_result)
    else:
        return jsonify({"error": error_msg}), 200

# ============================================================
# RUN FLASK
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
