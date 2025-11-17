# seed.py
from models import Service, init_db
from sqlalchemy.orm import sessionmaker

# CHANGE IF NEEDED
DATABASE_URL = "sqlite:///./bot.db"

engine = init_db(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def seed_services():
    db = SessionLocal()

    services = [
        # ---------- APPLE ----------
        {
            "group": "Apple",
            "code": "apple_basic",
            "name": "Apple Basic Warranty",
            "description": "Warranty + Model + Activation",
            "api_url": "https://api.yourdomain.com/apple/basic"
        },
        {
            "group": "Apple",
            "code": "apple_mdm",
            "name": "Apple MDM Check",
            "description": "Mobile Device Management Status",
            "api_url": "https://api.yourdomain.com/apple/mdm"
        },
        {
            "group": "Apple",
            "code": "apple_icloud",
            "name": "Apple iCloud FMI",
            "description": "Find My iPhone ON/OFF status",
            "api_url": "https://api.yourdomain.com/apple/icloud"
        },

        # ---------- SAMSUNG ----------
        {
            "group": "Samsung",
            "code": "samsung_basic",
            "name": "Samsung Warranty Basic",
            "description": "Warranty + Model",
            "api_url": "https://api.yourdomain.com/samsung/basic"
        },
        {
            "group": "Samsung",
            "code": "samsung_carrier",
            "name": "Samsung Carrier Info",
            "description": "Carrier/CSC Lookup",
            "api_url": "https://api.yourdomain.com/samsung/carrier"
        },
        {
            "group": "Samsung",
            "code": "samsung_fmip",
            "name": "Samsung FMIP",
            "description": "Find My Mobile Status",
            "api_url": "https://api.yourdomain.com/samsung/fmip"
        },

        # ---------- HUAWEI ----------
        {
            "group": "Huawei",
            "code": "huawei_basic",
            "name": "Huawei Basic Warranty",
            "description": "Warranty + SN Lookup",
            "api_url": "https://api.yourdomain.com/huawei/basic"
        },
        {
            "group": "Huawei",
            "code": "huawei_activation",
            "name": "Huawei Activation",
            "description": "Activation Date Lookup",
            "api_url": "https://api.yourdomain.com/huawei/activation"
        },

        # ---------- XIAOMI ----------
        {
            "group": "Xiaomi",
            "code": "xiaomi_basic",
            "name": "Xiaomi Warranty Basic",
            "description": "Warranty + Region",
            "api_url": "https://api.yourdomain.com/xiaomi/basic"
        },
        {
            "group": "Xiaomi",
            "code": "xiaomi_blacklist",
            "name": "Xiaomi Blacklist Check",
            "description": "Lost/Stolen/Blacklist",
            "api_url": "https://api.yourdomain.com/xiaomi/blacklist"
        },

        # ---------- GLOBAL IMEI ----------
        {
            "group": "Global IMEI",
            "code": "imei_basic",
            "name": "IMEI Basic Lookup",
            "description": "GSMA, Brand, Model, TAC decode",
            "api_url": "https://api.yourdomain.com/imei/basic"
        },
        {
            "group": "Global IMEI",
            "code": "imei_blacklist",
            "name": "IMEI Blacklist Status",
            "description": "GSMA lost/stolen blacklist check",
            "api_url": "https://api.yourdomain.com/imei/blacklist"
        },
        {
            "group": "Global IMEI",
            "code": "imei_simlock",
            "name": "IMEI Simlock Check",
            "description": "Simlock, Network Lock, Region Lock",
            "api_url": "https://api.yourdomain.com/imei/simlock"
        },
        {
            "group": "Global IMEI",
            "code": "imei_full",
            "name": "IMEI Full Report",
            "description": "Warranty, Blacklist, Simlock, GSMA all-in-one",
            "api_url": "https://api.yourdomain.com/imei/full"
        },

        # ---------- GOOGLE & ANDROID ----------
        {
            "group": "Android",
            "code": "android_frp",
            "name": "Android FRP Status",
            "description": "Google Account Lock / FRP Check",
            "api_url": "https://api.yourdomain.com/android/frp"
        },
        {
            "group": "Android",
            "code": "android_oem",
            "name": "OEM Lock Status",
            "description": "OEM Unlock Allowed / Bootloader Lock",
            "api_url": "https://api.yourdomain.com/android/oem"
        }
    ]

    print("Seeding services...")

    for svc in services:
        existing = db.query(Service).filter_by(code=svc["code"]).first()
        if not existing:
            new_svc = Service(
                code=svc["code"],
                name=svc["name"],
                description=svc["description"],
                api_url=svc["api_url"],
                group=svc["group"],
                is_public=True
            )
            db.add(new_svc)

    db.commit()
    db.close()
    print("DONE! Services inserted.")


if __name__ == "__main__":
    seed_services()
