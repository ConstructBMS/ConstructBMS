import { supabase } from './supabase';

export interface Workflow {
  category: string;
  created_at?: string;
  created_by: string;
  description: string;
  id?: string;
  is_active: boolean;
  name: string;
  updated_at?: string;
}

export interface WorkflowStage {
  auto_approve: boolean;
  created_at?: string;
  description: string;
  id?: string;
  name: string;
  required_approvers: number;
  required_roles: string[];
  stage_number: number;
  timeout_hours?: number;
  workflow_id: string;
}

export interface DocumentWorkflow {
  completed_at?: string;
  created_at?: string;
  current_stage: number;
  document_id: string;
  id?: string;
  initiated_at: string;
  initiated_by: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  updated_at?: string;
  workflow_id: string;
}

export interface WorkflowApproval {
  action: 'approve' | 'reject' | 'request_changes';
  approved_at?: string;
  approver_id: string;
  approver_role: string;
  comments?: string;
  created_at?: string;
  document_workflow_id: string;
  id?: string;
  stage_number: number;
}

export interface WorkflowNotification {
  created_at?: string;
  document_workflow_id: string;
  id?: string;
  is_read: boolean;
  message: string;
  notification_type: 'approval_request' | 'approval_completed' | 'workflow_completed' | 'workflow_rejected' | 'reminder';
  recipient_id: string;
  sent_at: string;
  title: string;
}

export interface WorkflowTemplate {
  category: string;
  created_at?: string;
  created_by: string;
  description: string;
  id?: string;
  is_default: boolean;
  name: string;
  stages: Omit<WorkflowStage, 'id' | 'workflow_id' | 'created_at'>[];
}

