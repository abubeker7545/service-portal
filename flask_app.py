import os
import requests
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
from models import init_db, Service, User, DeviceRecord, APIUsage, Payment
from sqlalchemy.orm import sessionmaker
import models, db_utils
from datetime import datetime

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./bot.db")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
FLASK_SECRET = os.environ.get("FLASK_SECRET", "secret-key")

engine = init_db(DATABASE_URL)
db_utils.init_session_factory(engine)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

app = Flask(__name__)
app.secret_key = FLASK_SECRET


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
            api_url=request.form["api_url"]
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
    user = db.query(User).filter_by(telegram_id=user_id).first()

    if not user:
        # Auto-create new user
        user = User(telegram_id=user_id, free_calls=10, paid_calls=0, registered=True)
        db.add(user)
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
            "api_url": svc.api_url
        }
    }), 201

# ---------- GET SERVICE GROUPS ----------
@app.route("/api/services")
def api_services():
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


# =========================================
# /api/lookup endpoint – calls service API
# =========================================
@app.route("/api/lookup", methods=["POST"])
def api_lookup_flask():
    data = request.json
    user_id = data.get("user_id")
    service_code = data.get("service")
    imei = data.get("imei")

    db = SessionLocal()

    # USER CHECK
    user = db.query(User).filter_by(telegram_id=user_id).first()
    if not user:
        user = User(telegram_id=user_id, free_calls=10, paid_calls=0, registered=True)
        db.add(user)
        db.commit()
        db.refresh(user)

    # SERVICE CHECK
    svc = db.query(Service).filter_by(code=service_code).first()
    if not svc:
        db.close()
        return jsonify({"error": "Service not found"}), 404

    # QUOTA CHECK
    if user.free_calls <= 0:
        db.close()
        return jsonify({"error": "No free calls left"}), 403

    # CALL SERVICE API
    try:
        r = requests.post(
            svc.api_url,
            json={"imei": imei, "user_id": user_id},
            timeout=10
        )
        r.raise_for_status()
        try:
            result = r.json()  
        except ValueError as ve:
            db.close()
            return jsonify({"error": f"Invalid JSON response from service: {ve}, response content: {r.text}"}), 200
    except requests.exceptions.RequestException as e:
        db.close()
        # Return the actual error message to the bot
        return jsonify({"error": f"Service API call failed: {str(e)}"}), 200

    # REDUCE QUOTA & SAVE USAGE
    user.free_calls -= 1
    usage = APIUsage(user_id=user.id, service_id=svc.id, imei=imei, success=True, cost=0.0)
    # Check if the device already exists for this user/IMEI before creating
    device = db.query(DeviceRecord).filter_by(user_id=user.id, imei=imei).first()
    if not device:
        device = DeviceRecord(user_id=user.id, imei=imei, serial=None)
    db.add_all([usage, device])
    db.commit()
    db.close()

    return jsonify(result)

# ============================================================
# RUN FLASK
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
