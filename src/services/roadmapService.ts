import { supabase } from './supabase';

export interface RoadmapItem {
  actualDate?: string;
  assignee?: string;
  category: 'feature' | 'module' | 'component' | 'bugfix' | 'enhancement' | 'integration';
  changelog?: string;
  changelogEntryId?: string;
  createdAt: string;
  description: string;
  estimatedDate?: string;
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  status: 'idea' | 'planned' | 'in-progress' | 'debugging' | 'released';
  tags: string[];
  title: string;
  updatedAt: string;
  version?: string;
}

export interface ChangelogEntry {
  affectedComponents: string[];
  author: string;
  breakingChanges?: string[];
  createdAt: string;
  date: string;
  description: string;
  id: string;
  isDraft: boolean;
  isPublic: boolean;
  migrationNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  roadmapItemId?: string;
  tags: string[];
  title: string;
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking' | 'security' | 'deprecation' | 'performance';
  updatedAt: string;
  version: string;
}

export interface Version {
  date: string;
  description: string;
  downloadUrl?: string;
  entries: ChangelogEntry[];
  isLatest: boolean;
  isStable: boolean;
  releaseNotes?: string;
  title: string;
  version: string;
}

class RoadmapService {
  private static instance: RoadmapService;
  private roadmapItems: RoadmapItem[] = [];
  private changelogEntries: ChangelogEntry[] = [];
  private versions: Version[] = [];

  static getInstance(): RoadmapService {
    if (!RoadmapService.instance) {
      RoadmapService.instance = new RoadmapService();
    }
    return RoadmapService.instance;
  }

