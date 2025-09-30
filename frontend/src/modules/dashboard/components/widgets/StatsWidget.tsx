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

  return (
    <Card className='overflow-hidden h-full flex flex-col'>
      <CardHeader>
        <CardTitle className='text-lg'>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full'>
          {stats.map((stat, index) => (
            <div key={index} className='relative h-full'>
              <div
                className={`p-4 rounded-lg ${stat.color || 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white shadow-lg h-full flex flex-col`}
              >
                <div className='flex items-center justify-between mb-3 flex-shrink-0'>
                  <div className='flex items-center space-x-2'>
                    {stat.icon && <span className='text-lg'>{stat.icon}</span>}
                    <p className='text-sm font-medium opacity-90 leading-tight'>
                      {stat.label}
                    </p>
                  </div>
                  {stat.change && (
                    <div
                      className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full flex-shrink-0 ${
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
                <div className='flex-1 flex items-end'>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
