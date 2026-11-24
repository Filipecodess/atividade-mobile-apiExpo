// Único módulo responsável pela comunicação HTTP com a PokéAPI.
// Os demais arquivos não precisam conhecer detalhes das URLs.
export const API_BASE = 'https://pokeapi.co/api/v2';
export const PAGE_SIZE = 24;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function requestJson(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new ApiError('Não foi possível consultar a PokéAPI.', response.status);
  }

  return response.json();
}

// A listagem devolve a URL de cada Pokémon, que termina em /{id}/.
export function getPokemonId(url) {
  const match = String(url).match(/\/pokemon\/(\d+)\/?(?:\?.*)?$/);
  return match ? Number(match[1]) : null;
}

export function getArtworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function getPokemonPage(offset = 0, signal) {
  const url = `${API_BASE}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`;
  const data = await requestJson(url, signal);

  if (!Array.isArray(data.results)) {
    throw new ApiError('A API retornou uma lista inesperada.', 0);
  }

  const items = data.results
    .map((entry) => ({ id: getPokemonId(entry.url), name: entry.name }))
    .filter((entry) => Number.isInteger(entry.id) && entry.id > 0 && typeof entry.name === 'string');

  return { items, hasMore: Boolean(data.next) };
}

// A API pesquisa pelo nome completo (em inglês) ou pelo número.
export async function getPokemonDetail(nameOrId, signal) {
  const query = String(nameOrId).trim().toLowerCase();
  if (!query) throw new ApiError('Informe um nome ou número.', 400);

  const data = await requestJson(`${API_BASE}/pokemon/${encodeURIComponent(query)}`, signal);

  if (!Number.isInteger(data.id) || !data.name) {
    throw new ApiError('A API retornou dados inesperados.', 0);
  }

  return data;
}

export function getDetailArtwork(detail) {
  return detail?.sprites?.other?.['official-artwork']?.front_default
    || getArtworkUrl(detail.id);
}
