import { createContext } from 'react';

export const OrganizationContext = createContext<{
  organization: any;
  setOrganization: (user: any) => void;
}>({
  organization: undefined,
  setOrganization: (_) => _,
});
