import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_KEY = '@pokeatlas:favorites:v1';

// Salva somente ID e nome, nunca senhas ou informações sigilosas.
export function normalizeFavorites(data) {
  if (!Array.isArray(data)) return [];
  const seen = new Set();
  return data.filter((p) => {
    const valid = p && Number.isInteger(p.id) && p.id > 0 && typeof p.name === 'string' && p.name.length > 0;
    if (!valid || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  }).map(({ id, name }) => ({ id, name }));
}

export async function loadFavorites() {
  const value = await AsyncStorage.getItem(FAVORITES_KEY);
  if (value === null) return [];
  return normalizeFavorites(JSON.parse(value));
}

export async function saveFavorites(favorites) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(normalizeFavorites(favorites)));
}
