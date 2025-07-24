import { supabase } from './supabase';

// Zoom level interfaces
export interface ZoomLevel {
  id: string;
  name: string;
  widthPerDay: number;
  labelFormat: string;
  gridInterval: number; // Days between grid lines
  snapInterval: number; // Days for snap-to-grid
  minVisibleDays: number;
  maxVisibleDays: number;
}

export interface ZoomState {
  currentLevel: ZoomLevel;
  scale: number; // 1.0 = 100%, 2.0 = 200%, etc.
  isAnimating: boolean;
  lastRedrawTime: number;
}

export interface ZoomPreferences {
  defaultZoomLevel: string;
  rememberZoom: boolean;
  smoothTransitions: boolean;
  demoMode?: boolean;
}

// Zoom level presets
export const ZOOM_LEVELS: ZoomLevel[] = [
  {
    id: 'day',
    name: 'Day',
    widthPerDay: 40,
    labelFormat: 'DD MMM',
    gridInterval: 1,
    snapInterval: 1,
    minVisibleDays: 1,
    maxVisibleDays: 30
  },
  {
    id: 'week',
    name: 'Week',
    widthPerDay: 6,
    labelFormat: 'Wk ##',
    gridInterval: 7,
    snapInterval: 1,
    minVisibleDays: 7,
    maxVisibleDays: 180
  },
  {
    id: 'month',
    name: 'Month',
    widthPerDay: 1.5,
    labelFormat: 'MMM YYYY',
    gridInterval: 30,
    snapInterval: 7,
    minVisibleDays: 30,
    maxVisibleDays: 365
  },
  {
    id: 'quarter',
    name: 'Quarter',
    widthPerDay: 0.5,
    labelFormat: 'Q# YYYY',
    gridInterval: 90,
    snapInterval: 30,
    minVisibleDays: 90,
    maxVisibleDays: 1095
  }
];

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxZoomLevel: 'week',
  scrollZoomDisabled: true,
  tooltipMessage: 'Upgrade to unlock more detail',
  watermark: 'DEMO VIEW'
};

class ZoomService {
  private zoomState: ZoomState;
  private preferences: ZoomPreferences;
  private isDemoMode = false;
  private redrawQueue: (() => void)[] = [];
  private animationFrameId: number | null = null;
  private scrollZoomEnabled = true;
  private lastScrollTime = 0;
  private scrollDebounceMs = 50;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.preferences = {
      defaultZoomLevel: 'week',
      rememberZoom: true,
      smoothTransitions: true
    };
    
    const defaultLevel = this.getZoomLevelById(this.preferences.defaultZoomLevel) || ZOOM_LEVELS[1]; // Default to week
    
    this.zoomState = {
      currentLevel: defaultLevel,
      scale: 1.0,
      isAnimating: false,
      lastRedrawTime: 0
    };

    this.scrollZoomEnabled = !this.isDemoMode;
    
    // Load preferences asynchronously
    this.loadPreferences().then(preferences => {
      this.preferences = preferences;
      const level = this.getZoomLevelById(preferences.defaultZoomLevel);
      if (level) {
        this.zoomState.currentLevel = level;
      }
    });
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Get zoom level by ID
   */
  getZoomLevelById(id: string): ZoomLevel | undefined {
    return ZOOM_LEVELS.find(level => level.id === id);
  }

  /**
   * Get all available zoom levels
   */
  getAvailableZoomLevels(): ZoomLevel[] {
    if (this.isDemoMode) {
      // In demo mode, only allow up to week level
      const weekIndex = ZOOM_LEVELS.findIndex(level => level.id === DEMO_MODE_CONFIG.maxZoomLevel);
      return ZOOM_LEVELS.slice(0, weekIndex + 1);
    }
    return ZOOM_LEVELS;
  }

  /**
   * Get current zoom state
   */
  getZoomState(): ZoomState {
    return { ...this.zoomState };
  }

  /**
   * Get current zoom level
   */
  getCurrentZoomLevel(): ZoomLevel {
    return this.zoomState.currentLevel;
  }

  /**
   * Get effective width per day (considering scale)
   */
  getEffectiveWidthPerDay(): number {
    return this.zoomState.currentLevel.widthPerDay * this.zoomState.scale;
  }

  /**
   * Zoom to specific level
   */
  async zoomToLevel(levelId: string, animate: boolean = true): Promise<boolean> {
    const newLevel = this.getZoomLevelById(levelId);
    if (!newLevel) return false;

    // Check demo mode restrictions
    const maxLevel = this.getZoomLevelById(DEMO_MODE_CONFIG.maxZoomLevel);
    if (this.isDemoMode && maxLevel && newLevel.widthPerDay > maxLevel.widthPerDay) {
      console.warn('Zoom level not available in demo mode');
      return false;
    }

    const oldLevel = this.zoomState.currentLevel;
    this.zoomState.currentLevel = newLevel;
    this.zoomState.scale = 1.0; // Reset scale when changing levels

    // Trigger redraw
    await this.triggerRedraw(animate);

    // Save preferences if enabled
    if (this.preferences.rememberZoom) {
      await this.savePreferences();
    }

    return true;
  }

  /**
   * Zoom in (next level or scale up)
   */
  async zoomIn(animate: boolean = true): Promise<boolean> {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level.id === this.zoomState.currentLevel.id);
    
