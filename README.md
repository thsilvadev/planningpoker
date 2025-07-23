#  Planning Poker - Estimativas Ágeis em Tempo Real

Ferramenta web para estimativas de tarefas baseada na técnica **Planning Poker**, ideal para equipes ágeis. Simples, colaborativa e em tempo real — sem necessidade de persistência de dados.

# App online [aqui](https://planningpoker-delta.vercel.app/)!

##  Planning Poker - Setup Local

Guia completo para rodar o projeto Planning Poker localmente.

###  Pré-requisitos

- **Node.js**: Versão 22.x ou superior
- **npm**: Versão 9+ (vem com Node.js)
- **Git**: Para clonar o repositório

###  Setup Inicial

#### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/fpf-junior-webdev.git
cd fpf-junior-webdev
```

#### 2. Configuração do Backend (NestJS)

##### Instalar dependências
```bash
cd backend
npm install
```

##### Executar em modo desenvolvimento
```bash
npm run start:dev
```

O backend estará rodando em: **http://localhost:3000**

#### 3. Configuração do Frontend (Angular)

##### Instalar dependências
```bash
cd ../frontend
npm install
```

##### Configurar ambiente local
Edite o arquivo `src/environments/environment.ts`:
```typescript
export const environment = {
    BACKEND_URL: 'localhost', // Mudança para ambiente local
};
```

##### Executar em modo desenvolvimento
```bash
ng serve --open
```

O frontend estará rodando em: **http://localhost:4200**


## Decisões técnicas

Dado que foi uma intensa jornada de trabalho e estudo ao longo de 6 dias, é um exercício desafiador resumi-la em poucos tópicos. Ao longo da trajetória eu tirei um tempo para documentar, de maneira informal, em formato "diário", escrito em primeira pessoa mesmo, o processo do desenvolvimento desse software, incluindo não somente as decisões e os impasses técnicos, mas as ideias, técnicas de pesquisa e estudo (grande parte do trabalho) e os desafios encontrados no caminho. Caso tenha interesse, o link está [aqui](https://docs.google.com/document/d/1D0rdoTHIN0RDQOA9z3h6PKojN-HpMdcvjQAB-Juz_BA/edit?usp=sharing), mas peço que releve o caráter informal do texto, pois não tive tempo ainda de extrair somente os aspectos estritamente técnicos e reescrevê-los em um formato mais acadêmico (farei em breve).

Sobre a limpeza do código e organização: no início tava bem bonito, mas conforme o tempo foi passando e o prazo começou a apertar, uma parte do código acabou não ficando tão organizada, sobretudo no frontend. Pretendo continuar refatorando e melhorando pois o projeto tá legal e vale o aprimoramento e manutenção. Não pude revisar os comentários até o fim desse desafio, pretendo fazê-lo assim que puder.

## Nota

A visualização dos votos da tarefa está sendo através da utilidade "tooltip", própria do js/navegador, pois não tive tempo de fazer um modal.

## Backlog para próximas versões no kanban abaixo

 https://kanbanx.com/#/desafio-fpf-javascript-junior

### Algumas das principais features e correções:
- Modal ao clicar nas tarefas para visualizar os votos
- Editar/Deletar tarefa
- Não permitir nomes iguais na mesma sala
- Não permitir usuário em duas salas 
- Corrigir -> quando usuário bota ID errado, fica "carregando eternamente"
---

##  Funcionalidades

-  Criação de salas únicas para estimativa (via UUID ou slug)
-  Participantes entram com nome (sem login)
-  Rodadas de estimativa com tarefa (título e descrição)
-  Votos ocultos até todos votarem ou moderador encerrar
-  Exibição de votos em gráfico ou tabela
-  Múltiplas rodadas dentro da mesma sala
-  Comunicação em tempo real via WebSocket
-  Estado mantido apenas em memória (Map no backend)

---

##  Tecnologias

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

## Autor
Feito por Thiago Silva – thsilva.developer@gmail.com
