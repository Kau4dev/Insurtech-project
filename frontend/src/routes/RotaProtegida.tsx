import React from 'react';
import type { PapelUsuario } from '../interfaces/enums';

interface RotaProtegidaProps {
    children: React.ReactNode;
    papeisPermitidos?: PapelUsuario[];
}

export const RotaProtegida: React.FC<RotaProtegidaProps> = ({ children }) => {
    // ponytail: auth bypass para dev visual — reativar antes de ir pra prod
    return <>{children}</>;
}
