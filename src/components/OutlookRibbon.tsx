import React from 'react';
import {
  Plus,
  Calendar,
  Trash2,
  Archive,
  Reply,
  ReplyAll,
  Forward,
  Zap,
  Users,
  User,
  Tag,
  Flag,
  Filter,
  Search,
  Folder,
  Star,
  Mail,
  MessageCircle,
  Bell,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Paperclip,
  Bookmark,
  BookmarkPlus,
  Target,
  Building,
  UserCheck,
  CheckSquare,
  Square,
  Clock as ClockIcon,
  AlertCircle,
  Info,
  Share2,
  Edit3,
  Copy,
  LogOut,
  RefreshCw,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  Grid,
  List,
  Columns,
  Maximize,
  Minimize,
  Split,
  Layout,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Shield,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Zap as ZapIcon,
  Brain,
  Target as TargetIcon,
  Briefcase,
  Building as BuildingIcon,
  UserCheck as UserCheckIcon,
  MessageCircle as MessageCircleIcon,
  CheckSquare as CheckSquareIcon,
  Square as SquareIcon,
  Clock as ClockIcon2,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  ExternalLink,
  Copy as CopyIcon,
  Edit3 as Edit3Icon,
  Trash2 as Trash2Icon,
  Archive as ArchiveIcon,
  Tag as TagIcon,
  Star as StarIcon2,
} from 'lucide-react';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'sendReceive', label: 'Send / Receive' },
  { key: 'folder', label: 'Folder' },
  { key: 'view', label: 'View' },
  { key: 'help', label: 'Help' },
];

interface OutlookRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewEmail: () => void;
  onNewMeeting: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onRules: () => void;
  onTag: () => void;
  onAddressBook: () => void;
  onFilterEmail: () => void;
  onSearch: (term: string) => void;
  onSaveAttachments: () => void;
  onSendReceive: () => void;
  // New props for additional functionality
  onSendReceiveAll?: () => void;
  onCreateFolder?: () => void;
  onRenameFolder?: () => void;
  onDeleteFolder?: () => void;
  onEmptyFolder?: () => void;
  onFolderProperties?: () => void;
  onViewSettings?: () => void;
  onChangeView?: (view: string) => void;
  onSortBy?: (field: string) => void;
  onGroupBy?: (field: string) => void;
  onFilterBy?: (filter: string) => void;
  onReadingPane?: (position: string) => void;
  onZoom?: (level: number) => void;
  onHelp?: () => void;
  // Current state props for visual feedback
  currentView?: string;
  currentReadingPane?: string;
  currentZoom?: number;
  currentSortBy?: string;
}

const Divider = () => <div className='h-12 w-px bg-gray-200 mx-2' />;
const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className='text-xs text-gray-500 text-center mt-1'>{children}</div>
);

