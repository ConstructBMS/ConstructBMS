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
  ArrowUpTrayIcon as UploadIcon,
  DocumentTextIcon,
  SparklesIcon,
  CameraIcon,
  DocumentIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon as CogIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  CheckIcon,
  XMarkIcon,
  SignalIcon,
  SignalSlashIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  WifiIcon,
  WifiIcon as WifiOffIcon,
} from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon as SaveIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import {
  documentService,
  Document,
  CreateDocumentData,
  UpdateDocumentData,
} from '../../services/documentService';
import { documentAnalytics } from '../../services/documentAnalytics';
import { aiService } from '../../services/aiService';
import {
  collaborationService,
  CollaborationSession,
  SessionParticipant,
  DocumentChange,
  DocumentComment,
} from '../../services/collaborationService';

interface DocumentBuilderProps {
  document?: Document;
  onSave?: (document: Document) => void;
  onClose?: () => void;
  mode?: 'create' | 'edit' | 'template';
}

interface AIAssistant {
  id: string;
  type: 'writing' | 'formatting' | 'analysis' | 'suggestion';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface OCRResult {
  text: string;
  confidence: number;
  pages: number;
  processingTime: number;
}

interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  position: { line: number; ch: number };
  selection?: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
  };
}

interface InlineComment {
  id: string;
  content: string;
  position: { line: number; ch: number };
  user: { id: string; name: string; color: string };
  resolved: boolean;
  replies: Array<{
    id: string;
    content: string;
    user: { id: string; name: string };
    timestamp: string;
  }>;
}

