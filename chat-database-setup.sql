-- =====================================================
-- CHAT DATABASE SETUP
-- =====================================================
-- This script creates all chat-related tables with proper RLS policies
-- Run this in your Supabase SQL Editor

-- =====================================================
-- TWO-FACTOR AUTHENTICATION SETUP
-- =====================================================

-- Add 2FA-related columns to user_settings table (if it exists)
DO $$ 
BEGIN
    -- Check if user_settings table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        -- Add 2FA columns
        ALTER TABLE user_settings 
        ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS two_factor_method TEXT CHECK (two_factor_method IN ('totp', 'sms', 'email')),
        ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
        ADD COLUMN IF NOT EXISTS last_2fa_used TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS two_factor_setup_secret TEXT,
        ADD COLUMN IF NOT EXISTS two_factor_setup_backup_codes TEXT[],
        ADD COLUMN IF NOT EXISTS two_factor_setup_method TEXT CHECK (two_factor_setup_method IN ('totp', 'sms', 'email')),
        ADD COLUMN IF NOT EXISTS two_factor_setup_timestamp TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS verification_code TEXT,
        ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP WITH TIME ZONE;

        -- Create indexes for 2FA
        CREATE INDEX IF NOT EXISTS idx_user_settings_2fa_enabled ON user_settings(two_factor_enabled);
        CREATE INDEX IF NOT EXISTS idx_user_settings_verification_code ON user_settings(verification_code) WHERE verification_code IS NOT NULL;

        -- Create cleanup functions
        CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
        RETURNS void AS $$
        BEGIN
          UPDATE user_settings 
          SET verification_code = NULL, 
              verification_code_expires = NULL
          WHERE verification_code_expires < NOW();
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION cleanup_expired_2fa_setup()
        RETURNS void AS $$
        BEGIN
          UPDATE user_settings 
          SET two_factor_setup_secret = NULL,
              two_factor_setup_backup_codes = NULL,
              two_factor_setup_method = NULL,
              two_factor_setup_timestamp = NULL
          WHERE two_factor_setup_timestamp < NOW() - INTERVAL '1 hour';
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Add demo_mode column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_mode BOOLEAN DEFAULT TRUE;

-- Update existing users to have demo_mode = true (default for new users)
UPDATE users SET demo_mode = TRUE WHERE demo_mode IS NULL;

-- =====================================================
-- STEP 1: Create chat tables
-- =====================================================

-- Chat Channels table
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('system', 'project', 'custom')),
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    members TEXT[] DEFAULT '{}',
    admins TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{
        "allowFileUploads": true,
        "allowReactions": true,
        "allowThreading": true,
        "slowMode": false,
        "slowModeInterval": 0
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    mentions TEXT[] DEFAULT '{}',
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Notifications table
CREATE TABLE IF NOT EXISTS chat_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mention', 'message', 'reaction', 'channel_invite')),
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Presence table
CREATE TABLE IF NOT EXISTS chat_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away', 'busy')),
    current_channel UUID REFERENCES chat_channels(id) ON DELETE SET NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- STEP 2: Create indexes for performance
-- =====================================================

-- Indexes for chat_channels
CREATE INDEX IF NOT EXISTS idx_chat_channels_type ON chat_channels(type);
CREATE INDEX IF NOT EXISTS idx_chat_channels_project_id ON chat_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_channels_created_at ON chat_channels(created_at);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);

-- Indexes for chat_notifications
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_channel_id ON chat_notifications(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_read ON chat_notifications(read);

-- Indexes for chat_presence
CREATE INDEX IF NOT EXISTS idx_chat_presence_user_id ON chat_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_presence_status ON chat_presence(status);

-- =====================================================
-- STEP 3: Create triggers for updated_at
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_chat_channels_updated_at 
    BEFORE UPDATE ON chat_channels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_presence_updated_at 
    BEFORE UPDATE ON chat_presence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: Enable RLS on all tables
-- =====================================================

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS policies
-- =====================================================

-- Chat Channels policies
CREATE POLICY "Users can view channels they are members of" ON chat_channels
    FOR SELECT USING (
        auth.uid()::text = ANY(members) OR 
        auth.uid()::text = ANY(admins) OR

-- =====================================================
-- ASTA POWERPROJECT TABLES
-- =====================================================

-- Asta Layout States table
CREATE TABLE IF NOT EXISTS asta_layout_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    sidebar_collapsed BOOLEAN DEFAULT false,
    view_mode VARCHAR(50) DEFAULT 'gantt' CHECK (view_mode IN ('gantt', 'timeline', 'calendar', 'resource', 'cost')),
    user_role VARCHAR(50) DEFAULT 'project_manager' CHECK (user_role IN ('admin', 'project_manager', 'scheduler', 'viewer')),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{
        "autoSave": true,
        "autoSaveInterval": 30,
        "theme": "auto",
        "ribbonVisible": true,
        "statusBarVisible": true,
        "gridLines": true,
        "criticalPathHighlight": true,
        "resourceOverloadWarning": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Asta PowerProject Projects Table
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Project Settings Fields
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'USD',
    tags TEXT[] DEFAULT '{}',
    default_calendar VARCHAR(50) DEFAULT 'standard',
    print_profile VARCHAR(50) DEFAULT 'default',
    constraint_settings JSONB DEFAULT '{
        "allow_negative_float": false,
        "respect_calendars": true,
        "auto_level_resources": false,
        "critical_path_method": "forward",
        "default_lag": 0
    }'::jsonb,
    
    -- WBS and numbering
    wbs_enabled BOOLEAN DEFAULT true,
    wbs_prefix VARCHAR(10) DEFAULT '',
    
    -- Project summary task
    show_summary_task BOOLEAN DEFAULT true,
    summary_task_name VARCHAR(255) DEFAULT 'Project Summary'
);

-- Asta Tasks table
CREATE TABLE IF NOT EXISTS asta_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    duration INTEGER, -- in days
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    dependencies TEXT[], -- array of task IDs this task depends on
    -- Task constraints and deadlines
    constraint_type VARCHAR(50) CHECK (constraint_type IN ('none', 'MSO', 'SNET', 'FNLT', 'MFO')),
    constraint_date DATE,
    constraint_violated BOOLEAN DEFAULT FALSE,
    deadline DATE,
    -- WBS numbering
    wbs_number VARCHAR(50),
    level INTEGER DEFAULT 0,
    -- Progress tracking fields
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
    actual_start_date DATE,
    actual_finish_date DATE,
    progress_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    progress_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    demo BOOLEAN DEFAULT false,
    -- Calendar assignment
    calendar_id UUID REFERENCES programme_calendars(id) ON DELETE SET NULL,
    -- Additional fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programme Tasks table (for constraint management)
CREATE TABLE IF NOT EXISTS programme_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50) DEFAULT 'none' CHECK (constraint_type IN ('none', 'MSO', 'SNET', 'FNLT', 'MFO')),
    constraint_date DATE,
    constraint_reason TEXT,
    constraint_violated BOOLEAN DEFAULT FALSE,
    demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id)
);

-- Asta Resources table
CREATE TABLE IF NOT EXISTS asta_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'work' CHECK (type IN ('work', 'material', 'cost')),
    max_units INTEGER DEFAULT 100,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    availability INTEGER DEFAULT 100 CHECK (availability >= 0 AND availability <= 100),
    current_utilization INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asta Task Assignments table
CREATE TABLE IF NOT EXISTS asta_task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES asta_resources(id) ON DELETE CASCADE,
    units INTEGER DEFAULT 100 CHECK (units >= 0 AND units <= 100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, resource_id)
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

