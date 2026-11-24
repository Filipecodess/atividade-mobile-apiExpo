# PokéAtlas, aplicativo mobile em JavaScript

Aplicativo acadêmico **React Native + Expo + JavaScript (JS e JSX)**. Consome a **PokéAPI REST v2** e mostra um catálogo de Pokémon com imagens, busca e detalhes.

## 1. Funcionalidades implementadas

- Listagem paginada, 24 Pokémon por página, consumidos diretamente da PokéAPI.
- Imagens oficiais associadas aos registros.
- Busca por **nome completo em inglês** ou **ID** da PokéAPI, com pequena espera de 400 ms após digitar.
- Detalhes com imagem, número, nome, tipos, altura, peso, habilidades e atributos base.
- Paginação automática ao rolar a lista, sem repetir IDs.
- Atualização com gesto de puxar para baixo no catálogo.
- Indicadores de carregamento e estados vazios.
- Tratamento de respostas HTTP 404, falhas de rede e botão de tentar novamente.
- Cancelamento de consultas antigas usando `AbortController`.
- Testes automatizados do serviço HTTP e das formatações, sem dependências de teste.

### Limitação deliberada da busca

O endpoint `/pokemon/{nome-ou-id}` faz **busca exata**. Exemplo: `gengar`, `pikachu` e `94` funcionam. `gen` não retorna `gengar`. Isso é uma limitação conhecida da implementação, não um defeito. A consulta global não depende dos 24 itens carregados.

## 2. Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| JavaScript (`.js`, `.mjs`) | Linguagem do projeto. JSX fica em `.js`. |
| React Native | Componentes de interface mobile. |
| Expo SDK 58 | Execução no Expo Go e emuladores compatíveis. |
| React Hooks | Estado, efeitos, referências e callbacks. |
| `fetch` + `AbortController` | Consumo e cancelamento de requisições HTTP. |
| Node.js `node:test` | Testes automatizados de lógica e API simulada. |

Dependências principais declaradas no `package.json`: `expo` ~58.0.0, `react` 19.3.0 e `react-native` 0.88.0. O SDK 58 exige Node.js 22.13 ou superior.

## 3. Como executar

**Pré-requisitos:** Node.js 22.13+ (com npm), internet, Expo Go compatível com o SDK do projeto ou emulador Android/iOS configurado.

Abra o terminal dentro da pasta `pokeatlas-javascript` e execute:

```bash
npm install
npx expo install --check
npm start
```

O Expo apresenta um QR Code. Escaneie com o Expo Go, em uma rede acessível ao seu computador. Para Android com emulador já aberto, use `npm run android`. Para iOS em um Mac com simulador configurado, `npm run ios`.




São 12 testes que usam respostas HTTP simuladas. Validam identificação do ID, formação de URLs, listagem e paginação, consulta individual, erros, cancelamento e funções de apresentação. **Eles não substituem testar a interface no celular.**

## 5. Estrutura e responsabilidade dos arquivos

```text
pokeatlas-javascript/
├── App.js                           Tela principal, busca, paginação e atualização
├── app.json                         Nome e configuração básica do Expo
├── package.json                     Dependências e comandos
├── .gitignore                       Arquivos que não entram no GitHub
├── src/
│   ├── services/
│   │   └── pokeapi.js                Requisições e tratamento de HTTP
│   ├── components/
│   │   ├── PokemonCard.js            Cartão da lista
│   │   ├── PokemonDetailModal.js     Ficha detalhada
│   │   └── FeedbackState.js          Loading, vazios e erros
│   ├── theme/
│   │   └── colors.js                 Cores centralizadas
│   └── utils/
│       └── format.js                 Nomes, números e rótulos
├── tests/
│   └── pokeapi.test.mjs              Testes automatizados
├── README.md                         Como instalar, testar e publicar
├── ESPECIFICACAO_TECNICA.md         Requisitos e fluxo técnico
├── PROMPT_CLAUDE.md                 Instruções para o Claude
└── CHECKLIST_ENTREGA.md             Verificações finais do trabalho
```

**Importante:** não existem arquivos `.ts`, `.tsx`, `tsconfig.json` ou pacotes do TypeScript.

## 6. Endpoints da API

Base: `https://pokeapi.co/api/v2`

| Requisição | Exemplo | Uso |
| --- | --- | --- |
| `GET /pokemon?limit=24&offset=0` | Primeira página | Lista de Pokémon |
| `GET /pokemon?limit=24&offset=24` | Segunda página | Paginação |
| `GET /pokemon/gengar` | Busca por nome | Busca e dados da ficha |
| `GET /pokemon/94` | Busca por ID | Busca e dados da ficha |

A URL das imagens é formada usando o ID devolvido pela listagem e o repositório de sprites da PokéAPI. Isso evita fazer uma requisição de detalhes para cada cartão.

## 7. Resumo do fluxo do aplicativo

1. O `App.js` inicia e chama `getPokemonPage(0)`.
2. `pokeapi.js` realiza um `fetch` para a PokéAPI.
3. O retorno `results` é convertido para `{ id, name }`, e `App.js` atualiza seu estado.
4. `FlatList` desenha um `PokemonCard` para cada Pokémon e solicita novas páginas ao rolar.
5. Ao digitar um nome ou ID, o aplicativo espera 400 ms, consulta o endpoint individual e exibe o resultado.
6. Ao tocar em um cartão, `PokemonDetailModal.js` consulta os detalhes e mostra a ficha.
7. Erros HTTP ou de conexão produzem mensagens e, quando aplicável, botão de nova tentativa.

Uma explicação mais detalhada está em `ESPECIFICACAO_TECNICA.md`.

## 8. Publicar no GitHub como repositório público

### Opção A: criar repositório no site

1. Entre em https://github.com/new.
2. Crie um repositório chamado `pokeatlas-javascript` e escolha **Public**.
3. Deixe desmarcadas as opções de gerar README e `.gitignore`, pois já existem neste projeto.
4. No terminal, dentro da pasta do projeto, execute:

```bash
git init
git add .
git commit -m "feat: implementar PokeAtlas em React Native com JavaScript"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/pokeatlas-javascript.git
git push -u origin main
```

## 11. Referências oficiais

- Expo, criação de apps: https://docs.expo.dev/get-started/create-a-project/
- Expo, SDK 58: https://docs.expo.dev/versions/v58.0.0/
- Expo, ferramentas de criação e template `blank`: https://docs.expo.dev/more/create-expo/
- PokéAPI, documentação REST: https://pokeapi.co/docs/v2
- PokéAPI, repositório das imagens: https://github.com/PokeAPI/sprites
- React Native, componentes básicos: https://reactnative.dev/docs/components-and-apis
