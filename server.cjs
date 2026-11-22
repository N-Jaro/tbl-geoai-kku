/**
 * TBL Studio — Node.js + Express + MySQL Server (server.cjs)
 * Compatible with cPanel / DirectAdmin "Setup Node.js App" (Phusion Passenger) & PM2/VPS.
 * - Startup File: server.cjs
 * - Serves the built React frontend from ./dist
 * - Provides /api/sync and /api.php endpoints backed by MySQL (nattapon_tbl)
 *   with automatic JSON file fallback if MySQL is unreachable in local dev.
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
  connectionLimit: 10,
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

async function initDatabase() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_kv_store (
        store_key VARCHAR(64) PRIMARY KEY,
        store_val LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    dbReady = true;
    console.log('[TBL Node Server] Connected to MySQL database:', DB_CONFIG.database);
  } catch (err) {
    dbReady = false;
    console.warn('[TBL Node Server] MySQL unavailable, using JSON file fallback:', err.message);
  }
}

initDatabase();

/**
 * Deep merge helper so concurrent students checking in, submitting iRAT,
 * scratching tRAT, or rating peers merge cleanly without overwriting teammates.
 */
function tblDeepMerge(existing, incoming) {
  if (
    existing === null ||
    incoming === null ||
    typeof existing !== 'object' ||
    typeof incoming !== 'object'
  ) {
    return incoming;
  }

  const isArrExisting = Array.isArray(existing);
  const isArrIncoming = Array.isArray(incoming);

  if (isArrExisting || isArrIncoming) {
    if (isArrExisting && isArrIncoming) {
      // Union student member arrays by 'id' when growing
      if (
        incoming.length >= existing.length &&
        incoming.length > 0 &&
        incoming[0] &&
        typeof incoming[0] === 'object' &&
        'id' in incoming[0]
      ) {
        const map = new Map();
        existing.forEach((item) => {
          if (item && item.id) map.set(item.id, item);
        });
        incoming.forEach((item) => {
          if (item && item.id) map.set(item.id, item);
        });
        return Array.from(map.values());
      }
    }
    return incoming;
  }

  const merged = { ...existing };
  for (const key of Object.keys(incoming)) {
    if (
      key in merged &&
      merged[key] !== null &&
      incoming[key] !== null &&
      typeof merged[key] === 'object' &&
      typeof incoming[key] === 'object'
    ) {
      merged[key] = tblDeepMerge(merged[key], incoming[key]);
    } else {
      merged[key] = incoming[key];
    }
  }
  return merged;
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
      const [rows] = await pool.query(
        'SELECT store_key, store_val, UNIX_TIMESTAMP(updated_at) AS ts FROM tbl_kv_store'
      );
      const state = {};
      let maxTs = 0;
      for (const row of rows) {
        try {
          state[row.store_key] = JSON.parse(row.store_val);
        } catch (e) {
          state[row.store_key] = null;
        }
        if (Number(row.ts) > maxTs) maxTs = Number(row.ts);
      }
      return res.json({ ok: true, engine: 'node-mysql', timestamp: maxTs, state });
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

        for (const [key, newVal] of Object.entries(updates)) {
          let finalVal = newVal;
          if (mode === 'merge' && newVal !== null && typeof newVal === 'object') {
            const [rows] = await conn.query(
              'SELECT store_val FROM tbl_kv_store WHERE store_key = ? FOR UPDATE',
              [key]
            );
            if (rows.length > 0 && rows[0].store_val) {
              try {
                const existingDecoded = JSON.parse(rows[0].store_val);
                if (existingDecoded && typeof existingDecoded === 'object') {
                  finalVal = tblDeepMerge(existingDecoded, newVal);
                }
              } catch (e) {}
            }
          }

          await conn.query(
            `INSERT INTO tbl_kv_store (store_key, store_val)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE store_val = VALUES(store_val)`,
            [String(key), JSON.stringify(finalVal)]
          );
        }

        await conn.commit();
        return res.json({ ok: true, engine: 'node-mysql' });
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    } else {
      const current = readFallbackState();
      for (const [key, newVal] of Object.entries(updates)) {
        if (mode === 'merge' && current[key] && typeof current[key] === 'object') {
          current[key] = tblDeepMerge(current[key], newVal);
        } else {
          current[key] = newVal;
        }
      }
      writeFallbackState(current);
      return res.json({ ok: true, engine: 'node-file' });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Register API routes (supports both /api/sync and ./api.php so it works in any mode)
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
