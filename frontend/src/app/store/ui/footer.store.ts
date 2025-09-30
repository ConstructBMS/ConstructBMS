import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FooterConfig } from '../../types/footer';

interface FooterState {
  config: FooterConfig;
  setConfig: (config: FooterConfig) => void;
  updateConfig: (updates: Partial<FooterConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: FooterConfig = {
  columns: 3,
  widgets: [
    {
      id: '1',
      type: 'text',
      title: 'About Us',
      content:
        'ConstructBMS is a comprehensive construction business management system designed to streamline your operations and boost productivity.',
      formatting: {
        widgetAlign: 'center',
        headerAlign: 'center',
        textAlign: 'center',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'relaxed',
      },
    },
    {
      id: '2',
      type: 'contact',
      title: 'Contact Info',
      content: '',
      config: {
        address: '123 Construction Ave, Building City, BC 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@constructbms.com',
      },
      formatting: {
        widgetAlign: 'center',
        headerAlign: 'center',
        textAlign: 'center',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
      },
    },
    {
      id: '3',
      type: 'list',
      title: 'Quick Links',
      content: '',
      config: {
        pages: [
          { title: 'Help Center', url: '/help' },
          { title: 'Terms & Conditions', url: '/terms' },
          { title: 'Privacy Policy', url: '/privacy' },
          { title: 'Support', url: '/support' },
        ],
      },
      formatting: {
        widgetAlign: 'center',
        headerAlign: 'center',
        textAlign: 'center',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
      },
    },
  ],
  backgroundColor: '#1f2937',
  textColor: '#f9fafb',
  accentColor: '#3b82f6',
  padding: '3rem 1rem',
  showCopyright: true,
  copyrightText: '© 2024 ConstructBMS. All rights reserved.',
  globalFormatting: {
    widgetAlign: 'center',
    headerAlign: 'center',
    textAlign: 'center',
    fontSize: 'sm',
    fontWeight: 'normal',
    lineHeight: 'normal',
  },
};

export const useFooterStore = create<FooterState>()(
  persist(
    set => ({
      config: defaultConfig,
      setConfig: config => set({ config }),
      updateConfig: updates =>
        set(state => ({
          config: { ...state.config, ...updates },
        })),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'footer-storage',
      partialize: state => ({ config: state.config }),
    }
  )
);