-- Activity Templates table
CREATE TABLE IF NOT EXISTS activity_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Steps table
CREATE TABLE IF NOT EXISTS template_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES activity_templates(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 1, -- Duration in days
    sequence INTEGER NOT NULL DEFAULT 1,
    is_milestone BOOLEAN DEFAULT false,
    dependencies TEXT[] DEFAULT '{}', -- Array of step IDs this step depends on
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Activities table
CREATE TABLE IF NOT EXISTS task_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    template_id UUID REFERENCES activity_templates(id) ON DELETE SET NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 1, -- Duration in days
    sequence INTEGER NOT NULL DEFAULT 1,
    is_milestone BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'delayed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    dependencies TEXT[] DEFAULT '{}', -- Array of activity IDs this activity depends on
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline Phases table
CREATE TABLE IF NOT EXISTS timeline_phases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color code
    sequence INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Views table for tab colouring
CREATE TABLE IF NOT EXISTS asta_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    view_type VARCHAR(50) NOT NULL CHECK (view_type IN ('gantt', 'timeline', 'calendar', 'resource', 'cost', 'custom')),
    tab_color VARCHAR(50) DEFAULT 'blue' CHECK (tab_color IN ('blue', 'green', 'orange', 'red', 'purple', 'yellow', 'pink', 'indigo', 'teal', 'gray', 'slate', 'zinc', 'neutral', 'stone', 'amber', 'lime', 'emerald', 'cyan', 'sky', 'violet', 'fuchsia', 'rose')),
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Print Profiles table
CREATE TABLE IF NOT EXISTS print_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES asta_projects(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ASTA POWERPROJECT INDEXES
-- =====================================================

-- Indexes for asta_layout_states
CREATE INDEX IF NOT EXISTS idx_asta_layout_states_user_id ON asta_layout_states(user_id);
CREATE INDEX IF NOT EXISTS idx_asta_layout_states_project_id ON asta_layout_states(project_id);

-- Indexes for asta_projects
CREATE INDEX IF NOT EXISTS idx_asta_projects_status ON asta_projects(status);
CREATE INDEX IF NOT EXISTS idx_asta_projects_created_by ON asta_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_asta_projects_assigned_to ON asta_projects(assigned_to);

-- Indexes for asta_tasks
CREATE INDEX IF NOT EXISTS idx_asta_tasks_project_id ON asta_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_status ON asta_tasks(status);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_assigned_to ON asta_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_parent_task_id ON asta_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_constraint_type ON asta_tasks(constraint_type);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_deadline ON asta_tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_wbs_number ON asta_tasks(wbs_number);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_level ON asta_tasks(level);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_percent_complete ON asta_tasks(percent_complete);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_actual_start_date ON asta_tasks(actual_start_date);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_actual_finish_date ON asta_tasks(actual_finish_date);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_progress_updated_at ON asta_tasks(progress_updated_at);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_demo ON asta_tasks(demo);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_calendar_id ON asta_tasks(calendar_id);

-- Indexes for programme_tasks
CREATE INDEX IF NOT EXISTS idx_programme_tasks_project_id ON programme_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_tasks_task_id ON programme_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_tasks_constraint_type ON programme_tasks(constraint_type);
CREATE INDEX IF NOT EXISTS idx_programme_tasks_constraint_violated ON programme_tasks(constraint_violated);
CREATE INDEX IF NOT EXISTS idx_programme_tasks_demo ON programme_tasks(demo);

-- Indexes for asta_resources
CREATE INDEX IF NOT EXISTS idx_asta_resources_project_id ON asta_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_asta_resources_type ON asta_resources(type);

-- Indexes for asta_task_assignments
CREATE INDEX IF NOT EXISTS idx_asta_task_assignments_task_id ON asta_task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_asta_task_assignments_resource_id ON asta_task_assignments(resource_id);

-- Indexes for asta_task_links
CREATE INDEX IF NOT EXISTS idx_asta_task_links_project_id ON asta_task_links(project_id);
CREATE INDEX IF NOT EXISTS idx_asta_task_links_source_task_id ON asta_task_links(source_task_id);
CREATE INDEX IF NOT EXISTS idx_asta_task_links_target_task_id ON asta_task_links(target_task_id);

-- Indexes for activity_templates
CREATE INDEX IF NOT EXISTS idx_activity_templates_owner_id ON activity_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_activity_templates_is_public ON activity_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_activity_templates_category ON activity_templates(category);
CREATE INDEX IF NOT EXISTS idx_activity_templates_tags ON activity_templates USING GIN(tags);

-- Indexes for template_steps
CREATE INDEX IF NOT EXISTS idx_template_steps_template_id ON template_steps(template_id);
CREATE INDEX IF NOT EXISTS idx_template_steps_sequence ON template_steps(sequence);
CREATE INDEX IF NOT EXISTS idx_template_steps_is_milestone ON template_steps(is_milestone);

-- Indexes for task_activities
CREATE INDEX IF NOT EXISTS idx_task_activities_task_id ON task_activities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_template_id ON task_activities(template_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_status ON task_activities(status);
CREATE INDEX IF NOT EXISTS idx_task_activities_assigned_to ON task_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_activities_sequence ON task_activities(sequence);

-- Indexes for timeline_phases
CREATE INDEX IF NOT EXISTS idx_timeline_phases_project_id ON timeline_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_phases_start_date ON timeline_phases(start_date);
CREATE INDEX IF NOT EXISTS idx_timeline_phases_end_date ON timeline_phases(end_date);
CREATE INDEX IF NOT EXISTS idx_timeline_phases_sequence ON timeline_phases(sequence);

-- Indexes for asta_views
CREATE INDEX IF NOT EXISTS idx_asta_views_project_id ON asta_views(project_id);
CREATE INDEX IF NOT EXISTS idx_asta_views_view_type ON asta_views(view_type);
CREATE INDEX IF NOT EXISTS idx_asta_views_tab_color ON asta_views(tab_color);
CREATE INDEX IF NOT EXISTS idx_asta_views_sort_order ON asta_views(sort_order);
CREATE INDEX IF NOT EXISTS idx_asta_views_is_default ON asta_views(is_default);

-- Indexes for print_profiles
CREATE INDEX IF NOT EXISTS idx_print_profiles_user_id ON print_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_print_profiles_project_id ON print_profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_print_profiles_is_default ON print_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_print_profiles_is_shared ON print_profiles(is_shared);
CREATE INDEX IF NOT EXISTS idx_print_profiles_settings ON print_profiles USING GIN(settings);

-- Indexes for asta_format_presets
CREATE INDEX IF NOT EXISTS idx_asta_format_presets_user_id ON asta_format_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_asta_format_presets_is_default ON asta_format_presets(is_default);

-- Indexes for print_profiles
CREATE INDEX IF NOT EXISTS idx_print_profiles_user_id ON print_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_print_profiles_is_default ON print_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_print_profiles_name ON print_profiles(name);

-- =====================================================
-- STEP 4: Create triggers for updated_at
-- =====================================================

-- Triggers for updated_at
CREATE TRIGGER update_asta_layout_states_updated_at 
    BEFORE UPDATE ON asta_layout_states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_projects_updated_at 
    BEFORE UPDATE ON asta_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_tasks_updated_at 
    BEFORE UPDATE ON asta_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programme_tasks_updated_at 
    BEFORE UPDATE ON programme_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_resources_updated_at 
    BEFORE UPDATE ON asta_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_task_assignments_updated_at 
    BEFORE UPDATE ON asta_task_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_task_links_updated_at 
    BEFORE UPDATE ON asta_task_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_templates_updated_at 
    BEFORE UPDATE ON activity_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_steps_updated_at 
    BEFORE UPDATE ON template_steps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_activities_updated_at 
    BEFORE UPDATE ON task_activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_phases_updated_at 
    BEFORE UPDATE ON timeline_phases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_views_updated_at 
    BEFORE UPDATE ON asta_views 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asta_format_presets_updated_at 
    BEFORE UPDATE ON asta_format_presets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_print_profiles_updated_at 
    BEFORE UPDATE ON print_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ASTA POWERPROJECT RLS POLICIES
-- =====================================================

-- Enable RLS on Asta tables
ALTER TABLE asta_layout_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE asta_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_profiles ENABLE ROW LEVEL SECURITY;

-- Asta Layout States policies
CREATE POLICY "Users can manage their own layout state" ON asta_layout_states
    FOR ALL USING (auth.uid() = user_id);

-- Asta Projects policies
CREATE POLICY "Users can view projects they are assigned to or created" ON asta_projects
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM asta_tasks 
            WHERE project_id = asta_projects.id 
            AND assigned_to = auth.uid()
        )
    );

CREATE POLICY "Project managers can manage projects" ON asta_projects
    FOR ALL USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Asta Tasks policies
CREATE POLICY "Users can view tasks in their projects" ON asta_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_tasks.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        ) OR
        assigned_to = auth.uid()
    );

CREATE POLICY "Users can manage tasks they are assigned to" ON asta_tasks
    FOR ALL USING (assigned_to = auth.uid());

-- Asta Resources policies
CREATE POLICY "Users can view resources in their projects" ON asta_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_resources.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

CREATE POLICY "Project managers can manage resources" ON asta_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_resources.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

-- Asta Task Assignments policies
CREATE POLICY "Users can view assignments in their projects" ON asta_task_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            WHERE t.id = asta_task_assignments.task_id 
            AND (p.created_by = auth.uid() OR p.assigned_to = auth.uid() OR t.assigned_to = auth.uid())
        )
    );

CREATE POLICY "Project managers can manage assignments" ON asta_task_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            WHERE t.id = asta_task_assignments.task_id 
            AND (p.created_by = auth.uid() OR p.assigned_to = auth.uid())
        )
    );

-- Asta Task Links policies
CREATE POLICY "Users can view task links in their projects" ON asta_task_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_task_links.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

CREATE POLICY "Project managers can manage task links" ON asta_task_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_task_links.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

-- Activity Templates policies
CREATE POLICY "Users can view public templates and their own" ON activity_templates
    FOR SELECT USING (
        is_public = true OR auth.uid() = owner_id
    );

CREATE POLICY "Users can manage their own templates" ON activity_templates
    FOR ALL USING (auth.uid() = owner_id);

-- Template Steps policies
CREATE POLICY "Users can view steps for accessible templates" ON template_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM activity_templates 
            WHERE id = template_steps.template_id 
            AND (is_public = true OR owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage steps for their own templates" ON template_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM activity_templates 
            WHERE id = template_steps.template_id 
            AND owner_id = auth.uid()
        )
    );

-- Task Activities policies
CREATE POLICY "Users can view activities for their tasks" ON task_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            WHERE t.id = task_activities.task_id 
            AND (p.created_by = auth.uid() OR p.assigned_to = auth.uid() OR t.assigned_to = auth.uid())
        ) OR
        assigned_to = auth.uid()
    );

CREATE POLICY "Users can manage activities for their tasks" ON task_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            WHERE t.id = task_activities.task_id 
            AND (p.created_by = auth.uid() OR p.assigned_to = auth.uid() OR t.assigned_to = auth.uid())
        ) OR
        assigned_to = auth.uid()
    );

-- Timeline Phases policies
CREATE POLICY "Users can view phases in their projects" ON timeline_phases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = timeline_phases.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

