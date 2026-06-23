import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import { Theme } from '../theme/Theme';
import { usePlayer } from '../providers/PlayerProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function FullScreenPlayerScreen({ route, navigation }: any) {
  const { currentTrack, isPlaying, progress, pause, resume, skipNext, skipPrevious, seekTo, play } = usePlayer();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // If navigated with a track param and it's not the current track, play it
  const routeTrack = route.params?.track;
  useEffect(() => {
    if (routeTrack && (!currentTrack || currentTrack.id !== routeTrack.id)) {
      play({
        id: routeTrack.id,
        title: routeTrack.title,
        artist: routeTrack.artist || routeTrack.artistName || 'Unknown Artist',
        artwork: routeTrack.artwork,
        fileUrlHls: routeTrack.fileUrlHls,
      });
    }
  }, [routeTrack?.id]);

  const track = currentTrack || routeTrack || {
    title: 'No Track Selected',
    artist: 'Select a track to play',
    artwork: '',
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          navigation.goBack();
        }
      },
    })
  ).current;

  const displayPosition = isSeeking ? seekValue : progress.position;
  const displayDuration = progress.duration || track.durationSeconds || 0;

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.bgPrimary }} {...panResponder.panHandlers}>
      {/* Background blur overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: Theme.colors.bgPrimary,
        }}
      />
      <BlurView intensity={60} tint="dark" style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: Theme.spacing.space6, paddingTop: Theme.spacing.space8, paddingBottom: Theme.spacing.space8 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-down" size={28} color={Theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }}>
              Now Playing
            </Text>
            <Ionicons name="ellipsis-horizontal" size={24} color={Theme.colors.textPrimary} />
          </View>

          {/* Album Art Placeholder */}
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: SCREEN_WIDTH - Theme.spacing.space12,
                height: SCREEN_WIDTH - Theme.spacing.space12,
                borderRadius: Theme.radius.xl,
                backgroundColor: Theme.colors.bgSecondary,
                borderWidth: 1,
                borderColor: Theme.colors.borderSubtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="musical-notes" size={80} color={Theme.colors.accentPurple} />
            </View>
          </View>

          {/* Track Info + Slider */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.space4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.xxl }} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.lg, marginTop: Theme.spacing.space1 }}>
                  {track.artist}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: Theme.colors.accentPurple,
                  borderRadius: Theme.radius.full,
                  paddingHorizontal: Theme.spacing.space4,
                  paddingVertical: Theme.spacing.space2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Theme.spacing.space2,
                }}
              >
                <Ionicons name="diamond" size={16} color={Theme.colors.textInverse} />
                <Text style={{ color: Theme.colors.textInverse, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.sm }}>
                  View NFT
                </Text>
              </TouchableOpacity>
            </View>

            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={displayDuration || 100}
              value={displayPosition}
              onSlidingStart={() => setIsSeeking(true)}
              onValueChange={(value: number) => setSeekValue(value)}
              onSlidingComplete={(value: number) => {
                setIsSeeking(false);
                seekTo(value);
              }}
              minimumTrackTintColor={Theme.colors.accentPurple}
              maximumTrackTintColor={Theme.colors.borderDefault}
              thumbTintColor={Theme.colors.accentPurple}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.xs }}>
                {formatTime(displayPosition)}
              </Text>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.xs }}>
                {formatTime(displayDuration)}
              </Text>
            </View>
          </View>

          {/* Playback Controls */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: Theme.spacing.space4 }}>
            <Ionicons name="shuffle" size={24} color={Theme.colors.textSecondary} />
            <TouchableOpacity onPress={skipPrevious}>
              <Ionicons name="play-skip-back" size={32} color={Theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={isPlaying ? pause : resume}>
              <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={72} color={Theme.colors.accentPurple} />
            </TouchableOpacity>
            <TouchableOpacity onPress={skipNext}>
              <Ionicons name="play-skip-forward" size={32} color={Theme.colors.textPrimary} />
            </TouchableOpacity>
            <Ionicons name="repeat" size={24} color={Theme.colors.textSecondary} />
          </View>
        </View>
      </BlurView>
    </View>
  );
}
