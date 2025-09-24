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
      // Try with all new columns first
      let { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          author_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      // If new columns don't exist, try with basic fields only
      if (
        error &&
        (error.message.includes('column') ||
          error.message.includes('does not exist'))
      ) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('notes')
          .insert({
            title: noteData.title,
            content: noteData.content,
            author_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (fallbackError) {
          throw new Error(fallbackError.message);
        }

        return fallbackData;
      }

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

      // Build update object with only the fields that are provided
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (noteData.title !== undefined) updateData.title = noteData.title;
      if (noteData.content !== undefined) updateData.content = noteData.content;
      if (noteData.color !== undefined) updateData.color = noteData.color;
      if (noteData.category !== undefined)
        updateData.category = noteData.category;
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

        // If color column doesn't exist, try without it
        if (
          error.message.includes('color') ||
          error.message.includes('column')
        ) {
          const fallbackData: any = { updated_at: new Date().toISOString() };
          if (noteData.title !== undefined) fallbackData.title = noteData.title;
          if (noteData.content !== undefined)
            fallbackData.content = noteData.content;

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
