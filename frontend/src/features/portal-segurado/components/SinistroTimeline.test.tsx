import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SinistroTimeline } from "./SinistroTimeline";

describe("SinistroTimeline", () => {
  it("deve renderizar etapas da timeline para status REGISTRADO", () => {
    render(<SinistroTimeline statusAtual="REGISTRADO" />);

    expect(screen.getByText("Registrado")).toBeInTheDocument();
    expect(screen.getByText("Em Análise")).toBeInTheDocument();
    expect(screen.getByText("Pendente de Documentos")).toBeInTheDocument();
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
    expect(screen.getByText("Pago / Liquidado")).toBeInTheDocument();
  });

  it("deve renderizar mensagem de rejeição quando status for REJEITADO", () => {
    render(
      <SinistroTimeline
        statusAtual="REJEITADO"
        motivoRejeicao="Danos preexistentes"
      />
    );

    expect(screen.getByText(/Sinistro Rejeitado/i)).toBeInTheDocument();
    expect(screen.getByText(/Danos preexistentes/i)).toBeInTheDocument();
  });
});

