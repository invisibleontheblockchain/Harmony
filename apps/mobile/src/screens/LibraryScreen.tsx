import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../theme/Theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export function LibraryScreen() {
  const MOCK_LIBRARY = [
    { id: '1', title: 'Midnight Echoes', artist: 'Aurora Veil' },
    { id: '2', title: 'Neon Drift', artist: 'Solar Flare' },
    { id: '3', title: 'Crystal Caves', artist: 'Deep Resonance' },
    { id: '4', title: 'Pulse', artist: 'Rhythm Theory' },
    { id: '5', title: 'Starlight', artist: 'Nova Echo' },
  ];

  const renderItem = ({ item }: { item: { id: string; title: string; artist: string } }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.bgSecondary,
        padding: Theme.spacing.space3,
        borderRadius: Theme.radius.md,
        marginBottom: Theme.spacing.space2,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: Theme.radius.sm,
          backgroundColor: Theme.colors.accentPurple,
        }}
      />
      <View style={{ flex: 1, marginLeft: Theme.spacing.space3 }}>
        <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={20} color={Theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.bgPrimary, paddingTop: Theme.spacing.space6 }}>
      <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.xxl, paddingHorizontal: Theme.spacing.space4, marginBottom: Theme.spacing.space4 }}>
        Your Library
      </Text>
      <FlatList
        data={MOCK_LIBRARY}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: Theme.spacing.space4, paddingBottom: Theme.spacing.space8 }}
      />
    </View>
  );
}