CREATE POLICY "Project managers can manage phases" ON timeline_phases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = timeline_phases.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

-- Asta Views policies
CREATE POLICY "Users can view views in their projects" ON asta_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_views.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

CREATE POLICY "Project managers can manage views" ON asta_views
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = asta_views.project_id 
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

-- Print Profiles policies
CREATE POLICY "Users can view their own profiles" ON print_profiles
    FOR SELECT USING (
        user_id = auth.uid() OR is_shared = true
    );

CREATE POLICY "Users can manage their own profiles" ON print_profiles
    FOR ALL USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can view shared profiles" ON print_profiles
    FOR SELECT USING (
        is_shared = true
    );

CREATE POLICY "Admins can manage channels" ON chat_channels
    FOR ALL USING (
        auth.uid()::text = ANY(admins)
    );

CREATE POLICY "Users can create channels" ON chat_channels
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Chat Messages policies
CREATE POLICY "Users can view messages in channels they are members of" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_channels 
            WHERE chat_channels.id = chat_messages.channel_id 
            AND (auth.uid()::text = ANY(chat_channels.members) OR 
                 auth.uid()::text = ANY(chat_channels.admins) OR 
                 NOT chat_channels.is_private)
        )
    );

CREATE POLICY "Users can send messages to channels they are members of" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_channels 
            WHERE chat_channels.id = chat_messages.channel_id 
            AND (auth.uid()::text = ANY(chat_channels.members) OR 
                 auth.uid()::text = ANY(chat_channels.admins))
        )
    );

CREATE POLICY "Users can edit their own messages" ON chat_messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can delete their own messages" ON chat_messages
    FOR DELETE USING (
        auth.uid() = sender_id
    );

-- Chat Notifications policies
CREATE POLICY "Users can view their own notifications" ON chat_notifications
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own notifications" ON chat_notifications
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Chat Presence policies
CREATE POLICY "Users can view presence" ON chat_presence
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own presence" ON chat_presence
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own presence" ON chat_presence
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- =====================================================
-- ASTA POWERPROJECT FORMAT TABLES
-- =====================================================

-- Asta PowerProject Format Presets Table
CREATE TABLE IF NOT EXISTS asta_format_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_name VARCHAR(255) NOT NULL,
  format_settings JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preset_name)
);

-- Add format_settings column to user_settings if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        ALTER TABLE user_settings 
        ADD COLUMN IF NOT EXISTS format_settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- ASTA POWERPROJECT OUTPUT TABLES
-- =====================================================

-- Print Profiles Table
CREATE TABLE IF NOT EXISTS print_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB NOT NULL DEFAULT '{
    "pageSize": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 20,
      "bottom": 20,
      "left": 20,
      "right": 20
    },
    "scale": 100,
    "includeLegend": true,
    "includeGrid": true,
    "includeTimeline": true,
    "quality": "normal"
  }',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Add output_settings column to user_settings if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        ALTER TABLE user_settings 
        ADD COLUMN IF NOT EXISTS output_settings JSONB DEFAULT '{
          "selectedProfile": "default",
          "exportFormat": "pdf",
          "pageRange": {"start": 1, "end": 1, "custom": false},
          "includeLegend": true,
          "includeGrid": true,
          "includeTimeline": true,
          "quality": "normal",
          "showPreview": false
        }';
    END IF;
END $$;

-- =====================================================
-- PROGRAMME TASK FLAGS TABLES
-- =====================================================

-- Programme Task Flags table
CREATE TABLE IF NOT EXISTS programme_task_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    flag_color VARCHAR(10) NOT NULL CHECK (flag_color IN ('red', 'yellow', 'green', 'blue')),
    note TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    demo BOOLEAN DEFAULT false,
    UNIQUE(task_id) -- Each task can have only one flag
);

-- =====================================================
-- PROGRAMME BASELINES TABLES
-- =====================================================

-- Programme Baselines table
CREATE TABLE IF NOT EXISTS programme_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false,
    demo BOOLEAN DEFAULT false
);

-- Programme Baseline Tasks table
CREATE TABLE IF NOT EXISTS programme_baseline_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baseline_id UUID NOT NULL REFERENCES programme_baselines(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    baseline_start DATE NOT NULL,
    baseline_end DATE NOT NULL,
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
    is_milestone BOOLEAN DEFAULT false,
    parent_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Baseline Preferences table
CREATE TABLE IF NOT EXISTS baseline_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    show_baseline_bars BOOLEAN DEFAULT true,
    comparison_mode VARCHAR(20) DEFAULT 'bars' CHECK (comparison_mode IN ('bars', 'variance', 'delta')),
    active_baseline_id UUID REFERENCES programme_baselines(id) ON DELETE SET NULL,
    demo BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Indexes for programme task flags
CREATE INDEX IF NOT EXISTS idx_programme_task_flags_task_id ON programme_task_flags(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_flags_project_id ON programme_task_flags(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_flags_flag_color ON programme_task_flags(flag_color);
CREATE INDEX IF NOT EXISTS idx_programme_task_flags_created_at ON programme_task_flags(created_at);
CREATE INDEX IF NOT EXISTS idx_programme_task_flags_demo ON programme_task_flags(demo);

-- Indexes for programme baselines
CREATE INDEX IF NOT EXISTS idx_programme_baselines_project_id ON programme_baselines(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_baselines_created_by ON programme_baselines(created_by);
CREATE INDEX IF NOT EXISTS idx_programme_baselines_created_at ON programme_baselines(created_at);
CREATE INDEX IF NOT EXISTS idx_programme_baselines_is_active ON programme_baselines(is_active);
CREATE INDEX IF NOT EXISTS idx_programme_baselines_demo ON programme_baselines(demo);

-- Indexes for programme baseline tasks
CREATE INDEX IF NOT EXISTS idx_programme_baseline_tasks_baseline_id ON programme_baseline_tasks(baseline_id);
CREATE INDEX IF NOT EXISTS idx_programme_baseline_tasks_task_id ON programme_baseline_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_baseline_tasks_baseline_start ON programme_baseline_tasks(baseline_start);
CREATE INDEX IF NOT EXISTS idx_programme_baseline_tasks_baseline_end ON programme_baseline_tasks(baseline_end);
CREATE INDEX IF NOT EXISTS idx_programme_baseline_tasks_parent_id ON programme_baseline_tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_programme_baseline_tasks_demo ON programme_baseline_tasks(demo);

-- Indexes for baseline preferences
CREATE INDEX IF NOT EXISTS idx_baseline_preferences_user_id ON baseline_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_baseline_preferences_project_id ON baseline_preferences(project_id);
CREATE INDEX IF NOT EXISTS idx_baseline_preferences_active_baseline_id ON baseline_preferences(active_baseline_id);
CREATE INDEX IF NOT EXISTS idx_baseline_preferences_demo ON baseline_preferences(demo);

-- RLS Policies for programme task flags
ALTER TABLE programme_task_flags ENABLE ROW LEVEL SECURITY;

-- Users can view flags for projects they have access to
CREATE POLICY "Users can view programme task flags" ON programme_task_flags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_task_flags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.flag.view' = ANY(permissions)
            ))
        )
    );

-- Users can insert flags if they have edit permission
CREATE POLICY "Users can insert programme task flags" ON programme_task_flags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_task_flags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.flag.edit' = ANY(permissions)
            ))
        )
    );

-- Users can update flags if they have edit permission
CREATE POLICY "Users can update programme task flags" ON programme_task_flags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_task_flags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.flag.edit' = ANY(permissions)
            ))
        )
    );

-- Users can delete flags if they have edit permission
CREATE POLICY "Users can delete programme task flags" ON programme_task_flags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_task_flags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.flag.edit' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for programme tasks (constraints)
ALTER TABLE programme_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view constraints for projects they have access to
CREATE POLICY "Users can view programme task constraints" ON programme_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tasks.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.constraints.view' = ANY(permissions)
            ))
        )
    );

-- Users can insert constraints if they have assign permission
CREATE POLICY "Users can insert programme task constraints" ON programme_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tasks.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.constraints.assign' = ANY(permissions)
            ))
        )
    );

-- Users can update constraints if they have assign permission
CREATE POLICY "Users can update programme task constraints" ON programme_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tasks.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.constraints.assign' = ANY(permissions)
            ))
        )
    );

-- Users can delete constraints if they have assign permission
CREATE POLICY "Users can delete programme task constraints" ON programme_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tasks.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.constraints.assign' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for programme baselines
ALTER TABLE programme_baselines ENABLE ROW LEVEL SECURITY;

-- Users can view baselines for projects they have access to
CREATE POLICY "Users can view programme baselines" ON programme_baselines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_baselines.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.view' = ANY(permissions)
            ))
        )
    );

-- Users can create baselines if they have baseline create permissions
CREATE POLICY "Users can create programme baselines" ON programme_baselines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_baselines.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.create' = ANY(permissions)
            ))
        )
    );

-- Users can update baselines if they have baseline manage permissions
CREATE POLICY "Users can update programme baselines" ON programme_baselines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_baselines.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.manage' = ANY(permissions)
            ))
        )
    );

-- Users can delete baselines if they have baseline manage permissions
CREATE POLICY "Users can delete programme baselines" ON programme_baselines
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_baselines.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.manage' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for programme baseline tasks
ALTER TABLE programme_baseline_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view baseline tasks for projects they have access to
CREATE POLICY "Users can view programme baseline tasks" ON programme_baseline_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM programme_baselines b
            JOIN asta_projects p ON p.id = b.project_id
            WHERE b.id = programme_baseline_tasks.baseline_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.view' = ANY(permissions)
            ))
        )
    );

