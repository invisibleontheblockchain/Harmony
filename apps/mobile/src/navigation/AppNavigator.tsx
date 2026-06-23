import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { StudioScreen } from '../screens/StudioScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FullScreenPlayerScreen } from '../screens/FullScreenPlayerScreen';
import { Theme } from '../theme/Theme';
import { usePlayer } from '../providers/PlayerProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={{ backgroundColor: Theme.colors.bgPrimary }}>
      <MiniPlayer onPress={() => navigation.navigate('Player')} />
      <View style={{ flexDirection: 'row', backgroundColor: Theme.colors.bgSecondary, borderTopColor: Theme.colors.borderSubtle, borderTopWidth: 1 }}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = options.tabBarIconName || (isFocused ? options.tabBarActiveIcon || 'home' : options.tabBarInactiveIcon || 'home-outline');

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: Theme.spacing.space3,
              }}
            >
              <Ionicons name={iconName as any} size={24} color={isFocused ? Theme.colors.accentPurple : Theme.colors.textSecondary} />
              <Text style={{ color: isFocused ? Theme.colors.accentPurple : Theme.colors.textSecondary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.xs, marginTop: 2 }}>
                {options.tabBarLabel || route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MiniPlayer({ onPress }: { onPress: () => void }) {
  const { currentTrack, isPlaying, pause, resume } = usePlayer();

  // Don't render if nothing is playing
  if (!currentTrack) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginHorizontal: Theme.spacing.space4,
        marginTop: Theme.spacing.space2,
        marginBottom: Theme.spacing.space2,
        backgroundColor: Theme.colors.bgSecondary,
        borderRadius: Theme.radius.md,
        padding: Theme.spacing.space3,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
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
          {currentTrack.title}
        </Text>
        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: Theme.spacing.space4 }}>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); isPlaying ? pause() : resume(); }}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={Theme.colors.accentCyan} />
        </TouchableOpacity>
        <Ionicons name="play-skip-forward" size={22} color={Theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function TabNavigator({ navigation }: any) {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIconName: 'home',
        } as any}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIconName: 'search',
        } as any}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIconName: 'library',
        } as any}
      />
      <Tab.Screen
        name="Studio"
        component={StudioScreen}
        options={{
          tabBarLabel: 'Studio',
          tabBarIconName: 'musical-notes',
        } as any}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIconName: 'person',
        } as any}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="Player"
        component={FullScreenPlayerScreen}
        options={{ presentation: 'modal', gestureDirection: 'vertical' }}
      />
    </Stack.Navigator>
  );
}
