import { StickyNote } from '../app/store/sticky-notes.store';
import { supabase } from './supabase';

export class StickyNotesService {
  static async getNotes(): Promise<StickyNote[]> {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (
        data?.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          color: note.color,
          projectId: note.project_id,
          contactId: note.contact_id,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          isPinned: note.is_pinned,
          tags: note.tags || [],
        })) || []
      );
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
      return [];
    }
  }

  static async createNote(
    note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StickyNote> {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .insert({
          title: note.title,
          content: note.content,
          color: note.color,
          project_id: note.projectId,
          contact_id: note.contactId,
          is_pinned: note.isPinned,
          tags: note.tags,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        color: data.color,
        projectId: data.project_id,
        contactId: data.contact_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isPinned: data.is_pinned,
        tags: data.tags || [],
      };
    } catch (error) {
      console.error('Error creating sticky note:', error);
      throw error;
    }
  }

  static async updateNote(
    id: string,
    updates: Partial<StickyNote>
  ): Promise<StickyNote> {
    try {
      const updateData: any = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.projectId !== undefined)
        updateData.project_id = updates.projectId;
      if (updates.contactId !== undefined)
        updateData.contact_id = updates.contactId;
      if (updates.isPinned !== undefined)
        updateData.is_pinned = updates.isPinned;
      if (updates.tags !== undefined) updateData.tags = updates.tags;

      const { data, error } = await supabase
        .from('sticky_notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        color: data.color,
        projectId: data.project_id,
        contactId: data.contact_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isPinned: data.is_pinned,
        tags: data.tags || [],
      };
    } catch (error) {
      console.error('Error updating sticky note:', error);
      throw error;
    }
  }

  static async deleteNote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  }

  static async getNotesByProject(projectId: string): Promise<StickyNote[]> {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (
        data?.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          color: note.color,
          projectId: note.project_id,
          contactId: note.contact_id,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          isPinned: note.is_pinned,
          tags: note.tags || [],
        })) || []
      );
    } catch (error) {
      console.error('Error fetching notes by project:', error);
      return [];
    }
  }

  static async getNotesByContact(contactId: string): Promise<StickyNote[]> {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (
        data?.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          color: note.color,
          projectId: note.project_id,
          contactId: note.contact_id,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          isPinned: note.is_pinned,
          tags: note.tags || [],
        })) || []
      );
    } catch (error) {
      console.error('Error fetching notes by contact:', error);
      return [];
    }
  }
}
