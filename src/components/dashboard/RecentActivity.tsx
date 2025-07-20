import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  User,
  Clock,
} from 'lucide-react';
import { dataSourceService } from '../../services/dataSourceService';

interface Activity {
  color: string;
  description: string;
  icon: any;
  id: number;
  time: string;
  title: string;
  type: 'document' | 'message' | 'task' | 'alert' | 'user';
  projectData?: any;
  taskData?: any;
  clientData?: any;
  dealData?: any;
}

interface RecentActivityProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  onNavigateToModule,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const generateActivities = async () => {
      try {
        const projects = await dataSourceService.getProjects();
        const tasks = await dataSourceService.getTasks();
        const deals = await dataSourceService.getDeals();
        const clients = await dataSourceService.getCustomers();

        const newActivities: Activity[] = [];

        // Generate activities based on real data
        if (projects.length > 0) {
          const recentProject = projects[0];
          newActivities.push({
            id: 1,
            type: 'document',
            title: 'Project update',
            description: `${recentProject.name} progress updated to ${Math.round(recentProject.progress * 100) / 100}%`,
            time: '2 hours ago',
            icon: FileText,
            color: 'green',
            projectData: recentProject,
          });
        }

        if (clients.length > 0) {
          const recentClient = clients[0];
          newActivities.push({
            id: 2,
            type: 'message',
            title: 'Client message received',
            description: `Message from ${recentClient.name} about project timeline`,
            time: '4 hours ago',
            icon: MessageCircle,
            color: 'blue',
          });
        }

        if (tasks.length > 0) {
          const completedTask = tasks.find((t: any) => t.status === 'completed');
          if (completedTask) {
            newActivities.push({
              id: 3,
              type: 'task',
              title: 'Task completed',
              description: `${completedTask.title} has been completed`,
              time: '6 hours ago',
              icon: CheckCircle,
              color: 'green',
              taskData: completedTask,
            });
          }
        }

        if (projects.length > 0) {
          const behindScheduleProject = projects.find(
            p => p.status === 'Behind Schedule'
          );
          if (behindScheduleProject) {
            newActivities.push({
              id: 4,
              type: 'alert',
              title: 'Deadline reminder',
              description: `${behindScheduleProject.name} deadline approaching`,
              time: '8 hours ago',
              icon: AlertTriangle,
              color: 'orange',
              projectData: behindScheduleProject,
            });
          }
        }

        if (deals.length > 0) {
          const wonDeal = deals.find(d => d.stage === 'won');
          if (wonDeal) {
            newActivities.push({
              id: 5,
              type: 'user',
              title: 'Deal won',
              description: `Successfully won deal: ${wonDeal.title}`,
              time: '1 day ago',
              icon: User,
              color: 'purple',
            });
          }
        }

        setActivities(newActivities);
      } catch (error) {
        console.error('Error generating activities:', error);
        setActivities([]);
      }
    };

    generateActivities();
  }, []);

  const handleViewAll = () => {
    if (onNavigateToModule) {
      onNavigateToModule('notifications');
    } else {
      alert('Navigating to Activity Log...');
    }
  };

  const handleActivityClick = (activity: Activity) => {
    switch (activity.type) {
      case 'document':
        if (onNavigateToModule && activity.projectData) {
          onNavigateToModule('projects', { openProject: activity.projectData });
        } else if (onNavigateToModule) {
          onNavigateToModule('projects');
        }
        break;
      case 'message':
        if (onNavigateToModule) {
          onNavigateToModule('chat');
        }
        break;
      case 'task':
        if (onNavigateToModule && activity.taskData) {
          onNavigateToModule('tasks', { openTask: activity.taskData });
        } else if (onNavigateToModule) {
          onNavigateToModule('tasks');
        }
        break;
      case 'alert':
        if (onNavigateToModule && activity.projectData) {
          onNavigateToModule('projects', { openProject: activity.projectData });
        } else if (onNavigateToModule) {
          onNavigateToModule('notifications');
        }
        break;
      case 'user':
        if (onNavigateToModule) {
          onNavigateToModule('sales');
        }
        break;
      default:
        alert(`Viewing activity: ${activity.title}`);
    }
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='space-y-3 flex-1 overflow-y-auto'>
        {activities.length > 0 ? (
          activities.map(activity => (
            <div
              key={activity.id}
              className='flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'
              onClick={() => handleActivityClick(activity)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center bg-${activity.color}-100 flex-shrink-0`}
              >
                <activity.icon
                  className={`h-4 w-4 text-${activity.color}-600`}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {activity.title}
                </p>
                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                  {activity.description}
                </p>
                <div className='flex items-center mt-2 text-xs text-gray-400'>
                  <Clock className='h-3 w-3 mr-1 flex-shrink-0' />
                  {activity.time}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <Clock className='h-12 w-12 mx-auto mb-4 text-gray-300' />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
