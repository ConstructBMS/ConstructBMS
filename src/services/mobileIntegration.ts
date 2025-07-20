// Mobile and Field Integration Service
// Offline capabilities, GPS tracking, photo documentation, and field management

export interface FieldTask {
    address?: string;
  assignedTo: string;
  equipment: EquipmentUsage[];
  id: string;
  lastSync?: Date;
    latitude: number;
  location: {
    longitude: number;
};
  materials: MaterialUsage[];
  notes: FieldNote[];
  offlineData?: any;
  photos: FieldPhoto[];
  qualityChecks: QualityCheck[];
  safetyChecks: SafetyCheck[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  taskId: string;
  taskName: string;
  timeEntries: TimeEntry[];
}

export interface FieldPhoto {
  description?: string;
  id: string;
    latitude: number;
  location?: {
    longitude: number;
};
  tags: string[];
  taskId: string;
  thumbnail?: string;
  timestamp: Date;
  uploaded: boolean;
  url: string;
}

export interface FieldNote {
  attachments?: string[];
  author: string;
  content: string;
  id: string;
    latitude: number;
  location?: {
    longitude: number;
};
  taskId: string;
  timestamp: Date;
  uploaded: boolean;
}

export interface TimeEntry {
  // minutes
  description?: string;
  duration?: number;
  endTime?: Date;
  id: string;
    latitude: number;
  location?: {
    longitude: number;
};
  startTime: Date; 
  taskId: string;
  uploaded: boolean;
  userId: string;
}

export interface SafetyCheck {
  checklistId: string;
  checklistName: string;
  completedAt: Date;
  completedBy: string;
  id: string;
  items: SafetyCheckItem[];
  status: 'passed' | 'failed' | 'pending';
  taskId: string;
  uploaded: boolean;
}

export interface SafetyCheckItem {
  answer: 'yes' | 'no' | 'na';
  id: string;
  notes?: string;
  photos?: string[];
  question: string;
}

export interface QualityCheck {
  checklistId: string;
  checklistName: string;
  completedAt: Date;
  completedBy: string;
  id: string;
  items: QualityCheckItem[];
  status: 'passed' | 'failed' | 'pending';
  taskId: string;
  uploaded: boolean;
}

export interface QualityCheckItem {
  id: string;
  measurements?: Record<string, number>;
  notes?: string;
  photos?: string[];
  requirement: string;
  result: 'pass' | 'fail' | 'na';
}

export interface MaterialUsage {
  cost: number;
  id: string;
    latitude: number;
  location?: {
    longitude: number;
};
  materialId: string;
  materialName: string;
  quantity: number;
  taskId: string;
  timestamp: Date;
  unit: string;
  uploaded: boolean;
}

export interface EquipmentUsage {
  cost: number;
  endTime?: Date;
  equipmentId: string;
  equipmentName: string;
  hours: number;
  id: string;
    latitude: number;
  location?: {
    longitude: number;
};
  operator: string;
  startTime: Date;
  taskId: string;
  uploaded: boolean;
}

export interface DailyReport {
    conditions: string;
  date: Date;
  equipmentUsed: EquipmentUsage[];
    humidity?: number;
  id: string;
  issues: string[];
  materialsUsed: MaterialUsage[];
  notes: FieldNote[];
  photos: FieldPhoto[];
  projectId: string;
  safetyIncidents: string[];
  submittedAt: Date;
  submittedBy: string;
    temperature: number;
  uploaded: boolean;
  weather: {
    windSpeed?: number;
};
  workCompleted: string[];
  workPlanned: string[];
}

class MobileIntegrationService {
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: Array<{
    action: string;
    data: any;
    id: string;
    timestamp: Date;
    type: string;
  }> = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeOfflineSupport();
  }

