import React from 'react';
import ViewDropdown from './ViewDropdown';
import ViewsButton from './ViewsButton';
import type { View } from '../../../services/viewService';

interface ViewsSectionProps {
  activeView: View | null;
  disabled?: boolean;
  loading?: {
    apply?: boolean;
    manage?: boolean;
    save?: boolean;
  };
  onApplyView: (view: View) => void;
  onManageViews: () => void;
  onSaveView: () => void;
  views: View[];
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