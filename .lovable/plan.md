## Blood Work Results & Recommendations

A new authenticated section where users record lab marker results, upload reports for AI extraction, see which markers are out-of-range, get supplement recommendations, and track trends over time.

### User flows

1. **Manual entry** — Pick marker (e.g. Vitamin D, Ferritin, B12, TSH), enter value, unit, test date, and the lab's reference range (low/high). Optional notes.
2. **Upload report** — Drop a PDF or photo of a lab report. A backend function uses Lovable AI (Gemini) to extract markers, values, units, ranges, and date into a draft list the user reviews/edits before saving.
3. **Results dashboard** — Latest panel grouped by status (low / normal / high), with a "Recommendations" section mapping out-of-range markers to supplements from the existing catalog, with one-click add-to-stack.
4. **Trends** — Per-marker line chart (Recharts) over all entries, shaded reference band.

### Data model (new tables, RLS to `auth.uid() = user_id`)

- `blood_markers` (public read, admin write) — seed catalog: `key`, `name`, `default_unit`, `category`, `description`, plus mapping rows to existing `supplements` for low/high deficiency recommendations (e.g. low Vitamin D → Vitamin D3 supplement).
- `blood_marker_supplements` — `marker_id`, `supplement_id`, `direction` (`low`|`high`), `priority`, `notes`.
- `blood_work_reports` — `user_id`, `test_date`, `lab_name`, `source` (`manual`|`upload`), `original_file_path` (storage), `notes`.
- `blood_work_results` — `user_id`, `report_id`, `marker_id`, `value numeric`, `unit text`, `range_low numeric`, `range_high numeric`, `status` (computed: low/normal/high), `notes`.
- Storage bucket `bloodwork-uploads` (private), RLS so users only access their own folder.

### Backend

- Edge function `extract-bloodwork`: receives uploaded file URL, calls Lovable AI with a JSON schema (markers[]), returns draft results for confirmation. No data written until user saves.
- Status is derived in the client from `value` vs `range_low`/`range_high`; also stored for indexing.

### Frontend

- New route `/blood-work` (auth-gated) with tabs: **Latest Results**, **Upload**, **Trends**, **History**.
- New components:
  - `BloodWorkUpload.tsx` — file dropzone, calls edge function, renders editable draft table.
  - `ManualResultForm.tsx` — zod-validated form for one or many markers.
  - `ResultsPanel.tsx` — grouped by status with badges (low/high in destructive, normal in success).
  - `RecommendationsCard.tsx` — pulls out-of-range markers, joins `blood_marker_supplements`, shows add-to-stack buttons (reuses `useStack`).
  - `MarkerTrendChart.tsx` — Recharts line chart per marker with reference band.
- Hooks: `useBloodMarkers`, `useBloodWorkReports`, `useBloodWorkResults`, `useExtractBloodWork`.
- Nav link added in `Header.tsx` for signed-in users.

### Recommendations logic

For each result with `status != normal`, look up `blood_marker_supplements` rows matching the direction, sort by priority, render with the existing `SupplementCard`-style row and "Add to stack" button. Always show the standard medical disclaimer (per project Core memory).

### Out of scope

- Auto-saving extracted results without user confirmation.
- Sharing blood work publicly.
- Multi-user / clinician views.

### Validation & security

- All forms validated with zod (value > 0, dates not in future, unit ≤ 20 chars, notes ≤ 1000).
- RLS confines reads/writes to the owner; storage policies confine files to `bloodwork-uploads/{user_id}/...`.
- Medical disclaimer shown on the dashboard and recommendations card.
