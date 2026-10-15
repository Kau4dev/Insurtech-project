import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CredenciaisModal } from "./CredenciaisModal";

describe("CredenciaisModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não deve renderizar quando isOpen for false", () => {
    render(
      <CredenciaisModal
        isOpen={false}
        onClose={vi.fn()}
        email="joao@email.com"
        senhaTemporaria="Temp@123456"
        nomeRazaoSocial="João Silva"
      />
    );

    expect(screen.queryByText(/Acesso Criado com Sucesso/i)).not.toBeInTheDocument();
  });

  it("deve renderizar dados de acesso e senha temporária quando isOpen for true", () => {
    render(
      <CredenciaisModal
        isOpen={true}
        onClose={vi.fn()}
        email="joao@email.com"
        senhaTemporaria="Temp@123456"
        nomeRazaoSocial="João Silva"
      />
    );

    expect(screen.getByText(/Acesso Criado com Sucesso/i)).toBeInTheDocument();
    expect(screen.getByText("joao@email.com")).toBeInTheDocument();
    expect(screen.getByText("Temp@123456")).toBeInTheDocument();
    expect(screen.getByText(/não poderá ser visualizada novamente/i)).toBeInTheDocument();
  });

  it("deve copiar credenciais para a área de transferência ao clicar no botão copiar", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <CredenciaisModal
        isOpen={true}
        onClose={vi.fn()}
        email="joao@email.com"
        senhaTemporaria="Temp@123456"
        nomeRazaoSocial="João Silva"
      />
    );

    const botaoCopiar = screen.getByRole("button", { name: /Copiar Dados de Acesso/i });
    fireEvent.click(botaoCopiar);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("Temp@123456")
      );
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining("joao@email.com")
      );
    });

    expect(screen.getByText(/Copiado com Sucesso/i)).toBeInTheDocument();
  });

  it("deve chamar onClose ao clicar em Fechar", () => {
    const handleClose = vi.fn();
    render(
      <CredenciaisModal
        isOpen={true}
        onClose={handleClose}
        email="joao@email.com"
        senhaTemporaria="Temp@123456"
        nomeRazaoSocial="João Silva"
      />
    );

    const fecharBotoes = screen.getAllByRole("button", { name: /Fechar/i });
    fireEvent.click(fecharBotoes[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
