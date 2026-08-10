import { Building } from './pages/Building';
import { Shop } from './pages/Shop';
import { Meridian } from './pages/Meridian';
import { Confirmation } from './pages/Shop/Confirmation';
import { RouterProvider, useRouter } from './router';
import { getSite, applySiteChrome } from './site';

// Runs once, synchronously, before React renders anything below — see the
// comment on applySiteChrome for why this can't be a useEffect here.
applySiteChrome();

function LabRoutes() {
  const { path } = useRouter();
  if (path === '/shop/confirmation' || path === '/shop/confirmation/') return <Confirmation />;
  if (path === '/shop' || path === '/shop/') return <Shop />;
  return <Building />;
}

function Routes() {
  const site = getSite();
  if (site === 'meridian') return <Meridian />;
  return <LabRoutes />;
}

function App() {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  );
}

export default App;


