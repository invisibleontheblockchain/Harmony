import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Theme } from '../theme/Theme';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  plays: number;
  nftListed: boolean;
}

const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Midnight Echoes', plays: 4520, nftListed: false },
  { id: '2', title: 'Neon Drift', plays: 3180, nftListed: true },
  { id: '3', title: 'Crystal Caves', plays: 2100, nftListed: false },
  { id: '4', title: 'Pulse', plays: 1670, nftListed: true },
];

const chartData = [
  { day: 'Mon', streams: 120 },
  { day: 'Tue', streams: 190 },
  { day: 'Wed', streams: 150 },
  { day: 'Thu', streams: 220 },
  { day: 'Fri', streams: 280 },
  { day: 'Sat', streams: 350 },
  { day: 'Sun', streams: 310 },
];

export function StudioScreen() {
  const renderTrackItem = ({ item }: { item: Track }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.bgSecondary,
        padding: Theme.spacing.space3,
        borderRadius: Theme.radius.md,
        marginBottom: Theme.spacing.space2,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }}>
          {item.plays.toLocaleString()} plays
        </Text>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: item.nftListed ? Theme.colors.bgHover : Theme.colors.accentPurple,
          paddingVertical: Theme.spacing.space2,
          paddingHorizontal: Theme.spacing.space3,
          borderRadius: Theme.radius.sm,
        }}
      >
        <Text style={{ color: item.nftListed ? Theme.colors.textSecondary : Theme.colors.textInverse, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.xs }}>
          {item.nftListed ? 'Listed' : 'List as NFT'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Theme.colors.bgPrimary, paddingTop: Theme.spacing.space6 }}>
      <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.xxl, paddingHorizontal: Theme.spacing.space4, marginBottom: Theme.spacing.space4 }}>
        Artist Studio
      </Text>

      <View style={{ backgroundColor: Theme.colors.bgSecondary, borderRadius: Theme.radius.lg, marginHorizontal: Theme.spacing.space4, padding: Theme.spacing.space4, marginBottom: Theme.spacing.space4 }}>
        <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.lg, marginBottom: Theme.spacing.space2 }}>
          Weekly Streams
        </Text>
        <VictoryChart
          theme={VictoryTheme.material}
          width={SCREEN_WIDTH - Theme.spacing.space8}
          height={180}
          padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
        >
          <VictoryAxis style={{ axis: { stroke: Theme.colors.borderSubtle }, tickLabels: { fill: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: 10 } }} />
          <VictoryAxis dependentAxis style={{ axis: { stroke: Theme.colors.borderSubtle }, tickLabels: { fill: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: 10 } }} />
          <VictoryLine
            data={chartData}
            x="day"
            y="streams"
            style={{
              data: { stroke: Theme.colors.accentPurple, strokeWidth: 2 },
            }}
          />
        </VictoryChart>
      </View>

      <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.semibold, fontSize: Theme.fontSizes.md, paddingHorizontal: Theme.spacing.space4, marginBottom: Theme.spacing.space3 }}>
        Your Tracks
      </Text>
      <View style={{ paddingHorizontal: Theme.spacing.space4, paddingBottom: Theme.spacing.space8 }}>
        <FlatList
          data={MOCK_TRACKS}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}
