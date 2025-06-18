/**
 * Express.js Server Example
 * Demonstrates how to use GitJsonDB as a backend API for frontend applications
 */

const express = require('express');
const cors = require('cors');
const GitJsonDB = require('./git-json-db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
const db = new GitJsonDB({
  repoPath: './server-data',
  autoBackup: true,
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Users API endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.read('users', req.query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.readById('users', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    // Basic validation
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const user = await db.create('users', {
      ...req.body,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await db.update('users', req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(user);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await db.delete('users', req.params.id);
    res.json(user);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Products API endpoints
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.read('products', req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.readById('products', req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const product = await db.create('products', {
      ...req.body,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await db.update('products', req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(product);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await db.delete('products', req.params.id);
    res.json(product);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations endpoint
app.post('/api/bulk', async (req, res) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ error: 'Operations must be an array' });
    }
    
    const results = await db.bulkOperation(operations);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database management endpoints
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/export', async (req, res) => {
  try {
    const { filename = 'export.json' } = req.body;
    const exportPath = await db.export(`./exports/${filename}`);
    res.json({ 
      message: 'Export successful',
      path: exportPath 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    await db.import(`./imports/${filename}`);
    res.json({ message: 'Import successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 