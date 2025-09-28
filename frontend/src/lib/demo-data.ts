/**
 * DemoDataManager - Manages demo data operations
 * This is a simplified implementation to replace the deleted demo-data.ts file
 */

export class DemoDataManager {
  /**
   * Clear all demo data from localStorage
   */
  static clearAllDemoData(): void {
    // Clear all demo-related data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('demo') || key.includes('Demo'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Also clear any demo mode related stores
    localStorage.removeItem('demo-mode-store');
  }

  /**
   * Check if demo data exists
   */
  static hasDemoData(): boolean {
    // Check if any demo-related data exists in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('demo') || key.includes('Demo'))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Export demo data as JSON string
   */
  static exportDemoData(): string {
    const demoData: Record<string, any> = {};

    // Collect all demo-related data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('demo') || key.includes('Demo'))) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            demoData[key] = JSON.parse(value);
          } catch {
            demoData[key] = value;
          }
        }
      }
    }

    return JSON.stringify(demoData, null, 2);
  }

  /**
   * Import demo data from JSON string
   */
  static importDemoData(data: string): void {
    try {
      const demoData = JSON.parse(data);

      // Clear existing demo data first
      this.clearAllDemoData();

      // Import new demo data
      Object.entries(demoData).forEach(([key, value]) => {
        localStorage.setItem(
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      });
    } catch (error) {
      console.error('Failed to import demo data:', error);
      throw new Error('Invalid demo data format');
    }
  }
}
