'use client';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Theme } from '../theme/Theme';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre?: string;
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const CATEGORIES = ['Electronic', 'Hip-Hop', 'Rock', 'Jazz', 'Classical', 'Pop', 'Ambient', 'Techno', 'R&B', 'Lo-Fi'];

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.bgPrimary }}>
      <View style={{ paddingHorizontal: Theme.spacing.space4, paddingTop: Theme.spacing.space6 }}>
        <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.xxl, marginBottom: Theme.spacing.space4 }}>
          Discover
        </Text>

        <TextInput
          placeholder="Search tracks, artists, albums..."
          placeholderTextColor={Theme.colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          style={{
            backgroundColor: Theme.colors.bgSecondary,
            color: Theme.colors.textPrimary,
            fontFamily: Theme.fonts.regular,
            fontSize: Theme.fontSizes.base,
            paddingHorizontal: Theme.spacing.space4,
            paddingVertical: Theme.spacing.space3,
            borderRadius: Theme.radius.md,
            marginBottom: Theme.spacing.space4,
          }}
        />

        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, marginBottom: Theme.spacing.space3 }}>
          Browse Categories
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.space2, marginBottom: Theme.spacing.space4 }}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
              style={{
                backgroundColor: selectedCategory === category ? Theme.colors.accentPurple : Theme.colors.bgSecondary,
                paddingHorizontal: Theme.spacing.space4,
                paddingVertical: Theme.spacing.space2,
                borderRadius: Theme.radius.full,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === category ? Theme.colors.textInverse : Theme.colors.textPrimary,
                  fontFamily: Theme.fonts.medium,
                  fontSize: Theme.fontSizes.sm,
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, marginBottom: Theme.spacing.space3 }}>
          Results
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={({ item }: { item: { title: string; artist: string } }) => (
          <View style={{ paddingHorizontal: Theme.spacing.space4, paddingVertical: Theme.spacing.space3, borderBottomColor: Theme.colors.borderSubtle, borderBottomWidth: 1 }}>
            <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }}>{item.title}</Text>
            <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }}>{item.artist}</Text>
          </View>
        )}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={{ paddingHorizontal: Theme.spacing.space4, paddingBottom: Theme.spacing.space8 }}
        ListEmptyComponent={
          <Text style={{ color: Theme.colors.textTertiary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.base, textAlign: 'center', marginTop: Theme.spacing.space8 }}>
            {query ? 'No tracks found. Try another search.' : 'Start typing to discover music.'}
          </Text>
        }
      />
    </View>
  );
}
