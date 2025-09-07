import type { ProjectStatus } from '../types/projects';

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) {
    return 'Not set';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) {
    return 'Not set';
  }

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

export function getStatusColor(status: ProjectStatus): string {
  const statusColors = {
    planned: 'bg-blue-100 text-blue-800 border-blue-200',
    'in-progress': 'bg-green-100 text-green-800 border-green-200',
    'on-hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}
