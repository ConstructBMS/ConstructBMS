export interface ProjectEmail {
  projectId: string;
  projectName: string;
  emailCount: number;
  unreadCount: number;
  urgentCount: number;
  lastEmailDate: Date;
  teamMembers: string[];
  status: 'active' | 'completed' | 'on-hold';
}

export interface EmailProjectLink {
  emailId: string;
  projectId: string;
  projectName: string;
  linkType: 'direct' | 'inferred' | 'manual';
  confidence: number;
  linkedAt: Date;
}

class ProjectIntegrationService {
  private projectEmailLinks: EmailProjectLink[] = [];
  private projectEmails: ProjectEmail[] = [];

  // Link email to project based on content analysis
  linkEmailToProject(
    emailId: string,
    emailContent: string,
    emailSubject: string
  ): EmailProjectLink | null {
    const content = (emailContent + ' ' + emailSubject).toLowerCase();

    // Extract project references from email content
    const projectMatches =
      content.match(/project[:\s]+([a-zA-Z0-9\s]+)/gi) || [];
    const projectNames = projectMatches.map(match =>
      match.replace(/project[:\s]+/i, '').trim()
    );

    if (projectNames.length > 0) {
      const projectName = projectNames[0];
      const confidence = this.calculateConfidence(content, projectName);

      const link: EmailProjectLink = {
        emailId,
        projectId: this.generateProjectId(projectName),
        projectName,
        linkType: 'inferred',
        confidence,
        linkedAt: new Date(),
      };

      this.projectEmailLinks.push(link);
      this.updateProjectEmailStats(link.projectId, link.projectName);
      return link;
    }

    return null;
  }

  // Manually link email to project
  manuallyLinkEmail(
    emailId: string,
    projectId: string,
    projectName: string
  ): EmailProjectLink {
    const link: EmailProjectLink = {
      emailId,
      projectId,
      projectName,
      linkType: 'manual',
      confidence: 1.0,
      linkedAt: new Date(),
    };

    this.projectEmailLinks.push(link);
    this.updateProjectEmailStats(projectId, projectName);
    return link;
  }

  // Calculate confidence score for project linking
  private calculateConfidence(content: string, projectName: string): number {
    let score = 0;

    // Project name mentions
    if (content.includes(projectName.toLowerCase())) score += 0.4;

    // Project-related keywords
    const projectKeywords = [
      'deadline',
      'milestone',
      'deliverable',
      'task',
      'phase',
      'scope',
    ];
    projectKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.1;
    });

    // Client references
    const clientKeywords = ['client', 'customer', 'stakeholder'];
    clientKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.1;
    });

    return Math.min(score, 1.0);
  }

  // Generate project ID from name
  private generateProjectId(projectName: string): string {
    return `proj_${projectName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  // Update project email statistics
  private updateProjectEmailStats(
    projectId: string,
    projectName: string
  ): void {
    const existingProject = this.projectEmails.find(
      p => p.projectId === projectId
    );

    if (existingProject) {
      existingProject.emailCount++;
      existingProject.lastEmailDate = new Date();
    } else {
      this.projectEmails.push({
        projectId,
        projectName,
        emailCount: 1,
        unreadCount: 0,
        urgentCount: 0,
        lastEmailDate: new Date(),
        teamMembers: [],
        status: 'active',
      });
    }
  }

  // Get emails for a specific project
  getProjectEmails(projectId: string): string[] {
    return this.projectEmailLinks
      .filter(link => link.projectId === projectId)
      .map(link => link.emailId);
  }

  // Get all project email statistics
  getProjectEmailStats(): ProjectEmail[] {
    return [...this.projectEmails];
  }

  // Get project email links
  getEmailProjectLinks(): EmailProjectLink[] {
    return [...this.projectEmailLinks];
  }

  // Remove email-project link
  removeEmailProjectLink(emailId: string): void {
    this.projectEmailLinks = this.projectEmailLinks.filter(
      link => link.emailId !== emailId
    );
  }

  // Get project suggestions for an email
  getProjectSuggestions(
    emailContent: string,
    emailSubject: string
  ): Array<{ projectId: string; projectName: string; confidence: number }> {
    const content = (emailContent + ' ' + emailSubject).toLowerCase();
    const suggestions: Array<{
      projectId: string;
      projectName: string;
      confidence: number;
    }> = [];

    // Check existing projects
    this.projectEmails.forEach(project => {
      const confidence = this.calculateConfidence(content, project.projectName);
      if (confidence > 0.3) {
        suggestions.push({
          projectId: project.projectId,
          projectName: project.projectName,
          confidence,
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Initialize with demo project data
  initializeDemoData(): void {
    const demoProjects: ProjectEmail[] = [
      {
        projectId: 'proj_alpha',
        projectName: 'Project Alpha',
        emailCount: 12,
        unreadCount: 3,
        urgentCount: 2,
        lastEmailDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        teamMembers: ['Mike Wilson', 'Sarah Johnson', 'David Brown'],
        status: 'active',
      },
      {
        projectId: 'proj_beta',
        projectName: 'Project Beta',
        emailCount: 8,
        unreadCount: 1,
        urgentCount: 0,
        lastEmailDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        teamMembers: ['Emma Davis', 'James Wilson'],
        status: 'active',
      },
      {
        projectId: 'proj_gamma',
        projectName: 'Project Gamma',
        emailCount: 15,
        unreadCount: 5,
        urgentCount: 3,
        lastEmailDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        teamMembers: ['Lisa Anderson', 'Tom Harris', 'Rachel Green'],
        status: 'on-hold',
      },
    ];

    this.projectEmails = demoProjects;
  }
}

export const projectIntegrationService = new ProjectIntegrationService();
projectIntegrationService.initializeDemoData();
