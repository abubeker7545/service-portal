<?php
// models.php
// This file assumes the database schema is managed via the previous Python migration or raw SQL.
// The PHP backend uses raw PDO queries in index.php for simplicity and performance in this migration.

require_once 'db.php';

// If you wish to use an ORM later, you can define classes here.
// For now, the schema expected is:
// - users (id, telegram_id, username, registered, free_calls, paid_calls, created_at)
// - services (id, code, name, group, api_url, description, api_key, is_public)
// - devices (id, user_id, imei, serial, note, created_at)
// - api_usages (id, user_id, service_id, imei, success, cost, created_at)
// - payments (id, user_id, amount, method, note, created_at)

