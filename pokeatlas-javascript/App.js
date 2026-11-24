import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, RefreshControl, SafeAreaView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { ApiError, getPokemonDetail, getPokemonPage } from './src/services/pokeapi';
import PokemonCard from './src/components/PokemonCard';
import PokemonDetailModal from './src/components/PokemonDetailModal';
import FeedbackState from './src/components/FeedbackState';
import { colors } from './src/theme/colors';

export default function App() {
  // Catálogo e seus estados de carregamento.
  const [pokemons, setPokemons] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  // Busca por nome completo ou ID, consultando a API.
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchRetryCount, setSearchRetryCount] = useState(0);

  // A ficha é exibida em uma janela modal.
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // Referências evitam duas requisições de paginação simultâneas.
  const pokemonsRef = useRef([]);
  const loadingMoreRef = useRef(false);
  const paginationController = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    // Atualizar o catálogo cancela uma paginação ainda em andamento.
    paginationController.current?.abort();
    paginationController.current = null;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setLoading(true);
    setCatalogError('');

    getPokemonPage(0, controller.signal)
      .then(({ items, hasMore: more }) => {
        if (controller.signal.aborted) return;
        pokemonsRef.current = items;
        setPokemons(items);
        setHasMore(more);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCatalogError('Não foi possível carregar o catálogo. Confira sua internet.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [reloadCount]);

  const refreshCatalog = useCallback(() => {
    setRefreshing(true);
    setReloadCount((count) => count + 1);
  }, []);

  const loadMore = useCallback(async (forceRetry = false) => {
    if (
      loadingMoreRef.current || !hasMore || loading || refreshing ||
      searchText.trim() || (catalogError && !forceRetry)
    ) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setCatalogError('');
    const controller = new AbortController();
    paginationController.current = controller;

    try {
      const { items, hasMore: more } = await getPokemonPage(pokemonsRef.current.length, controller.signal);
      if (controller.signal.aborted) return;

      const knownIds = new Set(pokemonsRef.current.map((pokemon) => pokemon.id));
      const newItems = items.filter((pokemon) => !knownIds.has(pokemon.id));
      const updated = [...pokemonsRef.current, ...newItems];
      pokemonsRef.current = updated;
      setPokemons(updated);
      setHasMore(more);
    } catch {
      if (!controller.signal.aborted) {
        setCatalogError('Falha ao carregar outros Pokémon.');
      }
    } finally {
      if (paginationController.current === controller) {
        paginationController.current = null;
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [hasMore, loading, refreshing, searchText, catalogError]);

  const query = searchText.trim().toLowerCase();
  const searching = query.length > 0;

  useEffect(() => {
    if (!query) {
      setSearchResult(null);
      setSearchStatus('idle');
      return;
    }

    const controller = new AbortController();
    setSearchResult(null);
    setSearchStatus('loading');

    // Pequeno intervalo evita uma requisição a cada tecla digitada.
    const timer = setTimeout(() => {
      getPokemonDetail(query, controller.signal)
        .then((detail) => {
          if (!controller.signal.aborted) {
            setSearchResult({ id: detail.id, name: detail.name, query });
            setSearchStatus('found');
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setSearchStatus(error instanceof ApiError && error.status === 404 ? 'empty' : 'error');
          }
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchRetryCount]);

  const visiblePokemons = searching
    ? (searchResult?.query === query ? [searchResult] : [])
    : pokemons;

  function renderEmpty() {
    if (searching) {
      if (searchStatus === 'loading' || (searchResult?.query !== query && searchStatus === 'found')) {
        return <FeedbackState title="Buscando Pokémon" message="Consultando a PokéAPI..." loading />;
      }
      if (searchStatus === 'empty') {
        return <FeedbackState title="Nenhum resultado" message="Informe o nome completo em inglês ou o número do Pokémon." />;
      }
      if (searchStatus === 'error') {
        return <FeedbackState title="Erro na busca" message="Não foi possível consultar a PokéAPI."
          actionLabel="Tentar novamente" onAction={() => setSearchRetryCount((count) => count + 1)} />;
      }
      return <FeedbackState title="Buscando Pokémon" loading />;
    }

    if (loading) return <FeedbackState title="Carregando catálogo" loading />;
    if (catalogError) {
      return <FeedbackState title="Não foi possível carregar" message={catalogError}
        actionLabel="Tentar novamente" onAction={refreshCatalog} />;
    }
    return <FeedbackState title="Nenhum Pokémon disponível" message="Tente atualizar o catálogo." />;
  }

  function renderFooter() {
    if (searching || loading || pokemons.length === 0) return null;
    if (loadingMore) return <ActivityIndicator style={styles.footer} color={colors.purple} />;
    if (catalogError) {
      return <FeedbackState title="Erro ao carregar mais" message={catalogError}
        actionLabel="Tentar novamente" onAction={() => loadMore(true)} />;
    }
    if (!hasMore) return <Text style={styles.endText}>Fim do catálogo.</Text>;
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.deepPurple} />

      <View style={styles.header}>
        <Text style={styles.headerLabel}>EXPLORADOR DE API REST</Text>
        <Text style={styles.title}>PokéAtlas</Text>
        <Text style={styles.subtitle}>Conheça os Pokémon e descubra seus atributos.</Text>
        <View style={styles.searchBox}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Nome completo ou número"
            placeholderTextColor="#807C91"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Buscar Pokémon por nome ou número"
            style={styles.input}
          />
          {searching && (
            <Pressable onPress={() => setSearchText('')} accessibilityRole="button" accessibilityLabel="Limpar busca">
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{searching ? 'Resultado da busca' : 'Catálogo Pokémon'}</Text>
            <Text style={styles.sectionInfo}>
              {searching ? 'Consulta por nome ou ID' : `${pokemons.length} Pokémon carregados`}
            </Text>
          </View>
          <View style={styles.apiBadge}><Text style={styles.apiBadgeText}>PokéAPI</Text></View>
        </View>

        <FlatList
          data={visiblePokemons}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PokemonCard pokemon={item} onPress={setSelectedPokemon} />}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.35}
          onEndReached={() => { if (!searching) loadMore(); }}
          refreshControl={!searching ? (
            <RefreshControl refreshing={refreshing} onRefresh={refreshCatalog} tintColor={colors.purple} />
          ) : undefined}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      </View>

      <PokemonDetailModal pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.deepPurple, paddingTop: 26, paddingBottom: 25,
    paddingHorizontal: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '800', color: '#D8C7F8' },
  title: { color: colors.white, fontSize: 36, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#E3D9F6', fontSize: 14, marginTop: 7 },
  searchBox: {
    backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, borderRadius: 13, marginTop: 20, minHeight: 52,
  },
  input: { flex: 1, minHeight: 52, color: colors.text, fontSize: 14 },
  clearText: { color: colors.purple, fontWeight: '800', fontSize: 13, padding: 7 },
  main: { flex: 1, paddingHorizontal: 18 },
  sectionHeader: {
    paddingVertical: 21, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900' },
  sectionInfo: { color: colors.muted, fontSize: 12, marginTop: 5 },
  apiBadge: { backgroundColor: colors.lavender, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20 },
  apiBadgeText: { color: colors.purple, fontSize: 11, fontWeight: '800' },
  columns: { justifyContent: 'space-between' },
  listContent: { paddingBottom: 30, flexGrow: 1 },
  footer: { marginVertical: 24 },
  endText: { color: colors.muted, textAlign: 'center', paddingVertical: 22, fontSize: 12 },
});
