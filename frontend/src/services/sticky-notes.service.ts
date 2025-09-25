import { supabase } from './supabase';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color:
    | 'yellow'
    | 'pink'
    | 'blue'
    | 'gray'
    | 'green'
    | 'orange'
    | 'purple'
    | 'red'
    | 'teal'
    | 'indigo'
    | 'lime'
    | 'rose';
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  category?: string;
  tags: string[];
  project_id?: string;
  opportunity_id?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  note_attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'document';
    url: string;
  }>;
}

export interface CreateStickyNoteData {
  title: string;
  content: string;
  color?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  category?: string;
  tags?: string[];
  project_id?: string;
  opportunity_id?: string;
}

export interface UpdateStickyNoteData {
  title?: string;
  content?: string;
  color?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  category?: string;
  tags?: string[];
  project_id?: string;
  opportunity_id?: string;
}

class StickyNotesService {
  private baseUrl = '/api/sticky-notes';

  async getStickyNotes(): Promise<StickyNote[]> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Always use demo mode for now
      const isDemo = true;

      if (isDemo) {
        // Demo mode - get notes for demo user
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('author_id', 'demo-user-123')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        return data || [];
      } else {
        // Production mode - get all notes
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
      throw error;
    }
  }

  async createStickyNote(noteData: CreateStickyNoteData): Promise<StickyNote> {
    try {
      // Get the current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        // Check if we're in demo mode
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        // Always use demo mode when no authenticated user
        const isDemo = true;

        if (isDemo) {
          // Demo mode - use a demo user ID
          const demoUserId = 'demo-user-123';

          // Use notes table with demo user
          let { data, error } = await supabase
            .from('notes')
            .insert({
              title: noteData.title,
              content: noteData.content,
              color: noteData.color || 'yellow',
              tags: noteData.tags || [],
              author_id: demoUserId,
            })
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }

          return data;
        } else {
          // Production mode - require authentication
          throw new Error('User must be authenticated to create notes');
        }
      }

      // Use notes table with sticky note columns
      let { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: noteData.content,
          color: noteData.color || 'yellow', // Default yellow
          tags: noteData.tags || [],
          author_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating sticky note:', error);
      throw error;
    }
  }

  async updateStickyNote(
    id: string,
    noteData: UpdateStickyNoteData
  ): Promise<StickyNote> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Always use demo mode for now
      const isDemo = true;

      // Build update object with all provided fields
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (noteData.title !== undefined) updateData.title = noteData.title;
      if (noteData.content !== undefined) updateData.content = noteData.content;
      if (noteData.color !== undefined) updateData.color = noteData.color;
      if (noteData.tags !== undefined) updateData.tags = noteData.tags;
      if (noteData.position_x !== undefined)
        updateData.position_x = noteData.position_x;
      if (noteData.position_y !== undefined)
        updateData.position_y = noteData.position_y;
      if (noteData.width !== undefined) updateData.width = noteData.width;
      if (noteData.height !== undefined) updateData.height = noteData.height;

      let query = supabase.from('notes').update(updateData).eq('id', id);

      // In demo mode, also filter by demo user
      if (isDemo) {
        query = query.eq('author_id', 'demo-user-123');
      }

      let { data, error } = await query.select().single();

      // Handle any errors
      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Note not found');
      }

      return data;
    } catch (error) {
      console.error('Error updating sticky note:', error);
      throw error;
    }
  }

  async deleteStickyNote(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  }

  async addAttachment(
    noteId: string,
    attachment: { name: string; type: 'image' | 'document'; url: string }
  ): Promise<void> {
    try {
      const { error } = await supabase.from('note_attachments').insert({
        note_id: noteId,
        ...attachment,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  }

  async removeAttachment(noteId: string, attachmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('note_attachments')
        .delete()
        .eq('id', attachmentId)
        .eq('note_id', noteId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error removing attachment:', error);
      throw error;
    }
  }
}

export const stickyNotesService = new StickyNotesService();
