import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const CANONICAL = 'https://supplement-stack.lovable.app/muscle-building-guide';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Muscle Building Supplements: An Evidence-Based Guide',
  description:
    'Evidence-based guide to the supplements that actually support muscle growth, strength, and recovery — protein, creatine, beta-alanine, HMB, EAAs, and more.',
  author: { '@type': 'Organization', name: 'SupplementInfo' },
  mainEntityOfPage: CANONICAL,
};

export default function MuscleBuildingGuide() {
  return (
    <Layout>
      <Helmet>
        <title>Muscle Building Supplements: Evidence-Based Guide</title>
        <meta
          name="description"
          content="An evidence-based guide to muscle building supplements — protein, creatine, beta-alanine, HMB, EAAs, vitamin D, and omega-3 — plus dosing and timing."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Muscle Building Supplements: Evidence-Based Guide" />
        <meta
          property="og:description"
          content="What the research actually says about supplements for muscle growth, strength, and recovery."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-primary">Guide</p>
          <h1 className="text-4xl font-serif font-bold tracking-tight">
            Muscle Building Supplements: An Evidence-Based Guide
          </h1>
          <p className="text-lg text-muted-foreground">
            Training and nutrition drive muscle growth. A small handful of supplements have strong
            evidence for supporting hypertrophy, strength, and recovery when layered on top of a
            good program. Here is what the research actually supports.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">1. Protein: the foundation</h2>
          <p>
            Total daily protein intake is the single most important nutritional lever for muscle
            growth. Meta-analyses converge on roughly <strong>1.6–2.2 g/kg body weight per day</strong>{' '}
            spread across 3–5 meals of 0.3–0.4 g/kg each. Whole-food sources are ideal; whey,
            casein, or plant blends are convenient ways to hit the target.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">2. Creatine monohydrate</h2>
          <p>
            The most studied performance supplement in existence. A daily dose of{' '}
            <strong>3–5 g creatine monohydrate</strong> reliably increases strength, power output,
            and lean mass over weeks of training. Timing is not critical — consistency is.
          </p>
          <p>
            <Link to="/stack-builder" className="text-primary underline underline-offset-4">
              Add creatine to your stack →
            </Link>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">3. Beta-alanine</h2>
          <p>
            Buffers muscle acidity during high-rep sets and interval work. Effective at{' '}
            <strong>3.2–6.4 g per day</strong>, split into smaller doses to reduce the harmless
            tingling sensation (paresthesia). Best for sets in the 60-second-plus effort range.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">4. HMB and leucine / EAAs</h2>
          <p>
            <strong>HMB</strong> (3 g/day) shows a modest anti-catabolic effect, most useful in
            caloric deficits or when returning from a break. <strong>Leucine</strong> (2–3 g per
            meal) triggers muscle protein synthesis; if total protein is already high, extra EAAs
            add little on top.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">5. Vitamin D and omega-3</h2>
          <p>
            Low vitamin D status is linked to reduced strength and recovery. Correcting a
            deficiency (typically <strong>1,000–4,000 IU/day</strong>) helps; megadosing does not.
            <strong> Omega-3s (2–3 g EPA+DHA)</strong> support recovery, joint comfort, and may
            enhance the anabolic response to protein in older adults.
          </p>
          <p>
            Not sure where you stand?{' '}
            <Link to="/blood-work" className="text-primary underline underline-offset-4">
              Check your blood work
            </Link>{' '}
            or the{' '}
            <Link to="/deficiency-advisor" className="text-primary underline underline-offset-4">
              Deficiency Advisor
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">6. Timing and a sample stack</h2>
          <p>
            Distribute protein evenly. Take creatine any time of day. Split beta-alanine into 2–3
            doses. Take vitamin D and omega-3 with a meal containing fat.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Whey or blended protein — 25–40 g per meal to hit daily target</li>
            <li>Creatine monohydrate — 5 g/day</li>
            <li>Beta-alanine — 3.2 g/day (split doses)</li>
            <li>Vitamin D3 — 2,000 IU/day with food</li>
            <li>Omega-3 (EPA+DHA) — 2 g/day with food</li>
          </ul>
          <p>
            <Link to="/stack-builder" className="text-primary underline underline-offset-4">
              Build this stack →
            </Link>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">What to skip</h2>
          <p>
            Testosterone boosters, most pre-workout "proprietary blends," BCAAs when protein is
            already sufficient, and glutamine for healthy trainees all have weak or no evidence for
            muscle growth.
          </p>
        </section>

        <aside className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <strong>Medical disclaimer:</strong> This guide is for educational purposes only and is
          not medical advice. Talk to a qualified healthcare provider before starting any
          supplement, especially if you have a medical condition or take medication.
        </aside>
      </article>
    </Layout>
  );
}