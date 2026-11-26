import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadFavorites, saveFavorites } from '../storage/favorites';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadFavorites()
      .then((items) => { if (active) setFavorites(items); })
      .catch(() => { if (active) setError('Não foi possível ler os favoritos locais.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function toggleFavorite(pokemon) {
    if (!ready) return;
    const exists = favorites.some((entry) => entry.id === pokemon.id);
    const next = exists ? favorites.filter((entry) => entry.id !== pokemon.id) : [...favorites, { id: pokemon.id, name: pokemon.name }];
    try {
      setError('');
      await saveFavorites(next);
      setFavorites(next);
    } catch (_) {
      setError('Não foi possível salvar os favoritos neste dispositivo.');
    }
  }

  const isFavorite = (id) => favorites.some((entry) => entry.id === id);
  return <FavoritesContext.Provider value={{ favorites, ready, error, isFavorite, toggleFavorite }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  return context;
}
