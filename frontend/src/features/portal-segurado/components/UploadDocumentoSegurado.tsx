import React, { useState } from "react";
import { Button, FormErrorBanner, Input, Select } from "../../../components/ui";
import { sinistrosApi } from "../../../api/sinistrosApi";
import type { TipoDocumento } from "../../../interfaces/enums";
import type { DocumentoSinistro } from "../../../interfaces/sinistros/documentoSinistro";
import { TIPO_DOCUMENTO_OPTIONS } from "../../../utils/enumUtils";
import { extrairMensagemErro } from "../../../utils/errorUtils";

interface UploadDocumentoSeguradoProps {
  sinistroId: string;
  onSuccess: (documento: DocumentoSinistro) => void;
}

export const UploadDocumentoSegurado: React.FC<UploadDocumentoSeguradoProps> = ({
  sinistroId,
  onSuccess,
}) => {
  const [tipoDocumento, setTipoDocumento] =
    useState<TipoDocumento>("BOLETIM_OCORRENCIA");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [urlArquivo, setUrlArquivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resetForm = () => {
    setNomeArquivo("");
    setUrlArquivo("");
    setErro(null);
  };

  const handlePreencherExemplo = (
    tipo: TipoDocumento,
    nome: string,
    url: string
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
      setErro("Informe o nome do arquivo a ser enviado.");
      return;
    }

    if (!url) {
      setErro("Informe o link ou URL do documento.");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setErro("A URL do documento deve começar com https:// ou http://.");
      return;
    }

    setIsSubmitting(true);
    try {
      const docCriado = await sinistrosApi.adicionarDocumento(sinistroId, {
        tipoDocumento,
        nomeArquivo: nome,
        urlArquivo: url,
      });

      resetForm();
      onSuccess(docCriado);
    } catch (err) {
      setErro(
        extrairMensagemErro(
          err,
          "Falha ao enviar documento. Tente novamente ou contate o suporte."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-(--radius) bg-amber-500/5 border border-amber-500/30 space-y-4 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/20">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-sm text-(--fg)">
            Documentação Pendente Solicitada
          </h4>
          <p className="text-xs text-(--muted) mt-0.5 leading-relaxed">
            O analista solicitou documentos complementares para prosseguir com a
            regulação do seu sinistro. Envie abaixo para retomar a análise.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5 pt-1">
        <FormErrorBanner message={erro} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Tipo de Documento *"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
            options={TIPO_DOCUMENTO_OPTIONS}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Nome do Arquivo *"
            placeholder="Ex: laudo_oficina.pdf"
            value={nomeArquivo}
            onChange={(e) => setNomeArquivo(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="URL do Arquivo *"
            placeholder="https://storage.exemplo.com/docs/arquivo.pdf"
            value={urlArquivo}
            onChange={(e) => setUrlArquivo(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Exemplos rápidos para preenchimento de teste */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-(--muted) font-medium">
            Preenchimento rápido de teste:
          </span>
          <button
            type="button"
            onClick={() =>
              handlePreencherExemplo(
                "BOLETIM_OCORRENCIA",
                "boletim_ocorrencia.pdf",
                "https://storage.insurtech.com/sinistros/docs/boletim_ocorrencia.pdf"
              )
            }
            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-(--border) bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer transition-colors shadow-2xs active:scale-[0.98]"
          >
            B.O. (.pdf)
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreencherExemplo(
                "FOTO_DANO",
                "foto_veiculo_avarias.jpg",
                "https://storage.insurtech.com/sinistros/fotos/foto_veiculo_avarias.jpg"
              )
            }
            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-(--border) bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer transition-colors shadow-2xs active:scale-[0.98]"
          >
            Foto Avaria (.jpg)
          </button>
          <button
            type="button"
            onClick={() =>
              handlePreencherExemplo(
                "NOTA_FISCAL",
                "nota_fiscal_reparo.pdf",
                "https://storage.insurtech.com/sinistros/notas/nota_fiscal_reparo.pdf"
              )
            }
            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-(--border) bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer transition-colors shadow-2xs active:scale-[0.98]"
          >
            Nota Fiscal (.pdf)
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full sm:w-auto h-10 text-xs font-semibold justify-center shadow-2xs"
          >
            {isSubmitting ? "Enviando Documento..." : "Enviar Documento"}
          </Button>
        </div>
      </form>
    </div>
  );
};
