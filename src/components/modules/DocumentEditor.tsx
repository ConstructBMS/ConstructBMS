import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon as SaveIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

interface Document {
  assignedProjects: string[];
    canDelete: string[];
    canEdit: string[];
    canView: string[];
  category: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  description: string;
  id: string;
  isArchived: boolean;
  isTemplate: boolean;
  permissions: {
};
  tags: string[];
  title: string;
  updatedAt: Date;
  version: number;
}

interface DocumentVersion {
  changeDescription: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  description: string;
  id: string;
  title: string;
  version: number;
}

interface DocumentEditorProps {
  document?: Document;
  onArchive?: (document: Document) => void;
  onClose: () => void;
  onDelete?: (document: Document) => void;
  onSave: (document: Document) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  onSave,
  onClose,
  onArchive,
  onDelete,
}) => {
  const { user } = useAuth();
  const [currentDocument, setCurrentDocument] = useState<Document | null>(
    document || null
  );
  const [title, setTitle] = useState(document?.title || '');
  const [description, setDescription] = useState(document?.description || '');
  const [category, setCategory] = useState(document?.category || 'templates');
  const [tags, setTags] = useState<string[]>(document?.tags || []);
  const [content, setContent] = useState(document?.content || '');
  const [newTag, setNewTag] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] =
    useState<NodeJS.Timeout | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'contracts', name: 'Contracts' },
    { id: 'proposals', name: 'Proposals' },
    { id: 'reports', name: 'Reports' },
    { id: 'forms', name: 'Forms' },
    { id: 'policies', name: 'Policies' },
    { id: 'templates', name: 'Templates' },
  ];

  // Mock version history
  const versionHistory: DocumentVersion[] = [
    {
      id: 'v1',
      version: 1,
      content: '<h1>Original Document</h1><p>Initial version...</p>',
      title: 'Original Title',
      description: 'Original description',
      createdBy: 'Constructbms@gmail.com',
      createdAt: new Date('2024-01-15'),
      changeDescription: 'Initial creation',
    },
    {
      id: 'v2',
      version: 2,
      content: '<h1>Updated Document</h1><p>Updated content...</p>',
      title: 'Updated Title',
      description: 'Updated description',
      createdBy: 'Constructbms@gmail.com',
      createdAt: new Date('2024-01-20'),
      changeDescription: 'Updated content and formatting',
    },
  ];

  // Track changes
  useEffect(() => {
    const hasChanges =
      title !== (document?.title || '') ||
      description !== (document?.description || '') ||
      category !== (document?.category || 'templates') ||
      JSON.stringify(tags) !== JSON.stringify(document?.tags || []) ||
      content !== (document?.content || '');

    setIsDirty(hasChanges);
  }, [title, description, category, tags, content, document]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty) {
      if (autoSaveInterval) {
        clearTimeout(autoSaveInterval);
      }

      const interval = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      setAutoSaveInterval(interval);
    }

    return () => {
      if (autoSaveInterval) {
        clearTimeout(autoSaveInterval);
      }
    };
  }, [autoSave, isDirty, content]);

  const handleAutoSave = () => {
    if (isDirty) {
      const autoSaveDocument: Document = {
        ...currentDocument!,
        title,
        description,
        category,
        tags,
        content,
        updatedAt: new Date(),
        version: currentDocument ? currentDocument.version + 1 : 1,
      };

      // In a real app, this would save to backend
      console.log('Auto-saving document:', autoSaveDocument);
      setCurrentDocument(autoSaveDocument);
      setIsDirty(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }

    if (!changeDescription.trim()) {
      setShowSaveModal(true);
      return;
    }

    saveDocument();
  };

  const saveDocument = () => {
    const savedDocument: Document = {
      ...currentDocument!,
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
      content,
      updatedAt: new Date(),
      version: currentDocument ? currentDocument.version + 1 : 1,
    };

    onSave(savedDocument);
    setCurrentDocument(savedDocument);
    setIsDirty(false);
    setChangeDescription('');
    setShowSaveModal(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleRestoreVersion = (version: DocumentVersion) => {
    if (
      confirm(
        `Are you sure you want to restore version ${version.version}? This will overwrite current changes.`
      )
    ) {
      setTitle(version.title);
      setDescription(version.description);
      setContent(version.content);
      setIsDirty(true);
    }
  };

  const handleArchive = () => {
    if (currentDocument) {
      setShowArchiveModal(true);
    }
  };

  const confirmArchive = () => {
    if (currentDocument && onArchive) {
      const archivedDocument = { ...currentDocument, isArchived: true };
      onArchive(archivedDocument);
      setShowArchiveModal(false);
      onClose();
    }
  };

  const handleDelete = () => {
    if (currentDocument) {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    if (currentDocument && onDelete) {
      onDelete(currentDocument);
      setShowDeleteModal(false);
      onClose();
    }
  };

  const canEdit = currentDocument
    ? currentDocument.permissions.canEdit.includes(user?.role || 'user') ||
      currentDocument.createdBy === user?.email
    : true;

  const canDelete = currentDocument
    ? currentDocument.permissions.canDelete.includes(user?.role || 'user') ||
      currentDocument.createdBy === user?.email
    : true;

  return (
    <div className='h-full bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={onClose}
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <ArrowLeftIcon className='h-5 w-5' />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                {document ? 'Edit Document' : 'Create Document'}
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <label className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
              <input
                type='checkbox'
                checked={autoSave}
                onChange={e => setAutoSave(e.target.checked)}
                className='rounded'
              />
              Auto-save
            </label>
            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <ClockIcon className='h-5 w-5' />
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className='bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
              >
                <SaveIcon className='h-4 w-4' />
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden'>
        {/* Main Editor */}
        <div className='flex-1 flex flex-col'>
          {/* Document Properties */}
          <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Document Title *
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  disabled={!canEdit}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600'
                  placeholder='Enter document title'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={!canEdit}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600'
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600'
                  placeholder='Enter document description'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Tags
                </label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className='bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm flex items-center gap-1'
                    >
                      {tag}
                      {canEdit && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className='text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100'
                        >
                          <MinusIcon className='h-3 w-3' />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {canEdit && (
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                      className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='Add a tag'
                    />
                    <button
                      onClick={handleAddTag}
                      className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors'
                    >
                      <PlusIcon className='h-4 w-4' />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className='flex-1 flex flex-col'>
            <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2'>
              <div className='flex items-center gap-2'>
                <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  <strong>B</strong>
                </button>
                <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  <em>I</em>
                </button>
                <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  <u>U</u>
                </button>
                <div className='w-px h-6 bg-gray-300 dark:bg-gray-600'></div>
                <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  H1
                </button>
                <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  H2
                </button>
                <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'>
                  H3
                </button>
              </div>
            </div>
            <div className='flex-1 p-4'>
              <div
                ref={editorRef}
                contentEditable={canEdit}
                onInput={e => setContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
                className='w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent overflow-y-auto'
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        </div>

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className='w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto'>
            <h3 className='font-semibold text-gray-900 dark:text-white mb-4'>
              Version History
            </h3>
            <div className='space-y-3'>
              {versionHistory.map(version => (
                <div
                  key={version.id}
                  className='border border-gray-200 dark:border-gray-600 rounded-lg p-3'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      Version {version.version}
                    </span>
                    <button
                      onClick={() => handleRestoreVersion(version)}
                      className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm'
                    >
                      Restore
                    </button>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                    {version.changeDescription}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-500'>
                    {version.createdAt.toLocaleDateString()} by{' '}
                    {version.createdBy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Save Changes
            </h3>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Change Description
              </label>
              <textarea
                value={changeDescription}
                onChange={e => setChangeDescription(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='Describe what changes you made...'
              />
            </div>
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setShowSaveModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={saveDocument}
                className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Archive Document
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Are you sure you want to archive this document? It will be moved
              to the archive section.
            </p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setShowArchiveModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmArchive}
                className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors'
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Delete Document
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
