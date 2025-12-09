<?php
// init_db.php
require_once 'config.php';

try {
    if (defined('DB_DRIVER') && DB_DRIVER === 'mysql') {
        echo "Connecting to MySQL...\n";
        $dsn = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
        // Connect without DB first to create it
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $dbname = DB_NAME;
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `$dbname`");
        
        $autoInc = "AUTO_INCREMENT";
        $groupQuote = "`group`";
    } else {
        echo "Connecting to SQLite...\n";
        $dbPath = defined('DB_SQLITE_PATH') ? DB_SQLITE_PATH : __DIR__ . '/../bot.db';
        $pdo = new PDO('sqlite:' . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $autoInc = "AUTOINCREMENT";
        $groupQuote = "[group]"; // SQLite often accepts [] or "" but let's stick to what works
    }

    echo "Connected. Creating tables...\n";

    // Create Tables
    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY $autoInc,
            telegram_id BIGINT NOT NULL UNIQUE, 
            username VARCHAR(128),
            registered BOOLEAN DEFAULT 1,
            free_calls INTEGER DEFAULT 10,
            paid_calls INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY $autoInc,
            code VARCHAR(64) NOT NULL UNIQUE,
            name VARCHAR(255),
            description TEXT,
            api_url VARCHAR(1024),
            api_key VARCHAR(256),
            is_public BOOLEAN DEFAULT 1,
            $groupQuote VARCHAR(128) DEFAULT 'General'
        )",
        "CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY $autoInc,
            user_id INTEGER,
            imei VARCHAR(128),
            serial VARCHAR(128),
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        "CREATE TABLE IF NOT EXISTS api_usages (
            id INTEGER PRIMARY KEY $autoInc,
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
            id INTEGER PRIMARY KEY $autoInc,
            user_id INTEGER,
            amount FLOAT DEFAULT 0.0,
            method VARCHAR(128),
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )"
    ];

    foreach ($queries as $q) {
        // Adjust BIGINT for sqlite if needed (SQLite uses INTEGER for everything but BIGINT is fine as alias usually)
        if (DB_DRIVER !== 'mysql') {
             $q = str_replace('BIGINT', 'INTEGER', $q);
             // Remove ON DELETE CASCADE if issues in sqlite or keep it (SQLite supports it if enabled)
        }
        $pdo->exec($q);
    }
    
    echo "Database tables created successfully.\n";

} catch (PDOException $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
    if (strpos($e->getMessage(), 'could not find driver') !== false) {
        echo "\nCRITICAL ERROR: driver not found.\n";
    }
}
?>
