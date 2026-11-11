import { useStore } from './lib/storeContext';
import { Layout } from './components/Layout';
import { Today } from './pages/Today';
import { Week } from './pages/Week';
import { Classes } from './pages/Classes';
import { Connections } from './pages/Connections';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';

export default function App() {
  const { settings, page } = useStore();
  if (!settings.onboarded) return <Onboarding />;

  return (
    <Layout>
      <div key={page} className="animate-fade-up">
        {page === 'today' && <Today />}
        {page === 'week' && <Week />}
        {page === 'classes' && <Classes />}
        {page === 'connections' && <Connections />}
        {page === 'settings' && <Settings />}
      </div>
    </Layout>
  );
}
