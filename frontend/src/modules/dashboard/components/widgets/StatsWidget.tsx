import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DashboardWidget } from '../../store';

interface StatsWidgetProps {
  widget: DashboardWidget;
}

interface StatItem {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsWidget({ widget }: StatsWidgetProps) {
  const stats = widget.data?.stats as StatItem[] || [];

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                {stat.change && (
                  <div className={`flex items-center space-x-1 text-xs ${getTrendColor(stat.trend)}`}>
                    {getTrendIcon(stat.trend)}
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
