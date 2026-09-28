/**
 * Extrai e formata mensagens de erro retornadas pelas APIs dos microsserviços
 * ou por exceções locais, garantindo textos claros e informativos ao usuário.
 */
export function extrairMensagemErro(
  error: unknown,
  fallbackPadrao = "Ocorreu um erro ao processar a solicitação."
): string {
  if (!error) return fallbackPadrao;

  if (typeof error === "string") return error;

  if (typeof error === "object" && "response" in error) {
    const err = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errors?: Record<string, string> | string[];
          status?: number;
        };
      };
    };

    const status = err.response?.status;
    const data = err.response?.data;

    // Erros detalhados de validação (ex: Bean Validation de DTOs)
    if (data?.errors) {
      if (typeof data.errors === "object" && !Array.isArray(data.errors)) {
        const camposErros = Object.entries(data.errors)
          .map(([campo, msg]) => `${campo}: ${msg}`)
          .join(" | ");
        if (camposErros) return camposErros;
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(", ");
      }
    }

    // Mensagem de domínio retornada pelo backend (ex: AcessoNegadoException, StatusInvalidoException)
    if (data?.message && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    // Fallbacks baseados no status HTTP
    if (status === 401) {
      return "Sessão expirada ou não autenticado. Faça login novamente.";
    }
    if (status === 403) {
      return "Acesso negado. Seu perfil de usuário não tem permissão para realizar esta operação.";
    }
    if (status === 404) {
      return "Recurso não encontrado no sistema.";
    }
    if (status === 409) {
      return "Conflito de dados. O registro já existe ou está em estado conflitante.";
    }
    if (status && status >= 500) {
      return "Erro no servidor. Tente novamente em alguns instantes.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackPadrao;
}

