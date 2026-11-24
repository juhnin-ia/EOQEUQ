import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Atalhos, Vitrine, VitrineCarregando } from "@/components/Vitrine";
import { CAUSAS } from "@/lib/causas";
import { bairroDoSlug, buscarDiretorio, cidadeDoSlug, listarBairros, type BairroComNegocios } from "@/lib/consultas";
import { hrefBairro, hrefCidade, hrefDiretorio, SEM_FILTROS, type CidadeComNegocios } from "@/lib/diretorio";
import { CATEGORIAS } from "@/lib/dominio";
import { jsonLdDaVitrine, metadadosDaPagina, type Migalha } from "@/lib/seo";

// "Negócios do bem no Centro, Crato, CE": a página de quem procura perto de casa.
// Só existe para bairros com negócios no diretório; os outros mostram "Não encontramos esta página".

type Parametros = PageProps<"/cidades/[cidade]/[bairro]">["params"];

async function lugarDosParametros(params: Parametros) {
  const { cidade: slugDaCidade, bairro: slugDoBairro } = await params;
  const cidade = await cidadeDoSlug(slugDaCidade);
  if (!cidade) notFound();
  const bairro = await bairroDoSlug(cidade.cidade, cidade.uf, slugDoBairro);
  if (!bairro) notFound();
  return { cidade, bairro };
}

function textos(cidade: CidadeComNegocios, bairro: BairroComNegocios) {
  const onde = `${cidade.cidade}, ${cidade.uf}`;
  const lugar = `${bairro.bairro}, ${onde}`;
  const caminho = hrefBairro(bairro.bairro, cidade.cidade, cidade.uf);
  const quantos = `${bairro.total} ${bairro.total === 1 ? "negócio" : "negócios"}`;
  return {
    onde,
    caminho,
    titulo: `Negócios do bem em ${lugar}`,
    descricao: `${quantos} do bem no bairro ${bairro.bairro}, em ${onde}: negócios do seu bairro indicados por quem é cliente. Veja tipos, causas, contatos e depoimentos.`,
    migalhas: [
      { nome: "Início", caminho: "/" },
      { nome: "Cidades", caminho: "/cidades" },
      { nome: onde, caminho: hrefCidade(cidade.cidade, cidade.uf) },
      { nome: bairro.bairro, caminho },
    ] satisfies Migalha[],
  };
}

export async function generateMetadata(props: PageProps<"/cidades/[cidade]/[bairro]">): Promise<Metadata> {
  const { cidade, bairro } = await lugarDosParametros(props.params);
  const { titulo, descricao, caminho } = textos(cidade, bairro);
  return metadadosDaPagina({ titulo, descricao, caminho });
}

export default function PaginaDoBairro(props: PageProps<"/cidades/[cidade]/[bairro]">) {
  return (
    <Suspense fallback={<VitrineCarregando />}>
      <Bairro params={props.params} />
    </Suspense>
  );
}

async function Bairro({ params }: { params: Parametros }) {
  const { cidade, bairro } = await lugarDosParametros(params);
  const { onde, titulo, descricao, migalhas } = textos(cidade, bairro);
  const filtros = { onde, bairro: bairro.bairro };
  const [resultado, bairros] = await Promise.all([
    buscarDiretorio({ ...SEM_FILTROS, ...filtros }),
    listarBairros(cidade.cidade, cidade.uf),
  ]);
  const vizinhos = bairros.filter((b) => b.bairro !== bairro.bairro);

  return (
    <Vitrine
      migalhas={migalhas}
      rotulo={onde}
      titulo={titulo}
      introducao={
        <p>
          Negócios do bairro {bairro.bairro} que cuidam das pessoas, da comunidade e do planeta, indicados por quem é cliente. Comprar
          perto de casa faz o dinheiro circular no próprio bairro.
        </p>
      }
      total={resultado.total}
      itens={resultado.itens}
      hrefNoDiretorio={hrefDiretorio(filtros)}
      jsonLd={jsonLdDaVitrine({
        titulo,
        descricao,
        migalhas,
        negocios: resultado.itens,
        sobre: {
          "@type": "Place",
          name: bairro.bairro,
          containedInPlace: { "@type": "City", name: cidade.cidade },
        },
      })}
    >
      <Atalhos
        titulo={`Tipos de negócio no bairro ${bairro.bairro}`}
        itens={CATEGORIAS.filter((tipo) => resultado.porCategoria[tipo]).map((tipo) => ({
          chave: tipo,
          rotulo: tipo,
          total: resultado.porCategoria[tipo],
          href: hrefDiretorio({ ...filtros, tipos: [tipo] }),
        }))}
      />
      <Atalhos
        titulo={`Causas no bairro ${bairro.bairro}`}
        itens={CAUSAS.filter((causa) => resultado.porCausa[causa.slug]).map((causa) => ({
          chave: causa.slug,
          rotulo: `${causa.emoji} ${causa.nome}`,
          total: resultado.porCausa[causa.slug],
          href: hrefDiretorio({ ...filtros, causas: [causa.slug] }),
        }))}
      />
      <Atalhos
        titulo={`Outros bairros de ${cidade.cidade}`}
        itens={vizinhos.map((b) => ({
          chave: b.bairro,
          rotulo: b.bairro,
          total: b.total,
          href: hrefBairro(b.bairro, cidade.cidade, cidade.uf),
        }))}
      />
    </Vitrine>
  );
}
