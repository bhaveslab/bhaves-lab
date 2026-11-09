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
const LibraryDelivery = lazy(() =>
  import("./pages/LibraryDelivery").then((module) => ({ default: module.LibraryDelivery })),
);
const LilEgo = lazy(() =>
  import("./pages/LilEgo").then((module) => ({ default: module.LilEgo })),
);
const PossibilitySessions = lazy(() =>
  import("./pages/PossibilitySessions").then((module) => ({ default: module.PossibilitySessions })),
);
const ResearchConfirmation = lazy(() =>
  import("./pages/ResearchConfirmation").then((module) => ({ default: module.ResearchConfirmation })),
);
function LabRoutes() {
  const { path } = useRouter();
  if (path === "/lil-ego" || path === "/lil-ego/") return <LilEgo />;
  if (path === "/library/delivery" || path === "/library/delivery/") return <LibraryDelivery />;
  if (path === "/research/thank-you" || path === "/research/thank-you/") return <ResearchConfirmation />;
  if (path === "/library" || path === "/library/") return <Library />;
  if (path === "/sessions" || path === "/sessions/") return <PossibilitySessions />;
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
