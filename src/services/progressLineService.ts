import { persistentStorage } from './persistentStorage';

export interface ProgressLineState {
  isVisible: boolean;
  currentDate: Date;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  width: number;
}

export class ProgressLineService {
  private static readonly DEFAULT_STATE: ProgressLineState = {
    isVisible: false,
    currentDate: new Date(),
    color: '#ff6b6b',
    style: 'dashed',
    width: 2
  };

  /**
   * Get progress line state for a project
   */
  static async getProgressLineState(projectId: string = 'default'): Promise<ProgressLineState> {
    try {
      const savedState = await persistentStorage.getSetting(`progressLine_${projectId}`, 'progressLine');
      
      if (savedState && typeof savedState === 'object') {
        return {
          ...this.DEFAULT_STATE,
          ...savedState,
          currentDate: savedState.currentDate ? new Date(savedState.currentDate) : new Date()
        };
      }
      
      return { ...this.DEFAULT_STATE };
    } catch (error) {
      console.error('Failed to load progress line state:', error);
      return { ...this.DEFAULT_STATE };
    }
  }

  /**
   * Save progress line state for a project
   */
  static async saveProgressLineState(
    state: Partial<ProgressLineState>, 
    projectId: string = 'default'
  ): Promise<boolean> {
    try {
      const currentState = await this.getProgressLineState(projectId);
      const newState = { ...currentState, ...state };
      
      await persistentStorage.setSetting(`progressLine_${projectId}`, newState, 'progressLine');
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo progress line state updated:', newState);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save progress line state:', error);
      return false;
    }
  }

  /**
   * Toggle progress line visibility
   */
  static async toggleProgressLine(projectId: string = 'default'): Promise<boolean> {
    try {
      const currentState = await this.getProgressLineState(projectId);
      const newState = { ...currentState, isVisible: !currentState.isVisible };
      
      return await this.saveProgressLineState(newState, projectId);
    } catch (error) {
      console.error('Failed to toggle progress line:', error);
      return false;
    }
  }

  /**
   * Update progress line current date
   */
  static async updateProgressLineDate(date: Date, projectId: string = 'default'): Promise<boolean> {
    try {
      return await this.saveProgressLineState({ currentDate: date }, projectId);
    } catch (error) {
      console.error('Failed to update progress line date:', error);
      return false;
    }
  }

  /**
   * Update progress line styling
   */
  static async updateProgressLineStyle(
    style: Partial<Pick<ProgressLineState, 'color' | 'style' | 'width'>>, 
    projectId: string = 'default'
  ): Promise<boolean> {
    try {
      return await this.saveProgressLineState(style, projectId);
    } catch (error) {
      console.error('Failed to update progress line style:', error);
      return false;
    }
  }

  /**
   * Reset progress line to default state
   */
  static async resetProgressLine(projectId: string = 'default'): Promise<boolean> {
    try {
      return await this.saveProgressLineState(this.DEFAULT_STATE, projectId);
    } catch (error) {
      console.error('Failed to reset progress line:', error);
      return false;
    }
  }

  /**
   * Get progress line CSS styles
   */
  static getProgressLineStyles(state: ProgressLineState): string {
    const { color, style, width } = state;
    
    const borderStyle = style === 'dashed' ? 'dashed' : style === 'dotted' ? 'dotted' : 'solid';
    
    return `
      border-left: ${width}px ${borderStyle} ${color};
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: 1000;
      pointer-events: none;
    `;
  }

  /**
   * Calculate progress line position based on current date
   */
  static calculateProgressLinePosition(
    currentDate: Date,
    timelineStart: Date,
    timelineEnd: Date,
    containerWidth: number
  ): number {
    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const currentPosition = currentDate.getTime() - timelineStart.getTime();
    
    if (totalDuration <= 0) return 0;
    
    const percentage = Math.max(0, Math.min(1, currentPosition / totalDuration));
    return percentage * containerWidth;
  }

  /**
   * Check if a task intersects with the progress line
   */
  static isTaskIntersectingProgressLine(
    taskStart: Date,
    taskEnd: Date,
    progressDate: Date
  ): boolean {
    return progressDate >= taskStart && progressDate <= taskEnd;
  }

  /**
   * Get progress percentage for a task at current date
   */
  static getTaskProgressPercentage(
    taskStart: Date,
    taskEnd: Date,
    currentDate: Date
  ): number {
    const taskDuration = taskEnd.getTime() - taskStart.getTime();
    const elapsed = currentDate.getTime() - taskStart.getTime();
    
    if (taskDuration <= 0) return 0;
    
    return Math.max(0, Math.min(1, elapsed / taskDuration));
  }
} 