    if (currentIndex > 0) {
      // Move to next zoom level
      const nextLevel = ZOOM_LEVELS[currentIndex - 1];
      if (nextLevel) {
        return await this.zoomToLevel(nextLevel.id, animate);
      }
    } else {
      // Scale up within current level
      const newScale = Math.min(this.zoomState.scale * 1.5, 3.0);
      if (newScale !== this.zoomState.scale) {
        this.zoomState.scale = newScale;
        await this.triggerRedraw(animate);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Zoom out (previous level or scale down)
   */
  async zoomOut(animate: boolean = true): Promise<boolean> {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level.id === this.zoomState.currentLevel.id);
    
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      // Move to previous zoom level
      return await this.zoomToLevel(ZOOM_LEVELS[currentIndex + 1].id, animate);
    } else {
      // Scale down within current level
      const newScale = Math.max(this.zoomState.scale / 1.5, 0.5);
      if (newScale !== this.zoomState.scale) {
        this.zoomState.scale = newScale;
        await this.triggerRedraw(animate);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Handle scroll zoom gesture
   */
  async handleScrollZoom(event: WheelEvent, animate: boolean = true): Promise<boolean> {
    // Check if scroll zoom is enabled
    if (!this.scrollZoomEnabled) {
      return false;
    }

    // Check for Ctrl key (or Cmd on Mac)
    if (!event.ctrlKey && !event.metaKey) {
      return false;
    }

    // Prevent default scroll behavior
    event.preventDefault();

    // Debounce scroll events
    const now = Date.now();
    if (now - this.lastScrollTime < this.scrollDebounceMs) {
      return false;
    }
    this.lastScrollTime = now;

    // Determine zoom direction
    const delta = event.deltaY;
    let zoomed = false;

    if (delta < 0) {
      // Zoom in
      zoomed = await this.zoomIn(animate);
    } else if (delta > 0) {
      // Zoom out
      zoomed = await this.zoomOut(animate);
    }

    return zoomed;
  }

  /**
   * Fit timeline to project span
   */
  async fitToProject(startDate: Date, endDate: Date, containerWidth: number): Promise<boolean> {
    const projectDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Find the best zoom level for the project
    const targetWidthPerDay = containerWidth / projectDuration;
    
    let bestLevel = ZOOM_LEVELS[0];
    let bestFit = Math.abs(bestLevel.widthPerDay - targetWidthPerDay);
    
    for (const level of ZOOM_LEVELS) {
      const fit = Math.abs(level.widthPerDay - targetWidthPerDay);
      if (fit < bestFit) {
        bestFit = fit;
        bestLevel = level;
      }
    }

    // Check demo mode restrictions
    if (this.isDemoMode && bestLevel.widthPerDay > this.getZoomLevelById(DEMO_MODE_CONFIG.maxZoomLevel)!.widthPerDay) {
      bestLevel = this.getZoomLevelById(DEMO_MODE_CONFIG.maxZoomLevel)!;
    }

    return await this.zoomToLevel(bestLevel.id, true);
  }

  /**
   * Trigger redraw with optimization
   */
  private async triggerRedraw(animate: boolean = true): Promise<void> {
    const now = Date.now();
    
    // Queue the redraw
    this.queueRedraw(() => {
      this.zoomState.lastRedrawTime = now;
      this.zoomState.isAnimating = animate;
      
      // Emit zoom change event
      this.emitZoomChange();
    });

    // If animating, schedule animation end
    if (animate) {
      setTimeout(() => {
        this.zoomState.isAnimating = false;
      }, 300); // Animation duration
    }
  }

  /**
   * Queue redraw for optimization
   */
  private queueRedraw(callback: () => void): void {
    this.redrawQueue.push(callback);
    
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        // Execute all queued redraws
        while (this.redrawQueue.length > 0) {
          const callback = this.redrawQueue.shift();
          if (callback) callback();
        }
        this.animationFrameId = null;
      });
    }
  }

  /**
   * Emit zoom change event
   */
  private emitZoomChange(): void {
    // This would integrate with your event system
    // For now, we'll use a simple callback approach
    if (this.onZoomChange) {
      this.onZoomChange(this.zoomState);
    }
  }

  /**
   * Load zoom preferences from Supabase
   */
  private async loadPreferences(): Promise<ZoomPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('zoom_preferences')
        .eq('user_id', 'current-user') // This should come from auth context
        .single();

      if (error || !data) {
        return {
          defaultZoomLevel: 'week',
          rememberZoom: true,
          smoothTransitions: true
        };
      }

      return data.zoom_preferences || {
        defaultZoomLevel: 'week',
        rememberZoom: true,
        smoothTransitions: true
      };
    } catch (error) {
      console.error('Error loading zoom preferences:', error);
      return {
        defaultZoomLevel: 'week',
        rememberZoom: true,
        smoothTransitions: true
      };
    }
  }

  /**
   * Save zoom preferences to Supabase
   */
  private async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: 'current-user', // This should come from auth context
          zoom_preferences: {
            ...this.preferences,
            defaultZoomLevel: this.zoomState.currentLevel.id,
            demoMode: this.isDemoMode
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving zoom preferences:', error);
    }
  }

  /**
   * Update zoom preferences
   */
  async updatePreferences(preferences: Partial<ZoomPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    
    if (this.preferences.rememberZoom) {
      await this.savePreferences();
    }
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if current mode is demo
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Check if scroll zoom is enabled
   */
  isScrollZoomEnabled(): boolean {
    return this.scrollZoomEnabled;
  }

  /**
   * Get snap interval for current zoom level
   */
  getSnapInterval(): number {
    return this.zoomState.currentLevel.snapInterval;
  }

  /**
   * Get grid interval for current zoom level
   */
  getGridInterval(): number {
    return this.zoomState.currentLevel.gridInterval;
  }

  /**
   * Get label format for current zoom level
   */
  getLabelFormat(): string {
    return this.zoomState.currentLevel.labelFormat;
  }

  /**
   * Zoom change callback
   */
  onZoomChange?: (zoomState: ZoomState) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.redrawQueue = [];
  }
}

// Export singleton instance
export const zoomService = new ZoomService(); 