-- Users can create baseline tasks if they have baseline create permissions
CREATE POLICY "Users can create programme baseline tasks" ON programme_baseline_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM programme_baselines b
            JOIN asta_projects p ON p.id = b.project_id
            WHERE b.id = programme_baseline_tasks.baseline_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.create' = ANY(permissions)
            ))
        )
    );

-- Users can update baseline tasks if they have baseline manage permissions
CREATE POLICY "Users can update programme baseline tasks" ON programme_baseline_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM programme_baselines b
            JOIN asta_projects p ON p.id = b.project_id
            WHERE b.id = programme_baseline_tasks.baseline_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.manage' = ANY(permissions)
            ))
        )
    );

-- Users can delete baseline tasks if they have baseline manage permissions
CREATE POLICY "Users can delete programme baseline tasks" ON programme_baseline_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM programme_baselines b
            JOIN asta_projects p ON p.id = b.project_id
            WHERE b.id = programme_baseline_tasks.baseline_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.baseline.manage' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for baseline preferences
ALTER TABLE baseline_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own baseline preferences
CREATE POLICY "Users can view their own baseline preferences" ON baseline_preferences
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own baseline preferences
CREATE POLICY "Users can create their own baseline preferences" ON baseline_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own baseline preferences
CREATE POLICY "Users can update their own baseline preferences" ON baseline_preferences
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own baseline preferences
CREATE POLICY "Users can delete their own baseline preferences" ON baseline_preferences
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- STEP 6: Insert demo data
-- =====================================================

-- Insert demo channels
INSERT INTO chat_channels (id, name, type, description, members, admins, is_private, created_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'General',
    'system',
    'General discussion channel',
    ARRAY['58309b6c-86f7-482b-af81-e3736be3e5f2'],
    ARRAY['58309b6c-86f7-482b-af81-e3736be3e5f2'],
    false,
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Project Updates',
    'custom',
    'Project status updates and announcements',
    ARRAY['58309b6c-86f7-482b-af81-e3736be3e5f2'],
    ARRAY['58309b6c-86f7-482b-af81-e3736be3e5f2'],
    false,
    NOW()
);

-- Insert demo messages
INSERT INTO chat_messages (id, channel_id, sender_id, content, message_type, created_at) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '58309b6c-86f7-482b-af81-e3736be3e5f2',
    'Welcome to the chat! 👋',
    'text',
    NOW() - INTERVAL '1 hour'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    '58309b6c-86f7-482b-af81-e3736be3e5f2',
    'This is a real chat system connected to Supabase!',
    'text',
    NOW() - INTERVAL '30 minutes'
);

-- Insert demo presence
INSERT INTO chat_presence (user_id, status, current_channel, last_seen) VALUES
(
    '58309b6c-86f7-482b-af81-e3736be3e5f2',
    'online',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW()
);

-- Insert demo print profiles
INSERT INTO print_profiles (id, user_id, name, description, settings, is_default, created_at) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '58309b6c-86f7-482b-af81-e3736be3e5f2',
    'Default Profile',
    'Default print profile for standard exports',
    '{
      "pageSize": "A4",
      "orientation": "portrait",
      "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20},
      "scale": 100,
      "includeLegend": true,
      "includeGrid": true,
      "includeTimeline": true,
      "quality": "normal"
    }',
    true,
    NOW()
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '58309b6c-86f7-482b-af81-e3736be3e5f2',
    'High Quality',
    'High quality export profile for presentations',
    '{
      "pageSize": "A4",
      "orientation": "landscape",
      "margins": {"top": 15, "bottom": 15, "left": 15, "right": 15},
      "scale": 120,
      "includeLegend": true,
      "includeGrid": false,
      "includeTimeline": true,
      "quality": "high"
    }',
    false,
    NOW()
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    '58309b6c-86f7-482b-af81-e3736be3e5f2',
    'Draft Export',
    'Quick draft export for internal review',
    '{
      "pageSize": "A4",
      "orientation": "portrait",
      "margins": {"top": 25, "bottom": 25, "left": 25, "right": 25},
      "scale": 80,
      "includeLegend": false,
      "includeGrid": true,
      "includeTimeline": false,
      "quality": "draft"
    }',
    false,
    NOW()
);

-- Demo data for asta_views
INSERT INTO asta_views (project_id, name, description, view_type, tab_color, is_default, sort_order) VALUES
('demo-project-1', 'Planning View', 'Project planning and design phase view', 'gantt', 'blue', true, 1),
('demo-project-1', 'Construction View', 'Main construction phase view', 'gantt', 'orange', false, 2),
('demo-project-1', 'QA View', 'Quality assurance and testing view', 'gantt', 'green', false, 3),
('demo-project-1', 'Resource View', 'Resource allocation and management', 'resource', 'purple', false, 4),
('demo-project-1', 'Cost View', 'Budget and cost tracking', 'cost', 'red', false, 5),
('demo-project-2', 'Foundation View', 'Foundation and structural work', 'gantt', 'teal', true, 1),
('demo-project-2', 'Framing View', 'Structural framing and walls', 'gantt', 'amber', false, 2),
('demo-project-2', 'Finishing View', 'Interior and exterior finishing', 'gantt', 'emerald', false, 3),
('demo-project-3', 'Demolition View', 'Site preparation and demolition', 'gantt', 'red', true, 1),
('demo-project-3', 'Renovation View', 'Building renovation work', 'gantt', 'orange', false, 2),
('demo-project-3', 'Completion View', 'Final touches and handover', 'gantt', 'green', false, 3);

-- Demo data for print_profiles
INSERT INTO print_profiles (name, description, user_id, project_id, settings, is_default, is_shared) VALUES
('Standard A4 Portrait', 'Default A4 portrait layout with all components', NULL, 'demo-project-1', '{"paperSize": "A4", "orientation": "portrait", "dateRange": {"start": "2024-01-01", "end": "2024-12-31"}, "includeTimeline": true, "includeTaskTable": true, "includeNotes": false, "border": true, "frame": false, "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}, "header": {"enabled": true, "title": "Project Schedule", "showDate": true}, "footer": {"enabled": true, "showPageNumbers": true, "showDate": true}}', true, true),
('Landscape Gantt', 'Landscape layout optimized for Gantt charts', NULL, 'demo-project-1', '{"paperSize": "A3", "orientation": "landscape", "dateRange": {"start": "2024-01-01", "end": "2024-12-31"}, "includeTimeline": true, "includeTaskTable": false, "includeNotes": false, "border": true, "frame": true, "margins": {"top": 15, "right": 15, "bottom": 15, "left": 15}, "header": {"enabled": true, "title": "Gantt Chart", "showDate": true}, "footer": {"enabled": true, "showPageNumbers": true, "showDate": false}}', false, true),
('Task Table Only', 'Portrait layout showing only task table', NULL, 'demo-project-1', '{"paperSize": "A4", "orientation": "portrait", "dateRange": {"start": "2024-01-01", "end": "2024-12-31"}, "includeTimeline": false, "includeTaskTable": true, "includeNotes": true, "border": false, "frame": false, "margins": {"top": 25, "right": 25, "bottom": 25, "left": 25}, "header": {"enabled": false, "title": "", "showDate": false}, "footer": {"enabled": true, "showPageNumbers": true, "showDate": true}}', false, true),
('Executive Summary', 'Compact layout for executive presentations', NULL, 'demo-project-2', '{"paperSize": "A4", "orientation": "portrait", "dateRange": {"start": "2024-01-01", "end": "2024-12-31"}, "includeTimeline": true, "includeTaskTable": true, "includeNotes": true, "border": true, "frame": true, "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}, "header": {"enabled": true, "title": "Executive Summary", "showDate": true}, "footer": {"enabled": true, "showPageNumbers": true, "showDate": true}}', false, true),
('Construction Schedule', 'Specialized layout for construction projects', NULL, 'demo-project-3', '{"paperSize": "A2", "orientation": "landscape", "dateRange": {"start": "2024-01-01", "end": "2024-12-31"}, "includeTimeline": true, "includeTaskTable": true, "includeNotes": false, "border": true, "frame": true, "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20}, "header": {"enabled": true, "title": "Construction Schedule", "showDate": true}, "footer": {"enabled": true, "showPageNumbers": true, "showDate": true}}', false, true);

-- =====================================================
-- STEP 7: Verify setup
-- =====================================================

-- Check tables exist
SELECT 
    'Tables created:' as info,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'chat_%';

-- Check RLS is enabled
SELECT 
    'RLS status:' as info,
    tablename,
    CASE 
        WHEN relrowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE tablename LIKE 'chat_%'
ORDER BY tablename;

-- Check policies
SELECT 
    'Policies:' as info,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename LIKE 'chat_%'
ORDER BY tablename, policyname;

-- Test data access
SELECT 
    'Demo channels:' as info,
    COUNT(*) as count
FROM chat_channels;

SELECT 
    'Demo messages:' as info,
    COUNT(*) as count
FROM chat_messages;

SELECT 
    'Demo presence:' as info,
    COUNT(*) as count
FROM chat_presence; 

