import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { MinhasApolicesCard } from "./MinhasApolicesCard";
import type { Apolice } from "../../../interfaces/apolices/apolice";

describe("MinhasApolicesCard", () => {
  const apoliceAtiva: Apolice = {
    id: "apolice-1",
    seguradoId: "seg-1",
    numeroApolice: "APO-2026-001",
    tipoSeguro: "AUTO",
    valorSeguro: 50000,
    valorPremio: 1500,
    dataInicioVigencia: "2026-01-01T00:00:00",
    dataFimVigencia: "2027-01-01T00:00:00",
    status: "ATIVA",
  };

  it("deve renderizar dados da apólice ativa com botão habilitado", () => {
    render(
      <MemoryRouter>
        <MinhasApolicesCard apolice={apoliceAtiva} />
      </MemoryRouter>
    );

    expect(screen.getByText("Apólice #APO-2026-001")).toBeInTheDocument();
    expect(screen.getByText("AUTO")).toBeInTheDocument();
    expect(screen.getByText("ATIVA")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Acionar Seguro/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar apólice inativa com botão desabilitado", () => {
    const apoliceInativa: Apolice = {
      ...apoliceAtiva,
      id: "apolice-2",
      status: "CANCELADA",
    };

    render(
      <MemoryRouter>
        <MinhasApolicesCard apolice={apoliceInativa} />
      </MemoryRouter>
    );

    expect(screen.getByText("CANCELADA")).toBeInTheDocument();
    const botao = screen.getByRole("button", { name: /Apólice Inativa/i });
    expect(botao).toBeDisabled();
  });
});

