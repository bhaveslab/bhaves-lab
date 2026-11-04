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
const Confirmation = lazy(() =>
  import("./pages/Shop/Confirmation").then((module) => ({
    default: module.Confirmation,
  })),
);

const ClarityAccess = lazy(() =>
  import("./pages/ClarityAccess").then((module) => ({
    default: module.ClarityAccess,
  })),
);

function LabRoutes() {
  const { path } = useRouter();
  if (path === "/room-of-clarity" || path === "/room-of-clarity/")
    return <ClarityAccess />;
  if (path === "/shop/confirmation" || path === "/shop/confirmation/")
    return <Confirmation />;
  return <Home shopPage={path === "/shop" || path === "/shop/"} />;
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