-- RLS policies for asta_format_presets
CREATE POLICY "Users can view their own format presets" ON asta_format_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own format presets" ON asta_format_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own format presets" ON asta_format_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own format presets" ON asta_format_presets
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for print_profiles
CREATE POLICY "Users can view their own print profiles" ON print_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own print profiles" ON print_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own print profiles" ON print_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own print profiles" ON print_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 6: Insert demo data
-- ===================================================== 

-- Print Profile Manager Tables
CREATE TABLE IF NOT EXISTS print_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Reschedule Engine Tables
CREATE TABLE IF NOT EXISTS reschedule_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES asta_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL, -- 'forward_pass', 'backward_pass', 'full_reschedule'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    settings JSONB NOT NULL DEFAULT '{}', -- reschedule options
    changes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS reschedule_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES reschedule_operations(id) ON DELETE CASCADE,
    task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL, -- 'start_date', 'end_date', 'duration'
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(50) NOT NULL, -- 'moved_forward', 'moved_backward', 'duration_changed'
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reschedule tables
CREATE INDEX IF NOT EXISTS idx_reschedule_operations_project_id ON reschedule_operations(project_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_operations_user_id ON reschedule_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_operations_status ON reschedule_operations(status);
CREATE INDEX IF NOT EXISTS idx_reschedule_changes_operation_id ON reschedule_changes(operation_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_changes_task_id ON reschedule_changes(task_id);

-- Triggers for reschedule tables
CREATE OR REPLACE FUNCTION update_reschedule_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reschedule_operations_updated_at
    BEFORE UPDATE ON reschedule_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_reschedule_operations_updated_at();

-- RLS Policies for reschedule tables
ALTER TABLE reschedule_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedule_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reschedule operations" ON reschedule_operations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reschedule operations" ON reschedule_operations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reschedule operations" ON reschedule_operations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view changes for their operations" ON reschedule_changes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reschedule_operations 
            WHERE id = reschedule_changes.operation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert changes for their operations" ON reschedule_changes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reschedule_operations 
            WHERE id = reschedule_changes.operation_id 
            AND user_id = auth.uid()
        )
    );

-- Demo data for reschedule operations
INSERT INTO reschedule_operations (id, project_id, user_id, operation_type, status, settings, changes_count, created_at, completed_at) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'full_reschedule', 'completed', '{"skip_weekends": true, "respect_constraints": true}', 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'forward_pass', 'completed', '{"skip_weekends": true}', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 hours');

-- Demo data for reschedule changes
INSERT INTO reschedule_changes (id, operation_id, task_id, field_name, old_value, new_value, change_type, reason) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'start_date', '2024-01-15', '2024-01-16', 'moved_forward', 'Dependency constraint'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'end_date', '2024-02-15', '2024-02-18', 'moved_forward', 'Weekend skipped'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'duration', '10', '12', 'duration_changed', 'Resource availability'); 

-- =====================================================
-- PERMISSIONS SYSTEM TABLES
-- =====================================================

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

-- Permission matrix table for custom role configurations
CREATE TABLE IF NOT EXISTS permission_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    matrix JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-specific user permissions
CREATE TABLE IF NOT EXISTS project_user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES asta_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT '{}',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

-- Permission audit log
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    target_project_id UUID REFERENCES asta_projects(id),
    permission TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for permissions tables
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_project_user_permissions_project_id ON project_user_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_user_permissions_user_id ON project_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created_at ON permission_audit_log(created_at);

-- Triggers for permissions tables
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

CREATE OR REPLACE FUNCTION update_permission_matrix_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_permission_matrix_updated_at
    BEFORE UPDATE ON permission_matrix
    FOR EACH ROW
    EXECUTE FUNCTION update_permission_matrix_updated_at();

-- RLS Policies for permissions tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert user roles" ON user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update user roles" ON user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete user roles" ON user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Permission matrix policies
CREATE POLICY "Admins can view permission matrix" ON permission_matrix
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage permission matrix" ON permission_matrix
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Project user permissions policies
CREATE POLICY "Users can view their own project permissions" ON project_user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project managers can view project permissions" ON project_user_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('project_manager', 'admin')
        )
    );

CREATE POLICY "Admins can manage project permissions" ON project_user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Permission audit log policies
CREATE POLICY "Admins can view audit log" ON permission_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert audit log" ON permission_audit_log
    FOR INSERT WITH CHECK (true);

-- Insert default permission matrix
INSERT INTO permission_matrix (name, description, matrix) VALUES (
    'default',
    'Default permission matrix for Asta PowerProject',
    '{
        "viewer": {
            "view_projects": true,
            "edit_projects": false,
            "delete_projects": false,
            "create_projects": false,
            "view_tasks": true,
            "edit_tasks": false,
            "delete_tasks": false,
            "create_tasks": false,
            "view_links": true,
            "edit_links": false,
            "delete_links": false,
            "create_links": false,
            "view_resources": true,
            "edit_resources": false,
            "delete_resources": false,
            "create_resources": false,
            "view_reports": true,
            "export_data": false,
            "import_data": false,
            "manage_users": false,
            "manage_roles": false,
            "view_analytics": true,
            "edit_analytics": false,
            "view_settings": false,
            "edit_settings": false,
            "view_activity_log": true,
            "delete_activity_log": false
        },
        "project_manager": {
            "view_projects": true,
            "edit_projects": true,
            "delete_projects": false,
            "create_projects": true,
            "view_tasks": true,
            "edit_tasks": true,
            "delete_tasks": true,
            "create_tasks": true,
            "view_links": true,
            "edit_links": true,
            "delete_links": true,
            "create_links": true,
            "view_resources": true,
            "edit_resources": true,
            "delete_resources": false,
            "create_resources": true,
            "view_reports": true,
            "export_data": true,
            "import_data": true,
            "manage_users": false,
            "manage_roles": false,
            "view_analytics": true,
            "edit_analytics": true,
            "view_settings": true,
            "edit_settings": true,
            "view_activity_log": true,
            "delete_activity_log": false
        },
        "admin": {
            "view_projects": true,
            "edit_projects": true,
            "delete_projects": true,
            "create_projects": true,
            "view_tasks": true,
            "edit_tasks": true,
            "delete_tasks": true,
            "create_tasks": true,
            "view_links": true,
            "edit_links": true,
            "delete_links": true,
            "create_links": true,
            "view_resources": true,
            "edit_resources": true,
            "delete_resources": true,
            "create_resources": true,
            "view_reports": true,
            "export_data": true,
            "import_data": true,
            "manage_users": true,
            "manage_roles": true,
            "view_analytics": true,
            "edit_analytics": true,
            "view_settings": true,
            "edit_settings": true,
            "view_activity_log": true,
            "delete_activity_log": true
        }
    }'
) ON CONFLICT (name) DO NOTHING;

-- Insert demo user roles
INSERT INTO user_roles (user_id, role, permissions) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin', ARRAY[
        'view_projects', 'edit_projects', 'delete_projects', 'create_projects',
        'view_tasks', 'edit_tasks', 'delete_tasks', 'create_tasks',
        'view_links', 'edit_links', 'delete_links', 'create_links',
        'view_resources', 'edit_resources', 'delete_resources', 'create_resources',
        'view_reports', 'export_data', 'import_data',
        'manage_users', 'manage_roles',
        'view_analytics', 'edit_analytics',
        'view_settings', 'edit_settings',
        'view_activity_log', 'delete_activity_log'
    ]),
    ('00000000-0000-0000-0000-000000000002', 'project_manager', ARRAY[
        'view_projects', 'edit_projects', 'create_projects',
        'view_tasks', 'edit_tasks', 'delete_tasks', 'create_tasks',
        'view_links', 'edit_links', 'delete_links', 'create_links',
        'view_resources', 'edit_resources', 'create_resources',
        'view_reports', 'export_data', 'import_data',
        'view_analytics', 'edit_analytics',
        'view_settings', 'edit_settings',
        'view_activity_log'
    ]),
    ('00000000-0000-0000-0000-000000000003', 'viewer', ARRAY[
        'view_projects', 'view_tasks', 'view_links', 'view_resources',
        'view_reports', 'view_analytics', 'view_activity_log'
    ])
ON CONFLICT (user_id) DO NOTHING;

-- Insert demo project-specific permissions
INSERT INTO project_user_permissions (project_id, user_id, permissions) VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', ARRAY['edit_tasks', 'create_tasks', 'delete_tasks']),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', ARRAY['view_tasks', 'edit_tasks']),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', ARRAY['view_tasks'])
ON CONFLICT (project_id, user_id) DO NOTHING; 

-- =====================================================
-- AUDIT TRAIL TABLES
-- =====================================================

-- Programme Audit Logs table
CREATE TABLE IF NOT EXISTS programme_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES asta_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    before JSONB,
    after JSONB,
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_programme_audit_logs_project_id ON programme_audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_audit_logs_task_id ON programme_audit_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_audit_logs_user_id ON programme_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_programme_audit_logs_action_type ON programme_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_programme_audit_logs_created_at ON programme_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_programme_audit_logs_demo ON programme_audit_logs(demo);

-- RLS Policies for audit logs
ALTER TABLE programme_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for projects they have access to
CREATE POLICY "Users can view project audit logs" ON programme_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_audit_logs.project_id 
            AND (
                created_by = auth.uid() OR 
                assigned_to = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM asta_tasks 
                    WHERE project_id = asta_projects.id 
                    AND assigned_to = auth.uid()
                )
            )
        )
    );

