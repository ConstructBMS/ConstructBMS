export interface AutomationRule {
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  createdAt: Date;
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  priority: number;
  updatedAt: Date;
}

export interface AutomationCondition {
  field: 'subject' | 'sender' | 'content' | 'category' | 'priority' | 'has_attachments';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface AutomationAction {
  parameters: Record<string, any>;
  type: 'auto_reply' | 'assign' | 'categorize' | 'tag' | 'forward' | 'archive' | 'notify' | 'create_task';
}

export interface AutoResponse {
  // HH:MM format
  content: string;
  delayMinutes?: number;
  id: string;
  isActive: boolean;
  lastUsed?: Date; 
  name: string;
  scheduleTime?: string;
  trigger: 'immediate' | 'delayed' | 'scheduled';
  usageCount: number;
}

export interface EmailWorkflow {
  createdAt: Date;
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  alternativeStepId?: string;
  id: string;
  name: string;
  nextStepId?: string;
  parameters: Record<string, any>;
  type: 'condition' | 'action' | 'delay' | 'approval'; // For conditional branching
}

class EmailAutomationService {
  private rules: AutomationRule[] = [];
  private autoResponses: AutoResponse[] = [];
  private workflows: EmailWorkflow[] = [];
  private subscribers: ((data: any) => void)[] = [];

  // Create automation rule
  createRule(
    name: string,
    description: string,
    conditions: AutomationCondition[],
    actions: AutomationAction[],
    priority: number = 1
  ): AutomationRule {
    const rule: AutomationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      conditions,
      actions,
      isActive: true,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.push(rule);
    this.notifySubscribers({ type: 'rule_created', data: rule });
    return rule;
  }

  // Process email through automation rules
  processEmail(email: any): AutomationAction[] {
    const matchedRules = this.rules
      .filter(rule => rule.isActive)
      .filter(rule => this.evaluateConditions(rule.conditions, email))
      .sort((a, b) => b.priority - a.priority);

    const executedActions: AutomationAction[] = [];

    for (const rule of matchedRules) {
      for (const action of rule.actions) {
        this.executeAction(action, email);
        executedActions.push(action);
      }
    }

    return executedActions;
  }

