const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('./supabase.cjs');
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
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Check if user has the required permission
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            permissions
          )
        `)
        .eq('user_id', req.user.userId);

      if (error) {
        return res.status(500).json({ error: 'Database error' });
      }

      const hasPermission = userRoles.some((ur) => {
        const permissions = ur.roles.permissions;
        return permissions.includes('*') || permissions.includes(permission);
      });

      if (hasPermission) {
        return next();
      }

      res.status(403).json({ error: 'Insufficient permissions' });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user roles and permissions
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name,
          permissions
        )
      `)
      .eq('user_id', user.id);

    if (rolesError) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse permissions
    let permissions = [];
    if (userRoles && userRoles.length > 0) {
      userRoles.forEach((ur) => {
        try {
          const rolePermissions = ur.roles.permissions;
          permissions = permissions.concat(rolePermissions);
        } catch (e) {
          permissions.push(ur.roles.permissions);
        }
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        permissions: permissions,
        organizationId: user.organization_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without password) and token
    const { password_hash: _, ...userData } = user;
    res.json({
      user: { ...userData, permissions },
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, avatar_url, is_active, created_at, organization_id')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { ...user, permissions: req.user.permissions } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Menu items API
app.get('/api/menu', authenticateToken, async (req, res) => {
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('organization_id', req.user.organizationId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Build menu hierarchy
    const buildMenuTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildMenuTree(items, item.id)
        }))
        .sort((a, b) => a.order_index - b.order_index);
    };

    const menuTree = buildMenuTree(menuItems);
    res.json({ menu: menuTree });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu items
app.put('/api/menu', authenticateToken, requirePermission('settings'), async (req, res) => {
  try {
    const { menu } = req.body;

    if (!Array.isArray(menu)) {
      return res.status(400).json({ error: 'Menu must be an array' });
    }

    // Clear existing menu items
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('organization_id', req.user.organizationId);

    if (deleteError) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Insert new menu items
    const insertMenuItem = async (item, parentId = null, orderIndex = 0) => {
      const { data: newItem, error } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          icon: item.icon,
          path: item.path,
          parent_id: parentId,
          order_index: orderIndex,
          organization_id: req.user.organizationId,
          required_permissions: item.required_permissions || []
        })
        .select()
        .single();

      if (error) throw error;

      const childrenPromises = (item.children || []).map((child, index) => 
        insertMenuItem(child, newItem.id, index)
      );

      await Promise.all(childrenPromises);
      return newItem;
    };

    await Promise.all(menu.map((item, index) => insertMenuItem(item, null, index)));
    res.json({ message: 'Menu updated successfully' });
  } catch (error) {
    console.error('Menu update error:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

// Users API
app.get('/api/users', authenticateToken, requirePermission('users:read'), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        is_active,
        created_at,
        user_roles (
          roles (
            name
          )
        )
      `)
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Format users with roles
    const formattedUsers = users.map(user => ({
      ...user,
      roles: user.user_roles.map(ur => ur.roles.name).join(', ')
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications API
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { title, message, type = 'info', data = {} } = req.body;

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: req.user.userId,
        title,
        message,
        type,
        data
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat API
app.get('/api/chat/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, attachments = [] } = req.body;

    const { data: chatMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: req.user.userId,
        room_id: roomId,
        message,
        attachments
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: chatMessage });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload API
app.post('/api/upload', authenticateToken, async (req, res) => {
  try {
    // This would handle file uploads to Supabase Storage
    // For now, return a placeholder response
    res.json({ 
      message: 'File upload endpoint ready',
      note: 'Implement file upload logic with Supabase Storage'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Supabase',
    features: ['Real-time', 'File Storage', 'Chat', 'Notifications']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Supabase Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Demo Accounts:`);
      console.log(`   Super Admin: constructbms@gmail.com / ConstructBMS25`);
    console.log(`   Admin: admin@constructbms.com / ConstructBMS25`);
    console.log(`   Employee: employee@constructbms.com / ConstructBMS25`);
  console.log(`✨ Features: Real-time, File Storage, Chat, Notifications`);
});

module.exports = app; 