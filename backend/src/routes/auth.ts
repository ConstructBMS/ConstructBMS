import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload, authenticateToken } from '../middleware/auth';
import { supabase } from '../services/supabase';

const log = console.log;

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Register user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 2 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Determine user role based on email
      let userRole = 'user'; // Default role
      if (
        email === 'constructbms@gmail.com' ||
        email === 'admin@constructbms.com'
      ) {
        userRole = 'super_admin'; // Use super_admin role
      }

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          password_hash: hashedPassword,
          role: userRole,
        })
        .select()
        .single();

      if (error) {
        log('Error creating user:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating user',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      log('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Login user
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Verify password
      if (user.password_hash) {
        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
          });
        }
      } else {
        // For users without password hash (legacy or demo users)
        // In production, you might want to require password reset
        log(`User ${email} has no password hash`);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      log('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authReq.user?.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    log('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Temporary endpoint to update constructbms@gmail.com to super_admin
router.post('/update-super-admin', async (_req: Request, res: Response) => {
  try {
    log('Updating user to super_admin...');

    // First, let's check if the user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'constructbms@gmail.com')
      .single();

    if (checkError || !existingUser) {
      log('User not found:', checkError);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: checkError,
      });
    }

    log('Found user:', existingUser);

    // Update the user role
    const { data: user, error } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'constructbms@gmail.com')
      .select()
      .single();

    if (error) {
      log('Update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error,
      });
    }

    log('Updated user:', user);

    res.json({
      success: true,
      message: 'User updated to super_admin successfully',
      data: user,
    });
  } catch (error) {
    log('Update super admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
});

export { router as authRoutes };
