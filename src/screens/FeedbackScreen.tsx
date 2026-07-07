/**
 * src/screens/FeedbackScreen.tsx
 */

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@constants/design';
import { Button }  from '@components/ui/Button';
import { useAuthStore, selectUser } from '@store/auth.store';
import { FeedbackService } from '@services/feedback.service';
import type { ProfileStackParamList } from '@types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Feedback'>;

const CATEGORIES = ['App Experience', 'Products', 'Checkout', 'Delivery', 'Other'] as const;

export function FeedbackScreen({ navigation }: Props) {
  const user = useAuthStore(selectUser);

  const [rating,   setRating]   = useState(0);
  const [category, setCategory] = useState('');
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = rating > 0 && category.length > 0 && message.trim().length > 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await FeedbackService.submit({
        userId:   user?.id ?? null,
        rating,
        category,
        message,
      });
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successWrap}>
        <Text style={styles.successEmoji}>🙏</Text>
        <Text style={styles.successTitle}>Thank You!</Text>
        <Text style={styles.successSub}>
          Your feedback has been received. We take every response seriously
          — even for a satirical gold biryani app.
        </Text>
        <Button
          fullWidth
          size="lg"
          onPress={() => navigation.goBack()}
          style={{ marginTop: SPACING['6'] }}
        >
          Back to Profile
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Share Your Feedback</Text>
        <Text style={styles.sub}>
          Tell us what you think. We read every response.
        </Text>

        {/* Star rating */}
        <View style={styles.section}>
          <Text style={styles.label}>How would you rate your experience?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={6}
              >
                <Text style={[styles.star, star <= rating && styles.starActive]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </Text>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>What is your feedback about?</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.label}>Tell us more</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Share your thoughts, suggestions, or complaints (we can take it)…"
            placeholderTextColor={COLORS.textDisabled}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.textarea}
          />
          <Text style={styles.charCount}>{message.trim().length} / 500</Text>
        </View>

        {/* User context */}
        {user && (
          <View style={styles.userPill}>
            <Text style={styles.userPillText}>
              Submitting as {user.email}
            </Text>
          </View>
        )}

        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={!isValid || loading}
          onPress={handleSubmit}
          style={styles.submitBtn}
        >
          Submit Feedback
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING['5'], paddingBottom: SPACING['12'] },

  heading: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['1'] },
  sub:     { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     marginBottom: SPACING['6'] },

  section: { marginBottom: SPACING['6'] },
  label:   { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING['3'] },

  // Star rating
  stars:       { flexDirection: 'row', gap: SPACING['3'] },
  star:        { fontSize: 36, color: COLORS.border },
  starActive:  { color: COLORS.gold },
  ratingLabel: { color: COLORS.goldBright, fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: SPACING['2'] },

  // Category chips
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING['2'] },
  categoryChip: {
    paddingHorizontal: SPACING['4'],
    paddingVertical:   SPACING['2'],
    borderRadius:      RADII.full,
    borderWidth:       1,
    borderColor:       COLORS.border,
    backgroundColor:   COLORS.surface,
  },
  categoryChipActive: {
    borderColor:     COLORS.goldSubtle,
    backgroundColor: 'rgba(212,176,94,0.12)',
  },
  categoryText:       { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm },
  categoryTextActive: { color: COLORS.goldBright,    fontWeight: TYPOGRAPHY.weight.semibold },

  // Message textarea
  textarea: {
    backgroundColor:  COLORS.surface,
    borderWidth:      1,
    borderColor:      COLORS.border,
    borderRadius:     RADII.lg,
    padding:          SPACING['4'],
    color:            COLORS.textPrimary,
    fontSize:         TYPOGRAPHY.size.sm,
    minHeight:        130,
    lineHeight:       TYPOGRAPHY.size.sm * 1.6,
  },
  charCount: { color: COLORS.textDisabled, fontSize: TYPOGRAPHY.size.xs, marginTop: SPACING['1'], textAlign: 'right' },

  // User pill
  userPill: {
    backgroundColor: COLORS.surfaceRaised,
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.md,
    padding:         SPACING['3'],
    marginBottom:    SPACING['4'],
  },
  userPillText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.xs },

  submitBtn: {},

  // Success state
  successWrap:  { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING['8'] },
  successEmoji: { fontSize: 56, marginBottom: SPACING['4'] },
  successTitle: { color: COLORS.textPrimary,   fontSize: TYPOGRAPHY.size['3xl'], fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING['2'] },
  successSub:   { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.sm,     textAlign: 'center', lineHeight: TYPOGRAPHY.size.sm * 1.65 },
});
