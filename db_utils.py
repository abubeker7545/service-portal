# db_utils.py
import asyncio
from sqlalchemy.orm import sessionmaker
from models import User, Service, DeviceRecord, APIUsage, Payment

SessionLocal = None  # will be set from app startup

def init_session_factory(engine):
    global SessionLocal
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

async def run_db(func, *args, **kwargs):
    """
    Run blocking DB function in a thread and return result.
    func must be a sync function that uses SessionLocal().
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, lambda: func(*args, **kwargs))


# Example sync DB helper functions (called via run_db)
def sync_get_or_create_user(telegram_id, username=None):
    s = SessionLocal()
    try:
        u = s.query(User).filter_by(telegram_id=telegram_id).first()
        if not u:
            u = User(telegram_id=telegram_id, username=username)
            s.add(u)
            s.commit()
            s.refresh(u)
        return u
    finally:
        s.close()

def sync_list_services():
    s = SessionLocal()
    try:
        return s.query(Service).order_by(Service.id).all()
    finally:
        s.close()

def sync_get_service_by_code(code):
    s = SessionLocal()
    try:
        return s.query(Service).filter_by(code=code).first()
    finally:
        s.close()

def sync_create_usage(user_id, service_id, imei, success, cost=0.0):
    s = SessionLocal()
    try:
        u = APIUsage(user_id=user_id, service_id=service_id, imei=imei, success=success, cost=cost)
        s.add(u)
        s.commit()
        s.refresh(u)
        return u
    finally:
        s.close()

def sync_store_device(user_id, imei=None, serial=None, note=None):
    s = SessionLocal()
    try:
        d = DeviceRecord(user_id=user_id, imei=imei, serial=serial, note=note)
        s.add(d)
        s.commit()
        s.refresh(d)
        return d
    finally:
        s.close()

def sync_decrement_free_call(telegram_id):
    s = SessionLocal()
    try:
        u = s.query(User).filter_by(telegram_id=telegram_id).first()
        if not u:
            return None
        if u.free_calls > 0:
            u.free_calls -= 1
            s.commit()
        return u
    finally:
        s.close()

def sync_get_user_by_tg(telegram_id):
    s = SessionLocal()
    try:
        return s.query(User).filter_by(telegram_id=telegram_id).first()
    finally:
        s.close()
