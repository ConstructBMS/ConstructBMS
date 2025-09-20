import { Building, Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '../app/store/chat.store';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

interface CreateChatGroupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChatGroup({ isOpen, onClose }: CreateChatGroupProps) {
  const { users, createChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState<'group' | 'project'>('group');
  const [projectId, setProjectId] = useState<string>('');

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      createChat({
        name: groupName,
        type: groupName,
        description: groupDescription,
        participants: selectedUsers,
        projectId: groupType === 'project' ? projectId : undefined,
        isArchived: false,
        isMuted: false,
        isPinned: false,
        createdBy: 'user-1', // Current user ID
      });

      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center pt-16'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div
        className='relative w-[600px] max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                <Users className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold'>Create Chat Group</h2>
                <p className='text-sm text-gray-500'>
                  Start a new group conversation
                </p>
              </div>
            </div>
            <Button variant='ghost' size='icon' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='space-y-6'>
            {/* Group Type */}
            <div>
              <Label htmlFor='group-type'>Group Type</Label>
              <Select
                value={groupType}
                onValueChange={(value: 'group' | 'project') =>
                  setGroupType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='group'>
                    <div className='flex items-center space-x-2'>
                      <Users className='h-4 w-4' />
                      <span>General Group</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='project'>
                    <div className='flex items-center space-x-2'>
                      <Building className='h-4 w-4' />
                      <span>Project Chat</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Name */}
            <div>
              <Label htmlFor='group-name'>Group Name</Label>
              <Input
                id='group-name'
                placeholder='Enter group name'
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
              />
            </div>

            {/* Group Description */}
            <div>
              <Label htmlFor='group-description'>Description (Optional)</Label>
              <Textarea
                id='group-description'
                placeholder='Enter group description'
                value={groupDescription}
                onChange={e => setGroupDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Project Selection (if project type) */}
            {groupType === 'project' && (
              <div>
                <Label htmlFor='project-id'>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a project' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='project-alpha'>Project Alpha</SelectItem>
                    <SelectItem value='project-beta'>Project Beta</SelectItem>
                    <SelectItem value='project-gamma'>Project Gamma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* User Search */}
            <div>
              <Label htmlFor='user-search'>Add Members</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  id='user-search'
                  placeholder='Search users...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* User List */}
            <div className='max-h-48 overflow-y-auto border rounded-lg'>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleUser(user.id)}
                >
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>{user.name}</p>
                    <p className='text-xs text-gray-500'>{user.email}</p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                      <X className='h-3 w-3 text-white' />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div>
                <Label>Selected Members ({selectedUsers.length})</Label>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <Badge
                        key={userId}
                        variant='secondary'
                        className='flex items-center space-x-1'
                      >
                        <span>{user.name}</span>
                        <button
                          onClick={() => toggleUser(userId)}
                          className='ml-1 hover:bg-gray-200 rounded-full p-0.5'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-end space-x-3 pt-4 border-t'>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
              >
                Create Group
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
