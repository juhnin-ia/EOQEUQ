import { describe, expect, it } from "vitest";
import { BAIRROS_POR_CIDADE, bairrosDaCidade, cidadeComBairros, conferirBairro, rotuloDoLugar, slugBairro } from "@/lib/bairros";
import { hrefBairro, hrefDiretorio, lerFiltros, SEM_FILTROS, tituloDoDiretorio } from "@/lib/diretorio";
import { nomeOficial } from "@/lib/municipios";
import { textoDeBusca } from "@/lib/texto";

describe("lista de bairros", () => {
  it("só traz cidades da lista do IBGE, com a grafia oficial", () => {
    for (const chave of Object.keys(BAIRROS_POR_CIDADE)) {
      const [cidade, uf] = chave.split("|") as [string, string];
      expect(nomeOficial(cidade, uf)).toBe(cidade);
    }
  });

  it("não repete bairro nem endereço de bairro na mesma cidade", () => {
    for (const bairros of Object.values(BAIRROS_POR_CIDADE)) {
      expect(new Set(bairros.map(slugBairro)).size).toBe(bairros.length);
    }
  });

  it("tem a lista do Crato", () => {
    expect(bairrosDaCidade("Crato", "CE")).toContain("Pimenta");
    expect(bairrosDaCidade("Recife", "PE")).toBeNull();
  });
});

describe("cidadeComBairros", () => {
  it("acha a cidade do campo de cidade em qualquer grafia", () => {
    expect(cidadeComBairros("Crato, CE")?.cidade).toBe("Crato");
    expect(cidadeComBairros("crato - ce")?.uf).toBe("CE");
    expect(cidadeComBairros("Crato")).toBeNull();
    expect(cidadeComBairros("Recife, PE")).toBeNull();
  });
});

describe("conferirBairro", () => {
  it("vazio vira null: o bairro é opcional", () => {
    expect(conferirBairro("  ", "Crato", "CE")).toEqual({ bairro: null });
  });

  it("na cidade com lista, devolve a grafia da lista", () => {
    expect(conferirBairro("sao jose", "Crato", "CE")).toEqual({ bairro: "São José" });
    expect(conferirBairro("  SEMINARIO ", "Crato", "CE")).toEqual({ bairro: "Seminário" });
  });

  it("na cidade com lista, recusa um bairro de fora", () => {
    expect(conferirBairro("Boa Viagem", "Crato", "CE")).toHaveProperty("erro");
  });

  it("nas outras cidades, aceita texto livre com os espaços arrumados", () => {
    expect(conferirBairro("  Boa   Viagem ", "Recife", "PE")).toEqual({ bairro: "Boa Viagem" });
    expect(conferirBairro("x".repeat(61), "Recife", "PE")).toHaveProperty("erro");
  });
});

describe("endereços e textos do bairro", () => {
  it("monta a página do bairro dentro da página da cidade", () => {
    expect(hrefBairro("São José", "Crato", "CE")).toBe("/cidades/crato-ce/sao-jose");
  });

  it("leva o bairro na URL do diretório e de volta", () => {
    const href = hrefDiretorio({ onde: "Crato, CE", bairro: "Centro" });
    expect(href).toBe("/explorar?onde=Crato%2C+CE&bairro=Centro");
    const params = Object.fromEntries(new URL(href, "https://x").searchParams);
    expect(lerFiltros(params)).toEqual({ ...SEM_FILTROS, onde: "Crato, CE", bairro: "Centro" });
  });

  it("põe o bairro no título do diretório", () => {
    const local = { cidade: "Crato", uf: "CE", rotulo: "Crato, CE" };
    expect(tituloDoDiretorio({ ...SEM_FILTROS, bairro: "Centro" }, local)).toBe("Todos os negócios em Centro, Crato");
  });

  it("mostra o bairro antes da cidade", () => {
    expect(rotuloDoLugar({ bairro: "Pimenta", cidade: "Crato", uf: "CE" })).toBe("Pimenta · Crato, CE");
    expect(rotuloDoLugar({ bairro: null, cidade: "Crato", uf: "CE" })).toBe("Crato, CE");
  });

  it("a busca acha o negócio pelo bairro", () => {
    const busca = textoDeBusca({ nome: "Cuscuz", resumo: "", categoria: "Alimentação", cidade: "Crato", uf: "CE", bairro: "São José", instagramUsername: "x" });
    expect(busca).toContain("sao jose");
  });
});
