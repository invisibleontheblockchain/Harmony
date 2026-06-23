import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../theme/Theme';
import { usePlayer, Track } from '../providers/PlayerProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

// Uses the player queue as the library for now — will be replaced with
// a dedicated "saved tracks" API once the user favorites endpoint exists.
const MOCK_LIBRARY: Track[] = [
  { id: '1', title: 'Midnight Echoes', artist: 'Aurora Veil' },
  { id: '2', title: 'Neon Drift', artist: 'Solar Flare' },
  { id: '3', title: 'Crystal Caves', artist: 'Deep Resonance' },
  { id: '4', title: 'Pulse', artist: 'Rhythm Theory' },
  { id: '5', title: 'Starlight', artist: 'Nova Echo' },
];

export function LibraryScreen({ navigation }: any) {
  const { play, currentTrack, isPlaying } = usePlayer();

  const handleTrackPress = (track: Track) => {
    play(track);
    navigation.navigate('Player', { track });
  };

  const renderItem = ({ item }: { item: Track }) => {
    const isCurrentlyPlaying = currentTrack?.id === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleTrackPress(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isCurrentlyPlaying ? Theme.colors.bgTertiary : Theme.colors.bgSecondary,
          padding: Theme.spacing.space3,
          borderRadius: Theme.radius.md,
          marginBottom: Theme.spacing.space2,
          borderLeftWidth: isCurrentlyPlaying ? 3 : 0,
          borderLeftColor: Theme.colors.accentPurple,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: Theme.radius.sm,
            backgroundColor: isCurrentlyPlaying ? Theme.colors.accentCyan : Theme.colors.accentPurple,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isCurrentlyPlaying && isPlaying ? 'pause' : 'musical-note'}
            size={20}
            color={Theme.colors.textInverse}
          />
        </View>
        <View style={{ flex: 1, marginLeft: Theme.spacing.space3 }}>
          <Text
            style={{
              color: isCurrentlyPlaying ? Theme.colors.accentPurple : Theme.colors.textPrimary,
              fontFamily: Theme.fonts.medium,
              fontSize: Theme.fontSizes.base,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={20} color={Theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

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
