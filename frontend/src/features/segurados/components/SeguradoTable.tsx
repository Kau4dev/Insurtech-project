import React from "react";
import type { Segurado } from "../../../interfaces/segurados/segurado";
import { Badge, TableContainer, TableHeader, TableRow, TableCell, TableActions } from "../../../components/ui";
import { formatarCpfCnpj, formatarTelefone } from "../../../utils/formatters";

interface SeguradoTableProps {
  segurados: Segurado[];
  isLoading?: boolean;
  onEditar?: (segurado: Segurado) => void;
  onVisualizar?: (segurado: Segurado) => void;
}

const COLUNAS = [
  "Tipo",
  "Nome / Razão Social",
  "CPF / CNPJ",
  "Contato",
  "Localidade",
  { label: "Ações", align: "right" as const },
];

export const SeguradoTable: React.FC<SeguradoTableProps> = ({
  segurados,
  isLoading = false,
  onEditar,
  onVisualizar,
}) => {
  return (
    <TableContainer
      isLoading={isLoading}
      isEmpty={segurados.length === 0}
      loadingMessage="Carregando segurados..."
      emptyTitle="Nenhum segurado encontrado"
      emptyDescription="Não há registros para os filtros selecionados ou ainda não há segurados cadastrados."
    >
      <TableHeader columns={COLUNAS} />
      <tbody className="divide-y divide-(--border)">
        {segurados.map((segurado) => {
          const isPF = segurado.tipoPessoa === "PF";
          const localidade = [segurado.enderecoCidade, segurado.enderecoUf]
            .filter(Boolean)
            .join(" - ");

          return (
            <TableRow key={segurado.id || segurado.cpfCnpj}>
              <TableCell>
                <Badge variant={isPF ? "info" : "purple"}>
                  {isPF ? "PF" : "PJ"}
                </Badge>
              </TableCell>

              <TableCell className="font-medium text-(--fg)">
                <div>{segurado.nomeRazaoSocial}</div>
                <div className="text-xs text-(--muted) font-normal">
                  {isPF ? "Pessoa Física" : "Pessoa Jurídica"}
                </div>
              </TableCell>

              <TableCell className="text-(--fg) mono text-xs font-medium">
                {formatarCpfCnpj(segurado.cpfCnpj, segurado.tipoPessoa)}
              </TableCell>

              <TableCell className="text-xs">
                <div className="text-(--fg)">{segurado.email}</div>
                <div className="text-(--muted)">
                  {formatarTelefone(segurado.telefone)}
                </div>
              </TableCell>

              <TableCell className="text-xs text-(--muted)">
                {localidade || "-"}
              </TableCell>

              <TableCell align="right">
                <TableActions
                  onVisualizar={onVisualizar ? () => onVisualizar(segurado) : undefined}
                  onEditar={onEditar ? () => onEditar(segurado) : undefined}
                  editarTitle="Editar segurado"
                />
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </TableContainer>
  );
};
