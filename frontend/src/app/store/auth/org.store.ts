import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface OrgState {
  currentOrgId: string | null;
  orgs: Organization[];
  setOrg: (id: string) => void;
  setOrgs: (orgs: Organization[]) => void;
  getCurrentOrg: () => Organization | null;
}

// Mock organizations for development
const mockOrgs: Organization[] = [
  { id: 'org-1', name: 'ConstructBMS', slug: 'constructbms', logo: undefined },
  {
    id: 'org-2',
    name: 'Demo Construction',
    slug: 'demo-construction',
    logo: undefined,
  },
  {
    id: 'org-3',
    name: 'Test Builders',
    slug: 'test-builders',
    logo: undefined,
  },
];

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      currentOrgId: 'org-1',
      orgs: mockOrgs,
      setOrg: (id: string) => set({ currentOrgId: id }),
      setOrgs: (orgs: Organization[]) => set({ orgs }),
      getCurrentOrg: () => {
        const { currentOrgId, orgs } = get();
        return orgs.find(org => org.id === currentOrgId) || null;
      },
    }),
    {
      name: 'org-storage',
      partialize: state => ({
        currentOrgId: state.currentOrgId,
        orgs: state.orgs,
      }),
    }
  )
);
