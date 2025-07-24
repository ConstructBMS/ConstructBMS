import { persistentStorage } from './persistentStorage';

export interface FourDPlaybackState {
  currentDate: Date;
  demo?: boolean;
  isPlaying: boolean;
  speed: number;
}

export interface FourDPlaybackConfig {
  autoPlay: boolean;
  demo?: boolean;
  highlightActiveTasks: boolean;
  loop: boolean;
  showIFCElements: boolean;
}

export interface ActiveTask {
  endDate: Date;
  ifcElements: string[];
  progress: number;
  startDate: Date;
  taskId: string;
  taskName: string;
}

class FourDPlaybackService {
  private stateKey = 'fourDPlaybackState';
  private configKey = 'fourDPlaybackConfig';
  private activeTasksKey = 'fourDPlaybackActiveTasks';

  // Default state
  private defaultState: FourDPlaybackState = {
    isPlaying: false,
    currentDate: new Date(),
    speed: 1,
    demo: false
  };

  // Default configuration
  private defaultConfig: FourDPlaybackConfig = {
    autoPlay: false,
    loop: false,
    showIFCElements: true,
    highlightActiveTasks: true,
    demo: false
  };

  private animationInterval: NodeJS.Timeout | null = null;
  private playbackCallbacks: Array<(state: FourDPlaybackState) => void> = [];

  /**
   * Get current playback state
   */
  async getState(): Promise<FourDPlaybackState> {
    try {
      const state = await persistentStorage.get(this.stateKey);
      if (state) {
        return {
          ...state,
          currentDate: new Date(state.currentDate)
        };
      }
      return this.defaultState;
    } catch (error) {
      console.error('Error getting 4D playback state:', error);
      return this.defaultState;
    }
  }

  /**
   * Update playback state
   */
  async updateState(state: Partial<FourDPlaybackState>): Promise<void> {
    try {
      const currentState = await this.getState();
      const updatedState = { ...currentState, ...state };
      await persistentStorage.set(this.stateKey, updatedState);
      
      // Notify subscribers
      this.notifySubscribers(updatedState);
      
      console.log('4D playback state updated:', updatedState);
    } catch (error) {
      console.error('Error updating 4D playback state:', error);
      throw error;
    }
  }

