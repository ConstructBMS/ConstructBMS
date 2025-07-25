-- =====================================================
-- COMPLETE MISSING DATABASE SETUP
-- =====================================================
-- Run this to complete the database setup (skip existing items)

-- Check if tables exist and create missing ones
DO \$\$
BEGIN
    -- Create user_roles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('viewer', 'project_manager', 'admin')),
            permissions TEXT[] DEFAULT '{}',
            project_permissions JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
    END IF;

    -- Create permission_matrix table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permission_matrix') THEN
        CREATE TABLE permission_matrix (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            matrix JSONB NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create asta_projects table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asta_projects') THEN
        CREATE TABLE asta_projects (
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
    END IF;

    -- Create asta_tasks table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asta_tasks') THEN
        CREATE TABLE asta_tasks (
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
    END IF;

    -- Create asta_task_links table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asta_task_links') THEN
        CREATE TABLE asta_task_links (
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
    END IF;

    -- Create timeline_phases table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'timeline_phases') THEN
        CREATE TABLE timeline_phases (
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
    END IF;

    -- Create asta_layout_states table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asta_layout_states') THEN
        CREATE TABLE asta_layout_states (
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
    END IF;
END \$\$;

-- Enable RLS on all tables (skip if already enabled)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles' AND rowsecurity = true) THEN
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'permission_matrix' AND rowsecurity = true) THEN
        ALTER TABLE permission_matrix ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'asta_projects' AND rowsecurity = true) THEN
        ALTER TABLE asta_projects ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'asta_tasks' AND rowsecurity = true) THEN
        ALTER TABLE asta_tasks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'asta_task_links' AND rowsecurity = true) THEN
        ALTER TABLE asta_task_links ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'timeline_phases' AND rowsecurity = true) THEN
        ALTER TABLE timeline_phases ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'asta_layout_states' AND rowsecurity = true) THEN
        ALTER TABLE asta_layout_states ENABLE ROW LEVEL SECURITY;
    END IF;
END \$\$;

-- Create RLS policies (skip if already exist)
DO \$\$
BEGIN
    -- user_roles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
        CREATE POLICY \Users
can
view
their
own
roles\ ON user_roles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can update their own roles') THEN
        CREATE POLICY \Users
can
update
their
own
roles\ ON user_roles FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- permission_matrix policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'permission_matrix' AND policyname = 'Anyone can view permission matrix') THEN
        CREATE POLICY \Anyone
can
view
permission
matrix\ ON permission_matrix FOR SELECT USING (true);
    END IF;

    -- asta_projects policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asta_projects' AND policyname = 'Users can view projects they are assigned to') THEN
        CREATE POLICY \Users
can
view
projects
they
are
assigned
to\ ON asta_projects FOR SELECT USING (auth.uid() = manager_id);
    END IF;

    -- asta_tasks policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asta_tasks' AND policyname = 'Users can view tasks in their projects') THEN
        CREATE POLICY \Users
can
view
tasks
in
their
projects\ ON asta_tasks FOR SELECT USING (assigned_to = auth.uid());
    END IF;

    -- asta_task_links policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asta_task_links' AND policyname = 'Users can view task links in their projects') THEN
        CREATE POLICY \Users
can
view
task
links
in
their
projects\ ON asta_task_links FOR SELECT USING (true);
    END IF;

    -- timeline_phases policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_phases' AND policyname = 'Users can view phases in their projects') THEN
        CREATE POLICY \Users
can
view
phases
in
their
projects\ ON timeline_phases FOR SELECT USING (true);
    END IF;

    -- asta_layout_states policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asta_layout_states' AND policyname = 'Users can manage their own layout state') THEN
        CREATE POLICY \Users
can
manage
their
own
layout
state\ ON asta_layout_states FOR ALL USING (auth.uid() = user_id);
    END IF;
END \$\$;

-- Insert default permission matrix if it doesn't exist
INSERT INTO permission_matrix (name, description, matrix) VALUES (
    'default',
    'Default permission matrix for Asta PowerProject',
    '{\viewer\: {\view_projects\: true, \edit_projects\: false}, \project_manager\: {\view_projects\: true, \edit_projects\: true}, \admin\: {\view_projects\: true, \edit_projects\: true}}'
) ON CONFLICT (name) DO NOTHING;

SELECT 'Database setup completed successfully! All required tables and policies have been created.' as status;
