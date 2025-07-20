import { supabase } from './supabase';
import { analytics } from './analytics';

export interface DocumentView {
  // in seconds
  document_id: string;
  id?: string;
  page_url?: string;
  session_id?: string;
  time_spent: number; 
  user_id: string;
  viewed_at: string;
}

export interface DocumentEdit {
  document_id: string;
  edit_details: Record<string, any>;
  edit_type: 'create' | 'update' | 'delete' | 'duplicate' | 'archive' | 'restore';
  edited_at: string;
  id?: string;
  user_id: string;
  version_after?: number;
  version_before?: number;
}

export interface DocumentShare {
  document_id: string;
  expires_at?: string;
  id?: string;
  share_type: 'link' | 'email' | 'collaboration';
  shared_at: string;
  shared_by: string;
  shared_with: string;
}

export interface DocumentAnalytics {
    category: string;
  category_breakdown: Array<{
    document_count: number;
    view_count: number;
}>;
  most_edited_documents: Array<{
    document_id: string;
    edit_count: number;
    title: string;
  }>;
  most_viewed_documents: Array<{
    document_id: string;
    title: string;
    view_count: number;
  }>;
  recent_activity: Array<{
    action: string;
    document_id: string;
    timestamp: string;
    title: string;
    user_id: string;
  }>;
  time_series_data: Array<{
    date: string;
    edits: number;
    shares: number;
    views: number;
  }>;
  total_documents: number;
  total_edits: number;
  total_shares: number;
  total_views: number;
  user_activity: Array<{
    documents_created: number;
    documents_edited: number;
    total_views: number;
    user_id: string;
  }>;
}

