import React from 'react';
import StructureToolsButton from './StructureToolsButton';

interface StructureSectionProps {
  onRenumberTasks: () => void;
  onAutoIdSettings: () => void;
  onSetWbsPrefix: () => void;
  disabled?: boolean;
  loading?: {
    renumber?: boolean;
    autoIdSettings?: boolean;
    wbsPrefix?: boolean;
  };
}

const StructureSection: React.FC<StructureSectionProps> = ({
  onRenumberTasks,
  onAutoIdSettings,
  onSetWbsPrefix,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <StructureToolsButton
          type="renumber"
          onClick={onRenumberTasks}
          disabled={disabled}
          loading={loading.renumber || false}
        />
        <StructureToolsButton
          type="autoIdSettings"
          onClick={onAutoIdSettings}
          disabled={disabled}
          loading={loading.autoIdSettings || false}
        />
        <StructureToolsButton
          type="wbsPrefix"
          onClick={onSetWbsPrefix}
          disabled={disabled}
          loading={loading.wbsPrefix || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Structure
      </div>
    </section>
  );
};

export default StructureSection; 