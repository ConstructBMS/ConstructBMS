import { supabase } from './supabase';
import { loggingService } from './loggingService';
import { demoModeService } from './demoModeService';

// Comprehensive Demo Data Service
// Provides extensive test data for all ConstructBMS features

export interface DemoDataConfig {
  contractors: number;
  customers: number;
  documents: number;
  emails: number;
  financialRecords: number;
  includeAdvancedFeatures: boolean;
  projects: number;
  tasksPerProject: number;
  timeEntries: number;
  users: number;
}

export interface DemoProject {
  actualCost: number;
  address: string;
  budget: number;
  category: string;
  city: string;
  client: string;
  coordinates: { lat: number; lng: number };
  createdAt: Date;
  description: string;
  documents: DemoDocument[];
  endDate: Date;
  id: string;
  lat: number;
  lng: number;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
  milestones: DemoMilestone[];
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectManager: string;
  risks: DemoRisk[];
  startDate: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  tags: string[];
  tasks: DemoTask[];
  team: string[];
  updatedAt: Date;
}

export interface DemoTask {
  actualHours: number;
  assignedTo: string;
  attachments: string[];
  comments: DemoComment[];
  createdAt: Date;
  dependencies: string[];
  description: string;
  dueDate: Date;
  estimatedHours: number;
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectId: string;
  startDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  tags: string[];
  timeEntries: DemoTimeEntry[];
  updatedAt: Date;
}

export interface DemoUser {
  avatar: string;
  createdAt: Date;
  department: string;
  email: string;
  firstName: string;
  hourlyRate: number;
  id: string;
  isActive: boolean;
  lastLogin: Date;
  lastName: string;
  phone: string;
  position: string;
  role: 'super_admin' | 'admin' | 'project_manager' | 'team_member' | 'client' | 'contractor';
  skills: string[];
}

export interface DemoCustomer {
  address: {
    city: string;
    country: string;
    postcode: string;
    street: string;
};
  company: string;
  contactPerson: string;
  createdAt: Date;
  email: string;
  id: string;
  industry: string;
  name: string;
  notes: string;
  phone: string;
  projects: string[];
  status: 'active' | 'inactive' | 'prospect';
  totalSpent: number;
}

export interface DemoContractor {
  availability: {
    endDate: Date;
    hoursPerWeek: number;
    startDate: Date;
};
  company: string;
  createdAt: Date;
  documents: string[];
  email: string;
  hourlyRate: number;
  id: string;
  name: string;
  phone: string;
  projects: string[];
  rating: number;
  specializations: string[];
  status: 'available' | 'busy' | 'unavailable';
}

export interface DemoDocument {
  category: string;
  content?: string;
  createdAt: Date;
  downloadCount: number;
  fileSize: number;
  fileType: string;
  id: string;
  lastAccessed: Date;
  name: string;
  permissions: string[];
  projectId?: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags: string[];
  type: 'contract' | 'drawing' | 'specification' | 'report' | 'invoice' | 'proposal' | 'manual' | 'other';
  updatedAt: Date;
  uploadedBy: string;
  version: string;
}

export interface DemoEmail {
  attachments: string[];
  bcc: string[];
  body: string;
  category: 'project' | 'client' | 'internal' | 'marketing' | 'support';
  cc: string[];
  createdAt: Date;
  from: string;
  id: string;
  priority: 'low' | 'normal' | 'high';
  projectId?: string;
  sentAt: Date;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied';
  subject: string;
  tags: string[];
  taskId?: string;
  to: string[];
}

export interface DemoFinancialRecord {
  amount: number;
  attachments: string[];
  category: string;
  createdAt: Date;
  currency: string;
  date: Date;
  description: string;
  id: string;
  notes: string;
  projectId?: string;
  reference: string;
  status: 'pending' | 'completed' | 'cancelled';
  subcategory: string;
  taskId?: string;
  type: 'income' | 'expense' | 'payment' | 'refund';
}

export interface DemoTimeEntry {
  // hours
  approvedAt?: Date;
  approvedBy?: string;
  billable: boolean;
  createdAt: Date;
  date: Date;
  description: string;
  duration: number;
  endTime: Date; 
  hourlyRate: number;
  id: string;
  projectId: string;
  startTime: Date;
  status: 'pending' | 'approved' | 'rejected';
  taskId: string;
  totalAmount: number;
  userId: string;
}

