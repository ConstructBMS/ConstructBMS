import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  CameraIcon,
  DocumentIcon,
  FolderIcon,
  EyeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/documentService';
import { aiService } from '../../services/aiService';
import type { Document, CreateDocumentData } from '../../services/documentService';

interface DocumentWizardProps {
  onClose: () => void;
  onComplete: (document: Document) => void;
}

interface WizardStep {
  completed: boolean;
  description: string;
  icon: React.ReactNode;
  id: string;
  required: boolean;
  title: string;
}

interface DocumentData {
  aiSuggestions?: string[];
  category: string;
    confidence: number;
  content: string;
  description: string;
  formattingApplied: boolean;
  isTemplate: boolean;
  ocrResult?: {
    pages: number;
    text: string;
};
  savedToLibrary: boolean;
  selectedTemplate?: string;
  sourceType: 'blank' | 'template' | 'upload' | 'ocr';
  tags: string[];
  title: string;
  uploadedFile?: File;
}

const DocumentWizard: React.FC<DocumentWizardProps> = ({
  onClose,
  onComplete,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: '',
    description: '',
    category: 'general',
    tags: [],
    content: '',
    isTemplate: false,
    sourceType: 'blank',
    formattingApplied: false,
    savedToLibrary: false,
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);

  // Wizard steps configuration
  const steps: WizardStep[] = [
    {
      id: 'setup',
      title: 'Document Setup',
      description: 'Name your document and choose its type',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      completed: Boolean(documentData.title && documentData.description),
      required: true,
    },
    {
      id: 'source',
      title: 'Choose Source',
      description: 'Start from blank, template, or upload existing document',
      icon: <DocumentIcon className="h-6 w-6" />,
      completed: documentData.sourceType !== 'blank' || documentData.content.length > 0,
      required: true,
    },
    {
      id: 'content',
      title: 'Content Creation',
      description: 'Write, edit, and enhance your document content',
      icon: <PencilIcon className="h-6 w-6" />,
      completed: documentData.content.length > 0,
      required: true,
    },
    {
      id: 'enhance',
      title: 'AI Enhancement',
      description: 'Use AI to improve and format your document',
      icon: <SparklesIcon className="h-6 w-6" />,
      completed: documentData.formattingApplied || Boolean(documentData.aiSuggestions && documentData.aiSuggestions.length > 0),
      required: false,
    },
    {
      id: 'organize',
      title: 'Organization',
      description: 'Add categories, tags, and metadata',
      icon: <FolderIcon className="h-6 w-6" />,
      completed: documentData.category !== 'general' || documentData.tags.length > 0,
      required: false,
    },
    {
      id: 'review',
      title: 'Review & Preview',
      description: 'Preview your document and make final adjustments',
      icon: <EyeIcon className="h-6 w-6" />,
      completed: showPreview,
      required: false,
    },
    {
      id: 'save',
      title: 'Save to Library',
      description: 'Save your document to the library',
      icon: <CheckIcon className="h-6 w-6" />,
      completed: documentData.savedToLibrary,
      required: true,
    },
  ];

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await documentService.getDocumentCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await documentService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentData(prev => ({
        ...prev,
        uploadedFile: file,
        sourceType: 'upload',
      }));
    }
  };

  const handleOCRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processOCRFile(file);
    }
  };

  const processOCRFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentData(prev => ({
          ...prev,
          uploadedFile: file,
          sourceType: 'ocr',
          ocrResult: {
            text: text.substring(0, 1000), // Simulate OCR text
            confidence: 0.95,
            pages: 1,
          },
          content: text.substring(0, 1000),
        }));
      };
      reader.readAsText(file);
    } catch (error) {
      setError('Failed to process OCR file');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAI(true);
    setError(null);
    
    try {
      const response = await aiService.generateContent(
        aiPrompt,
        'section',
        undefined
      );
      
      setAiResponse(response.generated_content);
      setDocumentData(prev => ({
        ...prev,
        aiSuggestions: [...(prev.aiSuggestions || []), response.generated_content],
      }));
    } catch (error) {
      setError('Failed to generate AI content');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestion = (suggestion: string) => {
    setDocumentData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + suggestion,
      formattingApplied: true,
    }));
  };

  const insertTemplate = (templateContent: string) => {
    setDocumentData(prev => ({
      ...prev,
      content: templateContent,
      sourceType: 'template',
      selectedTemplate: templateContent,
    }));
  };

  const handleSaveToLibrary = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const documentDataToSave: CreateDocumentData = {
        title: documentData.title,
        description: documentData.description,
        category: documentData.category,
        tags: documentData.tags,
        content: documentData.content,
        is_template: documentData.isTemplate,
        permissions: {
          can_edit: [user?.email || ''],
          can_view: [user?.email || ''],
          can_delete: [user?.email || ''],
        },
      };
      
      const savedDocument = await documentService.createDocument(documentDataToSave);
      
      setDocumentData(prev => ({
        ...prev,
        savedToLibrary: true,
      }));
      
      onComplete(savedDocument);
    } catch (error) {
      setError('Failed to save document to library');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Setup
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Document Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Start by giving your document a name and description. This will help you organize and find it later.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={documentData.title}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  placeholder="Enter document title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={documentData.description}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  placeholder="Describe what this document is about"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={documentData.isTemplate}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, isTemplate: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Save as template for future use
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 1: // Source
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Choose Your Starting Point
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select how you'd like to start creating your document.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setDocumentData(prev => ({ ...prev, sourceType: 'blank' }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  documentData.sourceType === 'blank'
                    ? 'border-constructbms-blue bg-constructbms-blue/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <DocumentTextIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Start from Scratch</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a new document from a blank page
                </p>
              </button>
              
              <button
                onClick={() => setDocumentData(prev => ({ ...prev, sourceType: 'template' }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  documentData.sourceType === 'template'
                    ? 'border-constructbms-blue bg-constructbms-blue/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <DocumentIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Use Template</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start with a pre-designed template
                </p>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  documentData.sourceType === 'upload'
                    ? 'border-constructbms-blue bg-constructbms-blue/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <DocumentArrowUpIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Upload Document</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload an existing document to edit
                </p>
              </button>
              
              <button
                onClick={() => ocrFileInputRef.current?.click()}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  documentData.sourceType === 'ocr'
                    ? 'border-constructbms-blue bg-constructbms-blue/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <CameraIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">OCR Document</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Extract text from images or PDFs
                </p>
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf,.txt,.rtf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <input
              ref={ocrFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              onChange={handleOCRUpload}
              className="hidden"
            />
            
            {documentData.uploadedFile && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    File uploaded: {documentData.uploadedFile.name}
                  </span>
                </div>
              </div>
            )}
            
            {documentData.ocrResult && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    OCR Processing Complete
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Confidence: {Math.round(documentData.ocrResult.confidence * 100)}% | 
                  Pages: {documentData.ocrResult.pages}
                </p>
              </div>
            )}
          </div>
        );

      case 2: // Content
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Document Content
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Write and edit your document content. Use the toolbar for formatting options.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-2">
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <strong>B</strong>
                  </button>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <em>I</em>
                  </button>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <u>U</u>
                  </button>
                  <div className="border-l border-gray-300 dark:border-gray-600 mx-2 h-4"></div>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    H1
                  </button>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    H2
                  </button>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    H3
                  </button>
                  <div className="border-l border-gray-300 dark:border-gray-600 mx-2 h-4"></div>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    •
                  </button>
                  <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    1.
                  </button>
                </div>
                
                <textarea
                  value={documentData.content}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent resize-none"
                  placeholder="Start writing your document content here..."
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {documentData.content.length} characters
                </span>
                <button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white transition-colors"
                >
                  <SparklesIcon className="h-4 w-4" />
                  AI Assistant
                </button>
              </div>
              
              {showAIAssistant && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Writing Assistant</h4>
                  <div className="space-y-3">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                      placeholder="Describe what you want the AI to help you with..."
                    />
                    <button
                      onClick={generateAIContent}
                      disabled={isGeneratingAI || !aiPrompt.trim()}
                      className="px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? 'Generating...' : 'Generate Content'}
                    </button>
                    {aiResponse && (
                      <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <p className="text-sm text-gray-900 dark:text-white mb-2">{aiResponse}</p>
                        <button
                          onClick={() => applyAISuggestion(aiResponse)}
                          className="text-sm text-constructbms-blue hover:text-constructbms-black transition-colors"
                        >
                          Apply to document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Enhance
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Enhancement
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use AI to improve your document's content, formatting, and structure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  // Simulate AI formatting
                  setDocumentData(prev => ({ ...prev, formattingApplied: true }));
                }}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-constructbms-blue transition-colors"
              >
                <SparklesIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Auto-Format</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically format and structure your document
                </p>
              </button>
              
              <button
                onClick={() => {
                  // Simulate AI content improvement
                  const improvedContent = documentData.content + '\n\n[AI Enhanced Content]';
                  setDocumentData(prev => ({ 
                    ...prev, 
                    content: improvedContent,
                    aiSuggestions: [...(prev.aiSuggestions || []), 'Enhanced content added']
                  }));
                }}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-constructbms-blue transition-colors"
              >
                <LightBulbIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Improve Content</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enhance readability and clarity with AI suggestions
                </p>
              </button>
              
              <button
                onClick={() => {
                  // Simulate grammar check
                  setDocumentData(prev => ({ 
                    ...prev, 
                    aiSuggestions: [...(prev.aiSuggestions || []), 'Grammar and spelling checked']
                  }));
                }}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-constructbms-blue transition-colors"
              >
                <CheckIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Grammar Check</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check and correct grammar, spelling, and punctuation
                </p>
              </button>
              
              <button
                onClick={() => {
                  // Simulate style optimization
                  setDocumentData(prev => ({ 
                    ...prev, 
                    aiSuggestions: [...(prev.aiSuggestions || []), 'Style optimized for professional tone']
                  }));
                }}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-constructbms-blue transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-constructbms-blue mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Style Optimization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimize writing style for your target audience
                </p>
              </button>
            </div>
            
            {documentData.aiSuggestions && documentData.aiSuggestions.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Applied Enhancements:</h4>
                <ul className="space-y-1">
                  {documentData.aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-center">
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 4: // Organize
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Organization & Metadata
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Organize your document with categories and tags for easy discovery.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={documentData.category}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {documentData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-constructbms-blue text-black"
                      >
                        {tag}
                        <button
                          onClick={() => setDocumentData(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }))}
                          className="ml-1 hover:text-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setDocumentData(prev => ({
                            ...prev,
                            tags: [...prev.tags, e.currentTarget.value.trim()]
                          }));
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          setDocumentData(prev => ({
                            ...prev,
                            tags: [...prev.tags, input.value.trim()]
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {allTags.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Popular tags: {allTags.slice(0, 5).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Review & Preview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Preview your document and make any final adjustments before saving.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Document Preview</h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              
              {showPreview && (
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{documentData.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{documentData.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Category: {categories.find(c => c.id === documentData.category)?.name || documentData.category}
                      </span>
                      {documentData.tags.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Tags: {documentData.tags.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: documentData.content }} />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Document Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div>Title: {documentData.title || 'Not set'}</div>
                    <div>Category: {categories.find(c => c.id === documentData.category)?.name || 'General'}</div>
                    <div>Tags: {documentData.tags.length} added</div>
                    <div>Content: {documentData.content.length} characters</div>
                    <div>Type: {documentData.isTemplate ? 'Template' : 'Document'}</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Completion Status</h4>
                  <div className="space-y-1 text-sm">
                    {steps.slice(0, -1).map((step, index) => (
                      <div key={step.id} className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{step.title}</span>
                        <span className={step.completed ? 'text-green-600' : 'text-gray-400'}>
                          {step.completed ? '✓' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Save
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Save to Library
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Save your document to the library for future access and sharing.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Ready to save your document
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Document Details</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div><strong>Title:</strong> {documentData.title}</div>
                    <div><strong>Category:</strong> {categories?.find(c => c.id === documentData.category)?.name || 'General'}</div>
                    <div><strong>Type:</strong> {documentData.isTemplate ? 'Template' : 'Document'}</div>
                    <div><strong>Content Length:</strong> {documentData.content.length} characters</div>
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Save Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Save to library</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Make available for sharing</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Set as template</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSaveToLibrary}
                disabled={isProcessing}
                className="w-full py-3 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    Save Document to Library
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Document Wizard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title || 'Unknown'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index <= currentStep
                      ? 'border-constructbms-blue bg-constructbms-blue text-black'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}
                >
                  {step.completed ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-constructbms-blue' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`text-center ${
                  index === currentStep ? 'text-constructbms-blue font-medium' : ''
                }`}
                style={{ width: `${100 / steps.length}%` }}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!steps[currentStep]?.completed && steps[currentStep]?.required}
                className="flex items-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveToLibrary}
                disabled={isProcessing || !steps[currentStep]?.completed}
                className="flex items-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Complete
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentWizard; 
