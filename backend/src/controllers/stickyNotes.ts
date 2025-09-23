import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

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
}

// Get all sticky notes for a user
export const getStickyNotes = async (req: Request, res: Response) => {
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
      .eq('author_id', req.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching sticky notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new sticky note
export const createStickyNote = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      color = 'yellow',
      position_x = 0,
      position_y = 0,
      width = 2,
      height = 2,
      category,
      tags = [],
      project_id,
      opportunity_id
    } = req.body;

    const { data, error } = await supabase
      .from('notes')
      .insert({
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
        author_id: req.user?.id
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating sticky note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a sticky note
export const updateStickyNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
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
      opportunity_id
    } = req.body;

    const { data, error } = await supabase
      .from('notes')
      .update({
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
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('author_id', req.user?.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Sticky note not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating sticky note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a sticky note
export const deleteStickyNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('author_id', req.user?.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting sticky note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add attachment to a sticky note
export const addAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, url } = req.body;

    const { data, error } = await supabase
      .from('note_attachments')
      .insert({
        note_id: id,
        name,
        type,
        url
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove attachment from a sticky note
export const removeAttachment = async (req: Request, res: Response) => {
  try {
    const { noteId, attachmentId } = req.params;

    const { error } = await supabase
      .from('note_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('note_id', noteId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error removing attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
