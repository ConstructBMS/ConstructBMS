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
      // Use notes table with sticky note columns
      let { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

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
      // Build update object with all provided fields
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (noteData.title !== undefined) updateData.title = noteData.title;
      if (noteData.content !== undefined) updateData.content = noteData.content;
      if (noteData.color !== undefined) updateData.color = noteData.color;
      if (noteData.tags !== undefined) updateData.tags = noteData.tags;
      if (noteData.position_x !== undefined) updateData.position_x = noteData.position_x;
      if (noteData.position_y !== undefined) updateData.position_y = noteData.position_y;
      if (noteData.width !== undefined) updateData.width = noteData.width;
      if (noteData.height !== undefined) updateData.height = noteData.height;

      let { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

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
