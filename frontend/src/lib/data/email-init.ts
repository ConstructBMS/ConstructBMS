import { useEmailStore } from '../../app/store/email.store';
import { demoEmails } from './demo-emails';

export const initializeEmailStore = () => {
  const { setEmails } = useEmailStore.getState();
  setEmails(demoEmails);
};
