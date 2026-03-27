# PHV - Resenha Sagrada Frontend

Este é o frontend da aplicação "PHV - Resenha Sagrada", um blog para um grupo de amigos onde é possível criar, comentar e curtir postagens sobre eventos.

## Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construir interfaces de usuário.
- **CSS**: Para estilização da aplicação.
- **Axios**: Para realizar chamadas à API do backend.

## Estrutura do Projeto

```
frontend/
├── public/
│   └── index.html          # HTML principal da aplicação
├── src/
│   ├── index.js            # Ponto de entrada da aplicação React
│   ├── App.js              # Componente principal da aplicação
│   ├── App.css             # Estilos globais
│   ├── api/                # Funções para chamadas à API
│   ├── context/            # Contexto para gerenciamento de autenticação
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   └── types/              # Tipos TypeScript (se aplicável)
├── package.json            # Dependências e scripts
└── README.md               # Documentação do frontend
```

## Como Rodar o Projeto

1. **Clone o repositório**:
   ```
   git clone https://github.com/seu_usuario/phv-resenha-sagrada.git
   cd phv-resenha-sagrada/frontend
   ```

2. **Instale as dependências**:
   ```
   npm install
   ```

3. **Inicie a aplicação**:
   ```
   npm start
   ```

4. **Acesse a aplicação**:
   Abra o navegador e vá para `http://localhost:3000`.

## Funcionalidades

- Cadastro e login de usuários.
- Criação de postagens com múltiplas imagens em carrossel.
- Feed de postagens com previews.
- Página de detalhes do post com comentários e curtidas.
- Sistema de comentários e curtidas.

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Crie um fork do repositório, faça suas alterações e envie um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.