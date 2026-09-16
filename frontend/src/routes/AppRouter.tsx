import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ApolicesListPage } from "../pages/ApolicesListPage";
import { LoginPage } from "../pages/LoginPage";
import { SeguradosListPage } from "../pages/SeguradosListPage";
import { SinistrosListPage } from "../pages/SinistrosListPage";
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
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-(--fg)">Dashboard</h1>
            <p className="mt-2 text-(--muted)">Bem-vindo ao InsurTech.</p>
          </div>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-(--fg)">Dashboard</h1>
            <p className="mt-2 text-(--muted)">Bem-vindo ao InsurTech.</p>
          </div>
        ),
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
