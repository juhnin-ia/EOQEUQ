import { ICONE, NOME_DO_SITE } from "@/lib/marca";

// A terceira pessoa do ícone e o nome ficam gelo no modo escuro. O vermelho e a prata não mudam.
const COR = {
  vermelha: "fill-marca-vermelho",
  terceira: "fill-marca-chumbo escuro:fill-marca-gelo",
  prateada: "fill-marca-prata",
} as const;

const PESSOAS = ["vermelha", "terceira", "prateada"] as const;

/**
 * Logo horizontal: o ícone e o nome do site. A altura vem do className; o nome acompanha.
 * Menor abaixo de 360px, para caber no cabeçalho ao lado de "Indicar", do tema e de "Entrar".
 */
export function Logo({ className = "h-7 min-[360px]:h-9 sm:h-11" }: { className?: string }) {
  return (
    <span role="img" aria-label={NOME_DO_SITE} className={`inline-flex items-center gap-[0.3em] ${className}`}>
      <svg viewBox={`0 0 ${ICONE.largura} ${ICONE.altura}`} aria-hidden="true" className="h-full w-auto shrink-0">
        {PESSOAS.map((pessoa) => (
          <g key={pessoa} className={COR[pessoa]}>
            <path d={ICONE[pessoa].corpo} />
            <circle {...ICONE[pessoa].cabeca} />
          </g>
        ))}
      </svg>
      <span
        aria-hidden="true"
        className="font-display text-[0.85rem] leading-[1.05] font-bold tracking-tight whitespace-nowrap text-marca-chumbo min-[360px]:text-[0.95rem] sm:text-xl xl:text-2xl escuro:text-marca-gelo"
      >
        Era o que <span className="text-marca-vermelho">eu queria</span>
      </span>
    </span>
  );
}
