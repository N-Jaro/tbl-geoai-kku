<?php
/**
 * TBL Studio — Production Relational MySQL Classroom Sync API (api.php)
 * Mirrors the 7 normalized relational tables in `server.cjs` so the app works
 * identically whether served by Apache/LiteSpeed PHP or Node.js (`server.cjs`).
 *
 * Relational Tables in `nattapon_tbl`:
 *   1. tbl_classes
 *   2. tbl_students
 *   3. tbl_modules
 *   4. tbl_checkins
 *   5. tbl_irat_submissions
 *   6. tbl_trat_scratches
 *   7. tbl_peer_evaluations
 *   +  tbl_kv_store (live stage flags: unlockedSteps, simultaneousReveal, teamCaseChoiceByMod)
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

    // Auto-create all 7 relational tables + tbl_kv_store
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tbl_classes (
            class_id VARCHAR(64) PRIMARY KEY,
            course_code VARCHAR(32) NOT NULL,
            course_name VARCHAR(255) NOT NULL,
            instructor_name VARCHAR(255) DEFAULT '',
            semester VARCHAR(64) DEFAULT 'Semester 1 / 2026',
            target_team_size INT DEFAULT 5,
            team_count INT DEFAULT 4,
            pin VARCHAR(32) DEFAULT '2026',
            irat_weight_pct INT DEFAULT 40,
            trat_weight_pct INT DEFAULT 60,
            use_peer_multiplier TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS tbl_students (
            class_id VARCHAR(64) NOT NULL,
            student_id VARCHAR(64) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            section VARCHAR(64) DEFAULT 'Sec 01',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (class_id, student_id),
            INDEX idx_student_class (class_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS tbl_modules (
            module_id VARCHAR(64) PRIMARY KEY,
            class_id VARCHAR(64) NOT NULL,
            week_number INT DEFAULT 1,
            code VARCHAR(64) NOT NULL,
            title_en VARCHAR(255) DEFAULT '',
            title_th VARCHAR(255) DEFAULT '',
            module_json LONGTEXT NOT NULL,
            sort_order INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_module_class (class_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS tbl_checkins (
            module_id VARCHAR(64) NOT NULL,
            student_id VARCHAR(64) NOT NULL,
            team_id VARCHAR(64) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            section VARCHAR(64) DEFAULT 'Sec 01',
            is_leader TINYINT(1) DEFAULT 0,
            checked_in_at VARCHAR(64) DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (module_id, student_id),
            INDEX idx_checkin_mod_team (module_id, team_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS tbl_irat_submissions (
            module_id VARCHAR(64) NOT NULL,
            student_id VARCHAR(64) NOT NULL,
            submitted TINYINT(1) DEFAULT 0,
            allocations_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (module_id, student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS tbl_trat_scratches (
            module_id VARCHAR(64) NOT NULL,
            team_id VARCHAR(64) NOT NULL,
            question_id VARCHAR(64) NOT NULL,
            scratches_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (module_id, team_id, question_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS tbl_peer_evaluations (
            module_id VARCHAR(64) NOT NULL,
            evaluator_id VARCHAR(64) NOT NULL,
            target_id VARCHAR(64) NOT NULL,
            score_out_of_10 DOUBLE DEFAULT 10,
            comment TEXT,
            submitted TINYINT(1) DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (module_id, evaluator_id, target_id),
            INDEX idx_peer_target (module_id, target_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

// ================= RELATIONAL WRITER HELPERS =================

function save_classes_relational($pdo, $classesList) {
    if (!is_array($classesList)) return;
    $stmt = $pdo->prepare("
        INSERT INTO tbl_classes
            (class_id, course_code, course_name, instructor_name, semester, target_team_size, team_count, pin, irat_weight_pct, trat_weight_pct, use_peer_multiplier, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            course_code = VALUES(course_code),
            course_name = VALUES(course_name),
            instructor_name = VALUES(instructor_name),
            semester = VALUES(semester),
            target_team_size = VALUES(target_team_size),
            team_count = VALUES(team_count),
            pin = VALUES(pin),
            irat_weight_pct = VALUES(irat_weight_pct),
            trat_weight_pct = VALUES(trat_weight_pct),
            use_peer_multiplier = VALUES(use_peer_multiplier),
            sort_order = VALUES(sort_order)
    ");
    $keepIds = [];
    foreach ($classesList as $i => $c) {
        if (!isset($c['id'])) continue;
        $keepIds[] = $c['id'];
        $stmt->execute([
            $c['id'],
            isset($c['courseCode']) ? $c['courseCode'] : 'COURSE',
            isset($c['courseName']) ? $c['courseName'] : 'Course',
            isset($c['instructorName']) ? $c['instructorName'] : '',
            isset($c['semester']) ? $c['semester'] : 'Semester 1 / 2026',
            isset($c['targetTeamSize']) ? (int)$c['targetTeamSize'] : 5,
            isset($c['teamCount']) ? (int)$c['teamCount'] : 4,
            isset($c['pin']) ? $c['pin'] : '2026',
            isset($c['iratWeightPct']) ? (int)$c['iratWeightPct'] : 40,
            isset($c['tratWeightPct']) ? (int)$c['tratWeightPct'] : 60,
            (isset($c['usePeerMultiplier']) && $c['usePeerMultiplier'] === false) ? 0 : 1,
            (int)$i
        ]);
    }
    if (!empty($keepIds)) {
        $placeholders = implode(',', array_fill(0, count($keepIds), '?'));
        $del = $pdo->prepare("DELETE FROM tbl_classes WHERE class_id NOT IN ($placeholders)");
        $del->execute($keepIds);
    }
}

function save_rosters_relational($pdo, $rostersByClass, $mode) {
    if (!is_array($rostersByClass)) return;
    $stmt = $pdo->prepare("
        INSERT INTO tbl_students (class_id, student_id, full_name, section)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            full_name = VALUES(full_name),
            section = VALUES(section)
    ");
    foreach ($rostersByClass as $classId => $students) {
        if (!is_array($students)) continue;
        if ($mode === 'replace') {
            if (empty($students)) {
                $del = $pdo->prepare("DELETE FROM tbl_students WHERE class_id = ?");
                $del->execute([$classId]);
                continue;
            }
            $keepIds = [];
            foreach ($students as $st) {
                if (isset($st['id'])) $keepIds[] = $st['id'];
            }
            if (!empty($keepIds)) {
                $ph = implode(',', array_fill(0, count($keepIds), '?'));
                $del = $pdo->prepare("DELETE FROM tbl_students WHERE class_id = ? AND student_id NOT IN ($ph)");
                $del->execute(array_merge([$classId], $keepIds));
            }
        }
        foreach ($students as $st) {
            if (!isset($st['id'])) continue;
            $stmt->execute([
                $classId,
                $st['id'],
                isset($st['name']) ? $st['name'] : $st['id'],
                isset($st['section']) ? $st['section'] : 'Sec 01'
            ]);
        }
    }
}

function save_modules_relational($pdo, $modulesList) {
    if (!is_array($modulesList)) return;
    $stmt = $pdo->prepare("
        INSERT INTO tbl_modules
            (module_id, class_id, week_number, code, title_en, title_th, module_json, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            class_id = VALUES(class_id),
            week_number = VALUES(week_number),
            code = VALUES(code),
            title_en = VALUES(title_en),
            title_th = VALUES(title_th),
            module_json = VALUES(module_json),
            sort_order = VALUES(sort_order)
    ");
    $keepIds = [];
    foreach ($modulesList as $i => $m) {
        if (!isset($m['id'])) continue;
        $keepIds[] = $m['id'];
        $stmt->execute([
            $m['id'],
            isset($m['classId']) ? $m['classId'] : 'cls-geoai-402',
            isset($m['weekNumber']) ? (int)$m['weekNumber'] : ((int)$i + 1),
            isset($m['code']) ? $m['code'] : ('Week ' . ((int)$i + 1)),
            isset($m['title']['en']) ? $m['title']['en'] : '',
            isset($m['title']['th']) ? $m['title']['th'] : '',
            json_encode($m, JSON_UNESCAPED_UNICODE),
            (int)$i
        ]);
    }
    if (!empty($keepIds)) {
        $ph = implode(',', array_fill(0, count($keepIds), '?'));
        $del = $pdo->prepare("DELETE FROM tbl_modules WHERE module_id NOT IN ($ph)");
        $del->execute($keepIds);
    }
}

function save_checkins_relational($pdo, $weeklyCheckins, $mode) {
    if (!is_array($weeklyCheckins)) return;
    if ($mode === 'replace' && empty($weeklyCheckins)) {
        $pdo->exec("DELETE FROM tbl_checkins");
        return;
    }
    $stmt = $pdo->prepare("
        INSERT INTO tbl_checkins (module_id, student_id, team_id, full_name, section, checked_in_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            team_id = VALUES(team_id),
            full_name = VALUES(full_name),
            section = VALUES(section),
            checked_in_at = VALUES(checked_in_at)
    ");
    foreach ($weeklyCheckins as $modId => $teamsMap) {
        if (!is_array($teamsMap)) continue;
        if ($mode === 'replace') {
            $del = $pdo->prepare("DELETE FROM tbl_checkins WHERE module_id = ?");
            $del->execute([$modId]);
        }
        foreach ($teamsMap as $teamId => $members) {
            if (!is_array($members)) continue;
            foreach ($members as $m) {
                if (!isset($m['id'])) continue;
                $stmt->execute([
                    $modId,
                    $m['id'],
                    $teamId,
                    isset($m['name']) ? $m['name'] : $m['id'],
                    isset($m['section']) ? $m['section'] : 'Sec 01',
                    isset($m['checkedInAt']) ? $m['checkedInAt'] : ''
                ]);
            }
        }
    }
}

function save_team_reps_relational($pdo, $teamRepByMod, $mode) {
    if (!is_array($teamRepByMod)) return;
    if ($mode === 'replace' && empty($teamRepByMod)) {
        $pdo->exec("UPDATE tbl_checkins SET is_leader = 0");
        return;
    }
    $clearStmt = $pdo->prepare("UPDATE tbl_checkins SET is_leader = 0 WHERE module_id = ? AND team_id = ?");
    $setStmt   = $pdo->prepare("UPDATE tbl_checkins SET is_leader = 1 WHERE module_id = ? AND team_id = ? AND student_id = ?");
    foreach ($teamRepByMod as $modId => $teamLeaders) {
        if (!is_array($teamLeaders)) continue;
        foreach ($teamLeaders as $teamId => $leaderId) {
            if (!$leaderId) continue;
            $clearStmt->execute([$modId, $teamId]);
            $setStmt->execute([$modId, $teamId, $leaderId]);
        }
    }
}

function save_irat_relational($pdo, $iratRecordsByMod, $mode) {
    if (!is_array($iratRecordsByMod)) return;
    if ($mode === 'replace' && empty($iratRecordsByMod)) {
        $pdo->exec("DELETE FROM tbl_irat_submissions");
        return;
    }
    $stmt = $pdo->prepare("
        INSERT INTO tbl_irat_submissions (module_id, student_id, submitted, allocations_json)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            submitted = VALUES(submitted),
            allocations_json = VALUES(allocations_json)
    ");
    foreach ($iratRecordsByMod as $modId => $studentsMap) {
        if (!is_array($studentsMap)) continue;
        foreach ($studentsMap as $studentId => $rec) {
            if (!is_array($rec)) continue;
            $stmt->execute([
                $modId,
                $studentId,
                !empty($rec['submitted']) ? 1 : 0,
                json_encode(isset($rec['allocations']) ? $rec['allocations'] : new stdClass(), JSON_UNESCAPED_UNICODE)
            ]);
        }
    }
}

function save_trat_relational($pdo, $tratScratchesByMod, $mode) {
    if (!is_array($tratScratchesByMod)) return;
    if ($mode === 'replace' && empty($tratScratchesByMod)) {
        $pdo->exec("DELETE FROM tbl_trat_scratches");
        return;
    }
    $stmt = $pdo->prepare("
        INSERT INTO tbl_trat_scratches (module_id, team_id, question_id, scratches_json)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            scratches_json = VALUES(scratches_json)
    ");
    foreach ($tratScratchesByMod as $modId => $teamsMap) {
        if (!is_array($teamsMap)) continue;
        foreach ($teamsMap as $teamId => $qMap) {
            if (!is_array($qMap)) continue;
            foreach ($qMap as $questionId => $scratchList) {
                if (!is_array($scratchList)) continue;
                $stmt->execute([
                    $modId,
                    $teamId,
                    $questionId,
                    json_encode(array_values($scratchList), JSON_UNESCAPED_UNICODE)
                ]);
            }
        }
    }
}

function save_peer_evals_relational($pdo, $peerEvalsByMod, $mode) {
    if (!is_array($peerEvalsByMod)) return;
    if ($mode === 'replace' && empty($peerEvalsByMod)) {
        $pdo->exec("DELETE FROM tbl_peer_evaluations");
        return;
    }
    $stmt = $pdo->prepare("
        INSERT INTO tbl_peer_evaluations
            (module_id, evaluator_id, target_id, score_out_of_10, comment, submitted)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            score_out_of_10 = VALUES(score_out_of_10),
            comment = VALUES(comment),
            submitted = VALUES(submitted)
    ");
    foreach ($peerEvalsByMod as $modId => $evaluatorsMap) {
        if (!is_array($evaluatorsMap)) continue;
        foreach ($evaluatorsMap as $evaluatorId => $rec) {
            if (!is_array($rec)) continue;
            $starsMap = isset($rec['starsByTargetId']) && is_array($rec['starsByTargetId']) ? $rec['starsByTargetId'] : [];
            $commentsMap = isset($rec['commentsByTargetId']) && is_array($rec['commentsByTargetId']) ? $rec['commentsByTargetId'] : [];
            $submitted = !empty($rec['submitted']) ? 1 : 0;
            $targetIds = array_unique(array_merge(array_keys($starsMap), array_keys($commentsMap)));
            foreach ($targetIds as $targetId) {
                $score = isset($starsMap[$targetId]) ? (float)$starsMap[$targetId] : 10.0;
                $comment = isset($commentsMap[$targetId]) ? (string)$commentsMap[$targetId] : '';
                $stmt->execute([
                    $modId,
                    $evaluatorId,
                    $targetId,
                    $score,
                    $comment,
                    $submitted
                ]);
            }
        }
    }
}

// One-time automatic migration if old JSON blobs exist in tbl_kv_store
try {
    $clsCount = (int)$pdo->query("SELECT COUNT(*) FROM tbl_classes")->fetchColumn();
    if ($clsCount === 0) {
        $kvRows = $pdo->query("SELECT store_key, store_val FROM tbl_kv_store")->fetchAll();
        if (!empty($kvRows)) {
            $legacy = [];
            foreach ($kvRows as $r) {
                $legacy[$r['store_key']] = json_decode($r['store_val'], true);
            }
            $pdo->beginTransaction();
            if (!empty($legacy['classes'])) save_classes_relational($pdo, $legacy['classes']);
            if (!empty($legacy['rostersByClass'])) save_rosters_relational($pdo, $legacy['rostersByClass'], 'replace');
            if (!empty($legacy['modules'])) save_modules_relational($pdo, $legacy['modules']);
            if (!empty($legacy['weeklyCheckins'])) save_checkins_relational($pdo, $legacy['weeklyCheckins'], 'merge');
            if (!empty($legacy['teamRepByMod'])) save_team_reps_relational($pdo, $legacy['teamRepByMod'], 'merge');
            if (!empty($legacy['iratRecordsByMod'])) save_irat_relational($pdo, $legacy['iratRecordsByMod'], 'merge');
            if (!empty($legacy['tratScratchesByMod'])) save_trat_relational($pdo, $legacy['tratScratchesByMod'], 'merge');
            if (!empty($legacy['peerEvalsByMod'])) save_peer_evals_relational($pdo, $legacy['peerEvalsByMod'], 'merge');
            $pdo->commit();
        }
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
}

// ================= GET: BUILD COMPLETE CLASSROOM STATE FROM 7 RELATIONAL TABLES =================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $state = [];

        // 1. Classes
        $clsRows = $pdo->query("SELECT * FROM tbl_classes ORDER BY sort_order ASC, class_id ASC")->fetchAll();
        if (!empty($clsRows)) {
            $state['classes'] = [];
            foreach ($clsRows as $r) {
                $state['classes'][] = [
                    'id'                => $r['class_id'],
                    'courseCode'        => $r['course_code'],
                    'courseName'        => $r['course_name'],
                    'instructorName'    => $r['instructor_name'],
                    'semester'          => $r['semester'],
                    'targetTeamSize'    => (int)$r['target_team_size'],
                    'teamCount'         => (int)$r['team_count'],
                    'pin'               => $r['pin'],
                    'iratWeightPct'     => (int)$r['irat_weight_pct'],
                    'tratWeightPct'     => (int)$r['trat_weight_pct'],
                    'usePeerMultiplier' => ((int)$r['use_peer_multiplier'] === 1)
                ];
            }
        }

        // 2. Students Roster
        $stRows = $pdo->query("SELECT * FROM tbl_students ORDER BY student_id ASC")->fetchAll();
        if (!empty($stRows) || !empty($clsRows)) {
            $rostersByClass = [];
            foreach ($stRows as $r) {
                $rostersByClass[$r['class_id']][] = [
                    'id'      => $r['student_id'],
                    'name'    => $r['full_name'],
                    'section' => $r['section']
                ];
            }
            $state['rostersByClass'] = $rostersByClass;
        }

        // 3. Weekly Modules
        $modRows = $pdo->query("SELECT module_json FROM tbl_modules ORDER BY sort_order ASC, week_number ASC")->fetchAll();
        if (!empty($modRows)) {
            $state['modules'] = [];
            foreach ($modRows as $r) {
                $decoded = json_decode($r['module_json'], true);
                if ($decoded) $state['modules'][] = $decoded;
            }
        }

        // 4. Weekly Check-Ins & Team Leaders
        $chkRows = $pdo->query("SELECT * FROM tbl_checkins ORDER BY updated_at ASC")->fetchAll();
        $weeklyCheckins = [];
        $teamRepByMod   = [];
        foreach ($chkRows as $r) {
            $weeklyCheckins[$r['module_id']][$r['team_id']][] = [
                'id'          => $r['student_id'],
                'name'        => $r['full_name'],
                'section'     => $r['section'],
                'checkedInAt' => $r['checked_in_at']
            ];
            if ((int)$r['is_leader'] === 1) {
                $teamRepByMod[$r['module_id']][$r['team_id']] = $r['student_id'];
            }
        }
        $state['weeklyCheckins'] = $weeklyCheckins;
        $state['teamRepByMod']   = $teamRepByMod;

        // 5. Individual iRAT Submissions
        $iratRows = $pdo->query("SELECT * FROM tbl_irat_submissions")->fetchAll();
        $iratRecordsByMod = [];
        foreach ($iratRows as $r) {
            $alloc = json_decode($r['allocations_json'], true);
            $iratRecordsByMod[$r['module_id']][$r['student_id']] = [
                'allocations' => is_array($alloc) ? $alloc : [],
                'submitted'   => ((int)$r['submitted'] === 1)
            ];
        }
        $state['iratRecordsByMod'] = $iratRecordsByMod;

        // 6. Team tRAT Scratches
        $tratRows = $pdo->query("SELECT * FROM tbl_trat_scratches")->fetchAll();
        $tratScratchesByMod = [];
        foreach ($tratRows as $r) {
            $scratches = json_decode($r['scratches_json'], true);
            $tratScratchesByMod[$r['module_id']][$r['team_id']][$r['question_id']] = is_array($scratches) ? $scratches : [];
        }
        $state['tratScratchesByMod'] = $tratScratchesByMod;

        // 7. Peer Evaluations (0-10)
        $peerRows = $pdo->query("SELECT * FROM tbl_peer_evaluations")->fetchAll();
        $peerEvalsByMod = [];
        foreach ($peerRows as $r) {
            if (!isset($peerEvalsByMod[$r['module_id']][$r['evaluator_id']])) {
                $peerEvalsByMod[$r['module_id']][$r['evaluator_id']] = [
                    'starsByTargetId'    => [],
                    'commentsByTargetId' => [],
                    'submitted'          => false
                ];
            }
            $peerEvalsByMod[$r['module_id']][$r['evaluator_id']]['starsByTargetId'][$r['target_id']] = (float)$r['score_out_of_10'];
            if (!empty($r['comment'])) {
                $peerEvalsByMod[$r['module_id']][$r['evaluator_id']]['commentsByTargetId'][$r['target_id']] = $r['comment'];
            }
            if ((int)$r['submitted'] === 1) {
                $peerEvalsByMod[$r['module_id']][$r['evaluator_id']]['submitted'] = true;
            }
        }
        $state['peerEvalsByMod'] = $peerEvalsByMod;

        // 8. Live Stage Flags
        $kvRows = $pdo->query("SELECT store_key, store_val FROM tbl_kv_store WHERE store_key IN ('unlockedSteps', 'simultaneousReveal', 'revealExpertAnswer', 'teamCaseChoiceByMod', 'teamCaseRationaleByMod', 'stickersByMod', 'activeClassId', 'activeModuleId')")->fetchAll();
        foreach ($kvRows as $r) {
            $state[$r['store_key']] = json_decode($r['store_val'], true);
        }

        echo json_encode([
            'ok'        => true,
            'engine'    => 'php-mysql-relational',
            'timestamp' => time(),
            'state'     => $state
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ================= POST: ATOMIC RELATIONAL UPSERT =================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $mode    = isset($payload['mode']) ? $payload['mode'] : 'merge';
    $updates = isset($payload['updates']) && is_array($payload['updates']) ? $payload['updates'] : [];

    try {
        $pdo->beginTransaction();

        if (array_key_exists('classes', $updates)) {
            save_classes_relational($pdo, $updates['classes']);
        }
        if (array_key_exists('rostersByClass', $updates)) {
            save_rosters_relational($pdo, $updates['rostersByClass'], $mode);
        }
        if (array_key_exists('modules', $updates)) {
            save_modules_relational($pdo, $updates['modules']);
        }
        if (array_key_exists('weeklyCheckins', $updates)) {
            save_checkins_relational($pdo, $updates['weeklyCheckins'], $mode);
        }
        if (array_key_exists('teamRepByMod', $updates)) {
            save_team_reps_relational($pdo, $updates['teamRepByMod'], $mode);
        }
        if (array_key_exists('iratRecordsByMod', $updates)) {
            save_irat_relational($pdo, $updates['iratRecordsByMod'], $mode);
        }
        if (array_key_exists('tratScratchesByMod', $updates)) {
            save_trat_relational($pdo, $updates['tratScratchesByMod'], $mode);
        }
        if (array_key_exists('peerEvalsByMod', $updates)) {
            save_peer_evals_relational($pdo, $updates['peerEvalsByMod'], $mode);
        }

        $selectFlagStmt = $pdo->prepare("SELECT store_val FROM tbl_kv_store WHERE store_key = ? FOR UPDATE");
        $flagStmt = $pdo->prepare("
            INSERT INTO tbl_kv_store (store_key, store_val)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE store_val = VALUES(store_val)
        ");
        foreach (['unlockedSteps', 'simultaneousReveal', 'revealExpertAnswer', 'teamCaseChoiceByMod', 'teamCaseRationaleByMod', 'stickersByMod', 'activeClassId', 'activeModuleId'] as $flagKey) {
            if (array_key_exists($flagKey, $updates)) {
                $finalFlagVal = $updates[$flagKey];
                if ($mode === 'merge' && ($flagKey === 'teamCaseChoiceByMod' || $flagKey === 'teamCaseRationaleByMod' || $flagKey === 'stickersByMod') && is_array($finalFlagVal)) {
                    $selectFlagStmt->execute([$flagKey]);
                    $row = $selectFlagStmt->fetch();
                    if ($row && !empty($row['store_val'])) {
                        $prevObj = json_decode($row['store_val'], true);
                        if (is_array($prevObj)) {
                            foreach ($finalFlagVal as $mId => $tMap) {
                                if (!isset($prevObj[$mId]) || !is_array($prevObj[$mId])) {
                                    $prevObj[$mId] = [];
                                }
                                if (is_array($tMap)) {
                                    foreach ($tMap as $tId => $choiceVal) {
                                        $prevObj[$mId][$tId] = $choiceVal;
                                    }
                                }
                            }
                            $finalFlagVal = $prevObj;
                        }
                    }
                }
                $flagStmt->execute([
                    $flagKey,
                    json_encode($finalFlagVal, JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        $pdo->commit();
        echo json_encode(['ok' => true, 'engine' => 'php-mysql-relational']);
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
