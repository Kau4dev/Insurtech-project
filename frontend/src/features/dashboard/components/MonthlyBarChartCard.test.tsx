import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Sinistro } from "../../../interfaces/sinistros/sinistro";
import { MonthlyBarChartCard } from "./MonthlyBarChartCard";

const sinistrosMock: Sinistro[] = [
  {
    id: "s1",
    numeroSinistro: "SIN-001",
    apoliceId: "ap1",
    seguradoId: "seg1",
    status: "REGISTRADO",
    tipoSinistro: "COLISAO",
    descricao: "Colisão leve",
    dataOcorrencia: "2026-03-15T10:00:00Z",
    valorEstimado: 5000,
  },
  {
    id: "s2",
    numeroSinistro: "SIN-002",
    apoliceId: "ap2",
    seguradoId: "seg2",
    status: "EM_ANALISE",
    tipoSinistro: "ROUBO_FURTO",
    descricao: "Furto noturno",
    dataOcorrencia: "2026-03-20T14:00:00Z",
    valorEstimado: 12000,
  },
  {
    id: "s3",
    numeroSinistro: "SIN-003",
    apoliceId: "ap3",
    seguradoId: "seg3",
    status: "APROVADO",
    tipoSinistro: "INCENDIO",
    descricao: "Incêndio parcial",
    dataOcorrencia: "2026-05-10T08:00:00Z",
    valorEstimado: 25000,
  },
];

describe("MonthlyBarChartCard", () => {
  it("deve renderizar o título e controles de navegação do carrossel", () => {
    render(<MonthlyBarChartCard sinistros={sinistrosMock} />);

    expect(screen.getByText("Sinistros por mês")).toBeInTheDocument();
    expect(screen.getByText("1º Sem")).toBeInTheDocument();
    expect(screen.getByText("2º Sem")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("deve permitir alternar entre 1º e 2º semestre", () => {
    render(<MonthlyBarChartCard sinistros={sinistrosMock} />);

    const btn1Sem = screen.getByText("1º Sem");
    const btn2Sem = screen.getByText("2º Sem");

    fireEvent.click(btn1Sem);
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Fev")).toBeInTheDocument();
    expect(screen.getByText("Mar")).toBeInTheDocument();
    expect(screen.getByText("Jun")).toBeInTheDocument();

    fireEvent.click(btn2Sem);
    expect(screen.getByText("Jul")).toBeInTheDocument();
    expect(screen.getByText("Ago")).toBeInTheDocument();
    expect(screen.getByText("Dez")).toBeInTheDocument();
  });

  it("deve navegar pelos botões de setas anterior e próximo", () => {
    render(<MonthlyBarChartCard sinistros={sinistrosMock} />);

    const prevButton = screen.getByTitle("Período anterior");
    const nextButton = screen.getByTitle("Próximo período");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(prevButton);
    fireEvent.click(nextButton);
  });
});