  // Evaluate conditions for a rule
  private evaluateConditions(
    conditions: AutomationCondition[],
    email: any
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(condition.field, email);

      switch (condition.operator) {
        case 'contains':
          return String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
        case 'equals':
          return (
            String(fieldValue).toLowerCase() ===
            String(condition.value).toLowerCase()
          );
        case 'starts_with':
          return String(fieldValue)
            .toLowerCase()
            .startsWith(String(condition.value).toLowerCase());
        case 'ends_with':
          return String(fieldValue)
            .toLowerCase()
            .endsWith(String(condition.value).toLowerCase());
        case 'regex':
          try {
            const regex = new RegExp(String(condition.value), 'i');
            return regex.test(String(fieldValue));
          } catch {
            return false;
          }
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  // Get field value from email
  private getFieldValue(field: string, email: any): any {
    switch (field) {
      case 'subject':
        return email.subject || '';
      case 'sender':
        return email.sender || '';
      case 'content':
        return email.content || '';
      case 'category':
        return email.category || '';
      case 'priority':
        return email.priority || '';
      case 'has_attachments':
        return email.attachments && email.attachments.length > 0;
      default:
        return '';
    }
  }

  // Execute automation action
  private executeAction(action: AutomationAction, email: any): void {
    switch (action.type) {
      case 'auto_reply':
        this.sendAutoReply(email, action.parameters);
        break;
      case 'assign':
        this.assignEmail(email, action.parameters);
        break;
      case 'categorize':
        this.categorizeEmail(email, action.parameters);
        break;
      case 'tag':
        this.tagEmail(email, action.parameters);
        break;
      case 'forward':
        this.forwardEmail(email, action.parameters);
        break;
      case 'archive':
        this.archiveEmail(email);
        break;
      case 'notify':
        this.notifyTeam(email, action.parameters);
        break;
      case 'create_task':
        this.createTask(email, action.parameters);
        break;
    }
  }

  // Send auto-reply
  private sendAutoReply(email: any, parameters: Record<string, any>): void {
    const autoResponse = this.autoResponses.find(
      ar => ar.id === parameters.responseId
    );
    if (autoResponse && autoResponse.isActive) {
      // In a real implementation, this would send the actual email
      console.log(
        `Auto-reply sent to ${email.senderEmail}: ${autoResponse.content}`
      );
      autoResponse.usageCount++;
      autoResponse.lastUsed = new Date();
    }
  }

  // Assign email
  private assignEmail(email: any, parameters: Record<string, any>): void {
    // This would integrate with the collaborative email service
    console.log(`Email assigned to ${parameters.assignedTo}`);
  }

  // Categorize email
  private categorizeEmail(email: any, parameters: Record<string, any>): void {
    email.category = parameters.category;
    console.log(`Email categorized as ${parameters.category}`);
  }

  // Tag email
  private tagEmail(email: any, parameters: Record<string, any>): void {
    if (!email.tags) email.tags = [];
    email.tags.push(parameters.tag);
    console.log(`Email tagged with ${parameters.tag}`);
  }

  // Forward email
  private forwardEmail(email: any, parameters: Record<string, any>): void {
    console.log(`Email forwarded to ${parameters.forwardTo}`);
  }

  // Archive email
  private archiveEmail(email: any): void {
    email.isArchived = true;
    console.log('Email archived');
  }

  // Notify team
  private notifyTeam(email: any, parameters: Record<string, any>): void {
    console.log(`Team notification sent: ${parameters.message}`);
  }

  // Create task
  private createTask(email: any, parameters: Record<string, any>): void {
    console.log(`Task created: ${parameters.taskTitle}`);
  }

  // Create auto-response
  createAutoResponse(
    name: string,
    content: string,
    trigger: 'immediate' | 'delayed' | 'scheduled',
    delayMinutes?: number,
    scheduleTime?: string
  ): AutoResponse {
    const autoResponse: AutoResponse = {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      trigger,
      delayMinutes,
      scheduleTime,
      content,
      isActive: true,
      usageCount: 0,
    };

    this.autoResponses.push(autoResponse);
    this.notifySubscribers({
      type: 'auto_response_created',
      data: autoResponse,
    });
    return autoResponse;
  }

  // Create workflow
  createWorkflow(
    name: string,
    description: string,
    steps: WorkflowStep[]
  ): EmailWorkflow {
    const workflow: EmailWorkflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      steps,
      isActive: true,
      createdAt: new Date(),
    };

    this.workflows.push(workflow);
    this.notifySubscribers({ type: 'workflow_created', data: workflow });
    return workflow;
  }

  // Execute workflow
  executeWorkflow(workflowId: string, email: any): void {
    const workflow = this.workflows.find(
      w => w.id === workflowId && w.isActive
    );
    if (!workflow) return;

    let currentStep = workflow.steps[0];
    while (currentStep) {
      this.executeWorkflowStep(currentStep, email);
      const nextStep = this.getNextStep(currentStep, email);
      if (!nextStep) break;
      currentStep = nextStep;
    }
  }

  // Execute workflow step
  private executeWorkflowStep(step: WorkflowStep, email: any): void {
    switch (step.type) {
      case 'condition':
        // Evaluate condition and set next step
        break;
      case 'action':
        this.executeAction(step.parameters as AutomationAction, email);
        break;
      case 'delay':
        // Implement delay logic
        break;
      case 'approval':
        // Create approval request
        break;
    }
  }

  // Get next workflow step
  private getNextStep(
    currentStep: WorkflowStep,
    email: any
  ): WorkflowStep | undefined {
    // In a real implementation, this would evaluate conditions and determine the next step
    return currentStep.nextStepId
      ? this.workflows
          .flatMap(w => w.steps)
          .find(s => s.id === currentStep.nextStepId)
      : undefined;
  }

  // Get all rules
  getRules(): AutomationRule[] {
    return [...this.rules];
  }

  // Get all auto-responses
  getAutoResponses(): AutoResponse[] {
    return [...this.autoResponses];
  }

  // Get all workflows
  getWorkflows(): EmailWorkflow[] {
    return [...this.workflows];
  }

  // Update rule
  updateRule(
    ruleId: string,
    updates: Partial<AutomationRule>
  ): AutomationRule | null {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates, { updatedAt: new Date() });
      this.notifySubscribers({ type: 'rule_updated', data: rule });
      return rule;
    }
    return null;
  }

