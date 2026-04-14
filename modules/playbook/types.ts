export interface PostExample {
  caption: string;
  hashtags: string;
  pilar: string;
  format: string;
  engagement_rate?: number;
  notes?: string;
}

export interface BrandPlaybook {
  id: string;
  account_id: string;
  tone_of_voice: string | null;
  style: string | null;
  mandatory_words: string[];
  forbidden_words: string[];
  default_cta: string | null;
  do_examples: string | null;
  dont_examples: string | null;
  post_examples: PostExample[];
  extra_instructions: string | null;
  updated_at: string;
}
