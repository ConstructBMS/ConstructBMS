import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';

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

export function MultiBarChart({
  title,
  data,
  config,
}: {
  title: string;
  data: MultiBarChartData[];
  config: any;
}) {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.efficiency, d.quality, d.delivery))
  );

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col pt-6'>
        <div className='space-y-2 flex-1'>
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
                const barWidth = 320 / data.length / 3 - 2;
                const efficiencyHeight = (item.efficiency / maxValue) * 140;
                const qualityHeight = (item.quality / maxValue) * 140;
                const deliveryHeight = (item.delivery / maxValue) * 140;

                return (
                  <g key={item.metric}>
                    {/* Efficiency bar */}
                    <rect
                      x={x}
                      y={160 - efficiencyHeight}
                      width={barWidth}
                      height={efficiencyHeight}
                      fill={config.efficiencyColor || '#3b82f6'}
                      className='opacity-80 hover:opacity-100 transition-opacity'
                    />
                    {/* Quality bar */}
                    <rect
                      x={x + barWidth + 2}
                      y={160 - qualityHeight}
                      width={barWidth}
                      height={qualityHeight}
                      fill={config.qualityColor || '#10b981'}
                      className='opacity-80 hover:opacity-100 transition-opacity'
                    />
                    {/* Delivery bar */}
                    <rect
                      x={x + (barWidth + 2) * 2}
                      y={160 - deliveryHeight}
                      width={barWidth}
                      height={deliveryHeight}
                      fill={config.deliveryColor || '#f59e0b'}
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
                    key={item.metric}
                    x={x}
                    y='175'
                    textAnchor='middle'
                    className='text-xs fill-muted-foreground'
                  >
                    {item.metric}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend - moved closer to chart */}
          <div className='flex items-center justify-center space-x-6 -mt-1'>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-blue-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Efficiency</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-green-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Quality</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-yellow-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Delivery</span>
            </div>
          </div>

          {/* Summary - improved spacing with center alignment */}
          <div className='grid grid-cols-3 gap-4 text-sm mt-3'>
            <div className='flex flex-col items-center text-center'>
              <span className='text-muted-foreground text-xs leading-tight'>
                Avg
                <br />
                Efficiency:
              </span>
              <span className='font-semibold text-blue-600 text-lg mt-1'>
                {Math.round(
                  data.reduce((sum, item) => sum + item.efficiency, 0) /
                    data.length
                )}
                %
              </span>
            </div>
            <div className='flex flex-col items-center text-center'>
              <span className='text-muted-foreground text-xs leading-tight'>
                Avg
                <br />
                Quality:
              </span>
              <span className='font-semibold text-green-600 text-lg mt-1'>
                {Math.round(
                  data.reduce((sum, item) => sum + item.quality, 0) /
                    data.length
                )}
                %
              </span>
            </div>
            <div className='flex flex-col items-center text-center'>
              <span className='text-muted-foreground text-xs leading-tight'>
                Avg
                <br />
                Delivery:
              </span>
              <span className='font-semibold text-yellow-600 text-lg mt-1'>
                {Math.round(
                  data.reduce((sum, item) => sum + item.delivery, 0) /
                    data.length
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MultiLineChart({
  title,
  data,
  config,
}: {
  title: string;
  data: MultiLineChartData[];
  config: any;
}) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxProjects = Math.max(...data.map(d => d.projects));
  const maxClients = Math.max(...data.map(d => d.clients));
  const maxValue = Math.max(maxRevenue, maxProjects * 1000, maxClients * 1000); // Scale projects and clients

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col pt-6'>
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

              {/* Revenue line */}
              <polyline
                fill='none'
                stroke={config.revenueColor || '#10b981'}
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                points={data
                  .map((item, index) => {
                    const x = 40 + (index / (data.length - 1)) * 340;
                    const y = 160 - (item.revenue / maxValue) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Projects line */}
              <polyline
                fill='none'
                stroke={config.projectsColor || '#3b82f6'}
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                points={data
                  .map((item, index) => {
                    const x = 40 + (index / (data.length - 1)) * 340;
                    const y = 160 - ((item.projects * 1000) / maxValue) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Clients line */}
              <polyline
                fill='none'
                stroke={config.clientsColor || '#8b5cf6'}
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                points={data
                  .map((item, index) => {
                    const x = 40 + (index / (data.length - 1)) * 340;
                    const y = 160 - ((item.clients * 1000) / maxValue) * 140;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Data points */}
              {data.map((item, index) => {
                const x = 40 + (index / (data.length - 1)) * 340;
                const revenueY = 160 - (item.revenue / maxValue) * 140;
                const projectsY =
                  160 - ((item.projects * 1000) / maxValue) * 140;
                const clientsY = 160 - ((item.clients * 1000) / maxValue) * 140;

                return (
                  <g key={item.month}>
                    <circle
                      cx={x}
                      cy={revenueY}
                      r='3'
                      fill={config.revenueColor || '#10b981'}
                    />
                    <circle
                      cx={x}
                      cy={projectsY}
                      r='3'
                      fill={config.projectsColor || '#3b82f6'}
                    />
                    <circle
                      cx={x}
                      cy={clientsY}
                      r='3'
                      fill={config.clientsColor || '#8b5cf6'}
                    />
                  </g>
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

          {/* Legend */}
          <div className='flex items-center justify-center space-x-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-green-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Revenue</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-blue-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Projects</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-purple-500 rounded'></div>
              <span className='text-sm text-muted-foreground'>Clients</span>
            </div>
          </div>

          {/* Summary */}
          <div className='grid grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>Total Revenue:</span>
              <span className='ml-2 font-semibold text-green-600'>
                $
                {data
                  .reduce((sum, item) => sum + item.revenue, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>Total Projects:</span>
              <span className='ml-2 font-semibold text-blue-600'>
                {data.reduce((sum, item) => sum + item.projects, 0)}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>Total Clients:</span>
              <span className='ml-2 font-semibold text-purple-600'>
                {data.reduce((sum, item) => sum + item.clients, 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