  // Initialize offline support
  private initializeOfflineSupport() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Start periodic sync when online
    this.startPeriodicSync();
  }

  // Start periodic synchronization
  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineData();
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes when online
  }

  // Process offline queue when coming back online
  private async processOfflineQueue() {
    console.log('Processing offline queue...');
    
    for (const item of this.offlineQueue) {
      try {
        await this.processOfflineItem(item);
        this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
      } catch (error) {
        console.error('Failed to process offline item:', item, error);
      }
    }
  }

  // Process individual offline item
  private async processOfflineItem(item: any) {
    switch (item.type) {
      case 'photo':
        await this.uploadPhoto(item.data);
        break;
      case 'note':
        await this.uploadNote(item.data);
        break;
      case 'timeEntry':
        await this.uploadTimeEntry(item.data);
        break;
      case 'safetyCheck':
        await this.uploadSafetyCheck(item.data);
        break;
      case 'qualityCheck':
        await this.uploadQualityCheck(item.data);
        break;
      case 'dailyReport':
        await this.uploadDailyReport(item.data);
        break;
      default:
        console.warn('Unknown offline item type:', item.type);
    }
  }

  // Capture photo with GPS location
  async capturePhoto(taskId: string, description?: string, tags: string[] = []): Promise<FieldPhoto> {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      // Create canvas and capture photo
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // Stop video stream
      stream.getTracks().forEach(track => track.stop());
      
      // Get GPS location
      const location = await this.getCurrentLocation();
      
      // Convert to blob
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      // Create photo object
      const photo: FieldPhoto = {
        id: this.generateId(),
        taskId,
        url: URL.createObjectURL(blob),
        timestamp: new Date(),
        location,
        description,
        tags,
        uploaded: this.isOnline
      };
      
      // Store locally if offline
      if (!this.isOnline) {
        this.addToOfflineQueue('photo', 'create', photo);
        this.storePhotoLocally(photo, blob);
      }
      
      return photo;
    } catch (error) {
      console.error('Failed to capture photo:', error);
      throw error;
    }
  }

  // Add field note with location
  async addFieldNote(taskId: string, content: string, author: string, attachments?: string[]): Promise<FieldNote> {
    const location = await this.getCurrentLocation();
    
    const note: FieldNote = {
      id: this.generateId(),
      taskId,
      content,
      author,
      timestamp: new Date(),
      location,
      attachments,
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('note', 'create', note);
    }
    
    return note;
  }

  // Start time tracking
  async startTimeTracking(taskId: string, userId: string, description?: string): Promise<TimeEntry> {
    const location = await this.getCurrentLocation();
    
    const timeEntry: TimeEntry = {
      id: this.generateId(),
      taskId,
      userId,
      startTime: new Date(),
      location,
      description,
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('timeEntry', 'create', timeEntry);
    }
    
    return timeEntry;
  }

  // Stop time tracking
  async stopTimeTracking(timeEntryId: string): Promise<TimeEntry> {
    const timeEntry = this.getTimeEntry(timeEntryId);
    if (!timeEntry) {
      throw new Error('Time entry not found');
    }
    
    timeEntry.endTime = new Date();
    timeEntry.duration = Math.round((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));
    
    if (!this.isOnline) {
      this.addToOfflineQueue('timeEntry', 'update', timeEntry);
    }
    
    return timeEntry;
  }

  // Complete safety checklist
  async completeSafetyCheck(taskId: string, checklistId: string, checklistName: string, items: SafetyCheckItem[], completedBy: string): Promise<SafetyCheck> {
    const safetyCheck: SafetyCheck = {
      id: this.generateId(),
      taskId,
      checklistId,
      checklistName,
      items,
      completedBy,
      completedAt: new Date(),
      status: items.every(item => item.answer === 'yes') ? 'passed' : 'failed',
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('safetyCheck', 'create', safetyCheck);
    }
    
    return safetyCheck;
  }

  // Complete quality checklist
  async completeQualityCheck(taskId: string, checklistId: string, checklistName: string, items: QualityCheckItem[], completedBy: string): Promise<QualityCheck> {
    const qualityCheck: QualityCheck = {
      id: this.generateId(),
      taskId,
      checklistId,
      checklistName,
      items,
      completedBy,
      completedAt: new Date(),
      status: items.every(item => item.result === 'pass') ? 'passed' : 'failed',
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('qualityCheck', 'create', qualityCheck);
    }
    
    return qualityCheck;
  }

  // Record material usage
  async recordMaterialUsage(taskId: string, materialId: string, materialName: string, quantity: number, unit: string, cost: number): Promise<MaterialUsage> {
    const location = await this.getCurrentLocation();
    
    const materialUsage: MaterialUsage = {
      id: this.generateId(),
      taskId,
      materialId,
      materialName,
      quantity,
      unit,
      cost,
      timestamp: new Date(),
      location,
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('materialUsage', 'create', materialUsage);
    }
    
    return materialUsage;
  }

  // Record equipment usage
  async recordEquipmentUsage(taskId: string, equipmentId: string, equipmentName: string, operator: string, cost: number): Promise<EquipmentUsage> {
    const location = await this.getCurrentLocation();
    
    const equipmentUsage: EquipmentUsage = {
      id: this.generateId(),
      taskId,
      equipmentId,
      equipmentName,
      startTime: new Date(),
      hours: 0,
      cost,
      operator,
      location,
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('equipmentUsage', 'create', equipmentUsage);
    }
    
    return equipmentUsage;
  }

  // Submit daily report
  async submitDailyReport(projectId: string, weather: any, workCompleted: string[], workPlanned: string[], issues: string[], safetyIncidents: string[], submittedBy: string): Promise<DailyReport> {
    const dailyReport: DailyReport = {
      id: this.generateId(),
      projectId,
      date: new Date(),
      weather,
      workCompleted,
      workPlanned,
      issues,
      safetyIncidents,
      materialsUsed: [],
      equipmentUsed: [],
      photos: [],
      notes: [],
      submittedBy,
      submittedAt: new Date(),
      uploaded: this.isOnline
    };
    
    if (!this.isOnline) {
      this.addToOfflineQueue('dailyReport', 'create', dailyReport);
    }
    
    return dailyReport;
  }

  // Get current GPS location
  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        error => {
          console.warn('Failed to get location:', error);
          resolve({ latitude: 0, longitude: 0 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Add item to offline queue
  private addToOfflineQueue(type: string, action: string, data: any) {
    const item = {
      id: this.generateId(),
      type,
      action,
      data,
      timestamp: new Date()
    };
    
    this.offlineQueue.push(item);
    this.storeOfflineQueue();
  }

  // Store offline queue in localStorage
  private storeOfflineQueue() {
    try {
      localStorage.setItem('napwood_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to store offline queue:', error);
    }
  }

  // Load offline queue from localStorage
  private loadOfflineQueue() {
    try {
      const stored = localStorage.getItem('napwood_offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  // Store photo locally
  private storePhotoLocally(photo: FieldPhoto, blob: Blob) {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(`photo_${photo.id}`, reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to store photo locally:', error);
    }
  }

  // Sync offline data
  private async syncOfflineData() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;
    
    console.log('Syncing offline data...');
    await this.processOfflineQueue();
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getTimeEntry(timeEntryId: string): TimeEntry | null {
    // This would typically fetch from local storage or database
    return null;
  }

  // Upload methods (would connect to backend)
  private async uploadPhoto(photo: FieldPhoto) {
    console.log('Uploading photo:', photo);
  }

  private async uploadNote(note: FieldNote) {
    console.log('Uploading note:', note);
  }

  private async uploadTimeEntry(timeEntry: TimeEntry) {
    console.log('Uploading time entry:', timeEntry);
  }

  private async uploadSafetyCheck(safetyCheck: SafetyCheck) {
    console.log('Uploading safety check:', safetyCheck);
  }

  private async uploadQualityCheck(qualityCheck: QualityCheck) {
    console.log('Uploading quality check:', qualityCheck);
  }

  private async uploadDailyReport(dailyReport: DailyReport) {
    console.log('Uploading daily report:', dailyReport);
  }

  // Public methods
  getOfflineStatus(): boolean {
    return !this.isOnline;
  }

  getOfflineQueueLength(): number {
    return this.offlineQueue.length;
  }

  getOfflineQueue(): any[] {
    return [...this.offlineQueue];
  }

  // Initialize the service
  async initialize() {
    this.loadOfflineQueue();
    console.log('Mobile Integration Service initialized');
  }
}

export const mobileIntegrationService = new MobileIntegrationService(); 
