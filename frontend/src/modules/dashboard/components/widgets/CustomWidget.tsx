import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { DashboardWidget } from '../../store';
import { useNavigate } from 'react-router-dom';

interface CustomWidgetProps {
  widget: DashboardWidget;
}

interface CustomWidgetData {
  message?: string;
  content?: string;
  gradient?: string;
  icon?: string;
  actions?: Array<{
    label: string;
    action: 'navigate' | 'function';
    target?: string;
    onClick?: () => void;
    icon?: string;
    color?: string;
  }>;
}

export function CustomWidget({ widget }: CustomWidgetProps) {
  const navigate = useNavigate();
  const data = widget.data as CustomWidgetData;

  const handleAction = (action: CustomWidgetData['actions'][0]) => {
    if (action.action === 'navigate' && action.target) {
      navigate(action.target);
    } else if (action.action === 'function' && action.onClick) {
      action.onClick();
    }
  };

  return (
    <Card className='overflow-hidden'>
      <CardHeader className={`${data.gradient ? `bg-gradient-to-r ${data.gradient} text-white` : ''}`}>
        <CardTitle className='text-lg flex items-center space-x-2'>
          {data.icon && <span className='text-xl'>{data.icon}</span>}
          <span>{widget.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {data.message && (
            <p className={`leading-relaxed ${data.gradient ? 'text-white/90' : 'text-muted-foreground'}`}>
              {data.message}
            </p>
          )}

          {data.content && (
            <div className='prose prose-sm max-w-none'>
              <p>{data.content}</p>
            </div>
          )}

          {data.actions && data.actions.length > 0 && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2'>
              {data.actions.map((action, index) => (
                <Button
                  key={index}
                  variant='outline'
                  size='sm'
                  onClick={() => handleAction(action)}
                  className={`text-xs h-auto py-3 px-4 flex items-center space-x-2 ${
                    action.color 
                      ? `${action.color} text-white border-0 hover:opacity-90` 
                      : ''
                  }`}
                >
                  {action.icon && <span>{action.icon}</span>}
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
