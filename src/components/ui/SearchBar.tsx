/**
 * src/components/ui/SearchBar.tsx
 */

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';

interface Props {
  value:        string;
  onChangeText: (text: string) => void;
  onClear:      () => void;
  placeholder?: string;
  autoFocus?:   boolean;
}

export function SearchBar({ value, onChangeText, onClear, placeholder = 'Search products…', autoFocus }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <View style={styles.iconWrap}>
          {/* Search icon using text — no icon library needed */}
          <TextInput
            style={styles.searchIcon}
            value="🔍"
            editable={false}
            pointerEvents="none"
          />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} style={styles.clearBtn} hitSlop={8}>
            <TextInput
              style={styles.clearIcon}
              value="✕"
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: SPACING['5'],
    paddingVertical:   SPACING['2'],
    backgroundColor:   COLORS.background,
  },
  bar: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.full,
    paddingHorizontal: SPACING['3'],
    height:          42,
  },
  iconWrap:   { marginRight: SPACING['2'] },
  searchIcon: { fontSize: 14, color: COLORS.textSecondary, padding: 0 },
  input: {
    flex:       1,
    color:      COLORS.textPrimary,
    fontSize:   TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.family.sans,
    padding:    0,
  },
  clearBtn:  { padding: SPACING['1'] },
  clearIcon: { fontSize: 11, color: COLORS.textSecondary, padding: 0 },
});
