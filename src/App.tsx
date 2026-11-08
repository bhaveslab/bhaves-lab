import { lazy, Suspense } from "react";
import { Home } from "./pages/Home";
import { RouterProvider, useRouter } from "./router";
import { getSite, applySiteChrome } from "./site";

// Runs once, synchronously, before React renders anything below — see the
// comment on applySiteChrome for why this can't be a useEffect here.
applySiteChrome();

const Meridian = lazy(() =>
  import("./pages/Meridian").then((module) => ({ default: module.Meridian })),
);
// Booking and commercial routes remain outside the public bundle.
const Library = lazy(() =>
  import("./pages/Library").then((module) => ({ default: module.Library })),
);
function LabRoutes() {
  const { path } = useRouter();
  if (path === "/library" || path === "/library/") return <Library />;
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
      <Suspense fallback={<p role="status">Loading…</p>}>
        <Routes />
      </Suspense>
    </RouterProvider>
  );
}

export default App;
