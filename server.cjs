/**
 * TBL Studio — Production Relational MySQL + Node.js Server (server.cjs)
 * Designed for 50+ concurrent student iPads in live classroom sessions.
 *
 * Automatically creates 7 normalized relational tables in `nattapon_tbl`:
 *   1. tbl_classes          (Courses, Instructor Name, PIN, Team Size, Grading Weights)
 *   2. tbl_students         (Class Roster: class_id + student_id, full_name, section)
 *   3. tbl_modules          (Weekly Lessons, Questions, 4S Map & Choices)
 *   4. tbl_checkins         (1 row per student check-in & random team assignment)
 *   5. tbl_irat_submissions (1 row per student per week — zero row-lock contention!)
 *   6. tbl_trat_scratches   (1 row per team per question)
 *   7. tbl_peer_evaluations (1 row per evaluator -> target rating 0-10 & comment)
 *   +  tbl_kv_store         (For lightweight live stage flags: unlockedSteps, simultaneousReveal, 4S card picks)
 *
 * Also auto-migrates any existing data from `tbl_kv_store` on startup so you never lose data.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'nattapon_tbl',
  password: process.env.DB_PASSWORD || 'LnZcFHDQQLubaUTCHERR',
  database: process.env.DB_NAME || 'nattapon_tbl',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
};

app.use(express.json({ limit: '10mb' }));

// CORS & No-Cache headers for API endpoints
app.use((req, res, next) => {
  if (req.path.includes('api')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  }
  next();
});

let pool = null;
let dbReady = false;
const FALLBACK_FILE = path.join(__dirname, 'tbl_state_fallback.json');

async function initRelationalDatabase() {
  try {
    pool = mysql.createPool(DB_CONFIG);

    // 1. Courses / Instructors Table
    await pool.query(`
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
    `);

    // 2. Enrolled Students Roster Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_students (
        class_id VARCHAR(64) NOT NULL,
        student_id VARCHAR(64) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        section VARCHAR(64) DEFAULT 'Sec 01',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (class_id, student_id),
        INDEX idx_student_class (class_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Weekly Modules / Lessons Table
    await pool.query(`
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
    `);

    // 4. Student Weekly Check-Ins & Random Team Assignments
    await pool.query(`
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
    `);

    // 5. Individual iRAT Quiz Submissions (1 row per student per week)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_irat_submissions (
        module_id VARCHAR(64) NOT NULL,
        student_id VARCHAR(64) NOT NULL,
        submitted TINYINT(1) DEFAULT 0,
        allocations_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (module_id, student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Team tRAT IF-AT Scratch Card Attempts (1 row per team per question)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_trat_scratches (
        module_id VARCHAR(64) NOT NULL,
        team_id VARCHAR(64) NOT NULL,
        question_id VARCHAR(64) NOT NULL,
        scratches_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (module_id, team_id, question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Peer Evaluations (0-10 Scale: 1 row per evaluator -> target student)
    await pool.query(`
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
    `);

    // Lightweight Key-Value Store for live stage flags (unlockedSteps, simultaneousReveal, teamCaseChoiceByMod)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_kv_store (
        store_key VARCHAR(64) PRIMARY KEY,
        store_val LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    dbReady = true;
    console.log('[TBL Node Server] 7 Relational MySQL Tables Ready in:', DB_CONFIG.database);

    // One-time automatic migration if old JSON blobs exist in tbl_kv_store but relational tables are empty
    await migrateLegacyKvIfNeeded();
  } catch (err) {
    dbReady = false;
    console.warn('[TBL Node Server] MySQL unavailable, using JSON file fallback:', err.message);
  }
}

async function migrateLegacyKvIfNeeded() {
  try {
    const [clsCount] = await pool.query('SELECT COUNT(*) AS cnt FROM tbl_classes');
    if (clsCount[0].cnt > 0) return; // Already populated

    const [kvRows] = await pool.query('SELECT store_key, store_val FROM tbl_kv_store');
    if (kvRows.length === 0) return;

    const legacy = {};
    for (const r of kvRows) {
      try {
        legacy[r.store_key] = JSON.parse(r.store_val);
      } catch (e) {}
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (Array.isArray(legacy.classes)) {
        await saveClassesToRelational(conn, legacy.classes);
      }
      if (legacy.rostersByClass && typeof legacy.rostersByClass === 'object') {
        await saveRostersToRelational(conn, legacy.rostersByClass, 'replace');
      }
      if (Array.isArray(legacy.modules)) {
        await saveModulesToRelational(conn, legacy.modules);
      }
      if (legacy.weeklyCheckins && typeof legacy.weeklyCheckins === 'object') {
        await saveCheckinsToRelational(conn, legacy.weeklyCheckins, 'merge');
      }
      if (legacy.teamRepByMod && typeof legacy.teamRepByMod === 'object') {
        await saveTeamRepsToRelational(conn, legacy.teamRepByMod);
      }
      if (legacy.iratRecordsByMod && typeof legacy.iratRecordsByMod === 'object') {
        await saveIratToRelational(conn, legacy.iratRecordsByMod, 'merge');
      }
      if (legacy.tratScratchesByMod && typeof legacy.tratScratchesByMod === 'object') {
        await saveTratToRelational(conn, legacy.tratScratchesByMod, 'merge');
      }
      if (legacy.peerEvalsByMod && typeof legacy.peerEvalsByMod === 'object') {
        await savePeerEvalsToRelational(conn, legacy.peerEvalsByMod, 'merge');
      }
      await conn.commit();
      console.log('[TBL Node Server] Migrated existing tbl_kv_store data into 7 relational tables.');
    } catch (e) {
      await conn.rollback();
    } finally {
      conn.release();
    }
  } catch (e) {}
}

initRelationalDatabase();

// ================= RELATIONAL WRITERS =================

async function saveClassesToRelational(conn, classesList) {
  if (!Array.isArray(classesList)) return;
  const keepIds = [];
  for (let i = 0; i < classesList.length; i++) {
    const c = classesList[i];
    if (!c || !c.id) continue;
    keepIds.push(c.id);
    await conn.query(
      `INSERT INTO tbl_classes
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
        sort_order = VALUES(sort_order)`,
      [
        c.id,
        c.courseCode || 'COURSE',
        c.courseName || 'Course',
        c.instructorName || '',
        c.semester || 'Semester 1 / 2026',
        Number(c.targetTeamSize) || 5,
        Number(c.teamCount) || 4,
        c.pin || '2026',
        Number(c.iratWeightPct) || 40,
        Number(c.tratWeightPct) || 60,
        c.usePeerMultiplier === false ? 0 : 1,
        i
      ]
    );
  }
  if (keepIds.length > 0) {
    await conn.query('DELETE FROM tbl_classes WHERE class_id NOT IN (?)', [keepIds]);
  }
}

async function saveRostersToRelational(conn, rostersByClass, mode) {
  if (!rostersByClass || typeof rostersByClass !== 'object') return;
  for (const [classId, students] of Object.entries(rostersByClass)) {
    if (!Array.isArray(students)) continue;
    if (mode === 'replace') {
      if (students.length === 0) {
        await conn.query('DELETE FROM tbl_students WHERE class_id = ?', [classId]);
        continue;
      }
      const keepIds = students.map((s) => s.id).filter(Boolean);
      if (keepIds.length > 0) {
        await conn.query(
          'DELETE FROM tbl_students WHERE class_id = ? AND student_id NOT IN (?)',
          [classId, keepIds]
        );
      }
    }
    for (const st of students) {
      if (!st || !st.id) continue;
      await conn.query(
        `INSERT INTO tbl_students (class_id, student_id, full_name, section)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          section = VALUES(section)`,
        [classId, st.id, st.name || st.id, st.section || 'Sec 01']
      );
    }
  }
}

async function saveModulesToRelational(conn, modulesList) {
  if (!Array.isArray(modulesList)) return;
  const keepIds = [];
  for (let i = 0; i < modulesList.length; i++) {
    const m = modulesList[i];
    if (!m || !m.id) continue;
    keepIds.push(m.id);
    await conn.query(
      `INSERT INTO tbl_modules
        (module_id, class_id, week_number, code, title_en, title_th, module_json, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        class_id = VALUES(class_id),
        week_number = VALUES(week_number),
        code = VALUES(code),
        title_en = VALUES(title_en),
        title_th = VALUES(title_th),
        module_json = VALUES(module_json),
        sort_order = VALUES(sort_order)`,
      [
        m.id,
        m.classId || 'cls-geoai-402',
        Number(m.weekNumber) || i + 1,
        m.code || `Week ${i + 1}`,
        m.title?.en || '',
        m.title?.th || '',
        JSON.stringify(m),
        i
      ]
    );
  }
  if (keepIds.length > 0) {
    await conn.query('DELETE FROM tbl_modules WHERE module_id NOT IN (?)', [keepIds]);
  }
}

async function saveCheckinsToRelational(conn, weeklyCheckins, mode) {
  if (!weeklyCheckins || typeof weeklyCheckins !== 'object') return;
  if (mode === 'replace' && Object.keys(weeklyCheckins).length === 0) {
    await conn.query('DELETE FROM tbl_checkins');
    return;
  }
  for (const [modId, teamsMap] of Object.entries(weeklyCheckins)) {
    if (!teamsMap || typeof teamsMap !== 'object') continue;
    if (mode === 'replace') {
      await conn.query('DELETE FROM tbl_checkins WHERE module_id = ?', [modId]);
    }
    for (const [teamId, members] of Object.entries(teamsMap)) {
      if (!Array.isArray(members)) continue;
      for (const m of members) {
        if (!m || !m.id) continue;
        await conn.query(
          `INSERT INTO tbl_checkins (module_id, student_id, team_id, full_name, section, checked_in_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            team_id = VALUES(team_id),
            full_name = VALUES(full_name),
            section = VALUES(section),
            checked_in_at = VALUES(checked_in_at)`,
          [modId, m.id, teamId, m.name || m.id, m.section || 'Sec 01', m.checkedInAt || '']
        );
      }
    }
  }
}

async function saveTeamRepsToRelational(conn, teamRepByMod, mode) {
  if (!teamRepByMod || typeof teamRepByMod !== 'object') return;
  if (mode === 'replace' && Object.keys(teamRepByMod).length === 0) {
    await conn.query('UPDATE tbl_checkins SET is_leader = 0');
    return;
  }
  for (const [modId, teamLeaders] of Object.entries(teamRepByMod)) {
    if (!teamLeaders || typeof teamLeaders !== 'object') continue;
    for (const [teamId, leaderStudentId] of Object.entries(teamLeaders)) {
      if (!leaderStudentId) continue;
      await conn.query(
        'UPDATE tbl_checkins SET is_leader = 0 WHERE module_id = ? AND team_id = ?',
        [modId, teamId]
      );
      await conn.query(
        'UPDATE tbl_checkins SET is_leader = 1 WHERE module_id = ? AND team_id = ? AND student_id = ?',
        [modId, teamId, leaderStudentId]
      );
    }
  }
}

async function saveIratToRelational(conn, iratRecordsByMod, mode) {
  if (!iratRecordsByMod || typeof iratRecordsByMod !== 'object') return;
  if (mode === 'replace' && Object.keys(iratRecordsByMod).length === 0) {
    await conn.query('DELETE FROM tbl_irat_submissions');
    return;
  }
  for (const [modId, studentsMap] of Object.entries(iratRecordsByMod)) {
    if (!studentsMap || typeof studentsMap !== 'object') continue;
    for (const [studentId, rec] of Object.entries(studentsMap)) {
      if (!rec) continue;
      await conn.query(
        `INSERT INTO tbl_irat_submissions (module_id, student_id, submitted, allocations_json)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          submitted = VALUES(submitted),
          allocations_json = VALUES(allocations_json)`,
        [
          modId,
          studentId,
          rec.submitted ? 1 : 0,
          JSON.stringify(rec.allocations || {})
        ]
      );
    }
  }
}

async function saveTratToRelational(conn, tratScratchesByMod, mode) {
  if (!tratScratchesByMod || typeof tratScratchesByMod !== 'object') return;
  if (mode === 'replace' && Object.keys(tratScratchesByMod).length === 0) {
    await conn.query('DELETE FROM tbl_trat_scratches');
    return;
  }
  for (const [modId, teamsMap] of Object.entries(tratScratchesByMod)) {
    if (!teamsMap || typeof teamsMap !== 'object') continue;
    for (const [teamId, qMap] of Object.entries(teamsMap)) {
      if (!qMap || typeof qMap !== 'object') continue;
      for (const [questionId, scratchList] of Object.entries(qMap)) {
        if (!Array.isArray(scratchList)) continue;
        await conn.query(
          `INSERT INTO tbl_trat_scratches (module_id, team_id, question_id, scratches_json)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            scratches_json = VALUES(scratches_json)`,
          [modId, teamId, questionId, JSON.stringify(scratchList)]
        );
      }
    }
  }
}

async function savePeerEvalsToRelational(conn, peerEvalsByMod, mode) {
  if (!peerEvalsByMod || typeof peerEvalsByMod !== 'object') return;
  if (mode === 'replace' && Object.keys(peerEvalsByMod).length === 0) {
    await conn.query('DELETE FROM tbl_peer_evaluations');
    return;
  }
  for (const [modId, evaluatorsMap] of Object.entries(peerEvalsByMod)) {
    if (!evaluatorsMap || typeof evaluatorsMap !== 'object') continue;
    for (const [evaluatorId, rec] of Object.entries(evaluatorsMap)) {
      if (!rec || typeof rec !== 'object') continue;
      const starsMap = rec.starsByTargetId || {};
      const commentsMap = rec.commentsByTargetId || {};
      const submitted = rec.submitted ? 1 : 0;
      const targetIds = new Set([...Object.keys(starsMap), ...Object.keys(commentsMap)]);
      for (const targetId of targetIds) {
        const score =
          typeof starsMap[targetId] === 'number' ? starsMap[targetId] : 10;
        const comment = commentsMap[targetId] || '';
        await conn.query(
          `INSERT INTO tbl_peer_evaluations
            (module_id, evaluator_id, target_id, score_out_of_10, comment, submitted)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            score_out_of_10 = VALUES(score_out_of_10),
            comment = VALUES(comment),
            submitted = VALUES(submitted)`,
          [modId, evaluatorId, targetId, score, comment, submitted]
        );
      }
    }
  }
}

// ================= RELATIONAL READER (Builds Complete State for Frontend) =================

async function readFullRelationalState() {
  const state = {};

  // 1. Classes
  const [clsRows] = await pool.query(
    'SELECT * FROM tbl_classes ORDER BY sort_order ASC, class_id ASC'
  );
  if (clsRows.length > 0) {
    state.classes = clsRows.map((r) => ({
      id: r.class_id,
      courseCode: r.course_code,
      courseName: r.course_name,
      instructorName: r.instructor_name,
      semester: r.semester,
      targetTeamSize: r.target_team_size,
      teamCount: r.team_count,
      pin: r.pin,
      iratWeightPct: r.irat_weight_pct,
      tratWeightPct: r.trat_weight_pct,
      usePeerMultiplier: r.use_peer_multiplier === 1
    }));
  }

  // 2. Students Roster
  const [stRows] = await pool.query(
    'SELECT * FROM tbl_students ORDER BY student_id ASC'
  );
  if (stRows.length > 0 || clsRows.length > 0) {
    const rostersByClass = {};
    for (const r of stRows) {
      if (!rostersByClass[r.class_id]) rostersByClass[r.class_id] = [];
      rostersByClass[r.class_id].push({
        id: r.student_id,
        name: r.full_name,
        section: r.section
      });
    }
    state.rostersByClass = rostersByClass;
  }

  // 3. Weekly Modules
  const [modRows] = await pool.query(
    'SELECT module_json FROM tbl_modules ORDER BY sort_order ASC, week_number ASC'
  );
  if (modRows.length > 0) {
    state.modules = modRows
      .map((r) => {
        try {
          return JSON.parse(r.module_json);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  }

  // 4. Weekly Check-Ins & Team Leaders
  const [chkRows] = await pool.query(
    'SELECT * FROM tbl_checkins ORDER BY updated_at ASC'
  );
  const weeklyCheckins = {};
  const teamRepByMod = {};
  for (const r of chkRows) {
    if (!weeklyCheckins[r.module_id]) weeklyCheckins[r.module_id] = {};
    if (!weeklyCheckins[r.module_id][r.team_id]) {
      weeklyCheckins[r.module_id][r.team_id] = [];
    }
    weeklyCheckins[r.module_id][r.team_id].push({
      id: r.student_id,
      name: r.full_name,
      section: r.section,
      checkedInAt: r.checked_in_at
    });
    if (r.is_leader === 1) {
      if (!teamRepByMod[r.module_id]) teamRepByMod[r.module_id] = {};
      teamRepByMod[r.module_id][r.team_id] = r.student_id;
    }
  }
  state.weeklyCheckins = weeklyCheckins;
  state.teamRepByMod = teamRepByMod;

  // 5. Individual iRAT Submissions
  const [iratRows] = await pool.query('SELECT * FROM tbl_irat_submissions');
  const iratRecordsByMod = {};
  for (const r of iratRows) {
    if (!iratRecordsByMod[r.module_id]) iratRecordsByMod[r.module_id] = {};
    let allocations = {};
    try {
      allocations = JSON.parse(r.allocations_json);
    } catch (e) {}
    iratRecordsByMod[r.module_id][r.student_id] = {
      allocations,
      submitted: r.submitted === 1
    };
  }
  state.iratRecordsByMod = iratRecordsByMod;

  // 6. Team tRAT Scratches
  const [tratRows] = await pool.query('SELECT * FROM tbl_trat_scratches');
  const tratScratchesByMod = {};
  for (const r of tratRows) {
    if (!tratScratchesByMod[r.module_id]) tratScratchesByMod[r.module_id] = {};
    if (!tratScratchesByMod[r.module_id][r.team_id]) {
      tratScratchesByMod[r.module_id][r.team_id] = {};
    }
    try {
      tratScratchesByMod[r.module_id][r.team_id][r.question_id] = JSON.parse(
        r.scratches_json
      );
    } catch (e) {
      tratScratchesByMod[r.module_id][r.team_id][r.question_id] = [];
    }
  }
  state.tratScratchesByMod = tratScratchesByMod;

  // 7. Peer Evaluations (0-10)
  const [peerRows] = await pool.query('SELECT * FROM tbl_peer_evaluations');
  const peerEvalsByMod = {};
  for (const r of peerRows) {
    if (!peerEvalsByMod[r.module_id]) peerEvalsByMod[r.module_id] = {};
    if (!peerEvalsByMod[r.module_id][r.evaluator_id]) {
      peerEvalsByMod[r.module_id][r.evaluator_id] = {
        starsByTargetId: {},
        commentsByTargetId: {},
        submitted: false
      };
    }
    const ev = peerEvalsByMod[r.module_id][r.evaluator_id];
    ev.starsByTargetId[r.target_id] = Number(r.score_out_of_10);
    if (r.comment) ev.commentsByTargetId[r.target_id] = r.comment;
    if (r.submitted === 1) ev.submitted = true;
  }
  state.peerEvalsByMod = peerEvalsByMod;

  // 8. Live Stage Flags from tbl_kv_store (unlockedSteps, simultaneousReveal, revealExpertAnswer, teamCaseChoiceByMod, teamCaseRationaleByMod, stickersByMod, activeClassId, activeModuleId)
  const [kvRows] = await pool.query(
    "SELECT store_key, store_val FROM tbl_kv_store WHERE store_key IN ('unlockedSteps', 'simultaneousReveal', 'revealExpertAnswer', 'teamCaseChoiceByMod', 'teamCaseRationaleByMod', 'stickersByMod', 'activeClassId', 'activeModuleId')"
  );
  for (const r of kvRows) {
    try {
      state[r.store_key] = JSON.parse(r.store_val);
    } catch (e) {}
  }

  return state;
}

// Local file fallback helpers (when testing on a machine without MySQL)
function readFallbackState() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function writeFallbackState(state) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {}
}

// GET handler for both /api/sync and /api.php
async function handleGetSync(req, res) {
  try {
    if (dbReady && pool) {
      const state = await readFullRelationalState();
      return res.json({
        ok: true,
        engine: 'node-mysql-relational',
        timestamp: Math.floor(Date.now() / 1000),
        state
      });
    } else {
      const state = readFallbackState();
      return res.json({
        ok: true,
        engine: 'node-file',
        timestamp: Math.floor(Date.now() / 1000),
        state
      });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// POST handler for both /api/sync and /api.php
async function handlePostSync(req, res) {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
  }

  const mode = payload.mode || 'merge'; // 'merge' | 'replace'
  const updates = payload.updates && typeof payload.updates === 'object' ? payload.updates : {};

  try {
    if (dbReady && pool) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        if ('classes' in updates) {
          await saveClassesToRelational(conn, updates.classes);
        }
        if ('rostersByClass' in updates) {
          await saveRostersToRelational(conn, updates.rostersByClass, mode);
        }
        if ('modules' in updates) {
          await saveModulesToRelational(conn, updates.modules);
        }
        if ('weeklyCheckins' in updates) {
          await saveCheckinsToRelational(conn, updates.weeklyCheckins, mode);
        }
        if ('teamRepByMod' in updates) {
          await saveTeamRepsToRelational(conn, updates.teamRepByMod, mode);
        }
        if ('iratRecordsByMod' in updates) {
          await saveIratToRelational(conn, updates.iratRecordsByMod, mode);
        }
        if ('tratScratchesByMod' in updates) {
          await saveTratToRelational(conn, updates.tratScratchesByMod, mode);
        }
        if ('peerEvalsByMod' in updates) {
          await savePeerEvalsToRelational(conn, updates.peerEvalsByMod, mode);
        }

        // Single-week score reset (keeps roster, teams, modules, and all other weeks intact)
        if (typeof updates.resetModuleId === 'string' && updates.resetModuleId.trim()) {
          const rmId = updates.resetModuleId.trim();
          await conn.query('DELETE FROM tbl_irat_submissions WHERE module_id = ?', [rmId]);
          await conn.query('DELETE FROM tbl_trat_scratches WHERE module_id = ?', [rmId]);
          await conn.query('DELETE FROM tbl_peer_evaluations WHERE module_id = ?', [rmId]);
          for (const modKey of ['teamCaseChoiceByMod', 'teamCaseRationaleByMod', 'stickersByMod']) {
            const [rows] = await conn.query(
              'SELECT store_val FROM tbl_kv_store WHERE store_key = ? FOR UPDATE',
              [modKey]
            );
            if (rows.length > 0 && rows[0].store_val) {
              try {
                const obj = JSON.parse(rows[0].store_val);
                if (obj && typeof obj === 'object' && rmId in obj) {
                  delete obj[rmId];
                  await conn.query(
                    `INSERT INTO tbl_kv_store (store_key, store_val)
                     VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE store_val = VALUES(store_val)`,
                    [modKey, JSON.stringify(obj)]
                  );
                }
              } catch (e) {}
            }
          }
        }

        // Lightweight stage flags stored in tbl_kv_store (supports deep merge for teamCaseChoiceByMod, teamCaseRationaleByMod & stickersByMod)
        for (const flagKey of [
          'unlockedSteps',
          'simultaneousReveal',
          'revealExpertAnswer',
          'teamCaseChoiceByMod',
          'teamCaseRationaleByMod',
          'stickersByMod',
          'activeClassId',
          'activeModuleId',
          'projectorState'
        ]) {
          if (flagKey in updates) {
            let finalFlagVal = updates[flagKey];
            if (
              mode === 'merge' &&
              (flagKey === 'teamCaseChoiceByMod' ||
                flagKey === 'teamCaseRationaleByMod' ||
                flagKey === 'stickersByMod') &&
              finalFlagVal &&
              typeof finalFlagVal === 'object'
            ) {
              const [existingRows] = await conn.query(
                'SELECT store_val FROM tbl_kv_store WHERE store_key = ? FOR UPDATE',
                [flagKey]
              );
              if (existingRows.length > 0 && existingRows[0].store_val) {
                try {
                  const prevObj = JSON.parse(existingRows[0].store_val);
                  if (prevObj && typeof prevObj === 'object') {
                    const merged = { ...prevObj };
                    for (const [mId, tMap] of Object.entries(finalFlagVal)) {
                      merged[mId] = {
                        ...(merged[mId] && typeof merged[mId] === 'object' ? merged[mId] : {}),
                        ...(tMap && typeof tMap === 'object' ? tMap : {})
                      };
                    }
                    finalFlagVal = merged;
                  }
                } catch (e) {}
              }
            }
            await conn.query(
              `INSERT INTO tbl_kv_store (store_key, store_val)
               VALUES (?, ?)
               ON DUPLICATE KEY UPDATE store_val = VALUES(store_val)`,
              [flagKey, JSON.stringify(finalFlagVal)]
            );
          }
        }

        await conn.commit();
        return res.json({ ok: true, engine: 'node-mysql-relational' });
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    } else {
      const current = readFallbackState();
      if (typeof updates.resetModuleId === 'string' && updates.resetModuleId.trim()) {
        const rmId = updates.resetModuleId.trim();
        for (const k of [
          'iratRecordsByMod',
          'tratScratchesByMod',
          'peerEvalsByMod',
          'teamCaseChoiceByMod',
          'teamCaseRationaleByMod',
          'stickersByMod'
        ]) {
          if (current[k] && typeof current[k] === 'object') {
            delete current[k][rmId];
          }
        }
      }
      const { resetModuleId, ...restUpdates } = updates;
      Object.assign(current, restUpdates);
      writeFallbackState(current);
      return res.json({ ok: true, engine: 'node-file' });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

app.get(['/api/sync', '/api.php'], handleGetSync);
app.post(['/api/sync', '/api.php'], handlePostSync);

// Serve built static frontend from ./dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback to dist/index.html
app.get('*', (req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Run "npm run build" first to generate ./dist');
  }
});

app.listen(PORT, () => {
  console.log(`[TBL Node Server] Running on port ${PORT}`);
});