  // Delete rule
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      this.notifySubscribers({ type: 'rule_deleted', data: { ruleId } });
      return true;
    }
    return false;
  }

  // Subscribe to updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => callback(data));
  }

  // Initialize with demo data
  initializeDemoData(): void {
    // Create demo automation rules
    this.createRule(
      'Urgent Client Emails',
      'Automatically assign urgent client emails to project managers',
      [
        {
          field: 'category',
          operator: 'equals',
          value: 'client-communication',
        },
        { field: 'priority', operator: 'equals', value: 'critical' },
      ],
      [
        {
          type: 'assign',
          parameters: { assignedTo: 'sarah.johnson@constructbms.com' },
        },
        {
          type: 'notify',
          parameters: { message: 'Urgent client email received' },
        },
      ],
      10
    );

    this.createRule(
      'Invoice Payments',
      'Auto-categorize and archive payment confirmations',
      [
        { field: 'category', operator: 'equals', value: 'invoice-payment' },
        {
          field: 'subject',
          operator: 'contains',
          value: 'payment confirmation',
        },
      ],
      [
        { type: 'tag', parameters: { tag: 'payment-received' } },
        { type: 'archive', parameters: {} },
      ],
      5
    );

    this.createRule(
      'Meeting Requests',
      'Auto-schedule meeting requests',
      [{ field: 'category', operator: 'equals', value: 'meeting-scheduling' }],
      [
        {
          type: 'create_task',
          parameters: { taskTitle: 'Schedule meeting from email' },
        },
        {
          type: 'assign',
          parameters: { assignedTo: 'mike.wilson@constructbms.com' },
        },
      ],
      3
    );

    // Create demo auto-responses
    this.createAutoResponse(
      'Out of Office',
      'Thank you for your email. I am currently out of the office and will return on Monday. For urgent matters, please contact my colleague at colleague@constructbms.com.',
      'immediate'
    );

    this.createAutoResponse(
      'Project Inquiry',
      'Thank you for your project inquiry. I have received your message and will review it within 24 hours. You can expect a detailed response with next steps.',
      'delayed',
      60
    );

    this.createAutoResponse(
      'Invoice Query',
      'Thank you for your invoice query. I have received your message and will process this request within 1-2 business days.',
      'immediate'
    );

    // Create demo workflow
    this.createWorkflow(
      'Client Onboarding',
      'Automated workflow for new client communications',
      [
        {
          id: 'step1',
          name: 'Initial Contact',
          type: 'condition',
          parameters: { condition: 'new_client' },
        },
        {
          id: 'step2',
          name: 'Send Welcome Email',
          type: 'action',
          parameters: { action: 'send_welcome_email' },
          nextStepId: 'step3',
        },
        {
          id: 'step3',
          name: 'Assign Account Manager',
          type: 'action',
          parameters: { action: 'assign_account_manager' },
          nextStepId: 'step4',
        },
        {
          id: 'step4',
          name: 'Schedule Follow-up',
          type: 'action',
          parameters: { action: 'schedule_followup' },
        },
      ]
    );
  }
}

export const emailAutomationService = new EmailAutomationService();
emailAutomationService.initializeDemoData();