class WorkflowService {
  // Create a new workflow
  async createWorkflow(
    workflowData: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Workflow> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workflows')
        .insert([{ ...workflowData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  // Get all workflows
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  // Get workflow by ID
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  // Create workflow stages
  async createWorkflowStages(
    workflowId: string,
    stages: Omit<WorkflowStage, 'id' | 'workflow_id' | 'created_at'>[]
  ): Promise<WorkflowStage[]> {
    try {
      const stagesWithWorkflowId = stages.map(stage => ({
        ...stage,
        workflow_id: workflowId,
      }));

      const { data, error } = await supabase
        .from('workflow_stages')
        .insert(stagesWithWorkflowId)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating workflow stages:', error);
      throw error;
    }
  }

  // Get workflow stages
  async getWorkflowStages(workflowId: string): Promise<WorkflowStage[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_stages')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('stage_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow stages:', error);
      return [];
    }
  }

  // Initiate document workflow
  async initiateDocumentWorkflow(
    documentId: string,
    workflowId: string
  ): Promise<DocumentWorkflow> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if document already has an active workflow
      const existingWorkflow = await this.getDocumentWorkflow(documentId);
      if (
        existingWorkflow &&
        ['pending', 'in_progress'].includes(existingWorkflow.status)
      ) {
        throw new Error('Document already has an active workflow');
      }

      const { data, error } = await supabase
        .from('document_workflows')
        .insert([
          {
            document_id: documentId,
            workflow_id: workflowId,
            current_stage: 1,
            status: 'pending',
            initiated_by: user.id,
            initiated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send notifications to first stage approvers
      await this.sendStageNotifications(data.id, 1);

      return data;
    } catch (error) {
      console.error('Error initiating document workflow:', error);
      throw error;
    }
  }

  // Get document workflow
  async getDocumentWorkflow(
    documentId: string
  ): Promise<DocumentWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('document_workflows')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching document workflow:', error);
      return null;
    }
  }

  // Get document workflow with details
  async getDocumentWorkflowDetails(documentWorkflowId: string): Promise<{
    approvals: WorkflowApproval[];
    notifications: WorkflowNotification[];
    stages: WorkflowStage[];
    workflow: DocumentWorkflow;
  } | null> {
    try {
      const { data: workflow, error: workflowError } = await supabase
        .from('document_workflows')
        .select('*')
        .eq('id', documentWorkflowId)
        .single();

      if (workflowError) throw workflowError;

      const stages = await this.getWorkflowStages(workflow.workflow_id);
      const approvals = await this.getWorkflowApprovals(documentWorkflowId);
      const notifications =
        await this.getWorkflowNotifications(documentWorkflowId);

      return {
        workflow,
        stages,
        approvals,
        notifications,
      };
    } catch (error) {
      console.error('Error fetching document workflow details:', error);
      return null;
    }
  }

  // Submit approval
  async submitApproval(
    documentWorkflowId: string,
    stageNumber: number,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string
  ): Promise<WorkflowApproval> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user role
      const userRole = await this.getUserRole(user.id);

      // Check if user can approve this stage
      const canApprove = await this.canUserApproveStage(
        documentWorkflowId,
        stageNumber,
        user.id,
        userRole
      );
      if (!canApprove) {
        throw new Error('You do not have permission to approve this stage');
      }

      const { data, error } = await supabase
        .from('workflow_approvals')
        .insert([
          {
            document_workflow_id: documentWorkflowId,
            stage_number: stageNumber,
            approver_id: user.id,
            approver_role: userRole,
            action,
            comments,
            approved_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update workflow status based on action
      await this.updateWorkflowStatus(documentWorkflowId, stageNumber, action);

      return data;
    } catch (error) {
      console.error('Error submitting approval:', error);
      throw error;
    }
  }

  // Get workflow approvals
  async getWorkflowApprovals(
    documentWorkflowId: string
  ): Promise<WorkflowApproval[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_approvals')
        .select('*')
        .eq('document_workflow_id', documentWorkflowId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow approvals:', error);
      return [];
    }
  }

  // Get user's pending approvals
  async getUserPendingApprovals(userId: string): Promise<
    {
      document: any;
      document_workflow: DocumentWorkflow;
      stage: WorkflowStage;
      workflow: Workflow;
    }[]
  > {
    try {
      const { data, error } = await supabase
        .from('document_workflows')
        .select(
          `
          *,
          workflows (*),
          workflow_stages!inner (*)
        `
        )
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for stages where user can approve
      const userRole = await this.getUserRole(userId);
      const pendingApprovals = [];

      for (const item of data || []) {
        const stage = item.workflow_stages.find(
          (s: any) => s.stage_number === item.current_stage
        );
        if (stage && stage.required_roles.includes(userRole)) {
          // Check if user hasn't already approved this stage
          const existingApproval = await this.getUserApprovalForStage(
            item.id,
            item.current_stage,
            userId
          );
          if (!existingApproval) {
            // Get document details
            const document = await this.getDocumentDetails(item.document_id);
            pendingApprovals.push({
              document_workflow: item,
              workflow: item.workflows,
              stage,
              document,
            });
          }
        }
      }

      return pendingApprovals;
    } catch (error) {
      console.error('Error fetching user pending approvals:', error);
      return [];
    }
  }

  // Send stage notifications
  async sendStageNotifications(
    documentWorkflowId: string,
    stageNumber: number
  ): Promise<void> {
    try {
      const workflowDetails =
        await this.getDocumentWorkflowDetails(documentWorkflowId);
      if (!workflowDetails) return;

      const stage = workflowDetails.stages.find(
        s => s.stage_number === stageNumber
      );
      if (!stage) return;

      // Get users with required roles
      const usersWithRole = await this.getUsersWithRoles(stage.required_roles);

      // Create notifications
      const notifications = usersWithRole.map(userId => ({
        document_workflow_id: documentWorkflowId,
        recipient_id: userId,
        notification_type: 'approval_request',
        title: 'Document Approval Required',
        message: `You have a document waiting for your approval at stage ${stageNumber}: ${stage.name}`,
        is_read: false,
        sent_at: new Date().toISOString(),
      }));

      if (notifications.length > 0) {
        await supabase.from('workflow_notifications').insert(notifications);
      }
    } catch (error) {
      console.error('Error sending stage notifications:', error);
    }
  }

  // Get workflow notifications
  async getWorkflowNotifications(
    documentWorkflowId: string
  ): Promise<WorkflowNotification[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_notifications')
        .select('*')
        .eq('document_workflow_id', documentWorkflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get user's unread notifications
  async getUserUnreadNotifications(
    userId: string
  ): Promise<WorkflowNotification[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_notifications')
        .select('*')
        .eq('recipient_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user unread notifications:', error);
      return [];
    }
  }

  // Create workflow template
  async createWorkflowTemplate(
    templateData: Omit<WorkflowTemplate, 'id' | 'created_at'>
  ): Promise<WorkflowTemplate> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workflow_templates')
        .insert([{ ...templateData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workflow template:', error);
      throw error;
    }
  }

  // Get workflow templates
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow templates:', error);
      return [];
    }
  }

  // Create workflow from template
  async createWorkflowFromTemplate(
    templateId: string,
    name: string,
    description: string
  ): Promise<Workflow> {
    try {
      const template = await this.getWorkflowTemplate(templateId);
      if (!template) throw new Error('Template not found');

      // Create workflow
      const workflow = await this.createWorkflow({
        name,
        description,
        category: template.category,
        is_active: true,
        created_by: template.created_by,
      });

      // Create stages from template
      await this.createWorkflowStages(workflow.id!, template.stages);

      return workflow;
    } catch (error) {
      console.error('Error creating workflow from template:', error);
      throw error;
    }
  }

  // Get workflow statistics
  async getWorkflowStats(userId?: string): Promise<{
    active_workflows: number;
    avg_completion_time: number;
    completed_this_month: number;
    pending_approvals: number;
    total_workflows: number;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userIdToUse = userId || user.id;

      // Get total workflows
      const { count: totalWorkflows } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true });

      // Get active workflows
      const { count: activeWorkflows } = await supabase
        .from('document_workflows')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      // Get pending approvals for user
      const pendingApprovals = await this.getUserPendingApprovals(userIdToUse);

      // Get completed workflows this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: completedThisMonth } = await supabase
        .from('document_workflows')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('completed_at', startOfMonth.toISOString());

      // Calculate average completion time
      const { data: completedWorkflows } = await supabase
        .from('document_workflows')
        .select('initiated_at, completed_at')
        .eq('status', 'approved')
        .not('completed_at', 'is', null);

      let totalTime = 0;
      let count = 0;
      completedWorkflows?.forEach(workflow => {
        if (workflow.completed_at) {
          const initiated = new Date(workflow.initiated_at);
          const completed = new Date(workflow.completed_at);
          totalTime += completed.getTime() - initiated.getTime();
          count++;
        }
      });

      const avgCompletionTime =
        count > 0 ? totalTime / count / (1000 * 60 * 60) : 0; // in hours

      return {
        total_workflows: totalWorkflows || 0,
        active_workflows: activeWorkflows || 0,
        pending_approvals: pendingApprovals.length,
        completed_this_month: completedThisMonth || 0,
        avg_completion_time: avgCompletionTime,
      };
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
      return {
        total_workflows: 0,
        active_workflows: 0,
        pending_approvals: 0,
        completed_this_month: 0,
        avg_completion_time: 0,
      };
    }
  }

