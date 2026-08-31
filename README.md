# HomeFinance - Sistema de Controle de Gastos Residenciais

O **HomeFinance** é uma aplicação Full-Stack completa e escalável para controle de finanças domésticas. Permite o gerenciamento de moradores, o cadastro de receitas e despesas vinculadas e o acompanhamento de saldos individuais e consolidados em tempo real com regras de negócio rigorosas e interface moderna.

Construído com **Clean Architecture**, **TypeScript** de ponta a ponta, **NestJS**, **Prisma ORM**, **PostgreSQL / Docker**, **Next.js 16 (App Router)** e **Tailwind CSS v4**.

---

## 🚀 Tecnologias Utilizadas

### Backend (`/backend`)
- **NestJS (TypeScript)**: Framework modular, robusto e escalável com injeção de dependências e Clean Architecture.
- **Prisma ORM**: Modelagem de dados declarativa, migrações automatizadas e consultas 100% type-safe.
- **PostgreSQL**: Banco relacional robusto com integridade referencial e suporte a execução via Docker ou serviços na nuvem (Supabase, Neon, Railway).
- **Swagger / OpenAPI**: Documentação interativa em `/api/docs`.
- **Class-Validator & Class-Transformer**: Validação e sanitização estrita de payloads e DTOs.
- **Jest & Supertest**: Cobertura de testes automatizados E2E para validação de todas as regras de negócio.
- **Docker & Docker Compose**: Setup do banco de dados e ambiente conteinerizado com um único comando.

### Frontend (`/frontend`)
- **React com Next.js 16 (App Router)**: Framework web com suporte a TypeScript e alta performance com Turbopack.
- **Tailwind CSS v4**: Estilização visual premium com UX moderna em Dark Mode e micro-animações.
- **Fetch API (Nativo)**: Cliente HTTP leve e tipado para integração com as rotas do backend.

---

## ⚙️ Funcionalidades e Regras de Negócio

### 1. Cadastro de Pessoas (Moradores)
- CRUD completo (Criação, Consulta, Edição e Exclusão).
- **Deleção em Cascata (Cascade Delete)**: Ao excluir um morador, todas as suas transações (receitas/despesas) vinculadas são automaticamente removidas do banco de dados para evitar registros órfãos.

### 2. Cadastro de Transações (Receitas e Despesas)
- Registro de movimentações financeiras indicando descrição, valor, tipo, data e morador associado.
- **Restrição de Idade**: Menores de 18 anos são impedidos de registrar transações do tipo **Receita** (entradas), sendo permitido apenas o registro de **Despesas** (saídas). Essa regra é validada preventivamente na interface (frontend) e de forma estrita no servidor (backend via NestJS Service).
- **Data Customizável**: Flexibilidade para registrar pagamentos ou recebimentos com datas passadas ou futuras.
- **Ordenação Cronológica**: As transações são exibidas ordenadas da mais recente para a mais antiga.

### 3. Consulta de Totais (Dashboard)
- Listagem individual de moradores exibindo o total acumulado de receitas, despesas e o saldo líquido individual (`Receitas - Despesas`).
- Painel geral destacado no topo exibindo o somatório consolidado de toda a residência (`Total Receitas`, `Total Despesas` e `Saldo Líquido Geral`).

---

## 📦 Como Executar a Aplicação Localmente

Certifique-se de ter o **Docker** e o **Node.js (v20+)** instalados em sua máquina.

### 1. Inicializando o Banco de Dados (PostgreSQL via Docker)
1. Navegue até o diretório do backend:
   ```bash
   cd backend
   ```
2. Suba o container do PostgreSQL:
   ```bash
   docker compose up -d
   ```

### 2. Executando o Backend (NestJS)
1. No diretório `backend`:
   ```bash
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```
   * O backend estará ativo em `http://localhost:5090/api`
   * A documentação Swagger estará disponível em `http://localhost:5090/api/docs`

### 3. Executando o Frontend (Next.js)
1. Abra um segundo terminal e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências e inicie o servidor:
   ```bash
   npm install
   npm run dev
   ```
   * O frontend estará disponível no seu navegador em `http://localhost:3000`.

---

## 🧪 Como Executar os Testes Automatizados

A suíte de testes E2E com Jest garante a integridade de todas as regras de negócio:

```bash
cd backend
npm run test:e2e
```
