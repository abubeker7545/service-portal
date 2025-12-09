# Deploying to cPanel

## Prerequisites
1.  A cPanel account.
2.  A domain or subdomain pointed to your cPanel.
3.  Database credentials (created in cPanel).

## Steps

1.  **Upload Files**
    *   Navigate to your `public_html` folder (or the subdomain folder) in cPanel File Manager.
    *   Upload all files from `php_backend` folder (excluding `bot.db` if you are starting fresh with MySQL).
    *   Ensure `.htaccess` is uploaded (it might be hidden, check File Manager settings to "Show Hidden Files").

2.  **Create Database**
    *   Go to "MySQL® Databases" in cPanel.
    *   Create a new database (e.g., `youruser_serviceportal`).
    *   Create a new user (e.g., `youruser_dbadmin`) and password.
    *   Add the user to the database with **ALL PRIVILEGES**.

3.  **Configure `config.php`**
    *   Edit `config.php` in File Manager.
    *   Set `DB_DRIVER` to `'mysql'`.
    *   Update `DB_HOST` (usually `localhost`), `DB_NAME`, `DB_USER`, and `DB_PASS` with the values from Step 2.
    *   Update `ADMIN_PASSWORD` to a secure password.

4.  **Initialize Database**
    *   In your browser, visit: `https://yourdomain.com/init_db.php`.
    *   You should see "Connected. Creating tables... Database tables created successfully."
    *   **Security Tip**: After initialization, verify tables in phpMyAdmin, then delete or rename `init_db.php` to prevent re-running it.

5.  **Test API**
    *   Visit `https://yourdomain.com/api/services`.
    *   It should return an empty JSON array `[]` (if no services yet).

## Troubleshooting
*   **500 Internal Server Error**: Check cPanel "Errors" log. often due to `.htaccess` syntax or PHP version. ensure PHP 7.4+ or 8.x is selected in "Select PHP Version".
*   **Database Error**: Double check `config.php` credentials.
*   **404 Not Found**: Ensure `.htaccess` is present and allowed.