const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
  document: documentProp,
  onSave,
  onClose,
  mode = 'create',
}) => {
  console.log(
    'DocumentBuilder component rendered with mode:',
    mode,
    'document:',
    documentProp?.title
  );
  const { user } = useAuth();
  const [currentDocument, setCurrentDocument] = useState<Document | null>(
    documentProp || null
  );
  const [title, setTitle] = useState(documentProp?.title || '');
  const [description, setDescription] = useState(
    documentProp?.description || ''
  );
  const [category, setCategory] = useState(
    documentProp?.category || 'templates'
  );
  const [tags, setTags] = useState<string[]>(documentProp?.tags || []);
  const [content, setContent] = useState(documentProp?.content || '');
  const [newTag, setNewTag] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [userPermissions, setUserPermissions] = useState<{
    canCreateCategories: boolean;
    role: string;
  }>({ canCreateCategories: false, role: 'none' });

  // Collaboration state
  const [collabSession, setCollabSession] =
    useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [collabStatus, setCollabStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');
  const [collabError, setCollabError] = useState<string | null>(null);
  const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([]);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [selectedComment, setSelectedComment] = useState<InlineComment | null>(
    null
  );
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentReplyContent, setCommentReplyContent] = useState('');
  const [userColors] = useState<{ [userId: string]: string }>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  // Generate user colors for collaboration
  const getUserColor = (userId: string): string => {
    if (userColors[userId]) return userColors[userId];

    const colors = [
      '#4285F4',
      '#EA4335',
      '#FBBC04',
      '#34A853', // Google colors
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
    ];
    const color = colors[Object.keys(userColors).length % colors.length];
    userColors[userId] = color;
    return color;
  };

  // Convert document comments to inline comments
  const convertToInlineComments = (
    docComments: DocumentComment[]
  ): InlineComment[] => {
    return docComments.map(comment => ({
      id: comment.id || '',
      content: comment.content,
      position: comment.position,
      user: {
        id: comment.user_id,
        name: comment.user_name,
        color: getUserColor(comment.user_id),
      },
      resolved: comment.resolved,
      replies: [],
    }));
  };

  // Update cursor positions from participants
  const updateCursorPositions = () => {
    const positions: CursorPosition[] = participants
      .filter(p => p.is_online && p.cursor_position && p.user_id !== user?.id)
      .map(p => ({
        userId: p.user_id,
        userName: p.user_name,
        userColor: getUserColor(p.user_id),
        position: p.cursor_position!,
        selection: p.selection,
      }));
    setCursorPositions(positions);
  };

  // Update inline comments
  const updateInlineComments = () => {
    const inline = convertToInlineComments(comments);
    setInlineComments(inline);
  };

  // Handle cursor position updates
  const handleCursorUpdate = (position: { line: number; ch: number }) => {
    if (collabSession && user) {
      collaborationService.updateCursorPosition(position);
    }
  };

  // Handle selection updates
  const handleSelectionUpdate = (selection: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
  }) => {
    if (collabSession && user) {
      collaborationService.updateSelection(selection);
    }
  };

  // Handle typing events
  const handleTyping = () => {
    if (collabSession && user) {
      collaborationService.notifyTyping();
    }
  };

  // Add inline comment
  const addInlineComment = async (position: { line: number; ch: number }) => {
    if (!newCommentContent.trim() || !currentDocument?.id) return;

    try {
      const comment = await collaborationService.addComment(
        currentDocument.id,
        newCommentContent,
        position
      );
      setNewCommentContent('');
      setComments(prev => [...prev, comment]);
      updateInlineComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Resolve comment
  const resolveComment = async (commentId: string) => {
    try {
      await collaborationService.resolveComment(commentId);
      setComments(prev =>
        prev.map(c => (c.id === commentId ? { ...c, resolved: true } : c))
      );
      updateInlineComments();
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  // Add reply to comment
  const addCommentReply = async (commentId: string) => {
    if (!commentReplyContent.trim()) return;

    try {
      // In a real implementation, you would add a reply to the comment
      // For now, we'll just update the local state
      setInlineComments(prev =>
        prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: Date.now().toString(),
                  content: commentReplyContent,
                  user: { id: user?.id || '', name: user?.email || '' },
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }
          return c;
        })
      );
      setCommentReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const aiAssistants: AIAssistant[] = [
    {
      id: 'writing',
      type: 'writing',
      title: 'Writing Assistant',
      description: 'Improve writing style, grammar, and clarity',
      icon: <PencilIcon className='h-5 w-5' />,
    },
    {
      id: 'formatting',
      type: 'formatting',
      title: 'Formatting Assistant',
      description: 'Optimize document structure and formatting',
      icon: <DocumentTextIcon className='h-5 w-5' />,
    },
    {
      id: 'analysis',
      type: 'analysis',
      title: 'Content Analysis',
      description: 'Analyze document content and suggest improvements',
      icon: <MagnifyingGlassIcon className='h-5 w-5' />,
    },
    {
      id: 'suggestion',
      type: 'suggestion',
      title: 'Smart Suggestions',
      description: 'Get AI-powered suggestions for content',
      icon: <LightBulbIcon className='h-5 w-5' />,
    },
  ];

  // Load user permissions and categories
  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const permissions = await documentService.checkUserPermissions();
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Error loading user permissions:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const fetchedCategories = await documentService.getDocumentCategories();
        setCategories(
          fetchedCategories.map(cat => ({ id: cat.id, name: cat.name }))
        );
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if database fails
        setCategories([
          { id: 'contracts', name: 'Contracts' },
          { id: 'proposals', name: 'Proposals' },
          { id: 'reports', name: 'Reports' },
          { id: 'forms', name: 'Forms' },
          { id: 'policies', name: 'Policies' },
          { id: 'templates', name: 'Templates' },
        ]);
      }
    };

    loadUserPermissions();
    loadCategories();
  }, []);

  // Fetch all tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await documentService.getAllTags();
        setAllTags(tags);
      } catch (error) {
        setAllTags([]);
      }
    };
    fetchTags();
  }, []);

  // Update tag suggestions as user types
  useEffect(() => {
    if (newTag.trim()) {
      const filtered = allTags.filter(
        tag =>
          tag.toLowerCase().includes(newTag.trim().toLowerCase()) &&
          !tags.includes(tag)
      );
      setTagSuggestions(filtered);
    } else {
      setTagSuggestions([]);
    }
  }, [newTag, allTags, tags]);

  const handleSelectTag = (tag: string) => {
    setTags([...tags, tag]);
    setNewTag('');
    setTagSuggestions([]);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) {
      alert('This tag already exists');
      return;
    }
    if (trimmedTag.length > 20) {
      alert('Tag must be 20 characters or less');
      return;
    }
    setTags([...tags, trimmedTag]);
    setAllTags(prev =>
      prev.includes(trimmedTag) ? prev : [...prev, trimmedTag]
    );
    setNewTag('');
    setTagSuggestions([]);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowTemplateModal(true);
    }
  };

  const handleOCRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowOCRModal(true);
    }
  };

  const processOCR = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);

      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock OCR result - replace with actual OCR service
      const mockOCRResult: OCRResult = {
        text: `Extracted text from ${selectedFile.name}:\n\nThis is a sample of extracted text from the uploaded document. The OCR system has processed the document and converted it to editable text.\n\nYou can now edit this content in the document builder.`,
        confidence: 0.95,
        pages: 1,
        processingTime: 3.2,
      };

      setOcrResult(mockOCRResult);
      setContent(mockOCRResult.text);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      setShowOCRModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('OCR processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIContent = async (assistantType: string) => {
    if (!aiPrompt.trim()) return;

    try {
      setIsGeneratingAI(true);

      let aiResponse = '';
      switch (assistantType) {
        case 'writing':
          const improved = await aiService.improveContent(
            content || aiPrompt,
            'clarity'
          );
          aiResponse = `AI Writing Assistant Response:\n\n${aiPrompt}\n\nHere's an improved version:\n\n${improved}`;
          break;
        case 'formatting':
          const suggestions = await aiService.generateSuggestions(
            currentDocument?.id || 'temp',
            content || aiPrompt
          );
          aiResponse = `AI Formatting Assistant Response:\n\n${aiPrompt}\n\nHere are formatting suggestions:\n\n${suggestions.map(s => `• ${s.explanation} (${s.suggestion_type})`).join('\n')}`;
          break;
        case 'analysis':
          const analysis = await aiService.analyzeDocument(
            currentDocument?.id || 'temp',
            content || aiPrompt
          );
          aiResponse = `AI Content Analysis:\n\n${aiPrompt}\n\nAnalysis results:\n\n• Readability: ${analysis.readability_score}/100\n• Tone: ${analysis.tone}\n• Complexity: ${analysis.complexity}\n• Reading Time: ${analysis.estimated_reading_time} minutes\n• Key Themes: ${analysis.key_themes.join(', ')}`;
          break;
        case 'suggestion':
          const contentSuggestions = await aiService.generateSuggestions(
            currentDocument?.id || 'temp',
            content || aiPrompt
          );
          aiResponse = `AI Smart Suggestions:\n\n${aiPrompt}\n\nSuggestions:\n\n${contentSuggestions.map(s => `• ${s.explanation} (${s.suggestion_type})`).join('\n')}`;
          break;
        default:
          const generated = await aiService.generateContent(
            aiPrompt,
            'section',
            currentDocument?.id
          );
          aiResponse = `AI Assistant Response:\n\n${aiPrompt}\n\n${generated.generated_content}`;
      }

      setAiResponse(aiResponse);

      // Track AI usage analytics
      if (currentDocument) {
        documentAnalytics.trackDocumentEdit(currentDocument.id, 'update', {
          action: `ai_${assistantType}`,
          document_title: currentDocument.title,
        });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiResponse) {
      setContent(aiResponse);
      setAiResponse('');
      setShowAIAssistant(false);
    }
  };

  const insertTemplate = (templateContent: string) => {
    setContent(templateContent);
    setShowTemplateModal(false);
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = await documentService.createDocumentCategory({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
          icon: 'DocumentTextIcon',
          color: 'bg-gray-500',
        });

        // Refresh categories from database
        const updatedCategories = await documentService.getDocumentCategories();
        setCategories(
          updatedCategories.map(cat => ({ id: cat.id, name: cat.name }))
        );
        setCategory(newCategory.id);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowAddCategoryModal(false);
      } catch (error) {
        console.error('Error creating category:', error);
        alert(
          'Failed to create category. You may not have permission or the category name may already exist.'
        );
      }
    }
  };

  const handleKeyCommand = (command: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    switch (command) {
      case 'bold':
        window.document.execCommand('bold', false);
        break;
      case 'italic':
        window.document.execCommand('italic', false);
        break;
      case 'underline':
        window.document.execCommand('underline', false);
        break;
      case 'h1':
        window.document.execCommand('formatBlock', false, '<h1>');
        break;
      case 'h2':
        window.document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'h3':
        window.document.execCommand('formatBlock', false, '<h3>');
        break;
      case 'bullet':
        window.document.execCommand('insertUnorderedList', false);
        break;
      case 'number':
        window.document.execCommand('insertOrderedList', false);
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          window.document.execCommand('createLink', false, url);
        }
        break;
    }
  };

  const FloppyDiskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className={props.className}
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3 3.75A2.25 2.25 0 015.25 1.5h13.5A2.25 2.25 0 0121 3.75v16.5A2.25 2.25 0 0118.75 22.5H5.25A2.25 2.25 0 013 20.25V3.75zM7.5 3.75v3.75a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75V3.75'
      />
      <rect x='8.25' y='13.5' width='7.5' height='5.25' rx='.75' />
    </svg>
  );

  // Save button handler
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }
    if (!changeDescription.trim()) {
      setShowSaveModal(true);
      return;
    }
    await saveDocument();
  };

  // Save document logic
  const saveDocument = async () => {
    try {
      setIsProcessing(true);
      if (currentDocument && mode !== 'template') {
        // Update existing document
        const updatedDoc = await documentService.updateDocument(
          currentDocument.id,
          {
            title: title.trim(),
            description: description.trim(),
            category,
            tags,
            content,
            change_description: changeDescription,
          }
        );
        setCurrentDocument(updatedDoc);
        onSave?.(updatedDoc);

        // Track document update analytics
        documentAnalytics.trackDocumentEdit(
          currentDocument.id,
          'update',
          {
            action: 'save_document',
            document_title: updatedDoc.title,
            version_before: currentDocument.version,
            version_after: updatedDoc.version,
          },
          currentDocument.version,
          updatedDoc.version
        );
      } else {
        // Create new document
        const newDocData: CreateDocumentData = {
          title: title.trim(),
          description: description.trim(),
          category,
          tags,
          content,
          is_template: mode === 'template' && !currentDocument,
          permissions: {
            can_edit: ['admin', 'manager'],
            can_view: ['admin', 'manager', 'user'],
            can_delete: ['admin'],
          },
        };
        const newDoc = await documentService.createDocument(newDocData);
        setCurrentDocument(newDoc);
        onSave?.(newDoc);

        // Track document creation analytics
        documentAnalytics.trackDocumentEdit(newDoc.id, 'create', {
          action: 'create_document',
          document_title: newDoc.title,
          is_template: newDoc.is_template,
          category: newDoc.category,
        });
      }
      setIsDirty(false);
      setChangeDescription('');
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let sessionId: string | null = null;
    let unsubscribers: Array<() => void> = [];

    const setupCollaboration = async () => {
      if (!user || !currentDocument?.id) return;
      setCollabStatus('connecting');
      setCollabError(null);
      try {
        await collaborationService.initialize(user);
        // Try to join an existing session, or create one if none exists
        let session: CollaborationSession | null = null;
        try {
          // Try to join the first active session for this document
          const sessions = await collaborationService.getSessionsForDocument(
            currentDocument.id
          );
          if (sessions.length > 0) {
            await collaborationService.joinSession(sessions[0].id);
            session = sessions[0];
          } else {
            session = await collaborationService.createSession(
              currentDocument.id,
              `${currentDocument.title} Session`
            );
          }
        } catch (err) {
          session = await collaborationService.createSession(
            currentDocument.id,
            `${currentDocument.title} Session`
          );
        }
        setCollabSession(session);
        sessionId = session?.id || null;
        setCollabStatus('connected');
        // Subscribe to participants
        const updateParticipants = async () => {
          if (
            session &&
            typeof session.id === 'string' &&
            session.id.length > 0
          ) {
            const list = await collaborationService.getSessionParticipants(
              session.id!
            );
            setParticipants(list);
          }
        };
        await updateParticipants();
        const interval = setInterval(updateParticipants, 10000);
        unsubscribers.push(() => clearInterval(interval));
        // Subscribe to comments
        const updateComments = async () => {
          if (!currentDocument?.id) return;
          const list = await collaborationService.getDocumentComments(
            currentDocument.id
          );
          setComments(list);
        };
        await updateComments();
        const commentInterval = setInterval(updateComments, 10000);
        unsubscribers.push(() => clearInterval(commentInterval));
        // Listen for real-time events
        collaborationService.on('documentChanged', (change: DocumentChange) => {
          // TODO: Apply incoming changes to editor
        });
        collaborationService.on('userJoined', updateParticipants);
        collaborationService.on('userLeft', updateParticipants);
        collaborationService.on('commentAdded', updateComments);
        collaborationService.on('commentResolved', updateComments);
        collaborationService.on('cursorUpdated', () => updateCursorPositions());
        collaborationService.on('selectionUpdated', () =>
          updateCursorPositions()
        );
        collaborationService.on(
          'userTyping',
          (data: { user_id: string; user_name: string }) => {
            setTypingUsers(prev => {
              if (!prev.includes(data.user_name)) {
                return [...prev, data.user_name];
              }
              return prev;
            });
            // Clear typing indicator after 3 seconds
            setTimeout(() => {
              setTypingUsers(prev =>
                prev.filter(name => name !== data.user_name)
              );
            }, 3000);
          }
        );
        collaborationService.on(
          'userStoppedTyping',
          (data: { user_id: string; user_name: string }) => {
            setTypingUsers(prev =>
              prev.filter(name => name !== data.user_name)
            );
          }
        );
        unsubscribers.push(() => {
          collaborationService.off('documentChanged', () => {});
          collaborationService.off('userJoined', updateParticipants);
          collaborationService.off('userLeft', updateParticipants);
          collaborationService.off('commentAdded', updateComments);
          collaborationService.off('commentResolved', updateComments);
          collaborationService.off('cursorUpdated', () => {});
          collaborationService.off('selectionUpdated', () => {});
          collaborationService.off('userTyping', () => {});
          collaborationService.off('userStoppedTyping', () => {});
        });
      } catch (err: any) {
        setCollabError(err.message || 'Failed to join collaboration session');
        setCollabStatus('disconnected');
      }
    };
    if (mode === 'edit' && currentDocument?.id) {
      setupCollaboration();
    }
    return () => {
      collaborationService.leaveSession();
      unsubscribers.forEach(unsub => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentDocument?.id, mode]);

  // Update cursor positions and inline comments when participants or comments change
  useEffect(() => {
    updateCursorPositions();
  }, [participants]);

  useEffect(() => {
    updateInlineComments();
  }, [comments]);

  return (
    <div className='h-full bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Collaboration Status Bar */}
      {mode === 'edit' && (
        <div
          className={`px-4 py-2 text-sm font-medium ${
            collabStatus === 'connected'
              ? 'bg-green-50 text-green-800 border-b border-green-200'
              : collabStatus === 'connecting'
                ? 'bg-yellow-50 text-yellow-800 border-b border-yellow-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {collabStatus === 'connected' ? (
                <WifiIcon className='h-4 w-4' />
              ) : collabStatus === 'connecting' ? (
                <SignalIcon className='h-4 w-4 animate-pulse' />
              ) : (
                <WifiOffIcon className='h-4 w-4' />
              )}
              <span>
                {collabStatus === 'connected'
                  ? `Collaborating with ${participants.length} other user${participants.length !== 1 ? 's' : ''}`
                  : collabStatus === 'connecting'
                    ? 'Connecting to collaboration session...'
                    : 'Disconnected from collaboration'}
              </span>
              {collabError && (
                <span className='text-xs opacity-75'>({collabError})</span>
              )}
              {typingUsers.length > 0 && (
                <span className='text-xs text-blue-600 dark:text-blue-400 animate-pulse'>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </span>
              )}
            </div>
            <div className='flex items-center gap-2'>
              {/* Presence Indicators */}
              <div className='flex -space-x-2'>
                {participants.slice(0, 5).map((participant, index) => (
                  <div
                    key={participant.user_id}
                    className='w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-white'
                    style={{
                      backgroundColor: getUserColor(participant.user_id),
                    }}
                    title={`${participant.user_name} (${participant.user_role})`}
                  >
                    {participant.user_name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {participants.length > 5 && (
                  <div className='w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300'>
                    +{participants.length - 5}
                  </div>
                )}
              </div>
              {/* Comments Panel Toggle */}
              <button
                onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                className={`p-1 rounded ${
                  showCommentsPanel
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title='Toggle Comments Panel'
              >
                <ChatBubbleLeftIcon className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 lg:p-4'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <button
              onClick={onClose}
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <ArrowLeftIcon className='h-5 w-5' />
            </button>
            <div className='flex-1 min-w-0'>
              <h1 className='text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate'>
                {mode === 'create'
                  ? 'Create New Document'
                  : mode === 'template' && currentDocument
                    ? 'Create Document from Template'
                    : mode === 'template'
                      ? 'Create New Template'
                      : 'Edit Document'}
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {mode === 'template' && currentDocument
                  ? 'Customize this template for your needs'
                  : isDirty
                    ? 'Unsaved changes'
                    : 'All changes saved'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <EyeIcon className='h-5 w-5' />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <CogIcon className='h-5 w-5' />
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isProcessing}
              className='bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm'
            >
              <FloppyDiskIcon className='h-4 w-4' />
              <span className='hidden sm:inline'>
                {isProcessing ? 'Saving...' : 'Save'}
              </span>
              <span className='sm:hidden'>{isProcessing ? '...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col lg:flex-row overflow-hidden'>
        {/* Main Editor */}
        <div className='flex-1 flex flex-col'>
          {/* Document Properties */}
          <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 lg:p-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Document Title *
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Enter document title'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Category
                </label>
                <div className='flex gap-2'>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    disabled={!userPermissions.canCreateCategories}
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${
                      userPermissions.canCreateCategories
                        ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      userPermissions.canCreateCategories
                        ? 'Add new category'
                        : 'Insufficient permissions to create categories'
                    }
                  >
                    <PlusIcon className='h-4 w-4' />
                  </button>
                </div>
              </div>
              <div className='lg:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Enter document description'
                />
              </div>
              <div className='lg:col-span-2'>
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
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className='text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100'
                      >
                        <XMarkIcon className='h-3 w-3' />
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex gap-2 relative'>
                  <input
                    type='text'
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                    className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='Add a tag'
                    autoComplete='off'
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className='bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors'
                    title={newTag.trim() ? 'Add tag' : 'Enter a tag first'}
                  >
                    <PlusIcon className='h-4 w-4' />
                  </button>
                  {tagSuggestions.length > 0 && (
                    <ul className='absolute left-0 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto'>
                      {tagSuggestions.map(tag => (
                        <li
                          key={tag}
                          onClick={() => handleSelectTag(tag)}
                          className='px-3 py-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30'
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2'>
            <div className='flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0'>
              {/* Text Formatting */}
              <div className='flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 flex-shrink-0'>
                <button
                  onClick={() => handleKeyCommand('bold')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Bold'
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => handleKeyCommand('italic')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Italic'
                >
                  <em>I</em>
                </button>
                <button
                  onClick={() => handleKeyCommand('underline')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Underline'
                >
                  <u>U</u>
                </button>
              </div>

              {/* Headings */}
              <div className='flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 flex-shrink-0'>
                <button
                  onClick={() => handleKeyCommand('h1')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Heading 1'
                >
                  H1
                </button>
                <button
                  onClick={() => handleKeyCommand('h2')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Heading 2'
                >
                  H2
                </button>
                <button
                  onClick={() => handleKeyCommand('h3')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Heading 3'
                >
                  H3
                </button>
              </div>

              {/* Lists */}
              <div className='flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 flex-shrink-0'>
                <button
                  onClick={() => handleKeyCommand('bullet')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Bullet List'
                >
                  •
                </button>
                <button
                  onClick={() => handleKeyCommand('number')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Numbered List'
                >
                  1.
                </button>
              </div>

              {/* Links */}
              <div className='flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 flex-shrink-0'>
                <button
                  onClick={() => handleKeyCommand('link')}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Insert Link'
                >
                  🔗
                </button>
              </div>

              {/* AI Tools */}
              <div className='flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 flex-shrink-0'>
                <button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='AI Assistant'
                >
                  <SparklesIcon className='h-4 w-4' />
                </button>
              </div>

              {/* OCR */}
              <div className='flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 flex-shrink-0'>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='OCR Document'
                >
                  <CameraIcon className='h-4 w-4' />
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.tiff'
                  onChange={handleOCRUpload}
                  className='hidden'
                />
              </div>

              {/* Templates */}
              <div className='flex items-center gap-1 flex-shrink-0'>
                <button
                  onClick={() => setShowTemplateModal(!showTemplateModal)}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                  title='Insert Template'
                >
                  <DocumentIcon className='h-4 w-4' />
                </button>
              </div>

              {/* Collaboration Tools */}
              {mode === 'edit' && (
                <>
                  <div className='border-l border-gray-300 dark:border-gray-600 ml-2 pl-2 flex items-center gap-1 flex-shrink-0'>
                    <button
                      onClick={() => {
                        // TODO: Implement voice chat
                        console.log('Voice chat not implemented yet');
                      }}
                      className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                      title='Voice Chat'
                    >
                      <SignalIcon className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement screen sharing
                        console.log('Screen sharing not implemented yet');
                      }}
                      className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                      title='Screen Share'
                    >
                      <CameraIcon className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                      className={`p-2 rounded transition-colors ${
                        showCommentsPanel
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title='Comments Panel'
                    >
                      <ChatBubbleLeftIcon className='h-4 w-4' />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className='flex-1 flex'>
            <div className='flex-1 p-3 lg:p-4 relative'>
              <div
                ref={editorRef}
                contentEditable
                onInput={e => {
                  setContent(e.currentTarget.innerHTML);
                  handleTyping();
                }}
                onKeyUp={e => {
                  // Update cursor position for collaboration
                  if (mode === 'edit' && collabSession) {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const rect = range.getBoundingClientRect();
                      const editorRect =
                        editorRef.current?.getBoundingClientRect();
                      if (editorRect) {
                        const relativeX = rect.left - editorRect.left;
                        const relativeY = rect.top - editorRect.top;
                        // Convert to line/character position (simplified)
                        const line = Math.floor(relativeY / 20); // Approximate line height
                        const ch = Math.floor(relativeX / 8); // Approximate character width
                        handleCursorUpdate({ line, ch });
                      }
                    }
                  }
                }}
                onMouseUp={e => {
                  // Update selection for collaboration
                  if (mode === 'edit' && collabSession) {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const startRect = range.getBoundingClientRect();
                      const endRect = range.getBoundingClientRect();
                      const editorRect =
                        editorRef.current?.getBoundingClientRect();
                      if (editorRect) {
                        const from = {
                          line: Math.floor(
                            (startRect.top - editorRect.top) / 20
                          ),
                          ch: Math.floor(
                            (startRect.left - editorRect.left) / 8
                          ),
                        };
                        const to = {
                          line: Math.floor((endRect.top - editorRect.top) / 20),
                          ch: Math.floor((endRect.left - editorRect.left) / 8),
                        };
                        handleSelectionUpdate({ from, to });
                      }
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ __html: content }}
                className='w-full h-full p-3 lg:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent overflow-y-auto relative'
                style={{ minHeight: '300px' }}
              />

              {/* Cursor Overlays */}
              {mode === 'edit' &&
                cursorPositions.map((cursor, index) => (
                  <div
                    key={cursor.userId}
                    className='absolute pointer-events-none z-10'
                    style={{
                      left: `${cursor.position.ch * 8 + 12}px`,
                      top: `${cursor.position.line * 20 + 12}px`,
                    }}
                  >
                    <div
                      className='w-0.5 h-5'
                      style={{ backgroundColor: cursor.userColor }}
                    />
                    <div
                      className='px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap'
                      style={{ backgroundColor: cursor.userColor }}
                    >
                      {cursor.userName}
                    </div>
                  </div>
                ))}

              {/* Inline Comments */}
              {mode === 'edit' &&
                inlineComments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className='absolute pointer-events-auto z-20'
                    style={{
                      left: `${comment.position.ch * 8 + 12}px`,
                      top: `${comment.position.line * 20 + 12}px`,
                    }}
                  >
                    <button
                      onClick={() => setSelectedComment(comment)}
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                        comment.resolved ? 'bg-gray-400' : 'bg-yellow-400'
                      }`}
                      title={`Comment by ${comment.user.name}`}
                    />
                  </div>
                ))}

              {/* Floating Presence Indicator */}
              {mode === 'edit' && participants.length > 0 && (
                <div className='absolute bottom-4 right-4 z-30'>
                  <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <UserGroupIcon className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Collaborators ({participants.length})
                      </span>
                    </div>
                    <div className='flex -space-x-2'>
                      {participants.slice(0, 6).map(participant => (
                        <div
                          key={participant.user_id}
                          className='relative'
                          title={`${participant.user_name} (${participant.user_role})`}
                        >
                          <div
                            className='w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-white'
                            style={{
                              backgroundColor: getUserColor(
                                participant.user_id
                              ),
                            }}
                          >
                            {participant.user_name.charAt(0).toUpperCase()}
                          </div>
                          {/* Online indicator */}
                          <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full'></div>
                        </div>
                      ))}
                      {participants.length > 6 && (
                        <div className='w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300'>
                          +{participants.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant Sidebar */}
            {showAIAssistant && (
              <div className='w-full lg:w-80 bg-white dark:bg-gray-800 border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-700 p-3 lg:p-4 overflow-y-auto'>
                <h3 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                  <SparklesIcon className='h-5 w-5' />
                  AI Assistant
                </h3>

                <div className='space-y-4'>
                  {aiAssistants.map(assistant => (
                    <div
                      key={assistant.id}
                      className='border border-gray-200 dark:border-gray-600 rounded-lg p-3'
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        {assistant.icon}
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {assistant.title}
                        </h4>
                      </div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                        {assistant.description}
                      </p>
                      <textarea
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder={`Ask ${assistant.title}...`}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm'
                        rows={3}
                      />
                      <button
                        onClick={() => generateAIContent(assistant.type)}
                        disabled={!aiPrompt.trim() || isGeneratingAI}
                        className='w-full mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors'
                      >
                        {isGeneratingAI ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  ))}
                </div>

                {aiResponse && (
                  <div className='mt-4 border border-gray-200 dark:border-gray-600 rounded-lg p-3'>
                    <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                      AI Response
                    </h4>
                    <div className='text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap'>
                      {aiResponse}
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={applyAISuggestion}
                        className='flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors'
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setAiResponse('')}
                        className='flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors'
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments Panel Sidebar */}
            {showCommentsPanel && mode === 'edit' && (
              <div className='w-full lg:w-80 bg-white dark:bg-gray-800 border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-700 p-3 lg:p-4 overflow-y-auto'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                    <ChatBubbleLeftIcon className='h-5 w-5' />
                    Comments ({inlineComments.length})
                  </h3>
                  <button
                    onClick={() => setShowCommentsPanel(false)}
                    className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                  >
                    <XMarkIcon className='h-4 w-4' />
                  </button>
                </div>

                {/* Add New Comment */}
                <div className='mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg'>
                  <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                    Add Comment
                  </h4>
                  <textarea
                    ref={commentInputRef}
                    value={newCommentContent}
                    onChange={e => setNewCommentContent(e.target.value)}
                    placeholder='Type your comment...'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm'
                    rows={3}
                  />
                  <div className='flex gap-2 mt-2'>
                    <button
                      onClick={() => {
                        if (editorRef.current) {
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const rect = range.getBoundingClientRect();
                            const editorRect =
                              editorRef.current.getBoundingClientRect();
                            if (editorRect) {
                              const line = Math.floor(
                                (rect.top - editorRect.top) / 20
                              );
                              const ch = Math.floor(
                                (rect.left - editorRect.left) / 8
                              );
                              addInlineComment({ line, ch });
                            }
                          }
                        }
                      }}
                      disabled={!newCommentContent.trim()}
                      className='flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors'
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className='space-y-3'>
                  {inlineComments.map(comment => (
                    <div
                      key={comment.id}
                      className={`p-3 border rounded-lg ${
                        comment.resolved
                          ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                          : 'border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                      }`}
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <div
                            className='w-3 h-3 rounded-full'
                            style={{ backgroundColor: comment.user.color }}
                          />
                          <span className='font-medium text-sm text-gray-900 dark:text-white'>
                            {comment.user.name}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {!comment.resolved && (
                            <button
                              onClick={() => resolveComment(comment.id)}
                              className='p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded'
                              title='Resolve comment'
                            >
                              <CheckIcon className='h-3 w-3 text-green-600' />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setSelectedComment(
                                selectedComment?.id === comment.id
                                  ? null
                                  : comment
                              )
                            }
                            className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                            title='View replies'
                          >
                            <ChatBubbleLeftIcon className='h-3 w-3' />
                          </button>
                        </div>
                      </div>
                      <p className='text-sm text-gray-700 dark:text-gray-300 mb-2'>
                        {comment.content}
                      </p>
                      {comment.resolved && (
                        <span className='text-xs text-green-600 dark:text-green-400 font-medium'>
                          ✓ Resolved
                        </span>
                      )}

                      {/* Replies */}
                      {selectedComment?.id === comment.id && (
                        <div className='mt-3 space-y-2'>
                          {comment.replies.map(reply => (
                            <div
                              key={reply.id}
                              className='ml-4 p-2 bg-gray-50 dark:bg-gray-700 rounded'
                            >
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='font-medium text-xs text-gray-900 dark:text-white'>
                                  {reply.user.name}
                                </span>
                                <span className='text-xs text-gray-500'>
                                  {new Date(reply.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className='text-xs text-gray-700 dark:text-gray-300'>
                                {reply.content}
                              </p>
                            </div>
                          ))}

                          {/* Add Reply */}
                          <div className='ml-4'>
                            <textarea
                              value={commentReplyContent}
                              onChange={e =>
                                setCommentReplyContent(e.target.value)
                              }
                              placeholder='Add a reply...'
                              className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-transparent text-xs'
                              rows={2}
                            />
                            <button
                              onClick={() => addCommentReply(comment.id)}
                              disabled={!commentReplyContent.trim()}
                              className='mt-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs transition-colors'
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {inlineComments.length === 0 && (
                    <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                      <ChatBubbleLeftIcon className='h-8 w-8 mx-auto mb-2 opacity-50' />
                      <p className='text-sm'>No comments yet</p>
                      <p className='text-xs'>
                        Select text and add a comment to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        {showSettings && (
          <div className='w-full lg:w-80 bg-white dark:bg-gray-800 border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-700 p-3 lg:p-4'>
            <h3 className='font-semibold text-gray-900 dark:text-white mb-4'>
              Settings
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                  <input
                    type='checkbox'
                    checked={autoSave}
                    onChange={e => setAutoSave(e.target.checked)}
                    className='rounded'
                  />
                  Auto-save
                </label>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  Automatically save changes every 30 seconds
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Auto-save Interval (seconds)
                </label>
                <input
                  type='number'
                  min='10'
                  max='300'
                  defaultValue='30'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Default Font Size
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'>
                  <option value='12'>12px</option>
                  <option value='14' selected>
                    14px
                  </option>
                  <option value='16'>16px</option>
                  <option value='18'>18px</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Save Modal */}
      {showSaveModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-md'>
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
            <div className='flex flex-col sm:flex-row justify-end gap-2'>
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

      {/* OCR Modal */}
      {showOCRModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              OCR Document Processing
            </h3>

            {selectedFile && (
              <div className='mb-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  Selected file: {selectedFile.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {isProcessing ? (
              <div className='text-center py-4'>
                <div className='animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2'></div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Processing OCR... This may take a few moments.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  The OCR system will extract text from your document and create
                  an editable version.
                </p>
                <div className='flex flex-col sm:flex-row justify-end gap-2'>
                  <button
                    onClick={() => {
                      setShowOCRModal(false);
                      setSelectedFile(null);
                    }}
                    className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processOCR}
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors'
                  >
                    Process OCR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Add New Category
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Category Name *
                </label>
                <input
                  type='text'
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Enter category name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Description
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={e => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Enter category description'
                />
              </div>
            </div>
            <div className='flex flex-col sm:flex-row justify-end gap-2 mt-6'>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className='bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors'
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Insert Template
            </h3>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                  Upload Template
                </h4>
                <input
                  type='file'
                  accept='.doc,.docx,.txt,.html'
                  onChange={handleFileUpload}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                />
              </div>

              <div>
                <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                  Quick Templates
                </h4>
                <div className='space-y-2'>
                  <button
                    onClick={() =>
                      insertTemplate(
                        '<h1>Business Letter</h1><p>Dear [Recipient Name],</p><p>[Your content here]</p><p>Sincerely,<br>[Your Name]</p>'
                      )
                    }
                    className='w-full text-left p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    Business Letter
                  </button>
                  <button
                    onClick={() =>
                      insertTemplate(
                        '<h1>Meeting Agenda</h1><h2>Date: [Date]</h2><h2>Attendees:</h2><ul><li>[Attendee 1]</li><li>[Attendee 2]</li></ul><h2>Agenda Items:</h2><ol><li>[Item 1]</li><li>[Item 2]</li></ol>'
                      )
                    }
                    className='w-full text-left p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    Meeting Agenda
                  </button>
                  <button
                    onClick={() =>
                      insertTemplate(
                        '<h1>Project Proposal</h1><h2>Executive Summary</h2><p>[Summary here]</p><h2>Objectives</h2><ul><li>[Objective 1]</li><li>[Objective 2]</li></ul><h2>Timeline</h2><p>[Timeline details]</p>'
                      )
                    }
                    className='w-full text-left p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    Project Proposal
                  </button>
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowTemplateModal(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Version History
            </h3>

            <div className='space-y-4'>
              <div className='border border-gray-200 dark:border-gray-600 rounded-lg p-3'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium text-gray-900 dark:text-white'>
                    Version 1.2
                  </h4>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    2 hours ago
                  </span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  Updated project timeline and budget estimates
                </p>
                <div className='flex gap-2'>
                  <button className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'>
                    View
                  </button>
                  <button className='text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'>
                    Restore
                  </button>
                </div>
              </div>

              <div className='border border-gray-200 dark:border-gray-600 rounded-lg p-3'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium text-gray-900 dark:text-white'>
                    Version 1.1
                  </h4>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    1 day ago
                  </span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  Added new section for risk assessment
                </p>
                <div className='flex gap-2'>
                  <button className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'>
                    View
                  </button>
                  <button className='text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'>
                    Restore
                  </button>
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowVersionHistory(false)}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentBuilder;
