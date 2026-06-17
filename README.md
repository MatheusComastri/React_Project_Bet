# Bet Acadêmica

Sistema simulado de apostas esportivas desenvolvido em React para fins acadêmicos. A plataforma separa dois perfis: administrador e jogador. Todo saldo, aposta, bônus, prêmio e movimentação é fictício.

## Integrantes

- Matheus Comastri
- Thiago Goulart

## Como Funciona

O administrador acessa um painel próprio para cadastrar eventos esportivos, encerrar apostas e registrar o resultado final. Quando um resultado é informado, o sistema atualiza automaticamente as apostas do evento como ganhas ou perdidas.

O jogador acessa eventos abertos, realiza apostas fictícias usando saldo simulado, acompanha histórico, consulta carteira, resgata bônus e visualiza o ranking de jogadores.

## Funcionalidade Extra

A funcionalidade extra escolhida foi a **Carteira fictícia com bônus e extrato**.

Ela possui tela própria em `/usuario/carteira`, consome e altera dados do JSON Server e registra:

- saldo fictício atual;
- entradas e saídas;
- bônus acadêmico de boas-vindas;
- apostas realizadas;
- prêmios fictícios recebidos.

Também existe uma tela de ranking em `/usuario/ranking`, baseada nos pontos dos jogadores.

## Regras de Negócio

- O login é simulado e validado pelos dados do `db.json`.
- Usuário administrador não pode acessar telas de aposta.
- Usuário jogador não pode acessar telas administrativas.
- Apenas eventos com status `aberto` recebem apostas.
- O jogador precisa ter saldo suficiente para apostar.
- O valor mínimo de aposta é R$ 10,00 fictícios.
- O jogador pode registrar apenas uma aposta por evento.
- Ao apostar, o valor é debitado da carteira fictícia.
- O administrador pode encerrar apostas antes de informar o resultado.
- Ao registrar resultado, apostas vencedoras recebem retorno calculado pela odd.
- Apostas perdedoras ficam com retorno R$ 0,00.
- Bônus fictício pode ser resgatado apenas uma vez por jogador.
- Pontos do ranking aumentam com apostas, bônus e prêmios fictícios.

## Tecnologias Utilizadas

- React
- Vite
- React Router DOM
- React Hooks
- Context API
- Axios
- JSON Server
- CSS responsivo
- ESLint

## Como Rodar

Instale as dependências:

```bash
npm install
```

Execute o JSON Server:

```bash
npm run api
```

A API ficará disponível em:

```text
http://localhost:3001
```

Em outro terminal, execute o React:

```bash
npm run dev
```

A aplicação abrirá normalmente em:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run api
npm run lint
npm run build
npm run preview
```

## Usuários de Teste

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | admin@bet.com | 123 |
| Jogador | joao@bet.com | 123 |
| Jogador | maria@bet.com | 123 |
| Jogador | pedro@bet.com | 123 |

## Principais Rotas

| Rota | Perfil | Função |
| --- | --- | --- |
| `/login` | público | login simulado |
| `/admin` | administrador | dashboard administrativo |
| `/admin/eventos` | administrador | cadastro, encerramento e resultado de eventos |
| `/usuario` | jogador | dashboard do jogador |
| `/usuario/eventos` | jogador | visualização e realização de apostas |
| `/usuario/historico` | jogador | histórico de apostas |
| `/usuario/carteira` | jogador | carteira fictícia, bônus e extrato |
| `/usuario/ranking` | jogador | ranking dos jogadores |

## Estrutura do Projeto

```text
src/
├── components/
├── context/
├── pages/
├── routes/
├── services/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

O arquivo `db.json` fica na raiz e é usado pelo JSON Server.

## Dados da API Simulada

O `db.json` contém:

- `usuarios`: administradores e jogadores;
- `eventos`: eventos esportivos e seus status;
- `apostas`: apostas realizadas pelos jogadores;
- `movimentacoes`: extrato da carteira fictícia.

## Divisão de Tarefas

| Integrante | Responsabilidades |
| --- | --- |
| Matheus Comastri | Telas do jogador, apostas, histórico, carteira fictícia e ranking |
| Thiago Goulart | Estrutura React, Context API, rotas protegidas, telas administrativas, JSON Server e README |

## Principais Telas

- Login com seleção rápida de usuários de teste.
- Dashboard administrativo com resumo de eventos e apostas.
- Gerenciamento de eventos com cadastro, encerramento e registro de resultado.
- Dashboard do jogador com saldo, apostas pendentes e movimentações recentes.
- Eventos disponíveis com filtro por esporte e formulário de aposta.
- Histórico de apostas com filtro por status.
- Carteira fictícia com bônus e extrato.
- Ranking dos jogadores por pontos.

## Dificuldades Encontradas

- Separar corretamente o acesso entre administrador e jogador.
- Atualizar saldo, apostas e movimentações mantendo os dados sincronizados no JSON Server.
- Implementar o encerramento de eventos e a atualização automática do resultado das apostas.
- Organizar as telas em componentes reutilizáveis mantendo a interface responsiva.

## Melhorias Futuras

- Cadastro de novos jogadores pela interface.
- Edição e exclusão de eventos administrativos.
- Mais filtros por data, esporte e status.
- Relatórios gráficos para o administrador.
- Confirmação visual antes de finalizar eventos.
- Testes automatizados para as regras de aposta e carteira.
