import { supabase } from './supabase';

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_template: boolean;
  assigned_projects: string[];
  permissions: {
    can_edit: string[];
    can_view: string[];
    can_delete: string[];
  };
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  content: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  change_description: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CreateDocumentData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  is_template: boolean;
  permissions: {
    can_edit: string[];
    can_view: string[];
    can_delete: string[];
  };
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  content?: string;
  change_description: string;
}

class DocumentService {
  // Get all documents with optional filters
  async getDocuments(filters?: {
    category?: string;
    isTemplate?: boolean;
    isArchived?: boolean;
    search?: string;
    assignedToProject?: string;
  }): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.isTemplate !== undefined) {
        query = query.eq('is_template', filters.isTemplate);
      }

      if (filters?.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters?.assignedToProject) {
        query = query.contains('assigned_projects', [
          filters.assignedToProject,
        ]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocuments:', error);
      throw error;
    }
  }

  // Get a single document by ID
  async getDocument(id: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getDocument:', error);
      throw error;
    }
  }

  // Create a new document
  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newDocument = {
        ...documentData,
        created_by: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        is_archived: false,
        assigned_projects: [],
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([newDocument])
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }

      // Create initial version
      await this.createDocumentVersion(data.id, {
        version: 1,
        content: documentData.content,
        title: documentData.title,
        description: documentData.description,
        change_description: 'Initial creation',
      });

      return data;
    } catch (error) {
      console.error('Error in createDocument:', error);
      throw error;
    }
  }

  // Update an existing document
  async updateDocument(
    id: string,
    updateData: UpdateDocumentData
  ): Promise<Document> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current document to increment version
      const currentDoc = await this.getDocument(id);
      if (!currentDoc) {
        throw new Error('Document not found');
      }

      const updatedDocument = {
        ...updateData,
        updated_at: new Date().toISOString(),
        version: currentDoc.version + 1,
      };

      const { data, error } = await supabase
        .from('documents')
        .update(updatedDocument)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      // Create new version if content changed
      if (updateData.content && updateData.content !== currentDoc.content) {
        await this.createDocumentVersion(id, {
          version: data.version,
          content: updateData.content,
          title: updateData.title || currentDoc.title,
          description: updateData.description || currentDoc.description,
          change_description: updateData.change_description,
        });
      }

      return data;
    } catch (error) {
      console.error('Error in updateDocument:', error);
      throw error;
    }
  }

  // Archive a document
  async archiveDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error archiving document:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in archiveDocument:', error);
      throw error;
    }
  }

  // Restore an archived document
  async restoreDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error restoring document:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in restoreDocument:', error);
      throw error;
    }
  }

  // Delete a document (soft delete)
  async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      throw error;
    }
  }

  // Assign document to a project
  async assignToProject(documentId: string, projectId: string): Promise<void> {
    try {
      const currentDoc = await this.getDocument(documentId);
      if (!currentDoc) {
        throw new Error('Document not found');
      }

      const updatedProjects = currentDoc.assigned_projects.includes(projectId)
        ? currentDoc.assigned_projects
        : [...currentDoc.assigned_projects, projectId];

      const { error } = await supabase
        .from('documents')
        .update({
          assigned_projects: updatedProjects,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) {
        console.error('Error assigning document to project:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in assignToProject:', error);
      throw error;
    }
  }

  // Remove document from a project
  async removeFromProject(
    documentId: string,
    projectId: string
  ): Promise<void> {
    try {
      const currentDoc = await this.getDocument(documentId);
      if (!currentDoc) {
        throw new Error('Document not found');
      }

      const updatedProjects = currentDoc.assigned_projects.filter(
        id => id !== projectId
      );

      const { error } = await supabase
        .from('documents')
        .update({
          assigned_projects: updatedProjects,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) {
        console.error('Error removing document from project:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeFromProject:', error);
      throw error;
    }
  }

  // Create a document version
  async createDocumentVersion(
    documentId: string,
    versionData: {
      version: number;
      content: string;
      title: string;
      description: string;
      change_description: string;
    }
  ): Promise<DocumentVersion> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newVersion = {
        document_id: documentId,
        ...versionData,
        created_by: user.email,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('document_versions')
        .insert([newVersion])
        .select()
        .single();

      if (error) {
        console.error('Error creating document version:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createDocumentVersion:', error);
      throw error;
    }
  }

  // Get document version history
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version', { ascending: false });

      if (error) {
        console.error('Error fetching document versions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocumentVersions:', error);
      throw error;
    }
  }

  // Get a specific document version
  async getDocumentVersion(
    documentId: string,
    version: number
  ): Promise<DocumentVersion | null> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('version', version)
        .single();

      if (error) {
        console.error('Error fetching document version:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getDocumentVersion:', error);
      throw error;
    }
  }

  // Restore document to a specific version
  async restoreDocumentVersion(
    documentId: string,
    version: number
  ): Promise<Document> {
    try {
      const versionData = await this.getDocumentVersion(documentId, version);
      if (!versionData) {
        throw new Error('Version not found');
      }

      return await this.updateDocument(documentId, {
        title: versionData.title,
        description: versionData.description,
        content: versionData.content,
        change_description: `Restored to version ${version}`,
      });
    } catch (error) {
      console.error('Error in restoreDocumentVersion:', error);
      throw error;
    }
  }

  // Get document categories
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching document categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocumentCategories:', error);
      throw error;
    }
  }

  // Create a document category
  async createDocumentCategory(
    categoryData: Omit<DocumentCategory, 'id'>
  ): Promise<DocumentCategory> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has admin role
      const userRole = user.user_metadata?.role;
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Insufficient permissions to create categories');
      }

      const { data, error } = await supabase
        .from('document_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error creating document category:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createDocumentCategory:', error);
      throw error;
    }
  }

  // Check user permissions for category management
  async checkUserPermissions(): Promise<{
    canCreateCategories: boolean;
    role: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { canCreateCategories: false, role: 'none' };
      }

      const userRole = user.user_metadata?.role || 'user';
      const canCreateCategories =
        userRole === 'admin' || userRole === 'super_admin';

      return { canCreateCategories, role: userRole };
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return { canCreateCategories: false, role: 'none' };
    }
  }

  // Check user permissions for a document
  async checkDocumentPermissions(
    documentId: string,
    action: 'view' | 'edit' | 'delete'
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const document = await this.getDocument(documentId);
      if (!document) {
        return false;
      }

      // Document creator has all permissions
      if (document.created_by === user.email) {
        return true;
      }

      // Check role-based permissions
      const userRole = user.user_metadata?.role || 'user';
      const permissionKey =
        `can_${action}` as keyof typeof document.permissions;

      return document.permissions[permissionKey]?.includes(userRole) || false;
    } catch (error) {
      console.error('Error in checkDocumentPermissions:', error);
      return false;
    }
  }

  // Duplicate a document
  async duplicateDocument(
    documentId: string,
    newTitle?: string
  ): Promise<Document> {
    try {
      const originalDoc = await this.getDocument(documentId);
      if (!originalDoc) {
        throw new Error('Document not found');
      }

      const duplicateData: CreateDocumentData = {
        title: newTitle || `${originalDoc.title} (Copy)`,
        description: originalDoc.description,
        category: originalDoc.category,
        tags: [...originalDoc.tags],
        content: originalDoc.content,
        is_template: originalDoc.is_template,
        permissions: { ...originalDoc.permissions },
      };

      return await this.createDocument(duplicateData);
    } catch (error) {
      console.error('Error in duplicateDocument:', error);
      throw error;
    }
  }

  // Search documents with advanced filters
  async searchDocuments(searchParams: {
    query?: string;
    category?: string;
    tags?: string[];
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
    isTemplate?: boolean;
    isArchived?: boolean;
  }): Promise<Document[]> {
    try {
      let query = supabase.from('documents').select('*');

      if (searchParams.query) {
        query = query.or(
          `title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`
        );
      }

      if (searchParams.category) {
        query = query.eq('category', searchParams.category);
      }

      if (searchParams.tags && searchParams.tags.length > 0) {
        query = query.overlaps('tags', searchParams.tags);
      }

      if (searchParams.createdBy) {
        query = query.eq('created_by', searchParams.createdBy);
      }

      if (searchParams.dateFrom) {
        query = query.gte('created_at', searchParams.dateFrom);
      }

      if (searchParams.dateTo) {
        query = query.lte('created_at', searchParams.dateTo);
      }

      if (searchParams.isTemplate !== undefined) {
        query = query.eq('is_template', searchParams.isTemplate);
      }

      if (searchParams.isArchived !== undefined) {
        query = query.eq('is_archived', searchParams.isArchived);
      }

      const { data, error } = await query.order('updated_at', {
        ascending: false,
      });

      if (error) {
        console.error('Error searching documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchDocuments:', error);
      throw error;
    }
  }

  // Fetch all unique tags used in documents
  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('tags')
        .not('tags', 'is', null);

      if (error) {
        console.error('Error fetching tags:', error);
        throw error;
      }

      // Flatten and deduplicate tags
      const allTags = (data || []).flatMap(
        (doc: { tags: string[] }) => doc.tags || []
      );
      return Array.from(new Set(allTags)).sort();
    } catch (error) {
      console.error('Error in getAllTags:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();
