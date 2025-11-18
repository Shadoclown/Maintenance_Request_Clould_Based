const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow both port 3000 and 3001
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// MySQL Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'maintenance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please ensure MySQL is running and the database exists.');
  } else {
    console.log('✅ Successfully connected to MySQL database');
    connection.release();
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Maintenance API Server is running!' });
});

// Test database query endpoint
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }
    res.json({ message: 'Database query successful', results });
  });
});

// API Routes will go here
app.get('/api/roles', (req, res) => {
  db.query('SELECT * FROM role', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch roles', details: err.message });
    }
    res.json(results);
  });
});

app.get('/api/requests', (req, res) => {
  const { userId, userRole } = req.query;
  
  let query = `
    SELECT r.*, u.user_email 
    FROM request r 
    LEFT JOIN users u ON r.created_by = u.user_id
  `;

  console.log('user_email',userId.user_email);
  
  const params = [];
  
  if (userRole === '1') {
    // Regular user - show only their requests
    query += ' WHERE r.created_by = ?';
    params.push(userId);
  } else if (userRole === '2' || userRole === '3') {
    // Technician or IT Support - show assigned requests
    query += ' WHERE r.request_role = ?';
    params.push(userRole);
  }
  // Admin (role 4) sees all requests - no WHERE clause needed
  
  query += ' ORDER BY r.created_at DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
    }
    
    // Format results to match expected structure
    const formatted = results.map(r => ({
      ...r,
      created_by: {
        user_email: r.user_email,
        user_name: r.user_email.split('@')[0]
      }
    }));
    
    res.json(formatted);
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.query(
    'SELECT user_id, user_email, user_role FROM users WHERE user_email = ? AND user_password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed', details: err.message });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json(results[0]);
    }
  );
});

app.post('/api/requests', (req, res) => {
  const { title, description, locationBuilding, roomNumber, userId } = req.body;
  const location = `${locationBuilding}-${roomNumber}`;
  
  db.query(
    'INSERT INTO request (title, description, location, created_by, status) VALUES (?, ?, ?, ?, ?)',
    [title, description, location, userId, 'Pending'],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create request', details: err.message });
      }
      res.status(201).json({ message: 'Request created', requestId: results.insertId });
    }
  );
});

app.patch('/api/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.query(
    'UPDATE request SET status = ? WHERE request_id = ?',
    [status, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update status', details: err.message });
      }
      res.json({ message: 'Status updated' });
    }
  );
});

app.patch('/api/requests/:id/role', (req, res) => {
  const { id } = req.params;
  const { requestRole } = req.body;
  
  db.query(
    'UPDATE request SET request_role = ? WHERE request_id = ?',
    [requestRole, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to assign role', details: err.message });
      }
      res.json({ message: 'Role assigned' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// Export db for use in other files if needed
module.exports = { db };
