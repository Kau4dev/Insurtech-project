import { createBrowserRouter } from "react-router-dom";
import { LoginPage} from "../pages/LoginPage";
import { RotaProtegida } from "./RotaProtegida";

const DashboardPlaceHolder = () => {
    return (
          <div className="p-8 bg-slate-900 text-white min-h-screen">
        <h1 className="text-3xl font-bold">Dashboard (Privado)</h1>
    </div>
    )
}

export const router = createBrowserRouter([

    {
        path: "/login",
        element: <LoginPage />
    },

    {
        element: <RotaProtegida/>,
        children: [
            {
                path: "/",
                element: <DashboardPlaceHolder />
            },
            {
                path:"/dashboard",
                element: <DashboardPlaceHolder />
            },
            
              // Você adicionará as outras telas aqui futuramente:
            // { path: "/segurados", element: <SeguradosPage /> }
        ]
    },

    {
        path:"*",
        element: <div className="p-8 text-white bg-slate-900 min-h-screen">Página não encontrada</div>,
    }

    
]);