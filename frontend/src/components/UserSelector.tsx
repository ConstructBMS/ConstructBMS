import { Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { User } from '../app/store/chat.store';
import { useChatStore } from '../app/store/chat.store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils/cn';

interface UserSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersSelected: (userIds: string[]) => void;
}

export function UserSelector({ isOpen, onClose, onUsersSelected }: UserSelectorProps) {
  const { users, createChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'private' | 'group' | 'project'>('group');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;

    const chatName = chatType === 'private' && selectedUsers.length === 1
      ? users.find(u => u.id === selectedUsers[0])?.name || 'Private Chat'
      : chatName || 'New Chat';

    createChat({
      name: chatName,
      type: chatType,
      participants: ['user-1', ...selectedUsers], // Include current user
      isArchived: false,
      isMuted: false,
      isPinned: false,
      createdBy: 'user-1',
    });

    onUsersSelected(selectedUsers);
    onClose();
    setSelectedUsers([]);
    setChatName('');
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div 
        className='relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>Start New Chat</h3>
            <Button variant='ghost' size='icon' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Chat Type Selection */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Chat Type
            </label>
            <div className='flex space-x-2'>
              <Button
                variant={chatType === 'private' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setChatType('private')}
                disabled={selectedUsers.length > 1}
              >
                Private
              </Button>
              <Button
                variant={chatType === 'group' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setChatType('group')}
              >
                Group
              </Button>
              <Button
                variant={chatType === 'project' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setChatType('project')}
              >
                Project
              </Button>
            </div>
          </div>

          {/* Chat Name (for group/project chats) */}
          {chatType !== 'private' && (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Chat Name
              </label>
              <Input
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder='Enter chat name...'
                className='bg-white border-gray-300 text-gray-900'
              />
            </div>
          )}

          {/* Search */}
          <div className='mb-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search users...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 bg-white border-gray-300 text-gray-900'
              />
            </div>
          </div>

          {/* User List */}
          <div className='max-h-60 overflow-y-auto space-y-2 mb-4'>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={cn(
                  'flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors',
                  selectedUsers.includes(user.id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                )}
                onClick={() => handleUserToggle(user.id)}
              >
                <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm'>
                  {user.avatar || '👤'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {user.name}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user.email}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'away' ? 'bg-yellow-500' :
                    user.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                  )} />
                  {selectedUsers.includes(user.id) && (
                    <Badge variant='secondary' className='text-xs'>
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Selected ({selectedUsers.length})
              </p>
              <div className='flex flex-wrap gap-1'>
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <Badge
                      key={userId}
                      variant='secondary'
                      className='text-xs'
                    >
                      {user?.name}
                      <button
                        onClick={() => handleUserToggle(userId)}
                        className='ml-1 hover:text-red-500'
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length === 0 || (chatType !== 'private' && !chatName.trim())}
            >
              Create Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
