import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getArtworkUrl } from '../services/pokeapi';
import { colors } from '../theme/colors';
import { formatName, formatNumber } from '../utils/format';

export default function PokemonCard({ pokemon, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(pokemon)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${formatName(pokemon.name)}`}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: getArtworkUrl(pokemon.id) }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={`Imagem de ${formatName(pokemon.name)}`}
        />
      </View>
      <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
      <Text style={styles.name} numberOfLines={1}>{formatName(pokemon.name)}</Text>
      <Text style={styles.action}>Ver detalhes</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%', padding: 12, backgroundColor: colors.surface, borderRadius: 18,
    borderColor: colors.border, borderWidth: 1, marginBottom: 14,
  },
  pressed: { opacity: 0.7 },
  imageBox: {
    height: 120, backgroundColor: colors.lavender, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  image: { width: 108, height: 108 },
  number: { color: colors.purple, fontWeight: '700', fontSize: 12 },
  name: { color: colors.text, fontWeight: '800', fontSize: 17, marginTop: 5 },
  action: { color: colors.muted, fontSize: 12, marginTop: 7 },
});
