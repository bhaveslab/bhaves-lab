import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { RouterProvider, useRouter } from './router';

function Routes() {
  const { path } = useRouter();
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
