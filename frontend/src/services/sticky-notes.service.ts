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
      // First try with attachments (if table exists)
      let { data, error } = await supabase
        .from('notes')
        .select(
          `
          id,
          title,
          content,
          tags,
          author_id,
          created_at,
          updated_at
        `
        )
        .order('created_at', { ascending: false });

      // If attachments table doesn't exist, try without it
      if (error && error.message.includes('relationship')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('notes')
          .select(
            `
            id,
            title,
            content,
            tags,
            author_id,
            created_at,
            updated_at
          `
          )
          .order('created_at', { ascending: false });

        if (fallbackError) {
          throw new Error(fallbackError.message);
        }

        return fallbackData || [];
      }

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
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
        // Silently fail for demo mode - don't log as error
        throw new Error('DEMO_MODE');
      }

      // Use only basic columns that exist in notes table
      let { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: noteData.content,
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
      // Check if this is a demo note (in memory only)
      if (id.startsWith('demo-') || id.includes('demo')) {
        // Return a mock response for demo notes
        return {
          id,
          title: noteData.title || 'Demo Note',
          content: noteData.content || 'Demo content',
          color: 'yellow' as const,
          position_x: 0,
          position_y: 0,
          width: 2,
          height: 2,
          tags: noteData.tags || [],
          author_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // Build update object with only the fields that are provided
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (noteData.title !== undefined) updateData.title = noteData.title;
      if (noteData.content !== undefined) updateData.content = noteData.content;
      if (noteData.tags !== undefined) updateData.tags = noteData.tags;

      let { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      // Handle any errors
      if (error) {
        console.error('Supabase update error:', error);

        // If any column doesn't exist, try with only basic columns
        if (
          error.message.includes('column') ||
          error.message.includes('does not exist')
        ) {
          const fallbackData: any = { updated_at: new Date().toISOString() };
          if (noteData.title !== undefined) fallbackData.title = noteData.title;
          if (noteData.content !== undefined)
            fallbackData.content = noteData.content;
          if (noteData.tags !== undefined) fallbackData.tags = noteData.tags;

          const { data: fallbackResult, error: fallbackError } = await supabase
            .from('notes')
            .update(fallbackData)
            .eq('id', id)
            .select()
            .single();

          if (fallbackError) {
            throw new Error(fallbackError.message);
          }

          return fallbackResult;
        }

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
