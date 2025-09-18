import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { useScrollbar } from '../../../../hooks/useScrollbar';
import { DashboardWidget } from '../../store';

interface TableWidgetProps {
  widget: DashboardWidget;
}

interface TableData {
  columns: string[];
  rows: (string | number)[][];
  statusColors?: Record<string, string>;
  profitColors?: Record<string, string>;
}

export function TableWidget({ widget }: TableWidgetProps) {
  const tableData = widget.data as TableData;
  const scrollbarRef = useScrollbar();

  if (!tableData || !tableData.columns || !tableData.rows) {
    return (
      <Card className='h-full flex flex-col'>
        <CardHeader>
          <CardTitle className='text-lg'>{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className='flex-1 flex items-center justify-center'>
          <div className='text-muted-foreground'>
            <p>No table data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle className='text-lg'>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col overflow-hidden'>
        <div 
          ref={scrollbarRef}
          className='overflow-x-auto overflow-y-auto flex-1 scrollbar-accent scrollbar-fade'
        >
          <table className='w-full text-sm'>
            <thead className='sticky top-0 bg-background z-10'>
              <tr className='border-b'>
                {tableData.columns.map((column, index) => (
                  <th
                    key={index}
                    className='text-left py-2 px-3 font-medium text-muted-foreground'
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className='border-b last:border-b-0 hover:bg-muted/50'
                >
                  {row.map((cell, cellIndex) => {
                    const columnName = tableData.columns[cellIndex];
                    const cellValue = String(cell);

                    // Check if this is a status column
                    const isStatusColumn = columnName
                      ?.toLowerCase()
                      .includes('status');
                    const isProfitColumn =
                      columnName?.toLowerCase().includes('profit') ||
                      columnName?.toLowerCase().includes('margin');

                    let cellClassName = 'py-2 px-3';
                    let cellContent = cell;

                    if (
                      isStatusColumn &&
                      tableData.statusColors &&
                      tableData.statusColors[cellValue]
                    ) {
                      cellClassName += ` ${tableData.statusColors[cellValue]}`;
                      cellContent = (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${tableData.statusColors[cellValue]}`}
                        >
                          {cell}
                        </span>
                      );
                    } else if (isProfitColumn && tableData.profitColors) {
                      const isPositive = !cellValue.startsWith('-');
                      const colorClass = isPositive
                        ? tableData.profitColors.positive
                        : tableData.profitColors.negative;
                      cellClassName += ` ${colorClass}`;
                      cellContent = (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
                        >
                          {cell}
                        </span>
                      );
                    }

                    return (
                      <td key={cellIndex} className={cellClassName}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
