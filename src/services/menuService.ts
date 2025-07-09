import { supabase } from './supabase';
import { MenuItem } from '../types/menu';

class MenuService {
  private static instance: MenuService;
  private menuItems: MenuItem[] = [];
  private listeners: ((menuItems: MenuItem[]) => void)[] = [];

  static getInstance(): MenuService {
    if (!MenuService.instance) {
      MenuService.instance = new MenuService();
    }
    return MenuService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadMenuItems();
      this.setupRealtimeSubscription();
    } catch (error) {
      console.error('Failed to initialize menu service:', error);
      this.loadDemoData();
    }
  }

  private async loadMenuItems(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error loading menu items:', error);
        throw error;
      }

      this.menuItems = data || [];
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load menu items from database:', error);
      throw error;
    }
  }

  private loadDemoData(): void {
    this.menuItems = [
      {
        id: '1',
        name: 'Dashboard',
        icon: 'HomeIcon',
        path: '/dashboard',
        orderIndex: 0,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Projects',
        icon: 'FolderIcon',
        path: '/projects',
        orderIndex: 1,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Tasks',
        icon: 'CheckCircleIcon',
        path: '/tasks',
        orderIndex: 2,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Customers',
        icon: 'UsersIcon',
        path: '/customers',
        orderIndex: 3,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'Sales',
        icon: 'CurrencyDollarIcon',
        path: '/sales',
        orderIndex: 4,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        name: 'Documents',
        icon: 'DocumentIcon',
        path: '/documents',
        orderIndex: 5,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7',
        name: 'Chat',
        icon: 'ChatBubbleLeftRightIcon',
        path: '/chat',
        orderIndex: 6,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '8',
        name: 'Settings',
        icon: 'Cog6ToothIcon',
        path: '/settings',
        orderIndex: 7,
        isActive: true,
        requiredPermissions: [],
        parentId: null,
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.notifyListeners();
  }

  private setupRealtimeSubscription(): void {
    supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
        },
        payload => {
          console.log('Menu item change:', payload);
          this.loadMenuItems();
        }
      )
      .subscribe();
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return this.menuItems;
  }

  async createMenuItem(
    menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: menuItem.name,
          icon: menuItem.icon,
          path: menuItem.path,
          order_index: menuItem.orderIndex,
          is_active: menuItem.isActive,
          required_permissions: menuItem.requiredPermissions,
          parent_id: menuItem.parentId,
          organization_id: menuItem.organizationId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating menu item:', error);
        throw error;
      }

      // Menu item will be loaded via realtime subscription
    } catch (error) {
      console.error('Failed to create menu item:', error);
      // Fallback to local storage
      const newMenuItem: MenuItem = {
        ...menuItem,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.menuItems.push(newMenuItem);
      this.notifyListeners();
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.path !== undefined) updateData.path = updates.path;
      if (updates.orderIndex !== undefined)
        updateData.order_index = updates.orderIndex;
      if (updates.isActive !== undefined)
        updateData.is_active = updates.isActive;
      if (updates.requiredPermissions !== undefined)
        updateData.required_permissions = updates.requiredPermissions;
      if (updates.parentId !== undefined)
        updateData.parent_id = updates.parentId;
      if (updates.organizationId !== undefined)
        updateData.organization_id = updates.organizationId;

      const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating menu item:', error);
        throw error;
      }

      // Update will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to update menu item:', error);
      // Fallback to local update
      const index = this.menuItems.findIndex(item => item.id === id);
      if (index !== -1) {
        this.menuItems[index] = {
          ...this.menuItems[index],
          ...updates,
          updatedAt: new Date(),
        };
        this.notifyListeners();
      }
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);

      if (error) {
        console.error('Error deleting menu item:', error);
        throw error;
      }

      // Deletion will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      // Fallback to local deletion
      this.menuItems = this.menuItems.filter(item => item.id !== id);
      this.notifyListeners();
    }
  }

  async reorderMenuItems(orderedIds: string[]): Promise<void> {
    try {
      // Update order for each menu item
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from('menu_items')
          .update({ order_index: i })
          .eq('id', orderedIds[i]);

        if (error) {
          console.error('Error reordering menu items:', error);
          throw error;
        }
      }

      // Reordering will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to reorder menu items:', error);
      // Fallback to local reordering
      const newOrder: MenuItem[] = [];
      orderedIds.forEach(id => {
        const item = this.menuItems.find(item => item.id === id);
        if (item) {
          newOrder.push({
            ...item,
            orderIndex: newOrder.length,
            updatedAt: new Date(),
          });
        }
      });
      this.menuItems = newOrder;
      this.notifyListeners();
    }
  }

  subscribe(listener: (menuItems: MenuItem[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.menuItems);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.menuItems));
  }

  getMenuItemsByParent(parentId: string | null): MenuItem[] {
    return this.menuItems.filter(item => item.parentId === parentId);
  }

  getActiveMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.isActive);
  }

  getMenuItemsByPermission(permissions: string[]): MenuItem[] {
    return this.menuItems.filter(item => {
      if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
        return true;
      }
      return item.requiredPermissions.some(permission =>
        permissions.includes(permission)
      );
    });
  }
}

export const menuService = MenuService.getInstance();
