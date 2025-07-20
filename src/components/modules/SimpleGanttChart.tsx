import React from 'react';
import type { GanttTask, GanttLink } from './GanttCanvas';

interface SimpleGanttChartProps {
  tasks: GanttTask[];
  links: GanttLink[];
  startDate: Date;
  endDate: Date;
}

const SimpleGanttChart: React.FC<SimpleGanttChartProps> = ({
  tasks,
  links,
  startDate,
  endDate
}) => {
  const width = 1200;
  const height = 400;
  const rowHeight = 40;
  const headerHeight = 60;
  const leftColumnWidth = 300;

  // Calculate time scale
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const pixelsPerDay = (width - leftColumnWidth) / totalDays;

  // Convert date to pixel position
  const dateToPixel = (date: Date): number => {
    const daysFromStart = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysFromStart * pixelsPerDay;
  };

  // Generate time grid
  const generateTimeGrid = () => {
    const gridLines = [];
    for (let i = 0; i <= totalDays; i += 7) { // Weekly grid
      const x = i * pixelsPerDay;
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      gridLines.push({ x, date, isMajor: true });
    }
    return gridLines;
  };

  const gridLines = generateTimeGrid();

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex">
        {/* Left Column */}
        <div className="w-[300px] bg-gray-50 border-r border-gray-200">
          <div className="h-[60px] bg-gray-100 border-b border-gray-200 flex items-center px-4">
            <h3 className="font-semibold text-gray-900">Tasks</h3>
          </div>
          <div>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center px-4 py-2 border-b border-gray-100"
                style={{ height: rowHeight }}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{task.name}</div>
                  <div className="text-xs text-gray-500">{task.assignedTo}</div>
                </div>
                <div className="text-xs text-gray-500">{task.progress}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-auto">
          <svg width={width - leftColumnWidth} height={height}>
            {/* Grid Lines */}
            <g>
              {gridLines.map((line, index) => (
                <line
                  key={index}
                  x1={line.x}
                  y1={0}
                  x2={line.x}
                  y2={height}
                  stroke="#d1d5db"
                  strokeWidth={1}
                />
              ))}
            </g>

            {/* Time Header */}
            <g>
              {gridLines.map((line, index) => (
                <g key={index}>
                  <text
                    x={line.x + 4}
                    y={headerHeight / 2 + 4}
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {line.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </text>
                </g>
              ))}
            </g>

            {/* Task Bars */}
            {tasks.map((task, index) => {
              const startX = dateToPixel(task.startDate);
              const endX = dateToPixel(task.endDate);
              const width = endX - startX;
              const y = headerHeight + index * rowHeight + (rowHeight - 20) / 2;

              if (task.isMilestone) {
                // Render milestone as diamond
                const centerX = startX;
                const diamondSize = 8;
                const points = [
                  `${centerX},${y - diamondSize}`,
                  `${centerX + diamondSize},${y}`,
                  `${centerX},${y + diamondSize}`,
                  `${centerX - diamondSize},${y}`
                ].join(' ');

                return (
                  <g key={task.id}>
                    <polygon
                      points={points}
                      fill={task.isCritical ? '#ef4444' : '#3b82f6'}
                      stroke="#1e3a8a"
                      strokeWidth={1}
                    />
                  </g>
                );
              }

              // Render regular task bar
              return (
                <g key={task.id}>
                  {/* Background bar */}
                  <rect
                    x={startX}
                    y={y}
                    width={width}
                    height={20}
                    fill={task.isCritical ? '#fecaca' : '#e5e7eb'}
                    stroke={task.isCritical ? '#ef4444' : '#d1d5db'}
                    strokeWidth={1}
                    rx={4}
                  />
                  
                  {/* Progress bar */}
                  {task.progress > 0 && (
                    <rect
                      x={startX}
                      y={y}
                      width={(width * task.progress) / 100}
                      height={20}
                      fill={task.isCritical ? '#ef4444' : '#3b82f6'}
                      rx={4}
                    />
                  )}
                  
                  {/* Task name */}
                  <text
                    x={startX + 4}
                    y={y + 14}
                    fontSize="11"
                    fill="#1f2937"
                  >
                    {task.name}
                  </text>
                </g>
              );
            })}

            {/* Task Links */}
            {links.map(link => {
              const sourceTask = tasks.find(t => t.id === link.sourceTaskId);
              const targetTask = tasks.find(t => t.id === link.targetTaskId);
              
              if (!sourceTask || !targetTask) return null;

              const sourceIndex = tasks.findIndex(t => t.id === sourceTask.id);
              const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
              
              const sourceX = dateToPixel(sourceTask.endDate);
              const sourceY = headerHeight + sourceIndex * rowHeight + rowHeight / 2;
              const targetX = dateToPixel(targetTask.startDate);
              const targetY = headerHeight + targetIndex * rowHeight + rowHeight / 2;

              return (
                <g key={link.id}>
                  <line
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    stroke="#6b7280"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart; 