import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Modal, Pressable, SafeAreaView, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { getDetailArtwork, getPokemonDetail } from '../services/pokeapi';
import { colors } from '../theme/colors';
import { formatMetric, formatName, formatNumber, translateLabel } from '../utils/format';
import FeedbackState from './FeedbackState';

export default function PokemonDetailModal({ pokemon, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const pokemonId = pokemon?.id;

  useEffect(() => {
    if (!pokemonId) {
      setDetail(null);
      setError('');
      return;
    }

    const controller = new AbortController();
    setDetail(null);
    setError('');
    setLoading(true);

    getPokemonDetail(pokemonId, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setDetail(data); })
      .catch(() => {
        if (!controller.signal.aborted) setError('Verifique sua conexão e tente novamente.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [pokemonId, retryCount]);

  return (
    <Modal visible={Boolean(pokemon)} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>FICHA DO POKÉMON</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar detalhes">
            <Text style={styles.close}>Fechar</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingLabel}>Carregando detalhes...</Text>
          </View>
        ) : error ? (
          <FeedbackState title="Falha ao consultar detalhes" message={error}
            actionLabel="Tentar novamente" onAction={() => setRetryCount((count) => count + 1)} />
        ) : detail ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <Image source={{ uri: getDetailArtwork(detail) }} style={styles.heroImage} resizeMode="contain" />
            </View>
            <Text style={styles.number}>{formatNumber(detail.id)}</Text>
            <Text style={styles.name}>{formatName(detail.name)}</Text>

            <View style={styles.tags}>
              {(detail.types || []).map(({ type }) => (
                <View key={type.name} style={styles.tag}>
                  <Text style={styles.tagText}>{translateLabel(type.name)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Altura</Text>
                <Text style={styles.metricValue}>{formatMetric(detail.height, 'm')}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Peso</Text>
                <Text style={styles.metricValue}>{formatMetric(detail.weight, 'kg')}</Text>
              </View>
            </View>

            <Text style={styles.heading}>Habilidades</Text>
            <Text style={styles.description}>
              {(detail.abilities || []).length
                ? detail.abilities.map(({ ability, is_hidden }) =>
                    `${formatName(ability.name)}${is_hidden ? ' (oculta)' : ''}`).join(', ')
                : 'Não informado'}
            </Text>

            <Text style={styles.heading}>Atributos base</Text>
            {(detail.stats || []).map(({ stat, base_stat }) => (
              <View key={stat.name} style={styles.statRow}>
                <Text style={styles.statName}>{translateLabel(stat.name)}</Text>
                <View style={styles.statTrack}>
                  <View style={[styles.statFill, {
                    width: `${Math.min(Math.max(base_stat / 200, 0), 1) * 100}%`,
                  }]} />
                </View>
                <Text style={styles.statValue}>{base_stat}</Text>
              </View>
            ))}
            <Text style={styles.source}>Fonte: PokéAPI. Nomes de habilidades podem aparecer em inglês.</Text>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderColor: colors.border,
  },
  toolbarTitle: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  close: { color: colors.purple, fontWeight: '800', fontSize: 15 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLabel: { marginTop: 13, color: colors.muted },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 55 },
  hero: {
    height: 218, borderRadius: 23, backgroundColor: colors.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  heroImage: { width: 204, height: 204 },
  number: { color: colors.purple, fontWeight: '700', fontSize: 14, marginTop: 22 },
  name: { color: colors.text, fontWeight: '900', fontSize: 32, marginTop: 5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  tag: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 24,
    backgroundColor: colors.lavender, marginRight: 8, marginBottom: 8,
  },
  tagText: { color: colors.deepPurple, fontWeight: '700' },
  metrics: { flexDirection: 'row', gap: 12, marginTop: 14 },
  metric: { flex: 1, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  metricLabel: { color: colors.muted, fontSize: 12 },
  metricValue: { color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 6 },
  heading: { color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 27, marginBottom: 12 },
  description: { color: colors.muted, lineHeight: 22, fontSize: 15 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  statName: { color: colors.muted, fontSize: 12, fontWeight: '600', width: 94 },
  statTrack: { flex: 1, backgroundColor: colors.border, height: 10, borderRadius: 12, overflow: 'hidden' },
  statFill: { backgroundColor: colors.purple, height: '100%', borderRadius: 12 },
  statValue: { color: colors.text, fontSize: 12, fontWeight: '800', width: 32, textAlign: 'right' },
  source: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 24 },
});
