# PHV - Resenha Sagrada Backend

Este é o backend da aplicação "PHV - Resenha Sagrada", um blog para um grupo de amigos onde é possível criar posts de eventos, adicionar fotos, comentar e curtir postagens.

## Estrutura do Projeto

- **src/**: Contém o código-fonte da aplicação.
  - **index.js**: Ponto de entrada da aplicação, configura o servidor Express e as rotas.
  - **database.js**: Gerencia a conexão com o banco de dados (SQLite ou PostgreSQL).
  - **seed.js**: Popula o banco de dados com dados iniciais, incluindo posts, imagens e comentários.
  - **middleware/**: Contém middleware para autenticação de usuários.
  - **routes/**: Define as rotas da API para autenticação, posts, comentários e curtidas.
  - **uploads/**: Diretório para armazenar imagens enviadas.

- **package.json**: Contém as dependências e scripts para rodar o servidor.

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu_usuario/phv-resenha-sagrada.git
   ```

2. Navegue até o diretório do backend:
   ```
   cd phv-resenha-sagrada/backend
   ```

3. Instale as dependências:
   ```
   npm install
   ```

4. Configure o banco de dados no arquivo `database.js` conforme necessário.

5. Para popular o banco de dados com dados iniciais, execute:
   ```
   node src/seed.js
   ```

6. Inicie o servidor:
   ```
   npm start
   ```

## Uso

- Acesse a API através de `http://localhost:3000` (ou a porta configurada).
- As rotas disponíveis incluem:
  - **Autenticação**: Registro e login de usuários.
  - **Posts**: Criar, recuperar, atualizar e deletar posts.
  - **Comentários**: Adicionar e recuperar comentários.
  - **Curtidas**: Curtir e descurtir posts.

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Crie um fork do repositório e envie um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.