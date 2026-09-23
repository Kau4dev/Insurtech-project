import React, { useState } from "react";
import {
  Button,
  FormErrorBanner,
  Input,
  Modal,
  Select,
} from "../../../components/ui";
import type { TipoDocumento } from "../../../interfaces/enums";
import type { DocumentoSinistro } from "../../../interfaces/sinistros/documentoSinistro";
import { TIPO_DOCUMENTO_OPTIONS } from "../../../utils/enumUtils";
import { extrairMensagemErro } from "../../../utils/errorUtils";
import { useAdicionarDocumento } from "../hooks/useSinistros";

export interface AdicionarDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sinistroId: string;
  numeroSinistro?: string;
  onSuccess?: (documento: DocumentoSinistro) => void;
}

export const AdicionarDocumentoModal: React.FC<
  AdicionarDocumentoModalProps
> = ({ isOpen, onClose, sinistroId, numeroSinistro, onSuccess }) => {
  const [tipoDocumento, setTipoDocumento] =
    useState<TipoDocumento>("BOLETIM_OCORRENCIA");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [urlArquivo, setUrlArquivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const adicionarMutation = useAdicionarDocumento();

  const resetForm = () => {
    setTipoDocumento("BOLETIM_OCORRENCIA");
    setNomeArquivo("");
    setUrlArquivo("");
    setErro(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePreencherExemplo = (
    tipo: TipoDocumento,
    nome: string,
    url: string,
  ) => {
    setTipoDocumento(tipo);
    setNomeArquivo(nome);
    setUrlArquivo(url);
    setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const nome = nomeArquivo.trim();
    const url = urlArquivo.trim();

    if (!nome) {
      setErro("Informe o nome do arquivo.");
      return;
    }

    if (!url) {
      setErro("Informe a URL pública ou de armazenamento do documento.");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setErro("A URL do arquivo deve começar com http:// ou https://.");
      return;
    }

    try {
      const docCriado = await adicionarMutation.mutateAsync({
        id: sinistroId,
        dto: {
          tipoDocumento,
          nomeArquivo: nome,
          urlArquivo: url,
        },
      });

      resetForm();
      if (onSuccess) {
        onSuccess(docCriado);
      }
      onClose();
    } catch (err) {
      setErro(
        extrairMensagemErro(
          err,
          "Não foi possível adicionar o documento ao sinistro.",
        ),
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Anexar Documento ao Sinistro"
      description={
        numeroSinistro
          ? `Sinistro ${numeroSinistro} · Adicione a URL do documento para análise e liquidação.`
          : "Adicione a URL do documento para análise e liquidação do sinistro."
      }
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormErrorBanner message={erro} />

        <div className="p-3 rounded-lg bg-(--surface-2)/60 border border-(--border) text-xs flex items-start gap-2">
          <svg
            className="w-4 h-4 shrink-0 mt-0.5 text-(--accent-ink)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-(--muted)">
            <strong className="text-(--fg)">Fluxo Automático:</strong> Caso o
            sinistro esteja no status{" "}
            <span className="font-semibold text-amber-600">
              AGUARDANDO_DOCUMENTOS
            </span>
            , o envio deste documento fará com que o sistema alterne o status
            automaticamente de volta para{" "}
            <span className="font-semibold text-blue-600">EM ANÁLISE</span>.
          </div>
        </div>

        <div className="space-y-3">
          <Select
            label="Tipo de Documento *"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
            options={TIPO_DOCUMENTO_OPTIONS}
            disabled={adicionarMutation.isPending}
            required
          />

          <Input
            label="Nome do Arquivo *"
            placeholder="Ex: boletim_de_ocorrencia.pdf"
            value={nomeArquivo}
            onChange={(e) => setNomeArquivo(e.target.value)}
            disabled={adicionarMutation.isPending}
            required
          />

          <Input
            label="URL do Arquivo (Storage / CDN) *"
            placeholder="https://storage.insurtech.com/sinistros/docs/arquivo.pdf"
            value={urlArquivo}
            onChange={(e) => setUrlArquivo(e.target.value)}
            disabled={adicionarMutation.isPending}
            required
          />
        </div>

        {/* Exemplos rápidos para preenchimento de teste */}
        <div className="pt-1">
          <div className="text-xs text-(--muted) mb-1.5 font-medium">
            Preenchimento rápido para testes:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handlePreencherExemplo(
                  "BOLETIM_OCORRENCIA",
                  "boletim_ocorrencia_policia.pdf",
                  "https://storage.insurtech.com/sinistros/docs/boletim_ocorrencia_2026.pdf",
                )
              }
              className="px-2.5 py-1 text-xs rounded border border-(--border) bg-(--surface-2) hover:bg-(--surface) text-(--fg) cursor-pointer"
            >
              Exemplo B.O. (.pdf)
            </button>
            <button
              type="button"
              onClick={() =>
                handlePreencherExemplo(
                  "FOTO_DANO",
                  "fotos_colisao_frontal.jpg",
                  "https://storage.insurtech.com/sinistros/fotos/colisao_veiculo_01.jpg",
                )
              }
              className="px-2.5 py-1 text-xs rounded border border-(--border) bg-(--surface-2) hover:bg-(--surface) text-(--fg) cursor-pointer"
            >
              Exemplo Foto Dano (.jpg)
            </button>
            <button
              type="button"
              onClick={() =>
                handlePreencherExemplo(
                  "NOTA_FISCAL",
                  "orcamento_oficina_autorizada.pdf",
                  "https://storage.insurtech.com/sinistros/notas/orcamento_oficina.pdf",
                )
              }
              className="px-2.5 py-1 text-xs rounded border border-(--border) bg-(--surface-2) hover:bg-(--surface) text-(--fg) cursor-pointer"
            >
              Exemplo Nota Fiscal (.pdf)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={adicionarMutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={adicionarMutation.isPending}
          >
            {adicionarMutation.isPending ? "Anexando..." : "Salvar Documento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
