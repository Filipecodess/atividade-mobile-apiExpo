import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function FeedbackState({ title, message, loading = false, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color={colors.purple} style={styles.spinner} />}
      <Text style={styles.title}>{title}</Text>
      {Boolean(message) && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  spinner: { marginBottom: 18 },
  title: { color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'center' },
  message: { color: colors.muted, marginTop: 10, lineHeight: 21, textAlign: 'center' },
  button: {
    backgroundColor: colors.purple, paddingHorizontal: 19, paddingVertical: 12,
    borderRadius: 12, marginTop: 18,
  },
  buttonText: { color: colors.white, fontWeight: '700' },
});