  // Private helper methods
  private async getUserRole(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user'; // Default role
    }
  }

  private async canUserApproveStage(
    documentWorkflowId: string,
    stageNumber: number,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    try {
      const workflowDetails =
        await this.getDocumentWorkflowDetails(documentWorkflowId);
      if (!workflowDetails) return false;

      const stage = workflowDetails.stages.find(
        s => s.stage_number === stageNumber
      );
      if (!stage) return false;

      return stage.required_roles.includes(userRole);
    } catch (error) {
      console.error('Error checking user approval permission:', error);
      return false;
    }
  }

  private async getUserApprovalForStage(
    documentWorkflowId: string,
    stageNumber: number,
    userId: string
  ): Promise<WorkflowApproval | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_approvals')
        .select('*')
        .eq('document_workflow_id', documentWorkflowId)
        .eq('stage_number', stageNumber)
        .eq('approver_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user approval for stage:', error);
      return null;
    }
  }

  private async getUsersWithRoles(roles: string[]): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', roles);

      if (error) throw error;
      return data?.map(item => item.user_id) || [];
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      return [];
    }
  }

  private async getDocumentDetails(documentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching document details:', error);
      return null;
    }
  }

  private async getWorkflowTemplate(
    templateId: string
  ): Promise<WorkflowTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workflow template:', error);
      return null;
    }
  }

  private async updateWorkflowStatus(
    documentWorkflowId: string,
    stageNumber: number,
    action: string
  ): Promise<void> {
    try {
      const workflowDetails =
        await this.getDocumentWorkflowDetails(documentWorkflowId);
      if (!workflowDetails) return;

      const stages = workflowDetails.stages;
      const currentStage = stages.find(s => s.stage_number === stageNumber);
      if (!currentStage) return;

      let newStatus = workflowDetails.workflow.status;
      let nextStage = stageNumber;

      if (action === 'reject') {
        newStatus = 'rejected';
      } else if (action === 'approve') {
        // Check if all required approvers have approved this stage
        const stageApprovals = workflowDetails.approvals.filter(
          a => a.stage_number === stageNumber
        );
        const approvedCount = stageApprovals.filter(
          a => a.action === 'approve'
        ).length;

        if (approvedCount >= currentStage.required_approvers) {
          // Move to next stage or complete
          const nextStageObj = stages.find(
            s => s.stage_number === stageNumber + 1
          );
          if (nextStageObj) {
            nextStage = stageNumber + 1;
            newStatus = 'in_progress';
            // Send notifications for next stage
            await this.sendStageNotifications(documentWorkflowId, nextStage);
          } else {
            newStatus = 'approved';
          }
        }
      }

      // Update workflow status
      const updateData: any = {
        current_stage: nextStage,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'approved' || newStatus === 'rejected') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('document_workflows')
        .update(updateData)
        .eq('id', documentWorkflowId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating workflow status:', error);
      throw error;
    }
  }
}

