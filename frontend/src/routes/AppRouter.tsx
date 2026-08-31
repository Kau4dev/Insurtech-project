import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { SeguradosListPage } from "../pages/SeguradosListPage";
import { RotaProtegida } from "./RotaProtegida";
import { AppLayout } from "../components/layout/AppLayout";

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
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-[600] text-(--fg)">Dashboard</h1>
            <p className="mt-2 text-(--muted)">Bem-vindo ao InsurTech.</p>
          </div>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-[600] text-(--fg)">Dashboard</h1>
            <p className="mt-2 text-(--muted)">Bem-vindo ao InsurTech.</p>
          </div>
        ),
      },
      {
        path: "/segurados",
        element: <SeguradosListPage />,
      },
    ],
  },
  {
    path: "*",
    element: <div className="p-8 text-(--fg)">Página não encontrada</div>,
  },
]);