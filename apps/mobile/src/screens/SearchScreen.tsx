import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/Theme';
import { usePlayer } from '../providers/PlayerProvider';
import { searchTracks, fetchTracks, apiTrackToPlayerTrack, ApiTrack } from '../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';

const CATEGORIES = ['Electronic', 'Hip-Hop', 'Rock', 'Jazz', 'Classical', 'Pop', 'Ambient', 'Techno', 'R&B', 'Lo-Fi'];

export function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<ApiTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { play } = usePlayer();

  // Debounced search
  useEffect(() => {
    if (query.trim().length === 0 && !selectedCategory) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (query.trim().length > 0) {
          const tracks = await searchTracks(query);
          setResults(tracks);
        } else if (selectedCategory) {
          const tracks = await fetchTracks({ genre: selectedCategory, limit: 20 });
          setResults(tracks);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, selectedCategory]);

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setQuery('');
  };

  const handleTrackPress = (track: ApiTrack) => {
    const playerTrack = apiTrackToPlayerTrack(track);
    play(playerTrack);
    navigation.navigate('Player', { track: playerTrack });
  };

  const renderTrackResult = ({ item }: { item: ApiTrack }) => (
    <TouchableOpacity
      onPress={() => handleTrackPress(item)}
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="musical-note" size={20} color={Theme.colors.textInverse} />
      </View>
      <View style={{ flex: 1, marginLeft: Theme.spacing.space3 }}>
        <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }} numberOfLines={1}>
          {item.artist_name} {item.genre ? `· ${item.genre}` : ''}
        </Text>
      </View>
      <Text style={{ color: Theme.colors.textTertiary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.xs }}>
        {Math.floor((item.duration_seconds || 0) / 60)}:{((item.duration_seconds || 0) % 60).toString().padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  );

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
          onChangeText={(text) => { setQuery(text); if (text.length > 0) setSelectedCategory(null); }}
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
              onPress={() => handleCategoryPress(category)}
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

        {(query.trim().length > 0 || selectedCategory) && (
          <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, marginBottom: Theme.spacing.space3 }}>
            Results {results.length > 0 ? `(${results.length})` : ''}
          </Text>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Theme.colors.accentPurple} style={{ marginTop: Theme.spacing.space8 }} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderTrackResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Theme.spacing.space4, paddingBottom: Theme.spacing.space8 }}
          ListEmptyComponent={
            <Text style={{ color: Theme.colors.textTertiary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.base, textAlign: 'center', marginTop: Theme.spacing.space8 }}>
              {query || selectedCategory ? 'No tracks found. Try another search.' : 'Start typing or select a category to discover music.'}
            </Text>
          }
        />
      )}
    </View>
  );
}
