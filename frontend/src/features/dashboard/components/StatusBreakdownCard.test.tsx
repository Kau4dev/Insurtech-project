import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { StatusBreakdownCard } from "./StatusBreakdownCard";

describe("StatusBreakdownCard", () => {
  it("deve renderizar o título, link de navegação e os status", () => {
    const contagemMock = {
      REGISTRADO: 5,
      EM_ANALISE: 3,
      AGUARDANDO_DOCUMENTOS: 2,
      APROVADO: 10,
      PAGO: 8,
      REJEITADO: 1,
    };

    render(
      <MemoryRouter>
        <StatusBreakdownCard contagemPorStatus={contagemMock} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Saldos por status")).toBeInTheDocument();
    expect(screen.getByText("abrir lista")).toBeInTheDocument();
    expect(screen.getByText("Registrado")).toBeInTheDocument();
    expect(screen.getByText("Em análise")).toBeInTheDocument();
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("Rejeitado")).toBeInTheDocument();
  });

  it("deve renderizar placeholders animados durante isLoading", () => {
    const { container } = render(
      <MemoryRouter>
        <StatusBreakdownCard isLoading={true} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Saldos por status")).toBeInTheDocument();
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBeGreaterThan(0);
  });
});
