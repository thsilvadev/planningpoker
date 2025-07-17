# 🃏 Planning Poker - Estimativas Ágeis em Tempo Real

Ferramenta web para estimativas de tarefas baseada na técnica **Planning Poker**, ideal para equipes ágeis. Simples, colaborativa e em tempo real — sem necessidade de persistência de dados.

---

## ✨ Funcionalidades

- ✅ Criação de salas únicas para estimativa (via UUID ou slug)
- 👥 Participantes entram com nome (sem login)
- 🔄 Rodadas de estimativa com tarefa (título e descrição)
- 🔒 Votos ocultos até todos votarem ou moderador encerrar
- 📊 Exibição de votos em gráfico ou tabela
- 🔁 Múltiplas rodadas dentro da mesma sala
- ⚡ Comunicação em tempo real via WebSocket
- 🧠 Estado mantido apenas em memória (Map no backend)

---

## 🚀 Tecnologias

### Frontend
- [Angular](https://angular.io/)
- [RxJS](https://rxjs.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- (Opcional) [ng2-charts](https://valor-software.com/ng2-charts/) para exibir gráficos

### Backend
- [NestJS](https://nestjs.com/)
- [Socket.IO Gateway](https://docs.nestjs.com/websockets/gateways)
- Armazenamento **em memória** usando `Map` (ou Redis, se desejado futuramente)

---

## 🧪 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- Nest CLI (`npm install -g @nestjs/cli`)

---

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/planning-poker.git
cd planning-poker
```
### 2. Rodar o backend

```bash
cd backend
npm install
npm run start:dev
```

### 3. Rodar o frontend

```bash
cd frontend
npm install
ng serve
```

## 🛠️ Estrutura de Diretórios
```java

planning-poker/
├── backend/          → NestJS app (WebSocket Gateway)
└── frontend/         → Angular app (RxJS + WebSocket client)
```

## 📌 Roadmap
 Criação de salas

 Entrada de participantes

 Rodadas com tarefa

 Votação secreta

 Exibição dos votos

 Novas rodadas

 UI responsiva com Angular Material

 Gráfico com ng2-charts

 Deploy na Vercel + Render (ou Heroku)

## Kanban

 https://kanbanx.com/#/desafio-fpf-javascript-junior



## 🧑‍💻 Autor
Feito por Thiago Silva – thsilva.developer@gmail.com
