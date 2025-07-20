import React, { useState, useEffect } from 'react';
import {
  Plus,
  Tag,
  Calendar,
  User,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Save,
  X,
  Clock,
  Users,
  Code,
  Package,
  Globe,
  Database,
  Lock,
  Unlock,
  Star,
  Heart,
  Award,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface ChangelogEntry {
  affectedComponents: string[];
  author: string;
  breakingChanges?: string[];
  createdAt: string;
  date: string;
  description: string;
  id: string;
  isDraft: boolean;
  isPublic: boolean;
  migrationNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  roadmapItemId?: string;
  tags: string[];
  title: string;
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking' | 'security' | 'deprecation' | 'performance';
  updatedAt: string;
  version: string;
}

interface Version {
  date: string;
  description: string;
  downloadUrl?: string;
  entries: ChangelogEntry[];
  isLatest: boolean;
  isStable: boolean;
  releaseNotes?: string;
  title: string;
  version: string;
}

const Changelog: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'compact'>('timeline');

  // Load initial demo data
  useEffect(() => {
    const demoVersions: Version[] = [
      {
        version: 'v1.2.0',
        date: '2024-01-20',
        title: 'Enhanced Demo Data Management',
        description: 'Major improvements to demo data handling with better user controls and debugging capabilities.',
        isLatest: true,
        isStable: true,
        downloadUrl: 'https://github.com/constructbms-project/releases/v1.2.0',
        releaseNotes: 'This release focuses on improving the demo data management system with enhanced user controls and debugging tools.',
        entries: [
          {
            id: '1',
            version: 'v1.2.0',
            date: '2024-01-20',
            type: 'feature',
            title: 'Enhanced Demo Data Management',
            description: 'Added comprehensive demo data management with clear/regenerate controls and debugging tools.',
            author: 'Development Team',
            affectedComponents: ['DemoDataService', 'GeneralSettings', 'UserManagement'],
            priority: 'high',
            tags: ['demo-data', 'debugging', 'user-controls'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-20',
            updatedAt: '2024-01-20',
            roadmapItemId: '1'
          },
          {
            id: '2',
            version: 'v1.2.0',
            date: '2024-01-20',
            type: 'improvement',
            title: 'Improved Error Handling',
            description: 'Enhanced error handling and logging throughout the application with better user feedback.',
            author: 'Backend Team',
            affectedComponents: ['ErrorBoundary', 'Logger', 'NotificationSystem'],
            priority: 'medium',
            tags: ['error-handling', 'logging', 'user-feedback'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-20',
            updatedAt: '2024-01-20'
          },
          {
            id: '3',
            version: 'v1.2.0',
            date: '2024-01-20',
            type: 'bugfix',
            title: 'Fixed WebSocket Connection Issues',
            description: 'Resolved WebSocket connection failures and duplicate context initialization in chat service.',
            author: 'Frontend Team',
            affectedComponents: ['ChatService', 'WebSocketManager'],
            priority: 'high',
            tags: ['websocket', 'chat', 'connection'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-20',
            updatedAt: '2024-01-20'
          }
        ]
      },
      {
        version: 'v1.1.5',
        date: '2024-01-15',
        title: 'Performance Optimizations',
        description: 'Various performance improvements and bug fixes.',
        isLatest: false,
        isStable: true,
        downloadUrl: 'https://github.com/constructbms-project/releases/v1.1.5',
        entries: [
          {
            id: '4',
            version: 'v1.1.5',
            date: '2024-01-15',
            type: 'performance',
            title: 'Database Query Optimization',
            description: 'Optimized database queries for better performance and reduced load times.',
            author: 'Backend Team',
            affectedComponents: ['DatabaseService', 'QueryOptimizer'],
            priority: 'medium',
            tags: ['performance', 'database', 'optimization'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15'
          },
          {
            id: '5',
            version: 'v1.1.5',
            date: '2024-01-15',
            type: 'bugfix',
            title: 'Fixed Authentication Token Refresh',
            description: 'Resolved issues with authentication token refresh and session management.',
            author: 'Security Team',
            affectedComponents: ['AuthService', 'TokenManager'],
            priority: 'critical',
            tags: ['authentication', 'security', 'tokens'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15'
          }
        ]
      },
      {
        version: 'v1.1.0',
        date: '2024-01-10',
        title: 'New Dashboard Features',
        description: 'Added new dashboard widgets and improved user experience.',
        isLatest: false,
        isStable: true,
        downloadUrl: 'https://github.com/constructbms-project/releases/v1.1.0',
        entries: [
          {
            id: '6',
            version: 'v1.1.0',
            date: '2024-01-10',
            type: 'feature',
            title: 'Advanced Analytics Dashboard',
            description: 'Added comprehensive analytics dashboard with real-time metrics and customizable widgets.',
            author: 'Analytics Team',
            affectedComponents: ['Dashboard', 'AnalyticsWidget', 'MetricsService'],
            priority: 'high',
            tags: ['analytics', 'dashboard', 'metrics'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-10',
            updatedAt: '2024-01-10'
          },
          {
            id: '7',
            version: 'v1.1.0',
            date: '2024-01-10',
            type: 'improvement',
            title: 'Enhanced User Interface',
            description: 'Improved overall user interface with better responsive design and accessibility.',
            author: 'UI/UX Team',
            affectedComponents: ['ThemeSystem', 'ResponsiveDesign', 'Accessibility'],
            priority: 'medium',
            tags: ['ui', 'ux', 'responsive', 'accessibility'],
            isPublic: true,
            isDraft: false,
            createdAt: '2024-01-10',
            updatedAt: '2024-01-10'
          }
        ]
      }
    ];
    setVersions(demoVersions);
    setFilteredVersions(demoVersions);
  }, []);

  // Filter versions based on search and filters
  useEffect(() => {
    let filtered = versions;

    if (searchTerm) {
      filtered = filtered.filter(version =>
        version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.entries.some(entry =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.map(version => ({
        ...version,
        entries: version.entries.filter(entry => entry.type === typeFilter)
      })).filter(version => version.entries.length > 0);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.map(version => ({
        ...version,
        entries: version.entries.filter(entry => entry.priority === priorityFilter)
      })).filter(version => version.entries.length > 0);
    }

    if (selectedVersion !== 'all') {
      filtered = filtered.filter(version => version.version === selectedVersion);
    }

    setFilteredVersions(filtered);
  }, [versions, searchTerm, typeFilter, priorityFilter, selectedVersion]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Plus className="h-4 w-4" />;
      case 'bugfix': return <XCircle className="h-4 w-4" />;
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'breaking': return <AlertTriangle className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'deprecation': return <Info className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-green-600 bg-green-100';
      case 'bugfix': return 'text-red-600 bg-red-100';
      case 'improvement': return 'text-blue-600 bg-blue-100';
      case 'breaking': return 'text-orange-600 bg-orange-100';
      case 'security': return 'text-purple-600 bg-purple-100';
      case 'deprecation': return 'text-yellow-600 bg-yellow-100';
      case 'performance': return 'text-teal-600 bg-teal-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const generateNewVersion = () => {
    const latestVersion = versions.find(v => v.isLatest);
    if (latestVersion) {
      const versionParts = latestVersion.version.split('.');
      const major = parseInt(versionParts[0]?.substring(1) || '1');
      const minor = parseInt(versionParts[1] || '0');
      const patch = parseInt(versionParts[2] || '0');
      const newVersion = `v${major}.${minor}.${patch + 1}`;
      
      const newVersionObj: Version = {
        version: newVersion,
        date: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
        title: 'New Release',
        description: 'New features and improvements',
        isLatest: true,
        isStable: false,
        entries: []
      };

      // Update existing versions
      const updatedVersions = versions.map(v => ({ ...v, isLatest: false }));
      setVersions([newVersionObj, ...updatedVersions]);
    }
  };

  const renderTimelineView = () => (
    <div className="space-y-8">
      {filteredVersions.map(version => (
        <div key={version.version} className="relative">
          {/* Version Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full font-semibold ${
                version.isLatest ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-700'
              }`}>
                {version.version}
              </div>
              {version.isLatest && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Latest
                </span>
              )}
              {version.isStable && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Stable
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{version.title}</h3>
              <p className="text-gray-600">{version.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{version.date}</span>
              {version.downloadUrl && (
                <a
                  href={version.downloadUrl}
                  className="px-3 py-1 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-4">
            {version.entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(entry.type).split(' ')[1]}`}>
                      {getTypeIcon(entry.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                          {entry.priority}
                        </span>
                        {entry.isDraft && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{entry.date}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{entry.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {entry.author}</span>
                    {entry.affectedComponents.length > 0 && (
                      <span>{entry.affectedComponents.length} components affected</span>
                    )}
                  </div>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredVersions.flatMap(version =>
        version.entries.map(entry => (
          <div key={entry.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(entry.type).split(' ')[1]}`}>
                  {getTypeIcon(entry.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                    <span className="text-sm text-gray-500">v{entry.version}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                      {entry.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{entry.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {entry.author}</span>
                    <span>{entry.date}</span>
                    {entry.affectedComponents.length > 0 && (
                      <span>{entry.affectedComponents.length} components</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Edit className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCompactView = () => (
    <div className="space-y-6">
      {filteredVersions.map(version => (
        <div key={version.version} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{version.version}</h3>
              <span className="text-sm text-gray-500">{version.date}</span>
              {version.isLatest && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Latest
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{version.entries.length} changes</span>
              {version.downloadUrl && (
                <a
                  href={version.downloadUrl}
                  className="px-3 py-1 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {version.entries.map(entry => (
              <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${getTypeColor(entry.type).split(' ')[1]}`}>
                    {getTypeIcon(entry.type)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                    {entry.type}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">{entry.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Changelog</h1>
            <p className="text-gray-600">Track version history and release notes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateNewVersion}
              className="flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-black hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Version
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'timeline' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Activity className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <PieChart className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search changelog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
              />
            </div>

            {/* Version Filter */}
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
            >
              <option value="all">All Versions</option>
              {versions.map(version => (
                <option key={version.version} value={version.version}>
                  {version.version}
                </option>
              ))}
            </select>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredVersions.reduce((total, v) => total + v.entries.length, 0)} changes
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="feature">Feature</option>
                  <option value="bugfix">Bug Fix</option>
                  <option value="improvement">Improvement</option>
                  <option value="breaking">Breaking Change</option>
                  <option value="security">Security</option>
                  <option value="deprecation">Deprecation</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'compact' && renderCompactView()}
      </div>
    </div>
  );
};

export default Changelog;
