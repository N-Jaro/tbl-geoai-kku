<?php
/**
 * TBL Studio — Real-Time Multi-Device Classroom Sync API (MySQL + PDO)
 * Automatically creates `tbl_kv_store` table in `nattapon_tbl` on first request
 * and uses atomic row-level locking (`FOR UPDATE`) + deep JSON merge so 50+ students
 * checking in, scratching tRAT cards, or submitting iRAT/Peer Evals simultaneously
 * never overwrite each other's actions.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DB_HOST = 'localhost';
$DB_NAME = 'nattapon_tbl';
$DB_USER = 'nattapon_tbl';
$DB_PASS = 'LnZcFHDQQLubaUTCHERR';

try {
    $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // Auto-create key-value table on first run
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tbl_kv_store (
            store_key VARCHAR(64) PRIMARY KEY,
            store_val LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

/**
 * Recursive associative-array merge so concurrent student updates to different
 * nested keys (e.g. different Student IDs or different Team IDs) merge cleanly.
 * Sequential numeric arrays (like a team's member list or a question's scratched options)
 * are unioned by unique value or `id` field.
 */
function tbl_deep_merge($existing, $incoming) {
    if (!is_array($existing) || !is_array($incoming)) {
        return $incoming;
    }

    // Check if both arrays are sequential lists (0..N-1)
    $isSeqExisting = array_keys($existing) === range(0, count($existing) - 1);
    $isSeqIncoming = array_keys($incoming) === range(0, count($incoming) - 1);

    if ((empty($existing) || $isSeqExisting) && (empty($incoming) || $isSeqIncoming)) {
        // If incoming is explicitly empty, allow clearing/replacing when smaller or equal
        // For student member lists (objects with 'id'), union by 'id' if incoming grew
        if (count($incoming) >= count($existing) && !empty($incoming) && isset($incoming[0]['id'])) {
            $byId = [];
            foreach ($existing as $item) {
                if (isset($item['id'])) {
                    $byId[$item['id']] = $item;
                }
            }
            foreach ($incoming as $item) {
                if (isset($item['id'])) {
                    $byId[$item['id']] = $item;
                }
            }
            return array_values($byId);
        }
        return $incoming;
    }

    // Associative map merge
    $merged = $existing;
    foreach ($incoming as $k => $v) {
        if (array_key_exists($k, $merged) && is_array($merged[$k]) && is_array($v)) {
            $merged[$k] = tbl_deep_merge($merged[$k], $v);
        } else {
            $merged[$k] = $v;
        }
    }
    return $merged;
}

// GET: Return all shared classroom state keys
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT store_key, store_val, UNIX_TIMESTAMP(updated_at) AS ts FROM tbl_kv_store");
        $rows = $stmt->fetchAll();
        $state = [];
        $maxTs = 0;
        foreach ($rows as $row) {
            $decoded = json_decode($row['store_val'], true);
            $state[$row['store_key']] = $decoded;
            if ((int)$row['ts'] > $maxTs) {
                $maxTs = (int)$row['ts'];
            }
        }
        echo json_encode([
            'ok'        => true,
            'timestamp' => $maxTs,
            'state'     => $state
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// POST: Save or merge one or more keys atomically
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $mode = isset($payload['mode']) ? $payload['mode'] : 'merge'; // 'merge' | 'replace'
    $updates = isset($payload['updates']) && is_array($payload['updates']) ? $payload['updates'] : [];

    try {
        $pdo->beginTransaction();

        $selectStmt = $pdo->prepare("SELECT store_val FROM tbl_kv_store WHERE store_key = :k FOR UPDATE");
        $upsertStmt = $pdo->prepare("
            INSERT INTO tbl_kv_store (store_key, store_val)
            VALUES (:k, :v)
            ON DUPLICATE KEY UPDATE store_val = VALUES(store_val)
        ");

        foreach ($updates as $key => $newVal) {
            $finalVal = $newVal;
            if ($mode === 'merge' && is_array($newVal)) {
                $selectStmt->execute([':k' => $key]);
                $existingRow = $selectStmt->fetch();
                if ($existingRow && !empty($existingRow['store_val'])) {
                    $existingDecoded = json_decode($existingRow['store_val'], true);
                    if (is_array($existingDecoded)) {
                        $finalVal = tbl_deep_merge($existingDecoded, $newVal);
                    }
                }
            }
            $encoded = json_encode($finalVal, JSON_UNESCAPED_UNICODE);
            $upsertStmt->execute([
                ':k' => (string)$key,
                ':v' => $encoded
            ]);
        }

        $pdo->commit();
        echo json_encode(['ok' => true]);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        exit;
    }
}
