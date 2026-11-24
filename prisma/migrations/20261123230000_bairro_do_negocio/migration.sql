-- Bairro do negócio (opcional), para as páginas e o filtro por bairro.
ALTER TABLE "Empresa" ADD COLUMN "bairro" TEXT;

CREATE INDEX "Empresa_cidade_uf_bairro_idx" ON "Empresa"("cidade", "uf", "bairro");