export interface DemoRisk {
  contingencyPlan: string;
  cost: number;
  createdAt: Date;
  description: string;
  dueDate: Date;
  id: string;
  impact: 'low' | 'medium' | 'high';
  mitigationPlan: string;
  name: string;
  owner: string;
  probability: 'low' | 'medium' | 'high';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  updatedAt: Date;
}

export interface DemoMilestone {
  createdAt: Date;
  date: Date;
  deliverables: string[];
  dependencies: string[];
  description: string;
  id: string;
  name: string;
  progress: number;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
}

export interface DemoComment {
  author: string;
  content: string;
  createdAt: Date;
  id: string;
  updatedAt: Date;
}

class DemoDataService {
  private projects: Map<string, DemoProject> = new Map();
  private users: Map<string, DemoUser> = new Map();
  private customers: Map<string, DemoCustomer> = new Map();
  private contractors: Map<string, DemoContractor> = new Map();
  private documents: Map<string, DemoDocument> = new Map();
  private emails: Map<string, DemoEmail> = new Map();
  private financialRecords: Map<string, DemoFinancialRecord> = new Map();
  private timeEntries: Map<string, DemoTimeEntry> = new Map();

  // Generate comprehensive demo data
  async generateDemoData(config: DemoDataConfig = {
    projects: 10,
    tasksPerProject: 15,
    users: 25,
    customers: 15,
    contractors: 10,
    documents: 50,
    emails: 100,
    financialRecords: 200,
    timeEntries: 500,
    includeAdvancedFeatures: true
  }) {
    // Generate users first (needed for other entities)
    await this.generateUsers(config.users);
    
    // Generate customers and contractors
    await this.generateCustomers(config.customers);
    await this.generateContractors(config.contractors);
    
    // Generate projects and tasks
    await this.generateProjects(config.projects, config.tasksPerProject);
    
    // Generate supporting data
    await this.generateDocuments(config.documents);
    await this.generateEmails(config.emails);
    await this.generateFinancialRecords(config.financialRecords);
    await this.generateTimeEntries(config.timeEntries);
    
    // Generate advanced features data if enabled
    if (config.includeAdvancedFeatures) {
      await this.generateAdvancedFeaturesData();
    }

    return this.getDemoDataSummary();
  }

