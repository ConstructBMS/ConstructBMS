import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { DashboardWidget } from '../../store';
import { useNavigate } from 'react-router-dom';

interface CustomWidgetProps {
  widget: DashboardWidget;
}

interface CustomWidgetData {
  message?: string;
  content?: string;
  actions?: Array<{
    label: string;
    action: 'navigate' | 'function';
    target?: string;
    onClick?: () => void;
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.message && (
            <p className="text-muted-foreground leading-relaxed">
              {data.message}
            </p>
          )}
          
          {data.content && (
            <div className="prose prose-sm max-w-none">
              <p>{data.content}</p>
            </div>
          )}
          
          {data.actions && data.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {data.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(action)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
