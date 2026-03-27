# PHV - Resenha Sagrada

Este é um projeto de blog para o grupo de amigos PHV, onde os membros podem criar e compartilhar posts sobre eventos, adicionar fotos em formato de carrossel, comentar e curtir postagens.

## 🎯 Objetivo do Sistema

O sistema permite que os membros do grupo PHV:

- Criem posts de eventos (ex: retiro, encontro, resenha)
- Adicionem múltiplas fotos em formato de carrossel por post
- Escrevam legendas
- Comentem nas postagens
- Curtam posts

## 👥 Membros do Grupo

- **Bruno**: alegre, brincalhão
- **Ks**: fala muita besteira, engraçado
- **Laura**: namora Mariana
- **Julia**: irmã gêmea da Laura, reclama de tudo
- **Mariana**: namorada da Laura
- **Danny**: mais ausente
- **Jady**: trabalhadora
- **Carlinhos**: o mais gente boa

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js com Express
- **Frontend**: React
- **Banco de Dados**: SQLite ou PostgreSQL
- **API**: REST

## 📦 Estrutura do Projeto

```
phv-resenha-sagrada
├── backend
│   ├── src
│   │   ├── index.js
│   │   ├── database.js
│   │   ├── seed.js
│   │   ├── middleware
│   │   │   └── auth.js
│   │   ├── routes
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── comments.js
│   │   │   └── likes.js
│   │   └── uploads
│   ├── package.json
│   └── README.md
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── api
│   │   │   └── index.js
│   │   ├── context
│   │   │   └── AuthContext.js
│   │   ├── components
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   ├── PostCard.js
│   │   │   ├── PostCard.css
│   │   │   ├── Carousel.js
│   │   │   ├── Carousel.css
│   │   │   ├── CommentSection.js
│   │   │   ├── CommentSection.css
│   │   │   ├── LikeButton.js
│   │   │   └── LikeButton.css
│   │   ├── pages
│   │   │   ├── Feed.js
│   │   │   ├── Feed.css
│   │   │   ├── PostDetail.js
│   │   │   ├── PostDetail.css
│   │   │   ├── CreatePost.js
│   │   │   ├── CreatePost.css
│   │   │   ├── Login.js
│   │   │   ├── Login.css
│   │   │   ├── Register.js
│   │   │   └── Register.css
│   │   └── types
│   │       └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## 🚀 Como Rodar o Projeto

### Backend

1. Navegue até a pasta `backend`.
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o servidor:
   ```
   npm start
   ```

### Frontend

1. Navegue até a pasta `frontend`.
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute a aplicação:
   ```
   npm start
   ```

## 📸 Funcionalidades

- Cadastro e login de usuários
- Criação de postagens com título, descrição e múltiplas imagens
- Feed de posts com preview da primeira imagem
- Página de detalhes do post com carrossel de imagens, comentários e curtidas
- Sistema de comentários e curtidas
- Upload de múltiplas imagens

## 🎨 Interface

- Layout moderno estilo rede social
- Carrossel de imagens suave
- Responsivo (mobile first)

## Contribuições

Sinta-se à vontade para contribuir com melhorias e novas funcionalidades!