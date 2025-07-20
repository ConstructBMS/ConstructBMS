import React from 'react';
import { demoDataService } from '../services/demoData';

const DemoDataInitializer: React.FC = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleRegenerateAll = async () => {
    setIsGenerating(true);
    setMessage('🔄 Regenerating all demo data...');
    try {
      await demoDataService.resetToDemo();
      setMessage('✅ All demo data regenerated successfully!');
    } catch (error) {
      setMessage('❌ Error regenerating demo data: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateGanttTasks = async () => {
    setIsGenerating(true);
    setMessage('🔄 Regenerating Gantt tasks...');
    try {
      await demoDataService.regenerateGanttTasks();
      const ganttTasks = await demoDataService.getGanttTasks();
      setMessage(`✅ Gantt tasks regenerated successfully! (${ganttTasks.length} tasks created)`);
    } catch (error) {
      setMessage('❌ Error regenerating Gantt tasks: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckGanttTasks = async () => {
    try {
      const ganttTasks = await demoDataService.getGanttTasks();
      setMessage(`📊 Found ${ganttTasks.length} Gantt tasks in storage`);
      console.log('Gantt tasks:', ganttTasks);
    } catch (error) {
      setMessage('❌ Error checking Gantt tasks: ' + error);
    }
  };

  const handleEnsureDemoData = async () => {
    setIsGenerating(true);
    setMessage('🔄 Ensuring demo data exists...');
    try {
      await demoDataService.ensureDemoDataExists();
      setMessage('✅ Demo data ensured successfully!');
    } catch (error) {
      setMessage('❌ Error ensuring demo data: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestGanttTasks = async () => {
    setIsGenerating(true);
    setMessage('🔄 Testing Gantt tasks...');
    try {
      const ganttTasks = await demoDataService.getGanttTasks();
      setMessage(`📊 Found ${ganttTasks.length} Gantt tasks in storage.`);
      console.log('Gantt tasks:', ganttTasks);
      
      // Also check localStorage directly
      const rawStorage = localStorage.getItem('demoGanttTasks');
      console.log('Raw localStorage data:', rawStorage);
      if (rawStorage) {
        const parsed = JSON.parse(rawStorage);
        console.log('Parsed localStorage data:', parsed);
        console.log('First task sample:', parsed[0]);
      }
    } catch (error) {
      setMessage('❌ Error testing Gantt tasks: ' + error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Demo Data Controls
        </h3>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleRegenerateAll}
            className="px-4 py-2 bg-constructbms-blue text-black rounded hover:bg-constructbms-blue/80 transition-colors"
          >
            Regenerate All Demo Data
          </button>
          <button
            onClick={handleRegenerateGanttTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Regenerate Gantt Tasks
          </button>
          <button
            onClick={handleCheckGanttTasks}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Check Gantt Tasks
          </button>
          <button
            onClick={handleEnsureDemoData}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Ensure Demo Data Exists
          </button>
          <button
            onClick={handleTestGanttTasks}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Test Gantt Tasks
          </button>
        </div>
        
        {message && (
          <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoDataInitializer; 