// Create singleton instance
let workflowServiceInstance: WorkflowService | null = null;

const getWorkflowServiceInstance = () => {
  if (!workflowServiceInstance) {
    workflowServiceInstance = new WorkflowService();
  }
  return workflowServiceInstance;
};

// Export functions that use the singleton
export const workflowService = {
  createWorkflow: (
    workflowData: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>
  ) => getWorkflowServiceInstance().createWorkflow(workflowData),
  getWorkflows: () => getWorkflowServiceInstance().getWorkflows(),
  getWorkflow: (workflowId: string) =>
    getWorkflowServiceInstance().getWorkflow(workflowId),
  createWorkflowStages: (
    workflowId: string,
    stages: Omit<WorkflowStage, 'id' | 'workflow_id' | 'created_at'>[]
  ) => getWorkflowServiceInstance().createWorkflowStages(workflowId, stages),
  getWorkflowStages: (workflowId: string) =>
    getWorkflowServiceInstance().getWorkflowStages(workflowId),
  initiateDocumentWorkflow: (documentId: string, workflowId: string) =>
    getWorkflowServiceInstance().initiateDocumentWorkflow(
      documentId,
      workflowId
    ),
  getDocumentWorkflow: (documentId: string) =>
    getWorkflowServiceInstance().getDocumentWorkflow(documentId),
  getDocumentWorkflowDetails: (documentWorkflowId: string) =>
    getWorkflowServiceInstance().getDocumentWorkflowDetails(documentWorkflowId),
  submitApproval: (
    documentWorkflowId: string,
    stageNumber: number,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string
  ) =>
    getWorkflowServiceInstance().submitApproval(
      documentWorkflowId,
      stageNumber,
      action,
      comments
    ),
  getWorkflowApprovals: (documentWorkflowId: string) =>
    getWorkflowServiceInstance().getWorkflowApprovals(documentWorkflowId),
  getUserPendingApprovals: (userId: string) =>
    getWorkflowServiceInstance().getUserPendingApprovals(userId),
  sendStageNotifications: (documentWorkflowId: string, stageNumber: number) =>
    getWorkflowServiceInstance().sendStageNotifications(
      documentWorkflowId,
      stageNumber
    ),
  getWorkflowNotifications: (documentWorkflowId: string) =>
    getWorkflowServiceInstance().getWorkflowNotifications(documentWorkflowId),
  markNotificationAsRead: (notificationId: string) =>
    getWorkflowServiceInstance().markNotificationAsRead(notificationId),
  getUserUnreadNotifications: (userId: string) =>
    getWorkflowServiceInstance().getUserUnreadNotifications(userId),
  createWorkflowTemplate: (
    templateData: Omit<WorkflowTemplate, 'id' | 'created_at'>
  ) => getWorkflowServiceInstance().createWorkflowTemplate(templateData),
  getWorkflowTemplates: () =>
    getWorkflowServiceInstance().getWorkflowTemplates(),
  createWorkflowFromTemplate: (
    templateId: string,
    name: string,
    description: string
  ) =>
    getWorkflowServiceInstance().createWorkflowFromTemplate(
      templateId,
      name,
      description
    ),
  getWorkflowStats: (userId?: string) =>
    getWorkflowServiceInstance().getWorkflowStats(userId),
};