const OutlookRibbon: React.FC<OutlookRibbonProps> = ({
  activeTab,
  onTabChange,
  onNewEmail,
  onNewMeeting,
  onDelete,
  onArchive,
  onReply,
  onReplyAll,
  onForward,
  onRules,
  onTag,
  onAddressBook,
  onFilterEmail,
  onSearch,
  onSaveAttachments,
  onSendReceive,
  onSendReceiveAll,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onEmptyFolder,
  onFolderProperties,
  onViewSettings,
  onChangeView,
  onSortBy,
  onGroupBy,
  onFilterBy,
  onReadingPane,
  onZoom,
  onHelp,
  currentView,
  currentReadingPane,
  currentZoom,
  currentSortBy,
}) => {
  return (
    <div className='w-full bg-white border-b border-gray-200'>
      {/* Tabs */}
      <div className='flex items-end border-b border-gray-200 px-2 pt-1 bg-white'>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-semibold focus:outline-none relative ${activeTab === tab.key ? 'text-archer-neon' : 'text-gray-700'} `}
            style={{
              borderBottom:
                activeTab === tab.key
                  ? '2px solid #00e6d8'
                  : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Ribbon Groups */}
      <div className='flex items-end px-2 py-2 bg-white overflow-x-auto'>
        {activeTab === 'home' && (
          <>
            {/* New */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onNewEmail}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Plus className='w-5 h-5' />
                  <span className='text-xs'>Email</span>
                </button>
                <button
                  onClick={onNewMeeting}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Calendar className='w-5 h-5' />
                  <span className='text-xs'>Meeting</span>
                </button>
              </div>
              <GroupLabel>New</GroupLabel>
            </div>
            <Divider />
            {/* Delete/Archive */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onDelete}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Trash2 className='w-5 h-5' />
                  <span className='text-xs'>Delete</span>
                </button>
                <button
                  onClick={onArchive}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Archive className='w-5 h-5' />
                  <span className='text-xs'>Archive</span>
                </button>
              </div>
              <GroupLabel>Delete</GroupLabel>
            </div>
            <Divider />
            {/* Respond */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onReply}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Reply className='w-5 h-5' />
                  <span className='text-xs'>Reply</span>
                </button>
                <button
                  onClick={onReplyAll}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <ReplyAll className='w-5 h-5' />
                  <span className='text-xs'>Reply All</span>
                </button>
                <button
                  onClick={onForward}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Forward className='w-5 h-5' />
                  <span className='text-xs'>Forward</span>
                </button>
              </div>
              <GroupLabel>Respond</GroupLabel>
            </div>
            <Divider />

            {/* Rules */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onRules}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Zap className='w-5 h-5' />
                  <span className='text-xs'>Rules</span>
                </button>
              </div>
              <GroupLabel>Rules</GroupLabel>
            </div>
            <Divider />
            {/* Tags/Find */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onTag}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Flag className='w-5 h-5' />
                  <span className='text-xs'>Tags</span>
                </button>
                <button
                  onClick={onAddressBook}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <User className='w-5 h-5' />
                  <span className='text-xs'>Address Book</span>
                </button>
                <button
                  onClick={onFilterEmail}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Filter className='w-5 h-5' />
                  <span className='text-xs'>Filter</span>
                </button>
              </div>
              <GroupLabel>Find</GroupLabel>
            </div>
            <Divider />
            {/* Attachments */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onSaveAttachments}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Download className='w-5 h-5' />
                  <span className='text-xs'>Save Attachments</span>
                </button>
              </div>
              <GroupLabel>Attachments</GroupLabel>
            </div>
            <Divider />
            {/* Search */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex items-center space-x-1 px-2 py-1'>
                <Search className='w-4 h-4 text-gray-500' />
                <input
                  type='text'
                  placeholder='Search emails...'
                  className='text-xs w-32 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-archer-neon'
                  onChange={e => onSearch(e.target.value)}
                />
              </div>
              <GroupLabel>Search</GroupLabel>
            </div>
          </>
        )}

        {activeTab === 'sendReceive' && (
          <>
            {/* Send/Receive */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onSendReceive}
                  data-sync-button='send-receive'
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <RefreshCw className='w-5 h-5' />
                  <span className='text-xs'>Send/Receive</span>
                </button>
                <button
                  onClick={onSendReceiveAll}
                  data-sync-button='send-receive-all'
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <RefreshCw className='w-5 h-5' />
                  <span className='text-xs'>All Folders</span>
                </button>
              </div>
              <GroupLabel>Send/Receive</GroupLabel>
            </div>
            <Divider />
            {/* Preferences */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onViewSettings}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Settings className='w-5 h-5' />
                  <span className='text-xs'>Preferences</span>
                </button>
              </div>
              <GroupLabel>Preferences</GroupLabel>
            </div>
          </>
        )}

        {activeTab === 'folder' && (
          <>
            {/* New Folder */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onCreateFolder}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Folder className='w-5 h-5' />
                  <span className='text-xs'>New Folder</span>
                </button>
                <button
                  onClick={onRenameFolder}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Edit3 className='w-5 h-5' />
                  <span className='text-xs'>Rename</span>
                </button>
              </div>
              <GroupLabel>New</GroupLabel>
            </div>
            <Divider />
            {/* Delete */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onDeleteFolder}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Trash2 className='w-5 h-5' />
                  <span className='text-xs'>Delete</span>
                </button>
                <button
                  onClick={onEmptyFolder}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Archive className='w-5 h-5' />
                  <span className='text-xs'>Empty</span>
                </button>
              </div>
              <GroupLabel>Delete</GroupLabel>
            </div>
            <Divider />
            {/* Properties */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onFolderProperties}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Settings className='w-5 h-5' />
                  <span className='text-xs'>Properties</span>
                </button>
                <button
                  onClick={onRules}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Zap className='w-5 h-5' />
                  <span className='text-xs'>Rules</span>
                </button>
              </div>
              <GroupLabel>Properties</GroupLabel>
            </div>
          </>
        )}

        {activeTab === 'view' && (
          <>
            {/* Current View */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={() => onChangeView?.('compact')}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentView === 'compact'
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <List className='w-5 h-5' />
                  <span className='text-xs'>Compact</span>
                </button>
                <button
                  onClick={() => onChangeView?.('normal')}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentView === 'normal'
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Grid className='w-5 h-5' />
                  <span className='text-xs'>Normal</span>
                </button>
                <button
                  onClick={() => onChangeView?.('preview')}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentView === 'preview'
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Columns className='w-5 h-5' />
                  <span className='text-xs'>Preview</span>
                </button>
              </div>
              <GroupLabel>Current View</GroupLabel>
            </div>
            <Divider />
            {/* Reading Pane */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={() => onReadingPane?.('right')}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentReadingPane === 'right'
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Split className='w-5 h-5' />
                  <span className='text-xs'>Right</span>
                </button>
                <button
                  onClick={() => onReadingPane?.('bottom')}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentReadingPane === 'bottom'
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Split className='w-5 h-5 rotate-90' />
                  <span className='text-xs'>Bottom</span>
                </button>
                <button
                  onClick={() => onReadingPane?.('off')}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentReadingPane === 'off'
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <XCircle className='w-5 h-5' />
                  <span className='text-xs'>Off</span>
                </button>
              </div>
              <GroupLabel>Reading Pane</GroupLabel>
            </div>
            <Divider />
            {/* Sort */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={() => onSortBy?.('date')}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <SortDesc className='w-5 h-5' />
                  <span className='text-xs'>Date</span>
                </button>
                <button
                  onClick={() => onSortBy?.('sender')}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <SortAsc className='w-5 h-5' />
                  <span className='text-xs'>Sender</span>
                </button>
                <button
                  onClick={() => onSortBy?.('subject')}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <SortAsc className='w-5 h-5' />
                  <span className='text-xs'>Subject</span>
                </button>
              </div>
              <GroupLabel>Sort</GroupLabel>
            </div>
            <Divider />
            {/* Zoom */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={() => onZoom?.(100)}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentZoom === 100
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Maximize className='w-5 h-5' />
                  <span className='text-xs'>100%</span>
                </button>
                <button
                  onClick={() => onZoom?.(125)}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentZoom === 125
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Maximize className='w-5 h-5' />
                  <span className='text-xs'>125%</span>
                </button>
                <button
                  onClick={() => onZoom?.(150)}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                    currentZoom === 150
                      ? 'bg-archer-neon text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Maximize className='w-5 h-5' />
                  <span className='text-xs'>150%</span>
                </button>
              </div>
              <GroupLabel>Zoom</GroupLabel>
            </div>
            <Divider />
            {/* Filter */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={() => onFilterBy?.('unread')}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Eye className='w-5 h-5' />
                  <span className='text-xs'>Unread</span>
                </button>
                <button
                  onClick={() => onFilterBy?.('flagged')}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <Flag className='w-5 h-5' />
                  <span className='text-xs'>Flagged</span>
                </button>
              </div>
              <GroupLabel>Filter</GroupLabel>
            </div>
          </>
        )}

        {activeTab === 'help' && (
          <>
            {/* Help */}
            <div className='flex flex-col items-center mx-2'>
              <div className='flex space-x-1'>
                <button
                  onClick={onHelp}
                  className='flex flex-col items-center px-2 py-1 hover:bg-gray-100 rounded'
                >
                  <HelpCircle className='w-5 h-5' />
                  <span className='text-xs'>Help</span>
                </button>
              </div>
              <GroupLabel>Help</GroupLabel>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OutlookRibbon;
