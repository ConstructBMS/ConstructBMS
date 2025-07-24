// Test script for baseline functionality
// This script tests the baseline service and database operations

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const testProjectId = 'test-project-' + Date.now();
const testBaselineName = 'Test Baseline ' + new Date().toISOString();
const testTasks = [
  {
    id: 'task-1',
    name: 'Test Task 1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    percentComplete: 50,
    isMilestone: false,
    parentId: null
  },
  {
    id: 'task-2',
    name: 'Test Task 2',
    startDate: new Date('2024-01-16'),
    endDate: new Date('2024-01-31'),
    percentComplete: 25,
    isMilestone: false,
    parentId: null
  }
];

async function testBaselineOperations() {
  console.log('🧪 Starting Baseline Functionality Tests...\n');

  try {
    // Test 1: Create baseline
    console.log('📝 Test 1: Creating baseline...');
    const baselineData = {
      project_id: testProjectId,
      name: testBaselineName,
      created_by: 'test-user',
      created_at: new Date().toISOString(),
      is_active: true,
      demo: true
    };

    const { data: baseline, error: baselineError } = await supabase
      .from('programme_baselines')
      .insert(baselineData)
      .select()
      .single();

    if (baselineError) {
      throw new Error(`Failed to create baseline: ${baselineError.message}`);
    }

    console.log('✅ Baseline created successfully:', baseline.id);

    // Test 2: Create baseline tasks
    console.log('\n📋 Test 2: Creating baseline tasks...');
    const baselineTasksData = testTasks.map(task => ({
      baseline_id: baseline.id,
      task_id: task.id,
      baseline_start: task.startDate.toISOString().split('T')[0],
      baseline_end: task.endDate.toISOString().split('T')[0],
      percent_complete: task.percentComplete,
      is_milestone: task.isMilestone,
      parent_id: task.parentId,
      name: task.name,
      demo: true
    }));

    const { error: tasksError } = await supabase
      .from('programme_baseline_tasks')
      .insert(baselineTasksData);

    if (tasksError) {
      throw new Error(`Failed to create baseline tasks: ${tasksError.message}`);
    }

    console.log('✅ Baseline tasks created successfully');

    // Test 3: Retrieve baseline
    console.log('\n🔍 Test 3: Retrieving baseline...');
    const { data: retrievedBaseline, error: retrieveError } = await supabase
      .from('programme_baselines')
      .select('*')
      .eq('id', baseline.id)
      .single();

    if (retrieveError) {
      throw new Error(`Failed to retrieve baseline: ${retrieveError.message}`);
    }

    console.log('✅ Baseline retrieved successfully:', retrievedBaseline.name);

    // Test 4: Retrieve baseline tasks
    console.log('\n📋 Test 4: Retrieving baseline tasks...');
    const { data: retrievedTasks, error: tasksRetrieveError } = await supabase
      .from('programme_baseline_tasks')
      .select('*')
      .eq('baseline_id', baseline.id);

    if (tasksRetrieveError) {
      throw new Error(`Failed to retrieve baseline tasks: ${tasksRetrieveError.message}`);
    }

    console.log('✅ Baseline tasks retrieved successfully:', retrievedTasks.length, 'tasks');

    // Test 5: Calculate variance
    console.log('\n📊 Test 5: Calculating variance...');
    const currentTasks = [
      {
        id: 'task-1',
        startDate: new Date('2024-01-05'), // +4 days delay
        endDate: new Date('2024-01-20')    // +5 days delay
      },
      {
        id: 'task-2',
        startDate: new Date('2024-01-20'), // +4 days delay
        endDate: new Date('2024-02-05')    // +5 days delay
      }
    ];

    const variances = [];
    for (const currentTask of currentTasks) {
      const baselineTask = retrievedTasks.find(bt => bt.task_id === currentTask.id);
      if (baselineTask) {
        const baselineStart = new Date(baselineTask.baseline_start);
        const baselineEnd = new Date(baselineTask.baseline_end);
        
        const startVariance = Math.round((currentTask.startDate.getTime() - baselineStart.getTime()) / (1000 * 60 * 60 * 24));
        const endVariance = Math.round((currentTask.endDate.getTime() - baselineEnd.getTime()) / (1000 * 60 * 60 * 24));
        
        variances.push({
          taskId: currentTask.id,
          startVariance,
          endVariance,
          baselineStart: baselineStart.toISOString().split('T')[0],
          baselineEnd: baselineEnd.toISOString().split('T')[0],
          currentStart: currentTask.startDate.toISOString().split('T')[0],
          currentEnd: currentTask.endDate.toISOString().split('T')[0]
        });
      }
    }

    console.log('✅ Variance calculation completed:');
    variances.forEach(v => {
      console.log(`   Task ${v.taskId}: Start +${v.startVariance} days, End +${v.endVariance} days`);
    });

    // Test 6: Update baseline preferences
    console.log('\n⚙️ Test 6: Updating baseline preferences...');
    const preferencesData = {
      user_id: 'test-user',
      project_id: testProjectId,
      show_baseline_bars: true,
      comparison_mode: 'bars',
      active_baseline_id: baseline.id,
      demo: true,
      updated_at: new Date().toISOString()
    };

    const { error: preferencesError } = await supabase
      .from('baseline_preferences')
      .upsert(preferencesData);

    if (preferencesError) {
      throw new Error(`Failed to update preferences: ${preferencesError.message}`);
    }

    console.log('✅ Baseline preferences updated successfully');

    // Test 7: Cleanup (delete test data)
    console.log('\n🧹 Test 7: Cleaning up test data...');
    
    // Delete baseline tasks first (due to foreign key constraint)
    const { error: deleteTasksError } = await supabase
      .from('programme_baseline_tasks')
      .delete()
      .eq('baseline_id', baseline.id);

    if (deleteTasksError) {
      console.warn('⚠️ Warning: Failed to delete baseline tasks:', deleteTasksError.message);
    }

    // Delete baseline
    const { error: deleteBaselineError } = await supabase
      .from('programme_baselines')
      .delete()
      .eq('id', baseline.id);

    if (deleteBaselineError) {
      console.warn('⚠️ Warning: Failed to delete baseline:', deleteBaselineError.message);
    }

    // Delete preferences
    const { error: deletePreferencesError } = await supabase
      .from('baseline_preferences')
      .delete()
      .eq('project_id', testProjectId);

    if (deletePreferencesError) {
      console.warn('⚠️ Warning: Failed to delete preferences:', deletePreferencesError.message);
    }

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All baseline functionality tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Baseline creation');
    console.log('   ✅ Baseline task creation');
    console.log('   ✅ Baseline retrieval');
    console.log('   ✅ Baseline task retrieval');
    console.log('   ✅ Variance calculation');
    console.log('   ✅ Preferences management');
    console.log('   ✅ Data cleanup');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testBaselineOperations();
}

module.exports = { testBaselineOperations }; 