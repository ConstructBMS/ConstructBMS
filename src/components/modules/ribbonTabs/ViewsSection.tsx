import React from 'react';
import ViewDropdown from './ViewDropdown';
import ViewsButton from './ViewsButton';
import type { View } from '../../../services/viewService';

interface ViewsSectionProps {
  views: View[];
  activeView: View | null;
  onApplyView: (view: View) => void;
  onSaveView: () => void;
  onManageViews: () => void;
  disabled?: boolean;
  loading?: {
    apply?: boolean;
    save?: boolean;
    manage?: boolean;
  };
}

const ViewsSection: React.FC<ViewsSectionProps> = ({
  views,
  activeView,
  onApplyView,
  onSaveView,
  onManageViews,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ViewDropdown
          views={views}
          activeView={activeView}
          onApplyView={onApplyView}
          disabled={disabled}
          loading={loading.apply || false}
        />
        <ViewsButton
          type="save"
          onClick={onSaveView}
          disabled={disabled}
          loading={loading.save || false}
        />
        <ViewsButton
          type="manage"
          onClick={onManageViews}
          disabled={disabled}
          loading={loading.manage || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Views
      </div>
    </section>
  );
};

export default ViewsSection; 