import type { ReactNode } from 'react';

/**
 * Core type definitions for the ConstructBMS application
 */

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}
