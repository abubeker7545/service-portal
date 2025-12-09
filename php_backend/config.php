<?php
// config.php

// Database Configuration
define('DB_DRIVER', 'mysql'); // 'sqlite' or 'mysql' (Change to 'mysql' on cPanel)
define('DB_HOST', 'localhost');
define('DB_NAME', 'service_poshegergn_serviceportalrtal_db');
define('DB_USER', 'shegergn_abuki'); // Change this in cPanel
define('DB_PASS', 'mubarek7545@@');     // Change this in cPanel

// SQLite path (if using sqlite)
define('DB_SQLITE_PATH', __DIR__ . '/../bot.db');

// Admin Auth
define('ADMIN_PASSWORD', 'password'); // Change this!
define('FLASK_SECRET', 'secret-key');

// Debug
define('DEBUG_MODE', true);
?>
