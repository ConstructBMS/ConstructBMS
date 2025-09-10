import { useFooterStore } from '../../app/store/ui/footer.store';
import Footer from '../Footer';

export default function LayoutFooter() {
  const { config } = useFooterStore();

  return <Footer config={config} />;
}
