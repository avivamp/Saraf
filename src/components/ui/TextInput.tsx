/**
 * src/components/ui/TextInput.tsx
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';

interface Props extends TextInputProps {
  label?:     string;
  error?:     string;
  style?:     ViewStyle;
  mono?:      boolean;
}

export function TextInput({ label, error, style, mono = false, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {!!label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
      <RNTextInput
        {...rest}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); rest.onBlur?.(e); }}
        placeholderTextColor={COLORS.textDisabled}
        style={[
          styles.input,
          mono && styles.inputMono,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SPACING['1'] },

  label: {
    color:        COLORS.textSecondary,
    fontSize:     TYPOGRAPHY.size['2xs'],
    fontWeight:   TYPOGRAPHY.weight.semibold,
    letterSpacing: 1.4,
    marginBottom: SPACING['1'],
  },

  input: {
    backgroundColor: COLORS.background,
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.md,
    paddingHorizontal: SPACING['4'],
    paddingVertical:   SPACING['3'],
    color:           COLORS.textPrimary,
    fontSize:        TYPOGRAPHY.size.sm,
    fontFamily:      TYPOGRAPHY.family.sans,
  },
  inputMono:    { fontFamily: TYPOGRAPHY.family.mono },
  inputFocused: { borderColor: COLORS.goldSubtle },
  inputError:   { borderColor: COLORS.error },

  error: {
    color:    COLORS.error,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: SPACING['1'],
  },
});
