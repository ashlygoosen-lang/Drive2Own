import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Join } from "./pages/Join";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Documents } from "./pages/Documents";
import { Vehicles } from "./pages/Vehicles";
import { VehicleDetail } from "./pages/VehicleDetail";
import { VehicleForm } from "./pages/VehicleForm";
import { RequireAuth } from "./components/Common";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/join", Component: Join },
  { path: "/login", Component: Login },
  { path: "/vehicles", Component: Vehicles },
  { path: "/vehicles/new", element: <RequireAuth role="owner"><VehicleForm /></RequireAuth> },
  { path: "/vehicles/:id", Component: VehicleDetail },
  { path: "/vehicles/:id/edit", element: <RequireAuth role="owner"><VehicleForm /></RequireAuth> },
  { path: "/dashboard", element: <RequireAuth><Dashboard /></RequireAuth> },
  { path: "/documents", element: <RequireAuth><Documents /></RequireAuth> },
  { path: "*", Component: Landing },
]);
