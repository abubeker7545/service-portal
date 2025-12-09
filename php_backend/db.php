<?php
// db.php
require_once 'config.php';

function getDB() {
    try {
        if (defined('DB_DRIVER') && DB_DRIVER === 'mysql') {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
        } else {
            // Fallback to SQLite
            $dbPath = defined('DB_SQLITE_PATH') ? DB_SQLITE_PATH : __DIR__ . '/../bot.db';
            $pdo = new PDO('sqlite:' . $dbPath);
        }
        
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        // If connection fails, return valid JSON error
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
}
?>
