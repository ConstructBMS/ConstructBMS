import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  CheckSquare,
  Users,
  Trophy,
  FileText,
  User,
  Settings,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  activityStreamService,
  ActivityEvent,
} from '../../services/activityStream';

interface ActivityStreamProps {
  onNavigateToModule?: (module: string) => void;
}

const ActivityStream: React.FC<ActivityStreamProps> = ({
  onNavigateToModule,
}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>(
    []
  );
  const [stats, setStats] = useState(activityStreamService.getActivityStats());
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    priority: '',
    read: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'type'>(
    'timestamp'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = activityStreamService.subscribe(newActivities => {
      setActivities(newActivities);
      setStats(activityStreamService.getActivityStats());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(
        activity => activity.category === filters.category
      );
    }
    if (filters.priority) {
      filtered = filtered.filter(
        activity => activity.priority === filters.priority
      );
    }
    if (filters.read !== '') {
      filtered = filtered.filter(
        activity => activity.read === (filters.read === 'true')
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        activity =>
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description.toLowerCase().includes(searchLower) ||
          activity.entityName?.toLowerCase().includes(searchLower) ||
          activity.userName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredActivities(filtered);
  }, [activities, filters, sortBy, sortOrder]);

  const handleActivityClick = (activity: ActivityEvent) => {
    if (!activity.read) {
      activityStreamService.markAsRead(activity.id);
    }

    if (activity.actionable && activity.actionUrl) {
      // Extract module from actionUrl and navigate
      const module = activity.actionUrl.split('/')[1];
      if (onNavigateToModule && module) {
        onNavigateToModule(module);
      }
    }
  };

  const handleMarkAllRead = () => {
    activityStreamService.markAllAsRead();
  };

  const handleDeleteSelected = () => {
    selectedActivities.forEach(id => {
      activityStreamService.deleteActivity(id);
    });
    setSelectedActivities([]);
  };

  const handleSelectAll = () => {
    if (selectedActivities.length === filteredActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(filteredActivities.map(a => a.id));
    }
  };

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const getIcon = (iconName?: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      Building2,
      CheckCircle,
      Users,
      Trophy,
      FileText,
      User,
      Settings,
      MessageSquare,
      Calendar,
      TrendingUp,
      AlertTriangle,
      Clock,
    };
    return iconMap[iconName || 'Bell'] || Bell;
  };

  const getPriorityColor = (priority: ActivityEvent['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString('en-GB');
  };

  const activityTypes = [
    'project',
    'task',
    'client',
    'deal',
    'document',
    'user',
    'system',
    'notification',
  ];
  const categories = [
    'created',
    'updated',
    'completed',
    'deleted',
    'assigned',
    'commented',
    'approved',
    'rejected',
    'reminder',
    'alert',
  ];
  const priorities = ['urgent', 'high', 'medium', 'low'];

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem(
      'activityStreamStatsExpanded',
      JSON.stringify(newState)
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Activity Stream</h1>
        <p className='text-gray-600'>
          Monitor all system activities and notifications
        </p>
      </div>

      {/* Stats Cards */}
      <div className='mt-4'>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          Activity Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-4 flex items-center'>
              <Bell className='h-8 w-8 text-archer-neon mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Total Activities</p>
                <p className='text-2xl font-bold'>{stats.total}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-4 flex items-center'>
              <AlertCircle className='h-8 w-8 text-yellow-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Unread</p>
                <p className='text-2xl font-bold'>{stats.unread}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-4 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Read</p>
                <p className='text-2xl font-bold'>{stats.read}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-4 flex items-center'>
              <TrendingUp className='h-8 w-8 text-blue-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Today</p>
                <p className='text-2xl font-bold'>
                  {
                    activities.filter(a => {
                      const today = new Date();
                      const activityDate = new Date(a.timestamp);
                      return (
                        activityDate.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className='bg-white rounded-xl border p-4'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search activities...'
                value={filters.search}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
            >
              <Filter className='h-4 w-4' />
              Filters
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
            >
              <option value='timestamp'>Sort by Time</option>
              <option value='priority'>Sort by Priority</option>
              <option value='type'>Sort by Type</option>
            </select>
            <button
              onClick={() =>
                setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
              }
              className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              onClick={handleMarkAllRead}
              className='flex items-center gap-2 px-4 py-2 bg-archer-neon text-black rounded-lg hover:bg-archer-green transition-colors'
            >
              <CheckCircle className='h-4 w-4' />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, type: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                >
                  <option value=''>All Types</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, category: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                >
                  <option value=''>All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, priority: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                >
                  <option value=''>All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <select
                  value={filters.read}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, read: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                >
                  <option value=''>All</option>
                  <option value='false'>Unread</option>
                  <option value='true'>Read</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className='bg-white rounded-xl border'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <input
                type='checkbox'
                checked={
                  selectedActivities.length === filteredActivities.length &&
                  filteredActivities.length > 0
                }
                onChange={handleSelectAll}
                className='rounded border-gray-300 text-archer-neon focus:ring-archer-neon'
              />
              <span className='text-sm text-gray-600'>
                {selectedActivities.length > 0
                  ? `${selectedActivities.length} selected`
                  : `${filteredActivities.length} activities`}
              </span>
            </div>

            {selectedActivities.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className='flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg'
              >
                <Trash2 className='h-4 w-4' />
                Delete Selected
              </button>
            )}
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {filteredActivities.length > 0 ? (
            filteredActivities.map(activity => {
              const IconComponent = getIcon(activity.icon);
              return (
                <div
                  key={activity.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !activity.read
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className='flex items-start gap-3'>
                    <input
                      type='checkbox'
                      checked={selectedActivities.includes(activity.id)}
                      onChange={e => {
                        e.stopPropagation();
                        handleSelectActivity(activity.id);
                      }}
                      className='mt-1 rounded border-gray-300 text-archer-neon focus:ring-archer-neon'
                    />

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.color === 'blue'
                          ? 'bg-blue-100'
                          : activity.color === 'green'
                            ? 'bg-green-100'
                            : activity.color === 'purple'
                              ? 'bg-purple-100'
                              : activity.color === 'gold'
                                ? 'bg-yellow-100'
                                : activity.color === 'red'
                                  ? 'bg-red-100'
                                  : activity.color === 'orange'
                                    ? 'bg-orange-100'
                                    : 'bg-gray-100'
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          activity.color === 'blue'
                            ? 'text-blue-600'
                            : activity.color === 'green'
                              ? 'text-green-600'
                              : activity.color === 'purple'
                                ? 'text-purple-600'
                                : activity.color === 'gold'
                                  ? 'text-yellow-600'
                                  : activity.color === 'red'
                                    ? 'text-red-600'
                                    : activity.color === 'orange'
                                      ? 'text-orange-600'
                                      : 'text-gray-600'
                        }`}
                      />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3
                            className={`text-sm font-medium ${
                              !activity.read ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {activity.title}
                          </h3>
                          <p className='text-sm text-gray-600 mt-1'>
                            {activity.description}
                          </p>
                        </div>
                        <div className='flex items-center gap-2 ml-4'>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priority)}`}
                          >
                            {activity.priority}
                          </span>
                          <div className='flex items-center text-xs text-gray-500'>
                            <Clock className='h-3 w-3 mr-1' />
                            {formatTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                        {activity.userName && (
                          <span>By {activity.userName}</span>
                        )}
                        {activity.entityName && (
                          <span>• {activity.entityName}</span>
                        )}
                        <span>• {activity.type}</span>
                        <span>• {activity.category}</span>
                      </div>
                    </div>

                    <div className='flex items-center gap-1'>
                      {!activity.read && (
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      )}
                      {activity.actionable && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleActivityClick(activity);
                          }}
                          className='p-1 text-gray-400 hover:text-gray-600'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='p-8 text-center text-gray-500'>
              <Bell className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>No activities found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityStream;
