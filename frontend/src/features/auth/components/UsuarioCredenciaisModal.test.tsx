import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsuarioCredenciaisModal } from "./UsuarioCredenciaisModal";

describe("UsuarioCredenciaisModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não deve renderizar quando isOpen for false", () => {
    render(
      <UsuarioCredenciaisModal
        isOpen={false}
        onClose={vi.fn()}
        nome="Carlos Analista"
        email="carlos@insurtech.com"
        papel="ANALISTA"
        senhaPlana="SenhaForte@2026"
      />
    );

    expect(screen.queryByText(/Usuário Criado com Sucesso/i)).not.toBeInTheDocument();
  });

  it("deve renderizar dados de acesso corporativo quando isOpen for true", () => {
    render(
      <UsuarioCredenciaisModal
        isOpen={true}
        onClose={vi.fn()}
        nome="Carlos Analista"
        email="carlos@insurtech.com"
        papel="ANALISTA"
        senhaPlana="SenhaForte@2026"
      />
    );

    expect(screen.getByText("Usuário Criado com Sucesso")).toBeInTheDocument();
    expect(screen.getByText("Carlos Analista")).toBeInTheDocument();
    expect(screen.getByText("carlos@insurtech.com")).toBeInTheDocument();
    expect(screen.getByText("SenhaForte@2026")).toBeInTheDocument();
    expect(screen.getByText(/não poderá ser visualizada novamente/i)).toBeInTheDocument();
    expect(screen.getByText("Analista")).toBeInTheDocument();
  });

  it("deve alternar a visibilidade da senha ao clicar no botão de olho", () => {
    render(
      <UsuarioCredenciaisModal
        isOpen={true}
        onClose={vi.fn()}
        nome="Carlos Analista"
        email="carlos@insurtech.com"
        papel="ANALISTA"
        senhaPlana="SenhaForte@2026"
      />
    );

    expect(screen.getByText("SenhaForte@2026")).toBeInTheDocument();
    const toggleBtn = screen.getByRole("button", { name: /Ocultar senha/i });
    fireEvent.click(toggleBtn);

    expect(screen.queryByText("SenhaForte@2026")).not.toBeInTheDocument();
    expect(screen.getByText("••••••••••••")).toBeInTheDocument();

    const showBtn = screen.getByRole("button", { name: /Exibir senha/i });
    fireEvent.click(showBtn);
    expect(screen.getByText("SenhaForte@2026")).toBeInTheDocument();
  });

  it("deve copiar credenciais corporativas completas ao clicar no botão principal", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <UsuarioCredenciaisModal
        isOpen={true}
        onClose={vi.fn()}
        nome="Carlos Analista"
        email="carlos@insurtech.com"
        papel="ANALISTA"
        senhaPlana="SenhaForte@2026"
      />
    );

    const botaoCopiar = screen.getByRole("button", { name: /Copiar Dados de Acesso/i });
    fireEvent.click(botaoCopiar);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("SenhaForte@2026")
      );
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("carlos@insurtech.com")
      );
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("ANALISTA")
      );
    });

    expect(screen.getByText(/Copiado com Sucesso/i)).toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar em Fechar", () => {
    const handleClose = vi.fn();
    render(
      <UsuarioCredenciaisModal
        isOpen={true}
        onClose={handleClose}
        nome="Carlos Analista"
        email="carlos@insurtech.com"
        papel="ANALISTA"
        senhaPlana="SenhaForte@2026"
      />
    );

    const fecharBotoes = screen.getAllByRole("button", { name: /Fechar/i });
    fireEvent.click(fecharBotoes[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

