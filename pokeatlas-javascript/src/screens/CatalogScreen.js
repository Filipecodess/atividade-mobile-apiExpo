import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Searchbar, Text } from 'react-native-paper';
import PokemonItem from '../components/PokemonItem';
import { ApiError, getPokemonDetail, getPokemonPage } from '../services/pokeapi';
import { useFavorites } from '../context/FavoritesContext';

export default function CatalogScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [revision, setRevision] = useState(0);
  const [searchRevision, setSearchRevision] = useState(0);
  const busy = useRef(false);
  const { error: favoritesError } = useFavorites();
  const [pageRetry, setPageRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    busy.current = false;
    setLoading(true); setError(''); setHasMore(true);
    getPokemonPage(0, controller.signal)
      .then(({ items: next, hasMore: more }) => { if (!controller.signal.aborted) { setItems(next); setHasMore(more); } })
      .catch(() => { if (!controller.signal.aborted) setError('Falha ao carregar o catálogo.'); })
      .finally(() => { if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); } });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    const query = search.trim();
    setSearched(null); setSearchError('');
    if (!query) { setSearching(false); return; }
    const controller = new AbortController();
    // Debounce evita uma requisição para cada tecla.
    const timer = setTimeout(() => {
      setSearching(true);
      getPokemonDetail(query, controller.signal)
        .then((detail) => { if (!controller.signal.aborted) setSearched({ id: detail.id, name: detail.name }); })
        .catch((err) => { if (!controller.signal.aborted) setSearchError(err instanceof ApiError && err.status === 404 ? 'Pokémon não encontrado. Use o nome completo em inglês ou o número.' : 'Erro na busca. Verifique a conexão.'); })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, searchRevision]);

  const loadMore = useCallback(async () => {
    if (busy.current || loading || refreshing || !hasMore || search.trim() || error) return;
    busy.current = true; setLoadingMore(true);
    try {
      const result = await getPokemonPage(items.length);
      setItems((prev) => [...prev, ...result.items.filter((entry) => !prev.some((p) => p.id === entry.id))]);
      setHasMore(result.hasMore);
    } catch (_) { setError('Não foi possível carregar mais Pokémon.'); }
    finally { busy.current = false; setLoadingMore(false); }
  }, [items.length, hasMore, loading, refreshing, search, error, pageRetry]);

  useEffect(() => { if (pageRetry > 0) loadMore(); }, [pageRetry]);

  const refresh = () => { setRefreshing(true); setRevision((x) => x + 1); };
  const list = search.trim() ? (searched ? [searched] : []) : items;
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>PokéAtlas</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Explore a Pokédex e salve seus favoritos.</Text>
      <Searchbar placeholder="Buscar por nome ou número" value={search} onChangeText={setSearch} style={styles.search} />
      {favoritesError ? <Text style={styles.error}>{favoritesError}</Text> : null}
      {loading && !search.trim() ? <ActivityIndicator style={styles.center} /> :
        <FlatList data={list} keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PokemonItem pokemon={item} onPress={() => navigation.navigate('Detalhes', { id: item.id })} />}
          refreshing={refreshing} onRefresh={refresh}
          onEndReached={loadMore} onEndReachedThreshold={0.4}
          ListEmptyComponent={searching ? <ActivityIndicator style={styles.center} /> : <Text style={styles.message}>{searchError || error || (search.trim() ? 'Digite o nome completo ou número do Pokémon.' : 'Nenhum Pokémon disponível.')}</Text>}
          ListFooterComponent={!search.trim() ? <View style={styles.footer}>{loadingMore ? <ActivityIndicator /> : error ? <Button onPress={() => { setError(''); if (items.length) setPageRetry((x) => x + 1); else refresh(); }}>Tentar novamente</Button> : null}</View> : searchError ? <Button onPress={() => setSearchRevision((x) => x + 1)}>Tentar novamente</Button> : null}
        />}
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F6FA' }, title: { marginHorizontal: 18, marginTop: 48, fontWeight: 'bold', color: '#6352A4' }, subtitle: { marginHorizontal: 18, marginBottom: 12 }, search: { marginHorizontal: 16, marginBottom: 12 }, center: { marginTop: 36 }, message: { padding: 24, textAlign: 'center' }, footer: { padding: 16 }, error: { color: '#9D2745', marginHorizontal: 16 } });
