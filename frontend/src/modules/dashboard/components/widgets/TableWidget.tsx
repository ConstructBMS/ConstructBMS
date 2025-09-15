import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DashboardWidget } from '../../store';

interface TableWidgetProps {
  widget: DashboardWidget;
}

interface TableData {
  columns: string[];
  rows: (string | number)[][];
}

export function TableWidget({ widget }: TableWidgetProps) {
  const tableData = widget.data as TableData;
  
  if (!tableData || !tableData.columns || !tableData.rows) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No table data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {tableData.columns.map((column, index) => (
                  <th key={index} className="text-left py-2 px-3 font-medium text-muted-foreground">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-b-0 hover:bg-muted/50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-2 px-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
