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
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("BOLETIM_OCORRENCIA");
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [urlArquivo, setUrlArquivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resetForm = () => {
    setNomeArquivo("");
    setUrlArquivo("");
    setErro(null);
  };

  const handlePreencherExemplo = (tipo: TipoDocumento, nome: string, url: string) => {
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
    <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">📎</span>
        <div>
          <h4 className="font-semibold text-sm text-(--fg)">
            Documentação Pendente Solicitada
          </h4>
          <p className="text-xs text-(--muted) mt-0.5">
            O analista solicitou documentos complementares para prosseguir com a regulação do seu sinistro. Envie abaixo para retomar a análise.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3 pt-2">
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
          <span className="text-[11px] text-(--muted)">Preenchimento rápido de teste:</span>
          <button
            type="button"
            onClick={() =>
              handlePreencherExemplo(
                "BOLETIM_OCORRENCIA",
                "boletim_ocorrencia.pdf",
                "https://storage.insurtech.com/sinistros/docs/boletim_ocorrencia.pdf"
              )
            }
            className="px-2 py-0.5 text-[11px] rounded border border-(--border) bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer"
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
            className="px-2 py-0.5 text-[11px] rounded border border-(--border) bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer"
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
            className="px-2 py-0.5 text-[11px] rounded border border-(--border) bg-(--surface) hover:bg-(--surface-2) text-(--fg) cursor-pointer"
          >
            Nota Fiscal (.pdf)
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isSubmitting ? "Enviando Documento..." : "Enviar Documento"}
          </Button>
        </div>
      </form>
    </div>
  );
};