-- Users can insert audit logs for projects they have access to
CREATE POLICY "Users can insert project audit logs" ON programme_audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_audit_logs.project_id 
            AND (
                created_by = auth.uid() OR 
                assigned_to = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM asta_tasks 
                    WHERE project_id = asta_projects.id 
                    AND assigned_to = auth.uid()
                )
            )
        )
    );

-- Only admins can delete audit logs
CREATE POLICY "Admins can delete audit logs" ON programme_audit_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_programme_audit_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_programme_audit_logs_updated_at
    BEFORE UPDATE ON programme_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_programme_audit_logs_updated_at(); 

-- =====================================================
-- PROGRAMME WORKING CALENDARS TABLES
-- =====================================================

-- Programme Calendars table
CREATE TABLE IF NOT EXISTS programme_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Default',
    workdays TEXT[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift_start VARCHAR(5) NOT NULL DEFAULT '08:00',
    shift_end VARCHAR(5) NOT NULL DEFAULT '16:00',
    use_global_holidays BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    demo BOOLEAN DEFAULT false,
    UNIQUE(project_id, name)
);

-- Programme Calendar Exceptions table
CREATE TABLE IF NOT EXISTS programme_calendar_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES programme_calendars(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('non-working', 'custom-shift')),
    custom_shift_start VARCHAR(5),
    custom_shift_end VARCHAR(5),
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    demo BOOLEAN DEFAULT false,
    UNIQUE(calendar_id, date)
);

-- Global Holidays table (for system-wide holidays)
CREATE TABLE IF NOT EXISTS global_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    country VARCHAR(3) DEFAULT 'GBR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, country)
);

-- Indexes for programme calendars
CREATE INDEX IF NOT EXISTS idx_programme_calendars_project_id ON programme_calendars(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_calendars_name ON programme_calendars(name);
CREATE INDEX IF NOT EXISTS idx_programme_calendars_demo ON programme_calendars(demo);
CREATE INDEX IF NOT EXISTS idx_programme_calendars_created_at ON programme_calendars(created_at);

-- Indexes for programme calendar exceptions
CREATE INDEX IF NOT EXISTS idx_programme_calendar_exceptions_calendar_id ON programme_calendar_exceptions(calendar_id);
CREATE INDEX IF NOT EXISTS idx_programme_calendar_exceptions_date ON programme_calendar_exceptions(date);
CREATE INDEX IF NOT EXISTS idx_programme_calendar_exceptions_type ON programme_calendar_exceptions(type);
CREATE INDEX IF NOT EXISTS idx_programme_calendar_exceptions_demo ON programme_calendar_exceptions(demo);

-- Indexes for global holidays
CREATE INDEX IF NOT EXISTS idx_global_holidays_date ON global_holidays(date);
CREATE INDEX IF NOT EXISTS idx_global_holidays_country ON global_holidays(country);
CREATE INDEX IF NOT EXISTS idx_global_holidays_is_active ON global_holidays(is_active);

-- RLS Policies for programme_calendars
ALTER TABLE programme_calendars ENABLE ROW LEVEL SECURITY;

-- Users can view calendars for projects they have access to
CREATE POLICY "Users can view programme calendars" ON programme_calendars
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_calendars.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.view' = ANY(permissions)
            ))
        )
    );

-- Users can insert calendars if they have edit permission
CREATE POLICY "Users can insert programme calendars" ON programme_calendars
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_calendars.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.edit' = ANY(permissions)
            ))
        )
    );

-- Users can update calendars if they have edit permission
CREATE POLICY "Users can update programme calendars" ON programme_calendars
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_calendars.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.edit' = ANY(permissions)
            ))
        )
    );

-- Users can delete calendars if they have edit permission
CREATE POLICY "Users can delete programme calendars" ON programme_calendars
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_calendars.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.edit' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for programme_calendar_exceptions
ALTER TABLE programme_calendar_exceptions ENABLE ROW LEVEL SECURITY;

-- Users can view exceptions for calendars they have access to
CREATE POLICY "Users can view programme calendar exceptions" ON programme_calendar_exceptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM programme_calendars pc
            JOIN asta_projects ap ON pc.project_id = ap.id
            WHERE pc.id = programme_calendar_exceptions.calendar_id
            AND (ap.manager_id = auth.uid() OR ap.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.view' = ANY(permissions)
            ))
        )
    );

-- Users can insert exceptions if they have edit permission
CREATE POLICY "Users can insert programme calendar exceptions" ON programme_calendar_exceptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM programme_calendars pc
            JOIN asta_projects ap ON pc.project_id = ap.id
            WHERE pc.id = programme_calendar_exceptions.calendar_id
            AND (ap.manager_id = auth.uid() OR ap.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.edit' = ANY(permissions)
            ))
        )
    );

-- Users can update exceptions if they have edit permission
CREATE POLICY "Users can update programme calendar exceptions" ON programme_calendar_exceptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM programme_calendars pc
            JOIN asta_projects ap ON pc.project_id = ap.id
            WHERE pc.id = programme_calendar_exceptions.calendar_id
            AND (ap.manager_id = auth.uid() OR ap.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.edit' = ANY(permissions)
            ))
        )
    );

-- Users can delete exceptions if they have edit permission
CREATE POLICY "Users can delete programme calendar exceptions" ON programme_calendar_exceptions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM programme_calendars pc
            JOIN asta_projects ap ON pc.project_id = ap.id
            WHERE pc.id = programme_calendar_exceptions.calendar_id
            AND (ap.manager_id = auth.uid() OR ap.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.calendar.edit' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for global_holidays (read-only for all authenticated users)
ALTER TABLE global_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view global holidays" ON global_holidays
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert some default UK holidays for 2024-2025
INSERT INTO global_holidays (name, date, country) VALUES
    ('New Year''s Day', '2024-01-01', 'GBR'),
    ('Good Friday', '2024-03-29', 'GBR'),
    ('Easter Monday', '2024-04-01', 'GBR'),
    ('Early May Bank Holiday', '2024-05-06', 'GBR'),
    ('Spring Bank Holiday', '2024-05-27', 'GBR'),
    ('Summer Bank Holiday', '2024-08-26', 'GBR'),
    ('Christmas Day', '2024-12-25', 'GBR'),
    ('Boxing Day', '2024-12-26', 'GBR'),
    ('New Year''s Day', '2025-01-01', 'GBR'),
    ('Good Friday', '2025-04-18', 'GBR'),
    ('Easter Monday', '2025-04-21', 'GBR'),
    ('Early May Bank Holiday', '2025-05-05', 'GBR'),
    ('Spring Bank Holiday', '2025-05-26', 'GBR'),
    ('Summer Bank Holiday', '2025-08-25', 'GBR'),
    ('Christmas Day', '2025-12-25', 'GBR'),
    ('Boxing Day', '2025-12-26', 'GBR')
ON CONFLICT (date, country) DO NOTHING;

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_programme_calendars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_programme_calendars_updated_at
    BEFORE UPDATE ON programme_calendars
    FOR EACH ROW
    EXECUTE FUNCTION update_programme_calendars_updated_at();

CREATE OR REPLACE FUNCTION update_global_holidays_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_global_holidays_updated_at
    BEFORE UPDATE ON global_holidays
    FOR EACH ROW
    EXECUTE FUNCTION update_global_holidays_updated_at();

-- =====================================================
-- TIMELINE ZOOM SETTINGS TABLES
-- =====================================================

-- Timeline Zoom Settings table
CREATE TABLE IF NOT EXISTS timeline_zoom_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id VARCHAR(255) NOT NULL,
    zoom_level VARCHAR(20) NOT NULL CHECK (zoom_level IN ('hour', 'day', 'week', 'month')),
    scroll_position_x INTEGER DEFAULT 0,
    scroll_position_y INTEGER DEFAULT 0,
    visible_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
    visible_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
    demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Indexes for timeline zoom settings
CREATE INDEX IF NOT EXISTS idx_timeline_zoom_settings_user_id ON timeline_zoom_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_zoom_settings_project_id ON timeline_zoom_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_zoom_settings_zoom_level ON timeline_zoom_settings(zoom_level);
CREATE INDEX IF NOT EXISTS idx_timeline_zoom_settings_demo ON timeline_zoom_settings(demo);
CREATE INDEX IF NOT EXISTS idx_timeline_zoom_settings_updated_at ON timeline_zoom_settings(updated_at);

-- RLS Policies for timeline_zoom_settings
ALTER TABLE timeline_zoom_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own zoom settings
CREATE POLICY "Users can view their own timeline zoom settings" ON timeline_zoom_settings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own zoom settings
CREATE POLICY "Users can insert their own timeline zoom settings" ON timeline_zoom_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own zoom settings
CREATE POLICY "Users can update their own timeline zoom settings" ON timeline_zoom_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own zoom settings
CREATE POLICY "Users can delete their own timeline zoom settings" ON timeline_zoom_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at column
CREATE OR REPLACE FUNCTION update_timeline_zoom_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timeline_zoom_settings_updated_at
    BEFORE UPDATE ON timeline_zoom_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timeline_zoom_settings_updated_at();

-- =====================================================
-- END OF TIMELINE ZOOM SETTINGS TABLES
-- =====================================================

-- =====================================================
-- END OF PROGRAMME WORKING CALENDARS TABLES
-- =====================================================

-- =====================================================
-- PROGRAMME TASK TAGS TABLES
-- =====================================================

-- Programme Tags table
CREATE TABLE IF NOT EXISTS programme_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Hex color code
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_global BOOLEAN DEFAULT false,
    project_id UUID REFERENCES asta_projects(id) ON DELETE CASCADE,
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(label, project_id) -- Prevent duplicate labels within a project
);

