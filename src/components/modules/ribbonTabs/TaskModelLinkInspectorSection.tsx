import React from 'react';
import LinkInspectorButton from './LinkInspectorButton';

interface TaskModelLinkInspectorSectionProps {
  onInspectLinks: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const TaskModelLinkInspectorSection: React.FC<TaskModelLinkInspectorSectionProps> = ({
  onInspectLinks,
  disabled = false,
  loading = false
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <LinkInspectorButton
          onClick={onInspectLinks}
          disabled={disabled}
          loading={loading}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Task-Model Link Inspector
      </div>
    </section>
  );
};

export default TaskModelLinkInspectorSection; 