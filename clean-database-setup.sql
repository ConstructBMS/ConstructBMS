-- =====================================================
-- CLEAN DATABASE SETUP FOR CONSTRUCTBMS
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the missing tables error

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- User roles and permissions table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'project_manager', 'admin')),
    permissions TEXT[] DEFAULT '{}',
    project_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Permission matrix table
CREATE TABLE IF NOT EXISTS permission_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    matrix JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asta Projects Table
CREATE TABLE IF NOT EXISTS asta_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    progress DECIMAL(5,2) DEFAULT 0,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asta Tasks table
CREATE TABLE IF NOT EXISTS asta_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    duration INTEGER,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    dependencies TEXT[],
    constraint_type VARCHAR(50) CHECK (constraint_type IN ('asap', 'start-no-earlier', 'must-finish', 'finish-no-later', 'start-no-later', 'must-start')),
    constraint_date DATE,
    deadline DATE,
    wbs_number VARCHAR(50),
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asta Task Links table
CREATE TABLE IF NOT EXISTS asta_task_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    source_task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    target_task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    link_type VARCHAR(20) NOT NULL DEFAULT 'finish-to-start' CHECK (link_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
    lag INTEGER DEFAULT 0 CHECK (lag >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_task_id, target_task_id)
);

-- Timeline Phases table
CREATE TABLE IF NOT EXISTS timeline_phases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',
    sequence INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asta Layout States table
CREATE TABLE IF NOT EXISTS asta_layout_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    sidebar_collapsed BOOLEAN DEFAULT false,
    view_mode VARCHAR(50) DEFAULT 'gantt' CHECK (view_mode IN ('gantt', 'timeline', 'calendar', 'resource', 'cost')),
    user_role VARCHAR(50) DEFAULT 'project_manager' CHECK (user_role IN ('admin', 'project_manager', 'scheduler', 'viewer')),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{\
autoSave\: true, \autoSaveInterval\: 30, \theme\: \auto\, \ribbonVisible\: true, \statusBarVisible\: true, \gridLines\: true, \criticalPathHighlight\: true, \resourceOverloadWarning\: true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_layout_states ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY \Users
can
view
their
own
roles\ ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY \Anyone
can
view
permission
matrix\ ON permission_matrix FOR SELECT USING (true);
CREATE POLICY \Users
can
view
projects
they
are
assigned
to\ ON asta_projects FOR SELECT USING (auth.uid() = manager_id);
CREATE POLICY \Users
can
view
tasks
in
their
projects\ ON asta_tasks FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY \Users
can
view
task
links
in
their
projects\ ON asta_task_links FOR SELECT USING (true);
CREATE POLICY \Users
can
view
phases
in
their
projects\ ON timeline_phases FOR SELECT USING (true);
CREATE POLICY \Users
can
manage
their
own
layout
state\ ON asta_layout_states FOR ALL USING (auth.uid() = user_id);

-- Insert default permission matrix
INSERT INTO permission_matrix (name, description, matrix) VALUES (
    'default',
    'Default permission matrix for Asta PowerProject',
    '{\viewer\: {\view_projects\: true, \edit_projects\: false}, \project_manager\: {\view_projects\: true, \edit_projects\: true}, \admin\: {\view_projects\: true, \edit_projects\: true}}'
) ON CONFLICT (name) DO NOTHING;

SELECT 'Database setup completed successfully! All required tables have been created.' as status;
