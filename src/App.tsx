import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Confirmation } from './pages/Shop/Confirmation';
import { RouterProvider, useRouter } from './router';

function Routes() {
  const { path } = useRouter();
  if (path === '/shop/confirmation' || path === '/shop/confirmation/') return <Confirmation />;
  if (path === '/shop' || path === '/shop/') return <Shop />;
  return <Home />;
}

function App() {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  );
}

export default App;
