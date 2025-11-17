# models.py
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func, Float
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy import create_engine

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)         # local DB id
    telegram_id = Column(Integer, unique=True, nullable=False) # telegram user id
    username = Column(String(128))
    registered = Column(Boolean, default=True)
    free_calls = Column(Integer, default=10)
    paid_calls = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    devices = relationship("DeviceRecord", back_populates="user")
    usages = relationship("APIUsage", back_populates="user")
    payments = relationship("Payment", back_populates="user")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    code = Column(String(64), unique=True, nullable=False)  # e.g., svc_imei_basic
    name = Column(String(255))
    description = Column(Text, default="")
    api_url = Column(String(1024))  # backend URL to call for this service (you manage)
    is_public = Column(Boolean, default=True)
    group = Column(String(128), default="General")


    usages = relationship("APIUsage", back_populates="service")

class DeviceRecord(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    imei = Column(String(128), index=True)
    serial = Column(String(128), index=True)
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="devices")

class APIUsage(Base):
    __tablename__ = "api_usages"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    imei = Column(String(128))
    success = Column(Boolean, default=False)
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="usages")
    service = relationship("Service", back_populates="usages")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount = Column(Float, default=0.0)
    method = Column(String(128))
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payments")

# Database engine & session factory (use env var DATABASE_URL)
def init_db(database_url: str = "sqlite:///./bot.db"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    return engine

# create a session factory after init_db:
# SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
