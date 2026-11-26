import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import PokemonItem from '../components/PokemonItem';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesScreen({ navigation }) {
  const { favorites, ready, error } = useFavorites();
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Meus favoritos</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Salvos no armazenamento local do dispositivo.</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!ready ? <ActivityIndicator style={styles.center} /> :
        <FlatList data={favorites} keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PokemonItem pokemon={item} onPress={() => navigation.navigate('Detalhes', { id: item.id })} />}
          ListEmptyComponent={<Text style={styles.empty}>Você ainda não adicionou Pokémon aos favoritos.</Text>} />}
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F6FA' }, title: { marginTop: 48, marginHorizontal: 18, fontWeight: 'bold', color: '#6352A4' }, subtitle: { marginHorizontal: 18, marginBottom: 18 }, error: { margin: 18, color: '#9D2745' }, empty: { textAlign: 'center', padding: 30 }, center: { marginTop: 40 } });
