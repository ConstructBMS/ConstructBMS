// Demo Data Initialization Utility
// Simple initialization for comprehensive demo data

import { demoDataService } from '../services/demoDataService';

export async function initializeDemoData() {
  console.log('🚀 Initializing comprehensive demo data for Napwood...');

  try {
    // Generate comprehensive demo data
    const demoDataConfig = {
      projects: 15,
      tasksPerProject: 25,
      users: 50,
      customers: 30,
      contractors: 20,
      documents: 100,
      emails: 200,
      financialRecords: 500,
      timeEntries: 1000,
      includeAdvancedFeatures: true
    };

    console.log('📊 Generating demo data with config:', demoDataConfig);

    // Generate main demo data
    const summary = await demoDataService.generateDemoData(demoDataConfig);
    console.log('✅ Demo data generated:', summary);

    console.log('🎉 Demo data initialization completed successfully!');
    console.log('📈 Generated data summary:');
    console.log('- Projects:', summary.projects);
    console.log('- Users:', summary.users);
    console.log('- Tasks:', summary.totalTasks);
    console.log('- Documents:', summary.documents);
    console.log('- Financial Records:', summary.financialRecords);
    console.log('- Time Entries:', summary.timeEntries);

    return summary;
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
    throw error;
  }
}

// Function to check if demo data exists
export function hasDemoData(): boolean {
  try {
    const data = demoDataService.getDemoDataSummary();
    return data.projects > 0;
  } catch {
    return false;
  }
}

// Function to clear all demo data
export function clearDemoData(): void {
  demoDataService.clearDemoData();
  console.log('🗑️ All demo data cleared');
}

// Function to get demo data summary
export function getDemoDataSummary() {
  return demoDataService.getDemoDataSummary();
} 
