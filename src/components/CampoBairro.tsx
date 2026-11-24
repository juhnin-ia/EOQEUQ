"use client";

import { useId, useRef, useState } from "react";
import { Campo } from "@/components/Campo";
import { cidadeComBairros, TAMANHO_MAXIMO_DO_BAIRRO } from "@/lib/bairros";

/**
 * Bairro do negócio, opcional. Lê a cidade do campo `municipio` do mesmo formulário:
 * nas cidades com lista de bairros (src/lib/bairros.ts), sugere os bairros dela, e o
 * servidor só aceita um da lista. Nas outras, é texto livre.
 */
export function CampoBairro({ valorInicial, erro, aoMudar }: { valorInicial: string; erro?: string; aoMudar?: () => void }) {
  const entrada = useRef<HTMLInputElement>(null);
  const lista = useId();
  const [bairros, setBairros] = useState<readonly string[] | null>(null);
  const [cidade, setCidade] = useState<string>();

  /** Atualiza as sugestões com a cidade escolhida no formulário. */
  function lerCidade() {
    const campo = entrada.current?.form?.elements.namedItem("municipio") as HTMLInputElement | null;
    const achada = campo?.value ? cidadeComBairros(campo.value) : null;
    setBairros(achada?.bairros ?? null);
    setCidade(achada?.cidade);
  }

  return (
    <Campo
      id="bairro"
      rotulo="Bairro (opcional)"
      erro={erro}
      ajuda={bairros ? `Escolha um dos bairros de ${cidade}.` : "Ajuda quem procura negócios perto de casa."}
    >
      <input
        ref={entrada}
        id="bairro"
        name="bairro"
        list={bairros ? lista : undefined}
        maxLength={TAMANHO_MAXIMO_DO_BAIRRO}
        autoComplete="off"
        placeholder={bairros ? "Comece a digitar e escolha" : "Ex.: Centro"}
        defaultValue={valorInicial}
        onFocus={lerCidade}
        onChange={aoMudar}
        aria-invalid={erro ? true : undefined}
        className="campo"
      />
      {bairros && (
        <datalist id={lista}>
          {bairros.map((bairro) => (
            <option key={bairro} value={bairro} />
          ))}
        </datalist>
      )}
    </Campo>
  );
}
