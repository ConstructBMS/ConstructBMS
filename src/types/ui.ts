// UI-related type definitions
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  height: number;
  width: number;
}

export interface Bounds extends Position, Size {}

export interface DragEvent {
  currentPosition: Position;
  deltaPosition: Position;
  isDragging: boolean;
  startPosition: Position;
}

export interface GridSettings {
  enabled: boolean;
  size: number;
  snapThreshold: number;
}

export interface ModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface Note {
  color: string;
  content: string;
  createdAt: Date;
  id: string;
  position: Position;
  title: string;
  updatedAt: Date;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

export interface ResponsiveValue<T> {
  default: T;
  desktop?: T;
  large?: T;
  mobile?: T;
  tablet?: T;
}
