import React from 'react';
import LinkButton from './LinkButton';

interface LinkSectionProps {
  selectedTasksCount: number;
  onLink: () => void;
  onUnlink: () => void;
  onLag: () => void;
  canLink?: boolean;
  canUnlink?: boolean;
  canLag?: boolean;
}

const LinkSection: React.FC<LinkSectionProps> = ({
  selectedTasksCount,
  onLink,
  onUnlink,
  onLag,
  canLink = true,
  canUnlink = true,
  canLag = true
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <LinkButton 
          type="link" 
          onClick={onLink}
          selectedTasksCount={selectedTasksCount}
          canLink={canLink}
        />
        <LinkButton 
          type="unlink" 
          onClick={onUnlink}
          selectedTasksCount={selectedTasksCount}
          canUnlink={canUnlink}
        />
        <LinkButton 
          type="lag" 
          onClick={onLag}
          selectedTasksCount={selectedTasksCount}
          canLag={canLag}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Link
      </div>
    </section>
  );
};

export default LinkSection; 