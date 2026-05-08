# DecideOS v2 — AI Thinking Partner

> Not just analysis. Memory. Outcomes. Growth.

---

## What's New in v2

| Feature | Status |
|---|---|
| Decision Memory (7d / 30d / 90d follow-ups) | ✅ |
| Outcome Tracking + Feedback Loop | ✅ |
| Future Simulation Mode | ✅ |
| Regret Minimization System | ✅ |
| Anti-Bias Detection | ✅ |
| Thinking Style Detection | ✅ |
| Decision Gamification Score | ✅ |
| Life Insights Dashboard | ✅ |
| Weekly Activity Charts | ✅ |
| Visual Decision Timeline | ✅ |
| Short-term vs Long-term Impact | ✅ |
| Emotional Context Detection | ✅ |
| Micro / Standard / Deep / Simulate Modes | ✅ |
| Global Anonymous Insights (scaffold) | ✅ |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (Cabinet Grotesk + Satoshi fonts) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Magic Link |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
decideos/
├── app/
│   ├── api/
│   │   ├── analyze/        # Main AI decision endpoint
│   │   ├── outcome/        # Follow status + outcome tracking
│   │   ├── insights/       # AI life pattern analysis
│   │   ├── simulate/       # What-if simulation
│   │   ├── timeline/       # Decision history
│   │   ├── weekly-report/  # Weekly stats
│   │   └── decisions/      # CRUD operations
│   ├── dashboard/          # Main input + results
│   ├── history/            # Decision list + outcome tracker
│   ├── insights/           # Life patterns dashboard
│   ├── simulate/           # Future simulation page
│   ├── timeline/           # Visual decision timeline
│   ├── share/[token]/      # Public shared decisions
│   └── auth/               # Magic link auth
├── components/
│   ├── decision/
│   │   ├── DecisionForm.tsx       # Input with mode/tone selector
│   │   ├── DecisionResults.tsx    # Full structured output
│   │   ├── OutcomeTracker.tsx     # Follow status + outcome rating
│   │   └── ScoreWidget.tsx        # Gamification score ring
│   └── layout/
│       └── Nav.tsx
├── services/
│   ├── groq.ts             # AI analysis + life insights
│   └── decisions.ts        # All DB operations
├── lib/
│   ├── supabase.ts
│   ├── rate-limit.ts
│   └── utils.ts
├── types/index.ts          # Full TypeScript definitions
└── supabase-schema.sql     # Complete DB schema
```

---

## Setup (15 min to production)

### 1. Install

```bash
cd decideos
npm install
cp .env.local.example .env.local
```

### 2. Supabase

1. Create project at [supabase.com](https://supabase.com)
2. SQL Editor → paste `supabase-schema.sql` → Run
3. Authentication → Providers → Enable Email
4. Authentication → URL Configuration → set Site URL

### 3. Groq

Get a free API key at [console.groq.com](https://console.groq.com)

### 4. Fill .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

### 6. Deploy to Vercel

```bash
# Push to GitHub → Import in vercel.com → Add env vars → Deploy
```

---

## Decision AI Output (Full Schema)

```json
{
  "summary": "Objective 1-2 sentence summary",
  "mode": "standard",
  "options": ["Option A", "Option B", "Option C"],
  "analysis": [{
    "option": "Option A",
    "pros": ["specific pro"],
    "cons": ["specific con"],
    "short_term_impact": "What happens in 1-3 months",
    "long_term_impact": "What happens in 1-3 years",
    "risk_pct": 35,
    "effort_level": "Medium",
    "emotional_impact": "Mixed"
  }],
  "risk": "Low | Medium | High | Critical",
  "recommendation": "Decisive recommendation",
  "confidence_score": 78,
  "action_plan": ["Step 1", "Step 2"],
  "emotional_context": "User seems stressed and rushed",
  "bias_warnings": [{
    "type": "fear",
    "description": "You may be letting fear of failure override rational analysis"
  }],
  "regret_score": {
    "one_year": 65,
    "five_year": 82,
    "framing": "Will you regret NOT doing this in 5 years?"
  },
  "simulation": {
    "best_case": "Vivid optimistic outcome",
    "worst_case": "Vivid pessimistic outcome",
    "most_likely": "Realistic most probable outcome",
    "probability_success": 62,
    "timeline_months": 6
  },
  "thinking_style_hint": "overthinker"
}
```

---

## Analysis Modes

| Mode | Use Case | Options | Depth |
|---|---|---|---|
| `micro` | Quick daily decisions | 2 | Minimal |
| `standard` | Work / money / relationships | 3 | Balanced |
| `deep` | Life-changing decisions | 3 | Full |
| `simulate` | "What if" scenarios | 3 | Simulation-heavy |

## Decision Score Levels

| Score | Level |
|---|---|
| 0–199 | Beginner |
| 200–399 | Learning |
| 400–599 | Growing |
| 600–799 | Advanced |
| 800–1000 | Expert |

---

## Security

- Input validation via Zod on every API route
- Groq API key: server-side only, never exposed to client
- Supabase RLS: users can only access their own data
- Rate limiting: 20 requests/hour per IP (upgrade to Upstash Redis for scale)
- Service role key: server-side only

---

## Roadmap

- [ ] Push notifications for follow-up reminders
- [ ] Google OAuth
- [ ] PDF export of decision reports
- [ ] Decision templates library
- [ ] Team / collaborative decisions
- [ ] Offline journal mode (IndexedDB)
- [ ] Email weekly digest
- [ ] Global anonymized benchmarks (real data)
- [ ] Mobile app (React Native)
