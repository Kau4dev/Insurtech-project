import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import {
  PortalLayout,
  PortalDashboardPage,
  PortalApolicesPage,
  PortalNovoSinistroPage,
  PortalSinistroDetailPage,
  PortalLoginPage,
} from "../features/portal-segurado";
import { ApolicesListPage } from "../pages/ApolicesListPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { SeguradosListPage } from "../pages/SeguradosListPage";
import { SinistroDocumentosPage } from "../pages/SinistroDocumentosPage";
import { SinistrosListPage } from "../pages/SinistrosListPage";
import { UsuariosListPage } from "../pages/UsuariosListPage";
import { RotaProtegida } from "./RotaProtegida";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/portal/login",
    element: <PortalLoginPage />,
  },
  {
    path: "/login-segurado",
    element: <PortalLoginPage />,
  },

  {
    path: "/portal",
    element: (
      <RotaProtegida papeisPermitidos={["SEGURADO"]}>
        <PortalLayout />
      </RotaProtegida>
    ),
    children: [
      {
        index: true,
        element: <PortalDashboardPage />,
      },
      {
        path: "apolices",
        element: <PortalApolicesPage />,
      },
      {
        path: "sinistros/novo",
        element: <PortalNovoSinistroPage />,
      },
      {
        path: "sinistros/:id",
        element: <PortalSinistroDetailPage />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <RotaProtegida papeisPermitidos={["ADMIN", "GESTOR", "ANALISTA"]}>
        <AppLayout />
      </RotaProtegida>
    ),
    children: [
      {
        index: true,
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
        path: "/usuarios",
        element: (
          <RotaProtegida papeisPermitidos={["ADMIN", "GESTOR"]}>
            <UsuariosListPage />
          </RotaProtegida>
        ),
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
