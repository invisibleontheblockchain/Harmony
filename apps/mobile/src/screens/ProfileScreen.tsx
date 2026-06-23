import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '../theme/Theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export function ProfileScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Theme.colors.bgPrimary }}>
      <View style={{ alignItems: 'center', paddingTop: Theme.spacing.space8, paddingHorizontal: Theme.spacing.space4 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: Theme.radius.full,
            backgroundColor: Theme.colors.bgSecondary,
            borderWidth: 2,
            borderColor: Theme.colors.accentPurple,
            marginBottom: Theme.spacing.space4,
          }}
        />
        <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.xl }}>
          Aurora Veil
        </Text>
        <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.base, marginTop: Theme.spacing.space1 }}>
          Artist
        </Text>
      </View>

      <View style={{ paddingHorizontal: Theme.spacing.space4, marginTop: Theme.spacing.space6 }}>
        <View
          style={{
            backgroundColor: Theme.colors.bgSecondary,
            borderRadius: Theme.radius.lg,
            padding: Theme.spacing.space4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.space4 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.lg }}>24</Text>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }}>Tracks</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.lg }}>12K</Text>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }}>Plays</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.bold, fontSize: Theme.fontSizes.lg }}>$840</Text>
              <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.regular, fontSize: Theme.fontSizes.sm }}>Earned</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: Theme.spacing.space4 }}>
          {['Wallet & Payouts', 'NFT Collection', 'Artist Verification', 'Settings'].map((item) => (
            <TouchableOpacity
              key={item}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: Theme.colors.bgSecondary,
                padding: Theme.spacing.space4,
                borderRadius: Theme.radius.md,
                marginBottom: Theme.spacing.space2,
              }}
            >
              <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.medium, fontSize: Theme.fontSizes.base }}>
                {item}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
