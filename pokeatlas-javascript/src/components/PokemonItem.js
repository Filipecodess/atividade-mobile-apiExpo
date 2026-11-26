import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { getArtworkUrl } from '../services/pokeapi';
import { formatName, formatNumber } from '../utils/format';
import { useFavorites } from '../context/FavoritesContext';

export default function PokemonItem({ pokemon, onPress }) {
  const { ready, isFavorite, toggleFavorite } = useFavorites();
  const selected = isFavorite(pokemon.id);
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <View style={styles.row}>
        <Image source={{ uri: getArtworkUrl(pokemon.id) }} style={styles.image} resizeMode="contain" />
        <View style={styles.info}>
          <Text variant="labelMedium">{formatNumber(pokemon.id)}</Text>
          <Text variant="titleMedium" numberOfLines={1}>{formatName(pokemon.name)}</Text>
          <Text variant="bodySmall">Toque para ver detalhes</Text>
        </View>
        <IconButton icon={selected ? 'heart' : 'heart-outline'} iconColor={selected ? '#A91C50' : '#6352A4'} onPress={() => toggleFavorite(pokemon)} disabled={!ready} accessibilityLabel={selected ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} />
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({ card: { marginHorizontal: 16, marginVertical: 6 }, row: { flexDirection: 'row', alignItems: 'center', padding: 8 }, image: { width: 80, height: 80 }, info: { flex: 1, marginLeft: 12 } });
