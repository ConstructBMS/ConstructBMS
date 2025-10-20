import { PipelineSettings } from '../../modules/settings/sections/PipelineSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PipelineSettingsModal({
  isOpen,
  onClose,
}: PipelineSettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Sales Pipeline Settings</DialogTitle>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto p-4'>
          <PipelineSettings />
        </div>
      </DialogContent>
    </Dialog>
  );
}
