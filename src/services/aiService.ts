import { supabase } from './supabase';

export interface AIRequest {
  content: string;
  context?: Record<string, any>;
  cost?: number;
  created_at?: string;
  document_id?: string;
  error_message?: string;
  id?: string;
  request_type: 'summarize' | 'suggest' | 'rewrite' | 'analyze' | 'generate' | 'improve';
  response?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tokens_used?: number;
  updated_at?: string;
  user_id: string;
}

export interface AISuggestion {
  applied: boolean;
  confidence: number;
  created_at?: string;
  document_id: string;
  explanation: string;
  id?: string;
  original_text: string;
  position: {
    end: number;
    start: number;
  };
  suggested_text: string;
  suggestion_type: 'grammar' | 'style' | 'clarity' | 'structure' | 'content';
}

export interface AISummary {
  content: string;
  created_at?: string;
  document_id: string;
  id?: string;
  key_points: string[];
  reading_time: number;
  summary_type: 'brief' | 'detailed' | 'executive' | 'technical';
  word_count: number;
}

export interface AIGeneratedContent {
  confidence: number;
  content_type: 'title' | 'description' | 'tags' | 'outline' | 'section' | 'conclusion';
  created_at?: string;
  document_id?: string;
  generated_content: string;
  id?: string;
  prompt: string;
}

