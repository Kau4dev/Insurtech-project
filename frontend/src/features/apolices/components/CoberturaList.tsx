import React from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import {
  Button,
  Input,
  Select,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/ui";
import type { Cobertura } from "../../../interfaces/apolices/cobertura";
import type { TipoCobertura } from "../../../interfaces/enums";
import { formatarMoeda } from "../../../utils/formatters";
import type { ApoliceFormData } from "../schemas/apoliceSchema";

const TIPOS_COBERTURA: { value: TipoCobertura; label: string }[] = [
  { value: "COLISAO", label: "Colisão" },
  { value: "ROUBO_FURTO", label: "Roubo e Furto" },
  { value: "INCENDIO_VEICULO", label: "Incêndio Veículo" },
  { value: "DANO_A_TERCEIRO", label: "Danos a Terceiros" },
  { value: "QUEBRA_DE_VIDRO", label: "Quebra de Vidros" },
  { value: "INCENDIO_RESIDENCIAL", label: "Incêndio Residencial" },
  { value: "DANOS_ELETRICOS", label: "Danos Elétricos" },
  { value: "ROUBO_BENS", label: "Roubo de Bens" },
  { value: "ALAGAMENTO", label: "Alagamento" },
  { value: "MORTE", label: "Morte" },
  { value: "INVALIDEZ_PERMANENTE", label: "Invalidez Permanente" },
  { value: "DOENCA_GRAVE", label: "Doença Grave" },
  { value: "DANO_EQUIPAMENTO", label: "Dano a Equipamento" },
  { value: "LUCROS_CESSANTES", label: "Lucros Cessantes" },
  { value: "RESPONSABILIDADE_CIVIL", label: "Responsabilidade Civil" },
  { value: "OUTROS", label: "Outros" },
];

interface CoberturaListProps {
  coberturas?:
    | Cobertura[]
    | Array<{
        tipoCobertura: TipoCobertura;
        valorCobertura: string;
        valorFranquia?: string;
      }>;
  editable?: boolean;
  control?: Control<ApoliceFormData>;
  register?: UseFormRegister<ApoliceFormData>;
  errors?: FieldErrors<ApoliceFormData>;
}

const COLUNAS_READONLY = [
  "Tipo de Cobertura",
  { label: "Valor da Cobertura", align: "right" as const },
  { label: "Valor da Franquia", align: "right" as const },
];

export const CoberturaList: React.FC<CoberturaListProps> = ({
  coberturas = [],
  editable = false,
  control,
  register,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "coberturas",
  });

  if (editable && control && register) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Coberturas da Apólice
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              append({
                tipoCobertura: "COLISAO",
                valorCobertura: "",
                valorFranquia: "",
              })
            }
          >
            + Adicionar Cobertura
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-xs text-(--muted) italic">
            Nenhuma cobertura adicionada ainda. Clique acima para adicionar.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-lg bg-(--surface-2)/40 border border-(--border)"
              >
                <div className="md:col-span-4">
                  <Select
                    label="Tipo de Cobertura *"
                    options={TIPOS_COBERTURA}
                    error={errors?.coberturas?.[index]?.tipoCobertura?.message}
                    {...register(`coberturas.${index}.tipoCobertura` as const)}
                  />
                </div>

                <div className="md:col-span-4">
                  <Input
                    label="Valor Cobertura (R$) *"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors?.coberturas?.[index]?.valorCobertura?.message}
                    {...register(`coberturas.${index}.valorCobertura` as const)}
                  />
                </div>

                <div className="md:col-span-3">
                  <Input
                    label="Valor Franquia (R$)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors?.coberturas?.[index]?.valorFranquia?.message}
                    {...register(`coberturas.${index}.valorFranquia` as const)}
                  />
                </div>

                <div className="md:col-span-1 flex justify-end pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-(--danger) hover:bg-rose-50 hover:text-rose-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <TableContainer
      variant="embedded"
      isEmpty={coberturas.length === 0}
      emptyTitle="Nenhuma cobertura cadastrada"
      emptyDescription="Esta apólice não possui coberturas."
    >
      <TableHeader columns={COLUNAS_READONLY} />
      <tbody className="divide-y divide-(--border)">
        {coberturas.map((cob, idx) => (
          <TableRow key={idx}>
            <TableCell className="font-semibold text-(--fg)">
              {cob.tipoCobertura}
            </TableCell>
            <TableCell align="right" className="font-medium text-xs">
              {formatarMoeda(cob.valorCobertura)}
            </TableCell>
            <TableCell align="right" className="text-xs text-(--muted)">
              {formatarMoeda(cob.valorFranquia)}
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </TableContainer>
  );
};
