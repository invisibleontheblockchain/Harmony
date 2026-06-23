import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/Theme';
import { usePlayer, Track } from '../providers/PlayerProvider';
import { fetchTracks, fetchRecommendations, apiTrackToPlayerTrack, ApiTrack } from '../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';

const MOCK_PROPOSALS = [
  { id: '1', title: 'Increase Artist Payout Split', votes: 1240 },
  { id: '2', title: 'Launch Community Remix Contest', votes: 856 },
  { id: '3', title: 'Reduce Platform Fee to 2%', votes: 2103 },
];

export function HomeScreen({ navigation }: any) {
  const [trending, setTrending] = useState<ApiTrack[]>([]);
  const [recent, setRecent] = useState<ApiTrack[]>([]);
  const [recommended, setRecommended] = useState<ApiTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { play } = usePlayer();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [trendingData, recentData] = await Promise.all([
        fetchTracks({ limit: 10 }).catch(() => []),
        fetchTracks({ limit: 5, offset: 5 }).catch(() => []),
      ]);
      setTrending(trendingData);
      setRecent(recentData);

      // Recommendations require a userId — use placeholder for now
      const recs = await fetchRecommendations('current-user').catch(() => []);
      setRecommended(recs);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPress = (track: ApiTrack) => {
    const playerTrack = apiTrackToPlayerTrack(track);
    play(playerTrack);
    navigation.navigate('Player', { track: playerTrack });
  };

  const renderTrackCard = ({ item }: { item: ApiTrack }) => (
    <TouchableOpacity
      style={{ width: 140, marginRight: Theme.spacing.space3 }}
      onPress={() => handleTrackPress(item)}
    >
      <View
        style={{
          width: 140,
          height: 140,
          borderRadius: Theme.radius.md,
          backgroundColor: Theme.colors.bgSecondary,
          marginBottom: Theme.spacing.space2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="musical-note" size={36} color={Theme.colors.accentPurple} />
      </View>
      <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.sm }} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.xs }} numberOfLines={1}>
        {item.artist_name}
      </Text>
    </TouchableOpacity>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Theme.colors.bgPrimary, paddingTop: Theme.spacing.space6 }}>
      <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.xxl, paddingHorizontal: Theme.spacing.space4, marginBottom: Theme.spacing.space4 }}>
        {getGreeting()}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Theme.colors.accentPurple} style={{ marginTop: Theme.spacing.space8 }} />
      ) : (
        <>
          {recent.length > 0 && (
            <>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, paddingHorizontal: Theme.spacing.space4, marginBottom: Theme.spacing.space3 }}>
                Continue Listening
              </Text>
              <FlatList
                data={recent}
                renderItem={renderTrackCard}
                keyExtractor={(item) => `recent-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.space4 }}
              />
            </>
          )}

          {trending.length > 0 && (
            <>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, paddingHorizontal: Theme.spacing.space4, marginTop: Theme.spacing.space6, marginBottom: Theme.spacing.space3 }}>
                Trending Now
              </Text>
              <FlatList
                data={trending}
                renderItem={renderTrackCard}
                keyExtractor={(item) => `trending-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.space4 }}
              />
            </>
          )}

          {recommended.length > 0 && (
            <>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, paddingHorizontal: Theme.spacing.space4, marginTop: Theme.spacing.space6, marginBottom: Theme.spacing.space3 }}>
                Recommended For You
              </Text>
              <FlatList
                data={recommended}
                renderItem={renderTrackCard}
                keyExtractor={(item) => `rec-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.space4, paddingBottom: Theme.spacing.space6 }}
              />
            </>
          )}

          {/* Empty state when no tracks available */}
          {trending.length === 0 && recent.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: Theme.spacing.space8, paddingHorizontal: Theme.spacing.space4 }}>
              <Ionicons name="musical-notes" size={64} color={Theme.colors.bgTertiary} />
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.lg, marginTop: Theme.spacing.space4, textAlign: 'center' }}>
                No tracks yet
              </Text>
              <Text style={{ color: Theme.colors.textTertiary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.base, marginTop: Theme.spacing.space2, textAlign: 'center' }}>
                Upload your first track in the Studio tab to get started.
              </Text>
            </View>
          )}
        </>
      )}

      {/* DAO Proposals section */}
      <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, paddingHorizontal: Theme.spacing.space4, marginTop: Theme.spacing.space4, marginBottom: Theme.spacing.space3 }}>
        Active DAO Proposals
      </Text>
      <View style={{ paddingHorizontal: Theme.spacing.space4, paddingBottom: Theme.spacing.space8 }}>
        {MOCK_PROPOSALS.map((proposal) => (
          <View
            key={proposal.id}
            style={{
              backgroundColor: Theme.colors.bgSecondary,
              borderRadius: Theme.radius.md,
              padding: Theme.spacing.space4,
              marginBottom: Theme.spacing.space3,
            }}
          >
            <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }}>
              {proposal.title}
            </Text>
            <Text style={{ color: Theme.colors.accentCyan, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm, marginTop: Theme.spacing.space1 }}>
              {proposal.votes.toLocaleString()} votes
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
