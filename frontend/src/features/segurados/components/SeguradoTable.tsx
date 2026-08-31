import React from "react";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import { Button, Badge, LoadingState, EmptyState } from "../../../components/ui";
import { formatarCpfCnpj, formatarTelefone } from "../../../utils/formatters";

interface SeguradoTableProps {
  segurados: Segurado[];
  isLoading?: boolean;
  onEditar?: (segurado: Segurado) => void;
  onVisualizar?: (segurado: Segurado) => void;
}

export const SeguradoTable: React.FC<SeguradoTableProps> = ({
  segurados,
  isLoading = false,
  onEditar,
  onVisualizar,
}) => {
  if (isLoading) {
    return <LoadingState message="Carregando segurados..." />;
  }

  if (segurados.length === 0) {
    return (
      <EmptyState
        title="Nenhum segurado encontrado"
        description="Não há registros para os filtros selecionados ou ainda não há segurados cadastrados."
      />
    );
  }

  return (
    <div className="w-full overflow-hidden bg-(--surface) border border-(--border) rounded-(--radius) shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-(--border) bg-(--surface-2)/60 text-(--muted) font-medium text-xs tracking-wider uppercase">
              <th className="py-3.5 px-4">Tipo</th>
              <th className="py-3.5 px-4">Nome / Razão Social</th>
              <th className="py-3.5 px-4">CPF / CNPJ</th>
              <th className="py-3.5 px-4">Contato</th>
              <th className="py-3.5 px-4">Localidade</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {segurados.map((segurado) => {
              const isPF = segurado.tipoPessoa === "PF";

              return (
                <tr
                  key={segurado.id || segurado.cpfCnpj}
                  className="hover:bg-(--surface-2)/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <Badge variant={isPF ? "info" : "purple"}>
                      {isPF ? "PF" : "PJ"}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-(--fg)">
                    <div>{segurado.nomeRazaoSocial}</div>
                    <div className="text-xs text-(--muted) font-normal">
                      {isPF ? "Pessoa Física" : "Pessoa Jurídica"}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-(--fg) mono text-xs font-medium">
                    {formatarCpfCnpj(segurado.cpfCnpj, segurado.tipoPessoa)}
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <div className="text-(--fg)">{segurado.email}</div>
                    <div className="text-(--muted)">{formatarTelefone(segurado.telefone)}</div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-(--muted)">
                    {segurado.enderecoCidade && segurado.enderecoUf ? (
                      <span>
                        {segurado.enderecoCidade} - {segurado.enderecoUf}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {onVisualizar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVisualizar(segurado)}
                          title="Visualizar detalhes"
                        >
                          Ver
                        </Button>
                      )}
                      {onEditar && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEditar(segurado)}
                          title="Editar segurado"
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