class AIService {
  private apiKey: string | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeAI();
  }

  private initializeAI() {
    // Check if AI is enabled
    if (import.meta.env.VITE_AI_ENABLED !== 'true') {
      this.isEnabled = false;
      return;
    }

    // Get API key from environment or user settings
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;

    // Check if user has opted out of AI features
    const aiOptOut = localStorage.getItem('ai_opt_out');
    if (aiOptOut === 'true') {
      this.isEnabled = false;
      return;
    }

    this.isEnabled = true;
  }

  // Summarize document content
  async summarizeDocument(
    documentId: string,
    content: string,
    summaryType: AISummary['summary_type'] = 'brief'
  ): Promise<AISummary> {
    if (!this.isEnabled) {
      throw new Error('AI features are not enabled');
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const prompt = this.buildSummarizationPrompt(content, summaryType);
      const response = await this.callOpenAI(prompt, 'summarize');

      const summary: AISummary = {
        document_id: documentId,
        summary_type: summaryType,
        content: response.content,
        key_points: response.key_points || [],
        word_count: this.countWords(response.content),
        reading_time: Math.ceil(this.countWords(response.content) / 200), // Average reading speed
      };

      // Save summary to database
      const { data, error } = await supabase
        .from('ai_summaries')
        .insert([summary])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error summarizing document:', error);
      throw error;
    }
  }

  // Generate suggestions for document improvement
  async generateSuggestions(
    documentId: string,
    content: string
  ): Promise<AISuggestion[]> {
    if (!this.isEnabled) {
      throw new Error('AI features are not enabled');
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const prompt = this.buildSuggestionPrompt(content);
      const response = await this.callOpenAI(prompt, 'suggest');

      const suggestions: AISuggestion[] = response.suggestions || [];

      // Save suggestions to database
      if (suggestions.length > 0) {
        const { error } = await supabase
          .from('ai_suggestions')
          .insert(suggestions.map(s => ({ ...s, document_id: documentId })));

        if (error) throw error;
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  // Rewrite content with specific instructions
  async rewriteContent(
    content: string,
    instructions: string,
    style?: string
  ): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('AI features are not enabled');
    }

    try {
      const prompt = this.buildRewritePrompt(content, instructions, style);
      const response = await this.callOpenAI(prompt, 'rewrite');
      return response.content;
    } catch (error) {
      console.error('Error rewriting content:', error);
      throw error;
    }
  }

  // Analyze document content
  async analyzeDocument(
    documentId: string,
    content: string
  ): Promise<Record<string, any>> {
    if (!this.isEnabled) {
      throw new Error('AI features are not enabled');
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const prompt = this.buildAnalysisPrompt(content);
      const response = await this.callOpenAI(prompt, 'analyze');

      // Save analysis request
      const analysisRequest: AIRequest = {
        user_id: user.id,
        document_id: documentId,
        request_type: 'analyze',
        content: content,
        response: JSON.stringify(response),
        status: 'completed',
        tokens_used: response.tokens_used,
        cost: response.cost,
      };

      await supabase.from('ai_requests').insert([analysisRequest]);

      return response;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  // Generate content based on prompt
  async generateContent(
    prompt: string,
    contentType: AIGeneratedContent['content_type'],
    documentId?: string
  ): Promise<AIGeneratedContent> {
    if (!this.isEnabled) {
      throw new Error('AI features are not enabled');
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const enhancedPrompt = this.buildGenerationPrompt(prompt, contentType);
      const response = await this.callOpenAI(enhancedPrompt, 'generate');

      const generatedContent: AIGeneratedContent = {
        document_id: documentId,
        content_type: contentType,
        prompt: prompt,
        generated_content: response.content,
        confidence: response.confidence || 0.8,
      };

      // Save generated content
      const { data, error } = await supabase
        .from('ai_generated_content')
        .insert([generatedContent])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Improve document content
  async improveContent(
    content: string,
    improvementType: 'clarity' | 'conciseness' | 'professional' | 'engaging'
  ): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('AI features are not enabled');
    }

    try {
      const prompt = this.buildImprovementPrompt(content, improvementType);
      const response = await this.callOpenAI(prompt, 'improve');
      return response.content;
    } catch (error) {
      console.error('Error improving content:', error);
      throw error;
    }
  }

  // Get AI suggestions for a document
  async getDocumentSuggestions(documentId: string): Promise<AISuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('document_id', documentId)
        .eq('applied', false)
        .order('confidence', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document suggestions:', error);
      return [];
    }
  }

  // Get AI summaries for a document
  async getDocumentSummaries(documentId: string): Promise<AISummary[]> {
    try {
      const { data, error } = await supabase
        .from('ai_summaries')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document summaries:', error);
      return [];
    }
  }

  // Apply a suggestion
  async applySuggestion(suggestionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ applied: true })
        .eq('id', suggestionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error applying suggestion:', error);
      throw error;
    }
  }

  // Get AI usage statistics
  async getAIUsageStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, any>> {
    try {
      const start =
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      const stats = {
        total_requests: data?.length || 0,
        total_tokens:
          data?.reduce((sum, req) => sum + (req.tokens_used || 0), 0) || 0,
        total_cost: data?.reduce((sum, req) => sum + (req.cost || 0), 0) || 0,
        requests_by_type:
          data?.reduce(
            (acc, req) => {
              acc[req.request_type] = (acc[req.request_type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ) || {},
      };

      return stats;
    } catch (error) {
      console.error('Error fetching AI usage stats:', error);
      return {
        total_requests: 0,
        total_tokens: 0,
        total_cost: 0,
        requests_by_type: {},
      };
    }
  }

  // Private helper methods
  private async callOpenAI(prompt: string, requestType: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Simulate OpenAI API call (in real implementation, this would call the actual API)
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Return mock response based on request type
    switch (requestType) {
      case 'summarize':
        return {
          content: 'This is a mock summary of the document content...',
          key_points: ['Key point 1', 'Key point 2', 'Key point 3'],
          tokens_used: 150,
          cost: 0.003,
        };
      case 'suggest':
        return {
          suggestions: [
            {
              suggestion_type: 'grammar',
              original_text: 'This is a example.',
              suggested_text: 'This is an example.',
              confidence: 0.95,
              explanation: 'Fix article usage',
              position: { start: 0, end: 20 },
              applied: false,
            },
          ],
          tokens_used: 200,
          cost: 0.004,
        };
      case 'rewrite':
        return {
          content: 'This is the rewritten content based on the instructions...',
          tokens_used: 180,
          cost: 0.0036,
        };
      case 'analyze':
        return {
          readability_score: 85,
          tone: 'professional',
          complexity: 'moderate',
          estimated_reading_time: 5,
          key_themes: ['theme1', 'theme2'],
          tokens_used: 250,
          cost: 0.005,
        };
      case 'generate':
        return {
          content: 'This is generated content based on the prompt...',
          confidence: 0.85,
          tokens_used: 120,
          cost: 0.0024,
        };
      case 'improve':
        return {
          content: 'This is the improved version of the content...',
          tokens_used: 160,
          cost: 0.0032,
        };
      default:
        return {
          content: 'AI response content...',
          tokens_used: 100,
          cost: 0.002,
        };
    }
  }

  private buildSummarizationPrompt(
    content: string,
    summaryType: string
  ): string {
    const typeInstructions = {
      brief: 'Provide a concise 2-3 sentence summary',
      detailed: 'Provide a comprehensive summary with key points',
      executive: 'Provide an executive summary suitable for business leaders',
      technical:
        'Provide a technical summary with technical details and specifications',
    };

    return `Please ${typeInstructions[summaryType as keyof typeof typeInstructions]} of the following document content:

${content}

Please also provide 3-5 key points that summarize the main ideas.`;
  }

  private buildSuggestionPrompt(content: string): string {
    return `Please analyze the following document content and provide suggestions for improvement in the following areas:
- Grammar and spelling
- Style and tone
- Clarity and readability
- Structure and organization
- Content completeness

Document content:
${content}

Please provide specific suggestions with explanations and confidence scores.`;
  }

  private buildRewritePrompt(
    content: string,
    instructions: string,
    style?: string
  ): string {
    return `Please rewrite the following content according to these instructions: ${instructions}

${style ? `Style: ${style}` : ''}

Original content:
${content}

Please provide the rewritten version.`;
  }

  private buildAnalysisPrompt(content: string): string {
    return `Please analyze the following document content and provide insights on:
- Readability score (0-100)
- Tone and style
- Complexity level
- Estimated reading time
- Key themes and topics
- Writing quality assessment

Document content:
${content}`;
  }

  private buildGenerationPrompt(prompt: string, contentType: string): string {
    const typeInstructions = {
      title: 'Generate a compelling and descriptive title',
      description: 'Generate a clear and informative description',
      tags: 'Generate relevant tags for categorization',
      outline: 'Generate a structured outline',
      section: 'Generate content for a document section',
      conclusion: 'Generate a conclusion section',
    };

    return `Please ${typeInstructions[contentType as keyof typeof typeInstructions]} based on the following context:

${prompt}

Please provide the generated content.`;
  }

  private buildImprovementPrompt(
    content: string,
    improvementType: string
  ): string {
    const improvementInstructions = {
      clarity: 'Improve clarity and make the content easier to understand',
      conciseness: 'Make the content more concise while preserving meaning',
      professional:
        'Make the content more professional and business-appropriate',
      engaging: 'Make the content more engaging and interesting to read',
    };

    return `Please improve the following content to make it more ${improvementType}. Focus on ${improvementInstructions[improvementType as keyof typeof improvementInstructions]}.

Original content:
${content}

Please provide the improved version.`;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
}

// Create singleton instance
let aiServiceInstance: AIService | null = null;

const getAIServiceInstance = () => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

// Export functions that use the singleton
export const aiService = {
  summarizeDocument: (
    documentId: string,
    content: string,
    summaryType?: AISummary['summary_type']
  ) =>
    getAIServiceInstance().summarizeDocument(documentId, content, summaryType),
  generateSuggestions: (documentId: string, content: string) =>
    getAIServiceInstance().generateSuggestions(documentId, content),
  rewriteContent: (content: string, instructions: string, style?: string) =>
    getAIServiceInstance().rewriteContent(content, instructions, style),
  analyzeDocument: (documentId: string, content: string) =>
    getAIServiceInstance().analyzeDocument(documentId, content),
  generateContent: (
    prompt: string,
    contentType: AIGeneratedContent['content_type'],
    documentId?: string
  ) => getAIServiceInstance().generateContent(prompt, contentType, documentId),
  improveContent: (
    content: string,
    improvementType: 'clarity' | 'conciseness' | 'professional' | 'engaging'
  ) => getAIServiceInstance().improveContent(content, improvementType),
  getDocumentSuggestions: (documentId: string) =>
    getAIServiceInstance().getDocumentSuggestions(documentId),
  getDocumentSummaries: (documentId: string) =>
    getAIServiceInstance().getDocumentSummaries(documentId),
  applySuggestion: (suggestionId: string) =>
    getAIServiceInstance().applySuggestion(suggestionId),
  getAIUsageStats: (userId: string, startDate?: string, endDate?: string) =>
    getAIServiceInstance().getAIUsageStats(userId, startDate, endDate),
};
