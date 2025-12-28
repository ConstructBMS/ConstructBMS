import { EstimatesPage } from './pages/EstimatesPage';
import { EstimateDetailPage } from './pages/EstimateDetailPage';

export const estimatingRoutes = [
  { path: '/', element: <EstimatesPage /> },
  { path: '/estimating/:estimateId', element: <EstimateDetailPage /> },
];

