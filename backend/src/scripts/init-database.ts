import { supabase } from '../services/supabase';
import { Permission } from '../types';

const log = console.log;

const defaultRoles = [
  {
    name: 'super_admin',
    description:
      'Super Administrator with full system access and override capabilities',
    permissions: Object.values(Permission),
    isSystem: true,
  },
  {
    name: 'admin',
    description: 'Administrator with user and role management capabilities',
    permissions: [
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,
      Permission.USER_ROLE_ASSIGN,
      Permission.ROLE_READ,
      Permission.PROJECT_CREATE,
      Permission.PROJECT_READ,
      Permission.PROJECT_UPDATE,
      Permission.PROJECT_DELETE,
      Permission.PROJECT_ASSIGN,
      Permission.CLIENT_CREATE,
      Permission.CLIENT_READ,
      Permission.CLIENT_UPDATE,
      Permission.CLIENT_DELETE,
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN,
      Permission.MODULE_CREATE,
      Permission.MODULE_READ,
      Permission.MODULE_UPDATE,
      Permission.MODULE_DELETE,
      Permission.MODULE_ASSIGN,
      Permission.SETTINGS_READ,
      Permission.SETTINGS_UPDATE,
      Permission.REPORTS_READ,
      Permission.REPORTS_CREATE,
      Permission.REPORTS_EXPORT,
    ],
    isSystem: true,
  },
  {
    name: 'manager',
    description: 'Manager with project and team management capabilities',
    permissions: [
      Permission.USER_READ,
      Permission.PROJECT_CREATE,
      Permission.PROJECT_READ,
      Permission.PROJECT_UPDATE,
      Permission.PROJECT_ASSIGN,
      Permission.CLIENT_READ,
      Permission.CLIENT_UPDATE,
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_ASSIGN,
      Permission.MODULE_READ,
      Permission.SETTINGS_READ,
      Permission.REPORTS_READ,
      Permission.REPORTS_CREATE,
    ],
    isSystem: true,
  },
  {
    name: 'user',
    description: 'Standard user with basic system access',
    permissions: [
      Permission.PROJECT_READ,
      Permission.CLIENT_READ,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.MODULE_READ,
      Permission.SETTINGS_READ,
      Permission.REPORTS_READ,
    ],
    isSystem: true,
  },
  {
    name: 'viewer',
    description: 'Read-only user with limited access',
    permissions: [
      Permission.PROJECT_READ,
      Permission.CLIENT_READ,
      Permission.TASK_READ,
      Permission.MODULE_READ,
      Permission.SETTINGS_READ,
      Permission.REPORTS_READ,
    ],
    isSystem: true,
  },
];

async function initializeDatabase() {
  log('🚀 Initializing database with default roles and permissions...');

  try {
    // Check if roles table exists and has data
    const { data: existingRoles, error: checkError } = await supabase
      .from('roles')
      .select('*')
      .limit(1);

    if (checkError) {
      log('❌ Error checking roles table:', checkError);
      log('📝 Creating roles table...');

      // Create roles table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_roles_table');
      if (createError) {
        log('❌ Error creating roles table:', createError);
        return;
      }
    }

    if (existingRoles && existingRoles.length > 0) {
      log('✅ Roles already exist, skipping initialization');
      return;
    }

    // Insert default roles
    log('📝 Inserting default roles...');
    for (const role of defaultRoles) {
      const { error } = await supabase.from('roles').insert(role);

      if (error) {
        log(`❌ Error inserting role ${role.name}:`, error);
      } else {
        log(`✅ Created role: ${role.name}`);
      }
    }

    log('✅ Database initialization completed successfully!');

    // Display created roles
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (!error && roles) {
      log('\n📋 Created roles:');
      roles.forEach(role => {
        log(
          `  - ${role.name}: ${role.description} (${role.permissions.length} permissions)`
        );
      });
    }
  } catch (error) {
    log('❌ Database initialization failed:', error);
  }
}

// Run the initialization
initializeDatabase();