class DocumentAnalyticsService {
  private isTracking: boolean = true;

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      this.isTracking = false;
      return;
    }

    // Check if user has opted out of analytics
    const analyticsOptOut = localStorage.getItem('analytics_opt_out');
    if (analyticsOptOut === 'true') {
      this.isTracking = false;
      return;
    }

    this.isTracking = true;
  }

  // Track document view
  async trackDocumentView(documentId: string, timeSpent: number = 0) {
    if (!this.isTracking) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const view: DocumentView = {
        document_id: documentId,
        user_id: user.id,
        viewed_at: new Date().toISOString(),
        time_spent: timeSpent,
        page_url: window.location.href,
        session_id: this.getSessionId(),
      };

      const { error } = await supabase.from('document_views').insert([view]);

      if (error) {
        console.error('Document view tracking failed:', error);
      } else {
        // Also track as general analytics event
        await analytics.trackEvent('document_view', {
          document_id: documentId,
          time_spent: timeSpent,
        });
      }
    } catch (error) {
      console.error('Document view tracking error:', error);
    }
  }

  // Track document edit
  async trackDocumentEdit(
    documentId: string,
    editType: DocumentEdit['edit_type'],
    editDetails: Record<string, any> = {},
    versionBefore?: number,
    versionAfter?: number
  ) {
    if (!this.isTracking) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const edit: DocumentEdit = {
        document_id: documentId,
        user_id: user.id,
        edit_type: editType,
        edit_details: editDetails,
        edited_at: new Date().toISOString(),
        version_before: versionBefore,
        version_after: versionAfter,
      };

      const { error } = await supabase.from('document_edits').insert([edit]);

      if (error) {
        console.error('Document edit tracking failed:', error);
      } else {
        // Also track as general analytics event
        await analytics.trackEvent('document_edit', {
          document_id: documentId,
          edit_type: editType,
          version_before: versionBefore,
          version_after: versionAfter,
        });
      }
    } catch (error) {
      console.error('Document edit tracking error:', error);
    }
  }

  // Track document share
  async trackDocumentShare(
    documentId: string,
    shareType: DocumentShare['share_type'],
    sharedWith: string,
    expiresAt?: string
  ) {
    if (!this.isTracking) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const share: DocumentShare = {
        document_id: documentId,
        shared_by: user.id,
        shared_with: sharedWith,
        share_type: shareType,
        shared_at: new Date().toISOString(),
        expires_at: expiresAt,
      };

      const { error } = await supabase.from('document_shares').insert([share]);

      if (error) {
        console.error('Document share tracking failed:', error);
      } else {
        // Also track as general analytics event
        await analytics.trackEvent('document_share', {
          document_id: documentId,
          share_type: shareType,
          shared_with: sharedWith,
        });
      }
    } catch (error) {
      console.error('Document share tracking error:', error);
    }
  }

  // Get document analytics
  async getDocumentAnalytics(
    organizationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DocumentAnalytics> {
    if (!this.isTracking) {
      return this.getEmptyAnalytics();
    }

    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    try {
      // Get basic counts
      const [documentsResult, viewsResult, editsResult, sharesResult] =
        await Promise.all([
          supabase
            .from('documents')
            .select('id, title, category, created_at')
            .gte('created_at', start)
            .lte('created_at', end),

          supabase
            .from('document_views')
            .select('document_id, viewed_at')
            .gte('viewed_at', start)
            .lte('viewed_at', end),

          supabase
            .from('document_edits')
            .select('document_id, edit_type, edited_at, user_id')
            .gte('edited_at', start)
            .lte('edited_at', end),

          supabase
            .from('document_shares')
            .select('document_id, shared_at')
            .gte('shared_at', start)
            .lte('shared_at', end),
        ]);

      const documents = documentsResult.data || [];
      const views = viewsResult.data || [];
      const edits = editsResult.data || [];
      const shares = sharesResult.data || [];

      // Calculate most viewed documents
      const viewCounts = views.reduce(
        (acc, view) => {
          acc[view.document_id] = (acc[view.document_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const mostViewedDocuments = Object.entries(viewCounts)
        .map(([documentId, count]) => {
          const doc = documents.find(d => d.id === documentId);
          return {
            document_id: documentId,
            title: doc?.title || 'Unknown Document',
            view_count: count,
          };
        })
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);

      // Calculate most edited documents
      const editCounts = edits.reduce(
        (acc, edit) => {
          acc[edit.document_id] = (acc[edit.document_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const mostEditedDocuments = Object.entries(editCounts)
        .map(([documentId, count]) => {
          const doc = documents.find(d => d.id === documentId);
          return {
            document_id: documentId,
            title: doc?.title || 'Unknown Document',
            edit_count: count,
          };
        })
        .sort((a, b) => b.edit_count - a.edit_count)
        .slice(0, 10);

      // Get recent activity
      const recentActivity = edits
        .map(edit => {
          const doc = documents.find(d => d.id === edit.document_id);
          return {
            document_id: edit.document_id,
            title: doc?.title || 'Unknown Document',
            action: edit.edit_type,
            user_id: edit.user_id,
            timestamp: edit.edited_at,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 20);

      // Calculate category breakdown
      const categoryBreakdown = this.calculateCategoryBreakdown(
        documents,
        views
      );

      // Calculate user activity
      const userActivity = this.calculateUserActivity(edits, views);

      // Calculate time series data
      const timeSeriesData = this.calculateTimeSeriesData(
        views,
        edits,
        shares,
        start,
        end
      );

      return {
        total_documents: documents.length,
        total_views: views.length,
        total_edits: edits.length,
        total_shares: shares.length,
        most_viewed_documents: mostViewedDocuments,
        most_edited_documents: mostEditedDocuments,
        recent_activity: recentActivity,
        category_breakdown: categoryBreakdown,
        user_activity: userActivity,
        time_series_data: timeSeriesData,
      };
    } catch (error) {
      console.error('Failed to get document analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  // Get analytics for a specific document
  async getDocumentAnalyticsById(
    documentId: string,
    startDate?: string,
    endDate?: string
  ) {
    if (!this.isTracking) {
      return {
        views: [],
        edits: [],
        shares: [],
        total_views: 0,
        total_edits: 0,
        total_shares: 0,
        average_time_spent: 0,
      };
    }

    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    try {
      const [viewsResult, editsResult, sharesResult] = await Promise.all([
        supabase
          .from('document_views')
          .select('*')
          .eq('document_id', documentId)
          .gte('viewed_at', start)
          .lte('viewed_at', end)
          .order('viewed_at', { ascending: false }),

        supabase
          .from('document_edits')
          .select('*')
          .eq('document_id', documentId)
          .gte('edited_at', start)
          .lte('edited_at', end)
          .order('edited_at', { ascending: false }),

        supabase
          .from('document_shares')
          .select('*')
          .eq('document_id', documentId)
          .gte('shared_at', start)
          .lte('shared_at', end)
          .order('shared_at', { ascending: false }),
      ]);

      const views = viewsResult.data || [];
      const edits = editsResult.data || [];
      const shares = sharesResult.data || [];

      const averageTimeSpent =
        views.length > 0
          ? views.reduce((sum, view) => sum + view.time_spent, 0) / views.length
          : 0;

      return {
        views,
        edits,
        shares,
        total_views: views.length,
        total_edits: edits.length,
        total_shares: shares.length,
        average_time_spent: averageTimeSpent,
      };
    } catch (error) {
      console.error('Failed to get document analytics by ID:', error);
      return {
        views: [],
        edits: [],
        shares: [],
        total_views: 0,
        total_edits: 0,
        total_shares: 0,
        average_time_spent: 0,
      };
    }
  }

  private calculateCategoryBreakdown(documents: any[], views: any[]) {
    const categoryMap = new Map<
      string,
      { document_count: number; view_count: number }
    >();

    // Count documents by category
    documents.forEach(doc => {
      const category = doc.category || 'Uncategorized';
      const current = categoryMap.get(category) || {
        document_count: 0,
        view_count: 0,
      };
      current.document_count += 1;
      categoryMap.set(category, current);
    });

    // Count views by category
    views.forEach(view => {
      const doc = documents.find(d => d.id === view.document_id);
      if (doc) {
        const category = doc.category || 'Uncategorized';
        const current = categoryMap.get(category) || {
          document_count: 0,
          view_count: 0,
        };
        current.view_count += 1;
        categoryMap.set(category, current);
      }
    });

    return Array.from(categoryMap.entries()).map(([category, counts]) => ({
      category,
      document_count: counts.document_count,
      view_count: counts.view_count,
    }));
  }

  private calculateUserActivity(edits: any[], views: any[]) {
    const userMap = new Map<
      string,
      {
        documents_created: number;
        documents_edited: number;
        total_views: number;
      }
    >();

    // Count edits by user
    edits.forEach(edit => {
      const current = userMap.get(edit.user_id) || {
        documents_created: 0,
        documents_edited: 0,
        total_views: 0,
      };
      if (edit.edit_type === 'create') {
        current.documents_created += 1;
      } else {
        current.documents_edited += 1;
      }
      userMap.set(edit.user_id, current);
    });

    // Count views by user
    views.forEach(view => {
      const current = userMap.get(view.user_id) || {
        documents_created: 0,
        documents_edited: 0,
        total_views: 0,
      };
      current.total_views += 1;
      userMap.set(view.user_id, current);
    });

    return Array.from(userMap.entries()).map(([user_id, activity]) => ({
      user_id,
      documents_created: activity.documents_created,
      documents_edited: activity.documents_edited,
      total_views: activity.total_views,
    }));
  }

  private calculateTimeSeriesData(
    views: any[],
    edits: any[],
    shares: any[],
    startDate: string,
    endDate: string
  ) {
    const dateMap = new Map<
      string,
      { edits: number; shares: number, views: number; }
    >();

    // Initialize all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { views: 0, edits: 0, shares: 0 });
    }

    // Count views by date
    views.forEach(view => {
      const dateStr = view.viewed_at.split('T')[0];
      const current = dateMap.get(dateStr);
      if (current) {
        current.views += 1;
      }
    });

    // Count edits by date
    edits.forEach(edit => {
      const dateStr = edit.edited_at.split('T')[0];
      const current = dateMap.get(dateStr);
      if (current) {
        current.edits += 1;
      }
    });

    // Count shares by date
    shares.forEach(share => {
      const dateStr = share.shared_at.split('T')[0];
      const current = dateMap.get(dateStr);
      if (current) {
        current.shares += 1;
      }
    });

    return Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      views: counts.views,
      edits: counts.edits,
      shares: counts.shares,
    }));
  }

  getEmptyAnalytics(): DocumentAnalytics {
    return {
      total_documents: 0,
      total_views: 0,
      total_edits: 0,
      total_shares: 0,
      most_viewed_documents: [],
      most_edited_documents: [],
      recent_activity: [],
      category_breakdown: [],
      user_activity: [],
      time_series_data: [],
    };
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

// Create singleton instance
let documentAnalyticsInstance: DocumentAnalyticsService | null = null;

const getDocumentAnalyticsInstance = () => {
  if (!documentAnalyticsInstance) {
    documentAnalyticsInstance = new DocumentAnalyticsService();
  }
  return documentAnalyticsInstance;
};

// Export functions that use the singleton
export const documentAnalytics = {
  trackDocumentView: (documentId: string, timeSpent?: number) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getDocumentAnalyticsInstance().trackDocumentView(
      documentId,
      timeSpent
    );
  },
  trackDocumentEdit: (
    documentId: string,
    editType: DocumentEdit['edit_type'],
    editDetails?: Record<string, any>,
    versionBefore?: number,
    versionAfter?: number
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getDocumentAnalyticsInstance().trackDocumentEdit(
      documentId,
      editType,
      editDetails,
      versionBefore,
      versionAfter
    );
  },
  trackDocumentShare: (
    documentId: string,
    shareType: DocumentShare['share_type'],
    sharedWith: string,
    expiresAt?: string
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true')
      return Promise.resolve();
    return getDocumentAnalyticsInstance().trackDocumentShare(
      documentId,
      shareType,
      sharedWith,
      expiresAt
    );
  },
  getDocumentAnalytics: (
    organizationId: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return Promise.resolve(
        getDocumentAnalyticsInstance().getEmptyAnalytics()
      );
    }
    return getDocumentAnalyticsInstance().getDocumentAnalytics(
      organizationId,
      startDate,
      endDate
    );
  },
  getDocumentAnalyticsById: (
    documentId: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return Promise.resolve({
        views: [],
        edits: [],
        shares: [],
        total_views: 0,
        total_edits: 0,
        total_shares: 0,
        average_time_spent: 0,
      });
    }
    return getDocumentAnalyticsInstance().getDocumentAnalyticsById(
      documentId,
      startDate,
      endDate
    );
  },
};
