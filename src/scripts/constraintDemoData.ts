import { supabase } from '../services/supabase';
import { taskConstraintService } from '../services/taskConstraintService';

export interface DemoConstraint {
  constraintDate: string;
  constraintReason: string;
  constraintType: 'none' | 'MSO' | 'MFO' | 'SNET' | 'FNLT';
  taskId: string;
}

export const demoConstraints: DemoConstraint[] = [
  {
    taskId: 'demo_task_1',
    constraintType: 'SNET',
    constraintDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
    constraintReason: 'Material delivery scheduled'
  },
  {
    taskId: 'demo_task_2',
    constraintType: 'SNET',
    constraintDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
    constraintReason: 'Site preparation required'
  }
];

export async function initializeConstraintDemoData(projectId: string = 'demo_project') {
  try {
    console.log('Initializing constraint demo data...');

    // First, ensure we have some demo tasks
    const { data: existingTasks } = await supabase
      .from('programme_tasks')
      .select('id, name')
      .eq('project_id', projectId)
      .limit(5);

    if (!existingTasks || existingTasks.length === 0) {
      console.log('No existing tasks found, creating demo tasks first...');
      
      // Create demo tasks
      const demoTasks = [
        {
          name: 'Foundation Work',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project_id: projectId,
          demo: true
        },
        {
          name: 'Structural Steel',
          start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project_id: projectId,
          demo: true
        },
        {
          name: 'Roof Installation',
          start_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project_id: projectId,
          demo: true
        }
      ];

      const { data: createdTasks, error: createError } = await supabase
        .from('programme_tasks')
        .insert(demoTasks)
        .select('id, name');

      if (createError) {
        console.error('Error creating demo tasks:', createError);
        return;
      }

      console.log('Created demo tasks:', createdTasks);
    }

    // Get tasks to apply constraints to
    const { data: tasks } = await supabase
      .from('programme_tasks')
      .select('id, name')
      .eq('project_id', projectId)
      .eq('demo', true)
      .limit(3);

    if (!tasks || tasks.length === 0) {
      console.log('No demo tasks found for constraint application');
      return;
    }

    // Apply constraints to tasks
    for (let i = 0; i < Math.min(tasks.length, demoConstraints.length); i++) {
      const task = tasks[i];
      const constraint = demoConstraints[i];

      try {
        const result = await taskConstraintService.saveTaskConstraint({
          taskId: task.id,
          constraintType: constraint.constraintType,
          constraintDate: constraint.constraintDate,
          constraintReason: constraint.constraintReason,
          demo: true
        });

        if (result.success) {
          console.log(`Applied constraint to task "${task.name}":`, result.constraint);
        } else {
          console.error(`Failed to apply constraint to task "${task.name}":`, result.error);
        }
      } catch (error) {
        console.error(`Error applying constraint to task "${task.name}":`, error);
      }
    }

    console.log('Constraint demo data initialization complete');
  } catch (error) {
    console.error('Error initializing constraint demo data:', error);
  }
}

export async function clearConstraintDemoData(projectId: string = 'demo_project') {
  try {
    console.log('Clearing constraint demo data...');

    // Clear all constraints from demo tasks
    const { error } = await supabase
      .from('programme_tasks')
      .update({
        constraint_type: null,
        constraint_date: null,
        constraint_reason: null
      })
      .eq('project_id', projectId)
      .eq('demo', true);

    if (error) {
      console.error('Error clearing constraint demo data:', error);
    } else {
      console.log('Constraint demo data cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing constraint demo data:', error);
  }
}

export async function getConstraintDemoStats(projectId: string = 'demo_project') {
  try {
    const { data: constraints } = await supabase
      .from('programme_tasks')
      .select('constraint_type, constraint_date, constraint_reason')
      .eq('project_id', projectId)
      .eq('demo', true)
      .not('constraint_type', 'is', null);

    const { data: violations } = await supabase
      .from('task_constraint_violations')
      .select('*')
      .eq('demo', true);

    return {
      totalConstraints: constraints?.length || 0,
      constraintTypes: constraints?.map(c => c.constraint_type) || [],
      violations: violations?.length || 0,
      violationDetails: violations || []
    };
  } catch (error) {
    console.error('Error getting constraint demo stats:', error);
    return {
      totalConstraints: 0,
      constraintTypes: [],
      violations: 0,
      violationDetails: []
    };
  }
} 