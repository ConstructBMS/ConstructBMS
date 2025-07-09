import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Plus, ChevronUp, ChevronDown } from 'lucide-react';

const demoEmployees = [
  {
    id: 1,
    name: 'John Smith',
    position: 'Project Manager',
    status: 'active',
    hireDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    position: 'Designer',
    status: 'active',
    hireDate: '2023-03-20',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    position: 'Developer',
    status: 'inactive',
    hireDate: '2022-11-10',
  },
];

const HR: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('hrStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('hrStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>HR</h1>
        <p className='text-gray-600'>
          Manage human resources and employee data
        </p>
      </div>
      {/* Stats Cards */}
      <div className='mt-4'>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          HR Metrics
        </button>
        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Users className='h-8 w-8 text-archer-neon mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Employees</p>
                <p className='text-2xl font-bold'>{demoEmployees.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Active</p>
                <p className='text-2xl font-bold'>
                  {demoEmployees.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Users className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Positions</p>
                <p className='text-2xl font-bold'>
                  {[...new Set(demoEmployees.map(e => e.position))].length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Employees</h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg text-sm font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Employee
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Name
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Position
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Hire Date
              </th>
            </tr>
          </thead>
          <tbody>
            {demoEmployees.map(employee => (
              <tr key={employee.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{employee.name}</td>
                <td className='px-4 py-2'>{employee.position}</td>
                <td className='px-4 py-2 capitalize'>{employee.status}</td>
                <td className='px-4 py-2'>{employee.hireDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HR;
