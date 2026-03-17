// TwinIT — Express + MySQL Backend
// Run this on your local machine: node server/index.js

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── MySQL Connection Config ──────────────────────────────
// Update these with your MySQL credentials
const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'twinit',
};

let pool;

async function initDB() {
  // Create database if not exists
  const conn = await mysql.createConnection({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
  });

  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  await conn.end();

  // Create connection pool
  pool = mysql.createPool(DB_CONFIG);

  // Create tables
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS twin_configs (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      config JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS simulation_history (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      twin_id VARCHAR(36) NOT NULL,
      timestamps JSON NOT NULL,
      series JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (twin_id) REFERENCES twin_configs(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized');
}

// ── API Routes ───────────────────────────────────────────

// List all twins
app.get('/api/twins', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, created_at, updated_at FROM twin_configs ORDER BY updated_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single twin
app.get('/api/twins/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM twin_configs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const twin = rows[0];
    twin.config = typeof twin.config === 'string' ? JSON.parse(twin.config) : twin.config;
    res.json(twin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a twin
app.post('/api/twins', async (req, res) => {
  try {
    const { name, config } = req.body;
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO twin_configs (id, name, config) VALUES (?, ?, ?)',
      [id, name, JSON.stringify(config)]
    );
    res.status(201).json({ id, name, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a twin
app.put('/api/twins/:id', async (req, res) => {
  try {
    const { name, config } = req.body;
    await pool.execute(
      'UPDATE twin_configs SET name = ?, config = ? WHERE id = ?',
      [name, JSON.stringify(config), req.params.id]
    );
    res.json({ id: req.params.id, name, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a twin
app.delete('/api/twins/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM twin_configs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save simulation history
app.post('/api/twins/:id/history', async (req, res) => {
  try {
    const { timestamps, series } = req.body;
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO simulation_history (id, twin_id, timestamps, series) VALUES (?, ?, ?, ?)',
      [id, req.params.id, JSON.stringify(timestamps), JSON.stringify(series)]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TwinIT API running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
