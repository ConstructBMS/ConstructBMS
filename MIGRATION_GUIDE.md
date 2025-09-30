# 🚀 Sticky Notes Database Migration Guide

## 📋 **Quick Migration Steps**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard/project/cowaiflapeowmvzthoto)**
2. **Navigate to SQL Editor**
3. **Copy and paste the following SQL:**

```sql
-- Simple Sticky Notes Migration (Safe Version)
-- This version doesn't require projects or opportunities tables

-- Add color column for sticky notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'pink', 'blue', 'gray', 'green', 'orange', 'purple', 'red', 'teal', 'indigo', 'lime', 'rose'));

-- Add positioning columns for grid layout
ALTER TABLE notes ADD COLUMN IF NOT EXISTS position_x INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS position_y INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS width INTEGER DEFAULT 2;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 2;

-- Add category for organization
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add project and opportunity references (optional UUIDs, no foreign keys)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS opportunity_id UUID;

-- Add attachments support
CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'document')),
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_notes_color ON notes(color);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_opportunity_id ON notes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON note_attachments(note_id);
```

4. **Click "Run" to execute the migration**
5. **✅ Migration complete!**

### **Option 2: Command Line (Alternative)**

If you have the Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the SQL directly
supabase db reset --linked
```

## 🎯 **What This Migration Does**

- **Adds Color Support**: 12 color options for sticky notes
- **Adds Positioning**: Grid layout support with x, y, width, height
- **Adds Categories**: Organization and filtering support
- **Adds Project Links**: Connect notes to projects and opportunities
- **Adds Attachments**: File upload support for notes
- **Adds Indexes**: Performance optimization for queries

## 🔧 **After Migration**

Once the migration is complete:

1. **Restart your development servers:**

   ```bash
   npm run dev:restart
   ```

2. **Test the sticky notes:**
   - Open the sticky notes modal
   - Create a new note
   - Edit a note inline
   - Change colors
   - Refresh the page - notes should persist!

## 🚨 **Troubleshooting**

### **If you get column errors:**

- The migration hasn't been applied yet
- Run the SQL in Supabase Dashboard

### **If you get relationship errors:**

- The `note_attachments` table doesn't exist
- Make sure all SQL statements were executed

### **If notes don't persist:**

- Check that the migration was successful
- Verify the columns exist in the `notes` table
- Check the browser console for errors

## ✨ **Expected Results**

After migration, you should see:

- ✅ Sticky notes persist across browser refreshes
- ✅ Color changes are saved
- ✅ Inline editing works perfectly
- ✅ All notes are stored in the database
- ✅ No more "local storage" - everything is persistent!
