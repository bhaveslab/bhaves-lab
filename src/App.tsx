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
const LilEgo = lazy(() =>
  import("./pages/LilEgo").then((module) => ({ default: module.LilEgo })),
);
const PossibilitySessions = lazy(() =>
  import("./pages/PossibilitySessions").then((module) => ({ default: module.PossibilitySessions })),
);
const ResearchConfirmation = lazy(() =>
  import("./pages/ResearchConfirmation").then((module) => ({ default: module.ResearchConfirmation })),
);
const ContactCard = lazy(() =>
  import("./pages/ContactCard").then((module) => ({ default: module.ContactCard })),
);
function LabRoutes() {
  const { path } = useRouter();
  if (path === "/lil-ego" || path === "/lil-ego/") return <LilEgo />;
  if (path === "/research/thank-you" || path === "/research/thank-you/") return <ResearchConfirmation />;
  if (path === "/sessions" || path === "/sessions/") return <PossibilitySessions />;
  if (path === "/contact" || path === "/contact/") return <ContactCard />;
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
