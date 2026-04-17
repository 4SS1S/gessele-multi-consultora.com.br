-- AlterTable: adiciona avatar_url e cpf ao profile
ALTER TABLE "profiles" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "profiles" ADD COLUMN "cpf" TEXT;

-- CreateIndex: cpf único (permite múltiplos NULLs)
CREATE UNIQUE INDEX "profiles_cpf_key" ON "profiles"("cpf");
