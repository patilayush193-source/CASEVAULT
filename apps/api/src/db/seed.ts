import db from '../db';
import bcrypt from 'bcryptjs';

const DEMO_EMAIL = 'demo@casevault.io';
const DEMO_PASSWORD = 'password123';
const BCRYPT_ROUNDS = 12;

interface SlideData {
  title: string;
  competition_name: string;
  year: number;
  category: string;
  executive_summary: string;
  views: number;
}

const slides: SlideData[] = [
  // ── Technology (4) ──
  {
    title: 'AI-Driven Supply Chain Optimization',
    competition_name: 'MIT Sloan Case Competition 2024',
    year: 2024,
    category: 'Technology',
    executive_summary:
      'Proposed an end-to-end AI pipeline that reduced warehouse fulfilment time by 38%. The solution leveraged demand-forecasting transformers and real-time routing algorithms to cut last-mile delivery costs.',
    views: 1432,
  },
  {
    title: 'Edge Computing for Smart Manufacturing',
    competition_name: 'Stanford GSB Case 2023',
    year: 2023,
    category: 'Technology',
    executive_summary:
      'Designed a hybrid edge-cloud architecture for a mid-size auto-parts manufacturer. Predictive maintenance models deployed on-premise reduced unplanned downtime by 27% and saved $4.2M annually.',
    views: 876,
  },
  {
    title: 'Cybersecurity Posture Assessment Framework',
    competition_name: 'Kellogg Strategy Case 2025',
    year: 2025,
    category: 'Technology',
    executive_summary:
      'Developed a quantitative risk-scoring framework for Fortune 500 CISOs. The model maps vulnerability exposure to business impact, enabling board-level prioritisation of security investments.',
    views: 310,
  },
  {
    title: 'SaaS Platform Migration Roadmap',
    competition_name: 'INSEAD Case Competition 2022',
    year: 2022,
    category: 'Technology',
    executive_summary:
      'Outlined a phased migration strategy from on-premise ERP to a multi-tenant SaaS model. The plan preserved data sovereignty requirements while unlocking $12M in annual infrastructure savings.',
    views: 1105,
  },

  // ── Finance (4) ──
  {
    title: 'Digital Banking Transformation Strategy',
    competition_name: 'HBS Case Challenge 2024',
    year: 2024,
    category: 'Finance',
    executive_summary:
      'Recommended a neobank spinoff strategy for a regional US bank targeting Gen-Z customers. Revenue projections showed breakeven within 18 months via interchange and subscription-based premium tiers.',
    views: 1890,
  },
  {
    title: 'ESG-Linked Bond Structuring',
    competition_name: 'Wharton Business Plan Competition 2023',
    year: 2023,
    category: 'Finance',
    executive_summary:
      'Structured a $500M sustainability-linked bond with step-up coupons tied to Scope 1 & 2 emission targets. The framework attracted 3x oversubscription from impact-focused institutional investors.',
    views: 742,
  },
  {
    title: 'Algorithmic Trading Risk Controls',
    competition_name: 'MIT Sloan Case Competition 2025',
    year: 2025,
    category: 'Finance',
    executive_summary:
      'Built a real-time circuit-breaker system for a proprietary trading desk. Backtesting across 10 years of market data demonstrated a 62% reduction in tail-risk drawdowns without sacrificing alpha.',
    views: 523,
  },
  {
    title: 'Emerging Markets Microfinance Expansion',
    competition_name: 'McKinsey Next Gen Case 2022',
    year: 2022,
    category: 'Finance',
    executive_summary:
      'Modelled a mobile-first microfinance expansion into three Sub-Saharan African markets. Agent-network economics showed a path to 2M borrowers and portfolio-level NPL rates below 4% within three years.',
    views: 1654,
  },

  // ── Healthcare (4) ──
  {
    title: 'Telehealth Platform Go-to-Market Strategy',
    competition_name: 'Stanford GSB Case 2024',
    year: 2024,
    category: 'Healthcare',
    executive_summary:
      'Designed a B2B2C telehealth distribution model targeting self-insured employers. Pilot data showed 40% reduction in non-urgent ER visits and an NPS of 72 among enrolled employees.',
    views: 1287,
  },
  {
    title: 'Precision Oncology Data Marketplace',
    competition_name: 'HBS Case Challenge 2023',
    year: 2023,
    category: 'Healthcare',
    executive_summary:
      'Proposed a federated data marketplace connecting academic medical centres and biopharma R&D teams. Privacy-preserving analytics on de-identified genomic data accelerated biomarker discovery timelines by 45%.',
    views: 965,
  },
  {
    title: 'Hospital Capacity Planning During Pandemics',
    competition_name: 'Kellogg Strategy Case 2022',
    year: 2022,
    category: 'Healthcare',
    executive_summary:
      'Created a simulation-based capacity model for a 600-bed urban hospital network. Scenario analysis covered ICU surge, staff absenteeism, and supply-chain disruption under multiple pandemic trajectories.',
    views: 438,
  },
  {
    title: 'AI Diagnostics Regulatory Pathway',
    competition_name: 'INSEAD Case Competition 2025',
    year: 2025,
    category: 'Healthcare',
    executive_summary:
      'Mapped FDA De Novo and EU MDR Class IIa approval pathways for a dermatology AI diagnostic tool. Regulatory timeline modelling identified key milestones to achieve clearance within 14 months.',
    views: 189,
  },

  // ── Marketing (4) ──
  {
    title: 'Direct-to-Consumer Brand Launch Playbook',
    competition_name: 'Wharton Business Plan Competition 2024',
    year: 2024,
    category: 'Marketing',
    executive_summary:
      'Developed a full-funnel DTC launch strategy for a plant-based protein brand. Influencer seeding, programmatic media, and lifecycle email drove a projected $8M first-year revenue at 22% EBITDA margin.',
    views: 1756,
  },
  {
    title: 'Luxury Retail Omnichannel Experience',
    competition_name: 'McKinsey Next Gen Case 2023',
    year: 2023,
    category: 'Marketing',
    executive_summary:
      'Redesigned the omnichannel journey for a European luxury house, integrating clienteling apps with in-store RFID. The pilot store saw a 31% lift in average transaction value and 18% increase in repeat visits.',
    views: 612,
  },
  {
    title: 'Creator Economy Monetisation Framework',
    competition_name: 'MIT Sloan Case Competition 2025',
    year: 2025,
    category: 'Marketing',
    executive_summary:
      'Analysed revenue diversification strategies for mid-tier content creators across YouTube, TikTok, and Substack. A tiered membership model outperformed ad-only monetisation by 3.4x on a per-follower basis.',
    views: 97,
  },
  {
    title: 'Sports Sponsorship ROI Measurement',
    competition_name: 'Stanford GSB Case 2022',
    year: 2022,
    category: 'Marketing',
    executive_summary:
      'Built an attribution model linking jersey sponsorships to brand lift and e-commerce conversions. The framework was validated with three Premier League sponsors and showed a 2.8x average return on sponsorship spend.',
    views: 1340,
  },

  // ── Operations (4) ──
  {
    title: 'Last-Mile Logistics Network Redesign',
    competition_name: 'HBS Case Challenge 2024',
    year: 2024,
    category: 'Operations',
    executive_summary:
      'Proposed a micro-hub distribution model for a national grocery delivery service. Vehicle routing optimisation and demand clustering reduced per-order delivery cost from $7.20 to $4.85.',
    views: 1100,
  },
  {
    title: 'Lean Six Sigma in Aerospace MRO',
    competition_name: 'Kellogg Strategy Case 2023',
    year: 2023,
    category: 'Operations',
    executive_summary:
      'Applied DMAIC methodology to an aircraft engine MRO facility, targeting turnaround time reduction. Value-stream mapping eliminated 12 non-value-added steps, cutting TAT from 45 to 29 days.',
    views: 534,
  },
  {
    title: 'Warehouse Robotics Integration Plan',
    competition_name: 'INSEAD Case Competition 2025',
    year: 2025,
    category: 'Operations',
    executive_summary:
      'Evaluated AMR versus AS/RS solutions for a 250,000 sq-ft e-commerce fulfilment centre. The phased rollout achieved 98.7% pick accuracy and a 14-month payback period on a $6M capex investment.',
    views: 267,
  },
  {
    title: 'Global Procurement Centralisation',
    competition_name: 'Wharton Business Plan Competition 2022',
    year: 2022,
    category: 'Operations',
    executive_summary:
      'Designed a centre-led procurement operating model for a diversified industrial conglomerate. Category management and supplier consolidation unlocked 9% cost savings across $2.1B in addressable spend.',
    views: 1920,
  },

  // ── Sustainability (4) ──
  {
    title: 'Corporate Net-Zero Transition Roadmap',
    competition_name: 'McKinsey Next Gen Case 2024',
    year: 2024,
    category: 'Sustainability',
    executive_summary:
      'Charted a science-based net-zero pathway for a Fortune 200 chemicals company aligned to SBTi 1.5°C targets. The roadmap prioritised process electrification and green hydrogen adoption across three manufacturing sites.',
    views: 1580,
  },
  {
    title: 'Circular Economy Business Model for Fast Fashion',
    competition_name: 'MIT Sloan Case Competition 2023',
    year: 2023,
    category: 'Sustainability',
    executive_summary:
      'Proposed a garment take-back and fibre-to-fibre recycling programme for a global fast-fashion retailer. Unit economics demonstrated profitability at scale while diverting 18,000 tonnes of textile waste from landfill annually.',
    views: 892,
  },
  {
    title: 'Carbon Credit Marketplace Design',
    competition_name: 'Stanford GSB Case 2025',
    year: 2025,
    category: 'Sustainability',
    executive_summary:
      'Architected a blockchain-verified voluntary carbon credit exchange targeting SME buyers. Smart-contract settlement and satellite-based MRV reduced verification costs by 60% compared to legacy registries.',
    views: 155,
  },
  {
    title: 'Renewable Energy Microgrid Feasibility',
    competition_name: 'HBS Case Challenge 2022',
    year: 2022,
    category: 'Sustainability',
    executive_summary:
      'Assessed the technical and financial viability of a solar-plus-storage microgrid for an off-grid mining operation in Chile. The LCOE analysis showed cost parity with diesel generation within two years of commissioning.',
    views: 1045,
  },

  // ── Other (4) ──
  {
    title: 'University Endowment Asset Allocation',
    competition_name: 'Kellogg Strategy Case 2024',
    year: 2024,
    category: 'Other',
    executive_summary:
      'Recommended a revised strategic asset allocation for a $3B university endowment, increasing alternatives exposure. Monte Carlo simulation showed improved risk-adjusted returns with a Sharpe ratio uplift from 0.68 to 0.81.',
    views: 678,
  },
  {
    title: 'Smart City Public Transit Redesign',
    competition_name: 'INSEAD Case Competition 2023',
    year: 2023,
    category: 'Other',
    executive_summary:
      'Redesigned bus and light-rail routes for a mid-size European city using ridership data and demographic projections. The optimised network increased coverage equity by 24% while reducing annual operating subsidies.',
    views: 410,
  },
  {
    title: 'EdTech Gamification Impact Study',
    competition_name: 'Wharton Business Plan Competition 2025',
    year: 2025,
    category: 'Other',
    executive_summary:
      'Evaluated the effect of gamification mechanics on K-12 math learning outcomes. A/B testing across 5,000 students showed a 19% improvement in assessment scores and 2.3x increase in daily active usage.',
    views: 82,
  },
  {
    title: 'Non-Profit Merger Integration Framework',
    competition_name: 'McKinsey Next Gen Case 2022',
    year: 2022,
    category: 'Other',
    executive_summary:
      'Developed a post-merger integration playbook for two regional food-bank networks. Consolidating warehousing and donor management systems reduced overhead by 35% and expanded meal distribution capacity by 1.2M annually.',
    views: 1230,
  },
];

