// Demo Mode Service
// Handles demo mode detection and restrictions

class DemoModeService {
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
  }

  /**
   * Check if demo mode is enabled
   */
  private checkDemoMode(): boolean {
    // Check environment variables, user role, or other indicators
    const envDemoMode =
      process.env.NODE_ENV === 'development' ||
      process.env.REACT_APP_DEMO_MODE === 'true';

    // Check localStorage for demo mode setting
    const localStorageDemoMode = localStorage.getItem('demo_mode') === 'true';

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlDemoMode = urlParams.get('demo') === 'true';

    return envDemoMode || localStorageDemoMode || urlDemoMode;
  }

  /**
   * Check if current mode is demo
   */
  async checkDemoModeAsync(): Promise<boolean> {
    return this.isDemoMode;
  }

  /**
   * Check if current mode is demo (alias for checkDemoModeAsync)
   */
  async isDemoMode(): Promise<boolean> {
    return this.isDemoMode;
  }

  /**
   * Get demo mode status
   */
  getDemoModeStatus(): boolean {
    return this.isDemoMode;
  }

  /**
   * Enable demo mode
   */
  enableDemoMode(): void {
    this.isDemoMode = true;
    localStorage.setItem('demo_mode', 'true');
  }

  /**
   * Disable demo mode
   */
  disableDemoMode(): void {
    this.isDemoMode = false;
    localStorage.removeItem('demo_mode');
  }

  /**
   * Get demo mode restrictions
   */
  getDemoRestrictions(): Record<string, any> {
    return {
      maxBaselinesPerProject: 1,
      maxTasksPerBaseline: 10,
      maxProjects: 1,
      maxUsers: 1,
      maxResources: 5,
      maxTasks: 20,
      tooltipMessage: 'DEMO MODE – Limited functionality',
      dataRetention: '24 hours',
      features: {
        baseline: true,
        criticalPath: true,
        resourceAllocation: false,
        advancedAnalytics: false,
        customFields: false,
        integrations: false,
      },
    };
  }

  /**
   * Check if feature is available in demo mode
   */
  isFeatureAvailable(feature: string): boolean {
    const restrictions = this.getDemoRestrictions();
    return (
      restrictions.features[feature as keyof typeof restrictions.features] ||
      false
    );
  }

  /**
   * Get demo mode message
   */
  getDemoMessage(): string {
    return 'DEMO MODE – Limited functionality. Upgrade for full features.';
  }

  /**
   * Show demo mode notification
   */
  showDemoNotification(): void {
    if (this.isDemoMode) {
      console.log(this.getDemoMessage());
      // You can integrate with a notification system here
    }
  }
}

// Export singleton instance
export const demoModeService = new DemoModeService();
