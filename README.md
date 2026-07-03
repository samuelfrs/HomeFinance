# HomeFinance - Sistema de Controle de Gastos Residenciais

O **HomeFinance** é uma aplicação completa para controle de finanças domésticas que permite o gerenciamento de moradores, o cadastro de receitas e despesas vinculadas e o acompanhamento de saldos individuais e gerais em tempo real.

Este projeto foi desenvolvido como solução para um desafio técnico, utilizando práticas modernas de engenharia de software tanto no desenvolvimento de APIs em **.NET Core** quanto na construção de interfaces com **React/Next.js**.

---

## 🚀 Tecnologias Utilizadas

### Backend (`/backend`)
- **ASP.NET Core 8.0**: Estruturado utilizando **Minimal APIs** para endpoints compactos, focados e de alta performance.
- **Entity Framework Core (EF Core)**: ORM utilizado para mapeamento das entidades e persistência de dados.
- **SQLite**: Banco de dados físico local de fácil execução e portabilidade.
- **xUnit**: Suíte de testes de unidade focada na cobertura das regras de negócio do sistema.

### Frontend (`/frontend`)
- **React com Next.js 16 (App Router)**: Framework web com suporte a TypeScript para desenvolvimento ágil e seguro.
- **Tailwind CSS v4**: Estilização visual premium com foco em experiência do usuário (UX) em Dark Mode e micro-animações de interface.
- **Fetch API (Nativo)**: Cliente HTTP leve e tipado para integração com as rotas do backend.

---

## ⚙️ Funcionalidades e Regras de Negócio

### 1. Cadastro de Pessoas (Moradores)
- CRUD completo (Criação, Consulta, Edição e Exclusão).
- **Deleção em Cascata (Cascade Delete)**: Ao excluir um morador, todas as transações (receitas/despesas) vinculadas a ele são automaticamente removidas do banco de dados para evitar registros órfãos.

### 2. Cadastro de Transações (Receitas e Despesas)
- Registro de movimentações financeiras indicando descrição, valor, tipo e morador associado.
- **Restrição de Idade**: Menores de 18 anos são impedidos de registrar transações do tipo **Receita** (entradas), sendo permitido apenas o registro de **Despesas** (saídas). Essa regra é validada tanto preventivamente na interface (frontend) quanto de forma impeditiva no servidor (backend).

### 3. Consulta de Totais (Dashboard)
- Listagem individual de moradores exibindo o total acumulado de receitas, despesas e o saldo líquido individual (`Receitas - Despesas`).
- Painel geral destacado no topo exibindo o somatório geral acumulado de toda a residência.

---

## 📦 Como Executar a Aplicação Localmente

Certifique-se de ter o **.NET SDK 8.0** e o **Node.js** instalados em sua máquina.

### 1. Executando o Backend (.NET)
1. Navegue até o diretório do backend no seu terminal:
   ```bash
   cd backend/HomeFinance.Api
   ```
2. Inicialize o servidor local:
   ```bash
   dotnet run
   ```
   *O backend estará ativo em `http://localhost:5090` e a interface do Swagger estará disponível em `http://localhost:5090/swagger/index.html`.*

### 2. Executando o Frontend (Next.js)
1. Abra um segundo terminal e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências necessárias:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O frontend estará disponível no seu navegador em `http://localhost:3000`.*

---

## 🧪 Como Executar os Testes Automatizados

O backend possui testes unitários que garantem a corretude da regra de exclusão em cascata (utilizando provedor do SQLite in-memory) e a restrição de transações baseada em idade.

1. No terminal, navegue até a pasta de testes:
   ```bash
   cd backend/HomeFinance.Tests
   ```
2. Execute a suíte de testes do dotnet:
   ```bash
   dotnet test
   ```
