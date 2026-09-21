import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ApolicesListPage } from "../pages/ApolicesListPage";
import { LoginPage } from "../pages/LoginPage";
import { SeguradosListPage } from "../pages/SeguradosListPage";
import { SinistrosListPage } from "../pages/SinistrosListPage";
import { DashboardPage } from "../pages/DashboardPage";
import { RotaProtegida } from "./RotaProtegida";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <RotaProtegida>
        <AppLayout />
      </RotaProtegida>
    ),
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/segurados",
        element: <SeguradosListPage />,
      },
      {
        path: "/apolices",
        element: <ApolicesListPage />,
      },
      {
        path: "/sinistros",
        element: <SinistrosListPage />,
      },
    ],
  },
  {
    path: "*",
    element: <div className="p-8 text-(--fg)">Página não encontrada</div>,
  },
]);
