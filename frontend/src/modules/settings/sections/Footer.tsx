import { Link } from 'react-router-dom';
import { useFooterStore } from '../../../app/store/ui/footer.store';
import Footer from '../../../components/Footer';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '../../../components/ui';

export function FooterSettings() {
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
            Current footer has {config.columns} columns with{' '}
            {config.widgets.length} widgets.
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
              <Switch
                checked={config.showCopyright}
                onCheckedChange={checked =>
                  updateConfig({ showCopyright: checked })
                }
              />
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Columns</span>
              <Select
                value={config.columns.toString()}
                onValueChange={value =>
                  updateConfig({ columns: parseInt(value) as 2 | 3 | 4 })
                }
              >
                <SelectTrigger className='w-[120px]'>
                  <SelectValue placeholder='Select columns' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='2'>2 Columns</SelectItem>
                  <SelectItem value='3'>3 Columns</SelectItem>
                  <SelectItem value='4'>4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium mb-4'>Footer Preview</h4>
          <div className='border rounded-lg overflow-hidden bg-background'>
            <div className='p-2 bg-muted text-xs text-muted-foreground border-b'>
              Live Preview
            </div>
            <div
              className='scale-75 origin-top-left transform-gpu'
              style={{ width: '133.33%' }}
            >
              <Footer config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
