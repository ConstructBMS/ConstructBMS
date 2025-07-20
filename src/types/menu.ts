export interface MenuItem {
  badge?: string | number;
  children?: MenuItem[];
  icon?: string;
  id: string;
  label: string;
  moduleKey?: string;
  order: number;
  parentId?: string | null;
  type?: 'parent' | 'child';
  visible?: boolean;
}
