# seed.py
from models import Service, init_db
from sqlalchemy.orm import sessionmaker

# CHANGE IF NEEDED
DATABASE_URL = "sqlite:///./bot.db"

engine = init_db(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def seed_services():
    db = SessionLocal()

    DEFAULT_API_KEY = "f529a496-b799-47e1-b318-ca20517b4e25"

    services = [

        # ============================================================
        # FIRST LIST (imei.info)
        # ============================================================

        # ---------- APPLE ----------
        {
            "group": "Apple",
            "code": "apple_fmi",
            "name": "Apple Find My iPhone",
            "description": "Check FMI lock status",
            "api_url": "https://api.imei.info/api/apple/fmi/",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Apple",
            "code": "apple_activation_lock",
            "name": "Apple Activation Lock",
            "description": "Activation lock status check",
            "api_url": "https://api.imei.info/api/apple/activationlock/",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Apple",
            "code": "apple_warranty",
            "name": "Apple Warranty Status",
            "description": "Check Apple warranty coverage",
            "api_url": "https://api.imei.info/api/apple/warranty/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- SAMSUNG ----------
        {
            "group": "Samsung",
            "code": "samsung_warranty",
            "name": "Samsung Warranty Check",
            "description": "Samsung warranty status",
            "api_url": "https://api.imei.info/api/samsung/warranty/",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Samsung",
            "code": "samsung_findmymobile",
            "name": "Samsung Find My Mobile",
            "description": "Samsung tracking status",
            "api_url": "https://api.imei.info/api/samsung/findmymobile/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- GOOGLE ----------
        {
            "group": "Google",
            "code": "google_frp",
            "name": "Google FRP Lock",
            "description": "Factory Reset Protection status",
            "api_url": "https://api.imei.info/api/google/frp/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- XIAOMI ----------
        {
            "group": "Xiaomi",
            "code": "xiaomi_warranty",
            "name": "Xiaomi Warranty Check",
            "description": "Xiaomi device warranty",
            "api_url": "https://api.imei.info/api/xiaomi/warranty/",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Xiaomi",
            "code": "xiaomi_antitheft",
            "name": "Xiaomi Anti-Theft",
            "description": "Xiaomi security status",
            "api_url": "https://api.imei.info/api/xiaomi/antitheft/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- HUAWEI ----------
        {
            "group": "Huawei",
            "code": "huawei_warranty",
            "name": "Huawei Warranty Check",
            "description": "Huawei device warranty",
            "api_url": "https://api.imei.info/api/huawei/warranty/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- OPPO ----------
        {
            "group": "Oppo",
            "code": "oppo_warranty",
            "name": "Oppo Warranty Check",
            "description": "Oppo device warranty",
            "api_url": "https://api.imei.info/api/oppo/warranty/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- VIVO ----------
        {
            "group": "Vivo",
            "code": "vivo_warranty",
            "name": "Vivo Warranty Check",
            "description": "Vivo device warranty",
            "api_url": "https://api.imei.info/api/vivo/warranty/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- ONEPLUS ----------
        {
            "group": "OnePlus",
            "code": "oneplus_warranty",
            "name": "OnePlus Warranty Check",
            "description": "OnePlus device warranty",
            "api_url": "https://api.imei.info/api/oneplus/warranty/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- REALME ----------
        {
            "group": "Realme",
            "code": "realme_warranty",
            "name": "Realme Warranty Check",
            "description": "Realme device warranty",
            "api_url": "https://api.imei.info/api/realme/warranty/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- BLACKLIST ----------
        {
            "group": "Blacklist",
            "code": "gsma_blacklist",
            "name": "GSMA Blacklist Check",
            "description": "Global blacklist status",
            "api_url": "https://api.imei.info/api/gsma/blacklist/",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Blacklist",
            "code": "usa_blacklist",
            "name": "USA Blacklist Check",
            "description": "US carrier blacklist",
            "api_url": "https://api.imei.info/api/usa/blacklist/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- CARRIER LOCK ----------
        {
            "group": "Carrier",
            "code": "simlock_check",
            "name": "SIM Lock Status",
            "description": "Network lock check",
            "api_url": "https://api.imei.info/api/simlock/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- DEVICE INFO ----------
        {
            "group": "Device Info",
            "code": "tac_lookup",
            "name": "TAC Device Info",
            "description": "Basic TAC device information",
            "api_url": "https://api.imei.info/api/tac/",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Device Info",
            "code": "full_specs",
            "name": "Full Specifications",
            "description": "Complete device specifications",
            "api_url": "https://api.imei.info/api/specs/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- HISTORY ----------
        {
            "group": "History",
            "code": "repair_history",
            "name": "Repair History Check",
            "description": "Device repair records",
            "api_url": "https://api.imei.info/api/repair/",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- QUALITY ----------
        {
            "group": "Quality",
            "code": "refurbished_check",
            "name": "Refurbished Status",
            "description": "Check if device is refurbished",
            "api_url": "https://api.imei.info/api/refurbished/",
            "api_key": DEFAULT_API_KEY
        },

        # ============================================================
        # SECOND LIST (imeicheck.net)
        # ============================================================

        # ---------- APPLE ----------
        {
            "group": "Apple",
            "code": "apple_basic",
            "name": "Apple Basic Warranty",
            "description": "Warranty + Model + Activation",
            "api_url": "https://imeicheck.net/api/apple/warranty",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Apple",
            "code": "apple_mdm",
            "name": "Apple MDM Check",
            "description": "MDM Status",
            "api_url": "https://imeicheck.net/api/apple/mdm",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Apple",
            "code": "apple_icloud",
            "name": "Apple FMI",
            "description": "Find My iPhone",
            "api_url": "https://imeicheck.net/api/apple/fmi",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- SAMSUNG ----------
        {
            "group": "Samsung",
            "code": "samsung_basic",
            "name": "Samsung Warranty Basic",
            "description": "Warranty + Model",
            "api_url": "https://imeicheck.net/api/samsung/warranty",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Samsung",
            "code": "samsung_carrier",
            "name": "Samsung CSC",
            "description": "Carrier/Region",
            "api_url": "https://imeicheck.net/api/samsung/csc",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Samsung",
            "code": "samsung_fmip",
            "name": "Samsung FMIP",
            "description": "Find My Mobile Status",
            "api_url": "https://imeicheck.net/api/samsung/fmip",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- HUAWEI ----------
        {
            "group": "Huawei",
            "code": "huawei_basic",
            "name": "Huawei Warranty",
            "description": "Warranty + SN",
            "api_url": "https://imeicheck.net/api/huawei/warranty",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Huawei",
            "code": "huawei_activation",
            "name": "Huawei Activation Date",
            "description": "Activation Info",
            "api_url": "https://imeicheck.net/api/huawei/activation",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- XIAOMI ----------
        {
            "group": "Xiaomi",
            "code": "xiaomi_basic",
            "name": "Xiaomi Warranty Basic",
            "description": "Warranty + Region",
            "api_url": "https://imeicheck.net/api/xiaomi/warranty",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Xiaomi",
            "code": "xiaomi_blacklist",
            "name": "Xiaomi Blacklist",
            "description": "Lost/Stolen",
            "api_url": "httpsimeicheck.net/api/xiaomi/blacklist",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- GLOBAL IMEI ----------
        {
            "group": "Global IMEI",
            "code": "imei_basic",
            "name": "IMEI TAC Decode",
            "description": "Brand/Model decode",
            "api_url": "https://imeicheck.net/api/imei/tac",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Global IMEI",
            "code": "imei_blacklist",
            "name": "GSMA Blacklist",
            "description": "Lost/Stolen GSMA",
            "api_url": "https://imeicheck.net/api/imei/blacklist",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Global IMEI",
            "code": "imei_simlock",
            "name": "Simlock Check",
            "description": "Network Lock",
            "api_url": "https://imeicheck.net/api/imei/simlock",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Global IMEI",
            "code": "imei_full",
            "name": "Full IMEI Report",
            "description": "Warranty + blacklist + simlock",
            "api_url": "https://imeicheck.net/api/imei/full",
            "api_key": DEFAULT_API_KEY
        },

        # ---------- ANDROID ----------
        {
            "group": "Android",
            "code": "android_frp",
            "name": "Android FRP",
            "description": "Google FRP",
            "api_url": "https://imeicheck.net/api/android/frp",
            "api_key": DEFAULT_API_KEY
        },
        {
            "group": "Android",
            "code": "android_oem",
            "name": "OEM Unlock Status",
            "description": "Bootloader / OEM",
            "api_url": "https://imeicheck.net/api/android/oem",
            "api_key": DEFAULT_API_KEY
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
                api_key=svc["api_key"],
                group=svc["group"],
                is_public=True
            )
            db.add(new_svc)

    db.commit()
    db.close()
    print("DONE! All merged services inserted.")

if __name__ == "__main__":
    seed_services()
