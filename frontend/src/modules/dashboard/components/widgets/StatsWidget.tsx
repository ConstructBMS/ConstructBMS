import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { DashboardWidget } from '../../store';

interface StatsWidgetProps {
  widget: DashboardWidget;
}

interface StatItem {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  icon?: string;
}

export function StatsWidget({ widget }: StatsWidgetProps) {
  const stats = (widget.data?.stats as StatItem[]) || [];

  // Debug logging
  console.log('StatsWidget data:', widget.data);
  console.log('StatsWidget stats:', stats);
  console.log('First stat item:', stats[0]);
  console.log('First stat color:', stats[0]?.color);
  console.log('First stat icon:', stats[0]?.icon);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'down':
        return <TrendingDown className='h-4 w-4 text-red-500' />;
      default:
        return <Minus className='h-4 w-4 text-muted-foreground' />;
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
    <Card className='overflow-hidden'>
      <CardHeader>
        <CardTitle className='text-lg'>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {stats.map((stat, index) => (
            <div key={index} className='relative'>
              <div
                className={`p-4 rounded-lg ${stat.color || 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white shadow-lg`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center space-x-2'>
                    {stat.icon && <span className='text-lg'>{stat.icon}</span>}
                    <p className='text-sm font-medium opacity-90'>
                      {stat.label}
                    </p>
                  </div>
                  {stat.change && (
                    <div
                      className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                        stat.trend === 'up'
                          ? 'bg-green-500/20 text-green-100'
                          : stat.trend === 'down'
                            ? 'bg-red-500/20 text-red-100'
                            : 'bg-gray-500/20 text-gray-100'
                      }`}
                    >
                      {getTrendIcon(stat.trend)}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <p className='text-2xl font-bold'>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
