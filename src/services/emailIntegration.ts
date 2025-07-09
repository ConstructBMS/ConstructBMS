export interface EmailIntegration {
  emailId: string;
  customerId?: string;
  customerName?: string;
  opportunityId?: string;
  opportunityName?: string;
  projectId?: string;
  projectName?: string;
  integrationType: 'customer' | 'opportunity' | 'project' | 'general';
  confidence: number;
  linkedAt: Date;
  linkedBy: string;
}

export interface CustomerEmailActivity {
  customerId: string;
  customerName: string;
  emailCount: number;
  lastEmailDate: Date;
  unreadCount: number;
  urgentCount: number;
  emailIds: string[];
}

export interface ProjectEmailActivity {
  projectId: string;
  projectName: string;
  emailCount: number;
  lastEmailDate: Date;
  teamMembers: string[];
  emailIds: string[];
}

export interface OpportunityEmailActivity {
  opportunityId: string;
  opportunityName: string;
  customerName: string;
  emailCount: number;
  lastEmailDate: Date;
  emailIds: string[];
}

class EmailIntegrationService {
  private integrations: EmailIntegration[] = [];
  private subscribers: ((data: any) => void)[] = [];

  // Link email to customer
  linkEmailToCustomer(
    emailId: string,
    customerId: string,
    customerName: string,
    confidence: number = 1.0
  ): EmailIntegration {
    const integration: EmailIntegration = {
      emailId,
      customerId,
      customerName,
      integrationType: 'customer',
      confidence,
      linkedAt: new Date(),
      linkedBy: 'system',
    };

    this.integrations.push(integration);
    this.notifySubscribers({
      type: 'email_customer_linked',
      data: integration,
    });
    return integration;
  }

  // Link email to opportunity
  linkEmailToOpportunity(
    emailId: string,
    opportunityId: string,
    opportunityName: string,
    customerId?: string,
    confidence: number = 1.0
  ): EmailIntegration {
    const integration: EmailIntegration = {
      emailId,
      opportunityId,
      opportunityName,
      customerId,
      integrationType: 'opportunity',
      confidence,
      linkedAt: new Date(),
      linkedBy: 'system',
    };

    this.integrations.push(integration);
    this.notifySubscribers({
      type: 'email_opportunity_linked',
      data: integration,
    });
    return integration;
  }

  // Link email to project
  linkEmailToProject(
    emailId: string,
    projectId: string,
    projectName: string,
    confidence: number = 1.0
  ): EmailIntegration {
    const integration: EmailIntegration = {
      emailId,
      projectId,
      projectName,
      integrationType: 'project',
      confidence,
      linkedAt: new Date(),
      linkedBy: 'system',
    };

    this.integrations.push(integration);
    this.notifySubscribers({ type: 'email_project_linked', data: integration });
    return integration;
  }

  // Auto-detect and link email based on content
  autoLinkEmail(
    emailId: string,
    emailContent: string,
    emailSubject: string,
    senderEmail: string
  ): EmailIntegration[] {
    const links: EmailIntegration[] = [];
    const content = (emailContent + ' ' + emailSubject).toLowerCase();

    // Extract customer information
    const customerMatch = this.extractCustomerInfo(content, senderEmail);
    if (customerMatch) {
      links.push(
        this.linkEmailToCustomer(
          emailId,
          customerMatch.id,
          customerMatch.name,
          customerMatch.confidence
        )
      );
    }

    // Extract project information
    const projectMatch = this.extractProjectInfo(content);
    if (projectMatch) {
      links.push(
        this.linkEmailToProject(
          emailId,
          projectMatch.id,
          projectMatch.name,
          projectMatch.confidence
        )
      );
    }

    // Extract opportunity information
    const opportunityMatch = this.extractOpportunityInfo(content);
    if (opportunityMatch) {
      links.push(
        this.linkEmailToOpportunity(
          emailId,
          opportunityMatch.id,
          opportunityMatch.name,
          customerMatch?.id,
          opportunityMatch.confidence
        )
      );
    }

    return links;
  }

  // Extract customer information from email content
  private extractCustomerInfo(
    content: string,
    senderEmail: string
  ): { id: string; name: string; confidence: number } | null {
    // Check if sender email matches known customer patterns
    const knownCustomers = [
      {
        id: 'cust_1',
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
      },
      {
        id: 'cust_2',
        name: 'BuildPro Construction',
        email: 'info@buildpro.com',
      },
      { id: 'cust_3', name: 'ClientCorp Ltd', email: 'hello@clientcorp.com' },
      { id: 'cust_4', name: 'InnovateTech', email: 'support@innovatetech.com' },
    ];

    const customer = knownCustomers.find(c =>
      senderEmail.includes(c.email.split('@')[1])
    );
    if (customer) {
      return { id: customer.id, name: customer.name, confidence: 0.9 };
    }

    // Extract customer name from content
    const customerNameMatch = content.match(
      /(?:customer|client)[:\s]+([a-zA-Z0-9\s]+)/i
    );
    if (customerNameMatch) {
      const customerName = customerNameMatch[1].trim();
      const matchingCustomer = knownCustomers.find(c =>
        customerName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
      );
      if (matchingCustomer) {
        return {
          id: matchingCustomer.id,
          name: matchingCustomer.name,
          confidence: 0.7,
        };
      }
    }

    return null;
  }

