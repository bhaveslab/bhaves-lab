import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Meridian } from './pages/Meridian';
import { MeridianSystemPrototype, MeridianSystemsIndex, type MeridianSystemKind } from './pages/MeridianSystems';
import { Confirmation } from './pages/Shop/Confirmation';
import { RouterProvider, useRouter } from './router';
import { getSite } from './site';

function LabRoutes() {
  const { path } = useRouter();
  if (path === '/shop/confirmation' || path === '/shop/confirmation/') return <Confirmation />;
  if (path === '/shop' || path === '/shop/') return <Shop />;
  return <Home />;
}

function MeridianRoutes() {
  const { path } = useRouter();
  const normalized = path.replace(/\/$/, '') || '/';
  if (normalized === '/systems') return <MeridianSystemsIndex />;
  const match = normalized.match(/^\/systems\/(restaurant|transport|cleaning|tours)$/);
  if (match) return <MeridianSystemPrototype kind={match[1] as MeridianSystemKind} />;
  return <Meridian />;
}

function Routes() {
  const site = getSite();
  if (site === 'meridian') return <MeridianRoutes />;
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
