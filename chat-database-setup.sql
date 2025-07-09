-- =====================================================
-- CHAT DATABASE SETUP
-- =====================================================
-- This script creates all chat-related tables with proper RLS policies
-- Run this in your Supabase SQL Editor

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
        NOT is_private
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