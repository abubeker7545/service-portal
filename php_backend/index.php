<?php
// Handle CORS immediately
// Force wildcard for debugging if origin logic fails
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, key, token");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Send headers and exit
    header("HTTP/1.1 200 OK");
    exit;
}


header('Content-Type: application/json');

require_once 'db.php';

// ============================================================
// CONFIG
// ============================================================


// Configuration
// Configuration
$admin_password = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : (getenv('ADMIN_PASSWORD') ?: 'password');
$flask_secret = defined('FLASK_SECRET') ? FLASK_SECRET : (getenv('FLASK_SECRET') ?: 'secret-key');

// simple session start for admin login state
session_start();

// Helper to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to match routes with parameters (e.g., /api/services/1)
function matchRoute($pattern, $uri, &$matches) {
    // pattern e.g., '~^/api/services/(\d+)$~'
    return preg_match($pattern, $uri, $matches);
}

// ============================================================
// ROUTING LOGIC
// ============================================================

try {
    $pdo = getDB();

    // ----------------------
    // ADMIN AUTH
    // ----------------------
    if ($uri === '/api/admin/login' && $method === 'POST') {
        $data = getJsonInput();
        $pwd = $data['password'] ?? 'password';
        if ($pwd === $admin_password) {
            $_SESSION['admin_logged_in'] = true;
            echo json_encode(['success' => true]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid password']);
        }
        exit;
    }

    if ($uri === '/api/admin/logout' && $method === 'POST') {
        unset($_SESSION['admin_logged_in']);
        echo json_encode(['success' => true]);
        exit;
    }

    // ----------------------
    // SERVICES
    // ----------------------
    
    // GET /api/services/grouped (for bot mainly)
    if ($uri === '/api/services/grouped' && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM services ORDER BY `group`, name");
        $all = $stmt->fetchAll();
        $groups = [];
        foreach ($all as $svc) {
            $g = $svc['group'] ?: 'General';
            if (!isset($groups[$g])) $groups[$g] = [];
            $groups[$g][] = [
                'code' => $svc['code'],
                'name' => $svc['name'],
                'api_url' => $svc['api_url']
            ];
        }
        echo json_encode($groups);
        exit;
    }

    // GET /api/services
    if ($uri === '/api/services' && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM services ORDER BY `group`, name");
        $services = $stmt->fetchAll();
        // Convert to logic expected by frontend (boolean casting etc)
        foreach ($services as &$s) {
            $s['is_public'] = (bool)$s['is_public'];
            // Normalize group name if needed? Python logic: order_by(Service.group, Service.name)
        }
        echo json_encode($services);
        exit;
    }

    // POST /api/services
    if ($uri === '/api/services' && $method === 'POST') {
        $data = getJsonInput();
        $code = $data['code'] ?? null;
        $name = $data['name'] ?? null;
        $api_url = $data['api_url'] ?? null;
        
        if (!$code || !$name || !$api_url) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        // Check exists
        $stmt = $pdo->prepare("SELECT id FROM services WHERE code = ?");
        $stmt->execute([$code]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Service with this code already exists']);
            exit;
        }

        $sql = "INSERT INTO services (code, name, `group`, api_url, description, api_key, is_public) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $code, 
            $name, 
            $data['group'] ?? 'General', 
            $api_url, 
            $data['description'] ?? '', 
            $data['api_key'] ?? null,
            1 // Default is_public true
        ]);
        
        $id = $pdo->lastInsertId();
        // Fetch back
        $svc = $pdo->query("SELECT * FROM services WHERE id = $id")->fetch();
        $svc['is_public'] = (bool)$svc['is_public'];
        echo json_encode(['message' => 'Service created', 'service' => $svc]);
        exit;
    }

    // GET /api/services/{id}
    if (matchRoute('~^/api/services/(\d+)$~', $uri, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ?");
        $stmt->execute([$m[1]]);
        $svc = $stmt->fetch();
        if (!$svc) {
            http_response_code(404);
            echo json_encode(['error' => 'Service not found']);
            exit;
        }
        $svc['is_public'] = (bool)$svc['is_public'];
        echo json_encode($svc);
        exit;
    }

    // PUT /api/services/{id}
    if (matchRoute('~^/api/services/(\d+)$~', $uri, $m) && $method === 'PUT') {
        $id = $m[1];
        $data = getJsonInput();
        
        // Build dynamic update
        $fields = ['code', 'name', 'description', 'api_url', 'group', 'is_public', 'api_key'];
        $updates = [];
        $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $updates[] = "`$f` = ?"; // backticks for SQL keyword safety like 'group'
                $params[] = $data[$f];
            }
        }
        
        if ($updates) {
            $params[] = $id;
            $sql = "UPDATE services SET " . implode(', ', $updates) . " WHERE id = ?";
            $pdo->prepare($sql)->execute($params);
        }

        $svc = $pdo->query("SELECT * FROM services WHERE id = $id")->fetch();
        if ($svc) $svc['is_public'] = (bool)$svc['is_public'];
        echo json_encode(['message' => 'Service updated', 'service' => $svc]);
        exit;
    }

    // DELETE /api/services/{id}
    if (matchRoute('~^/api/services/(\d+)$~', $uri, $m) && $method === 'DELETE') {
        $pdo->prepare("DELETE FROM services WHERE id = ?")->execute([$m[1]]);
        echo json_encode(['message' => 'Service deleted']);
        exit;
    }

    // GET /api/services/code/{code}
    if (matchRoute('~^/api/services/code/(.+)$~', $uri, $m) && $method === 'GET') {
        $code = urldecode($m[1]);
        $stmt = $pdo->prepare("SELECT * FROM services WHERE code = ?");
        $stmt->execute([$code]);
        $svc = $stmt->fetch();
        if (!$svc) {
            http_response_code(404);
            echo json_encode(['error' => 'Service not found']);
            exit;
        }
        $svc['is_public'] = (bool)$svc['is_public'];
        echo json_encode($svc);
        exit;
    }

    // ----------------------
    // USERS
    // ----------------------
    // GET /api/users
    if ($uri === '/api/users' && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
        $users = $stmt->fetchAll();
        foreach ($users as &$u) {
            $u['registered'] = (bool)$u['registered'];
            // created_at formatting likely handled by JS, sending raw string from DB is mostly fine
        }
        echo json_encode($users);
        exit;
    }

    // GET /api/user/{telegram_id} -> used by bot or frontend to 'get or create'
    if (matchRoute('~^/api/user/(\d+)$~', $uri, $m) && $method === 'GET') {
        $tg_id = $m[1];
        $username = $_GET['username'] ?? null;
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE telegram_id = ?");
        $stmt->execute([$tg_id]);
        $user = $stmt->fetch();

        if (!$user) {
            // Create
            $pdo->prepare("INSERT INTO users (telegram_id, username, free_calls, paid_calls, registered) VALUES (?, ?, 10, 0, 1)")
                ->execute([$tg_id, $username]);
            $user = $pdo->query("SELECT * FROM users WHERE telegram_id = $tg_id")->fetch();
        } else {
            // Update username if changed
            if ($username && $username !== $user['username']) {
                $pdo->prepare("UPDATE users SET username = ? WHERE id = ?")->execute([$username, $user['id']]);
                $user['username'] = $username;
            }
        }
        
        echo json_encode([
            "user_id" => $user['id'],
            "free_calls" => $user['free_calls'],
            "paid_calls" => $user['paid_calls'],
            "username" => $user['username']
        ]);
        exit;
    }

    // GET /api/users/{id}
    if (matchRoute('~^/api/users/(\d+)$~', $uri, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$m[1]]);
        $u = $stmt->fetch();
        if (!$u) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        $u['registered'] = (bool)$u['registered'];
        echo json_encode($u);
        exit;
    }

    // PUT /api/users/{id}
    if (matchRoute('~^/api/users/(\d+)$~', $uri, $m) && $method === 'PUT') {
        $id = $m[1];
        $data = getJsonInput();
        
        $fields = ['username', 'registered', 'free_calls', 'paid_calls'];
        $updates = [];
        $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $updates[] = "$f = ?"; 
                $params[] = $data[$f];
            }
        }
        
        if ($updates) {
            $params[] = $id;
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
            $pdo->prepare($sql)->execute($params);
        }
        echo json_encode(['message' => 'User updated']);
        exit;
    }

    // DELETE /api/users/{id}
    if (matchRoute('~^/api/users/(\d+)$~', $uri, $m) && $method === 'DELETE') {
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$m[1]]);
        echo json_encode(['message' => 'User deleted']);
        exit;
    }

    // GET /api/users/{id}/usages
    if (matchRoute('~^/api/users/(\d+)/usages$~', $uri, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM api_usages WHERE user_id = ? ORDER BY created_at DESC LIMIT 500");
        $stmt->execute([$m[1]]);
        $res = $stmt->fetchAll();
        foreach ($res as &$r) $r['success'] = (bool)$r['success'];
        echo json_encode($res);
        exit;
    }

    // GET /api/users/{id}/payments
    if (matchRoute('~^/api/users/(\d+)/payments$~', $uri, $m) && $method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$m[1]]);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    // ----------------------
    // DEVICES
    // ----------------------
    // GET /api/devices
    if ($uri === '/api/devices' && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM devices ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
        exit;
    }

    // POST /api/devices
    if ($uri === '/api/devices' && $method === 'POST') {
        $data = getJsonInput();
        if (empty($data['user_id']) || empty($data['imei'])) {
            http_response_code(400); echo json_encode(['error' => 'Missing fields']); exit;
        }
        $sql = "INSERT INTO devices (user_id, imei, serial, note) VALUES (?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            $data['user_id'], $data['imei'], $data['serial']??null, $data['note']??''
        ]);
        $id = $pdo->lastInsertId();
        $d = $pdo->query("SELECT * FROM devices WHERE id = $id")->fetch();
        echo json_encode(['message' => 'Device created', 'device' => $d]);
        exit;
    }

    // GET/PUT/DELETE /api/devices/{id}
    if (matchRoute('~^/api/devices/(\d+)$~', $uri, $m)) {
        $id = $m[1];
        if ($method === 'GET') {
            $d = $pdo->query("SELECT * FROM devices WHERE id = $id")->fetch();
            if(!$d) { http_response_code(404); echo json_encode(['error'=>'Not found']); exit; }
            echo json_encode($d);
        }
        elseif ($method === 'DELETE') {
            $pdo->prepare("DELETE FROM devices WHERE id = ?")->execute([$id]);
            echo json_encode(['message'=>'Device deleted']);
        }
        elseif ($method === 'PUT') {
            $data = getJsonInput();
            $fields = ['imei','serial','note','user_id'];
            $updates=[]; $params=[];
            foreach($fields as $f){
                if(array_key_exists($f, $data)) { $updates[]="$f=?"; $params[]=$data[$f]; }
            }
            if($updates) {
                $params[] = $id;
                $pdo->prepare("UPDATE devices SET ".implode(',',$updates)." WHERE id=?")->execute($params);
            }
            $d = $pdo->query("SELECT * FROM devices WHERE id = $id")->fetch();
            echo json_encode(['message'=>'Device updated', 'device'=>$d]);
        }
        exit;
    }


    // ----------------------
    // USAGES
    // ----------------------
    if ($uri === '/api/usages' && $method === 'GET') {
        $res = $pdo->query("SELECT * FROM api_usages ORDER BY created_at DESC LIMIT 500")->fetchAll();
        foreach($res as &$r) $r['success']=(bool)$r['success'];
        echo json_encode($res);
        exit;
    }

    // ----------------------
    // PAYMENTS
    // ----------------------
    if ($uri === '/api/payments' && $method === 'GET') {
        $res = $pdo->query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 200")->fetchAll();
        echo json_encode($res);
        exit;
    }
    if ($uri === '/api/payments' && $method === 'POST') {
        $data = getJsonInput();
        if (!isset($data['amount']) || !isset($data['method'])) {
            http_response_code(400); echo json_encode(['error'=>'Missing amount or method']); exit;
        }
        $sql = "INSERT INTO payments (user_id, amount, method, note) VALUES (?,?,?,?)";
        $pdo->prepare($sql)->execute([
            $data['user_id']??null, $data['amount'], $data['method'], $data['note']??''
        ]);
        $id = $pdo->lastInsertId();
        $p = $pdo->query("SELECT * FROM payments WHERE id = $id")->fetch();
        echo json_encode(['message'=>'Payment created', 'payment'=>$p]);
        exit;
    }
    if (matchRoute('~^/api/payments/(\d+)$~', $uri, $m) && $method === 'DELETE') {
         $pdo->prepare("DELETE FROM payments WHERE id = ?")->execute([$m[1]]);
         echo json_encode(['message'=>'Payment deleted']);
         exit;
    }

    // ----------------------
    // STATUS DASHBOARD
    // ----------------------
    if ($uri === '/api/status' && $method === 'GET') {
        $users_count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $services_count = $pdo->query("SELECT COUNT(*) FROM services")->fetchColumn();
        $devices_count = $pdo->query("SELECT COUNT(*) FROM devices")->fetchColumn();
        $usages_count = $pdo->query("SELECT COUNT(*) FROM api_usages")->fetchColumn();
        $payments_total = $pdo->query("SELECT COALESCE(SUM(amount),0) FROM payments")->fetchColumn();
        
        $recent = $pdo->query("SELECT * FROM api_usages ORDER BY created_at DESC LIMIT 10")->fetchAll();
        foreach($recent as &$r) $r['success']=(bool)$r['success'];

        echo json_encode([
            'users_count' => $users_count,
            'services_count' => $services_count,
            'devices_count' => $devices_count,
            'usages_count' => $usages_count,
            'payments_total' => (float)$payments_total,
            'recent_usages' => $recent
        ]);
        exit;
    }

    // ----------------------
    // LOOKUP (Main Logic)
    // ----------------------
    if ($uri === '/api/lookup' && $method === 'POST') {
        $data = getJsonInput();
        $user_id = $data['user_id'] ?? null;
        $service_code = $data['service'] ?? null;
        $imei = $data['imei'] ?? null;
        $username = $data['username'] ?? null;

        // User Handling (ensure exists)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE telegram_id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            $pdo->prepare("INSERT INTO users (telegram_id, username, free_calls, paid_calls, registered) VALUES (?, ?, 10, 0, 1)")
                ->execute([$user_id, $username]);
            // refresh
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
        } else {
            if ($username && $username !== $user['username']) {
                $pdo->prepare("UPDATE users SET username = ? WHERE id = ?")->execute([$username, $user['id']]);
            }
        }

        // Service Lookup
        $stmt = $pdo->prepare("SELECT * FROM services WHERE code = ?");
        $stmt->execute([$service_code]);
        $svc = $stmt->fetch();
        if (!$svc) {
            http_response_code(404); echo json_encode(['error'=>'Service not found']); exit;
        }

        // Quota check
        if ($user['free_calls'] <= 0) {
            http_response_code(403); echo json_encode(['error'=>'No free calls left']); exit;
        }

        // Call Provider API using CURL
        $provider_url = $svc['api_url'];
        $api_key = $svc['api_key'];

        $params = ['imei' => $imei];
        $headers = [
            "User-Agent: TGService/1.0",
            "Accept: application/json"
        ];

        if ($api_key) {
            $params['apikey'] = $api_key;
            $params['key'] = $api_key;
            $params['token'] = $api_key;
            $headers[] = "Authorization: Bearer $api_key";
            $headers[] = "key: $api_key";
        }

        $is_imei_info_or_check = (strpos($provider_url, 'imei.info') !== false || strpos($provider_url, 'imeicheck.net') !== false);
        
        // Logic: Try POST unless it fails, then GET, or vice versa if provider known
        // Flask code: defaults to POST for imei.info etc.
        
        $ch = curl_init();
        
        // Initial strategy
        $use_post = $is_imei_info_or_check;
        
        if ($use_post) {
            curl_setopt($ch, CURLOPT_URL, $provider_url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
            // Add content type for json
            $headers[] = "Content-Type: application/json";
        } else {
            // GET
            $query = http_build_query($params);
            curl_setopt($ch, CURLOPT_URL, "$provider_url?$query");
        }
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // If 405 Method Not Allowed, swap method
        if ($http_code == 405) {
            $ch = curl_init();
            if ($use_post) {
                // Was POST, try GET
                $query = http_build_query($params);
                curl_setopt($ch, CURLOPT_URL, "$provider_url?$query");
                $headers = array_diff($headers, ["Content-Type: application/json"]); // Remove JSON header for GET if strictly param
            } else {
                // Was GET, try POST
                curl_setopt($ch, CURLOPT_URL, $provider_url);
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
                $headers[] = "Content-Type: application/json";
            }
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $new_payload = curl_exec($ch);
            if ($new_payload) {
                $response = $new_payload;
                $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            }
            curl_close($ch);
        }

        // Parse result
        $success = false;
        $error_msg = null;
        $service_result = json_decode($response, true);

        if ($http_code >= 200 && $http_code < 300) {
            $success = true;
            if (is_array($service_result)) {
                if (!empty($service_result['error'])) {
                    $success = false;
                    $error_msg = is_string($service_result['error']) ? $service_result['error'] : json_encode($service_result['error']);
                } elseif (isset($service_result['status']) && $service_result['status'] === 'failed') {
                    $success = false;
                    $error_msg = $service_result['message'] ?? 'Unknown Key Error';
                }
            } else {
                 // Not JSON?
            }
        } else {
            $error_msg = "Provider error: HTTP $http_code";
        }

        if ($success && $user['free_calls'] > 0) {
            $pdo->prepare("UPDATE users SET free_calls = free_calls - 1 WHERE id = ?")->execute([$user['id']]);
        }
        
        // Log Usage
        $pdo->prepare("INSERT INTO api_usages (user_id, service_id, imei, success, cost) VALUES (?, ?, ?, ?, ?)")
            ->execute([$user['id'], $svc['id'], $imei, $success?1:0, 0.0]);
            
        // Log Device
        $pdo->prepare("INSERT OR IGNORE INTO devices (user_id, imei) VALUES (?, ?)")
             ->execute([$user['id'], $imei]);
        // Note: SQLite INSERT OR IGNORE works if imei is unique index, but user_id might differ. 
        // Logic in python: check if (user_id, imei) exists.
        // Let's replicate strict logic:
        $dchk = $pdo->prepare("SELECT id FROM devices WHERE user_id = ? AND imei = ?");
        $dchk->execute([$user['id'], $imei]);
        if (!$dchk->fetch()) {
             $pdo->prepare("INSERT INTO devices (user_id, imei) VALUES (?, ?)")->execute([$user['id'], $imei]);
        }

        if ($success) {
            echo json_encode($service_result);
        } else {
            echo json_encode(['error' => $error_msg ?: 'Unknown error']);
        }
        exit;
    }

    // Fallback 404
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found: ' . $uri]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
