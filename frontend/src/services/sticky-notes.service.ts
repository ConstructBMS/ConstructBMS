import { supabase } from './supabase';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'gray' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'indigo' | 'lime' | 'rose';
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
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          content,
          color,
          position_x,
          position_y,
          width,
          height,
          category,
          tags,
          project_id,
          opportunity_id,
          author_id,
          created_at,
          updated_at,
          note_attachments (
            id,
            name,
            type,
            url
          )
        `)
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
      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          author_id: (await supabase.auth.getUser()).data.user?.id
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

  async updateStickyNote(id: string, noteData: UpdateStickyNoteData): Promise<StickyNote> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...noteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error updating sticky note:', error);
      throw error;
    }
  }

  async deleteStickyNote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  }

  async addAttachment(noteId: string, attachment: { name: string; type: 'image' | 'document'; url: string }): Promise<void> {
    try {
      const { error } = await supabase
        .from('note_attachments')
        .insert({
          note_id: noteId,
          ...attachment
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