-- Add tagId column to asta_tasks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asta_tasks' AND column_name = 'tag_id') THEN
        ALTER TABLE asta_tasks ADD COLUMN tag_id UUID REFERENCES programme_tags(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes for programme tags
CREATE INDEX IF NOT EXISTS idx_programme_tags_project_id ON programme_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_tags_created_by ON programme_tags(created_by);
CREATE INDEX IF NOT EXISTS idx_programme_tags_is_global ON programme_tags(is_global);
CREATE INDEX IF NOT EXISTS idx_programme_tags_demo ON programme_tags(demo);
CREATE INDEX IF NOT EXISTS idx_programme_tags_label ON programme_tags(label);

-- Index for asta_tasks tag_id
CREATE INDEX IF NOT EXISTS idx_asta_tasks_tag_id ON asta_tasks(tag_id);

-- RLS Policies for programme tags
ALTER TABLE programme_tags ENABLE ROW LEVEL SECURITY;

-- Users can view tags for projects they have access to
CREATE POLICY "Users can view programme tags" ON programme_tags
    FOR SELECT USING (
        is_global = true OR EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.tag.view' = ANY(permissions)
            ))
        )
    );

-- Users can create tags if they have tag manage permissions
CREATE POLICY "Users can create programme tags" ON programme_tags
    FOR INSERT WITH CHECK (
        is_global = false AND EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.tag.manage' = ANY(permissions)
            ))
        )
    );

-- Users can update tags if they have tag manage permissions
CREATE POLICY "Users can update programme tags" ON programme_tags
    FOR UPDATE USING (
        is_global = false AND EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.tag.manage' = ANY(permissions)
            ))
        )
    );

-- Users can delete tags if they have tag manage permissions
CREATE POLICY "Users can delete programme tags" ON programme_tags
    FOR DELETE USING (
        is_global = false AND EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_tags.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.tag.manage' = ANY(permissions)
            ))
        )
    );

-- Trigger for programme tags updated_at
CREATE OR REPLACE FUNCTION update_programme_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programme_tags_updated_at 
    BEFORE UPDATE ON programme_tags 
    FOR EACH ROW EXECUTE FUNCTION update_programme_tags_updated_at();

-- =====================================================
-- END OF PROGRAMME TASK TAGS TABLES
-- ===================================================== 

-- =====================================================
-- CUSTOM FIELDS SETUP
-- =====================================================

-- Programme Custom Fields table
CREATE TABLE IF NOT EXISTS programme_custom_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'date', 'dropdown')),
    options TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    is_visible_in_grid BOOLEAN DEFAULT true,
    is_visible_in_modal BOOLEAN DEFAULT true,
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programme Task Custom Values table
CREATE TABLE IF NOT EXISTS programme_task_custom_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL,
    custom_field_id UUID NOT NULL REFERENCES programme_custom_fields(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, custom_field_id)
);

-- Create indexes for custom fields
CREATE INDEX IF NOT EXISTS idx_programme_custom_fields_project_id ON programme_custom_fields(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_custom_fields_created_by ON programme_custom_fields(created_by);
CREATE INDEX IF NOT EXISTS idx_programme_custom_fields_type ON programme_custom_fields(type);
CREATE INDEX IF NOT EXISTS idx_programme_custom_fields_is_visible_in_grid ON programme_custom_fields(is_visible_in_grid);
CREATE INDEX IF NOT EXISTS idx_programme_custom_fields_is_visible_in_modal ON programme_custom_fields(is_visible_in_modal);
CREATE INDEX IF NOT EXISTS idx_programme_custom_fields_demo ON programme_custom_fields(demo);

-- Create indexes for custom field values
CREATE INDEX IF NOT EXISTS idx_programme_task_custom_values_task_id ON programme_task_custom_values(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_custom_values_custom_field_id ON programme_task_custom_values(custom_field_id);

-- Create updated_at triggers
CREATE TRIGGER update_programme_custom_fields_updated_at 
    BEFORE UPDATE ON programme_custom_fields 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programme_task_custom_values_updated_at 
    BEFORE UPDATE ON programme_task_custom_values 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for programme_custom_fields
ALTER TABLE programme_custom_fields ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view custom fields for projects they have access to
CREATE POLICY "Users can view custom fields for accessible projects" ON programme_custom_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE asta_projects.id = programme_custom_fields.project_id
            AND (
                asta_projects.created_by = auth.uid() 
                OR asta_projects.assigned_to = auth.uid()
                OR asta_projects.demo = true
            )
        )
    );

-- Policy: Users can create custom fields for projects they own or manage
CREATE POLICY "Users can create custom fields for owned projects" ON programme_custom_fields
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE asta_projects.id = programme_custom_fields.project_id
            AND asta_projects.created_by = auth.uid()
        )
        AND created_by = auth.uid()
    );

-- Policy: Users can update custom fields for projects they own
CREATE POLICY "Users can update custom fields for owned projects" ON programme_custom_fields
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE asta_projects.id = programme_custom_fields.project_id
            AND asta_projects.created_by = auth.uid()
        )
    );

-- Policy: Users can delete custom fields for projects they own
CREATE POLICY "Users can delete custom fields for owned projects" ON programme_custom_fields
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE asta_projects.id = programme_custom_fields.project_id
            AND asta_projects.created_by = auth.uid()
        )
    );

-- RLS Policies for programme_task_custom_values
ALTER TABLE programme_task_custom_values ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view custom field values for tasks they have access to
CREATE POLICY "Users can view custom field values for accessible tasks" ON programme_task_custom_values
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks 
            WHERE asta_tasks.id = programme_task_custom_values.task_id
            AND (
                asta_tasks.created_by = auth.uid() 
                OR asta_tasks.assigned_to = auth.uid()
                OR asta_tasks.demo = true
            )
        )
    );

-- Policy: Users can insert custom field values for tasks they can edit
CREATE POLICY "Users can insert custom field values for editable tasks" ON programme_task_custom_values
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_tasks 
            WHERE asta_tasks.id = programme_task_custom_values.task_id
            AND (
                asta_tasks.created_by = auth.uid() 
                OR asta_tasks.assigned_to = auth.uid()
            )
        )
    );

-- Policy: Users can update custom field values for tasks they can edit
CREATE POLICY "Users can update custom field values for editable tasks" ON programme_task_custom_values
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_tasks 
            WHERE asta_tasks.id = programme_task_custom_values.task_id
            AND (
                asta_tasks.created_by = auth.uid() 
                OR asta_tasks.assigned_to = auth.uid()
            )
        )
    );

-- Policy: Users can delete custom field values for tasks they can edit
CREATE POLICY "Users can delete custom field values for editable tasks" ON programme_task_custom_values
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_tasks 
            WHERE asta_tasks.id = programme_task_custom_values.task_id
            AND (
                asta_tasks.created_by = auth.uid() 
                OR asta_tasks.assigned_to = auth.uid()
            )
        )
    );

-- =====================================================
-- END OF CUSTOM FIELDS SETUP
-- =====================================================

-- =====================================================
-- TASK COMMENTS & HISTORY TABLES
-- =====================================================

-- Programme Task Comments table
CREATE TABLE IF NOT EXISTS programme_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES programme_task_comments(id) ON DELETE CASCADE,
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programme Task History table
CREATE TABLE IF NOT EXISTS programme_task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_changed VARCHAR(100) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for task comments
CREATE INDEX IF NOT EXISTS idx_programme_task_comments_task_id ON programme_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_comments_author_id ON programme_task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_comments_parent_id ON programme_task_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_comments_created_at ON programme_task_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_programme_task_comments_demo ON programme_task_comments(demo);

-- Indexes for task history
CREATE INDEX IF NOT EXISTS idx_programme_task_history_task_id ON programme_task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_task_history_changed_by ON programme_task_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_programme_task_history_field_changed ON programme_task_history(field_changed);
CREATE INDEX IF NOT EXISTS idx_programme_task_history_created_at ON programme_task_history(created_at);
CREATE INDEX IF NOT EXISTS idx_programme_task_history_demo ON programme_task_history(demo);

-- RLS Policies for task comments
ALTER TABLE programme_task_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments for tasks in projects they have access to
CREATE POLICY "Users can view task comments" ON programme_task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            JOIN user_roles ur ON ur.user_id = auth.uid()
            WHERE t.id = programme_task_comments.task_id
            AND ur.organization_id = p.organization_id
            AND ur.permissions ? 'programme.comments.view'
        )
    );

-- Users can create comments if they have programme.comments.create permission
CREATE POLICY "Users can create task comments" ON programme_task_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            JOIN user_roles ur ON ur.user_id = auth.uid()
            WHERE t.id = programme_task_comments.task_id
            AND ur.organization_id = p.organization_id
            AND ur.permissions ? 'programme.comments.create'
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON programme_task_comments
    FOR UPDATE USING (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON programme_task_comments
    FOR DELETE USING (author_id = auth.uid());

-- RLS Policies for task history
ALTER TABLE programme_task_history ENABLE ROW LEVEL SECURITY;

-- Users can view history for tasks in projects they have access to
CREATE POLICY "Users can view task history" ON programme_task_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks t
            JOIN asta_projects p ON t.project_id = p.id
            JOIN user_roles ur ON ur.user_id = auth.uid()
            WHERE t.id = programme_task_history.task_id
            AND ur.organization_id = p.organization_id
            AND ur.permissions ? 'programme.audit.view'
        )
    );

