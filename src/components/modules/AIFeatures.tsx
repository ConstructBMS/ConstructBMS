import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Lightbulb,
  FileText,
  Settings,
  Wand2,
  BarChart3,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  Users,
  FileEdit,
} from 'lucide-react';
import {
  aiService,
  AISuggestion,
  AISummary,
  AIGeneratedContent,
} from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

interface AIFeaturesProps {
  className?: string;
}

const AIFeatures: React.FC<AIFeaturesProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tools');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [generatedContent, setGeneratedContent] = useState<
    AIGeneratedContent[]
  >([]);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [aiSettings, setAiSettings] = useState({
    ai_enabled: true,
    auto_suggestions: true,
    auto_summaries: false,
    preferred_summary_type: 'brief',
    max_tokens_per_request: 2000,
    cost_limit_per_month: 50.0,
  });

  // AI Tool States
  const [rewriteInstructions, setRewriteInstructions] = useState('');
  const [rewriteStyle, setRewriteStyle] = useState('');
  const [rewriteResult, setRewriteResult] = useState('');
  const [improvementType, setImprovementType] = useState<
    'clarity' | 'conciseness' | 'professional' | 'engaging'
  >('clarity');
  const [improvementResult, setImprovementResult] = useState('');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generationType, setGenerationType] =
    useState<AIGeneratedContent['content_type']>('title');
  const [generationResult, setGenerationResult] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load usage stats
      const stats = await aiService.getAIUsageStats(user.id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!selectedDocument || !documentContent.trim()) {
      alert('Please select a document and provide content');
      return;
    }

    setLoading(true);
    try {
      const newSuggestions = await aiService.generateSuggestions(
        selectedDocument,
        documentContent
      );
      setSuggestions(prev => [...newSuggestions, ...prev]);
      alert(`Generated ${newSuggestions.length} suggestions`);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async (
    summaryType: AISummary['summary_type'] = 'brief'
  ) => {
    if (!selectedDocument || !documentContent.trim()) {
      alert('Please select a document and provide content');
      return;
    }

    setLoading(true);
    try {
      const summary = await aiService.summarizeDocument(
        selectedDocument,
        documentContent,
        summaryType
      );
      setSummaries(prev => [summary, ...prev]);
      alert('Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleRewriteContent = async () => {
    if (!documentContent.trim() || !rewriteInstructions.trim()) {
      alert('Please provide both content and instructions');
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.rewriteContent(
        documentContent,
        rewriteInstructions,
        rewriteStyle
      );
      setRewriteResult(result);
    } catch (error) {
      console.error('Error rewriting content:', error);
      alert('Failed to rewrite content');
    } finally {
      setLoading(false);
    }
  };

  const handleImproveContent = async () => {
    if (!documentContent.trim()) {
      alert('Please provide content to improve');
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.improveContent(
        documentContent,
        improvementType
      );
      setImprovementResult(result);
    } catch (error) {
      console.error('Error improving content:', error);
      alert('Failed to improve content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!generationPrompt.trim()) {
      alert('Please provide a prompt');
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.generateContent(
        generationPrompt,
        generationType,
        selectedDocument || undefined
      );
      setGenerationResult(result.generated_content);
      setGeneratedContent(prev => [result, ...prev]);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    try {
      await aiService.applySuggestion(suggestionId);
      setSuggestions(prev =>
        prev.map(s => (s.id === suggestionId ? { ...s, applied: true } : s))
      );
      alert('Suggestion applied successfully');
    } catch (error) {
      console.error('Error applying suggestion:', error);
      alert('Failed to apply suggestion');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const tabs = [
    { id: 'tools', label: 'AI Tools', icon: Sparkles },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'summaries', label: 'Summaries', icon: FileText },
    { id: 'generated', label: 'Generated Content', icon: Wand2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`ai-features ${className}`}>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <Brain className='w-8 h-8 text-blue-600' />
          <h1 className='text-2xl font-bold text-gray-900'>AI Features</h1>
        </div>
        <p className='text-gray-600'>
          Advanced AI-powered document analysis and enhancement tools
        </p>
      </div>

      {/* Quick Stats */}
      {usageStats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <Zap className='w-5 h-5 text-blue-600' />
              <span className='text-sm font-medium text-gray-600'>
                Total Requests
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {usageStats.total_requests}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <Target className='w-5 h-5 text-green-600' />
              <span className='text-sm font-medium text-gray-600'>
                Tokens Used
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {usageStats.total_tokens?.toLocaleString()}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <DollarSign className='w-5 h-5 text-yellow-600' />
              <span className='text-sm font-medium text-gray-600'>
                Total Cost
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              ${usageStats.total_cost?.toFixed(2)}
            </p>
          </div>
          <div className='bg-white rounded-lg p-4 shadow-sm border'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-purple-600' />
              <span className='text-sm font-medium text-gray-600'>
                Success Rate
              </span>
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {usageStats.total_requests > 0
                ? Math.round(
                    (usageStats.successful_requests /
                      usageStats.total_requests) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='flex space-x-8'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='w-4 h-4' />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='min-h-[500px]'>
        {/* AI Tools Tab */}
        {activeTab === 'tools' && (
          <div className='space-y-6'>
            {/* Document Input */}
            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <h3 className='text-lg font-semibold mb-4'>Document Content</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Document ID (optional)
                  </label>
                  <input
                    type='text'
                    value={selectedDocument}
                    onChange={e => setSelectedDocument(e.target.value)}
                    placeholder='Enter document ID for tracking'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Content to Analyze
                  </label>
                  <textarea
                    value={documentContent}
                    onChange={e => setDocumentContent(e.target.value)}
                    placeholder='Paste your document content here...'
                    rows={6}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* AI Tools Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Suggestions Generator */}
              <div className='bg-white rounded-lg p-6 shadow-sm border'>
                <div className='flex items-center gap-2 mb-4'>
                  <Lightbulb className='w-5 h-5 text-yellow-600' />
                  <h3 className='text-lg font-semibold'>
                    Generate Suggestions
                  </h3>
                </div>
                <p className='text-gray-600 mb-4'>
                  Get AI-powered suggestions to improve your document
                </p>
                <button
                  onClick={handleGenerateSuggestions}
                  disabled={loading || !documentContent.trim()}
                  className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <RefreshCw className='w-4 h-4 animate-spin mx-auto' />
                  ) : (
                    'Generate Suggestions'
                  )}
                </button>
              </div>

              {/* Summary Generator */}
              <div className='bg-white rounded-lg p-6 shadow-sm border'>
                <div className='flex items-center gap-2 mb-4'>
                  <FileText className='w-5 h-5 text-green-600' />
                  <h3 className='text-lg font-semibold'>Generate Summary</h3>
                </div>
                <p className='text-gray-600 mb-4'>
                  Create different types of summaries
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {(
                    ['brief', 'detailed', 'executive', 'technical'] as const
                  ).map(type => (
                    <button
                      key={type}
                      onClick={() => handleGenerateSummary(type)}
                      disabled={loading || !documentContent.trim()}
                      className='bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Rewriter */}
              <div className='bg-white rounded-lg p-6 shadow-sm border'>
                <div className='flex items-center gap-2 mb-4'>
                  <Edit3 className='w-5 h-5 text-purple-600' />
                  <h3 className='text-lg font-semibold'>Rewrite Content</h3>
                </div>
                <div className='space-y-3'>
                  <input
                    type='text'
                    value={rewriteInstructions}
                    onChange={e => setRewriteInstructions(e.target.value)}
                    placeholder='Rewrite instructions...'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <input
                    type='text'
                    value={rewriteStyle}
                    onChange={e => setRewriteStyle(e.target.value)}
                    placeholder='Style (optional) - e.g., professional, casual...'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <button
                    onClick={handleRewriteContent}
                    disabled={
                      loading ||
                      !documentContent.trim() ||
                      !rewriteInstructions.trim()
                    }
                    className='w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? (
                      <RefreshCw className='w-4 h-4 animate-spin mx-auto' />
                    ) : (
                      'Rewrite Content'
                    )}
                  </button>
                </div>
                {rewriteResult && (
                  <div className='mt-4 p-3 bg-gray-50 rounded-md'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium'>Result:</span>
                      <button
                        onClick={() => copyToClipboard(rewriteResult)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>
                    <p className='text-sm text-gray-700'>{rewriteResult}</p>
                  </div>
                )}
              </div>

              {/* Content Improver */}
              <div className='bg-white rounded-lg p-6 shadow-sm border'>
                <div className='flex items-center gap-2 mb-4'>
                  <Wand2 className='w-5 h-5 text-pink-600' />
                  <h3 className='text-lg font-semibold'>Improve Content</h3>
                </div>
                <div className='space-y-3'>
                  <select
                    value={improvementType}
                    onChange={e => setImprovementType(e.target.value as any)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='clarity'>Clarity</option>
                    <option value='conciseness'>Conciseness</option>
                    <option value='professional'>Professional</option>
                    <option value='engaging'>Engaging</option>
                  </select>
                  <button
                    onClick={handleImproveContent}
                    disabled={loading || !documentContent.trim()}
                    className='w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? (
                      <RefreshCw className='w-4 h-4 animate-spin mx-auto' />
                    ) : (
                      'Improve Content'
                    )}
                  </button>
                </div>
                {improvementResult && (
                  <div className='mt-4 p-3 bg-gray-50 rounded-md'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium'>Result:</span>
                      <button
                        onClick={() => copyToClipboard(improvementResult)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>
                    <p className='text-sm text-gray-700'>{improvementResult}</p>
                  </div>
                )}
              </div>

              {/* Content Generator */}
              <div className='bg-white rounded-lg p-6 shadow-sm border lg:col-span-2'>
                <div className='flex items-center gap-2 mb-4'>
                  <Plus className='w-5 h-5 text-indigo-600' />
                  <h3 className='text-lg font-semibold'>Generate Content</h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Content Type
                    </label>
                    <select
                      value={generationType}
                      onChange={e => setGenerationType(e.target.value as any)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='title'>Title</option>
                      <option value='description'>Description</option>
                      <option value='tags'>Tags</option>
                      <option value='outline'>Outline</option>
                      <option value='section'>Section</option>
                      <option value='conclusion'>Conclusion</option>
                    </select>
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Prompt
                    </label>
                    <input
                      type='text'
                      value={generationPrompt}
                      onChange={e => setGenerationPrompt(e.target.value)}
                      placeholder='Describe what you want to generate...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div className='mt-4 flex gap-2'>
                  <button
                    onClick={handleGenerateContent}
                    disabled={loading || !generationPrompt.trim()}
                    className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? (
                      <RefreshCw className='w-4 h-4 animate-spin' />
                    ) : (
                      'Generate'
                    )}
                  </button>
                  <button
                    onClick={() => setGenerationResult('')}
                    className='bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700'
                  >
                    Clear
                  </button>
                </div>
                {generationResult && (
                  <div className='mt-4 p-3 bg-gray-50 rounded-md'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium'>
                        Generated Content:
                      </span>
                      <button
                        onClick={() => copyToClipboard(generationResult)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>
                    <p className='text-sm text-gray-700'>{generationResult}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Document Suggestions</h3>
              <button
                onClick={loadData}
                className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
              >
                <RefreshCw className='w-4 h-4' />
                Refresh
              </button>
            </div>

            {suggestions.length === 0 ? (
              <div className='text-center py-12'>
                <Lightbulb className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No suggestions available. Generate some suggestions using the
                  AI Tools tab.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className='bg-white rounded-lg p-4 shadow-sm border'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.suggestion_type === 'grammar'
                              ? 'bg-red-100 text-red-800'
                              : suggestion.suggestion_type === 'style'
                                ? 'bg-blue-100 text-blue-800'
                                : suggestion.suggestion_type === 'clarity'
                                  ? 'bg-green-100 text-green-800'
                                  : suggestion.suggestion_type === 'structure'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {suggestion.suggestion_type}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        {suggestion.applied ? (
                          <CheckCircle className='w-5 h-5 text-green-600' />
                        ) : (
                          <button
                            onClick={() =>
                              handleApplySuggestion(suggestion.id!)
                            }
                            className='text-blue-600 hover:text-blue-800'
                          >
                            <CheckCircle className='w-5 h-5' />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Original:
                        </span>
                        <p className='text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1'>
                          {suggestion.original_text}
                        </p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Suggestion:
                        </span>
                        <p className='text-sm text-gray-600 bg-blue-50 p-2 rounded mt-1'>
                          {suggestion.suggested_text}
                        </p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Explanation:
                        </span>
                        <p className='text-sm text-gray-600 mt-1'>
                          {suggestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summaries Tab */}
        {activeTab === 'summaries' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Document Summaries</h3>
              <button
                onClick={loadData}
                className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
              >
                <RefreshCw className='w-4 h-4' />
                Refresh
              </button>
            </div>

            {summaries.length === 0 ? (
              <div className='text-center py-12'>
                <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No summaries available. Generate some summaries using the AI
                  Tools tab.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {summaries.map(summary => (
                  <div
                    key={summary.id}
                    className='bg-white rounded-lg p-4 shadow-sm border'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            summary.summary_type === 'brief'
                              ? 'bg-green-100 text-green-800'
                              : summary.summary_type === 'detailed'
                                ? 'bg-blue-100 text-blue-800'
                                : summary.summary_type === 'executive'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {summary.summary_type}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {summary.word_count} words • {summary.reading_time}{' '}
                          min read
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(summary.content)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>

                    <div className='space-y-3'>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Summary:
                        </span>
                        <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1'>
                          {summary.content}
                        </p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Key Points:
                        </span>
                        <ul className='text-sm text-gray-600 mt-1 space-y-1'>
                          {summary.key_points.map((point, index) => (
                            <li key={index} className='flex items-start gap-2'>
                              <span className='text-blue-600 mt-1'>•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated Content Tab */}
        {activeTab === 'generated' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Generated Content</h3>
              <button
                onClick={loadData}
                className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
              >
                <RefreshCw className='w-4 h-4' />
                Refresh
              </button>
            </div>

            {generatedContent.length === 0 ? (
              <div className='text-center py-12'>
                <Wand2 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No generated content available. Generate some content using
                  the AI Tools tab.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {generatedContent.map(content => (
                  <div
                    key={content.id}
                    className='bg-white rounded-lg p-4 shadow-sm border'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            content.content_type === 'title'
                              ? 'bg-blue-100 text-blue-800'
                              : content.content_type === 'description'
                                ? 'bg-green-100 text-green-800'
                                : content.content_type === 'tags'
                                  ? 'bg-purple-100 text-purple-800'
                                  : content.content_type === 'outline'
                                    ? 'bg-orange-100 text-orange-800'
                                    : content.content_type === 'section'
                                      ? 'bg-pink-100 text-pink-800'
                                      : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {content.content_type}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {Math.round(content.confidence * 100)}% confidence
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(content.generated_content)
                        }
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>

                    <div className='space-y-2'>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Prompt:
                        </span>
                        <p className='text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1'>
                          {content.prompt}
                        </p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-700'>
                          Generated Content:
                        </span>
                        <p className='text-sm text-gray-600 bg-blue-50 p-2 rounded mt-1'>
                          {content.generated_content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold'>AI Usage Analytics</h3>

            {usageStats ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* Request Types Chart */}
                <div className='bg-white rounded-lg p-6 shadow-sm border'>
                  <h4 className='text-lg font-medium mb-4'>Request Types</h4>
                  <div className='space-y-3'>
                    {Object.entries(usageStats.requests_by_type || {}).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className='flex justify-between items-center'
                        >
                          <span className='text-sm font-medium text-gray-700 capitalize'>
                            {type}
                          </span>
                          <span className='text-sm text-gray-600'>
                            {count as number}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Cost Analysis */}
                <div className='bg-white rounded-lg p-6 shadow-sm border'>
                  <h4 className='text-lg font-medium mb-4'>Cost Analysis</h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Total Cost
                      </span>
                      <span className='text-lg font-bold text-gray-900'>
                        ${usageStats.total_cost?.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Avg Cost/Request
                      </span>
                      <span className='text-sm text-gray-600'>
                        ${usageStats.avg_cost_per_request?.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Total Tokens
                      </span>
                      <span className='text-sm text-gray-600'>
                        {usageStats.total_tokens?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className='bg-white rounded-lg p-6 shadow-sm border'>
                  <h4 className='text-lg font-medium mb-4'>Success Metrics</h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Success Rate
                      </span>
                      <span className='text-lg font-bold text-green-600'>
                        {usageStats.total_requests > 0
                          ? Math.round(
                              (usageStats.successful_requests /
                                usageStats.total_requests) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Successful
                      </span>
                      <span className='text-sm text-green-600'>
                        {usageStats.successful_requests}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        Failed
                      </span>
                      <span className='text-sm text-red-600'>
                        {usageStats.failed_requests}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-12'>
                <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No analytics data available yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold'>AI Settings</h3>

            <div className='bg-white rounded-lg p-6 shadow-sm border'>
              <div className='space-y-6'>
                {/* General Settings */}
                <div>
                  <h4 className='text-md font-medium mb-4'>General Settings</h4>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          Enable AI Features
                        </label>
                        <p className='text-sm text-gray-500'>
                          Allow AI-powered document analysis and enhancement
                        </p>
                      </div>
                      <input
                        type='checkbox'
                        checked={aiSettings.ai_enabled}
                        onChange={e =>
                          setAiSettings(prev => ({
                            ...prev,
                            ai_enabled: e.target.checked,
                          }))
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          Auto Suggestions
                        </label>
                        <p className='text-sm text-gray-500'>
                          Automatically generate suggestions while editing
                        </p>
                      </div>
                      <input
                        type='checkbox'
                        checked={aiSettings.auto_suggestions}
                        onChange={e =>
                          setAiSettings(prev => ({
                            ...prev,
                            auto_suggestions: e.target.checked,
                          }))
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          Auto Summaries
                        </label>
                        <p className='text-sm text-gray-500'>
                          Automatically generate summaries for documents
                        </p>
                      </div>
                      <input
                        type='checkbox'
                        checked={aiSettings.auto_summaries}
                        onChange={e =>
                          setAiSettings(prev => ({
                            ...prev,
                            auto_summaries: e.target.checked,
                          }))
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h4 className='text-md font-medium mb-4'>Preferences</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Preferred Summary Type
                      </label>
                      <select
                        value={aiSettings.preferred_summary_type}
                        onChange={e =>
                          setAiSettings(prev => ({
                            ...prev,
                            preferred_summary_type: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value='brief'>Brief</option>
                        <option value='detailed'>Detailed</option>
                        <option value='executive'>Executive</option>
                        <option value='technical'>Technical</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Max Tokens per Request
                      </label>
                      <input
                        type='number'
                        value={aiSettings.max_tokens_per_request}
                        onChange={e =>
                          setAiSettings(prev => ({
                            ...prev,
                            max_tokens_per_request: parseInt(e.target.value),
                          }))
                        }
                        min='100'
                        max='4000'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Limits */}
                <div>
                  <h4 className='text-md font-medium mb-4'>Cost Management</h4>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Monthly Cost Limit ($)
                    </label>
                    <input
                      type='number'
                      value={aiSettings.cost_limit_per_month}
                      onChange={e =>
                        setAiSettings(prev => ({
                          ...prev,
                          cost_limit_per_month: parseFloat(e.target.value),
                        }))
                      }
                      min='0'
                      step='0.01'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <p className='text-sm text-gray-500 mt-1'>
                      Set to 0 for unlimited usage
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className='flex justify-end'>
                  <button
                    onClick={() =>
                      alert(
                        'Settings saved! (This would save to database in real implementation)'
                      )
                    }
                    className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700'
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeatures;
