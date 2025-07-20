import React, { useState, useEffect } from 'react';
import { ganttCanvasService } from '../../services/ganttCanvasService';
import GanttCanvas from './GanttCanvas';
import SimpleGanttChart from './SimpleGanttChart';
import type { GanttTask, GanttLink } from './GanttCanvas';

const GanttCanvasTest: React.FC = () => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [links, setLinks] = useState<GanttLink[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Get demo data from service
      const demoTasks = await ganttCanvasService.getProjectTasks('demo-project');
      const demoLinks = await ganttCanvasService.getProjectLinks('demo-project');
      
      console.log('Demo tasks:', demoTasks);
      console.log('Demo links:', demoLinks);
      
      if (demoTasks.length > 0) {
        setTasks(demoTasks);
        
        // Calculate date range
        const dates = demoTasks.map(task => [task.startDate, task.endDate]).flat();
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        // Add some padding
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);
        
        setStartDate(minDate);
        setEndDate(maxDate);
      }
      
      if (demoLinks.length > 0) {
        setLinks(demoLinks);
      }
      
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    console.log('Task update:', taskId, updates);
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleTaskSelect = (taskId: string) => {
    console.log('Task selected:', taskId);
    setSelectedTaskId(taskId);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-lg font-semibold mb-4">Loading Gantt Chart...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Gantt Chart Test</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Tasks:</strong> {tasks.length}
          </div>
          <div>
            <strong>Links:</strong> {links.length}
          </div>
          <div>
            <strong>Date Range:</strong> {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
          <div>
            <strong>Selected Task:</strong> {selectedTaskId || 'None'}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Simple Gantt Chart</h2>
        <SimpleGanttChart
          tasks={tasks}
          links={links}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Full Gantt Canvas</h2>
        <div className="border rounded-lg overflow-hidden">
          <GanttCanvas
            tasks={tasks}
            links={links}
            startDate={startDate}
            endDate={endDate}
            zoomLevel={7} // Week view
            showGridlines={true}
            showTaskLinks={true}
            showFloat={true}
            onTaskUpdate={handleTaskUpdate}
            onTaskSelect={handleTaskSelect}
            selectedTaskId={selectedTaskId}
            userRole="project_manager"
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <pre>{JSON.stringify({ tasks: tasks.length, links: links.length, startDate, endDate }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default GanttCanvasTest; 