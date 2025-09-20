import { Bell, Eye, MessageSquare, Palette, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSettings({ isOpen, onClose }: ChatSettingsProps) {
  const [settings, setSettings] = useState({
    // Notification Settings
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      mobile: true,
      email: false,
      mentions: true,
      reactions: true,
      newChats: true,
      messagePreview: true,
    },
    // Appearance Settings
    appearance: {
      theme: 'light',
      chatBubbles: 'default',
      fontSize: 'medium',
      compactMode: false,
      showAvatars: true,
      showTimestamps: true,
      showReadReceipts: true,
    },
    // Privacy Settings
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showReadReceipts: true,
      allowScreenShots: true,
      messageExpiry: 'never',
    },
    // Chat Settings
    chat: {
      autoDownload: true,
      saveToGallery: false,
      enterToSend: true,
      showTyping: true,
      showOnlineStatus: true,
    },
  });

  const [activeTab, setActiveTab] = useState('notifications');

  if (!isOpen) return null;

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div 
        className='relative w-[800px] h-[600px] bg-white rounded-lg shadow-xl overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex h-full'>
          {/* Sidebar */}
          <div className='w-1/3 bg-gray-50 border-r p-4'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold'>Chat Settings</h2>
              <Button variant='ghost' size='icon' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>

            <nav className='space-y-2'>
              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <div className='flex items-center space-x-3'>
                  <Bell className='h-4 w-4' />
                  <span>Notifications</span>
                </div>
              </button>

              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('appearance')}
              >
                <div className='flex items-center space-x-3'>
                  <Palette className='h-4 w-4' />
                  <span>Appearance</span>
                </div>
              </button>

              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                <div className='flex items-center space-x-3'>
                  <Eye className='h-4 w-4' />
                  <span>Privacy</span>
                </div>
              </button>

              <button
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('chat')}
              >
                <div className='flex items-center space-x-3'>
                  <MessageSquare className='h-4 w-4' />
                  <span>Chat</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {activeTab === 'notifications' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    Notification Settings
                  </h3>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='notifications-enabled'>
                          Enable Notifications
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Receive notifications for new messages
                        </p>
                      </div>
                      <Switch
                        id='notifications-enabled'
                        checked={settings.notifications.enabled}
                        onCheckedChange={checked =>
                          updateSetting('notifications', 'enabled', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='notifications-sound'>
                          Sound Notifications
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Play sound for new messages
                        </p>
                      </div>
                      <Switch
                        id='notifications-sound'
                        checked={settings.notifications.sound}
                        onCheckedChange={checked =>
                          updateSetting('notifications', 'sound', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='notifications-desktop'>
                          Desktop Notifications
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Show desktop notifications
                        </p>
                      </div>
                      <Switch
                        id='notifications-desktop'
                        checked={settings.notifications.desktop}
                        onCheckedChange={checked =>
                          updateSetting('notifications', 'desktop', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='notifications-mentions'>
                          Mention Notifications
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Get notified when mentioned
                        </p>
                      </div>
                      <Switch
                        id='notifications-mentions'
                        checked={settings.notifications.mentions}
                        onCheckedChange={checked =>
                          updateSetting('notifications', 'mentions', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='notifications-preview'>
                          Message Preview
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Show message content in notifications
                        </p>
                      </div>
                      <Switch
                        id='notifications-preview'
                        checked={settings.notifications.messagePreview}
                        onCheckedChange={checked =>
                          updateSetting(
                            'notifications',
                            'messagePreview',
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    Appearance Settings
                  </h3>

                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='theme'>Theme</Label>
                      <Select
                        value={settings.appearance.theme}
                        onValueChange={value =>
                          updateSetting('appearance', 'theme', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='light'>Light</SelectItem>
                          <SelectItem value='dark'>Dark</SelectItem>
                          <SelectItem value='auto'>Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='font-size'>Font Size</Label>
                      <Select
                        value={settings.appearance.fontSize}
                        onValueChange={value =>
                          updateSetting('appearance', 'fontSize', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='small'>Small</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='large'>Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-avatars'>Show Avatars</Label>
                        <p className='text-sm text-gray-500'>
                          Display user avatars in chat
                        </p>
                      </div>
                      <Switch
                        id='show-avatars'
                        checked={settings.appearance.showAvatars}
                        onCheckedChange={checked =>
                          updateSetting('appearance', 'showAvatars', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-timestamps'>Show Timestamps</Label>
                        <p className='text-sm text-gray-500'>
                          Display message timestamps
                        </p>
                      </div>
                      <Switch
                        id='show-timestamps'
                        checked={settings.appearance.showTimestamps}
                        onCheckedChange={checked =>
                          updateSetting('appearance', 'showTimestamps', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-read-receipts'>
                          Show Read Receipts
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Display read status indicators
                        </p>
                      </div>
                      <Switch
                        id='show-read-receipts'
                        checked={settings.appearance.showReadReceipts}
                        onCheckedChange={checked =>
                          updateSetting(
                            'appearance',
                            'showReadReceipts',
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    Privacy Settings
                  </h3>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-online-status'>
                          Show Online Status
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Let others see when you're online
                        </p>
                      </div>
                      <Switch
                        id='show-online-status'
                        checked={settings.privacy.showOnlineStatus}
                        onCheckedChange={checked =>
                          updateSetting('privacy', 'showOnlineStatus', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-last-seen'>Show Last Seen</Label>
                        <p className='text-sm text-gray-500'>
                          Let others see when you were last active
                        </p>
                      </div>
                      <Switch
                        id='show-last-seen'
                        checked={settings.privacy.showLastSeen}
                        onCheckedChange={checked =>
                          updateSetting('privacy', 'showLastSeen', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-read-receipts-privacy'>
                          Read Receipts
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Let others see when you've read their messages
                        </p>
                      </div>
                      <Switch
                        id='show-read-receipts-privacy'
                        checked={settings.privacy.showReadReceipts}
                        onCheckedChange={checked =>
                          updateSetting('privacy', 'showReadReceipts', checked)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor='message-expiry'>Message Expiry</Label>
                      <Select
                        value={settings.privacy.messageExpiry}
                        onValueChange={value =>
                          updateSetting('privacy', 'messageExpiry', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='never'>Never</SelectItem>
                          <SelectItem value='1hour'>1 Hour</SelectItem>
                          <SelectItem value='1day'>1 Day</SelectItem>
                          <SelectItem value='1week'>1 Week</SelectItem>
                          <SelectItem value='1month'>1 Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-4'>Chat Settings</h3>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='enter-to-send'>Enter to Send</Label>
                        <p className='text-sm text-gray-500'>
                          Press Enter to send messages
                        </p>
                      </div>
                      <Switch
                        id='enter-to-send'
                        checked={settings.chat.enterToSend}
                        onCheckedChange={checked =>
                          updateSetting('chat', 'enterToSend', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='show-typing'>
                          Show Typing Indicator
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Show when others are typing
                        </p>
                      </div>
                      <Switch
                        id='show-typing'
                        checked={settings.chat.showTyping}
                        onCheckedChange={checked =>
                          updateSetting('chat', 'showTyping', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='auto-download'>
                          Auto Download Media
                        </Label>
                        <p className='text-sm text-gray-500'>
                          Automatically download images and files
                        </p>
                      </div>
                      <Switch
                        id='auto-download'
                        checked={settings.chat.autoDownload}
                        onCheckedChange={checked =>
                          updateSetting('chat', 'autoDownload', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <Label htmlFor='save-to-gallery'>Save to Gallery</Label>
                        <p className='text-sm text-gray-500'>
                          Save received images to device gallery
                        </p>
                      </div>
                      <Switch
                        id='save-to-gallery'
                        checked={settings.chat.saveToGallery}
                        onCheckedChange={checked =>
                          updateSetting('chat', 'saveToGallery', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
