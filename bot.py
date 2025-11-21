import logging
import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, ContextTypes, filters
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("API_URL", "https://serviceapi.shegergsm.com/api")
BOT_TOKEN = os.getenv("BOT_TOKEN", "6806239673:AAESKUzLKgyOWl0-atsgsA-diSYrkhmRO9I")

STATE = {}  # per-user temporary state


# ---------- API HELPERS ---------- #
def api_get_user(user_id, username=None):
    """Fetch user info from Flask API with safe error handling."""
    try:
        url = f"{API_URL}/user/{user_id}"
        if username:
            url = f"{url}?username={username}"
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.error(f"Failed to fetch user {user_id}: {e}, response: {getattr(r, 'text', None)}")
        return {"id": user_id, "free_calls": 0, "paid_calls": 0, "username": None}


def api_get_services():
    try:
        r = requests.get(f"{API_URL}/services/grouped", timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.error(f"Failed to fetch services: {e}")
        return {}


def api_lookup(service, imei, user_id, username=None):
    try:
        payload = {"user_id": user_id, "service": service, "imei": imei}
        if username:
            payload["username"] = username
        r = requests.post(
            f"{API_URL}/lookup",
            json=payload,
            timeout=10
        )
        r.raise_for_status()
        data = r.json()
        if "error" in data:
            return f"⚠️ Error: {data['error']}"
        return data
    except Exception as e:
        logger.error(f"Lookup failed: {e}")
        return f"⚠️ Lookup failed: {e}"


# ---------- BOT MENU HANDLERS ---------- #
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    buttons = [
        [InlineKeyboardButton("🛠️ Services", callback_data="services")],
        [InlineKeyboardButton("👤 Account", callback_data="account")],
        [InlineKeyboardButton("ℹ️ Info", callback_data="info")],
        [InlineKeyboardButton("🆘 Help", callback_data="help")],
    ]
    text = "Welcome! Choose an option:"
    if update.message:
        await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(buttons))
    else:
        await update.callback_query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(buttons))


async def menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    user_id = query.from_user.id
    await query.answer()
    data = query.data

    # BACK BUTTON
    if data == "back_main":
        await start(update, context)
        return
    elif data == "back_services":
        await show_services(update, context)
        return

    # ACCOUNT
    if data == "account":
        user = api_get_user(user_id, query.from_user.username)
        msg = f"👤 **Account Info**\nFree Calls: {user.get('free_calls',0)}\nPaid Calls: {user.get('paid_calls',0)}"
        buttons = [[InlineKeyboardButton("⬅ Back", callback_data="back_main")]]
        await query.edit_message_text(msg, reply_markup=InlineKeyboardMarkup(buttons))
        return

    # INFO
    if data == "info":
        buttons = [[InlineKeyboardButton("⬅ Back", callback_data="back_main")]]
        await query.edit_message_text("This bot provides device lookup services.", reply_markup=InlineKeyboardMarkup(buttons))
        return

    # HELP
    if data == "help":
        buttons = [[InlineKeyboardButton("⬅ Back", callback_data="back_main")]]
        await query.edit_message_text("Send /start anytime to return to menu.", reply_markup=InlineKeyboardMarkup(buttons))
        return

    # SERVICES
    if data == "services":
        await show_services(update, context)
        return

    # SERVICE GROUP
    # SERVICE GROUP
    if data.startswith("group_"):
        group_name = data.replace("group_", "")
        all_services = api_get_services()

        if group_name not in all_services:
            await query.edit_message_text(f"No services in group {group_name}")
            return

        services = all_services[group_name]

        # --- BUILD 2 BUTTONS PER ROW ---
        buttons = []
        row = []
        for svc in services:
            row.append(InlineKeyboardButton(svc["name"], callback_data=f"svc_{svc['code']}"))
            if len(row) == 2:        # when row is full → push it
                buttons.append(row)
                row = []
        if row:                      # remaining button (odd count)
            buttons.append(row)

        # BACK BUTTON
        buttons.append([InlineKeyboardButton("⬅ Back", callback_data="back_services")])

        await query.edit_message_text(
            f"Services in *{group_name}*:",
            reply_markup=InlineKeyboardMarkup(buttons)
        )
        return

    # SERVICE SELECTED → ask IMEI
    if data.startswith("svc_"):
        service_code = data.replace("svc_", "")
        STATE[user_id] = {"awaiting_imei": True, "service": service_code}
        await query.edit_message_text("Send the IMEI/Serial number for this service:")
        return


async def show_services(update, context):
    """List service groups."""
    all_services = api_get_services()
    buttons = [[InlineKeyboardButton(grp, callback_data=f"group_{grp}")] for grp in all_services.keys()]
    buttons.append([InlineKeyboardButton("⬅ Back", callback_data="back_main")])
    await update.callback_query.edit_message_text("Choose a service group:", reply_markup=InlineKeyboardMarkup(buttons))


# ---------- IMEI HANDLER ---------- #
async def receive_imei(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in STATE or not STATE[user_id].get("awaiting_imei"):
        return  # ignore unrelated messages

    imei = update.message.text.strip()
    service = STATE[user_id]["service"]

    username = update.effective_user.username if update.effective_user else None
    result = api_lookup(service, imei, user_id, username=username)
    await update.message.reply_text(f"📡 Result:\n{result}")

    # Clear user state
    STATE[user_id]["awaiting_imei"] = False


# ---------- MAIN ---------- #
def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(menu_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, receive_imei))
    app.run_polling()


if __name__ == "__main__":
    main()
