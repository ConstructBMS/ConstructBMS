// Simple icon system - returns text representations for now
export const getIconStrict = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    plus: '+',
    save: '💾',
    user: '👤',
    users: '👥',
    settings: '⚙️',
    shield: '🛡️',
    bell: '🔔',
    database: '🗄️',
    edit: '✏️',
    delete: '🗑️',
    close: '✕',
    check: '✓',
    warning: '⚠️',
    info: 'ℹ️',
    error: '❌',
    success: '✅',
    // Footer icons
    location: '📍',
    phone: '📞',
    email: '✉️',
    text: '📝',
    code: '💻',
    list: '📋',
    contact: '📞',
    gallery: '🖼️',
    social: '🌐',
    // Social media icons
    facebook: '📘',
    twitter: '🐦',
    instagram: '📷',
    linkedin: '💼',
    youtube: '📺',
    // Footer builder icons
    layout: '📐',
    eye: '👁️',
    // Formatting icons
    alignLeft: '⬅️',
    alignCenter: '↔️',
    alignRight: '➡️',
    alignJustify: '↔️',
    fontSize: '🔤',
    fontWeight: '📝',
    lineHeight: '📏',
  };

  return iconMap[iconName] || '•';
};
