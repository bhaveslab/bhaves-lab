import { lazy, Suspense } from "react";
import { Home } from "./pages/Home";
const Meridian = lazy(() =>
  import("./pages/Meridian").then((module) => ({ default: module.Meridian })),
);
const Confirmation = lazy(() =>
  import("./pages/Shop/Confirmation").then((module) => ({
    default: module.Confirmation,
  })),
);
import { RouterProvider, useRouter } from "./router";
import { getSite, applySiteChrome } from "./site";

// Runs once, synchronously, before React renders anything below — see the
// comment on applySiteChrome for why this can't be a useEffect here.
applySiteChrome();

function LabRoutes() {
  const { path } = useRouter();
  if (path === "/shop/confirmation" || path === "/shop/confirmation/")
    return <Confirmation />;
  return <Home />;
}

function Routes() {
  const site = getSite();
  if (site === "meridian") return <Meridian />;
  return <LabRoutes />;
}

function App() {
  return (
    <RouterProvider>
      <Suspense
        fallback={
          <p role="status" style={{ color: "#ecf5f1", padding: 32 }}>
            Loading…
          </p>
        }
      >
        <Routes />
      </Suspense>
    </RouterProvider>
  );
}

export default App;
