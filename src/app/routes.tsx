import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Join } from "./pages/Join";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Documents } from "./pages/Documents";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/join",
    Component: Join,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/documents",
    Component: Documents,
  },
]);
