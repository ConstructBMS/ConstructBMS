-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  path VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  required_permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Tables
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255)
);

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('page_load', 'api_response', 'error', 'user_interaction')),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  additional_data JSONB DEFAULT '{}'
);

CREATE TABLE user_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_element VARCHAR(100),
  page_url TEXT NOT NULL,
  time_spent INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255)
);

CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('revenue', 'projects', 'tasks', 'users', 'customers')),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comparison_period INTEGER,
  growth_rate DECIMAL(5,2)
);

-- Real-time Tables
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Super admins can manage all organizations" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'Super Admin'
    )
  );

-- Users policies
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Roles policies
CREATE POLICY "Users can view roles in their organization" ON roles
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Menu items policies
CREATE POLICY "Users can view menu items in their organization" ON menu_items
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Analytics policies
CREATE POLICY "Users can view analytics in their organization" ON analytics_events
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view performance metrics in their organization" ON performance_metrics
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view user behaviors in their organization" ON user_behaviors
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert user behaviors" ON user_behaviors
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view business metrics in their organization" ON business_metrics
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert business metrics" ON business_metrics
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view chat messages in their rooms" ON chat_messages
  FOR SELECT USING (true); -- Will be filtered by room_id in application

CREATE POLICY "Users can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO organizations (id, name, domain, settings) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Archer Demo', 'archer.com', '{"theme": "light", "timezone": "UTC"}');

INSERT INTO roles (id, organization_id, name, description, permissions) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Super Admin', 'Full system access', '["*"]'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Admin', 'Administrative access', '["users:read", "users:write", "projects:read", "projects:write", "finance:read", "finance:write"]'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Employee', 'Standard employee access', '["projects:read", "tasks:read", "tasks:write", "calendar:read", "calendar:write"]'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Contractor', 'Limited contractor access', '["projects:read", "tasks:read", "tasks:write"]'),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Customer', 'Customer portal access', '["projects:read", "invoices:read"]');

-- Insert demo users (password: 'password')
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'superadmin@archer.com', '$2b$10$rQZ8N3YqX2vL1mK9nP7wQeJ6hF8gS4tU2vL1mK9nP7wQeJ6hF8gS4tU2vL', 'Super', 'Admin'),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'admin@archer.com', '$2b$10$rQZ8N3YqX2vL1mK9nP7wQeJ6hF8gS4tU2vL1mK9nP7wQeJ6hF8gS4tU2vL', 'Admin', 'User'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'employee@archer.com', '$2b$10$rQZ8N3YqX2vL1mK9nP7wQeJ6hF8gS4tU2vL1mK9nP7wQeJ6hF8gS4tU2vL', 'Employee', 'User');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003');

-- Insert default menu items
INSERT INTO menu_items (organization_id, parent_id, name, icon, path, order_index, required_permissions) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Dashboard', 'LayoutDashboard', '/dashboard', 1, '["dashboard:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Projects', 'FolderOpen', '/projects', 2, '["projects:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Tasks', 'CheckSquare', '/tasks', 3, '["tasks:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Calendar', 'Calendar', '/calendar', 4, '["calendar:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Finance', 'DollarSign', '/finance', 5, '["finance:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'CRM', 'Users', '/crm', 6, '["crm:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Analytics', 'BarChart3', '/analytics', 7, '["analytics:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Users & Roles', 'UserCheck', '/users', 8, '["users:read"]'),
  ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Settings', 'Settings', '/settings', 9, '["settings:read"]');

-- Insert submenu items
INSERT INTO menu_items (organization_id, parent_id, name, icon, path, order_index, required_permissions) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM menu_items WHERE name = 'Users & Roles' AND organization_id = '550e8400-e29b-41d4-a716-446655440000'), 'User & Role Management', 'Users', '/users/management', 1, '["users:read", "users:write"]'),
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM menu_items WHERE name = 'Users & Roles' AND organization_id = '550e8400-e29b-41d4-a716-446655440000'), 'Permissions', 'Shield', '/users/permissions', 2, '["users:read", "permissions:read"]');

-- Insert sample analytics data
INSERT INTO analytics_events (organization_id, event_type, event_data, page_url, timestamp) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'page_view', '{"title": "Dashboard"}', '/dashboard', NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440000', 'page_view', '{"title": "Projects"}', '/projects', NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'page_view', '{"title": "Analytics"}', '/analytics', NOW() - INTERVAL '3 days');

INSERT INTO performance_metrics (organization_id, metric_type, metric_name, metric_value, unit, timestamp) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'page_load', 'total_load_time', 1200, 'ms', NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440000', 'api_response', 'fetch_request', 150, 'ms', NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'page_load', 'dom_content_loaded', 800, 'ms', NOW() - INTERVAL '3 days');

INSERT INTO user_behaviors (organization_id, action, target_element, page_url, time_spent, timestamp) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'click', 'button', '/dashboard', 5000, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440000', 'form_submit', 'form', '/projects', 3000, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'click', 'link', '/analytics', 2000, NOW() - INTERVAL '3 days');

INSERT INTO business_metrics (organization_id, metric_type, metric_name, metric_value, period, timestamp) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'revenue', 'monthly_revenue', 50000.00, 'monthly', NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440000', 'projects', 'active_projects', 15, 'monthly', NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'tasks', 'completed_tasks', 125, 'monthly', NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440000', 'users', 'active_users', 8, 'monthly', NOW() - INTERVAL '4 days');

-- Create indexes for better performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roles_organization_id ON roles(organization_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_menu_items_organization_id ON menu_items(organization_id);
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX idx_analytics_events_organization_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_performance_metrics_organization_id ON performance_metrics(organization_id);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_user_behaviors_organization_id ON user_behaviors(organization_id);
CREATE INDEX idx_user_behaviors_timestamp ON user_behaviors(timestamp);
CREATE INDEX idx_business_metrics_organization_id ON business_metrics(organization_id);
CREATE INDEX idx_business_metrics_timestamp ON business_metrics(timestamp);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at); 