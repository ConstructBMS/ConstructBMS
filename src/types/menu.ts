export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  type?: 'parent' | 'child';
  visible?: boolean;
  order: number;
  parentId?: string | null;
  moduleKey?: string;
  children?: MenuItem[];
  badge?: string | number;
}
