import React from 'react';
import IfcButton from './IfcButton';

interface LinkIfcModelSectionProps {
  onUploadIfc: () => void;
  onSyncTasks: () => void;
  onUnlinkModel: () => void;
  disabled?: boolean;
  loading?: {
    upload?: boolean;
    sync?: boolean;
    unlink?: boolean;
  };
}

const LinkIfcModelSection: React.FC<LinkIfcModelSectionProps> = ({
  onUploadIfc,
  onSyncTasks,
  onUnlinkModel,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <IfcButton
          type="upload"
          onClick={onUploadIfc}
          disabled={disabled}
          loading={loading.upload || false}
        />
        <IfcButton
          type="sync"
          onClick={onSyncTasks}
          disabled={disabled}
          loading={loading.sync || false}
        />
        <IfcButton
          type="unlink"
          onClick={onUnlinkModel}
          disabled={disabled}
          loading={loading.unlink || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Link IFC Model
      </div>
    </section>
  );
};

export default LinkIfcModelSection; 