# Dindin
# API Dindin

Este é um projeto de API RESTful desenvolvido para gerenciar as finanças pessoais de usuários. Abaixo estão detalhadas as principais funcionalidades e requisitos do projeto.

## Configuração do Banco de Dados

O projeto utiliza um banco de dados PostgreSQL chamado "dindin". Certifique-se de criar o banco e as tabelas necessárias executando o script SQL fornecido no diretório do projeto.

### Tabelas:

1. **usuarios**
   - id
   - nome
   - email (campo único)
   - senha

2. **categorias**
   - id
   - descricao

3. **transacoes**
   - id
   - descricao
   - valor
   - data
   - categoria_id
   - usuario_id
   - tipo

### Categorias Padrão

As seguintes categorias devem ser inseridas no banco de dados para serem utilizadas:

- Alimentação
- Assinaturas e Serviços
- Casa
- Mercado
- Cuidados Pessoais
- Educação
- Família
- Lazer
- Pets
- Presentes
- Roupas
- Saúde
- Transporte
- Salário
- Vendas
- Outras receitas
- Outras despesas

## Endpoints

### Cadastrar Usuário

- **POST /usuario**
  - Parâmetros no corpo da requisição: nome, email, senha
  - Exemplo de requisição:
    ```json
    {
        "nome": "José",
        "email": "jose@email.com",
        "senha": "123456"
    }
    ```
  - Exemplo de resposta (sucesso):
    ```json
    {
        "id": 1,
        "nome": "José",
        "email": "jose@email.com"
    }
    ```
  - Exemplo de resposta (falha):
    ```json
    {
        "mensagem": "Já existe usuário cadastrado com o e-mail informado."
    }
    ```

### Fazer Login

- **POST /login**
  - Parâmetros no corpo da requisição: email, senha
  - Exemplo de requisição:
    ```json
    {
        "email": "jose@email.com",
        "senha": "123456"
    }
    ```
  - Exemplo de resposta (sucesso):
    ```json
    {
        "usuario": {
            "id": 1,
            "nome": "José",
            "email": "jose@email.com"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - Exemplo de resposta (falha):
    ```json
    {
        "mensagem": "Usuário e/ou senha inválido(s)."
    }
    ```

### Detalhar Perfil do Usuário Logado

- **GET /usuario**
  - Exemplo de resposta (sucesso):
    ```json
    {
        "id": 1,
        "nome": "José",
        "email": "jose@email.com"
    }
    ```
  - Exemplo de resposta (falha):
    ```json
    {
        "mensagem": "Para acessar este recurso, um token de autenticação válido deve ser enviado."
    }
    ```

### Editar Perfil do Usuário Logado

- **PUT /usuario**
  - Parâmetros no corpo da requisição: nome, email, senha
  - Exemplo de requisição:
    ```json
    {
        "nome": "José de Abreu",
        "email": "jose_abreu@email.com",
        "senha": "j4321"
    }
    ```
  - Exemplo de resposta (sucesso):
    (Sem conteúdo no corpo da resposta)
  - Exemplo de resposta (falha):
    ```json
    {
        "mensagem": "O e-mail informado já está sendo utilizado por outro usuário."
    }
    ```

### Listar Categorias

- **GET /categoria**
  - Exemplo de resposta (sucesso):
    ```json
    [
      {
        "id": 1,
        "descricao": "Roupas"
      },
      {
        "id": 2,
        "descricao": "Mercado"
      }
      // ...
    ]
    ```
  - Exemplo de resposta (sem categorias cadastradas):
    ```json
    []
    ```

### Listar Transações do Usuário Logado

- **GET /transacao**
  - Exemplo de resposta (sucesso):
    ```json
    [
      {
        "id": 1,
        "tipo": "saida",
        "descricao": "Sapato amarelo",
        "valor": 15800,
        "data": "2022-03-23T15:35:00.000Z",
        "usuario_id": 5,
        "categoria_id": 4,
        "categoria_nome": "Roupas"
      },
      {
        "id": 3,
        "tipo": "entrada",
        "descricao": "Salário",
        "valor": 300000,
        "data": "2022-03-24T15:30:00.000Z",
        "usuario_id": 5,
        "categoria_id": 6,
        "categoria_nome": "Salários"
      }
      // ...
    ]
    ```
  - Exemplo de resposta (sem transações cadastradas):
    ```json
    []
    ```

### Detalhar uma Transação do Usuário Logado

- **GET /transacao/:id**
  - Parâmetros na URL: id (identificador da transação)
  - Exemplo de resposta (sucesso):
    ```json
    {
        "id": 3,
        "tipo": "entrada",
        "descricao": "Salário",
        "valor": 300000,
        "data": "2022-03-24T15:30:00.000Z",
        "usuario_id": 5,
        "categoria_id": 6,
        "categoria_nome": "Salários"
    }
    ```
  - Exemplo de resposta (falha):
    ```json
    {
        "mensagem": "Transação não encontrada."
    }
    ```

### Cadastrar Transação para o Usuário Logado

- **POST /transacao**
  - Parâmetros no corpo da requisição: tipo, descricao, valor, data, categoria_id
  - Exemplo de requisição:
    ```json
    {
        "tipo": "entrada",
        "descricao": "Salário",
        "valor": 300000,
        "data": "2022-03-24T15:30:00.000Z",
        "categoria_id": 6
    }
    ```
  - Exemplo de resposta (sucesso):
    ```json
