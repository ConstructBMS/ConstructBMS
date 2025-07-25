// Demo Data Initialization Helper
// This script will help you initialize demo data after setting up the database

import { supabase } from './src/services/supabase';

// Simple demo data initialization
async function initializeBasicDemoData() {
  console.log(' Initializing basic demo data...');

  try {
    // Create a sample project
    const { data: project, error: projectError } = await supabase
      .from('asta_projects')
      .insert({
        name: 'Sample Construction Project',
        description: 'A sample project to test the system',
        client: 'Demo Client',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'planning',
        progress: 0,
        budget: 1000000,
        manager_id: null // Will be set when user is created
      })
      .select()
      .single();

    if (projectError) {
      console.error(' Error creating project:', projectError);
      return;
    }

    console.log(' Sample project created:', project);

    // Create sample tasks
    const sampleTasks = [
      {
        project_id: project.id,
        name: 'Site Preparation',
        description: 'Prepare the construction site',
        start_date: '2024-01-01',
        duration: 5,
        status: 'not-started',
        priority: 'high',
        wbs_number: '1.1',
        level: 1
      },
      {
        project_id: project.id,
        name: 'Foundation Work',
        description: 'Excavate and pour foundation',
        start_date: '2024-01-06',
        duration: 10,
        status: 'not-started',
        priority: 'high',
        wbs_number: '1.2',
        level: 1
      },
      {
        project_id: project.id,
        name: 'Structural Framework',
        description: 'Build the main structure',
        start_date: '2024-01-16',
        duration: 15,
        status: 'not-started',
        priority: 'medium',
        wbs_number: '1.3',
        level: 1
      }
    ];

    const { data: tasks, error: tasksError } = await supabase
      .from('asta_tasks')
      .insert(sampleTasks)
      .select();

    if (tasksError) {
      console.error(' Error creating tasks:', tasksError);
      return;
    }

    console.log(' Sample tasks created:', tasks);

    // Create sample timeline phases
    const samplePhases = [
      {
        project_id: project.id,
        name: 'Planning Phase',
        description: 'Project planning and preparation',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        color: '#3b82f6',
        sequence: 1
      },
      {
        project_id: project.id,
        name: 'Construction Phase',
        description: 'Main construction activities',
        start_date: '2024-02-01',
        end_date: '2024-10-31',
        color: '#10b981',
        sequence: 2
      },
      {
        project_id: project.id,
        name: 'Completion Phase',
        description: 'Final touches and handover',
        start_date: '2024-11-01',
        end_date: '2024-12-31',
        color: '#f59e0b',
        sequence: 3
      }
    ];

    const { data: phases, error: phasesError } = await supabase
      .from('timeline_phases')
      .insert(samplePhases)
      .select();

    if (phasesError) {
      console.error(' Error creating phases:', phasesError);
      return;
    }

    console.log(' Sample timeline phases created:', phases);

    console.log(' Basic demo data initialization completed!');
    console.log(' Created:');
    console.log('- 1 project');
    console.log('- 3 tasks');
    console.log('- 3 timeline phases');

  } catch (error) {
    console.error(' Error initializing demo data:', error);
  }
}

// Export the function
export { initializeBasicDemoData };

// Run if this file is executed directly
if (typeof window !== 'undefined') {
  // In browser environment, you can call this function
  window.initializeBasicDemoData = initializeBasicDemoData;
}
