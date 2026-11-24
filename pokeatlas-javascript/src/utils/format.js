// Evita repetir formatações nas telas e nos componentes.
export function formatName(name = '') {
  return String(name)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatNumber(id) {
  return `#${String(id).padStart(3, '0')}`;
}

const translations = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta', electric: 'Elétrico',
  ice: 'Gelo', fighting: 'Lutador', poison: 'Venenoso', ground: 'Terra', flying: 'Voador',
  psychic: 'Psíquico', bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão',
  dark: 'Sombrio', steel: 'Aço', fairy: 'Fada',
  hp: 'HP', attack: 'Ataque', defense: 'Defesa',
  'special-attack': 'Atq. especial', 'special-defense': 'Def. especial', speed: 'Velocidade',
};

export function translateLabel(value) {
  return translations[value] || formatName(value);
}

export function formatMetric(valueInTenths, unit) {
  if (!Number.isFinite(valueInTenths)) return 'Não informado';
  return `${(valueInTenths / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit}`;
}
