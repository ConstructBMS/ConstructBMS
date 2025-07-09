export interface EmailComment {
  id: string;
  emailId: string;
  author: string;
  authorEmail: string;
  content: string;
  timestamp: Date;
  isInternal: boolean;
  mentions: string[];
}

export interface EmailAssignment {
  id: string;
  emailId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'deferred';
  notes?: string;
}

export interface SharedResponse {
  id: string;
  emailId: string;
  createdBy: string;
  content: string;
  approvedBy: string[];
  status: 'draft' | 'pending-approval' | 'approved' | 'sent';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  permissions: string[];
  isActive: boolean;
}

class CollaborativeEmailService {
  private comments: EmailComment[] = [];
  private assignments: EmailAssignment[] = [];
  private sharedResponses: SharedResponse[] = [];
  private teamMembers: TeamMember[] = [];
  private subscribers: ((data: any) => void)[] = [];

  // Add comment to email
  addComment(
    emailId: string,
    author: string,
    authorEmail: string,
    content: string,
    isInternal: boolean = false
  ): EmailComment {
    const comment: EmailComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emailId,
      author,
      authorEmail,
      content,
      timestamp: new Date(),
      isInternal,
      mentions: this.extractMentions(content),
    };

    this.comments.push(comment);
    this.notifySubscribers({ type: 'comment_added', data: comment });
    return comment;
  }

  // Assign email to team member
  assignEmail(
    emailId: string,
    assignedTo: string,
    assignedBy: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    dueDate?: Date,
    notes?: string
  ): EmailAssignment {
    const assignment: EmailAssignment = {
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emailId,
      assignedTo,
      assignedBy,
      assignedAt: new Date(),
      dueDate,
      priority,
      status: 'pending',
      notes,
    };

    this.assignments.push(assignment);
    this.notifySubscribers({ type: 'email_assigned', data: assignment });
    return assignment;
  }

  // Update assignment status
  updateAssignmentStatus(
    assignmentId: string,
    status: 'pending' | 'in-progress' | 'completed' | 'deferred'
  ): void {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      assignment.status = status;
      this.notifySubscribers({ type: 'assignment_updated', data: assignment });
    }
  }

  // Create shared response
  createSharedResponse(
    emailId: string,
    createdBy: string,
    content: string
  ): SharedResponse {
    const response: SharedResponse = {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emailId,
      createdBy,
      content,
      approvedBy: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    this.sharedResponses.push(response);
    this.notifySubscribers({ type: 'response_created', data: response });
    return response;
  }

  // Update shared response
  updateSharedResponse(
    responseId: string,
    content: string,
    updatedBy: string
  ): SharedResponse | null {
    const response = this.sharedResponses.find(r => r.id === responseId);
    if (response) {
      response.content = content;
      response.updatedAt = new Date();
      response.version++;
      this.notifySubscribers({ type: 'response_updated', data: response });
      return response;
    }
    return null;
  }

  // Approve shared response
  approveResponse(responseId: string, approvedBy: string): void {
    const response = this.sharedResponses.find(r => r.id === responseId);
    if (response && !response.approvedBy.includes(approvedBy)) {
      response.approvedBy.push(approvedBy);
      if (response.approvedBy.length >= 2) {
        // Require 2 approvals
        response.status = 'approved';
      } else {
        response.status = 'pending-approval';
      }
      this.notifySubscribers({ type: 'response_approved', data: response });
    }
  }

  // Send shared response
  sendResponse(responseId: string): void {
    const response = this.sharedResponses.find(r => r.id === responseId);
    if (response && response.status === 'approved') {
      response.status = 'sent';
      this.notifySubscribers({ type: 'response_sent', data: response });
    }
  }

  // Extract mentions from content
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  // Get comments for email
  getEmailComments(emailId: string): EmailComment[] {
    return this.comments
      .filter(comment => comment.emailId === emailId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get assignment for email
  getEmailAssignment(emailId: string): EmailAssignment | null {
    return (
      this.assignments.find(assignment => assignment.emailId === emailId) ||
      null
    );
  }

  // Get shared response for email
  getEmailSharedResponse(emailId: string): SharedResponse | null {
    return (
      this.sharedResponses.find(response => response.emailId === emailId) ||
      null
    );
  }

  // Get assignments for team member
  getMemberAssignments(memberEmail: string): EmailAssignment[] {
    return this.assignments
      .filter(assignment => assignment.assignedTo === memberEmail)
      .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());
  }

  // Get pending assignments
  getPendingAssignments(): EmailAssignment[] {
    return this.assignments
      .filter(assignment => assignment.status === 'pending')
      .sort((a, b) => {
        // Sort by priority first, then by assignment date
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder];
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return b.assignedAt.getTime() - a.assignedAt.getTime();
      });
  }

  // Add team member
  addTeamMember(
    name: string,
    email: string,
    role: 'admin' | 'manager' | 'member' | 'viewer' = 'member'
  ): TeamMember {
    const member: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      permissions: this.getPermissionsForRole(role),
      isActive: true,
    };

    this.teamMembers.push(member);
    this.notifySubscribers({ type: 'member_added', data: member });
    return member;
  }

  // Get permissions for role
  private getPermissionsForRole(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['read', 'write', 'assign', 'approve', 'delete', 'manage_team'];
      case 'manager':
        return ['read', 'write', 'assign', 'approve'];
      case 'member':
        return ['read', 'write', 'comment'];
      case 'viewer':
        return ['read', 'comment'];
      default:
        return ['read'];
    }
  }

  // Get all team members
  getTeamMembers(): TeamMember[] {
    return [...this.teamMembers];
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
    // Add demo team members
    this.addTeamMember('Mike Wilson', 'mike.wilson@archer.com', 'admin');
    this.addTeamMember('Sarah Johnson', 'sarah.johnson@archer.com', 'manager');
    this.addTeamMember('David Brown', 'david.brown@archer.com', 'member');
    this.addTeamMember('Emma Davis', 'emma.davis@archer.com', 'member');
    this.addTeamMember('James Wilson', 'james.wilson@archer.com', 'viewer');

    // Add demo comments
    this.addComment(
      'email_1',
      'Mike Wilson',
      'mike.wilson@archer.com',
      'This looks urgent - @sarah.johnson can you review this?',
      true
    );

    this.addComment(
      'email_1',
      'Sarah Johnson',
      'sarah.johnson@archer.com',
      "I'll handle this. Need to check with the client about the deadline extension.",
      true
    );

    // Add demo assignments
    this.assignEmail(
      'email_1',
      'sarah.johnson@archer.com',
      'mike.wilson@archer.com',
      'high',
      new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      'Client needs urgent response about deadline extension'
    );

    // Add demo shared response
    const response = this.createSharedResponse(
      'email_1',
      'sarah.johnson@archer.com',
      "Hi Sarah,\n\nThank you for your email regarding the Project Alpha deadline extension. I understand your concerns about the timeline.\n\nI've reviewed the current progress and we can accommodate a 1-week extension. However, this will require some adjustments to the final delivery schedule.\n\nPlease let me know if this works for you, and I'll update the project timeline accordingly.\n\nBest regards,\nSarah Johnson\nProject Manager"
    );

    this.approveResponse(response.id, 'mike.wilson@archer.com');
  }
}

export const collaborativeEmailService = new CollaborativeEmailService();
collaborativeEmailService.initializeDemoData();
