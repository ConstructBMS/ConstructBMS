import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface ProjectNotes {
  content: string;
  lastEdited: string;
  editor: string;
  demo?: boolean;
}

interface ProjectNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: ProjectNotes) => void;
  notes: ProjectNotes;
  isDemoMode?: boolean;
}

const ProjectNotesModal: React.FC<ProjectNotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notes,
  isDemoMode = false
}) => {
  const [content, setContent] = useState(notes.content);
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');
  const canView = canAccess('programme.view');

  useEffect(() => {
    if (isOpen) {
      setContent(notes.content);
    }
  }, [isOpen, notes.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsLoading(true);
    try {
      const updatedNotes: ProjectNotes = {
        content,
        lastEdited: new Date().toISOString(),
        editor: 'Current User', // In a real app, this would come from auth context
        demo: isDemoMode
      };
      
      await onSave(updatedNotes);
      onClose();
    } catch (error) {
      console.error('Failed to save project notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setContent(notes.content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Notes</h2>
              <p className="text-sm text-gray-500">Add or edit internal project notes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notes Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Last Edited Info */}
          {notes.lastEdited && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last edited:</span> {new Date(notes.lastEdited).toLocaleString()}
                {notes.editor && (
                  <span> by {notes.editor}</span>
                )}
              </p>
            </div>
          )}

          {/* Notes Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canEdit}
              rows={15}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                font-mono text-sm
                ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
              `}
              placeholder="Enter your project notes here...&#10;&#10;You can use markdown formatting:&#10;# Headers&#10;**Bold text**&#10;*Italic text*&#10;- Bullet points&#10;1. Numbered lists"
            />
          </div>

          {/* Markdown Help */}
          {canEdit && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Markdown Formatting</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
                <div><code># Header</code> - Large header</div>
                <div><code>## Header</code> - Medium header</div>
                <div><code>**Bold**</code> - Bold text</div>
                <div><code>*Italic*</code> - Italic text</div>
                <div><code>- Item</code> - Bullet list</div>
                <div><code>1. Item</code> - Numbered list</div>
                <div><code>[Link](url)</code> - Hyperlink</div>
                <div><code>`code`</code> - Inline code</div>
              </div>
            </div>
          )}

          {/* Permission Notice */}
          {!canView && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                You don't have permission to view project notes.
              </p>
            </div>
          )}

          {canView && !canEdit && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                You have view-only access. Contact an administrator to make changes.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {content.length} characters
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Saving...' : 'Save Notes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectNotesModal; 