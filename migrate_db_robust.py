
import sqlite3
import os

db_path = "bot.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

columns_to_check = [
    ("description", "TEXT DEFAULT ''"),
    ("is_public", "BOOLEAN DEFAULT 1"),
    ("group", "VARCHAR(128) DEFAULT 'General'"),
    ("api_key", "VARCHAR(256)") 
]

# Note: "group" is a reserved word in some SQL, but in SQLite it's usually fine as column name if quoted, 
# but ALTER TABLE ADD COLUMN might be tricky if not careful. 
# However, the model uses "group". 
# Let's try adding them one by one.

for col_name, col_type in columns_to_check:
    try:
        print(f"Attempting to add {col_name}...")
        # Quote column name just in case
        cursor.execute(f'ALTER TABLE services ADD COLUMN "{col_name}" {col_type}')
        conn.commit()
        print(f"Successfully added {col_name}.")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e):
            print(f"Column {col_name} already exists.")
        else:
            print(f"Error adding {col_name}: {e}")
    except Exception as e:
        print(f"An error occurred for {col_name}: {e}")

conn.close()
