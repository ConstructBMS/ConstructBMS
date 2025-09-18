import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { DashboardWidget } from '../../store';
import { MultiBarChart, MultiLineChart } from './MultiChartWidgets';

interface ChartWidgetProps {
  widget: DashboardWidget;
}

interface PieChartData {
  label: string;
  value: number;
  color: string;
  gradient: string;
  icon?: string;
}

interface LineChartData {
  month: string;
  revenue: number;
}

interface BarChartData {
  month: string;
  inflow: number;
  outflow: number;
}

interface MultiBarChartData {
  metric: string;
  efficiency: number;
  quality: number;
  delivery: number;
}

interface MultiLineChartData {
  month: string;
  revenue: number;
  projects: number;
  clients: number;
}

export function ChartWidget({ widget }: ChartWidgetProps) {
  const { data } = widget;

  if (!data) {
    return (
      <Card className='h-full flex flex-col'>
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className='flex-1 flex items-center justify-center'>
          <div className='text-muted-foreground'>
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (data.type) {
    case 'pie':
      return <PieChart title={widget.title} data={data.data} />;
    case 'line':
      // Check if it's a multi-series line chart (Growth Analytics)
      if (widget.id === 'growth-analytics') {
        return (
          <MultiLineChart title={widget.title} data={data.data} config={data} />
        );
      }
      // Check if it's a multi-series line chart
      if (
        data.data &&
        data.data[0] &&
        'revenue' in data.data[0] &&
        'projects' in data.data[0]
      ) {
        return (
          <MultiLineChart title={widget.title} data={data.data} config={data} />
        );
      }
      return <LineChart title={widget.title} data={data.data} />;
    case 'bar':
      // Check if it's a multi-series bar chart (Performance Metrics)
      if (widget.id === 'performance-metrics') {
        return (
          <MultiBarChart title={widget.title} data={data.data} config={data} />
        );
      }
      // Check if it's a multi-series bar chart
      if (
        data.data &&
        data.data[0] &&
        'efficiency' in data.data[0] &&
        'quality' in data.data[0]
      ) {
        return (
          <MultiBarChart title={widget.title} data={data.data} config={data} />
        );
      }
      return <BarChart title={widget.title} data={data.data} />;
    default:
      return (
        <Card className='h-full flex flex-col'>
          <CardHeader>
            <CardTitle>{widget.title}</CardTitle>
          </CardHeader>
          <CardContent className='flex-1 flex items-center justify-center'>
            <div className='text-muted-foreground'>
              <p>Unsupported chart type</p>
            </div>
          </CardContent>
        </Card>
      );
  }
}

function PieChart({ title, data }: { title: string; data: PieChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col pt-4'>
        <div className='flex flex-col space-y-4 flex-1'>
          {/* Chart visualization */}
          <div className='flex items-center justify-center'>
            <div className='relative w-32 h-32'>
              <svg
                className='w-32 h-32 transform -rotate-90'
                viewBox='0 0 100 100'
              >
                {data.map((item, index) => {
                  const percentage = (item.value / total) * 100;
                  const circumference = 2 * Math.PI * 45; // radius = 45
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = data
                    .slice(0, index)
                    .reduce((offset, prevItem) => {
                      const prevPercentage = (prevItem.value / total) * 100;
                      return offset - (prevPercentage / 100) * circumference;
                    }, 0);

                  return (
                    <circle
                      key={item.label}
                      cx='50'
                      cy='50'
                      r='45'
                      fill='none'
                      stroke={item.color}
                      strokeWidth='8'
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className='transition-all duration-300 hover:stroke-width-10'
                    />
                  );
                })}
              </svg>
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-lg font-semibold text-foreground'>
                  {total}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className='space-y-2'>
            {data.map(item => (
              <div key={item.label} className='flex items-center space-x-3'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: item.color }}
                />
                <div className='flex-1 flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    {item.icon && <span className='text-sm'>{item.icon}</span>}
                    <span className='text-sm font-medium'>{item.label}</span>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChart({ title, data }: { title: string; data: LineChartData[] }) {
  const maxValue = Math.max(...data.map(d => d.revenue));
  const minValue = Math.min(...data.map(d => d.revenue));
  const range = maxValue - minValue;

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col pt-4'>
        <div className='space-y-4 flex-1'>
          {/* Chart */}
          <div className='h-48 relative'>
            <svg className='w-full h-full' viewBox='0 0 400 180'>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                <line
                  key={ratio}
                  x1='40'
                  y1={20 + ratio * 140}
                  x2='380'
                  y2={20 + ratio * 140}
                  stroke='currentColor'
                  strokeWidth='0.5'
                  className='text-muted-foreground opacity-30'
                />
              ))}

              {/* Line chart */}
              <polyline
                fill='none'
                stroke='#10b981'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                points={data
                  .map((item, index) => {
                    const x = 40 + (index / (data.length - 1)) * 340;
                    const y = 160 - ((item.revenue - minValue) / range) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Data points */}
              {data.map((item, index) => {
                const x = 40 + (index / (data.length - 1)) * 340;
                const y = 160 - ((item.revenue - minValue) / range) * 140;
                return (
                  <circle
                    key={item.month}
                    cx={x}
                    cy={y}
                    r='4'
                    fill='#10b981'
                    className='hover:r-6 transition-all duration-200'
                  />
                );
              })}

              {/* X-axis labels */}
              {data.map((item, index) => {
                const x = 40 + (index / (data.length - 1)) * 340;
                return (
                  <text
                    key={item.month}
                    x={x}
                    y='175'
                    textAnchor='middle'
                    className='text-xs fill-muted-foreground'
                  >
                    {item.month}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Data summary */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>Highest:</span>
              <span className='ml-2 font-semibold'>
                £{maxValue.toLocaleString()}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>Lowest:</span>
              <span className='ml-2 font-semibold'>
                £{minValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChart({ title, data }: { title: string; data: BarChartData[] }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.inflow, d.outflow)));

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col pt-4'>
        <div className='space-y-4 flex-1'>
          {/* Chart */}
          <div className='h-48 relative'>
            <svg className='w-full h-full' viewBox='0 0 400 180'>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                <line
                  key={ratio}
                  x1='40'
                  y1={20 + ratio * 140}
                  x2='380'
                  y2={20 + ratio * 140}
                  stroke='currentColor'
                  strokeWidth='0.5'
                  className='text-muted-foreground opacity-30'
                />
              ))}

              {/* Bars */}
              {data.map((item, index) => {
                const x = 40 + (index / data.length) * 340;
                const barWidth = 320 / data.length / 2 - 2;
                const inflowHeight = (item.inflow / maxValue) * 140;
                const outflowHeight = (item.outflow / maxValue) * 140;

                return (
                  <g key={item.month}>
                    {/* Inflow bar */}
                    <rect
                      x={x}
                      y={160 - inflowHeight}
                      width={barWidth}
                      height={inflowHeight}
                      fill='#10b981'
                      className='opacity-80 hover:opacity-100 transition-opacity'
                    />
                    {/* Outflow bar */}
                    <rect
                      x={x + barWidth + 2}
                      y={160 - outflowHeight}
                      width={barWidth}
                      height={outflowHeight}
                      fill='#ef4444'
                      className='opacity-80 hover:opacity-100 transition-opacity'
                    />
                  </g>
                );
              })}

              {/* X-axis labels */}
              {data.map((item, index) => {
                const x =
                  40 + (index / data.length) * 340 + 320 / data.length / 2;
                return (
                  <text
                    key={item.month}
                    x={x}
                    y='175'
                    textAnchor='middle'
                    className='text-xs fill-muted-foreground'
                  >
                    {item.month}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className='flex items-center justify-center space-x-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-green-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Cash Inflow</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-red-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>
                Cash Outflow
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>Total Inflow:</span>
              <span className='ml-2 font-semibold text-green-600'>
                £
                {data
                  .reduce((sum, item) => sum + item.inflow, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>Total Outflow:</span>
              <span className='ml-2 font-semibold text-red-600'>
                £
                {data
                  .reduce((sum, item) => sum + item.outflow, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