  // Load roadmap items from database
  async loadRoadmapItems(): Promise<RoadmapItem[]> {
    try {
      const { data, error } = await supabase
        .from('roadmap_items')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('🚨 Error loading roadmap items:', error);
        return [];
      }

      this.roadmapItems = data || [];
      return this.roadmapItems;
    } catch (error) {
      console.error('🚨 Error loading roadmap items:', error);
      return [];
    }
  }

  // Save roadmap item to database
  async saveRoadmapItem(item: RoadmapItem): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('roadmap_items')
        .upsert({
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          priority: item.priority,
          category: item.category,
          assignee: item.assignee,
          estimated_date: item.estimatedDate,
          actual_date: item.actualDate,
          tags: item.tags,
          progress: item.progress,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          version: item.version,
          changelog: item.changelog,
          changelog_entry_id: item.changelogEntryId
        });

      if (error) {
        console.error('🚨 Error saving roadmap item:', error);
        return false;
      }

      // Update local cache
      const existingIndex = this.roadmapItems.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        this.roadmapItems[existingIndex] = item;
      } else {
        this.roadmapItems.push(item);
      }

      return true;
    } catch (error) {
      console.error('🚨 Error saving roadmap item:', error);
      return false;
    }
  }

  // Update roadmap item status and potentially create changelog entry
  async updateRoadmapItemStatus(itemId: string, newStatus: RoadmapItem['status'], author: string): Promise<boolean> {
    try {
      const item = this.roadmapItems.find(i => i.id === itemId);
      if (!item) {
        console.error('🚨 Roadmap item not found:', itemId);
        return false;
      }

      const oldStatus = item.status;
      const updatedItem = {
        ...item,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Save updated item
      const success = await this.saveRoadmapItem(updatedItem);
      if (!success) return false;

      // Check if status change warrants a changelog entry
      if (this.shouldCreateChangelogEntry(oldStatus, newStatus)) {
        await this.createChangelogEntryFromRoadmapItem(updatedItem, author);
      }

      return true;
    } catch (error) {
      console.error('🚨 Error updating roadmap item status:', error);
      return false;
    }
  }

  // Determine if a status change should create a changelog entry
  private shouldCreateChangelogEntry(oldStatus: string, newStatus: string): boolean {
    const statusTransitions = {
      'idea': ['planned', 'in-progress'],
      'planned': ['in-progress'],
      'in-progress': ['debugging', 'released'],
      'debugging': ['released']
    };

    return statusTransitions[oldStatus as keyof typeof statusTransitions]?.includes(newStatus) || false;
  }

  // Create changelog entry from roadmap item
  async createChangelogEntryFromRoadmapItem(item: RoadmapItem, author: string): Promise<ChangelogEntry | null> {
    try {
             const entry: ChangelogEntry = {
         id: `changelog_${Date.now()}`,
         version: item.version || 'v1.0.0',
         date: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
         type: this.mapStatusToChangelogType(item.status),
         title: item.title,
         description: item.description,
         author: author,
         affectedComponents: [item.category],
         priority: item.priority,
         tags: item.tags,
         isPublic: true,
         isDraft: false,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         roadmapItemId: item.id
       };

      const success = await this.saveChangelogEntry(entry);
      if (success) {
        // Update roadmap item with changelog entry reference
        const updatedItem = {
          ...item,
          changelogEntryId: entry.id
        };
        await this.saveRoadmapItem(updatedItem);
        return entry;
      }

      return null;
    } catch (error) {
      console.error('🚨 Error creating changelog entry:', error);
      return null;
    }
  }

  // Map roadmap status to changelog type
  private mapStatusToChangelogType(status: string): ChangelogEntry['type'] {
    switch (status) {
      case 'released': return 'feature';
      case 'debugging': return 'bugfix';
      case 'in-progress': return 'improvement';
      default: return 'improvement';
    }
  }

  // Load changelog entries from database
  async loadChangelogEntries(): Promise<ChangelogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('🚨 Error loading changelog entries:', error);
        return [];
      }

      this.changelogEntries = data || [];
      return this.changelogEntries;
    } catch (error) {
      console.error('🚨 Error loading changelog entries:', error);
      return [];
    }
  }

  // Save changelog entry to database
  async saveChangelogEntry(entry: ChangelogEntry): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('changelog_entries')
        .upsert({
          id: entry.id,
          version: entry.version,
          date: entry.date,
          type: entry.type,
          title: entry.title,
          description: entry.description,
          author: entry.author,
          affected_components: entry.affectedComponents,
          breaking_changes: entry.breakingChanges,
          migration_notes: entry.migrationNotes,
          roadmap_item_id: entry.roadmapItemId,
          priority: entry.priority,
          tags: entry.tags,
          is_public: entry.isPublic,
          is_draft: entry.isDraft,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt
        });

      if (error) {
        console.error('🚨 Error saving changelog entry:', error);
        return false;
      }

      // Update local cache
      const existingIndex = this.changelogEntries.findIndex(e => e.id === entry.id);
      if (existingIndex >= 0) {
        this.changelogEntries[existingIndex] = entry;
      } else {
        this.changelogEntries.push(entry);
      }

      return true;
    } catch (error) {
      console.error('🚨 Error saving changelog entry:', error);
      return false;
    }
  }

  // Generate new version
  async generateNewVersion(title: string, description: string): Promise<Version | null> {
    try {
      const latestVersion = this.versions.find(v => v.isLatest);
      let newVersionNumber = 'v1.0.0';

      if (latestVersion) {
        const versionParts = latestVersion.version.split('.');
        const major = parseInt(versionParts[0]?.substring(1) || '1');
        const minor = parseInt(versionParts[1] || '0');
        const patch = parseInt(versionParts[2] || '0');
        newVersionNumber = `v${major}.${minor}.${patch + 1}`;
      }

             const newVersion: Version = {
         version: newVersionNumber,
         date: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
         title: title,
         description: description,
         entries: [],
         isLatest: true,
         isStable: false
       };

      // Update existing versions
      this.versions = this.versions.map(v => ({ ...v, isLatest: false }));
      this.versions.unshift(newVersion);

      // Save to database
      const { error } = await supabase
        .from('versions')
        .upsert({
          version: newVersion.version,
          date: newVersion.date,
          title: newVersion.title,
          description: newVersion.description,
          is_latest: newVersion.isLatest,
          is_stable: newVersion.isStable,
          download_url: newVersion.downloadUrl,
          release_notes: newVersion.releaseNotes
        });

      if (error) {
        console.error('🚨 Error saving new version:', error);
        return null;
      }

      return newVersion;
    } catch (error) {
      console.error('🚨 Error generating new version:', error);
      return null;
    }
  }

  // Load versions from database
  async loadVersions(): Promise<Version[]> {
    try {
      const { data, error } = await supabase
        .from('versions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('🚨 Error loading versions:', error);
        return [];
      }

      this.versions = data || [];
      return this.versions;
    } catch (error) {
      console.error('🚨 Error loading versions:', error);
      return [];
    }
  }

  // Get roadmap items by status
  getRoadmapItemsByStatus(status: RoadmapItem['status']): RoadmapItem[] {
    return this.roadmapItems.filter(item => item.status === status);
  }

  // Get changelog entries by version
  getChangelogEntriesByVersion(version: string): ChangelogEntry[] {
    return this.changelogEntries.filter(entry => entry.version === version);
  }

  // Get roadmap items that need changelog entries
  getRoadmapItemsNeedingChangelog(): RoadmapItem[] {
    return this.roadmapItems.filter(item => 
      item.status === 'released' && !item.changelogEntryId
    );
  }

  // Initialize database tables if they don't exist
  async initializeTables(): Promise<void> {
    try {
      // Create roadmap_items table
      await supabase.rpc('create_roadmap_items_table');
      
      // Create changelog_entries table
      await supabase.rpc('create_changelog_entries_table');
      
      // Create versions table
      await supabase.rpc('create_versions_table');
      
      console.log('✅ Roadmap tables initialized successfully');
    } catch (error) {
      console.error('🚨 Error initializing roadmap tables:', error);
    }
  }
}

export const roadmapService = RoadmapService.getInstance(); 