async function seed() {
  // ── Idempotency check ──
  const existingUser = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(DEMO_EMAIL) as { id: string } | undefined;

  if (existingUser) {
    console.log('Seed data already exists — skipping.');
    return;
  }

  // ── Create demo user ──
  const hashedPassword = bcrypt.hashSync(DEMO_PASSWORD, BCRYPT_ROUNDS);

  const insertUser = db.prepare(
    'INSERT INTO users (email, password) VALUES (?, ?)',
  );
  const userResult = insertUser.run(DEMO_EMAIL, hashedPassword);

  // Retrieve the generated user id
  const user = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(DEMO_EMAIL) as { id: string };

  console.log(`Created demo user: ${DEMO_EMAIL} (id: ${user.id})`);

  // ── Insert slides ──
  const insertSlide = db.prepare(`
    INSERT INTO slides (user_id, title, competition_name, year, category, executive_summary, file_path, preview_image, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: SlideData[]) => {
    for (const s of rows) {
      insertSlide.run(
        user.id,
        s.title,
        s.competition_name,
        s.year,
        s.category,
        s.executive_summary,
        'uploads/placeholder.pdf',
        null,
        s.views,
      );
    }
  });

  insertMany(slides);

  console.log(`Inserted ${slides.length} slides across 7 categories.`);
  console.log('Seed completed successfully.');
}

seed();
