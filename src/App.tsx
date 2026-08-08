import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Meridian } from './pages/Meridian';
import { RouterProvider, useRouter } from './router';
import { getSite } from './site';

function LabRoutes() {
  const { path } = useRouter();
  if (path === '/shop' || path === '/shop/') return <Shop />;
  return <Home />;
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
