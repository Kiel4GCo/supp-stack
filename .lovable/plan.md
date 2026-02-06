

# Implementation Plan

This plan covers four features: importing supplements from shared stacks, email reminders via backend functions, an analytics dashboard with adherence charts, and custom cost fields in the admin panel.

---

## 1. Import Supplements from Shared Stack

Add an "Import to My Stack" button on the shared stack page (`SharedStack.tsx`) that copies all supplements into the user's local stack with one click.

- Add an "Import to My Stack" button to `SharedStack.tsx`
- Use the existing `useStack` hook's `addToStack` method to import each supplement
- Optionally copy schedules into the stack builder's schedule state via URL params or direct navigation
- After import, redirect the user to `/stack-builder` with a success toast
- If the user is signed in, also offer a "Save to Account" option that creates a new saved stack via `useSaveStack`

---

## 2. Email Reminders via Backend Function

Create a backend function that sends email reminders as a backup to push notifications. This requires a Resend API key.

- **Create edge function** `supabase/functions/send-reminder-email/index.ts`
  - Accepts `email`, `supplements` (list of supplement names), and `reminderTime`
  - Uses Resend to send a formatted reminder email
  - Includes CORS headers and input validation
- **Create a database table** `email_reminder_preferences` to store user preferences:
  - `user_id`, `enabled` (boolean), `email` (text), `reminder_time` (time), `days_of_week` (array)
  - RLS policies so users can only manage their own preferences
- **Create a scheduled edge function** `supabase/functions/process-email-reminders/index.ts`
  - Runs on a cron schedule (e.g., every 15 minutes)
  - Queries `email_reminder_preferences` for users whose reminder time falls within the current window
  - Fetches their stack items and sends reminder emails
- **Add UI** in the Reminders tab: a new `EmailReminderSettings` component
  - Toggle to enable/disable email reminders
  - Email input (pre-filled from auth)
  - Time picker for when to receive the email
  - Day selection for which days to send

**Prerequisite**: A `RESEND_API_KEY` secret must be configured. The user will need to sign up at resend.com and provide their API key.

---

## 3. Analytics Dashboard with Adherence Charts

Create a new analytics page/tab showing adherence trends using Recharts (already installed).

- **New component** `src/components/stack/AdherenceDashboard.tsx`
  - Weekly adherence bar chart (days of week vs. percentage taken)
  - Monthly trend line chart (adherence rate over past months)
  - Per-supplement adherence breakdown (horizontal bar chart)
  - Streak counter (current and longest streak of consecutive days)
  - Summary cards: total doses taken, adherence rate, most/least consistent supplement
- **New hook** `src/hooks/useAdherenceAnalytics.ts`
  - Fetches adherence logs for configurable date ranges (7 days, 30 days, 90 days)
  - Computes weekly averages, monthly trends, per-supplement stats, and streaks
- **Add a new tab** "Analytics" with a chart icon to the `StackBuilder.tsx` tabs
- Uses Recharts `BarChart`, `LineChart`, and `ResponsiveContainer` components
- Requires sign-in to view (show sign-in prompt if not authenticated)

---

## 4. Custom Costs in Admin Panel

Add cost fields to the admin supplement form so admins can set accurate per-supplement pricing.

- **Update `SupplementForm.tsx`** to add three new fields in a "Cost Information" card:
  - `cost_per_unit` (number input, currency) -- cost per serving/unit
  - `units_per_container` (number input) -- how many servings per container
  - `servings_per_day` (number input, default 1) -- recommended daily servings
- **Update the form's `handleSubmit`** to include these fields in the data sent to the database
- **Update the form's `useEffect`** to populate these fields when editing an existing supplement
- The `CostTracker` component already reads `cost_per_unit` from the supplement data, so no changes needed there -- it will automatically use admin-set values instead of category defaults
- **Update the `Supplement` type** in `src/types/supplement.ts` to include `cost_per_unit`, `units_per_container`, and `servings_per_day` fields

---

## Technical Details

### Database Changes (Migration)
```sql
-- Email reminder preferences table
CREATE TABLE public.email_reminder_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  email text NOT NULL,
  reminder_time time NOT NULL DEFAULT '08:00',
  days_of_week text[] NOT NULL DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_reminder_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own preferences" ON public.email_reminder_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.email_reminder_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.email_reminder_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.email_reminder_preferences FOR DELETE USING (auth.uid() = user_id);

-- Add unique constraint
ALTER TABLE public.email_reminder_preferences ADD CONSTRAINT unique_user_email_pref UNIQUE (user_id);

-- Trigger for updated_at
CREATE TRIGGER update_email_reminder_preferences_updated_at
  BEFORE UPDATE ON public.email_reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Files to Create
- `supabase/functions/send-reminder-email/index.ts` -- email sending function
- `supabase/functions/process-email-reminders/index.ts` -- scheduled cron processor
- `src/components/stack/EmailReminderSettings.tsx` -- email reminder UI
- `src/components/stack/AdherenceDashboard.tsx` -- analytics charts
- `src/hooks/useAdherenceAnalytics.ts` -- analytics data processing
- `src/hooks/useEmailReminders.ts` -- email reminder preferences hook

### Files to Modify
- `src/pages/SharedStack.tsx` -- add import button
- `src/pages/StackBuilder.tsx` -- add Analytics tab
- `src/components/admin/SupplementForm.tsx` -- add cost fields
- `src/types/supplement.ts` -- add cost fields to Supplement type
- `supabase/config.toml` -- add verify_jwt config for new edge functions

### Sequencing
1. Database migration (new table)
2. Check/request RESEND_API_KEY secret
3. Create edge functions for email reminders
4. Update Supplement type with cost fields
5. Update SupplementForm with cost inputs
6. Build SharedStack import feature
7. Build AdherenceDashboard and analytics hook
8. Build EmailReminderSettings component
9. Integrate new tabs/features into StackBuilder