-- System can insert history records (triggered by task updates)
CREATE POLICY "System can insert task history" ON programme_task_history
    FOR INSERT WITH CHECK (true);

-- Trigger to update task comments updated_at column
CREATE OR REPLACE FUNCTION update_programme_task_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_programme_task_comments_updated_at
    BEFORE UPDATE ON programme_task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_programme_task_comments_updated_at();

-- =====================================================
-- END OF TASK COMMENTS & HISTORY TABLES
-- ===================================================== 

-- =====================================================
-- PROGRAMME VERSIONING TABLES
-- =====================================================

-- Programme Versions table
CREATE TABLE IF NOT EXISTS programme_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_auto_snapshot BOOLEAN DEFAULT false,
    notes TEXT,
    demo BOOLEAN DEFAULT false
);

-- Programme Version Data table
CREATE TABLE IF NOT EXISTS programme_version_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES programme_versions(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES asta_tasks(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL, -- Contains all task data at time of snapshot
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programme Version Preferences table
CREATE TABLE IF NOT EXISTS programme_version_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    auto_snapshot_enabled BOOLEAN DEFAULT false,
    auto_snapshot_interval INTEGER DEFAULT 24, -- hours
    max_versions_per_project INTEGER DEFAULT 50,
    demo BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Indexes for programme versions
CREATE INDEX IF NOT EXISTS idx_programme_versions_project_id ON programme_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_versions_created_by ON programme_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_programme_versions_created_at ON programme_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_programme_versions_is_auto_snapshot ON programme_versions(is_auto_snapshot);
CREATE INDEX IF NOT EXISTS idx_programme_versions_demo ON programme_versions(demo);

-- Indexes for programme version data
CREATE INDEX IF NOT EXISTS idx_programme_version_data_version_id ON programme_version_data(version_id);
CREATE INDEX IF NOT EXISTS idx_programme_version_data_task_id ON programme_version_data(task_id);
CREATE INDEX IF NOT EXISTS idx_programme_version_data_demo ON programme_version_data(demo);

-- Indexes for programme version preferences
CREATE INDEX IF NOT EXISTS idx_programme_version_preferences_user_id ON programme_version_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_programme_version_preferences_project_id ON programme_version_preferences(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_version_preferences_demo ON programme_version_preferences(demo);

-- RLS Policies for programme versions
ALTER TABLE programme_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions for projects they have access to
CREATE POLICY "Users can view programme versions" ON programme_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_versions.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.view' = ANY(permissions)
            ))
        )
    );

-- Users can create versions if they have create permission
CREATE POLICY "Users can create programme versions" ON programme_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_versions.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.create' = ANY(permissions)
            ))
        )
    );

-- Users can update versions if they have manage permission
CREATE POLICY "Users can update programme versions" ON programme_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_versions.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.manage' = ANY(permissions)
            ))
        )
    );

-- Users can delete versions if they have manage permission
CREATE POLICY "Users can delete programme versions" ON programme_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_versions.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.manage' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for programme version data
ALTER TABLE programme_version_data ENABLE ROW LEVEL SECURITY;

-- Users can view version data for versions they can access
CREATE POLICY "Users can view programme version data" ON programme_version_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM programme_versions v
            JOIN asta_projects p ON v.project_id = p.id
            WHERE v.id = programme_version_data.version_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.view' = ANY(permissions)
            ))
        )
    );

-- Users can create version data if they can create versions
CREATE POLICY "Users can create programme version data" ON programme_version_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM programme_versions v
            JOIN asta_projects p ON v.project_id = p.id
            WHERE v.id = programme_version_data.version_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.create' = ANY(permissions)
            ))
        )
    );

-- Users can update version data if they can manage versions
CREATE POLICY "Users can update programme version data" ON programme_version_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM programme_versions v
            JOIN asta_projects p ON v.project_id = p.id
            WHERE v.id = programme_version_data.version_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.manage' = ANY(permissions)
            ))
        )
    );

-- Users can delete version data if they can manage versions
CREATE POLICY "Users can delete programme version data" ON programme_version_data
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM programme_versions v
            JOIN asta_projects p ON v.project_id = p.id
            WHERE v.id = programme_version_data.version_id
            AND (p.manager_id = auth.uid() OR p.id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.version.manage' = ANY(permissions)
            ))
        )
    );

-- RLS Policies for programme version preferences
ALTER TABLE programme_version_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view programme version preferences" ON programme_version_preferences
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own preferences
CREATE POLICY "Users can create programme version preferences" ON programme_version_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update programme version preferences" ON programme_version_preferences
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own preferences
CREATE POLICY "Users can delete programme version preferences" ON programme_version_preferences
    FOR DELETE USING (user_id = auth.uid());

-- Triggers for programme versioning tables
CREATE TRIGGER update_programme_versions_updated_at 
    BEFORE UPDATE ON programme_versions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programme_version_data_updated_at 
    BEFORE UPDATE ON programme_version_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programme_version_preferences_updated_at 
    BEFORE UPDATE ON programme_version_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PROGRAMME BAR STYLES TABLES
-- =====================================================

-- Programme Bar Styles table
CREATE TABLE IF NOT EXISTS programme_bar_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    condition JSONB NOT NULL, -- { field: string, operator: '=' | '!=' | 'contains', value: string }
    style JSONB NOT NULL, -- { barColor: string, borderColor: string, textColor: string, pattern?: 'dashed' | 'solid' | 'none' }
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false, -- system-applied (e.g. critical path)
    demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for programme bar styles
CREATE INDEX IF NOT EXISTS idx_programme_bar_styles_project_id ON programme_bar_styles(project_id);
CREATE INDEX IF NOT EXISTS idx_programme_bar_styles_created_by ON programme_bar_styles(created_by);
CREATE INDEX IF NOT EXISTS idx_programme_bar_styles_is_default ON programme_bar_styles(is_default);
CREATE INDEX IF NOT EXISTS idx_programme_bar_styles_demo ON programme_bar_styles(demo);
CREATE INDEX IF NOT EXISTS idx_programme_bar_styles_created_at ON programme_bar_styles(created_at);

-- RLS Policies for programme bar styles
ALTER TABLE programme_bar_styles ENABLE ROW LEVEL SECURITY;

-- Users can view bar styles for projects they have access to
CREATE POLICY "Users can view programme bar styles" ON programme_bar_styles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_bar_styles.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.barstyles.view' = ANY(permissions)
            ))
        )
    );

-- Users can create bar styles if they have manage permission
CREATE POLICY "Users can create programme bar styles" ON programme_bar_styles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_bar_styles.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.barstyles.manage' = ANY(permissions)
            ))
        )
    );

-- Users can update bar styles if they have manage permission
CREATE POLICY "Users can update programme bar styles" ON programme_bar_styles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_bar_styles.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.barstyles.manage' = ANY(permissions)
            ))
        )
    );

-- Users can delete bar styles if they have manage permission
CREATE POLICY "Users can delete programme bar styles" ON programme_bar_styles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM asta_projects 
            WHERE id = programme_bar_styles.project_id 
            AND (manager_id = auth.uid() OR id IN (
                SELECT project_id FROM project_user_permissions 
                WHERE user_id = auth.uid() AND 'programme.barstyles.manage' = ANY(permissions)
            ))
        )
    );

-- Trigger for programme bar styles updated_at
CREATE OR REPLACE FUNCTION update_programme_bar_styles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programme_bar_styles_updated_at 
    BEFORE UPDATE ON programme_bar_styles 
    FOR EACH ROW EXECUTE FUNCTION update_programme_bar_styles_updated_at();

-- Insert default bar styles for demo projects
INSERT INTO programme_bar_styles (id, project_id, rule_name, condition, style, created_by, is_default, demo) VALUES
-- Critical path style
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Critical Path', 
 '{"field": "isCritical", "operator": "=", "value": "true"}',
 '{"barColor": "#EF4444", "borderColor": "#DC2626", "textColor": "#FFFFFF", "pattern": "solid"}',
 '00000000-0000-0000-0000-000000000001', true, true),

-- Milestone style
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Milestones', 
 '{"field": "type", "operator": "=", "value": "milestone"}',
 '{"barColor": "#8B5CF6", "borderColor": "#7C3AED", "textColor": "#FFFFFF", "pattern": "solid"}',
 '00000000-0000-0000-0000-000000000001', true, true),

-- Snagging tasks style
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Snagging Tasks', 
 '{"field": "tagId", "operator": "contains", "value": "snagging"}',
 '{"barColor": "#F97316", "borderColor": "#EA580C", "textColor": "#FFFFFF", "pattern": "dashed"}',
 '00000000-0000-0000-0000-000000000001', false, true)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- END OF PROGRAMME BAR STYLES TABLES
-- =====================================================

-- =====================================================
-- DEMO DATA FOR CONSTRAINTS
-- =====================================================

-- Insert demo constraint data
INSERT INTO programme_tasks (project_id, task_id, constraint_type, constraint_date, constraint_reason, demo, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'demo_task_1', 'SNET', (CURRENT_DATE + INTERVAL '7 days'), 'Material delivery scheduled', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'demo_task_2', 'SNET', (CURRENT_DATE + INTERVAL '14 days'), 'Site preparation required', true, NOW(), NOW())
ON CONFLICT (task_id) DO NOTHING;