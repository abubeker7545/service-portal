
import sqlite3
import os

db_path = "bot.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Attempting to add api_key column to services table...")
    cursor.execute("ALTER TABLE services ADD COLUMN api_key VARCHAR(256)")
    conn.commit()
    print("Successfully added api_key column.")
except sqlite3.OperationalError as e:
    if "duplicate column" in str(e):
        print("Column api_key already exists.")
    else:
        print(f"Error adding column: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    conn.close()