  // Generate demo users
  private async generateUsers(count: number) {
    const roles: DemoUser['role'][] = ['super_admin', 'admin', 'project_manager', 'team_member', 'client', 'contractor'];
    const departments = ['Management', 'Engineering', 'Construction', 'Design', 'Finance', 'HR', 'Sales', 'Support'];
    const positions = ['Manager', 'Engineer', 'Designer', 'Coordinator', 'Specialist', 'Assistant', 'Director', 'Consultant'];
    const skills = ['Project Management', 'AutoCAD', 'Revit', 'Construction', 'Design', 'Budgeting', 'Communication', 'Leadership'];

    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)] || 'team_member';
      const department = departments[Math.floor(Math.random() * departments.length)] || 'Management';
      const position = positions[Math.floor(Math.random() * positions.length)] || 'Coordinator';
      const userSkills = skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);

      const user: DemoUser = {
        id: crypto.randomUUID(),
        email: `user${i + 1}@constructbms.com`,
        firstName: this.getRandomFirstName(),
        lastName: this.getRandomLastName(),
        role,
        department,
        position,
        phone: this.generatePhoneNumber(),
        avatar: `https://ui-avatars.com/api/?name=${this.getRandomFirstName()}+${this.getRandomLastName()}&background=random`,
        skills: userSkills,
        hourlyRate: 25 + Math.random() * 75,
        isActive: Math.random() > 0.1,
        lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      };

      this.users.set(user.id, user);
    }
  }

  // Generate demo customers
  private async generateCustomers(count: number) {
    const industries = ['Construction', 'Real Estate', 'Manufacturing', 'Healthcare', 'Education', 'Retail', 'Technology', 'Finance'];
    const companies = ['Acme Corp', 'Global Industries', 'Tech Solutions', 'BuildCo', 'Urban Development', 'Green Construction', 'Modern Builders', 'Elite Projects'];

    for (let i = 0; i < count; i++) {
      const industry = industries[Math.floor(Math.random() * industries.length)] || 'Construction';
      const company = companies[Math.floor(Math.random() * companies.length)] || 'Acme Corp';

      const customer: DemoCustomer = {
        id: crypto.randomUUID(),
        name: `${this.getRandomFirstName()} ${this.getRandomLastName()}`,
        email: `contact${i + 1}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: this.generatePhoneNumber(),
        company,
        industry,
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} ${this.getRandomStreetName()}`,
          city: this.getRandomCity(),
          postcode: this.generatePostcode(),
          country: 'United Kingdom'
        },
        contactPerson: `${this.getRandomFirstName()} ${this.getRandomLastName()}`,
        projects: [],
        totalSpent: 50000 + Math.random() * 500000,
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        notes: `Customer since ${new Date().getFullYear() - Math.floor(Math.random() * 5)}. ${Math.random() > 0.5 ? 'Reliable client with good payment history.' : 'New client, requires follow-up.'}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      };

      this.customers.set(customer.id, customer);
    }
  }

  // Generate demo contractors
  private async generateContractors(count: number) {
    const specializations = ['Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Flooring', 'Painting', 'Landscaping', 'Security', 'Fire Protection', 'Structural'];
    const companies = ['Elite Contractors', 'Pro Build Services', 'Specialist Solutions', 'Quality Works', 'Expert Contractors', 'Premier Services'];

    for (let i = 0; i < count; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)] || 'Elite Contractors';
      const contractorSpecializations = specializations.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

      const contractor: DemoContractor = {
        id: `contractor_${i + 1}`,
        name: `${this.getRandomFirstName()} ${this.getRandomLastName()}`,
        email: `contractor${i + 1}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: this.generatePhoneNumber(),
        company,
        specializations: contractorSpecializations,
        hourlyRate: 35 + Math.random() * 65,
        availability: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          hoursPerWeek: 30 + Math.floor(Math.random() * 20)
        },
        projects: [],
        rating: 3.5 + Math.random() * 1.5,
        status: Math.random() > 0.3 ? 'available' : 'busy',
        documents: [],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      };

      this.contractors.set(contractor.id, contractor);
    }
  }

  // Generate demo projects
  private async generateProjects(count: number, tasksPerProject: number) {
    const projectTypes = ['Commercial Building', 'Residential Complex', 'Infrastructure', 'Renovation', 'New Construction', 'Maintenance', 'Design-Build', 'Consulting'];
    const cities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Sheffield', 'Edinburgh', 'Glasgow', 'Cardiff', 'Bristol'];
    const statuses: DemoProject['status'][] = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
    const priorities: DemoProject['priority'][] = ['low', 'medium', 'high', 'critical'];

    const userArray = Array.from(this.users.values());
    const customerArray = Array.from(this.customers.values());

    for (let i = 0; i < count; i++) {
      const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)] || 'Commercial Building';
      const city = cities[Math.floor(Math.random() * cities.length)] || 'London';
      const status = statuses[Math.floor(Math.random() * statuses.length)] || 'active';
      const priority = priorities[Math.floor(Math.random() * priorities.length)] || 'medium';
      const projectManager = userArray.find(u => u.role === 'project_manager')?.id || userArray[0]?.id || crypto.randomUUID();
      const client = customerArray[Math.floor(Math.random() * customerArray.length)]?.id || crypto.randomUUID();

      const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (90 + Math.random() * 365) * 24 * 60 * 60 * 1000);
      const budget = 50000 + Math.random() * 2000000;
      const progress = Math.round((Math.random() * 100) * 100) / 100;
      const actualCost = budget * (0.3 + Math.random() * 0.7);

      const project: DemoProject = {
        id: crypto.randomUUID(),
        name: `${projectType} - ${city} ${i + 1}`,
        description: `Comprehensive ${projectType.toLowerCase()} project in ${city}. This project involves multiple phases and requires coordination between various teams and contractors.`,
        status,
        priority,
        startDate,
        endDate,
        budget,
        actualCost,
        progress,
        client,
        projectManager,
        team: userArray.filter(u => u.role === 'team_member').slice(0, Math.floor(Math.random() * 5) + 3).map(u => u.id),
        location: {
          address: `${Math.floor(Math.random() * 9999) + 1} ${this.getRandomStreetName()}`,
          city,
          postcode: this.generatePostcode(),
          coordinates: {
            lat: 51.5074 + (Math.random() - 0.5) * 10,
            lng: -0.1278 + (Math.random() - 0.5) * 10
          }
        },
        category: projectType,
        tags: [projectType, city, 'construction', 'development'],
        risks: this.generateRisks(),
        milestones: this.generateMilestones(startDate, endDate),
        tasks: [],
        documents: [],
        createdAt: startDate,
        updatedAt: new Date()
      };

      // Generate tasks for this project
      project.tasks = this.generateTasks(project.id, tasksPerProject, userArray);

      this.projects.set(project.id, project);

      // Update customer and contractor project lists
      if (this.customers.has(client)) {
        const customer = this.customers.get(client)!;
        customer.projects.push(project.id);
      }
    }
  }

  // Generate demo tasks
  private generateTasks(projectId: string, count: number, users: DemoUser[]): DemoTask[] {
    const taskTypes = ['Site Preparation', 'Foundation Work', 'Structural Framework', 'Electrical Installation', 'Plumbing Installation', 'HVAC Installation', 'Roofing', 'Flooring', 'Painting', 'Landscaping', 'Final Inspection', 'Documentation', 'Permit Application', 'Material Procurement', 'Quality Control'];
    const statuses: DemoTask['status'][] = ['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled'];
    const priorities: DemoTask['priority'][] = ['low', 'medium', 'high', 'critical'];

    const tasks: DemoTask[] = [];
    const project = this.projects.get(projectId);
    if (!project) return tasks;

    for (let i = 0; i < count; i++) {
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const assignedUser = users[Math.floor(Math.random() * users.length)];

      const taskStartDate = new Date(project.startDate.getTime() + Math.random() * (project.endDate.getTime() - project.startDate.getTime()));
      const taskEndDate = new Date(taskStartDate.getTime() + (7 + Math.random() * 30) * 24 * 60 * 60 * 1000);
      const estimatedHours = 8 + Math.random() * 40;
      const progress = status === 'completed' ? 100 : status === 'not-started' ? 0 : Math.round((Math.random() * 100) * 100) / 100;
      const actualHours = status === 'completed' ? estimatedHours * (0.8 + Math.random() * 0.4) : estimatedHours * progress / 100;

      const task: DemoTask = {
        id: crypto.randomUUID(),
        projectId,
        name: taskType,
        description: `Complete ${taskType.toLowerCase()} for project ${project.name}. This task requires attention to detail and adherence to safety protocols.`,
        status,
        priority,
        assignedTo: assignedUser.id,
        startDate: taskStartDate,
        dueDate: taskEndDate,
        estimatedHours,
        actualHours,
        progress,
        dependencies: [],
        tags: [taskType, 'construction'],
        attachments: [],
        comments: this.generateComments(),
        timeEntries: [],
        createdAt: taskStartDate,
        updatedAt: new Date()
      };

      tasks.push(task);
    }

    return tasks;
  }

  // Generate demo documents
  private async generateDocuments(count: number) {
    const documentTypes: DemoDocument['type'][] = ['contract', 'drawing', 'specification', 'report', 'invoice', 'proposal', 'manual', 'other'];
    const categories = ['Project Documents', 'Contracts', 'Drawings', 'Specifications', 'Reports', 'Invoices', 'Proposals', 'Manuals', 'Safety', 'Quality'];
    const fileTypes = ['pdf', 'docx', 'xlsx', 'dwg', 'rvt', 'jpg', 'png', 'txt'];

    const userArray = Array.from(this.users.values());
    const projectArray = Array.from(this.projects.values());

    for (let i = 0; i < count; i++) {
      const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const uploadedBy = userArray[Math.floor(Math.random() * userArray.length)];
      const project = projectArray[Math.floor(Math.random() * projectArray.length)];

      const document: DemoDocument = {
        id: `doc_${i + 1}`,
        name: `${docType.charAt(0).toUpperCase() + docType.slice(1)} - ${this.getRandomDocumentName()}`,
        type: docType,
        category,
        projectId: Math.random() > 0.3 ? project?.id : undefined,
        uploadedBy: uploadedBy.id,
        fileSize: 100000 + Math.random() * 10000000,
        fileType,
        version: '1.0',
        status: Math.random() > 0.2 ? 'approved' : 'review',
        tags: [docType, category],
        permissions: ['read', 'write'],
        downloadCount: Math.floor(Math.random() * 50),
        lastAccessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };

      this.documents.set(document.id, document);

      // Add document to project if applicable
      if (document.projectId && this.projects.has(document.projectId)) {
        const project = this.projects.get(document.projectId)!;
        project.documents.push(document.id);
      }
    }
  }

  // Generate demo emails
  private async generateEmails(count: number) {
    const subjects = [
      'Project Update - Phase 1 Complete',
      'Meeting Request - Site Visit',
      'Invoice #2024-001 - Payment Due',
      'Safety Inspection Report',
      'Material Delivery Confirmation',
      'Change Order Request',
      'Weekly Progress Report',
      'Contractor Performance Review',
      'Budget Update Required',
      'Quality Control Issues'
    ];

    const userArray = Array.from(this.users.values());
    const projectArray = Array.from(this.projects.values());

    for (let i = 0; i < count; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const from = userArray[Math.floor(Math.random() * userArray.length)];
      const to = userArray.filter(() => Math.random() > 0.7).map(u => u.email);
      const project = projectArray[Math.floor(Math.random() * projectArray.length)];

      const email: DemoEmail = {
        id: `email_${i + 1}`,
        subject,
        from: from.email,
        to,
        cc: [],
        bcc: [],
        body: this.generateEmailBody(subject, project),
        attachments: [],
        priority: Math.random() > 0.8 ? 'high' : 'normal',
        status: 'sent',
        category: 'project',
        tags: ['project', 'update'],
        projectId: project?.id,
        sentAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };

      this.emails.set(email.id, email);
    }
  }

  // Generate demo financial records
  private async generateFinancialRecords(count: number) {
    const types: DemoFinancialRecord['type'][] = ['income', 'expense', 'payment', 'refund'];
    const categories = ['Materials', 'Labor', 'Equipment', 'Subcontractors', 'Permits', 'Insurance', 'Utilities', 'Travel', 'Office', 'Marketing'];
    const subcategories = ['Concrete', 'Steel', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Flooring', 'Painting', 'Landscaping', 'Security'];

    const projectArray = Array.from(this.projects.values());

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
      const project = projectArray[Math.floor(Math.random() * projectArray.length)];

      const amount = type === 'income' ? 5000 + Math.random() * 50000 : 100 + Math.random() * 10000;

      const record: DemoFinancialRecord = {
        id: `financial_${i + 1}`,
        type,
        category,
        subcategory,
        amount,
        currency: 'GBP',
        projectId: project?.id,
        description: `${type} for ${subcategory} - ${category}`,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        status: 'completed',
        reference: `REF-${Math.floor(Math.random() * 999999)}`,
        attachments: [],
        notes: `Processed on ${new Date().toLocaleDateString()}`,
        createdAt: new Date()
      };

      this.financialRecords.set(record.id, record);
    }
  }

  // Generate demo time entries
  private async generateTimeEntries(count: number) {
    const userArray = Array.from(this.users.values());
    const projectArray = Array.from(this.projects.values());

    for (let i = 0; i < count; i++) {
      const user = userArray[Math.floor(Math.random() * userArray.length)];
      const project = projectArray[Math.floor(Math.random() * projectArray.length)];
      const task = project?.tasks[Math.floor(Math.random() * project.tasks.length)];

      if (!project || !task) continue;

      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const startTime = new Date(date.getTime() + 8 * 60 * 60 * 1000 + Math.random() * 8 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + (4 + Math.random() * 4) * 60 * 60 * 1000);
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const billable = Math.random() > 0.2;
      const hourlyRate = user.hourlyRate;
      const totalAmount = duration * hourlyRate;

      const timeEntry: DemoTimeEntry = {
        id: `time_${i + 1}`,
        userId: user.id,
        projectId: project.id,
        taskId: task.id,
        date,
        startTime,
        endTime,
        duration,
        description: `Work on ${task.name}`,
        billable,
        hourlyRate,
        totalAmount,
        status: 'approved',
        approvedBy: userArray.find(u => u.role === 'project_manager')?.id,
        approvedAt: new Date(endTime.getTime() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      };

      this.timeEntries.set(timeEntry.id, timeEntry);
      task.timeEntries.push(timeEntry.id);
    }
  }

  // Generate advanced features data
  private async generateAdvancedFeaturesData() {
    // This would generate data for BIM models, advanced analytics, AI recommendations, etc.
  }

  // Generate risks
  private generateRisks(): DemoRisk[] {
    const riskNames = ['Weather Delay', 'Material Shortage', 'Permit Issues', 'Safety Incident', 'Budget Overrun', 'Schedule Delay', 'Quality Issues', 'Contractor Performance'];
    const risks: DemoRisk[] = [];

    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      const risk: DemoRisk = {
        id: `risk_${i + 1}`,
        name: riskNames[Math.floor(Math.random() * riskNames.length)],
        description: `Potential risk that could impact project delivery`,
        probability: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        impact: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        severity: 'medium',
        status: 'identified',
        owner: Array.from(this.users.values()).find(u => u.role === 'project_manager')?.id || 'user_1',
        mitigationPlan: 'Implement contingency measures and monitor closely',
        contingencyPlan: 'Alternative approach ready if needed',
        cost: 5000 + Math.random() * 50000,
        dueDate: new Date(Date.now() + (30 + Math.random() * 90) * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      risks.push(risk);
    }

    return risks;
  }

  // Generate milestones
  private generateMilestones(startDate: Date, endDate: Date): DemoMilestone[] {
    const milestoneNames = ['Project Kickoff', 'Design Complete', 'Permits Approved', 'Foundation Complete', 'Structure Complete', 'MEP Installation', 'Interior Finish', 'Final Inspection', 'Project Handover'];
    const milestones: DemoMilestone[] = [];

    const projectDuration = endDate.getTime() - startDate.getTime();
    const milestoneCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < milestoneCount; i++) {
      const milestoneDate = new Date(startDate.getTime() + (projectDuration / milestoneCount) * i);
      const progress = (i / milestoneCount) * 100;

      const milestone: DemoMilestone = {
        id: `milestone_${i + 1}`,
        name: milestoneNames[i] || `Milestone ${i + 1}`,
        description: `Key project milestone`,
        date: milestoneDate,
        status: milestoneDate < new Date() ? 'completed' : 'upcoming',
        progress,
        deliverables: [`Deliverable ${i + 1}`],
        dependencies: [],
        createdAt: new Date()
      };
      milestones.push(milestone);
    }

    return milestones;
  }

  // Generate comments
  private generateComments(): DemoComment[] {
    const comments: DemoComment[] = [];
    const commentCount = Math.floor(Math.random() * 3);

    for (let i = 0; i < commentCount; i++) {
      const comment: DemoComment = {
        id: `comment_${i + 1}`,
        content: `Comment ${i + 1}: ${this.getRandomComment()}`,
        author: Array.from(this.users.values())[Math.floor(Math.random() * this.users.size)].id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      comments.push(comment);
    }

    return comments;
  }

  // Helper methods for generating random data
  private getRandomFirstName(): string {
    const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia', 'William', 'Ava', 'Richard', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Christopher', 'Amelia'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomLastName(): string {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomStreetName(): string {
    const streets = ['High Street', 'Main Street', 'Church Road', 'Station Road', 'London Road', 'Victoria Street', 'Queen Street', 'King Street', 'Park Road', 'School Lane'];
    return streets[Math.floor(Math.random() * streets.length)];
  }

  private getRandomCity(): string {
    const cities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Sheffield', 'Edinburgh', 'Glasgow', 'Cardiff', 'Bristol'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private generatePhoneNumber(): string {
    return `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`;
  }

  private generatePostcode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}`;
  }

  private getRandomDocumentName(): string {
    const names = ['Project Specification', 'Contract Agreement', 'Technical Drawing', 'Safety Manual', 'Quality Report', 'Budget Analysis', 'Schedule Update', 'Risk Assessment', 'Change Order', 'Completion Certificate'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateEmailBody(subject: string, project?: DemoProject): string {
    return `Dear Team,

This email is regarding ${subject.toLowerCase()}.

${project ? `Project: ${project.name}` : ''}

Please review the attached information and let me know if you have any questions.

Best regards,
Project Team`;
  }

  private getRandomComment(): string {
    const comments = [
      'Good progress on this task.',
      'Need to review the specifications.',
      'Material delivery confirmed for tomorrow.',
      'Safety inspection completed successfully.',
      'Budget is within acceptable limits.',
      'Schedule is on track.',
      'Quality standards met.',
      'Additional resources may be needed.'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  // Get demo data summary
  getDemoDataSummary() {
    return {
      projects: this.projects.size,
      users: this.users.size,
      customers: this.customers.size,
      contractors: this.contractors.size,
      documents: this.documents.size,
      emails: this.emails.size,
      financialRecords: this.financialRecords.size,
      timeEntries: this.timeEntries.size,
      totalTasks: Array.from(this.projects.values()).reduce((sum, p) => sum + p.tasks.length, 0)
    };
  }

  // Get all demo data
  getAllDemoData() {
    return {
      projects: Array.from(this.projects.values()),
      users: Array.from(this.users.values()),
      customers: Array.from(this.customers.values()),
      contractors: Array.from(this.contractors.values()),
      documents: Array.from(this.documents.values()),
      emails: Array.from(this.emails.values()),
      financialRecords: Array.from(this.financialRecords.values()),
      timeEntries: Array.from(this.timeEntries.values())
    };
  }

  // Clear all demo data
  clearDemoData() {
    this.projects.clear();
    this.users.clear();
    this.customers.clear();
    this.contractors.clear();
    this.documents.clear();
    this.emails.clear();
    this.financialRecords.clear();
    this.timeEntries.clear();
  }
}

// Create singleton instance
let demoDataInstance: DemoDataService | null = null;

function getDemoDataInstance(): DemoDataService {
  if (!demoDataInstance) {
    demoDataInstance = new DemoDataService();
  }
  return demoDataInstance;
}

// Export functions that use the singleton
export const demoDataService = {
  generateDemoData: (config?: DemoDataConfig) => getDemoDataInstance().generateDemoData(config),
  getDemoDataSummary: () => getDemoDataInstance().getDemoDataSummary(),
  getAllDemoData: () => getDemoDataInstance().getAllDemoData(),
  clearDemoData: () => getDemoDataInstance().clearDemoData(),
  
  // Add missing functions
  initializeDemoTables: async () => {
    // This function is called during app initialization
    // For now, just return success
    return true;
  },
  
  isDemoMode: async () => {
    // Check if we're in demo mode
    // For now, return true to enable demo mode
    return true;
  },
  
  ensureDemoDataExists: async () => {
    const instance = getDemoDataInstance();
    const summary = instance.getDemoDataSummary();
    
    // If no data exists, generate some
    if (summary.projects === 0) {
      await instance.generateDemoData({
        projects: 5,
        tasksPerProject: 8,
        users: 10,
        customers: 5,
        contractors: 3,
        documents: 20,
        emails: 30,
        financialRecords: 50,
        timeEntries: 100,
        includeAdvancedFeatures: true
      });
    }
  },
  
  getDemoProjects: async () => {
    const instance = getDemoDataInstance();
    const allData = instance.getAllDemoData();
    return allData.projects.map(project => ({
      id: project.id,
      name: project.name,
      client: project.client,
      clientId: project.client,
      manager: project.projectManager,
      status: project.status === 'active' ? 'In Progress' : 
              project.status === 'completed' ? 'Completed' : 
              project.status === 'planning' ? 'Planning' : 
              project.status === 'on-hold' ? 'On Hold' : 'Cancelled',
      progress: project.progress,
      budget: project.budget,
      spent: project.actualCost,
      startDate: project.startDate.toISOString().split('T')[0],
      endDate: project.endDate.toISOString().split('T')[0],
      team: project.team.length,
      tasks: project.tasks.length,
      completedTasks: project.tasks.filter(t => t.status === 'completed').length,
      description: project.description,
      priority: project.priority.charAt(0).toUpperCase() + project.priority.slice(1),
      isDemoData: true,
      createdAt: project.createdAt.toISOString(),
      demoId: project.id
    }));
  },
  
  getDemoCustomers: async () => {
    const instance = getDemoDataInstance();
    const allData = instance.getAllDemoData();
    return allData.customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      industry: customer.industry,
      address: `${customer.address.street}, ${customer.address.city} ${customer.address.postcode}`,
      contactPerson: customer.contactPerson,
      totalSpent: customer.totalSpent,
      status: customer.status === 'active' ? 'Active' : 'Inactive',
      notes: customer.notes,
      createdAt: customer.createdAt.toISOString(),
      isDemoData: true,
      demoId: customer.id
    }));
  },
  
  saveProjects: async (projects: any[]) => {
    // This would typically save to a database
    // For demo purposes, we'll just log the save operation
    return true;
  },
  
  getEmailStats: async () => {
    const instance = getDemoDataInstance();
    const allEmails = Array.from(instance.getAllDemoData().emails.values());
    
    // Calculate email statistics
    const inbox = allEmails.length;
    const unread = allEmails.filter(email => email.status === 'delivered').length;
    const sentToday = allEmails.filter(email => {
      const today = new Date();
      const emailDate = new Date(email.sentAt);
      return email.status === 'sent' && 
             emailDate.getDate() === today.getDate() &&
             emailDate.getMonth() === today.getMonth() &&
             emailDate.getFullYear() === today.getFullYear();
    }).length;
    const drafts = allEmails.filter(email => email.status === 'draft').length;
    
    return {
      inbox,
      unread,
      sentToday,
      drafts
    };
  },

  getProjectResources: async (projectId: string) => {
    // Return mock resources for the project
    const resources = [
      {
        id: 'res-1',
        name: 'Project Manager',
        type: 'work' as const,
        maxUnits: 100,
        costPerUnit: 75,
        availability: 80,
        currentUtilization: 65
      },
      {
        id: 'res-2',
        name: 'Senior Developer',
        type: 'work' as const,
        maxUnits: 100,
        costPerUnit: 60,
        availability: 90,
        currentUtilization: 85
      },
      {
        id: 'res-3',
        name: 'Designer',
        type: 'work' as const,
        maxUnits: 100,
        costPerUnit: 50,
        availability: 70,
        currentUtilization: 60
      },
      {
        id: 'res-4',
        name: 'QA Engineer',
        type: 'work' as const,
        maxUnits: 100,
        costPerUnit: 45,
        availability: 85,
        currentUtilization: 70
      }
    ];
    
    return resources;
  },

  getGanttTasks: async () => {
    const instance = getDemoDataInstance();
    const allData = instance.getAllDemoData();
    
    // Convert all tasks from all projects to Gantt format
    const allTasks: any[] = [];
    
    allData.projects.forEach(project => {
      project.tasks.forEach(task => {
        allTasks.push({
          id: task.id,
          name: task.name,
          projectId: project.id,
          start: task.startDate,
          end: task.dueDate,
          duration: Math.ceil((task.dueDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)),
          progress: task.progress,
          status: task.status,
          priority: task.priority,
          assignee: task.assignedTo,
          description: task.description,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          dependencies: task.dependencies,
          tags: task.tags,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        });
      });
    });
    
    return allTasks;
  },

  getDemoCalendarEvents: async () => {
    const instance = getDemoDataInstance();
    const allData = instance.getAllDemoData();
    
    // Convert tasks and milestones to calendar events
    const events: any[] = [];
    
    allData.projects.forEach(project => {
      // Add project milestones as events
      project.milestones.forEach(milestone => {
        events.push({
          id: `milestone-${milestone.id}`,
          title: `Milestone: ${milestone.name}`,
          start: milestone.date,
          end: milestone.date,
          allDay: true,
          type: 'milestone',
          projectId: project.id,
          projectName: project.name,
          color: '#3B82F6', // Blue for milestones
          description: milestone.description
        });
      });
      
      // Add project tasks as events
      project.tasks.forEach(task => {
        events.push({
          id: `task-${task.id}`,
          title: task.name,
          start: task.startDate,
          end: task.dueDate,
          allDay: false,
          type: 'task',
          projectId: project.id,
          projectName: project.name,
          assignee: task.assignedTo,
          status: task.status,
          priority: task.priority,
          color: task.status === 'completed' ? '#10B981' : 
                 task.status === 'in-progress' ? '#F59E0B' : 
                 task.priority === 'high' ? '#EF4444' : '#6B7280',
          description: task.description
        });
      });
    });
    
    return events;
  }
}; 
