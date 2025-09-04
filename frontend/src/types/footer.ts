export interface FooterWidget {
  id: string;
  type: 'text' | 'html' | 'list' | 'contact' | 'gallery' | 'social';
  title: string;
  content: string;
  config?: Record<string, unknown>;
  formatting?: {
    widgetAlign?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  };
}

export interface FooterConfig {
  columns: 2 | 3 | 4;
  widgets: FooterWidget[];
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  padding: string;
  showCopyright: boolean;
  copyrightText: string;
  globalFormatting?: {
    widgetAlign?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  };
}
