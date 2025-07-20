import React, { useState, useEffect } from 'react';
import EnhancedAstaPowerProject from './EnhancedAstaPowerProject';
import type { EnhancedProject } from './EnhancedAstaPowerProject';

interface AstaPowerProjectProps {
  projectId?: string;
  initialProject?: EnhancedProject;
  onProjectChange?: (project: EnhancedProject) => void;
  onViewModeChange?: (mode: string) => void;
}

const AstaPowerProject: React.FC<AstaPowerProjectProps> = ({
  projectId = 'demo-project-123',
  initialProject,
  onProjectChange,
  onViewModeChange
}) => {
  const [currentProject, setCurrentProject] = useState<EnhancedProject | null>(initialProject || null);

  // Load project data if not provided
  useEffect(() => {
    if (!initialProject) {
      loadDemoProject();
    }
  }, [initialProject]);

  const loadDemoProject = async () => {
    // Create a demo project with sophisticated features
    const demoProject: EnhancedProject = {
      id: projectId,
      name: 'Advanced Construction Project',
      description: 'A comprehensive construction project demonstrating Asta PowerProject capabilities',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-04-16'),
      status: 'execution',
      priority: 'high',
      manager: 'Senior Project Manager',
      client: 'Construction Corp Ltd',
      budget: 150000,
      actualCost: 120000,
      progress: 75,
      constraints: [
        {
          id: 'constraint-1',
          type: 'finish-no-later-than',
          date: new Date('2024-04-30'),
          description: 'Client deadline requirement',
          critical: true
        }
      ],
      risks: [
        {
          id: 'risk-1',
          name: 'Material Supply Delay',
          description: 'Potential delays in material delivery',
          probability: 30,
          impact: 'medium',
          mitigation: 'Multiple suppliers identified',
          status: 'identified'
        },
        {
          id: 'risk-2',
          name: 'Weather Impact',
          description: 'Adverse weather conditions',
          probability: 20,
          impact: 'high',
          mitigation: 'Weather monitoring and flexible scheduling',
          status: 'mitigated'
        }
      ],
      resources: [],
      customFields: {
        projectType: 'Construction',
        complexity: 'High',
        regulatoryCompliance: 'Required',
        sustainabilityRating: 'Gold'
      }
    };

    setCurrentProject(demoProject);
  };

  const handleProjectChange = (project: EnhancedProject) => {
    setCurrentProject(project);
    onProjectChange?.(project);
  };

  const handleViewModeChange = (mode: string) => {
    console.log('View mode changed to:', mode);
    onViewModeChange?.(mode);
  };

  if (!currentProject) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <EnhancedAstaPowerProject
      projectId={projectId}
      initialProject={currentProject}
      onProjectChange={handleProjectChange}
      onViewModeChange={handleViewModeChange}
    />
  );
};

export default AstaPowerProject; 