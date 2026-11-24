import test from 'node:test';
import assert from 'node:assert/strict';
import {
  API_BASE, PAGE_SIZE, ApiError, getArtworkUrl, getDetailArtwork,
  getPokemonDetail, getPokemonId, getPokemonPage,
} from '../src/services/pokeapi.js';
import { formatMetric, formatName, formatNumber, translateLabel } from '../src/utils/format.js';

const initialFetch = globalThis.fetch;

test.after(() => { globalThis.fetch = initialFetch; });

function mockResponse(body, status = 200) {
  globalThis.fetch = async () => ({ ok: status >= 200 && status < 300, status, json: async () => body });
}

test('identifica o ID usando a URL da lista', () => {
  assert.equal(getPokemonId(`${API_BASE}/pokemon/94/`), 94);
  assert.equal(getPokemonId('https://exemplo.com/sem-id'), null);
});

test('gera o endereço da ilustração oficial', () => {
  assert.match(getArtworkUrl(94), /official-artwork\/94\.png$/);
});

test('carrega uma página e indica se há próxima página', async () => {
  let requestedUrl;
  globalThis.fetch = async (url) => {
    requestedUrl = url;
    return { ok: true, json: async () => ({
      next: 'https://pokeapi.co/api/v2/pokemon?offset=48',
      results: [
        { name: 'bulbasaur', url: `${API_BASE}/pokemon/1/` },
        { name: 'ivysaur', url: `${API_BASE}/pokemon/2/` },
      ],
    }) };
  };
  assert.deepEqual(await getPokemonPage(24), {
    items: [{ id: 1, name: 'bulbasaur' }, { id: 2, name: 'ivysaur' }], hasMore: true,
  });
  assert.equal(requestedUrl, `${API_BASE}/pokemon?limit=${PAGE_SIZE}&offset=24`);
});

test('identifica o fim da paginação', async () => {
  mockResponse({ next: null, results: [] });
  assert.deepEqual(await getPokemonPage(240), { items: [], hasMore: false });
});

test('rejeita resposta de listagem malformada', async () => {
  mockResponse({ foo: [] });
  await assert.rejects(() => getPokemonPage(), ApiError);
});

test('busca um Pokémon pelo nome ignorando maiúsculas', async () => {
  let requestedUrl;
  globalThis.fetch = async (url) => {
    requestedUrl = url;
    return { ok: true, json: async () => ({ id: 94, name: 'gengar' }) };
  };
  assert.equal((await getPokemonDetail('  GENGAR  ')).id, 94);
  assert.equal(requestedUrl, `${API_BASE}/pokemon/gengar`);
});

test('informa erro 404 em Pokémon inexistente', async () => {
  mockResponse({}, 404);
  await assert.rejects(() => getPokemonDetail('inexistente'), (error) => error instanceof ApiError && error.status === 404);
});

test('informa falha do servidor', async () => {
  mockResponse({}, 503);
  await assert.rejects(() => getPokemonPage(), (error) => error.status === 503);
});

test('não realiza busca vazia', async () => {
  await assert.rejects(() => getPokemonDetail('  '), (error) => error.status === 400);
});

test('propaga sinal de cancelamento ao fetch', async () => {
  let receivedSignal;
  globalThis.fetch = async (_, options) => {
    receivedSignal = options.signal;
    return { ok: true, json: async () => ({ id: 25, name: 'pikachu' }) };
  };
  const controller = new AbortController();
  await getPokemonDetail(25, controller.signal);
  assert.equal(receivedSignal, controller.signal);
});

test('prioriza imagem de detalhes da API', () => {
  const image = 'https://exemplo.com/pokemon.png';
  assert.equal(getDetailArtwork({ id: 25, sprites: { other: { 'official-artwork': { front_default: image } } } }), image);
  assert.match(getDetailArtwork({ id: 25 }), /25\.png$/);
});

test('formata nome, número, unidade e tipos', () => {
  assert.equal(formatName('mr-mime'), 'Mr Mime');
  assert.equal(formatNumber(94), '#094');
  assert.equal(formatMetric(65, 'kg'), '6,5 kg');
  assert.equal(translateLabel('fire'), 'Fogo');
});
