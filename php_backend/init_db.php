<?php
// init_db.php

$dbPath = __DIR__ . '/../bot.db';
$needsInit = !file_exists($dbPath);

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database at $dbPath\n";

    // Create Tables
    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER NOT NULL UNIQUE,
            username VARCHAR(128),
            registered BOOLEAN DEFAULT 1,
            free_calls INTEGER DEFAULT 10,
            paid_calls INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(64) NOT NULL UNIQUE,
            name VARCHAR(255),
            description TEXT DEFAULT '',
            api_url VARCHAR(1024),
            api_key VARCHAR(256),
            is_public BOOLEAN DEFAULT 1,
            [group] VARCHAR(128) DEFAULT 'General'
        )",
        "CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            imei VARCHAR(128),
            serial VARCHAR(128),
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )",
        "CREATE TABLE IF NOT EXISTS api_usages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            service_id INTEGER,
            imei VARCHAR(128),
            success BOOLEAN DEFAULT 0,
            cost FLOAT DEFAULT 0.0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(service_id) REFERENCES services(id)
        )",
        "CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount FLOAT DEFAULT 0.0,
            method VARCHAR(128),
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )"
    ];

    foreach ($queries as $q) {
        $pdo->exec($q);
    }
    
    echo "Database tables created successfully.\n";

} catch (PDOException $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
    if (strpos($e->getMessage(), 'could not find driver') !== false) {
        echo "\nCRITICAL ERROR: SQLite driver not found.\n";
        echo "Please enable 'extension=pbs_sqlite' or 'extension=sqlite3' in your php.ini file.\n";
    }
}

