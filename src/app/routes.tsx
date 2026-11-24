import { createBrowserRouter, Outlet, useLocation } from "react-router";
import { MotionRoot } from "./components/Motion";
import { ScrollToHash } from "./components/ScrollToHash";
import { Terms, Privacy, Refunds } from "./pages/Legal";
import { CompleteProfile } from "./pages/CompleteProfile";
import { Saved } from "./pages/Saved";
import { NotFound } from "./pages/NotFound";
import { Landing } from "./pages/Landing";
import { DriveToOwn } from "./pages/DriveToOwn";
import { Join } from "./pages/Join";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Documents } from "./pages/Documents";
import { Vehicles } from "./pages/Vehicles";
import { VehicleDetail } from "./pages/VehicleDetail";
import { VehicleForm } from "./pages/VehicleForm";
import { Notifications } from "./pages/Notifications";
import { Forgot } from "./pages/Forgot";
import { Admin } from "./pages/Admin";
import { RequireAuth } from "./components/Common";

function Root() {
  const { pathname } = useLocation();
  return (
    <>
      <ScrollToHash />
      <MotionRoot />
      {/* Re-keyed on every route so each page arrives with a soft fade-up */}
      <div key={pathname} className="page-enter"><Outlet /></div>
    </>
  );
}

export const router = createBrowserRouter([{ path: "/", Component: Root, children: [
  { index: true, Component: Landing },
  { path: "drive-to-own", Component: DriveToOwn },
  { path: "join", Component: Join },
  { path: "login", Component: Login },
  { path: "vehicles", Component: Vehicles },
  { path: "vehicles/new", element: <RequireAuth role="owner"><VehicleForm /></RequireAuth> },
  { path: "vehicles/:id", Component: VehicleDetail },
  { path: "vehicles/:id/edit", element: <RequireAuth role="owner"><VehicleForm /></RequireAuth> },
  { path: "dashboard", element: <RequireAuth><Dashboard /></RequireAuth> },
  { path: "documents", element: <RequireAuth><Documents /></RequireAuth> },
  { path: "forgot", Component: Forgot },
  { path: "notifications", element: <RequireAuth><Notifications /></RequireAuth> },
  { path: "admin", element: <RequireAuth><Admin /></RequireAuth> },
  { path: "terms", Component: Terms },
  { path: "privacy", Component: Privacy },
  { path: "refunds", Component: Refunds },
  { path: "complete-profile", element: <RequireAuth><CompleteProfile /></RequireAuth> },
  { path: "saved", Component: Saved },
  { path: "*", Component: NotFound },
]}]);