  // Extract project information from email content
  private extractProjectInfo(
    content: string
  ): { id: string; name: string; confidence: number } | null {
    const projectMatch = content.match(/project[:\s]+([a-zA-Z0-9\s]+)/i);
    if (projectMatch) {
      const projectName = projectMatch[1].trim();

      // Map to known projects
      const knownProjects = [
        { id: 'proj_alpha', name: 'Project Alpha' },
        { id: 'proj_beta', name: 'Project Beta' },
        { id: 'proj_gamma', name: 'Project Gamma' },
      ];

      const matchingProject = knownProjects.find(p =>
        projectName.toLowerCase().includes(p.name.toLowerCase().split(' ')[1])
      );

      if (matchingProject) {
        return {
          id: matchingProject.id,
          name: matchingProject.name,
          confidence: 0.8,
        };
      }
    }

    return null;
  }

  // Extract opportunity information from email content
  private extractOpportunityInfo(
    content: string
  ): { id: string; name: string; confidence: number } | null {
    const opportunityMatch = content.match(
      /(?:opportunity|deal|proposal)[:\s]+([a-zA-Z0-9\s]+)/i
    );
    if (opportunityMatch) {
      const opportunityName = opportunityMatch[1].trim();

      // Map to known opportunities
      const knownOpportunities = [
        { id: 'opp_1', name: 'Website Redesign' },
        { id: 'opp_2', name: 'Mobile App Development' },
        { id: 'opp_3', name: 'Cloud Migration' },
      ];

      const matchingOpportunity = knownOpportunities.find(o =>
        opportunityName
          .toLowerCase()
          .includes(o.name.toLowerCase().split(' ')[0])
      );

      if (matchingOpportunity) {
        return {
          id: matchingOpportunity.id,
          name: matchingOpportunity.name,
          confidence: 0.7,
        };
      }
    }

    return null;
  }

  // Get customer email activity
  getCustomerEmailActivity(customerId: string): CustomerEmailActivity | null {
    const customerIntegrations = this.integrations.filter(
      i => i.customerId === customerId
    );
    if (customerIntegrations.length === 0) return null;

    const emailIds = customerIntegrations.map(i => i.emailId);
    const lastEmailDate = new Date(
      Math.max(...customerIntegrations.map(i => i.linkedAt.getTime()))
    );

    return {
      customerId,
      customerName: customerIntegrations[0].customerName || '',
      emailCount: emailIds.length,
      lastEmailDate,
      unreadCount: 0, // Would need to check email status
      urgentCount: 0, // Would need to check email priority
      emailIds,
    };
  }

  // Get project email activity
  getProjectEmailActivity(projectId: string): ProjectEmailActivity | null {
    const projectIntegrations = this.integrations.filter(
      i => i.projectId === projectId
    );
    if (projectIntegrations.length === 0) return null;

    const emailIds = projectIntegrations.map(i => i.emailId);
    const lastEmailDate = new Date(
      Math.max(...projectIntegrations.map(i => i.linkedAt.getTime()))
    );

    return {
      projectId,
      projectName: projectIntegrations[0].projectName || '',
      emailCount: emailIds.length,
      lastEmailDate,
      teamMembers: [], // Would need to get from project service
      emailIds,
    };
  }

  // Get opportunity email activity
  getOpportunityEmailActivity(
    opportunityId: string
  ): OpportunityEmailActivity | null {
    const opportunityIntegrations = this.integrations.filter(
      i => i.opportunityId === opportunityId
    );
    if (opportunityIntegrations.length === 0) return null;

    const emailIds = opportunityIntegrations.map(i => i.emailId);
    const lastEmailDate = new Date(
      Math.max(...opportunityIntegrations.map(i => i.linkedAt.getTime()))
    );

    return {
      opportunityId,
      opportunityName: opportunityIntegrations[0].opportunityName || '',
      customerName: opportunityIntegrations[0].customerName || '',
      emailCount: emailIds.length,
      lastEmailDate,
      emailIds,
    };
  }

  // Get all integrations
  getIntegrations(): EmailIntegration[] {
    return [...this.integrations];
  }

  // Get integrations for email
  getEmailIntegrations(emailId: string): EmailIntegration[] {
    return this.integrations.filter(i => i.emailId === emailId);
  }

  // Remove integration
  removeIntegration(integrationId: string): boolean {
    const index = this.integrations.findIndex(i => i.emailId === integrationId);
    if (index !== -1) {
      this.integrations.splice(index, 1);
      this.notifySubscribers({
        type: 'integration_removed',
        data: { integrationId },
      });
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
    // Add some demo integrations
    this.linkEmailToCustomer('email_1', 'cust_1', 'TechCorp Solutions', 0.9);
    this.linkEmailToProject('email_1', 'proj_alpha', 'Project Alpha', 0.8);
    this.linkEmailToOpportunity(
      'email_1',
      'opp_1',
      'Website Redesign',
      'cust_1',
      0.7
    );

    this.linkEmailToCustomer('email_2', 'cust_2', 'BuildPro Construction', 0.9);
    this.linkEmailToProject('email_2', 'proj_beta', 'Project Beta', 0.8);

    this.linkEmailToCustomer('email_3', 'cust_3', 'ClientCorp Ltd', 0.9);
  }
}

export const emailIntegrationService = new EmailIntegrationService();
emailIntegrationService.initializeDemoData();
