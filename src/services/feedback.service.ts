/**
 * src/services/feedback.service.ts
 */

import { supabase } from '@lib/supabase';

export interface FeedbackPayload {
  userId:    string | null;
  rating:    number;
  category:  string;
  message:   string;
}

export const FeedbackService = {
  async submit({ userId, rating, category, message }: FeedbackPayload): Promise<void> {
    const { error } = await supabase.from('feedback').insert({
      user_id:    userId ?? null,
      guest_mode: !userId,
      rating,
      category,
      message:    message.trim(),
    });
    if (error) throw new Error(error.message);
  },
} as const;
