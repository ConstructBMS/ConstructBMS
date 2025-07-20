import React, { useState, useEffect } from 'react';
import {
  X,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface EmailAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmail?: any;
}

interface AIInsight {
  confidence: number;
  description: string;
  id: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  type: 'follow_up' | 'deadline' | 'action_required' | 'opportunity' | 'risk';
}

interface AIAnalysis {
  keyPoints: string[];
  relatedEntities: {
    customers?: Array<{ confidence: number; name: string }>;
    projects?: Array<{ confidence: number; name: string }>;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedActions: string[];
  summary: string;
  urgency: 'low' | 'medium' | 'high';
}

const EmailAIModal: React.FC<EmailAIModalProps> = ({
  isOpen,
  onClose,
  selectedEmail,
}) => {
  const [activeTab, setActiveTab] = useState<
    'insights' | 'analysis' | 'automation'
  >('insights');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    if (isOpen && selectedEmail) {
      analyzeEmail();
    }
  }, [isOpen, selectedEmail]);

  const analyzeEmail = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAnalysis: AIAnalysis = {
      summary: selectedEmail
        ? `AI analysis of email from ${selectedEmail.sender} regarding "${selectedEmail.subject}". This appears to be a ${selectedEmail.priority} priority communication that requires attention.`
        : 'No email selected for analysis.',
      sentiment:
        selectedEmail?.priority === 'critical'
          ? 'negative'
          : selectedEmail?.priority === 'high'
            ? 'neutral'
            : 'positive',
      urgency:
        selectedEmail?.priority === 'critical'
          ? 'high'
          : selectedEmail?.priority === 'high'
            ? 'medium'
            : 'low',
      keyPoints: [
        'Contains actionable items requiring response',
        'Mentions project-related deadlines',
        'Involves client communication',
        selectedEmail?.attachments?.length > 0
          ? `Includes ${selectedEmail.attachments.length} attachment(s)`
          : 'No attachments',
      ].filter(Boolean),
      suggestedActions: [
        'Schedule follow-up meeting',
        'Create task in project management system',
        'Update client status',
        'Review attached documents',
      ],
      relatedEntities: {
        customers: [{ name: 'Acme Corp', confidence: 0.85 }],
        projects: [{ name: 'Q4 Initiative', confidence: 0.92 }],
      },
    };

    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'action_required',
        title: 'Response Required',
        description:
          'This email requires a response within 24 hours based on sender priority and content.',
        priority: 'high',
        confidence: 0.89,
      },
      {
        id: '2',
        type: 'follow_up',
        title: 'Schedule Follow-up',
        description:
          'Consider scheduling a follow-up meeting to discuss project details mentioned.',
        priority: 'medium',
        confidence: 0.76,
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Client Opportunity',
        description:
          'Potential for expanding business relationship based on communication tone.',
        priority: 'medium',
        confidence: 0.68,
      },
    ];

    setAnalysis(mockAnalysis);
    setInsights(mockInsights);
    setIsAnalyzing(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return <Clock className='w-5 h-5' />;
      case 'deadline':
        return <AlertTriangle className='w-5 h-5' />;
      case 'action_required':
        return <CheckCircle className='w-5 h-5' />;
      case 'opportunity':
        return <TrendingUp className='w-5 h-5' />;
      case 'risk':
        return <AlertTriangle className='w-5 h-5' />;
      default:
        return <Target className='w-5 h-5' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-constructbms-blue rounded-lg flex items-center justify-center'>
              <Brain className='w-6 h-6 text-black' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Email AI Assistant
              </h2>
              <p className='text-sm text-gray-500'>
                AI-powered insights and automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'insights'
                ? 'border-constructbms-blue text-constructbms-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className='w-4 h-4' />
            <span>AI Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'analysis'
                ? 'border-constructbms-blue text-constructbms-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Brain className='w-4 h-4' />
            <span>Email Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'automation'
                ? 'border-constructbms-blue text-constructbms-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className='w-4 h-4' />
            <span>Automation</span>
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {isAnalyzing ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center'>
                <div className='w-12 h-12 border-4 border-constructbms-blue border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Analyzing email with AI...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'insights' && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      AI Insights
                    </h3>
                    <div className='grid gap-4'>
                      {insights.map(insight => (
                        <div
                          key={insight.id}
                          className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                        >
                          <div className='flex items-start space-x-3'>
                            <div className='flex-shrink-0'>
                              {getInsightIcon(insight.type)}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center justify-between mb-2'>
                                <h4 className='font-medium text-gray-900'>
                                  {insight.title}
                                </h4>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(insight.priority)}`}
                                >
                                  {insight.priority} priority
                                </span>
                              </div>
                              <p className='text-gray-600 text-sm mb-2'>
                                {insight.description}
                              </p>
                              <div className='flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>
                                  Confidence:{' '}
                                  {Math.round(insight.confidence * 100)}%
                                </span>
                                <button className='text-constructbms-blue hover:text-constructbms-dark text-sm font-medium'>
                                  Take Action
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && analysis && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Email Analysis
                    </h3>

                    {/* Summary */}
                    <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Summary
                      </h4>
                      <p className='text-gray-700'>{analysis.summary}</p>
                    </div>

                    {/* Metrics */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                      <div className='bg-white border rounded-lg p-4'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <TrendingUp className='w-4 h-4 text-gray-500' />
                          <span className='text-sm font-medium text-gray-700'>
                            Sentiment
                          </span>
                        </div>
                        <span
                          className={`text-lg font-semibold ${getSentimentColor(analysis.sentiment)}`}
                        >
                          {analysis.sentiment.charAt(0).toUpperCase() +
                            analysis.sentiment.slice(1)}
                        </span>
                      </div>

                      <div className='bg-white border rounded-lg p-4'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <AlertTriangle className='w-4 h-4 text-gray-500' />
                          <span className='text-sm font-medium text-gray-700'>
                            Urgency
                          </span>
                        </div>
                        <span
                          className={`text-lg font-semibold ${getPriorityColor(analysis.urgency)}`}
                        >
                          {analysis.urgency.charAt(0).toUpperCase() +
                            analysis.urgency.slice(1)}
                        </span>
                      </div>

                      <div className='bg-white border rounded-lg p-4'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <Target className='w-4 h-4 text-gray-500' />
                          <span className='text-sm font-medium text-gray-700'>
                            Key Points
                          </span>
                        </div>
                        <span className='text-lg font-semibold text-gray-900'>
                          {analysis.keyPoints.length}
                        </span>
                      </div>
                    </div>

                    {/* Key Points */}
                    <div className='bg-white border rounded-lg p-4 mb-6'>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Key Points
                      </h4>
                      <ul className='space-y-2'>
                        {analysis.keyPoints.map((point, index) => (
                          <li
                            key={index}
                            className='flex items-start space-x-2'
                          >
                            <div className='w-2 h-2 bg-constructbms-blue rounded-full mt-2 flex-shrink-0'></div>
                            <span className='text-gray-700'>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggested Actions */}
                    <div className='bg-white border rounded-lg p-4'>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Suggested Actions
                      </h4>
                      <div className='space-y-2'>
                        {analysis.suggestedActions.map((action, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                          >
                            <span className='text-gray-700'>{action}</span>
                            <button className='text-constructbms-blue hover:text-constructbms-dark text-sm font-medium'>
                              Execute
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'automation' && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      AI Automation Suggestions
                    </h3>

                    <div className='grid gap-4'>
                      <div className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                        <div className='flex items-start space-x-3'>
                          <div className='w-8 h-8 bg-constructbms-blue rounded-lg flex items-center justify-center flex-shrink-0'>
                            <Zap className='w-4 h-4 text-black' />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Auto-Categorize Similar Emails
                            </h4>
                            <p className='text-gray-600 text-sm mb-3'>
                              Automatically categorize emails from this sender
                              as "{selectedEmail?.category || 'project-related'}
                              " based on content analysis.
                            </p>
                            <div className='flex items-center space-x-2'>
                              <button className='bg-constructbms-blue text-black px-3 py-1 rounded text-sm font-medium hover:bg-constructbms-dark transition-colors'>
                                Create Rule
                              </button>
                              <button className='text-gray-500 hover:text-gray-700 text-sm'>
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                        <div className='flex items-start space-x-3'>
                          <div className='w-8 h-8 bg-constructbms-blue rounded-lg flex items-center justify-center flex-shrink-0'>
                            <Users className='w-4 h-4 text-black' />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Auto-Assign to Team Member
                            </h4>
                            <p className='text-gray-600 text-sm mb-3'>
                              Automatically assign emails from this sender to
                              the appropriate team member based on project
                              context.
                            </p>
                            <div className='flex items-center space-x-2'>
                              <button className='bg-constructbms-blue text-black px-3 py-1 rounded text-sm font-medium hover:bg-constructbms-dark transition-colors'>
                                Create Rule
                              </button>
                              <button className='text-gray-500 hover:text-gray-700 text-sm'>
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                        <div className='flex items-start space-x-3'>
                          <div className='w-8 h-8 bg-constructbms-blue rounded-lg flex items-center justify-center flex-shrink-0'>
                            <Calendar className='w-4 h-4 text-black' />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Smart Reply Templates
                            </h4>
                            <p className='text-gray-600 text-sm mb-3'>
                              Generate contextual reply templates based on email
                              content and sender relationship.
                            </p>
                            <div className='flex items-center space-x-2'>
                              <button className='bg-constructbms-blue text-black px-3 py-1 rounded text-sm font-medium hover:bg-constructbms-dark transition-colors'>
                                Create Template
                              </button>
                              <button className='text-gray-500 hover:text-gray-700 text-sm'>
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailAIModal;
