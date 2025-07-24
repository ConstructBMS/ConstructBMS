import React from 'react';
import { ProjectGanttView } from '../gantt/ProjectGanttView';
import { ProjectViewProvider } from '../../contexts/ProjectViewContext';

interface GanttPageProps {
  project?: any;
}

const GanttPage: React.FC<GanttPageProps> = ({ project }) => {
  return (
    <ProjectViewProvider projectId={project?.id}>
      <ProjectGanttView projectId={project?.id} />
    </ProjectViewProvider>
  );
};

export default GanttPage; 