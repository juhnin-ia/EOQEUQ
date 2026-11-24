// Bairros dos negócios. Sem banco, para valer no servidor, no navegador e nos testes.
//
// As cidades de BAIRROS_POR_CIDADE têm a lista fechada: o bairro precisa ser um
// dela e fica gravado com a grafia da lista. Nas outras, o bairro é texto livre.
// O bairro é sempre opcional: quem indica um negócio nem sempre sabe onde fica.

import { normalizarTexto } from "@/lib/texto";

/**
 * Bairros por cidade ("Cidade|UF"), em ordem alfabética.
 *
 * Crato (CE): os bairros das faixas de CEP dos Correios (ruacep.com.br) somados aos do
 * índice de bairros de mbi.com.br, em 23/11/2026. "Grangeiro" e "Parque Grangeiro"
 * seguem a grafia dos Correios. Para acrescentar uma cidade, inclua a lista aqui.
 */
export const BAIRROS_POR_CIDADE: Record<string, readonly string[]> = {
  "Crato|CE": [
    "Aderson Tavares Bezerra",
    "Alto da Penha",
    "Área Rural",
    "Baixio das Palmeiras",
    "Barro Branco",
    "Bela Vista",
    "Belmonte",
    "Cacimbas",
    "Campo Alegre",
    "Centro",
    "Coqueiro",
    "Dom Francisco",
    "Dom Quintino",
    "Franca Alencar",
    "Gisélia Pinheiro",
    "Grangeiro",
    "Lameiro",
    "Mirandão",
    "Monte Alverne",
    "Muriti",
    "Nossa Senhora de Fátima",
    "Novo Crato",
    "Novo Horizonte",
    "Novo Lameiro",
    "Ossian Araripe",
    "Palmeiral",
    "Parque Grangeiro",
    "Parque Recreio",
    "Pimenta",
    "Pinto Madeira",
    "Santa Luzia",
    "Santa Rosa",
    "São Bento",
    "São José",
    "São Miguel",
    "Seminário",
    "Sossego",
    "Vila Alta",
    "Vila Lobo",
    "Zacarias Gonçalves",
  ],
};

export const TAMANHO_MAXIMO_DO_BAIRRO = 60;

/** A lista fechada de bairros da cidade, ou null quando o bairro é livre. */
export function bairrosDaCidade(cidade: string, uf: string): readonly string[] | null {
  return BAIRROS_POR_CIDADE[`${cidade}|${uf}`] ?? null;
}

/**
 * A cidade com lista de bairros escrita no campo de cidade ("Crato, CE", "crato - ce"),
 * sem carregar a lista do IBGE no navegador. Null quando a cidade não tem lista.
 */
export function cidadeComBairros(texto: string): { cidade: string; uf: string; bairros: readonly string[] } | null {
  const partes = /^(.+?)\s*(?:,|\/|\s-|\s)\s*([a-z]{2})$/.exec(normalizarTexto(texto));
  if (!partes) return null;
  for (const [chave, bairros] of Object.entries(BAIRROS_POR_CIDADE)) {
    const [cidade, uf] = chave.split("|") as [string, string];
    if (normalizarTexto(cidade) === partes[1] && uf.toLowerCase() === partes[2]) return { cidade, uf, bairros };
  }
  return null;
}

/** Endereço do bairro na URL: "São José" → "sao-jose". */
export function slugBairro(bairro: string): string {
  return normalizarTexto(bairro).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Confere o bairro digitado para a cidade. Vazio vira null. Nas cidades com lista,
 * aceita qualquer grafia sem acento ou maiúscula e devolve a da lista; fora da lista,
 * devolve o erro. Nas outras, devolve o texto com os espaços arrumados.
 */
export function conferirBairro(texto: string, cidade: string, uf: string): { bairro: string | null } | { erro: string } {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (!limpo) return { bairro: null };
  if (limpo.length > TAMANHO_MAXIMO_DO_BAIRRO) return { erro: "Nome de bairro muito longo." };
  const lista = bairrosDaCidade(cidade, uf);
  if (!lista) return { bairro: limpo };
  const chave = slugBairro(limpo);
  const achado = lista.find((b) => slugBairro(b) === chave);
  if (achado) return { bairro: achado };
  return { erro: `Escolha o bairro na lista de ${cidade}. Se não souber, deixe em branco.` };
}

/** "Centro · Crato, CE" ou só "Crato, CE". */
export function rotuloDoLugar(empresa: { bairro?: string | null; cidade: string; uf: string }): string {
  const cidade = `${empresa.cidade}, ${empresa.uf}`;
  return empresa.bairro ? `${empresa.bairro} · ${cidade}` : cidade;
}
