const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177',
    'http://127.0.0.1:5178',
    'http://127.0.0.1:5179',
    'http://127.0.0.1:5180'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'employee',
        organizationId INTEGER DEFAULT 1,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Organizations table
      db.run(`CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        settings TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Roles table
      db.run(`CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        permissions TEXT,
        organizationId INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // User roles junction table
      db.run(`CREATE TABLE IF NOT EXISTS user_roles (
        userId INTEGER,
        roleId INTEGER,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (roleId) REFERENCES roles (id),
        PRIMARY KEY (userId, roleId)
      )`);

      // Menu items table
      db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        path TEXT,
        parentId INTEGER,
        orderIndex INTEGER DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        requiredPermissions TEXT,
        organizationId INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parentId) REFERENCES menu_items (id)
      )`);

      // Insert default organization
      db.run(`INSERT OR IGNORE INTO organizations (id, name, domain) VALUES (1, 'ConstructBMS Ltd', 'constructbms.com')`);

      // Insert default roles
      db.run(`INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES 
        (1, 'super_admin', 'Super Administrator with full system access', '["*"]'),
        (2, 'admin', 'Administrator with organization-wide access', '["dashboard", "projects", "customers", "contractors", "tasks", "sales", "finance", "hr", "settings"]'),
        (3, 'employee', 'Standard employee with limited access', '["dashboard", "projects", "tasks"]')`);

      // Insert default users
      const defaultPassword = bcrypt.hashSync('ConstructBMS25', 10);
      db.run(`INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, role) VALUES 
        (1, 'constructbms@gmail.com', ?, 'ConstructBMS', 'Admin', 'super_admin')`, [defaultPassword]);
      db.run(`INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, role) VALUES 
        (2, 'admin@constructbms.com', ?, 'Admin', 'User', 'admin')`, [defaultPassword]);
      db.run(`INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, role) VALUES 
        (3, 'employee@constructbms.com', ?, 'Employee', 'User', 'employee')`, [defaultPassword]);

      // Insert user-role relationships
      db.run(`INSERT OR IGNORE INTO user_roles (userId, roleId) VALUES (1, 1)`); // superadmin -> super_admin role
      db.run(`INSERT OR IGNORE INTO user_roles (userId, roleId) VALUES (2, 2)`); // admin -> admin role
      db.run(`INSERT OR IGNORE INTO user_roles (userId, roleId) VALUES (3, 3)`); // employee -> employee role

      // Insert default menu items
      const defaultMenuItems = [
        { name: 'Dashboard', icon: 'LayoutDashboard', path: 'dashboard', orderIndex: 1 },
        { name: 'CRM', icon: 'Users', path: 'crm', orderIndex: 2 },
        { name: 'Customers', icon: 'Users', path: 'customers', orderIndex: 1, parentId: 2 },
        { name: 'Contractors', icon: 'HardHat', path: 'contractors', orderIndex: 2, parentId: 2 },
        { name: 'Sales Pipeline', icon: 'TrendingUp', path: 'sales', orderIndex: 3, parentId: 2 },
        { name: 'Document Control Centre', icon: 'FileSignature', path: 'signature', orderIndex: 3 },
        { name: 'Tasks', icon: 'CheckSquare', path: 'tasks', orderIndex: 4 },
        { name: 'Estimating', icon: 'FileText', path: 'estimating', orderIndex: 5 },
        { name: 'Site Tools', icon: 'Building2', path: 'site-tools', orderIndex: 6 },
        { name: 'Procurement', icon: 'ShoppingCart', path: 'procurement', orderIndex: 7 },
        { name: 'Collaboration', icon: 'MessageCircle', path: 'collaboration', orderIndex: 8 },
        { name: 'Messenger', icon: 'MessageCircle', path: 'chat', orderIndex: 9 },
        { name: 'Notifications', icon: 'Bell', path: 'notifications', orderIndex: 10 },
        { name: 'Activity Stream', icon: 'Activity', path: 'activity-stream', orderIndex: 11 },
        { name: 'Backup', icon: 'Zap', path: 'backup', orderIndex: 12 },
        { name: 'Settings', icon: 'Settings', path: 'settings', orderIndex: 13 },
        { name: 'General Settings', icon: 'Settings', path: 'general-settings', orderIndex: 1, parentId: 13 },
        { name: 'Menu Builder', icon: 'Settings', path: 'sidebar-settings', orderIndex: 2, parentId: 13 },
        { name: 'Roadmap', icon: 'Target', path: 'roadmap', orderIndex: 14 },
        { name: 'Users & Roles', icon: 'Shield', path: 'users', orderIndex: 15 },
        { name: 'User & Role Management', icon: 'Shield', path: 'user-management', orderIndex: 1, parentId: 15 },
        { name: 'Permissions', icon: 'Key', path: 'permissions', orderIndex: 2, parentId: 15 },
        { name: 'Knowledge Base', icon: 'BookOpen', path: 'help', orderIndex: 16 },
        { name: 'Support', icon: 'HelpCircle', path: 'support', orderIndex: 17 }
      ];

      defaultMenuItems.forEach((item, index) => {
        db.run(`INSERT OR IGNORE INTO menu_items (id, name, icon, path, parentId, orderIndex) VALUES (?, ?, ?, ?, ?, ?)`,
          [index + 1, item.name, item.icon, item.path, item.parentId, item.orderIndex]);
      });

      resolve();
    });
  });
};

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'super_admin') {
      return next(); // Super admin has all permissions
    }

    // Check if user has the required permission
    const userPermissions = req.user.permissions || [];
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }

    res.status(403).json({ error: 'Insufficient permissions' });
  };
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    db.get('SELECT * FROM users WHERE email = ? AND isActive = 1', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get user roles and permissions
      db.all('SELECT r.name, r.permissions FROM roles r JOIN user_roles ur ON r.id = ur.roleId WHERE ur.userId = ?', [user.id], (err, roles) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Parse permissions
        let permissions = [];
        if (roles && roles.length > 0) {
          roles.forEach(role => {
            try {
              const rolePermissions = JSON.parse(role.permissions);
              permissions = permissions.concat(rolePermissions);
            } catch (e) {
              permissions.push(role.permissions);
            }
          });
        } else {
          // Fallback: use role-based permissions if no user_roles found
          if (user.role === 'super_admin') {
            permissions = ['*'];
          } else if (user.role === 'admin') {
            permissions = ['dashboard', 'projects', 'customers', 'contractors', 'tasks', 'sales', 'finance', 'hr', 'settings'];
          } else if (user.role === 'employee') {
            permissions = ['dashboard', 'projects', 'tasks'];
          }
        }

        // Create JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
            permissions: permissions,
            organizationId: user.organizationId
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Return user data (without password) and token
        const { password: _, ...userData } = user;
        res.json({
          user: { ...userData, permissions },
          token,
          message: 'Login successful'
        });
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, firstName, lastName, role, organizationId, isActive, createdAt FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { ...user, permissions: req.user.permissions } });
  });
});

// Logout (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Menu items API
app.get('/api/menu', authenticateToken, (req, res) => {
  db.all(`
    SELECT * FROM menu_items 
    WHERE organizationId = ? AND isActive = 1 
    ORDER BY orderIndex
  `, [req.user.organizationId], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Build menu hierarchy
    const buildMenuTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildMenuTree(items, item.id)
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);
    };

    const menuTree = buildMenuTree(menuItems);
    res.json({ menu: menuTree });
  });
});

// Update menu items
app.put('/api/menu', authenticateToken, requirePermission('settings'), (req, res) => {
  const { menu } = req.body;

  if (!Array.isArray(menu)) {
    return res.status(400).json({ error: 'Menu must be an array' });
  }

  // Clear existing menu items
  db.run('DELETE FROM menu_items WHERE organizationId = ?', [req.user.organizationId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Insert new menu items
    const insertMenuItem = (item, parentId = null, orderIndex = 0) => {
      return new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO menu_items (name, icon, path, parentId, orderIndex, organizationId)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [item.name, item.icon, item.path, parentId, orderIndex, req.user.organizationId], function(err) {
          if (err) {
            reject(err);
            return;
          }

          const itemId = this.lastID;
          const childrenPromises = (item.children || []).map((child, index) => 
            insertMenuItem(child, itemId, index)
          );

          Promise.all(childrenPromises).then(resolve).catch(reject);
        });
      });
    };

    Promise.all(menu.map((item, index) => insertMenuItem(item, null, index)))
      .then(() => {
        res.json({ message: 'Menu updated successfully' });
      })
      .catch(err => {
        console.error('Menu update error:', err);
        res.status(500).json({ error: 'Failed to update menu' });
      });
  });
});

// Users API
app.get('/api/users', authenticateToken, requirePermission('user_management'), (req, res) => {
  db.all(`
    SELECT u.id, u.email, u.firstName, u.lastName, u.role, u.isActive, u.createdAt,
           GROUP_CONCAT(r.name) as roles
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.userId
    LEFT JOIN roles r ON ur.roleId = r.id
    WHERE u.organizationId = ?
    GROUP BY u.id
    ORDER BY u.createdAt DESC
  `, [req.user.organizationId], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ users });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Demo Accounts:`);
          console.log(`   Super Admin: constructbms@gmail.com / ConstructBMS25`);
    console.log(`   Admin: admin@constructbms.com / ConstructBMS25`);
    console.log(`   Employee: employee@constructbms.com / ConstructBMS25`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app; 