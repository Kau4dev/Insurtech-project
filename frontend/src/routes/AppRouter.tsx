import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ApolicesListPage } from "../pages/ApolicesListPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { SeguradosListPage } from "../pages/SeguradosListPage";
import { SinistroDocumentosPage } from "../pages/SinistroDocumentosPage";
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
      {
        path: "/sinistros/:id/documentos",
        element: <SinistroDocumentosPage />,
      },
      {
        path: "*",
        element: (
          <div className="p-8 w-full h-full flex items-center justify-center text-(--fg) font-medium">
            <h1 className="font-mono text-3xl uppercase text-(--accent-ink) font-semibold">
              Página não encontrada!
            </h1>
          </div>
        ),
      },
    ],
  },
]);
