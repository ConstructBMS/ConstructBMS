import { supabase } from '../services/supabase';

// Demo project data
const demoProject = {
  id: 'demo-project',
  name: 'Progress Tracking Demo Project',
  description: 'A demo project to showcase progress tracking features',
  start_date: '2024-01-01',
  end_date: '2024-06-30',
  status: 'in-progress',
  progress: 45,
  manager_id: null, // Will be set to current user
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Demo tasks with progress data
const demoTasks = [
  {
    id: 'demo-task-1',
    project_id: 'demo-project',
    name: 'Project Planning',
    description: 'Initial project planning and requirements gathering',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    duration: 15,
    progress: 100,
    percent_complete: 100,
    actual_start_date: '2024-01-01',
    actual_finish_date: '2024-01-12',
    status: 'completed',
    priority: 'high',
    level: 0,
    demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-task-2',
    project_id: 'demo-project',
    name: 'Design Phase',
    description: 'System design and architecture planning',
    start_date: '2024-01-16',
    end_date: '2024-02-15',
    duration: 31,
    progress: 75,
    percent_complete: 75,
    actual_start_date: '2024-01-16',
    actual_finish_date: null,
    status: 'in-progress',
    priority: 'high',
    level: 0,
    demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-task-3',
    project_id: 'demo-project',
    name: 'Development Phase',
    description: 'Core development work',
    start_date: '2024-02-16',
    end_date: '2024-04-15',
    duration: 59,
    progress: 45,
    percent_complete: 45,
    actual_start_date: '2024-02-20',
    actual_finish_date: null,
    status: 'in-progress',
    priority: 'medium',
    level: 0,
    demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-task-4',
    project_id: 'demo-project',
    name: 'Testing Phase',
    description: 'Comprehensive testing and quality assurance',
    start_date: '2024-04-16',
    end_date: '2024-05-15',
    duration: 30,
    progress: 0,
    percent_complete: 0,
    actual_start_date: null,
    actual_finish_date: null,
    status: 'not-started',
    priority: 'medium',
    level: 0,
    demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-task-5',
    project_id: 'demo-project',
    name: 'Deployment',
    description: 'Final deployment and go-live',
    start_date: '2024-05-16',
    end_date: '2024-06-30',
    duration: 46,
    progress: 0,
    percent_complete: 0,
    actual_start_date: null,
    actual_finish_date: null,
    status: 'not-started',
    priority: 'high',
    level: 0,
    demo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function initializeProgressDemo() {
  try {
    console.log('🚀 Initializing Progress Tracking Demo...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ No authenticated user found');
      return false;
    }

    // Set manager_id for demo project
    demoProject.manager_id = user.id;

    // Check if demo project already exists
    const { data: existingProject } = await supabase
      .from('asta_projects')
      .select('id')
      .eq('id', demoProject.id)
      .single();

    if (!existingProject) {
      // Create demo project
      const { error: projectError } = await supabase
        .from('asta_projects')
        .insert(demoProject);

      if (projectError) {
        console.error('❌ Error creating demo project:', projectError);
        return false;
      }
      console.log('✅ Demo project created');
    } else {
      console.log('ℹ️ Demo project already exists');
    }

    // Check if demo tasks already exist
    const { data: existingTasks } = await supabase
      .from('asta_tasks')
      .select('id')
      .eq('project_id', demoProject.id);

    if (!existingTasks || existingTasks.length === 0) {
      // Create demo tasks
      const { error: tasksError } = await supabase
        .from('asta_tasks')
        .insert(demoTasks);

      if (tasksError) {
        console.error('❌ Error creating demo tasks:', tasksError);
        return false;
      }
      console.log('✅ Demo tasks created');
    } else {
      console.log('ℹ️ Demo tasks already exist');
    }

    console.log('🎉 Progress Tracking Demo initialized successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error initializing progress demo:', error);
    return false;
  }
}

// Auto-initialize if this script is run directly
if (typeof window !== 'undefined') {
  // Browser environment - expose function globally
  (window as any).initializeProgressDemo = initializeProgressDemo;
} else {
  // Node.js environment - run immediately
  initializeProgressDemo().then(success => {
    if (success) {
      console.log('✅ Progress demo initialization completed');
      process.exit(0);
    } else {
      console.error('❌ Progress demo initialization failed');
      process.exit(1);
    }
  });
} 