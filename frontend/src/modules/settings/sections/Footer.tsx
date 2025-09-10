import { useFooterStore } from '../../../app/store/ui/footer.store';
import { Button } from '../../../components/ui';
import { Link } from 'react-router-dom';

export function Footer() {
  const { config, updateConfig, resetConfig } = useFooterStore();

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Footer Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Configure the application footer content and links.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium mb-2'>Footer Configuration</h4>
          <p className='text-sm text-muted-foreground mb-4'>
            Current footer has {config.columns} columns with {config.widgets.length} widgets.
          </p>
          <div className='flex gap-2'>
            <Button asChild>
              <Link to='/footer-builder'>Open Footer Builder</Link>
            </Button>
            <Button variant='outline' onClick={resetConfig}>
              Reset to Default
            </Button>
          </div>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium mb-2'>Quick Settings</h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Show Copyright</span>
              <input
                type='checkbox'
                checked={config.showCopyright}
                onChange={(e) => updateConfig({ showCopyright: e.target.checked })}
                className='rounded'
              />
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Columns</span>
              <select
                value={config.columns}
                onChange={(e) => updateConfig({ columns: parseInt(e.target.value) as 2 | 3 | 4 })}
                className='rounded border px-2 py-1'
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium mb-2'>Current Widgets</h4>
          <div className='space-y-2'>
            {config.widgets.map((widget) => (
              <div key={widget.id} className='text-sm p-2 bg-muted rounded'>
                <strong>{widget.title}</strong> ({widget.type})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