  /**
   * Get playback configuration
   */
  async getConfig(): Promise<FourDPlaybackConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting 4D playback config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update playback configuration
   */
  async updateConfig(config: Partial<FourDPlaybackConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('4D playback config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating 4D playback config:', error);
      throw error;
    }
  }

  /**
   * Start playback
   */
  async startPlayback(): Promise<void> {
    try {
      const state = await this.getState();
      const config = await this.getConfig();
      
      if (state.isPlaying) return;

      await this.updateState({ isPlaying: true });
      this.startAnimation();
      
      console.log('4D playback started');
    } catch (error) {
      console.error('Error starting 4D playback:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pausePlayback(): Promise<void> {
    try {
      const state = await this.getState();
      
      if (!state.isPlaying) return;

      await this.updateState({ isPlaying: false });
      this.stopAnimation();
      
      console.log('4D playback paused');
    } catch (error) {
      console.error('Error pausing 4D playback:', error);
      throw error;
    }
  }

  /**
   * Toggle playback
   */
  async togglePlayback(): Promise<void> {
    try {
      const state = await this.getState();
      
      if (state.isPlaying) {
        await this.pausePlayback();
      } else {
        await this.startPlayback();
      }
    } catch (error) {
      console.error('Error toggling 4D playback:', error);
      throw error;
    }
  }

  /**
   * Set playback speed
   */
  async setSpeed(speed: number): Promise<void> {
    try {
      await this.updateState({ speed });
      console.log('4D playback speed set to:', speed);
    } catch (error) {
      console.error('Error setting 4D playback speed:', error);
      throw error;
    }
  }

  /**
   * Jump to specific date
   */
  async jumpToDate(date: Date): Promise<void> {
    try {
      await this.updateState({ currentDate: date });
      console.log('4D playback jumped to date:', date);
    } catch (error) {
      console.error('Error jumping to date:', error);
      throw error;
    }
  }

  /**
   * Calculate active tasks for current date
   */
  async calculateActiveTasks(tasks: any[], currentDate: Date): Promise<ActiveTask[]> {
    try {
      const config = await this.getConfig();
      const activeTasks: ActiveTask[] = [];

      tasks.forEach(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        
        // Check if task is active on current date
        if (currentDate >= taskStart && currentDate <= taskEnd) {
          // Calculate progress based on current date
          const totalDuration = taskEnd.getTime() - taskStart.getTime();
          const elapsed = currentDate.getTime() - taskStart.getTime();
          const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

          activeTasks.push({
            taskId: task.id,
            taskName: task.name,
            startDate: taskStart,
            endDate: taskEnd,
            progress,
            ifcElements: [] // Would be populated from IFC mappings
          });
        }
      });

      // Limit active tasks in demo mode
      if (config.demo && activeTasks.length > 5) {
        return activeTasks.slice(0, 5);
      }

      return activeTasks;
    } catch (error) {
      console.error('Error calculating active tasks:', error);
      return [];
    }
  }

  /**
   * Start animation loop
   */
  private startAnimation(): void {
    this.stopAnimation(); // Clear any existing interval

    this.animationInterval = setInterval(async () => {
      try {
        const state = await this.getState();
        const config = await this.getConfig();
        
        if (!state.isPlaying) return;

        // Calculate next date based on speed
        const nextDate = new Date(state.currentDate);
        const daysToAdd = state.speed / 24; // 1x = 1 day per second
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        // Check if we've reached the end
        const projectEndDate = new Date(); // Would come from project data
        projectEndDate.setDate(projectEndDate.getDate() + 30); // Mock 30-day project

        if (nextDate > projectEndDate) {
          if (config.loop) {
            // Loop back to start
            const projectStartDate = new Date();
            await this.updateState({ currentDate: projectStartDate });
          } else {
            // Stop playback
            await this.pausePlayback();
          }
        } else {
          await this.updateState({ currentDate: nextDate });
        }
      } catch (error) {
        console.error('Error in animation loop:', error);
        this.stopAnimation();
      }
    }, 1000); // Update every second
  }

  /**
   * Stop animation loop
   */
  private stopAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  /**
   * Subscribe to playback state changes
   */
  subscribe(callback: (state: FourDPlaybackState) => void): () => void {
    this.playbackCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.playbackCallbacks.indexOf(callback);
      if (index > -1) {
        this.playbackCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify subscribers of state changes
   */
  private notifySubscribers(state: FourDPlaybackState): void {
    this.playbackCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in playback callback:', error);
      }
    });
  }

  /**
   * Reset playback to start
   */
  async resetPlayback(): Promise<void> {
    try {
      const projectStartDate = new Date(); // Would come from project data
      await this.updateState({
        isPlaying: false,
        currentDate: projectStartDate,
        speed: 1
      });
      this.stopAnimation();
      
      console.log('4D playback reset');
    } catch (error) {
      console.error('Error resetting 4D playback:', error);
      throw error;
    }
  }

  /**
   * Clear all playback data
   */
  async clearAll(): Promise<void> {
    try {
      await persistentStorage.remove(this.stateKey);
      await persistentStorage.remove(this.configKey);
      await persistentStorage.remove(this.activeTasksKey);
      this.stopAnimation();
      this.playbackCallbacks = [];
      
      console.log('All 4D playback data cleared');
    } catch (error) {
      console.error('Error clearing 4D playback data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const state = await this.getState();
      const config = await this.getConfig();
      
      if (state.demo || config.demo) {
        await this.clearAll();
        await this.updateConfig({ demo: false });
        console.log('Demo 4D playback data reset');
      }
    } catch (error) {
      console.error('Error resetting demo 4D playback data:', error);
      throw error;
    }
  }
}

export const fourDPlaybackService = new FourDPlaybackService(); 