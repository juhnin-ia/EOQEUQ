// Peças das imagens de compartilhamento (opengraph-image.tsx): a prévia que
// aparece quando alguém manda um link do site no WhatsApp, Instagram, LinkedIn etc.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { INTER, NEWSREADER } from "@/lib/fontes-compartilhamento";
import { ehFotoDoSite } from "@/lib/fotos";
import { CORES_DA_MARCA, ICONE, svgDoIcone } from "@/lib/marca";

export const TAMANHO = { width: 1200, height: 630 };

export const SUAVE = "#5f666d";

// Instâncias estáticas das fontes variáveis do site (licença OFL, ver assets/fontes).
// O ImageResponse não lê woff2 nem fontes variáveis. Elas vêm embutidas num módulo,
// e não de readFile: o Worker do Cloudflare não lê os arquivos do projeto.
export const FONTES = [
  { name: "Newsreader", data: Buffer.from(NEWSREADER, "base64"), weight: 600 as const, style: "normal" as const },
  { name: "Inter", data: Buffer.from(INTER, "base64"), weight: 500 as const, style: "normal" as const },
];

function dataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const ICONE_CLARO = dataUri(svgDoIcone("claro"));
const ICONE_GELO = dataUri(svgDoIcone("gelo"));

/** Logo horizontal, mais ou menos na largura pedida: o ícone e o nome do site, em duas cores. */
export function LogoNaImagem({ largura }: { largura: number }) {
  const altura = Math.round(largura * 0.24);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(altura * 0.3) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ICONE_CLARO} height={altura} width={Math.round((altura * ICONE.largura) / ICONE.altura)} alt="" />
      <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: Math.round(largura * 0.105), color: CORES_DA_MARCA.chumbo }}>
        Era o que&nbsp;<span style={{ color: CORES_DA_MARCA.vermelho }}>eu queria</span>
      </div>
    </div>
  );
}

/** Imagem geral do site: o logo e o lema à esquerda, o ícone em gelo no vermelho à direita. */
export function ImagemDoSite() {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: CORES_DA_MARCA.gelo }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "0 72px" }}>
        <LogoNaImagem largura={560} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 56,
            fontFamily: "Newsreader",
            fontSize: 68,
            lineHeight: 1.05,
            color: CORES_DA_MARCA.chumbo,
          }}
        >
          Compre de quem&nbsp;<span style={{ color: CORES_DA_MARCA.vermelho }}>está perto.</span>
        </div>
        <div style={{ marginTop: 22, fontFamily: "Inter", fontSize: 28, lineHeight: 1.35, color: SUAVE }}>
          Negócios com consciência social e raízes na comunidade.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 400, background: CORES_DA_MARCA.vermelho }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ICONE_GELO} width={270} height={Math.round((270 * ICONE.altura) / ICONE.largura)} alt="" />
      </div>
    </div>
  );
}

/**
 * Foto do perfil de um negócio ou de um embaixador, como data URI. O ImageResponse
 * não lê WebP, e uma foto que não carrega derrubaria a imagem inteira: nesses
 * casos fica o monograma.
 */
export async function fotoEmDataUri(url: string | null): Promise<string | null> {
  if (!ehFotoDoSite(url)) return null;
  const tipo = /\.png$/i.test(url) ? "image/png" : /\.jpe?g$/i.test(url) ? "image/jpeg" : null;
  if (!tipo) return null;
  try {
    let dados: Buffer;
    if (url.startsWith("/enviados/")) {
      dados = await readFile(join(process.cwd(), "public", url));
    } else {
      const resposta = await fetch(url);
      if (!resposta.ok) return null;
      dados = Buffer.from(await resposta.arrayBuffer());
    }
    return `data:${tipo};base64,${dados.toString("base64")}`;
  } catch {
    return null;
  }
}
