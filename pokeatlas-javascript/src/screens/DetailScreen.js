import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, ProgressBar, Text } from 'react-native-paper';
import { getDetailArtwork, getPokemonDetail } from '../services/pokeapi';
import { useFavorites } from '../context/FavoritesContext';
import { formatName, formatNumber } from '../utils/format';

export default function DetailScreen({ route }) {
  const id = route.params?.id;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const { ready, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setDetail(null);
    getPokemonDetail(id, controller.signal)
      .then((value) => { if (!controller.signal.aborted) setDetail(value); })
      .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar os detalhes.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, retry]);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!detail) return <View style={styles.center}><Text>{error}</Text><Button onPress={() => setRetry((n) => n + 1)}>Tentar novamente</Button></View>;
  const favorite = isFavorite(detail.id);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Image source={{ uri: getDetailArtwork(detail) }} resizeMode="contain" style={styles.image} />
          <Text variant="labelLarge" style={styles.number}>{formatNumber(detail.id)}</Text>
          <Text variant="headlineMedium" style={styles.name}>{formatName(detail.name)}</Text>
          <View style={styles.types}>{detail.types?.map(({ type }) => <Chip key={type.name} style={styles.chip}>{formatName(type.name)}</Chip>)}</View>
          <Button mode={favorite ? 'outlined' : 'contained'} icon={favorite ? 'heart' : 'heart-outline'} disabled={!ready} onPress={() => toggleFavorite(detail)}>{favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge">Informações</Text>
        <Text>Altura: {(detail.height / 10).toFixed(1)} m</Text>
        <Text>Peso: {(detail.weight / 10).toFixed(1)} kg</Text>
        <Text variant="titleMedium" style={styles.space}>Habilidades</Text>
        <Text>{detail.abilities?.map(({ ability }) => formatName(ability.name)).join(', ') || 'Não informado'}</Text>
      </Card.Content></Card>
      <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge" style={styles.space}>Atributos</Text>
        {detail.stats?.map(({ base_stat, stat }) => <View key={stat.name} style={styles.stat}><Text>{formatName(stat.name)}: {base_stat}</Text><ProgressBar progress={Math.min(base_stat / 255, 1)} color="#6352A4" /></View>)}
      </Card.Content></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ container: { backgroundColor: '#F7F6FA' }, content: { padding: 16, paddingBottom: 35 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, card: { marginBottom: 12 }, image: { alignSelf: 'center', width: 220, height: 220 }, number: { textAlign: 'center', color: '#6352A4' }, name: { textAlign: 'center', marginBottom: 8, fontWeight: 'bold' }, types: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 }, chip: { backgroundColor: '#EEE9FC' }, space: { marginTop: 12, marginBottom: 10 }, stat: { marginVertical: 7, gap: 6 } });
