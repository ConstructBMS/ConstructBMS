// UI-related type definitions
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export interface DragEvent {
  startPosition: Position;
  currentPosition: Position;
  deltaPosition: Position;
  isDragging: boolean;
}

export interface GridSettings {
  enabled: boolean;
  size: number;
  snapThreshold: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  position: Position;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

export interface ResponsiveValue<T> {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  large?: T;
  default: T;
}
