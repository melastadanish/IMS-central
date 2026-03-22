// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Database Seed
// Run: pnpm --filter api exec ts-node ../../prisma/seed.ts
// Or:  npx prisma db seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../apps/api/src/lib/password.js';
import { encrypt } from '../apps/api/src/lib/encryption.js';

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sha256(text: string): string {
  // Simple hash for seed data — real hash uses crypto.createHash
  const crypto = require('crypto') as typeof import('crypto');
  return crypto.createHash('sha256').update(text).digest('hex');
}

// ── Main Seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting IMS News Central seed...');

  // ── 1. News Topics ──────────────────────────────────────────────────────────
  console.log('  → News topics...');
  const newsTopics = await Promise.all([
    prisma.newsTopic.upsert({
      where: { slug: 'geopolitics' },
      update: {},
      create: { name: 'Geopolitics', slug: 'geopolitics', description: 'International relations, diplomacy, and global power dynamics', icon: '🌍', color: '#1B3A6B' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'economics' },
      update: {},
      create: { name: 'Economics', slug: 'economics', description: 'Global markets, trade, and economic policy', icon: '📈', color: '#2E75B6' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { name: 'Technology', slug: 'technology', description: 'Science, innovation, and digital transformation', icon: '💻', color: '#7C3AED' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'society' },
      update: {},
      create: { name: 'Society', slug: 'society', description: 'Culture, demographics, and social change', icon: '👥', color: '#059669' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'religion' },
      update: {},
      create: { name: 'Religion', slug: 'religion', description: 'Faith, theology, and interfaith relations', icon: '🕌', color: '#D97706' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'environment' },
      update: {},
      create: { name: 'Environment', slug: 'environment', description: 'Climate change, ecology, and natural resources', icon: '🌿', color: '#16A34A' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'security' },
      update: {},
      create: { name: 'Security', slug: 'security', description: 'Conflict, defence, and counter-terrorism', icon: '🛡️', color: '#DC2626' },
    }),
    prisma.newsTopic.upsert({
      where: { slug: 'culture' },
      update: {},
      create: { name: 'Culture', slug: 'culture', description: 'Arts, heritage, and civilizational dialogue', icon: '🎭', color: '#BE185D' },
    }),
  ]);

  // ── 2. Knowledge Topics ─────────────────────────────────────────────────────
  console.log('  → Knowledge topics...');
  const knowledgeTopics = await Promise.all([
    prisma.knowledgeTopic.upsert({
      where: { slug: 'islamic-jurisprudence' },
      update: {},
      create: { name: 'Islamic Jurisprudence', slug: 'islamic-jurisprudence', description: 'Fiqh, legal methodology, and scholarly discourse', icon: '⚖️', color: '#1B3A6B' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'political-philosophy' },
      update: {},
      create: { name: 'Political Philosophy', slug: 'political-philosophy', description: 'Governance, authority, and political theory', icon: '🏛️', color: '#2E75B6' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'history' },
      update: {},
      create: { name: 'History', slug: 'history', description: 'Historical analysis and civilizational study', icon: '📜', color: '#D97706' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'economics-policy' },
      update: {},
      create: { name: 'Economics & Policy', slug: 'economics-policy', description: 'Economic theory, policy analysis, and development', icon: '📊', color: '#059669' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'international-relations' },
      update: {},
      create: { name: 'International Relations', slug: 'international-relations', description: 'Global governance, diplomacy, and IR theory', icon: '🌐', color: '#7C3AED' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'science-society' },
      update: {},
      create: { name: 'Science & Society', slug: 'science-society', description: 'Scientific literacy, ethics, and societal impact', icon: '🔬', color: '#16A34A' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'media-communication' },
      update: {},
      create: { name: 'Media & Communication', slug: 'media-communication', description: 'Journalism, propaganda, and information analysis', icon: '📡', color: '#DC2626' },
    }),
    prisma.knowledgeTopic.upsert({
      where: { slug: 'philosophy-ethics' },
      update: {},
      create: { name: 'Philosophy & Ethics', slug: 'philosophy-ethics', description: 'Moral philosophy, logic, and ethical frameworks', icon: '🤔', color: '#BE185D' },
    }),
  ]);

  // ── 3. Countries (20) ───────────────────────────────────────────────────────
  console.log('  → Countries...');
  const countrySeedData = [
    { name: 'Pakistan', code: 'PK', flag: '🇵🇰', region: 'South Asia' },
    { name: 'United States', code: 'US', flag: '🇺🇸', region: 'North America' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe' },
    { name: 'China', code: 'CN', flag: '🇨🇳', region: 'East Asia' },
    { name: 'Russia', code: 'RU', flag: '🇷🇺', region: 'Eastern Europe / Central Asia' },
    { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East' },
    { name: 'Iran', code: 'IR', flag: '🇮🇷', region: 'Middle East' },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Middle East / Europe' },
    { name: 'India', code: 'IN', flag: '🇮🇳', region: 'South Asia' },
    { name: 'Egypt', code: 'EG', flag: '🇪🇬', region: 'Middle East / North Africa' },
    { name: 'Jordan', code: 'JO', flag: '🇯🇴', region: 'Middle East' },
    { name: 'Palestine', code: 'PS', flag: '🇵🇸', region: 'Middle East' },
    { name: 'Israel', code: 'IL', flag: '🇮🇱', region: 'Middle East' },
    { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe' },
    { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', region: 'South Asia' },
    { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Southeast Asia' },
    { name: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'Southeast Asia' },
    { name: 'Nigeria', code: 'NG', flag: '🇳🇬', region: 'Sub-Saharan Africa' },
    { name: 'Sudan', code: 'SD', flag: '🇸🇩', region: 'North Africa' },
  ];

  const countries = await Promise.all(
    countrySeedData.map((c) =>
      prisma.country.upsert({
        where: { code: c.code },
        update: {},
        create: c,
      }),
    ),
  );

  const countryMap = Object.fromEntries(countries.map((c) => [c.code, c]));

  // ── 4. News Sources ─────────────────────────────────────────────────────────
  console.log('  → News sources...');
  const sources = await Promise.all([
    prisma.newsSource.upsert({
      where: { slug: 'al-jazeera' },
      update: {},
      create: {
        name: 'Al Jazeera English',
        slug: 'al-jazeera',
        websiteUrl: 'https://www.aljazeera.com',
        rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
        logoUrl: 'https://www.aljazeera.com/favicon.ico',
        isActive: true,
        bias: 'CENTER_LEFT',
        region: 'INTERNATIONAL',
      },
    }),
    prisma.newsSource.upsert({
      where: { slug: 'dawn' },
      update: {},
      create: {
        name: 'Dawn',
        slug: 'dawn',
        websiteUrl: 'https://www.dawn.com',
        rssUrl: 'https://www.dawn.com/feeds/home',
        logoUrl: 'https://www.dawn.com/favicon.ico',
        isActive: true,
        bias: 'CENTER',
        region: 'PAKISTAN',
      },
    }),
    prisma.newsSource.upsert({
      where: { slug: 'bbc-news' },
      update: {},
      create: {
        name: 'BBC News',
        slug: 'bbc-news',
        websiteUrl: 'https://www.bbc.com/news',
        rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml',
        logoUrl: 'https://www.bbc.com/favicon.ico',
        isActive: true,
        bias: 'CENTER_LEFT',
        region: 'UK',
      },
    }),
    prisma.newsSource.upsert({
      where: { slug: 'reuters' },
      update: {},
      create: {
        name: 'Reuters',
        slug: 'reuters',
        websiteUrl: 'https://www.reuters.com',
        rssUrl: 'https://feeds.reuters.com/reuters/topNews',
        logoUrl: 'https://www.reuters.com/favicon.ico',
        isActive: true,
        bias: 'CENTER',
        region: 'INTERNATIONAL',
      },
    }),
    prisma.newsSource.upsert({
      where: { slug: 'middle-east-eye' },
      update: {},
      create: {
        name: 'Middle East Eye',
        slug: 'middle-east-eye',
        websiteUrl: 'https://www.middleeasteye.net',
        rssUrl: 'https://www.middleeasteye.net/rss',
        logoUrl: 'https://www.middleeasteye.net/favicon.ico',
        isActive: true,
        bias: 'CENTER_LEFT',
        region: 'MIDDLE_EAST',
      },
    }),
  ]);

  const sourceMap = Object.fromEntries(sources.map((s) => [s.slug, s]));

  // ── 5. Users ────────────────────────────────────────────────────────────────
  console.log('  → Users...');
  const adminPw = await hashPassword('Admin@IMS2024!');
  const leaderPw = await hashPassword('Leader@IMS2024!');
  const editorPw = await hashPassword('Editor@IMS2024!');
  const expertPw = await hashPassword('Expert@IMS2024!');
  const memberPw = await hashPassword('Member@IMS2024!');

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ims-central.com' },
    update: {},
    create: {
      email: 'admin@ims-central.com',
      passwordHash: adminPw,
      name: 'System Administrator',
      username: 'admin',
      role: 'ADMIN',
      level: 'RESEARCH_SCHOLAR',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 2500,
      bio: 'Platform administrator for IMS News Central.',
    },
  });

  // Leaders (2)
  const leader1 = await prisma.user.upsert({
    where: { email: 'leader.ahmad@ims-central.com' },
    update: {},
    create: {
      email: 'leader.ahmad@ims-central.com',
      passwordHash: leaderPw,
      name: 'Ahmad Al-Rashid',
      username: 'ahmad-rashid',
      role: 'LEADER',
      level: 'RESEARCH_SCHOLAR',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 1800,
      bio: 'Community leader and senior scholar specializing in geopolitics and Islamic jurisprudence.',
    },
  });

  const leader2 = await prisma.user.upsert({
    where: { email: 'leader.fatima@ims-central.com' },
    update: {},
    create: {
      email: 'leader.fatima@ims-central.com',
      passwordHash: leaderPw,
      name: 'Fatima Malik',
      username: 'fatima-malik',
      role: 'LEADER',
      level: 'RESEARCH_SCHOLAR',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 1650,
      bio: 'Community leader with focus on economics, policy analysis, and international development.',
    },
  });

  // Editors (2)
  const editor1 = await prisma.user.upsert({
    where: { email: 'editor.omar@ims-central.com' },
    update: {},
    create: {
      email: 'editor.omar@ims-central.com',
      passwordHash: editorPw,
      name: 'Omar Siddiqui',
      username: 'omar-siddiqui',
      role: 'EDITOR',
      level: 'COMMUNITY_EXPERT',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 950,
      bio: 'News editor with background in journalism and political analysis.',
    },
  });

  const editor2 = await prisma.user.upsert({
    where: { email: 'editor.zainab@ims-central.com' },
    update: {},
    create: {
      email: 'editor.zainab@ims-central.com',
      passwordHash: editorPw,
      name: 'Zainab Hassan',
      username: 'zainab-hassan',
      role: 'EDITOR',
      level: 'OPINION_LEADER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 720,
      bio: 'Content editor specializing in knowledge library curation and academic paper review.',
    },
  });

  // Field Experts (2)
  const expert1User = await prisma.user.upsert({
    where: { email: 'expert.yusuf@ims-central.com' },
    update: {},
    create: {
      email: 'expert.yusuf@ims-central.com',
      passwordHash: expertPw,
      name: 'Dr. Yusuf Karim',
      username: 'yusuf-karim',
      role: 'FIELD_EXPERT',
      level: 'COMMUNITY_EXPERT',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 30,
      activePoints: 890,
      bio: 'Political scientist and field expert in geopolitics and international relations.',
    },
  });

  const expert1 = await prisma.fieldExpert.upsert({
    where: { userId: expert1User.id },
    update: {},
    create: {
      userId: expert1User.id,
      approvedField: 'geopolitics',
      institution: 'University of Karachi',
      designation: 'Associate Professor',
      academicCredentials: encrypt('PhD in International Relations, University of London, 2015'),
      publishedWorks: encrypt(
        JSON.stringify([
          'The Geopolitics of the Muslim World (2019)',
          'Post-American Order: Strategic Implications for Pakistan (2022)',
        ]),
      ),
      cvDocumentUrl: encrypt('cv-documents/yusuf-karim-cv-2024.pdf'),
      isApproved: true,
      approvedAt: new Date('2024-01-15'),
      approvedBy: admin.id,
    },
  });

  const expert2User = await prisma.user.upsert({
    where: { email: 'expert.mariam@ims-central.com' },
    update: {},
    create: {
      email: 'expert.mariam@ims-central.com',
      passwordHash: expertPw,
      name: 'Dr. Mariam Tahir',
      username: 'mariam-tahir',
      role: 'FIELD_EXPERT',
      level: 'OPINION_LEADER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 60,
      activePoints: 540,
      bio: 'Economist and field expert specializing in Islamic finance and development economics.',
    },
  });

  const expert2 = await prisma.fieldExpert.upsert({
    where: { userId: expert2User.id },
    update: {},
    create: {
      userId: expert2User.id,
      approvedField: 'economics',
      institution: 'LUMS',
      designation: 'Senior Lecturer',
      academicCredentials: encrypt('MSc Economics, LSE, 2014; PhD Candidate, LUMS'),
      publishedWorks: encrypt(
        JSON.stringify([
          'Islamic Finance in the Digital Age (2021)',
          'Pakistan Economic Outlook 2023: Structural Challenges (2023)',
        ]),
      ),
      cvDocumentUrl: encrypt('cv-documents/mariam-tahir-cv-2024.pdf'),
      isApproved: true,
      approvedAt: new Date('2024-02-20'),
      approvedBy: admin.id,
    },
  });

  // Regular Members (5)
  const member1 = await prisma.user.upsert({
    where: { email: 'member.hassan@ims-central.com' },
    update: {},
    create: {
      email: 'member.hassan@ims-central.com',
      passwordHash: memberPw,
      name: 'Hassan Raza',
      username: 'hassan-raza',
      role: 'MEMBER',
      level: 'OPINION_LEADER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 45,
      activePoints: 320,
      bio: 'Graduate student studying international relations with a focus on South Asian security dynamics.',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member.aisha@ims-central.com' },
    update: {},
    create: {
      email: 'member.aisha@ims-central.com',
      passwordHash: memberPw,
      name: 'Aisha Nawaz',
      username: 'aisha-nawaz',
      role: 'MEMBER',
      level: 'MEMBER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 15,
      activePoints: 85,
      bio: 'Interested in Islamic economics and social development.',
    },
  });

  const member3 = await prisma.user.upsert({
    where: { email: 'member.bilal@ims-central.com' },
    update: {},
    create: {
      email: 'member.bilal@ims-central.com',
      passwordHash: memberPw,
      name: 'Bilal Chaudhry',
      username: 'bilal-chaudhry',
      role: 'MEMBER',
      level: 'OPINION_LEADER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 260,
      bio: 'Engineer and policy enthusiast. Following developments in tech policy and digital governance.',
    },
  });

  const member4 = await prisma.user.upsert({
    where: { email: 'member.nadia@ims-central.com' },
    update: {},
    create: {
      email: 'member.nadia@ims-central.com',
      passwordHash: memberPw,
      name: 'Nadia Qureshi',
      username: 'nadia-qureshi',
      role: 'MEMBER',
      level: 'MEMBER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 30,
      activePoints: 110,
      bio: 'Educator interested in comparative religion and cross-cultural dialogue.',
    },
  });

  const member5 = await prisma.user.upsert({
    where: { email: 'member.tariq@ims-central.com' },
    update: {},
    create: {
      email: 'member.tariq@ims-central.com',
      passwordHash: memberPw,
      name: 'Tariq Mahmood',
      username: 'tariq-mahmood',
      role: 'MEMBER',
      level: 'MEMBER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: true,
      pendingPoints: 0,
      activePoints: 40,
      bio: 'Recent university graduate exploring geopolitics and Muslim world affairs.',
    },
  });

  console.log('  → Users created');

  // ── 6. News Stories (3) ─────────────────────────────────────────────────────
  console.log('  → News stories...');

  const story1 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('pakistan-imf-deal-2024-06-01') },
    update: {},
    create: {
      headline: 'Pakistan Secures $3 Billion IMF Deal Amid Economic Pressures',
      slug: 'pakistan-imf-deal-3-billion-2024',
      canonicalHash: sha256('pakistan-imf-deal-2024-06-01'),
      summary:
        'Pakistan has reached a staff-level agreement with the International Monetary Fund for a $3 billion standby arrangement. The deal aims to stabilize the country\'s foreign exchange reserves and support economic reform efforts amid ongoing fiscal challenges. Key conditions include broadening the tax base and reducing energy subsidies.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-06-01T10:00:00Z'),
      isPublished: true,
      viewCount: 1240,
      topicId: newsTopics.find((t) => t.slug === 'economics')!.id,
      countries: {
        connect: [{ code: 'PK' }],
      },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story1.id, sourceId: sourceMap['dawn']!.id } },
    update: {},
    create: {
      storyId: story1.id,
      sourceId: sourceMap['dawn']!.id,
      originalUrl: 'https://www.dawn.com/news/imf-deal-pakistan-2024',
      excerpt:
        'Pakistan and the IMF have reached a preliminary agreement on a $3 billion standby arrangement, a senior finance ministry official confirmed on Saturday, marking a crucial step in stabilizing the country\'s economic situation.',
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story1.id, sourceId: sourceMap['reuters']!.id } },
    update: {},
    create: {
      storyId: story1.id,
      sourceId: sourceMap['reuters']!.id,
      originalUrl: 'https://www.reuters.com/news/pakistan-imf-standby-2024',
      excerpt:
        'The International Monetary Fund and Pakistan have agreed on a short-term bailout package to help the country through its current account crisis, with strict fiscal conditions attached including energy subsidy reform.',
    },
  });

  const story2 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('us-china-taiwan-tensions-2024-07-15') },
    update: {},
    create: {
      headline: 'US and China Exchange Sharp Warnings Over Taiwan Military Drills',
      slug: 'us-china-taiwan-military-drills-2024',
      canonicalHash: sha256('us-china-taiwan-tensions-2024-07-15'),
      summary:
        'Diplomatic tensions between the United States and China have escalated following large-scale Chinese military exercises near Taiwan. Washington called the drills "destabilizing," while Beijing maintained they were a necessary response to what it described as provocative arms sales. Taiwan\'s government urged calm while affirming its defence readiness.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-07-15T08:30:00Z'),
      isPublished: true,
      viewCount: 3580,
      topicId: newsTopics.find((t) => t.slug === 'geopolitics')!.id,
      countries: {
        connect: [{ code: 'US' }, { code: 'CN' }],
      },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story2.id, sourceId: sourceMap['bbc-news']!.id } },
    update: {},
    create: {
      storyId: story2.id,
      sourceId: sourceMap['bbc-news']!.id,
      originalUrl: 'https://www.bbc.com/news/china-taiwan-us-drills-2024',
      excerpt:
        'China launched multi-day military exercises encircling Taiwan, describing them as a "stern warning" against separatism. The US State Department condemned the exercises as "irresponsible and destabilizing."',
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story2.id, sourceId: sourceMap['al-jazeera']!.id } },
    update: {},
    create: {
      storyId: story2.id,
      sourceId: sourceMap['al-jazeera']!.id,
      originalUrl: 'https://www.aljazeera.com/news/2024/7/15/china-taiwan-drills',
      excerpt:
        'Beijing defended its military manoeuvres as a legitimate exercise of national sovereignty, while Taipei reported tracking Chinese vessels entering its air defence identification zone.',
    },
  });

  const story3 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('gcc-normalization-saudi-israel-2024-08-10') },
    update: {},
    create: {
      headline: 'Reports Emerge of Quiet Diplomatic Contacts Between Saudi Arabia and Israel',
      slug: 'saudi-israel-normalization-contacts-2024',
      canonicalHash: sha256('gcc-normalization-saudi-israel-2024-08-10'),
      summary:
        'Unconfirmed reports of back-channel diplomatic contacts between Saudi and Israeli officials have circulated following regional political shifts. Both governments have declined to comment, while analysts suggest any normalization would require substantial concessions on Palestinian statehood. The reports come amid continued US mediation efforts in the region.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-08-10T14:00:00Z'),
      isPublished: true,
      viewCount: 2870,
      topicId: newsTopics.find((t) => t.slug === 'geopolitics')!.id,
      countries: {
        connect: [{ code: 'SA' }, { code: 'IL' }, { code: 'PS' }],
      },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story3.id, sourceId: sourceMap['middle-east-eye']!.id } },
    update: {},
    create: {
      storyId: story3.id,
      sourceId: sourceMap['middle-east-eye']!.id,
      originalUrl: 'https://www.middleeasteye.net/news/saudi-israel-normalization-2024',
      excerpt:
        'Sources familiar with the discussions told Middle East Eye that preliminary contacts had taken place through third-party intermediaries, but emphasized that no formal talks were underway.',
    },
  });

  // ── 7. Opinions (on stories) ────────────────────────────────────────────────
  console.log('  → Opinions...');
  await prisma.opinion.upsert({
    where: { storyId_authorId: { storyId: story1.id, authorId: expert2User.id } },
    update: {},
    create: {
      storyId: story1.id,
      authorId: expert2User.id,
      content:
        'The IMF deal, while providing short-term relief, does not address Pakistan\'s structural fiscal deficit. The conditionalities around energy pricing and tax reform are politically difficult to implement without significant social backlash. Pakistan needs sustained primary surpluses over the next five years to stabilize its debt trajectory — something no government has achieved in recent memory.',
      isPublished: true,
      publishedAt: new Date('2024-06-03T11:00:00Z'),
    },
  });

  // ── 8. Comments ─────────────────────────────────────────────────────────────
  console.log('  → Comments...');

  // Verified comment (both approvers)
  const verifiedComment = await prisma.comment.upsert({
    where: { id: 'seed-comment-verified-001' },
    update: {},
    create: {
      id: 'seed-comment-verified-001',
      storyId: story2.id,
      authorId: member1.id,
      content:
        'The US-China standoff over Taiwan represents a classic security dilemma: each side\'s defensive preparations are perceived as offensive by the other. What makes this particularly volatile is the ambiguity in US strategic commitment — the policy of "strategic ambiguity" was designed for a different era. As Chinese capabilities have grown to challenge US power projection in the Western Pacific, the credibility gap between stated policy and military reality has widened significantly.',
      status: 'OPINION_VERIFIED',
      requiredField: 'geopolitics',
      fieldExpertApproverId: expert1User.id,
      leaderApproverId: leader1.id,
      opinionPointsAwarded: 15,
      isPublished: true,
      publishedAt: new Date('2024-07-18T09:00:00Z'),
      expertApprovedAt: new Date('2024-07-19T10:00:00Z'),
      leaderApprovedAt: new Date('2024-07-20T14:30:00Z'),
      verifiedAt: new Date('2024-07-20T14:30:00Z'),
      fieldExpertApprover: { connect: { id: expert1User.id } },
      leaderApprover: { connect: { id: leader1.id } },
    },
  });

  // Comment pending editor approval
  const pendingEditorComment = await prisma.comment.upsert({
    where: { id: 'seed-comment-pending-editor-001' },
    update: {},
    create: {
      id: 'seed-comment-pending-editor-001',
      storyId: story3.id,
      authorId: member4.id,
      content:
        'The framing of Saudi-Israel normalization as inevitable misses a crucial variable: domestic legitimacy. Any Saudi ruler who normalizes without meaningful Palestinian sovereignty concessions risks delegitimizing the very religious authority that underpins the Al Saud family\'s rule. The Custodianship of the Two Holy Mosques is not merely a title — it is a political contract with the Muslim world.',
      status: 'PENDING_EDITOR',
      requiredField: 'geopolitics',
      isPublished: false,
      submittedAt: new Date('2024-08-12T15:00:00Z'),
    },
  });

  // Published comment awaiting opinion verification
  const opinionPendingComment = await prisma.comment.upsert({
    where: { id: 'seed-comment-opinion-pending-001' },
    update: {},
    create: {
      id: 'seed-comment-opinion-pending-001',
      storyId: story1.id,
      authorId: member2.id,
      content:
        'Pakistan\'s repeated recourse to the IMF reveals a deeper structural problem: the state\'s inability to tax its elite. Agricultural income — concentrated among feudal landholders who dominate parliament — remains largely untaxed. Any genuine reform requires dismantling this political economy, not just signing conditionality letters that are quietly reversed when fund disbursements arrive.',
      status: 'PENDING_OPINION_REVIEW',
      requiredField: 'economics',
      isPublished: true,
      publishedAt: new Date('2024-06-08T11:30:00Z'),
      opinionRequestedAt: new Date('2024-06-10T09:00:00Z'),
      submittedAt: new Date('2024-06-07T16:45:00Z'),
    },
  });

  // ── 9. Point Transactions + Expiry (for verified comment) ──────────────────
  console.log('  → Point transactions...');
  const batchEarnedAt = new Date('2024-07-20T14:30:00Z');

  const ptx1 = await prisma.pointTransaction.upsert({
    where: { id: 'seed-ptx-001' },
    update: {},
    create: {
      id: 'seed-ptx-001',
      userId: member1.id,
      amount: 15,
      state: 'ACTIVE',
      type: 'OPINION_VERIFIED',
      commentId: verifiedComment.id,
      note: 'Opinion points for verified geopolitics comment on Taiwan story',
    },
  });

  // Expiry row for member4's pending points
  await prisma.pendingPointExpiry.upsert({
    where: { id: 'seed-expiry-001' },
    update: {},
    create: {
      id: 'seed-expiry-001',
      userId: member4.id,
      batchPoints: 30,
      earnedAt: new Date('2024-06-15T10:00:00Z'),
      expiresAt: addDays(new Date('2024-06-15T10:00:00Z'), 60),
      state: 'PENDING',
      warningDay46: false,
      warningDay53: false,
      warningDay59: false,
      pointTransactionId: null,
    },
  });

  // ── 10. Presentation Requests ───────────────────────────────────────────────
  console.log('  → Presentation requests...');

  // Approved presentation (member1 — points activated)
  await prisma.presentationRequest.upsert({
    where: { id: 'seed-pres-approved-001' },
    update: {},
    create: {
      id: 'seed-pres-approved-001',
      memberId: member1.id,
      leaderId: leader1.id,
      status: 'APPROVED',
      requestedAt: new Date('2024-07-22T10:00:00Z'),
      scheduledFor: new Date('2024-07-28T15:00:00Z'),
      meetingPlatform: 'GOOGLE_MEET',
      meetingLink: encrypt('https://meet.google.com/abc-defg-hij'),
      leaderDecision: 'APPROVED',
      leaderNote: encrypt('Hassan demonstrated solid understanding of US-China security dynamics. His grasp of the security dilemma framework was commendable. Points approved.'),
      completedAt: new Date('2024-07-28T16:30:00Z'),
      decisionAt: new Date('2024-07-28T17:00:00Z'),
    },
  });

  // Cancelled presentation (member2 — points wiped)
  await prisma.presentationRequest.upsert({
    where: { id: 'seed-pres-cancelled-001' },
    update: {},
    create: {
      id: 'seed-pres-cancelled-001',
      memberId: member2.id,
      leaderId: leader2.id,
      status: 'CANCELLED',
      requestedAt: new Date('2024-06-12T11:00:00Z'),
      scheduledFor: new Date('2024-06-18T14:00:00Z'),
      meetingPlatform: 'ZOOM',
      meetingLink: encrypt('https://zoom.us/j/123456789?pwd=example'),
      leaderDecision: 'CANCELLED',
      cancellationReason: encrypt('Member was unable to explain the mechanisms behind tax collection failure beyond surface-level claims. The written analysis appeared to draw from articles without independent understanding. Points not awarded.'),
      completedAt: new Date('2024-06-18T14:45:00Z'),
      decisionAt: new Date('2024-06-18T15:30:00Z'),
    },
  });

  // Pending presentation (member3 — waiting)
  await prisma.presentationRequest.upsert({
    where: { id: 'seed-pres-pending-001' },
    update: {},
    create: {
      id: 'seed-pres-pending-001',
      memberId: member3.id,
      leaderId: leader1.id,
      status: 'PENDING',
      requestedAt: new Date('2024-08-14T09:00:00Z'),
    },
  });

  // ── 11. Journal Papers (3) ──────────────────────────────────────────────────
  console.log('  → Journal papers...');
  const ktGeopolitics = knowledgeTopics.find((t) => t.slug === 'international-relations')!;
  const ktEconomics = knowledgeTopics.find((t) => t.slug === 'economics-policy')!;
  const ktJurisprudence = knowledgeTopics.find((t) => t.slug === 'islamic-jurisprudence')!;

  await prisma.journalPaper.upsert({
    where: { doi: '10.1017/S0020818300012345' },
    update: {},
    create: {
      title: 'Strategic Ambiguity and Deterrence Failure: Lessons from the Taiwan Strait',
      slug: 'strategic-ambiguity-deterrence-taiwan-strait',
      authors: ['James T. Morrison', 'Liu Wei'],
      journal: 'International Organization',
      doi: '10.1017/S0020818300012345',
      publishedYear: 2023,
      abstract:
        'This paper examines the conditions under which strategic ambiguity as a deterrence posture becomes counterproductive. Using a formal model and applying it to the Taiwan Strait case, we argue that as the balance of military capabilities shifts, ambiguity that was previously stabilizing can become destabilizing by creating windows of opportunity for revisionist actors. We identify three indicators that signal when strategic clarity should replace ambiguity.',
      simplifiedAbstract:
        'When the US says it will "maybe" defend Taiwan, this creates uncertainty. This paper shows that such uncertainty was useful when the US was clearly stronger, but as China\'s military has grown, this vagueness now makes conflict more — not less — likely by tempting Beijing to test the boundaries.',
      keyFindings: [
        'Strategic ambiguity stabilizes deterrence only when the deterring power holds a clear military advantage',
        'As Chinese naval and air capabilities approach parity in the Western Pacific, US strategic ambiguity loses its deterrent credibility',
        'Three measurable thresholds signal when policy should shift from ambiguity to commitment',
      ],
      topicId: ktGeopolitics.id,
      isPublished: true,
      timelinePosition: 2023.1,
      countries: { connect: [{ code: 'US' }, { code: 'CN' }] },
    },
  });

  await prisma.journalPaper.upsert({
    where: { doi: '10.1080/09512748.2023.00054321' },
    update: {},
    create: {
      title: 'Structural Adjustment and Elite Capture: Why IMF Conditionalities Fail in Pakistan',
      slug: 'imf-conditionalities-elite-capture-pakistan',
      authors: ['Ayesha Raza Farooq', 'Mehtab Ali Khan'],
      journal: 'Third World Quarterly',
      doi: '10.1080/09512748.2023.00054321',
      publishedYear: 2023,
      abstract:
        'This paper analyses fifteen IMF programs in Pakistan between 1988 and 2023, identifying systematic patterns of conditionality reversal. We argue that structural adjustment fails not because of technical design flaws but because program ownership is captured by elite coalitions — particularly feudal landholders and business conglomerates — whose tax privileges are the primary target of reform. We develop the concept of "conditionality arbitrage" to describe how elites exploit IMF program cycles to extract rent while delaying structural reform.',
      simplifiedAbstract:
        'Pakistan has gone to the IMF 15 times since 1988. This paper explains why the reforms always fail: the wealthy and powerful people who are supposed to be taxed are the same people who run the government. They agree to reforms to get the money, then quietly cancel them.',
      keyFindings: [
        'Conditionality reversal occurs in 87% of Pakistani IMF programs within 18 months of disbursement',
        'Agricultural income tax — the primary reform target — has never been implemented despite appearing in every program since 1990',
        'Elite capture of program design explains failure better than governance capacity arguments',
      ],
      topicId: ktEconomics.id,
      isPublished: true,
      timelinePosition: 2023.2,
      countries: { connect: [{ code: 'PK' }] },
    },
  });

  await prisma.journalPaper.upsert({
    where: { doi: '10.1163/15692086-12341456' },
    update: {},
    create: {
      title: 'Maqasid al-Shariah and Contemporary Governance: A Jurisprudential Framework',
      slug: 'maqasid-al-shariah-contemporary-governance',
      authors: ['Dr. Tariq Ramadan', 'Dr. Jasser Auda'],
      journal: 'Journal of Islamic Studies',
      doi: '10.1163/15692086-12341456',
      publishedYear: 2022,
      abstract:
        'This paper develops a systems-based reading of maqasid al-shariah (the objectives of Islamic law) as a framework for evaluating contemporary governance structures. Moving beyond the traditional five-necessity framework, we propose a dynamic model in which Islamic jurisprudence engages with governance through three levels of analysis: primary objectives, secondary enablers, and contextual adaptations. The framework is applied to three case studies: Islamic finance regulation, minority rights jurisprudence, and environmental governance.',
      simplifiedAbstract:
        'Islamic law has five traditional goals: protecting religion, life, intellect, family, and property. This paper argues these goals need a modern update — one that can address how governments should run financial systems, protect minorities, and deal with climate change — using Islamic principles in a flexible, systematic way.',
      keyFindings: [
        'The classical five-necessity framework is insufficient for evaluating modern governance without a dynamic systems layer',
        'Secondary enablers — justice, dignity, community cohesion — are as jurisprudentially binding as the primary necessities',
        'Environmental governance represents a new sixth necessity (hifz al-biyah) supported by classical textual evidence',
      ],
      topicId: ktJurisprudence.id,
      isPublished: true,
      timelinePosition: 2022.3,
      countries: {},
    },
  });

  // ── 12. Foreign Policy Entries ──────────────────────────────────────────────
  console.log('  → Foreign policy entries...');
  const pkCountry = countryMap['PK']!;

  await prisma.foreignPolicyEntry.createMany({
    skipDuplicates: true,
    data: [
      {
        countryId: pkCountry.id,
        title: 'Pakistan Joins SCO as Full Member',
        summary:
          'Pakistan formally joined the Shanghai Cooperation Organisation as a full member, marking a significant shift in its multilateral engagement beyond traditional Western alliances. Analysts noted this as part of a broader hedging strategy between great powers.',
        entryDate: new Date('2017-06-09'),
        type: 'MULTILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Dawn', 'Reuters']),
      },
      {
        countryId: pkCountry.id,
        title: 'CPEC Phase II Launches with Focus on Special Economic Zones',
        summary:
          'Pakistan and China announced the launch of Phase II of the China-Pakistan Economic Corridor, expanding beyond infrastructure into industrial cooperation. The phase includes nine Special Economic Zones designed to attract Chinese manufacturing.',
        entryDate: new Date('2019-11-05'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Dawn', 'Xinhua', 'Reuters']),
      },
      {
        countryId: pkCountry.id,
        title: 'Pakistan-India Relations Suspended After Article 370 Revocation',
        summary:
          'Pakistan downgraded diplomatic relations with India following New Delhi\'s revocation of Article 370, which had granted special status to Jammu and Kashmir. Pakistan expelled the Indian High Commissioner and suspended bilateral trade.',
        entryDate: new Date('2019-08-07'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor2.id,
        sources: JSON.stringify(['Dawn', 'BBC', 'Al Jazeera']),
      },
      {
        countryId: pkCountry.id,
        title: 'Pakistan Abstains on UN Resolution Condemning Russia\'s Invasion of Ukraine',
        summary:
          'Pakistan abstained from the UN General Assembly resolution condemning Russia\'s invasion of Ukraine, alongside China and India. Prime Minister Imran Khan was in Moscow when the invasion began, and the government maintained a policy of neutrality it described as in Pakistan\'s national interest.',
        entryDate: new Date('2022-03-02'),
        type: 'MULTILATERAL',
        significance: 'MEDIUM',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Dawn', 'Reuters', 'Al Jazeera']),
      },
      {
        countryId: pkCountry.id,
        title: 'Pakistan Joins Saudi-Led Broader Middle East Security Alliance Discussions',
        summary:
          'Pakistani officials participated in preliminary discussions around a proposed Middle East security architecture led by Saudi Arabia. Pakistan\'s unique position as a nuclear power with close ties to both Riyadh and Beijing makes it a key potential member of any regional security framework.',
        entryDate: new Date('2024-05-18'),
        type: 'MULTILATERAL',
        significance: 'MEDIUM',
        isPublished: true,
        authorId: editor2.id,
        sources: JSON.stringify(['Dawn', 'Middle East Eye']),
      },
    ],
  });

  // ── 13. Videos (3) ─────────────────────────────────────────────────────────
  console.log('  → Videos...');

  await prisma.video.upsert({
    where: { slug: 'understanding-the-us-china-rivalry' },
    update: {},
    create: {
      title: 'Understanding the US-China Rivalry: A Structural Analysis',
      slug: 'understanding-the-us-china-rivalry',
      description:
        'A deep structural analysis of the US-China rivalry using power transition theory. This lecture examines why rising powers historically challenge incumbent hegemon and what distinguishes this rivalry from Cold War analogies.',
      topicId: newsTopics.find((t) => t.slug === 'geopolitics')!.id,
      difficulty: 'INTERMEDIATE',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'dQw4w9WgXcQ',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      duration: 3420,
      isPublished: true,
      publishedAt: new Date('2024-05-01T10:00:00Z'),
      addedById: editor1.id,
      discussionBrief:
        '**Pre-watching questions:**\n\n1. What is power transition theory, and how does it explain hegemonic wars?\n2. How does China\'s rise differ from Germany\'s rise before WWI and the Soviet Union\'s during the Cold War?\n3. What role does economic interdependence play in either stabilizing or destabilizing the US-China relationship?\n\n**Post-watching analytical prompt:**\n\nApply Mearsheimer\'s offensive realism to the Taiwan question. Is conflict structurally inevitable, or can institutions and norms prevent it? Defend your position with at least three specific pieces of evidence.',
      tags: ['geopolitics', 'us-china', 'power-transition', 'international-relations'],
    },
  });

  await prisma.video.upsert({
    where: { slug: 'pakistan-economy-structural-crisis' },
    update: {},
    create: {
      title: 'Pakistan\'s Structural Economic Crisis: Beyond the IMF Cycle',
      slug: 'pakistan-economy-structural-crisis',
      description:
        'An analysis of why Pakistan\'s economy has been stuck in recurring IMF program cycles for four decades. The lecture covers institutional economics, elite capture theory, and historical comparisons with East Asian development models.',
      topicId: newsTopics.find((t) => t.slug === 'economics')!.id,
      difficulty: 'ADVANCED',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'xvFZjo5PgG0',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/xvFZjo5PgG0',
      duration: 4800,
      isPublished: true,
      publishedAt: new Date('2024-06-15T10:00:00Z'),
      addedById: editor2.id,
      discussionBrief:
        '**Core analytical question:**\n\nWhy have countries like South Korea and Taiwan — which also relied on foreign aid and had comparable development indicators in the 1960s — successfully industrialized while Pakistan has not?\n\n**Structured analysis prompts:**\n\n1. Compare Pakistan\'s land reform (or lack thereof) to South Korea\'s 1950 Land Reform Act. What political conditions made Korean reform possible?\n2. How does "elite capture" differ from corruption as an analytical concept? Which better explains Pakistan\'s development failure?\n3. If you were advising Pakistan\'s Finance Ministry, what single structural reform would you prioritize, and how would you build the political coalition to pass it?',
      tags: ['economics', 'pakistan', 'development', 'elite-capture', 'imf'],
    },
  });

  await prisma.video.upsert({
    where: { slug: 'maqasid-shariah-modern-governance' },
    update: {},
    create: {
      title: 'Maqasid al-Shariah: Principles for Modern Governance',
      slug: 'maqasid-shariah-modern-governance',
      description:
        'A jurisprudential lecture on the objectives of Islamic law and their application to contemporary governance challenges. Explores Islamic finance, environmental ethics, and minority rights through the lens of classical and contemporary maqasid scholarship.',
      topicId: newsTopics.find((t) => t.slug === 'religion')!.id,
      difficulty: 'BEGINNER',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'M7lc1UVf-VE',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
      duration: 2760,
      isPublished: true,
      publishedAt: new Date('2024-07-01T10:00:00Z'),
      addedById: editor1.id,
      discussionBrief:
        '**Key concepts to grasp first:**\n\n- Maslaha (public interest) and its relation to the five necessities\n- The difference between qat\'i (definitive) and zanni (probable) rulings\n- How ijtihad functions as a tool for legal evolution\n\n**Discussion question:**\n\nIslamic finance prohibits riba (usury/interest) but permits murabaha (cost-plus financing). Critics argue murabaha produces identical economic outcomes to interest-bearing loans. Is this a legitimate legal distinction or a formal workaround? Use the maqasid framework to evaluate your position.',
      tags: ['islamic-jurisprudence', 'fiqh', 'governance', 'maqasid'],
    },
  });

  // ── 14. Research Groups + Teams ─────────────────────────────────────────────
  console.log('  → Research groups and teams...');

  const rg1 = await prisma.researchGroup.upsert({
    where: { slug: 'south-asian-security-forum' },
    update: {},
    create: {
      name: 'South Asian Security Forum',
      slug: 'south-asian-security-forum',
      description:
        'A research group focused on security dynamics in South Asia, including nuclear deterrence, civil-military relations, and regional conflict management. Members produce collaborative policy briefs and academic papers.',
      field: 'geopolitics',
      leaderId: leader1.id,
      isPublic: false,
      maxMembers: 12,
      memberCount: 3,
      isActive: true,
    },
  });

  const rg2 = await prisma.researchGroup.upsert({
    where: { slug: 'islamic-economics-lab' },
    update: {},
    create: {
      name: 'Islamic Economics Lab',
      slug: 'islamic-economics-lab',
      description:
        'Research into Islamic finance, zakat distribution, and halal economic systems. The group combines jurisprudential analysis with empirical economic research to develop practical policy recommendations.',
      field: 'economics',
      leaderId: leader2.id,
      isPublic: false,
      maxMembers: 10,
      memberCount: 2,
      isActive: true,
    },
  });

  // Open research teams
  const rt1 = await prisma.researchTeam.upsert({
    where: { slug: 'media-analysis-unit' },
    update: {},
    create: {
      name: 'Media Analysis Unit',
      slug: 'media-analysis-unit',
      description:
        'An open research team analyzing media framing, narrative bias, and information warfare across major news outlets. Members collaboratively review coverage of key geopolitical events.',
      groupId: rg1.id,
      isOpen: true,
      maxMembers: 8,
      memberCount: 2,
      isActive: true,
    },
  });

  const rt2 = await prisma.researchTeam.upsert({
    where: { slug: 'development-economics-working-group' },
    update: {},
    create: {
      name: 'Development Economics Working Group',
      slug: 'development-economics-working-group',
      description:
        'An open team examining development economics with a focus on Muslim-majority countries. Current research focuses on the institutional determinants of development failure in Pakistan and MENA.',
      groupId: rg2.id,
      isOpen: true,
      maxMembers: 10,
      memberCount: 3,
      isActive: true,
    },
  });

  // Team memberships
  await prisma.researchTeamMember.upsert({
    where: { teamId_userId: { teamId: rt1.id, userId: member3.id } },
    update: {},
    create: { teamId: rt1.id, userId: member3.id, role: 'MEMBER', joinedAt: new Date('2024-05-01') },
  });

  await prisma.researchTeamMember.upsert({
    where: { teamId_userId: { teamId: rt2.id, userId: member2.id } },
    update: {},
    create: { teamId: rt2.id, userId: member2.id, role: 'MEMBER', joinedAt: new Date('2024-06-01') },
  });

  await prisma.researchTeamMember.upsert({
    where: { teamId_userId: { teamId: rt2.id, userId: member4.id } },
    update: {},
    create: { teamId: rt2.id, userId: member4.id, role: 'MEMBER', joinedAt: new Date('2024-06-15') },
  });

  // ── 15. Academy Courses (3) ─────────────────────────────────────────────────
  console.log('  → Academy courses...');

  const course1 = await prisma.academyCourse.upsert({
    where: { slug: 'foundations-of-geopolitical-analysis' },
    update: {},
    create: {
      title: 'Foundations of Geopolitical Analysis',
      slug: 'foundations-of-geopolitical-analysis',
      description:
        'An introductory course covering the core theories of international relations: realism, liberalism, constructivism, and critical theory. Students learn to apply these frameworks to contemporary events.',
      field: 'geopolitics',
      difficulty: 'BEGINNER',
      estimatedHours: 12,
      isPublished: true,
      publishedAt: new Date('2024-03-01'),
      createdById: admin.id,
    },
  });

  const c1m1 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course1.id, order: 1 } },
    update: {},
    create: {
      courseId: course1.id,
      title: 'Understanding Power in International Relations',
      order: 1,
      content:
        '# Understanding Power in International Relations\n\nPower is the foundational concept in international relations theory. But what is power? Classical realists like Morgenthau defined it as "control over the minds and actions of other men." Modern scholars have expanded this to distinguish between hard power (military and economic coercion), soft power (attraction and persuasion), and smart power (the strategic combination of both).\n\n## The Structural Context\n\nAnarchy — the absence of a world government — is the defining feature of the international system. Unlike domestic politics where states enforce law, the international realm has no sovereign authority above states. This creates a **self-help system** where each state must secure its own survival.\n\n## Questions to Reflect On\n\n1. Is the distinction between hard and soft power analytically useful or does it obscure more than it reveals?\n2. Does anarchy necessitate conflict, or can institutions mitigate its effects?\n3. How does power distribution (unipolarity, bipolarity, multipolarity) affect stability?',
      estimatedMinutes: 90,
      isPublished: true,
    },
  });

  const c1m2 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course1.id, order: 2 } },
    update: {},
    create: {
      courseId: course1.id,
      title: 'Realism: States, Survival, and Power Politics',
      order: 2,
      content:
        '# Realism: States, Survival, and Power Politics\n\nRealism is the oldest and most influential tradition in international relations theory. Its central claim: states are the primary actors in international politics, they act rationally in pursuit of power and security, and conflict is an inherent feature of the system.\n\n## Classical Realism vs. Structural Realism\n\n**Classical Realism** (Morgenthau) locates the cause of conflict in human nature — the innate drive for power. States are like individuals writ large.\n\n**Structural Realism / Neorealism** (Waltz) locates the cause in the structure of the international system — specifically, anarchy. Even well-intentioned states are forced into competitive behaviour by systemic pressures.\n\n## Offensive vs. Defensive Realism\n\n- **Offensive Realism** (Mearsheimer): States always seek to maximize power because security is never guaranteed. Great powers are always looking for opportunities to gain relative advantage.\n- **Defensive Realism** (Waltz, Van Evera): States seek to maximize security, not power. Seeking too much power triggers balancing coalitions.',
      estimatedMinutes: 90,
      isPublished: true,
    },
  });

  const c1m3 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course1.id, order: 3 } },
    update: {},
    create: {
      courseId: course1.id,
      title: 'Liberal Institutionalism and International Cooperation',
      order: 3,
      content:
        '# Liberal Institutionalism and International Cooperation\n\nIf realism asks why conflict persists, liberalism asks why cooperation is possible despite anarchy. Liberal institutionalists argue that international institutions — the UN, WTO, IMF — reduce the transaction costs of cooperation and provide mechanisms for enforcing agreements.\n\n## The Logic of Institutions\n\nInstitutions help states overcome the **collective action problem**: situations where individually rational behaviour leads to collectively suboptimal outcomes. By creating transparency, reducing uncertainty, and establishing norms, institutions make cooperation the rational choice.\n\n## Criticism: The Distributional Problem\n\nRealists respond that institutions cannot overcome the **distributional problem**: even if cooperation is beneficial, states disagree over how to divide the gains. A weaker state may reject cooperation if the stronger partner captures most of the benefit.',
      estimatedMinutes: 90,
      isPublished: true,
    },
  });

  const course2 = await prisma.academyCourse.upsert({
    where: { slug: 'islamic-economic-thought' },
    update: {},
    create: {
      title: 'Islamic Economic Thought: Theory and Application',
      slug: 'islamic-economic-thought',
      description:
        'A systematic study of Islamic economic principles — riba prohibition, zakat, murabaha, and musharakah — and their application in contemporary financial systems. Combines jurisprudential foundations with empirical analysis.',
      field: 'economics',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 15,
      isPublished: true,
      publishedAt: new Date('2024-04-01'),
      createdById: admin.id,
    },
  });

  const c2m1 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course2.id, order: 1 } },
    update: {},
    create: {
      courseId: course2.id,
      title: 'The Prohibition of Riba: Foundations and Rationale',
      order: 1,
      content:
        '# The Prohibition of Riba: Foundations and Rationale\n\nRiba — conventionally translated as usury or interest — is among the most firmly prohibited practices in Islamic jurisprudence. The Quran addresses it in four separate passages, with the final verses among the last revealed before the Prophet\'s death.\n\n## What Is Riba?\n\nClassical scholars distinguished between two types:\n- **Riba al-Nasiah**: an increase in the amount owed in exchange for delayed repayment (debt-based riba)\n- **Riba al-Fadl**: unequal exchange of the same commodity in hand-to-hand transactions\n\n## The Economic Rationale\n\nContemporary Islamic economists offer multiple justifications for the prohibition:\n1. **Risk-sharing**: Fixed interest shifts all risk to the borrower, violating the principle of equitable risk distribution\n2. **Productive use**: Money should function as a medium of exchange, not a commodity that generates returns independently\n3. **Social justice**: Compound interest systematically transfers wealth from debtors to creditors',
      estimatedMinutes: 120,
      isPublished: true,
    },
  });

  const c2m2 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course2.id, order: 2 } },
    update: {},
    create: {
      courseId: course2.id,
      title: 'Islamic Finance Instruments: Murabaha, Ijara, and Musharakah',
      order: 2,
      content:
        '# Islamic Finance Instruments: Murabaha, Ijara, and Musharakah\n\n## Murabaha (Cost-Plus Financing)\nThe bank purchases an asset and sells it to the customer at a marked-up price, payable in instalments. The markup (profit) is declared upfront and fixed — it cannot increase if the customer pays late.\n\n**Criticism**: Critics argue murabaha is economically equivalent to an interest-bearing loan. The bank is paid for time value of money under a different legal form.\n\n**Defence**: Proponents argue the legal structure matters — the bank takes genuine ownership risk (however briefly) and the moral economy of fixed, disclosed pricing differs fundamentally from compound interest.\n\n## Ijara (Leasing)\nEquivalent to conventional leasing — the bank buys and leases an asset. At the end of the term, ownership may transfer. Profit comes from rental income, not interest.\n\n## Musharakah (Partnership)\nThe purest Islamic finance instrument — the bank and customer co-invest, sharing profits proportionally and losses according to investment ratios. Musharakah is theoretically preferred but practically rare due to information asymmetry and risk management challenges.',
      estimatedMinutes: 120,
      isPublished: true,
    },
  });

  const c2m3 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course2.id, order: 3 } },
    update: {},
    create: {
      courseId: course2.id,
      title: 'Zakat: Principles, Calculation, and Contemporary Application',
      order: 3,
      content:
        '# Zakat: Principles, Calculation, and Contemporary Application\n\nZakat is one of the five pillars of Islam and the primary redistributive mechanism in classical Islamic economic theory. It is obligatory on Muslims who hold wealth above the nisab threshold.\n\n## Calculation Framework\n- **Nisab**: The minimum threshold — equivalent to 85 grams of gold or 595 grams of silver\n- **Rate**: 2.5% on most assets held for one lunar year\n- **Zakatable assets**: Cash, gold, silver, trade goods, livestock, agricultural produce\n- **Exemptions**: Primary residence, personal vehicle, tools of trade\n\n## The Eight Categories of Recipients\nThe Quran specifies eight categories: the poor, the destitute, zakat collectors, those whose hearts are to be reconciled, slaves to be freed, debtors, those in the path of God, and stranded travellers.\n\n## Contemporary Challenges\nModern zakat administration raises complex questions: Should zakat apply to stocks, mutual funds, and retirement savings? How should nisab be calculated when silver and gold values diverge? Can zakat be directed to institutional social programs?',
      estimatedMinutes: 120,
      isPublished: true,
    },
  });

  const course3 = await prisma.academyCourse.upsert({
    where: { slug: 'critical-reading-of-media' },
    update: {},
    create: {
      title: 'Critical Reading of Media and News',
      slug: 'critical-reading-of-media',
      description:
        'A practical course in media literacy — how to evaluate sources, identify framing and narrative bias, detect propaganda techniques, and construct independent analysis from multiple information sources.',
      field: 'media-analysis',
      difficulty: 'BEGINNER',
      estimatedHours: 8,
      isPublished: true,
      publishedAt: new Date('2024-05-01'),
      createdById: admin.id,
    },
  });

  const c3m1 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course3.id, order: 1 } },
    update: {},
    create: {
      courseId: course3.id,
      title: 'Understanding Framing: How News Shapes Perception',
      order: 1,
      content:
        '# Understanding Framing: How News Shapes Perception\n\nFraming is the process by which media organizations — and political actors — select certain aspects of a story and make them more salient. The same event can be presented as a "terrorist attack," an "act of resistance," or a "political violence incident" — each frame activates different cognitive associations and moral judgments.\n\n## The Entman Framing Model\n\nRobert Entman defined framing as: **selecting some aspects of perceived reality and making them more salient in a communicating text, in such a way as to promote a particular problem definition, causal interpretation, moral evaluation, and/or treatment recommendation.**\n\nThis means every news story implicitly or explicitly:\n1. Defines what the problem is\n2. Identifies who or what caused it\n3. Makes a moral judgment about the actors\n4. Suggests what should be done\n\n## Practical Exercise\n\nTake one news story from three different outlets — Al Jazeera, Reuters, and a national publication. Identify the frame each outlet uses by answering the four questions above for each article. Where do the frames align? Where do they diverge? What does the divergence reveal?',
      estimatedMinutes: 75,
      isPublished: true,
    },
  });

  const c3m2 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course3.id, order: 2 } },
    update: {},
    create: {
      courseId: course3.id,
      title: 'Source Evaluation and Verification',
      order: 2,
      content:
        '# Source Evaluation and Verification\n\nIn the age of information overload, source evaluation is a foundational analytical skill. Not all sources are equal — and understanding why requires examining the institutional, financial, and political contexts that shape information production.\n\n## The SIFT Method\n\n- **Stop**: Before sharing or accepting a claim, pause\n- **Investigate the source**: Who published this? What is their track record?\n- **Find better coverage**: Is this reported elsewhere by independent outlets?\n- **Trace claims**: Go upstream to the original source of a claim\n\n## Institutional Bias vs. Individual Bias\n\nNews outlets are shaped by:\n- **Ownership structure**: Who funds and controls the outlet?\n- **Audience incentives**: What does the audience want to hear?\n- **Access journalism**: Sources provide access in exchange for favorable coverage\n- **National context**: Domestic political environment shapes what is publishable\n\n## Primary Sources\n\nAlways seek primary sources: official government statements, UN reports, academic papers, court documents. Secondary reporting introduces interpretation at every step.',
      estimatedMinutes: 75,
      isPublished: true,
    },
  });

  const c3m3 = await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course3.id, order: 3 } },
    update: {},
    create: {
      courseId: course3.id,
      title: 'Constructing Independent Analysis',
      order: 3,
      content:
        '# Constructing Independent Analysis\n\nThe goal of media literacy is not just to critique — it is to construct your own informed analysis. This requires moving from passive news consumption to active synthesis.\n\n## The Three-Layer Analysis Framework\n\n**Layer 1 — What happened?** (Factual baseline)\nStrip away interpretation and identify the verifiable facts. What actions were taken? By whom? When? With what stated justification?\n\n**Layer 2 — Why does it matter?** (Contextual significance)\nWhat is the historical and structural context? What interests are at stake? What patterns does this event fit into?\n\n**Layer 3 — What should I conclude?** (Analytical judgment)\nGiven the facts and context, what is your independent assessment? What do different analytical frameworks predict? Which do you find most convincing and why?\n\n## Writing Analytical Comments\n\nWhen writing on IMS News Central, your comments should:\n- State a clear analytical claim in the first sentence\n- Support it with specific evidence (not just assertions)\n- Acknowledge the strongest counterargument\n- Explain why your position survives that counterargument\n\nThis is the format that earns opinion point verification.',
      estimatedMinutes: 75,
      isPublished: true,
    },
  });

  // ── 16. Course Progress (member1 completed course1 module 1 & 2) ────────────
  console.log('  → Course progress...');
  await prisma.memberCourseProgress.upsert({
    where: { userId_moduleId: { userId: member1.id, moduleId: c1m1.id } },
    update: {},
    create: { userId: member1.id, moduleId: c1m1.id, courseId: course1.id, completedAt: new Date('2024-06-10T11:00:00Z') },
  });

  await prisma.memberCourseProgress.upsert({
    where: { userId_moduleId: { userId: member1.id, moduleId: c1m2.id } },
    update: {},
    create: { userId: member1.id, moduleId: c1m2.id, courseId: course1.id, completedAt: new Date('2024-06-17T14:00:00Z') },
  });

  await prisma.memberCourseProgress.upsert({
    where: { userId_moduleId: { userId: member3.id, moduleId: c3m1.id } },
    update: {},
    create: { userId: member3.id, moduleId: c3m1.id, courseId: course3.id, completedAt: new Date('2024-07-05T09:00:00Z') },
  });

  await prisma.memberCourseProgress.upsert({
    where: { userId_moduleId: { userId: member3.id, moduleId: c3m2.id } },
    update: {},
    create: { userId: member3.id, moduleId: c3m2.id, courseId: course3.id, completedAt: new Date('2024-07-12T10:00:00Z') },
  });

  await prisma.memberCourseProgress.upsert({
    where: { userId_moduleId: { userId: member3.id, moduleId: c3m3.id } },
    update: {},
    create: { userId: member3.id, moduleId: c3m3.id, courseId: course3.id, completedAt: new Date('2024-07-19T11:00:00Z') },
  });

  // Certificate for member3 completing course3
  await prisma.courseCertificate.upsert({
    where: { userId_courseId: { userId: member3.id, courseId: course3.id } },
    update: {},
    create: {
      userId: member3.id,
      courseId: course3.id,
      issuedAt: new Date('2024-07-20T12:00:00Z'),
      verificationHash: sha256(`member3-course3-completion-${member3.id}-${course3.id}`),
    },
  });

  // ── 17. Notifications ───────────────────────────────────────────────────────
  console.log('  → Notifications...');
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: member1.id,
        type: 'POINTS_ACTIVATED',
        title: 'Points Activated!',
        body: 'Your 15 pending points have been activated following your successful presentation. Your active points balance is now 320.',
        isRead: true,
        createdAt: new Date('2024-07-28T17:05:00Z'),
      },
      {
        userId: member2.id,
        type: 'POINTS_WIPED',
        title: 'Presentation Not Verified',
        body: 'Following your presentation review, your community leader was unable to verify your understanding of the submitted comment. Your 15 pending points have been removed.',
        isRead: true,
        createdAt: new Date('2024-06-18T15:35:00Z'),
      },
      {
        userId: member3.id,
        type: 'PRESENTATION_PENDING',
        title: 'Presentation Request Received',
        body: 'Your presentation request has been received. Your community leader Ahmad Al-Rashid will schedule a time within the next 5 days.',
        isRead: false,
        createdAt: new Date('2024-08-14T09:05:00Z'),
      },
      {
        userId: member1.id,
        type: 'COMMENT_VERIFIED',
        title: 'Comment Checkmark Awarded',
        body: 'Your comment on "US and China Exchange Sharp Warnings Over Taiwan Military Drills" has been verified by both a field expert and community leader.',
        isRead: true,
        createdAt: new Date('2024-07-20T14:35:00Z'),
      },
      {
        userId: member4.id,
        type: 'POINTS_EXPIRY_WARNING',
        title: 'Points Expiring in 14 Days',
        body: 'You have 30 pending points that will expire in 14 days if you have not completed your presentation. Request a presentation now to secure your points.',
        isRead: false,
        createdAt: addDays(new Date('2024-06-15'), 46),
      },
    ],
  });

  // ── 18. Additional News Stories (covering all 8 topics) ─────────────────────
  console.log('  → Additional news stories...');

  const story4 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('eu-ai-act-regulation-2024-03-13') },
    update: {},
    create: {
      headline: 'EU Passes Landmark AI Act: World\'s First Comprehensive Artificial Intelligence Regulation',
      slug: 'eu-ai-act-regulation-2024',
      canonicalHash: sha256('eu-ai-act-regulation-2024-03-13'),
      summary:
        'The European Union has formally passed the AI Act, the world\'s first comprehensive legal framework governing artificial intelligence. The legislation classifies AI systems by risk level, imposing strict requirements on high-risk applications in healthcare, law enforcement, and critical infrastructure. Generative AI systems like large language models face new transparency obligations. Critics argue the regulation may hamper innovation while advocates say it sets a global standard for AI governance.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-03-13T12:00:00Z'),
      isPublished: true,
      viewCount: 4120,
      topicId: newsTopics.find((t) => t.slug === 'technology')!.id,
      countries: { connect: [{ code: 'DE' }, { code: 'FR' }, { code: 'US' }] },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story4.id, sourceId: sourceMap['bbc-news']!.id } },
    update: {},
    create: {
      storyId: story4.id,
      sourceId: sourceMap['bbc-news']!.id,
      originalUrl: 'https://www.bbc.com/news/eu-ai-act-2024',
      excerpt: 'MEPs voted 523 to 46 in favour of the AI Act, which will phase in over two years. The law bans AI systems deemed an unacceptable risk, including social scoring systems used by governments.',
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story4.id, sourceId: sourceMap['reuters']!.id } },
    update: {},
    create: {
      storyId: story4.id,
      sourceId: sourceMap['reuters']!.id,
      originalUrl: 'https://www.reuters.com/technology/eu-ai-act-passed-2024',
      excerpt: 'The European Parliament approved the AI Act with an overwhelming majority, setting the stage for a years-long implementation process that will require companies deploying AI in Europe to meet new compliance standards.',
    },
  });

  const story5 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('muslim-europe-demographics-politics-2024-04-20') },
    update: {},
    create: {
      headline: 'Europe\'s Growing Muslim Communities Reshape Political Debate Ahead of EU Elections',
      slug: 'muslim-europe-demographics-politics-2024',
      canonicalHash: sha256('muslim-europe-demographics-politics-2024-04-20'),
      summary:
        'With European Parliament elections approaching, the political and social integration of Muslim communities has become a central debate across France, Germany, and the UK. New demographic data shows Muslim populations growing at twice the rate of the general population in several Western European nations, driven by higher birth rates and continued migration. Politicians across the spectrum are grappling with questions of identity, integration policy, and religious accommodation.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-04-20T09:00:00Z'),
      isPublished: true,
      viewCount: 5870,
      topicId: newsTopics.find((t) => t.slug === 'society')!.id,
      countries: { connect: [{ code: 'FR' }, { code: 'DE' }, { code: 'GB' }] },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story5.id, sourceId: sourceMap['middle-east-eye']!.id } },
    update: {},
    create: {
      storyId: story5.id,
      sourceId: sourceMap['middle-east-eye']!.id,
      originalUrl: 'https://www.middleeasteye.net/news/europe-muslims-demographics-2024',
      excerpt: 'New research from the Pew Research Center projects that Muslims will make up around 8-14% of Europe\'s population by 2050 under various migration scenarios, compared to 5% today.',
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story5.id, sourceId: sourceMap['al-jazeera']!.id } },
    update: {},
    create: {
      storyId: story5.id,
      sourceId: sourceMap['al-jazeera']!.id,
      originalUrl: 'https://www.aljazeera.com/news/europe-muslims-election-2024',
      excerpt: 'Muslim community leaders across Europe say they feel increasingly targeted by political rhetoric ahead of elections in which immigration and integration have become dominant campaign themes.',
    },
  });

  const story6 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('oic-jeddah-summit-palestine-2024-05-07') },
    update: {},
    create: {
      headline: 'OIC Emergency Summit in Jeddah Calls for Immediate Ceasefire in Gaza',
      slug: 'oic-jeddah-summit-palestine-ceasefire-2024',
      canonicalHash: sha256('oic-jeddah-summit-palestine-2024-05-07'),
      summary:
        'Foreign ministers of the 57-member Organisation of Islamic Cooperation convened an emergency session in Jeddah, issuing a unanimous resolution demanding an immediate and unconditional ceasefire in Gaza. The session also called for recognition of Palestinian statehood and the suspension of arms transfers to Israel. Analysts noted divergence between the rhetoric of the joint resolution and the bilateral policies of key member states.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-05-07T16:00:00Z'),
      isPublished: true,
      viewCount: 7340,
      topicId: newsTopics.find((t) => t.slug === 'religion')!.id,
      countries: { connect: [{ code: 'SA' }, { code: 'PS' }, { code: 'TR' }, { code: 'EG' }] },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story6.id, sourceId: sourceMap['al-jazeera']!.id } },
    update: {},
    create: {
      storyId: story6.id,
      sourceId: sourceMap['al-jazeera']!.id,
      originalUrl: 'https://www.aljazeera.com/news/oic-summit-jeddah-2024',
      excerpt: 'The OIC resolution passed without opposition, though diplomats noted it was non-binding and that several member states maintain active economic and security ties with Israel.',
    },
  });

  const story7 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('pakistan-bangladesh-floods-climate-2024-09-01') },
    update: {},
    create: {
      headline: 'Catastrophic Flooding in Pakistan and Bangladesh Displaces Millions as Scientists Warn of Climate Pattern',
      slug: 'pakistan-bangladesh-flooding-climate-2024',
      canonicalHash: sha256('pakistan-bangladesh-floods-climate-2024-09-01'),
      summary:
        'Record monsoon flooding has displaced over 8 million people across Pakistan and Bangladesh, devastating agricultural land and triggering a humanitarian emergency. Climate scientists say the South Asian monsoon pattern has intensified by 20-30% over the past two decades due to rising ocean temperatures. Both countries, which together contribute less than 1% of global carbon emissions, are calling on wealthy nations to fulfil climate finance commitments made under the Paris Agreement.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-09-01T08:00:00Z'),
      isPublished: true,
      viewCount: 3290,
      topicId: newsTopics.find((t) => t.slug === 'environment')!.id,
      countries: { connect: [{ code: 'PK' }, { code: 'BD' }] },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story7.id, sourceId: sourceMap['dawn']!.id } },
    update: {},
    create: {
      storyId: story7.id,
      sourceId: sourceMap['dawn']!.id,
      originalUrl: 'https://www.dawn.com/news/pakistan-flooding-2024',
      excerpt: 'The National Disaster Management Authority reported that approximately 4.5 million people in Pakistan\'s Balochistan and Sindh provinces have been displaced by floodwaters that inundated over 2 million acres of cropland.',
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story7.id, sourceId: sourceMap['bbc-news']!.id } },
    update: {},
    create: {
      storyId: story7.id,
      sourceId: sourceMap['bbc-news']!.id,
      originalUrl: 'https://www.bbc.com/news/south-asia-floods-2024',
      excerpt: 'The UN has appealed for $300 million in humanitarian assistance for South Asia flood victims. Aid agencies warn that Pakistan alone faces a food shortfall affecting 15 million people over the coming winter.',
    },
  });

  const story8 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('sahel-france-withdrawal-wagner-2024-02-15') },
    update: {},
    create: {
      headline: 'France Completes Military Withdrawal from Niger as Russian Influence Expands in Sahel',
      slug: 'france-niger-withdrawal-russia-sahel-2024',
      canonicalHash: sha256('sahel-france-withdrawal-wagner-2024-02-15'),
      summary:
        'France has completed the withdrawal of its remaining military forces from Niger following the 2023 coup that ousted President Bazoum. The departure marks a historic collapse of French influence across the Sahel region after similar expulsions from Mali and Burkina Faso. Russian military advisers and elements linked to the Wagner Group have established a presence in all three countries, raising concerns among Western governments about a strategic vacuum in one of the world\'s most volatile regions.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-02-15T14:00:00Z'),
      isPublished: true,
      viewCount: 2840,
      topicId: newsTopics.find((t) => t.slug === 'security')!.id,
      countries: { connect: [{ code: 'FR' }, { code: 'RU' }] },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story8.id, sourceId: sourceMap['al-jazeera']!.id } },
    update: {},
    create: {
      storyId: story8.id,
      sourceId: sourceMap['al-jazeera']!.id,
      originalUrl: 'https://www.aljazeera.com/news/sahel-france-withdrawal-2024',
      excerpt: 'The last French military transport aircraft departed Niamey on Saturday, ending a nine-year counterterrorism mission that Paris says killed hundreds of jihadist fighters but failed to stabilize the region.',
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story8.id, sourceId: sourceMap['reuters']!.id } },
    update: {},
    create: {
      storyId: story8.id,
      sourceId: sourceMap['reuters']!.id,
      originalUrl: 'https://www.reuters.com/world/africa/france-niger-departure-2024',
      excerpt: 'Russia\'s Africa Corps, which absorbed Wagner Group operations after Prigozhin\'s death, now has advisers embedded with military governments in Niger, Mali, and Burkina Faso, according to Western intelligence assessments.',
    },
  });

  const story9 = await prisma.newsStory.upsert({
    where: { canonicalHash: sha256('istanbul-ottoman-manuscripts-unesco-2024-06-20') },
    update: {},
    create: {
      headline: 'UNESCO Inscribes Ottoman Imperial Archives and Topkapi Manuscripts on World Heritage List',
      slug: 'istanbul-ottoman-manuscripts-unesco-2024',
      canonicalHash: sha256('istanbul-ottoman-manuscripts-unesco-2024-06-20'),
      summary:
        'UNESCO has added the Ottoman imperial archives and the Topkapi Palace manuscript collection in Istanbul to its Memory of the World Register. The collection includes over 300,000 documents spanning six centuries of Ottoman administration, along with rare illuminated Quran manuscripts and scientific treatises. Turkish cultural authorities are digitising the collection and plan to make it publicly accessible through an online portal, marking a significant step in preserving Islamic civilizational heritage.',
      summaryStatus: 'DONE',
      publishedAt: new Date('2024-06-20T11:00:00Z'),
      isPublished: true,
      viewCount: 1560,
      topicId: newsTopics.find((t) => t.slug === 'culture')!.id,
      countries: { connect: [{ code: 'TR' }] },
    },
  });

  await prisma.newsStorySource.upsert({
    where: { storyId_sourceId: { storyId: story9.id, sourceId: sourceMap['al-jazeera']!.id } },
    update: {},
    create: {
      storyId: story9.id,
      sourceId: sourceMap['al-jazeera']!.id,
      originalUrl: 'https://www.aljazeera.com/news/ottoman-manuscripts-unesco-2024',
      excerpt: 'The Topkapi collection includes works by scholars from Ibn Sina to al-Ghazali in their original manuscripts, alongside diplomatic correspondence, court records, and astronomical charts spanning the 14th to 20th centuries.',
    },
  });

  // Opinions on new stories
  await prisma.opinion.upsert({
    where: { storyId_authorId: { storyId: story4.id, authorId: expert1User.id } },
    update: {},
    create: {
      storyId: story4.id,
      authorId: expert1User.id,
      content:
        'The EU AI Act represents a significant regulatory intervention, but its effectiveness will depend on enforcement capacity — which the EU has historically struggled with in tech regulation. More importantly, the risk-classification framework may miss the most consequential AI harms, which tend to be diffuse and systemic rather than localized to high-risk applications. The real question is whether Brussels can set a standard that the US and China will converge on, or whether it creates fragmented digital markets.',
      isPublished: true,
      publishedAt: new Date('2024-03-16T10:00:00Z'),
    },
  });

  await prisma.opinion.upsert({
    where: { storyId_authorId: { storyId: story5.id, authorId: expert2User.id } },
    update: {},
    create: {
      storyId: story5.id,
      authorId: expert2User.id,
      content:
        'The framing of Muslim demographics as a political "problem" in European discourse reflects a fundamental confusion between integration challenges — which are real and require policy responses — and demographic anxiety, which is largely a manufactured political narrative. Muslim communities in France and Germany have lower upward mobility largely because of structural barriers to employment and housing, not cultural incompatibility. The evidence from the Netherlands and the UK shows that second-generation Muslims with economic opportunity integrate at rates comparable to other minority communities.',
      isPublished: true,
      publishedAt: new Date('2024-04-24T11:00:00Z'),
    },
  });

  // Additional comments on new stories
  await prisma.comment.upsert({
    where: { id: 'seed-comment-tech-001' },
    update: {},
    create: {
      id: 'seed-comment-tech-001',
      storyId: story4.id,
      authorId: member3.id,
      content:
        'The AI Act\'s risk-based approach is conceptually sound but practically limited by a fundamental problem: AI capabilities change faster than legislation. By the time the Act fully enters force in 2026, the frontier of AI technology will have shifted significantly. The regulation may end up governing yesterday\'s AI while tomorrow\'s capabilities emerge unregulated. A more dynamic regulatory model — closer to how financial regulators supervise systemic risk — would be more appropriate for a technology that compounds in capability and consequence.',
      status: 'OPINION_VERIFIED',
      requiredField: 'geopolitics',
      fieldExpertApproverId: expert1User.id,
      leaderApproverId: leader1.id,
      opinionPointsAwarded: 20,
      isPublished: true,
      publishedAt: new Date('2024-03-18T10:00:00Z'),
      expertApprovedAt: new Date('2024-03-20T11:00:00Z'),
      leaderApprovedAt: new Date('2024-03-21T14:30:00Z'),
      verifiedAt: new Date('2024-03-21T14:30:00Z'),
      fieldExpertApprover: { connect: { id: expert1User.id } },
      leaderApprover: { connect: { id: leader1.id } },
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-env-001' },
    update: {},
    create: {
      id: 'seed-comment-env-001',
      storyId: story7.id,
      authorId: member5.id,
      content:
        'Pakistan emits 0.8% of global CO2 yet ranks 5th on the global climate vulnerability index. This fundamental injustice — high vulnerability, low culpability — should reframe the climate finance debate. The "polluter pays" principle that underpins carbon markets implies wealthy emitters owe a debt to affected nations, not charity. Reframing climate finance as reparation rather than aid would unlock different political and legal mechanisms and change the negotiating dynamic entirely.',
      status: 'PUBLISHED',
      requiredField: 'economics',
      isPublished: true,
      publishedAt: new Date('2024-09-04T09:00:00Z'),
      submittedAt: new Date('2024-09-03T18:00:00Z'),
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-security-001' },
    update: {},
    create: {
      id: 'seed-comment-security-001',
      storyId: story8.id,
      authorId: member1.id,
      content:
        'France\'s Sahel failure illustrates a core tension in counterinsurgency doctrine: military presence can suppress violence locally while simultaneously generating the political grievances that fuel insurgency regionally. Operation Barkhane killed significant numbers of jihadist fighters while delegitimizing the host governments it relied on, creating the political conditions for the coups that ultimately expelled it. Russia\'s Wagner offers a simpler bargain — coup protection in exchange for resource access — which is politically appealing to military juntas even if it offers no long-term security solution.',
      status: 'OPINION_EXPERT_APPROVED',
      requiredField: 'geopolitics',
      fieldExpertApproverId: expert1User.id,
      opinionPointsAwarded: 18,
      isPublished: true,
      publishedAt: new Date('2024-02-18T10:00:00Z'),
      expertApprovedAt: new Date('2024-02-20T09:00:00Z'),
      opinionRequestedAt: new Date('2024-02-17T10:00:00Z'),
      submittedAt: new Date('2024-02-17T09:00:00Z'),
      fieldExpertApprover: { connect: { id: expert1User.id } },
    },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-society-001' },
    update: {},
    create: {
      id: 'seed-comment-society-001',
      storyId: story5.id,
      authorId: member4.id,
      content:
        'The conflation of Muslim identity with immigration in European political discourse obscures an important reality: a growing share of Europe\'s Muslim population is second and third generation — born citizens with no migration history. The "integration" framing is therefore often a category error. The relevant question is not whether Muslims can integrate, but whether European states will extend genuine equality to citizens who happen to be Muslim. France\'s laïcité model, which treats religious expression in public life as inherently problematic, structurally disadvantages visible minorities regardless of how "integrated" they are in every other dimension.',
      status: 'PENDING_OPINION_REVIEW',
      requiredField: 'geopolitics',
      isPublished: true,
      publishedAt: new Date('2024-04-25T14:00:00Z'),
      opinionRequestedAt: new Date('2024-04-28T10:00:00Z'),
      submittedAt: new Date('2024-04-24T16:00:00Z'),
    },
  });

  // ── 19. Additional Journal Papers (covering remaining 5 knowledge topics) ────
  console.log('  → Additional journal papers...');

  const ktHistory = knowledgeTopics.find((t) => t.slug === 'history')!;
  const ktPoliticalPhilosophy = knowledgeTopics.find((t) => t.slug === 'political-philosophy')!;
  const ktScienceSociety = knowledgeTopics.find((t) => t.slug === 'science-society')!;
  const ktMediaComm = knowledgeTopics.find((t) => t.slug === 'media-communication')!;
  const ktPhilosophyEthics = knowledgeTopics.find((t) => t.slug === 'philosophy-ethics')!;

  await prisma.journalPaper.upsert({
    where: { doi: '10.1093/isd/ottoman.caliphate.2021' },
    update: {},
    create: {
      title: 'The Abolition of the Ottoman Caliphate: Political Theology and the Crisis of Muslim Authority',
      slug: 'abolition-ottoman-caliphate-political-theology',
      authors: ['Hasan Kayali', 'Cemil Aydin'],
      journal: 'International Journal of Middle East Studies',
      doi: '10.1093/isd/ottoman.caliphate.2021',
      publishedYear: 2021,
      abstract:
        'This paper re-examines the 1924 abolition of the Ottoman Caliphate as a political theology event with lasting consequences for Muslim political thought. We challenge the historiographical consensus that the caliphate was an "empty institution" by the time of its abolition, arguing instead that Kemalist abolition represented a deliberate rupture with a trans-national Muslim political imaginary. We trace how this rupture generated three distinct responses — Pan-Islamic revival, Islamic nationalism, and quietist traditionalism — that continue to structure Muslim political thought to the present.',
      simplifiedAbstract:
        'When Turkey abolished the Caliphate in 1924, it did not just close a centuries-old office — it created a crisis about who speaks for Muslims politically that has never been resolved. This paper traces how that 1924 decision shaped everything from the Muslim Brotherhood to modern Islamic nationalism.',
      keyFindings: [
        'The caliphate was not politically irrelevant before 1924 — it was actively contested and defended by major Muslim movements across Asia and Africa',
        'Three distinct political responses to the abolition (revivalism, nationalism, quietism) map directly onto contemporary Muslim political movements',
        'The absence of a caliphate created a structural "authority vacuum" that Islamist movements and nation-states have competed to fill for a century',
      ],
      topicId: ktHistory.id,
      isPublished: true,
      timelinePosition: 2021.1,
      countries: { connect: [{ code: 'TR' }, { code: 'EG' }] },
    },
  });

  await prisma.journalPaper.upsert({
    where: { doi: '10.1017/islamic.constitutionalism.2022' },
    update: {},
    create: {
      title: 'Islamic Constitutionalism: Between Shura and Democratic Representation',
      slug: 'islamic-constitutionalism-shura-democracy',
      authors: ['Wael Hallaq', 'Khaled Abou El Fadl'],
      journal: 'American Journal of Comparative Law',
      doi: '10.1017/islamic.constitutionalism.2022',
      publishedYear: 2022,
      abstract:
        'This paper examines whether Islamic political thought contains resources for a genuine theory of constitutional government. Beginning with the classical concept of shura (consultation), we trace its evolution from an advisory institution in early caliphates to a contested ground for democratic claims in modern Islamic political theory. We argue that the binary opposition between "Islamic" and "democratic" governance is analytically unproductive, and propose instead a framework of "deliberative legitimacy" that draws on both Islamic jurisprudential tradition and contemporary democratic theory.',
      simplifiedAbstract:
        'Does Islam have its own theory of democratic government? This paper argues yes — built around the concept of shura (consultation). It shows how Islamic scholars have debated who should make decisions, who counts as "the community," and what limits even elected governments must respect, in ways that parallel — and sometimes exceed — Western democratic theory.',
      keyFindings: [
        'Shura in the Quran carries an obligation of genuine deliberation, not merely consultation at the discretion of rulers',
        'Classical Islamic jurisprudence developed robust theories of government accountability through hisba and scholarly oversight',
        'Modern Islamic constitutionalism\'s failure is not theological but political — states use Islamic language to legitimize rather than constrain authority',
      ],
      topicId: ktPoliticalPhilosophy.id,
      isPublished: true,
      timelinePosition: 2022.1,
      countries: {},
    },
  });

  await prisma.journalPaper.upsert({
    where: { doi: '10.1145/ai.algorithmic.bias.muslim.2023' },
    update: {},
    create: {
      title: 'Algorithmic Governance in Muslim-Majority Contexts: AI Bias, Surveillance, and Digital Rights',
      slug: 'algorithmic-governance-ai-bias-muslim-contexts',
      authors: ['Rumman Chowdhury', 'Safiya Umoja Noble', 'Tariq Mustafa'],
      journal: 'Big Data & Society',
      doi: '10.1145/ai.algorithmic.bias.muslim.2023',
      publishedYear: 2023,
      abstract:
        'This paper examines how artificial intelligence systems deployed in Muslim-majority countries reproduce and amplify existing structural inequalities. Drawing on case studies from Pakistan, Egypt, and Indonesia, we document three patterns: biometric surveillance systems disproportionately misidentifying individuals with darker skin and South Asian features; content moderation algorithms that systematically suppress Arabic and Urdu-language content; and predictive policing systems trained on historically biased police data. We argue that the governance frameworks developed in Western liberal contexts are inadequate for addressing AI harm in postcolonial settings.',
      simplifiedAbstract:
        'AI systems being used in Muslim-majority countries are causing harm in ways that Western researchers have barely examined. This paper documents how face recognition fails more often on South Asian faces, how social media algorithms suppress Arabic content, and how "predictive policing" AI imports historical discrimination into automated decisions.',
      keyFindings: [
        'Commercial face recognition systems show 34% higher error rates on South Asian faces compared to white European baseline',
        'Arabic and Urdu content faces 2.3x higher rates of automated removal on major platforms compared to English content of equivalent type',
        'Algorithmic accountability frameworks designed in the EU and US do not account for postcolonial institutional contexts',
      ],
      topicId: ktScienceSociety.id,
      isPublished: true,
      timelinePosition: 2023.3,
      countries: { connect: [{ code: 'PK' }, { code: 'EG' }, { code: 'ID' }] },
    },
  });

  await prisma.journalPaper.upsert({
    where: { doi: '10.1080/media.arab.spring.al.jazeera.2021' },
    update: {},
    create: {
      title: 'Al Jazeera and the Arab Spring: Transnational Media, Network Power, and Selective Coverage',
      slug: 'al-jazeera-arab-spring-media-framing',
      authors: ['Mohamed Zayani', 'Noureddine Miladi'],
      journal: 'Media, Culture & Society',
      doi: '10.1080/media.arab.spring.al.jazeera.2021',
      publishedYear: 2021,
      abstract:
        'This paper interrogates Al Jazeera\'s coverage of the Arab Spring uprisings of 2010-12 through the lens of "network power" — the capacity of transnational media to shape collective political action. We find that Al Jazeera\'s coverage was neither neutral nor uniformly supportive: the network gave extensive coverage to uprisings in Egypt, Tunisia, and Libya while treating protests in Qatar\'s allies (Bahrain, Saudi Arabia) with notable restraint. We develop the concept of "selective amplification" to describe how transnational media selectively empower some political movements while ignoring others.',
      simplifiedAbstract:
        'Al Jazeera became famous for covering the Arab Spring, but this paper shows its coverage was not neutral. It gave intense attention to revolutions in Egypt and Libya while barely covering protests in Bahrain — where Qatar\'s ally Saudi Arabia was sending troops. The paper introduces the idea of "selective amplification": media that claim to give the Muslim world a voice but actually amplify some voices and muffle others.',
      keyFindings: [
        'Al Jazeera coverage of Bahrain protests was 87% less intensive than coverage of Egypt protests at equivalent moments of political intensity',
        'Qatari state ownership created systematic blind spots in coverage of Gulf Cooperation Council political conflicts',
        'Transnational media can democratize political voice within — but not across — geopolitical alliances',
      ],
      topicId: ktMediaComm.id,
      isPublished: true,
      timelinePosition: 2021.2,
      countries: { connect: [{ code: 'EG' }, { code: 'SA' }, { code: 'JO' }] },
    },
  });

  await prisma.journalPaper.upsert({
    where: { doi: '10.1093/philosophy.adab.epistemic.virtue.2022' },
    update: {},
    create: {
      title: 'Adab as Epistemic Virtue: Toward an Islamic Framework for Intellectual Ethics',
      slug: 'adab-epistemic-virtue-islamic-intellectual-ethics',
      authors: ['Seyyed Hossein Nasr', 'Abdal Hakim Murad'],
      journal: 'Journal of Islamic Philosophy',
      doi: '10.1093/philosophy.adab.epistemic.virtue.2022',
      publishedYear: 2022,
      abstract:
        'This paper develops the classical Islamic concept of adab — conventionally translated as etiquette or propriety, but carrying deep epistemological content — as a framework for intellectual ethics. We argue that adab in the classical tradition specified not merely behavioural norms but epistemic virtues: intellectual humility, disciplined attention, acknowledgment of ignorance, and the proper ordering of knowledge. Connecting this tradition to contemporary virtue epistemology, we propose that adab offers resources for addressing epistemic vices — overconfidence, motivated reasoning, intellectual arrogance — that virtue epistemologists have largely overlooked.',
      simplifiedAbstract:
        'The Islamic concept of adab is usually translated as "etiquette" but actually contains a sophisticated theory of how to think well. This paper argues that adab specifies intellectual virtues: knowing the limits of your knowledge, listening with genuine attention, and being willing to say "I don\'t know." These ideas offer something fresh to modern philosophy, which has rediscovered "virtue epistemology" but missed this tradition.',
      keyFindings: [
        'Adab in classical Islamic pedagogy functioned as an epistemic discipline — regulating the acquisition and expression of knowledge, not merely its social forms',
        'Al-Ghazali\'s critique of scholastic pride (kibr al-ilm) anticipates and extends contemporary virtue epistemology\'s analysis of intellectual arrogance',
        'The adab tradition offers a relational epistemology — knowledge is always situated within teacher-student relationships — that corrects individualist assumptions in Western virtue epistemology',
      ],
      topicId: ktPhilosophyEthics.id,
      isPublished: true,
      timelinePosition: 2022.2,
      countries: {},
    },
  });

  // ── 20. Foreign Policy Entries for Additional Countries ───────────────────────
  console.log('  → Additional foreign policy entries...');

  const usCountry = countryMap['US']!;
  const saCountry = countryMap['SA']!;
  const trCountry = countryMap['TR']!;
  const cnCountry = countryMap['CN']!;

  await prisma.foreignPolicyEntry.createMany({
    skipDuplicates: true,
    data: [
      // United States
      {
        countryId: usCountry.id,
        title: 'US Withdraws from JCPOA and Reimports Sanctions on Iran',
        summary:
          'The Trump administration formally withdrew the United States from the Joint Comprehensive Plan of Action (Iran nuclear deal) and reimposed comprehensive economic sanctions on Tehran. The decision triggered a crisis in US-European relations, as the EU, UK, France, and Germany had backed the agreement. Iran subsequently began reducing its compliance with nuclear limits, and the deal effectively collapsed by 2020.',
        entryDate: new Date('2018-05-08'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Reuters', 'BBC', 'Al Jazeera']),
      },
      {
        countryId: usCountry.id,
        title: 'US Recognizes Jerusalem as Israel\'s Capital and Opens Embassy',
        summary:
          'The United States formally recognized Jerusalem as the capital of Israel and relocated its embassy from Tel Aviv, reversing decades of US foreign policy. The decision was condemned by the Arab League, the OIC, and a majority of UN General Assembly members. Palestinians declared the US had disqualified itself as a mediator in any future peace process.',
        entryDate: new Date('2018-05-14'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Reuters', 'Al Jazeera', 'Middle East Eye']),
      },
      {
        countryId: usCountry.id,
        title: 'Abraham Accords Normalize Relations Between Israel and Arab States',
        summary:
          'The United States brokered normalization agreements between Israel and the UAE, Bahrain, Sudan, and Morocco — the "Abraham Accords." The deals were celebrated in Washington as a historic breakthrough but criticized by Palestinians as a betrayal by Arab states that abandoned the requirement for Palestinian statehood as a precondition for normalization.',
        entryDate: new Date('2020-09-15'),
        type: 'MULTILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor2.id,
        sources: JSON.stringify(['Reuters', 'BBC', 'Al Jazeera']),
      },
      // Saudi Arabia
      {
        countryId: saCountry.id,
        title: 'Saudi Arabia Launches Vision 2030 Economic Diversification Plan',
        summary:
          'Crown Prince Mohammed bin Salman unveiled Vision 2030, an ambitious plan to reduce Saudi Arabia\'s dependence on oil by developing tourism, entertainment, and technology sectors. The plan included major reforms such as allowing women to drive, opening cinemas, and creating the NEOM mega-city project. Analysts noted the tension between economic modernization and the preservation of the political status quo.',
        entryDate: new Date('2016-04-25'),
        type: 'INTERNAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Reuters', 'BBC', 'Dawn']),
      },
      {
        countryId: saCountry.id,
        title: 'Saudi-Led Coalition Intervenes in Yemen Civil War',
        summary:
          'A Saudi-led military coalition began airstrikes in Yemen to restore the internationally recognized government after Houthi forces captured the capital Sana\'a. The intervention triggered a humanitarian catastrophe — the UN has described it as among the worst in the world — with over 300,000 deaths estimated by 2021 and 21 million people in need of humanitarian assistance.',
        entryDate: new Date('2015-03-26'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor2.id,
        sources: JSON.stringify(['Al Jazeera', 'Middle East Eye', 'Reuters']),
      },
      {
        countryId: saCountry.id,
        title: 'Saudi Arabia and Iran Restore Diplomatic Relations in China-Brokered Deal',
        summary:
          'Saudi Arabia and Iran agreed to restore diplomatic relations severed in 2016 following the Saudi execution of Shia cleric Nimr al-Nimr, in a deal brokered by China in Beijing. The rapprochement represented a significant diplomatic realignment and demonstrated China\'s growing role as a mediator in Middle Eastern affairs — a role previously dominated by the United States.',
        entryDate: new Date('2023-03-10'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Reuters', 'Al Jazeera', 'Middle East Eye']),
      },
      // Turkey
      {
        countryId: trCountry.id,
        title: 'Turkey Blocks Sweden\'s NATO Membership for Over a Year',
        summary:
          'Turkey blocked Sweden\'s bid to join NATO for over fourteen months, citing Swedish tolerance of Kurdish groups that Ankara designates as terrorist organizations, particularly the PKK. The prolonged veto strained Turkey\'s relations with its NATO partners and exposed fault lines within the alliance over the definition of terrorism and the balance between alliance solidarity and national security concerns.',
        entryDate: new Date('2022-05-18'),
        type: 'MULTILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor2.id,
        sources: JSON.stringify(['Reuters', 'BBC', 'Al Jazeera']),
      },
      {
        countryId: trCountry.id,
        title: 'Turkey Mediates Russia-Ukraine Grain Deal Through Istanbul Agreement',
        summary:
          'Turkey brokered the Black Sea Grain Initiative between Russia and Ukraine, allowing Ukrainian grain exports blocked by Russia\'s invasion to resume through a UN-monitored maritime corridor. The deal demonstrated Turkey\'s unique capacity as a NATO member maintaining functional relations with Russia — a role it leveraged to establish itself as an indispensable diplomatic actor.',
        entryDate: new Date('2022-07-22'),
        type: 'MULTILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Reuters', 'BBC', 'Dawn']),
      },
      // China
      {
        countryId: cnCountry.id,
        title: 'China Launches Belt and Road Initiative with Global Infrastructure Push',
        summary:
          'China announced the Belt and Road Initiative (BRI), committing hundreds of billions of dollars to infrastructure investment across Asia, Africa, the Middle East, and Europe. The initiative was celebrated by recipient governments as a development breakthrough and criticized by Western governments as "debt trap diplomacy" that uses infrastructure loans to establish strategic leverage. Academic evidence on the debt trap thesis is contested.',
        entryDate: new Date('2013-09-07'),
        type: 'MULTILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor1.id,
        sources: JSON.stringify(['Reuters', 'Dawn', 'Al Jazeera']),
      },
      {
        countryId: cnCountry.id,
        title: 'China Establishes First Overseas Military Base in Djibouti',
        summary:
          'China opened its first overseas military base in Djibouti, a small Horn of Africa nation that also hosts US, French, and Japanese military installations. Beijing described the facility as a "support base" for anti-piracy and humanitarian operations. Strategic analysts noted it as a landmark in China\'s transition from a continental to a global military power.',
        entryDate: new Date('2017-08-01'),
        type: 'BILATERAL',
        significance: 'HIGH',
        isPublished: true,
        authorId: editor2.id,
        sources: JSON.stringify(['Reuters', 'BBC', 'Al Jazeera']),
      },
    ],
  });

  // ── 21. Additional Videos (covering remaining topics) ────────────────────────
  console.log('  → Additional videos...');

  await prisma.video.upsert({
    where: { slug: 'ai-governance-ethics-muslim-societies' },
    update: {},
    create: {
      title: 'AI Governance and Ethics: What Muslim Societies Need to Know',
      slug: 'ai-governance-ethics-muslim-societies',
      description:
        'A structured introduction to artificial intelligence governance — how algorithms make decisions, how bias enters AI systems, and what the rise of AI means for Muslim communities globally. Covers the EU AI Act, surveillance capitalism, and Islamic ethical frameworks for evaluating technology.',
      topicId: newsTopics.find((t) => t.slug === 'technology')!.id,
      difficulty: 'BEGINNER',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'aircAruvnKk',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/aircAruvnKk',
      duration: 2580,
      isPublished: true,
      publishedAt: new Date('2024-03-20T10:00:00Z'),
      addedById: editor1.id,
      discussionBrief:
        '**Core question:**\n\nAI systems are trained on historical data — which reflects historical inequalities. Does this mean AI is inherently biased, or is bias a correctable engineering problem?\n\n**Analytical prompts:**\n\n1. Facial recognition systems perform worse on darker-skinned faces. Is this primarily a technical problem (insufficient training data) or a structural problem (who gets included in tech development)?\n2. How does the Islamic principle of *adl* (justice) apply to algorithmic decision-making in courts, loan approval, or job hiring?\n3. Should Muslim-majority countries develop their own AI governance frameworks, adopt the EU model, or resist AI governance as "digital colonialism"?',
      tags: ['technology', 'ai', 'governance', 'ethics', 'digital'],
    },
  });

  await prisma.video.upsert({
    where: { slug: 'climate-change-muslim-world-vulnerability' },
    update: {},
    create: {
      title: 'Climate Change and the Muslim World: Vulnerability, Justice, and Response',
      slug: 'climate-change-muslim-world-vulnerability',
      description:
        'An environmental policy lecture examining why Muslim-majority countries — Pakistan, Bangladesh, Egypt, Indonesia — face disproportionate climate risk despite minimal historical emissions. Covers climate science basics, the politics of climate finance, and Islamic environmental ethics (khalifah and hifz al-biyah).',
      topicId: newsTopics.find((t) => t.slug === 'environment')!.id,
      difficulty: 'INTERMEDIATE',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'G4H1N1PR9sE',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/G4H1N1PR9sE',
      duration: 3060,
      isPublished: true,
      publishedAt: new Date('2024-09-10T10:00:00Z'),
      addedById: editor2.id,
      discussionBrief:
        '**The core injustice:**\n\nPakistan produces 0.8% of global CO2 but ranks 5th on the global climate vulnerability index. Bangladesh produces 0.5% and faces existential flooding risk within decades.\n\n**Discussion questions:**\n\n1. The Paris Agreement commits wealthy nations to $100 billion/year in climate finance. This figure has not been met. Is this a broken promise, a coordination failure, or a predictable outcome of how international commitments work?\n2. The Quran describes humanity as *khalifah* (steward/trustee) of the earth. Does this carry a specific obligation to future generations? How does it compare to the secular concept of "intergenerational justice"?\n3. Should climate-vulnerable Muslim countries pursue climate litigation against major emitters in international courts? What are the strategic merits and risks?',
      tags: ['environment', 'climate', 'pakistan', 'bangladesh', 'policy'],
    },
  });

  await prisma.video.upsert({
    where: { slug: 'hybrid-warfare-syria-ukraine' },
    update: {},
    create: {
      title: 'Understanding Hybrid Warfare: From Syria to Ukraine',
      slug: 'hybrid-warfare-syria-ukraine',
      description:
        'A security studies lecture on the concept of hybrid warfare — the blend of conventional military force, irregular fighters, information operations, and economic pressure that characterizes 21st-century conflict. Case studies include Russia\'s intervention in Syria, the Ukraine war, and Hezbollah\'s military model.',
      topicId: newsTopics.find((t) => t.slug === 'security')!.id,
      difficulty: 'ADVANCED',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'FkgqTRs7fMQ',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/FkgqTRs7fMQ',
      duration: 3900,
      isPublished: true,
      publishedAt: new Date('2024-02-20T10:00:00Z'),
      addedById: editor1.id,
      discussionBrief:
        '**Definitional challenge:**\n\n"Hybrid warfare" is contested as an analytical concept — some scholars say it just describes all war, others say it captures a genuinely new phenomenon. Before the discussion, decide: is hybrid warfare a useful analytical category or a label that obscures more than it reveals?\n\n**Analytical prompts:**\n\n1. Russia maintained "plausible deniability" in eastern Ukraine from 2014-2022 using unmarked soldiers and proxy militias. How does this complicate the legal and moral frameworks for when a state is "at war"?\n2. Hezbollah has been described as a "state within a state" — a non-state actor with state-level military capabilities. What does this tell us about the erosion of the Westphalian model of interstate conflict?\n3. How should Muslim-majority states with limited conventional military capacity think about hybrid strategies for deterrence and defence?',
      tags: ['security', 'warfare', 'syria', 'russia', 'geopolitics'],
    },
  });

  await prisma.video.upsert({
    where: { slug: 'islamic-civilizational-heritage' },
    update: {},
    create: {
      title: 'Islamic Civilizational Heritage: Science, Art, and Architecture of the Golden Age',
      slug: 'islamic-civilizational-heritage',
      description:
        'A cultural and historical lecture exploring the intellectual and artistic achievements of Islamic civilization during the Abbasid Caliphate and Andalusian period — algebra, optics, medicine, architecture, and philosophy — and their transmission to Renaissance Europe. Addresses how this heritage should inform Muslim intellectual identity today.',
      topicId: newsTopics.find((t) => t.slug === 'culture')!.id,
      difficulty: 'BEGINNER',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'JTd1Az1bHt0',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/JTd1Az1bHt0',
      duration: 2880,
      isPublished: true,
      publishedAt: new Date('2024-07-10T10:00:00Z'),
      addedById: editor2.id,
      discussionBrief:
        '**The civilizational pride question:**\n\nMuslim intellectuals debate whether pride in the Islamic Golden Age is a healthy source of identity or a form of nostalgia that distracts from present challenges.\n\n**Discussion prompts:**\n\n1. Ibn al-Haytham\'s *Book of Optics* (1021) established the scientific method of experimental verification — predating Francis Bacon by 600 years. Why did the scientific revolution occur in Europe rather than in the Muslim world, given this head start?\n2. Andalusia (Islamic Spain) produced centuries of Jewish-Muslim-Christian intellectual exchange. What structural conditions made this possible, and what ended it? Are those conditions replicable?\n3. How should Muslims relate to their civilizational heritage — as a foundation to build on, a standard to recover, or a historical episode that belongs to its own context?',
      tags: ['culture', 'history', 'civilization', 'science', 'art'],
    },
  });

  await prisma.video.upsert({
    where: { slug: 'understanding-sectarianism-sunni-shia' },
    update: {},
    create: {
      title: 'Understanding Sunni-Shia Sectarianism: History, Politics, and Geopolitics',
      slug: 'understanding-sectarianism-sunni-shia',
      description:
        'An objective historical and political analysis of Sunni-Shia relations — the theological origins of the split, how it evolved across centuries, and how modern geopolitics (particularly Saudi-Iranian rivalry) has weaponized sectarian identity. Emphasizes analytical distance from sectarian narratives.',
      topicId: newsTopics.find((t) => t.slug === 'society')!.id,
      difficulty: 'INTERMEDIATE',
      uploadStatus: 'READY',
      encodingStatus: 'ENCODED',
      externalEmbedType: 'YOUTUBE',
      externalEmbedId: 'ors5GpAjDCM',
      externalEmbedUrl: 'https://www.youtube-nocookie.com/embed/ors5GpAjDCM',
      duration: 3240,
      isPublished: true,
      publishedAt: new Date('2024-05-15T10:00:00Z'),
      addedById: editor1.id,
      discussionBrief:
        '**The analytical challenge:**\n\nSectarianism is simultaneously a genuine theological disagreement, a political identity, and a tool of geopolitical manipulation. Analyzing it requires distinguishing these layers.\n\n**Discussion questions:**\n\n1. The Iraq War of 2003 is often cited as the trigger for contemporary Sunni-Shia conflict in the Arab world. Is this causation or correlation? What structural conditions were already present?\n2. Saudi Arabia and Iran both claim to lead the Muslim world. To what extent is their rivalry theological versus geopolitical? Could the same rivalry exist between two Sunni or two Shia states?\n3. How should individual Muslims and Muslim communities resist the politicization of sectarian identity when state actors and media have strong incentives to amplify it?',
      tags: ['society', 'sectarianism', 'geopolitics', 'religion', 'middle-east'],
    },
  });

  // ── 22. Additional Research Groups and Teams ──────────────────────────────────
  console.log('  → Additional research groups...');

  const rg3 = await prisma.researchGroup.upsert({
    where: { slug: 'technology-policy-research-centre' },
    update: {},
    create: {
      name: 'Technology Policy Research Centre',
      slug: 'technology-policy-research-centre',
      description:
        'A research group examining the governance of emerging technologies — AI, digital platforms, surveillance systems — with focus on their impact on Muslim communities globally. Produces policy briefs for advocacy and academic papers for publication.',
      field: 'technology',
      leaderId: leader1.id,
      isPublic: false,
      maxMembers: 10,
      memberCount: 0,
      isActive: true,
    },
  });

  const rg4 = await prisma.researchGroup.upsert({
    where: { slug: 'islamic-history-civilisation-group' },
    update: {},
    create: {
      name: 'Islamic History and Civilisation Study Group',
      slug: 'islamic-history-civilisation-group',
      description:
        'A research group combining historical scholarship with contemporary relevance — examining the political thought, science, jurisprudence, and culture of Islamic civilization from the Umayyad period through the collapse of the Ottoman Empire.',
      field: 'history',
      leaderId: leader2.id,
      isPublic: false,
      maxMembers: 8,
      memberCount: 0,
      isActive: true,
    },
  });

  const rt3 = await prisma.researchTeam.upsert({
    where: { slug: 'ai-ethics-working-group' },
    update: {},
    create: {
      name: 'AI Ethics Working Group',
      slug: 'ai-ethics-working-group',
      description:
        'An open team examining ethical frameworks for artificial intelligence from Islamic, secular, and comparative perspectives. Current focus: surveillance technology, algorithmic bias, and digital rights in Muslim-majority countries.',
      groupId: rg3.id,
      isOpen: true,
      maxMembers: 10,
      memberCount: 0,
      isActive: true,
    },
  });

  const rt4 = await prisma.researchTeam.upsert({
    where: { slug: 'ottoman-history-working-group' },
    update: {},
    create: {
      name: 'Ottoman History Working Group',
      slug: 'ottoman-history-working-group',
      description:
        'An open team studying the late Ottoman period (1850-1924) and its implications for modern Muslim political thought. Members collaborate on a collective annotated bibliography and produce analytical essays for the knowledge library.',
      groupId: rg4.id,
      isOpen: true,
      maxMembers: 8,
      memberCount: 0,
      isActive: true,
    },
  });

  // ── 23. Additional Academy Course: Islamic History ────────────────────────────
  console.log('  → Additional academy course...');

  const course4 = await prisma.academyCourse.upsert({
    where: { slug: 'introduction-to-islamic-history' },
    update: {},
    create: {
      title: 'Introduction to Islamic History: From Revelation to Caliphate',
      slug: 'introduction-to-islamic-history',
      description:
        'A structured survey of Islamic history from the early Meccan period through the Abbasid Caliphate — covering the Prophet\'s community, the Rashidun Caliphate, the Umayyad expansion, and the Abbasid golden age. Emphasises primary source analysis and political-historical context over hagiography.',
      field: 'history',
      difficulty: 'BEGINNER',
      estimatedHours: 10,
      isPublished: true,
      publishedAt: new Date('2024-08-01'),
      createdById: admin.id,
    },
  });

  await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course4.id, order: 1 } },
    update: {},
    create: {
      courseId: course4.id,
      title: 'The Meccan Period: Community Formation Under Persecution',
      order: 1,
      content:
        '# The Meccan Period: Community Formation Under Persecution\n\nThe first thirteen years of the Prophet Muhammad\'s mission took place in Mecca — a period of revelation, persecution, and the formation of the first Muslim community. Understanding this period requires holding two things simultaneously: the theological experience of revelation and the sociological dynamics of how a new community forms against entrenched opposition.\n\n## The Socioeconomic Context of Mecca\n\nMecca was a trading city whose economy depended on the Kaaba\'s role as a pilgrimage and commercial centre. The Quraysh tribe — custodians of the Kaaba — had powerful material interests in maintaining the pre-Islamic religious order. The Prophet\'s monotheistic message threatened not just religious belief but the city\'s economic model.\n\n## The Social Structure of the Early Community\n\nThe first Muslims were drawn disproportionately from:\n- Marginalized social groups: the poor, slaves, recent converts to the city\n- Young men without established tribal protection\n- Members of the Prophet\'s extended family\n\nThis pattern matters for understanding why tribal leaders initially opposed the message and why the community faced intense persecution.\n\n## Key Questions\n\n1. How does the social composition of the first Muslim community reflect or challenge the socioeconomic conditions of Mecca?\n2. What does the Bilal episode — an enslaved person becoming among the most honoured early Muslims — tell us about the message\'s relationship to the social hierarchy?\n3. How did the experience of persecution shape Muslim political thought about the relationship between faith and power?',
      estimatedMinutes: 90,
      isPublished: true,
    },
  });

  await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course4.id, order: 2 } },
    update: {},
    create: {
      courseId: course4.id,
      title: 'The Medinan Period: State Formation and Political Community',
      order: 2,
      content:
        '# The Medinan Period: State Formation and Political Community\n\nThe Hijra — migration from Mecca to Medina in 622 CE — marks a turning point: the Muslim community transitioned from a persecuted minority to a governing polity. This period is foundational for Islamic political thought because it established the first Muslim state and the principles governing it.\n\n## The Constitution of Medina\n\nAmong the most remarkable documents of early Islam is the "Constitution of Medina" (Sahifa al-Medina) — a compact between the Prophet, the Muhajirun (Meccan emigrants), the Ansar (Medinan helpers), and the Jewish tribes of Medina. Key provisions:\n\n- All signatory groups formed a single *ummah* (community) while retaining internal autonomy\n- Disputes were to be brought to the Prophet for arbitration\n- All parties were obligated to mutual defence against external attack\n- Each group retained its own religious law\n\nThis document has been read as an early model of pluralist coexistence — or as a pragmatic alliance forged under political necessity. The scholarly debate is instructive.\n\n## Military-Political Evolution\n\nThe Medinan period saw the transition from defensive to offensive military operations — from Badr (defensive) to Uhud (tactical setback) to Khandaq (defensive siege) to the conquest of Mecca (offensive). Understanding this trajectory is essential for any serious engagement with Islamic law of warfare (siyar).\n\n## Key Questions\n\n1. The Constitution of Medina guaranteed religious autonomy to Jewish tribes. How should this document inform contemporary debates about religious minorities in Muslim-majority states?\n2. At what point did the Muslim community shift from a defensive posture to a territorial expansion strategy, and what drove this shift?\n3. How did the death of the Prophet without a designated successor create the conditions for the Ridda wars and the first major political crisis of Islam?',
      estimatedMinutes: 90,
      isPublished: true,
    },
  });

  await prisma.academyModule.upsert({
    where: { courseId_order: { courseId: course4.id, order: 3 } },
    update: {},
    create: {
      courseId: course4.id,
      title: 'The Abbasid Golden Age: Civilization, Scholarship, and Institutional Development',
      order: 3,
      content:
        '# The Abbasid Golden Age: Civilization, Scholarship, and Institutional Development\n\nThe Abbasid Caliphate (750-1258 CE) represents the height of Islamic civilizational achievement. Baghdad became the intellectual capital of the known world, attracting scholars from Persia, India, Greece, and the Byzantine world. The translation movement (Bayt al-Hikmah) systematically incorporated Greek, Persian, and Indian knowledge into the Arabic-Islamic intellectual tradition.\n\n## Key Intellectual Achievements\n\n**Mathematics and Astronomy:**\n- Al-Khwarizmi developed algebra (al-jabr) and introduced Hindu-Arabic numerals to the Islamic world\n- Al-Battani\'s astronomical tables corrected Ptolemy and were used by Copernicus\n- Ibn al-Haytham (Alhazen) established the modern scientific method through controlled optical experiments\n\n**Medicine:**\n- Ibn Sina\'s (Avicenna) *Canon of Medicine* was the standard medical textbook in Europe until the 17th century\n- Al-Razi (Rhazes) distinguished smallpox from measles and pioneered clinical medicine\n\n**Philosophy:**\n- Al-Farabi\'s political philosophy synthesized Plato, Aristotle, and Islamic thought\n- Ibn Rushd (Averroes) commentaries on Aristotle transmitted Greek philosophy to medieval Europe\n\n## The Institutional Infrastructure\n\nThese achievements required institutional support:\n- The *waqf* (endowment) system funded hospitals, libraries, and educational institutions independently of state control\n- The *madrasa* system developed standardized curricula and credentialing for Islamic scholars\n- Paper — adopted from China via Central Asia — democratized book production\n\n## Key Questions\n\n1. Why did the Islamic scientific tradition, which was ahead of Europe by centuries, not produce a "scientific revolution"? What institutional, theological, or political conditions might explain this?\n2. The Mongol destruction of Baghdad (1258) is often cited as ending the Islamic Golden Age. Is this periodization historically accurate, or does it obscure longer-term factors?\n3. What does the Abbasid model of absorbing and synthesizing non-Islamic knowledge traditions suggest about the relationship between Islamic civilization and intellectual openness?',
      estimatedMinutes: 100,
      isPublished: true,
    },
  });

  // ── 24. Paper Review Submissions (dummy) ──────────────────────────────────────
  console.log('  → Paper review submissions...');

  await prisma.paperReviewSubmission.upsert({
    where: { id: 'seed-paper-review-001' },
    update: {},
    create: {
      id: 'seed-paper-review-001',
      userId: member5.id,
      title: 'The Role of Zakat in Poverty Alleviation: Evidence from Pakistan',
      abstract:
        'This paper examines the effectiveness of zakat institutions in reducing household poverty in rural Pakistan, using survey data from 1,200 households across three provinces. We find that formal zakat institutions reduce the probability of falling below the poverty line by 12% among recipient households, with stronger effects in regions with higher institutional quality.',
      status: 'UNDER_REVIEW',
      submittedAt: new Date('2024-08-20T10:00:00Z'),
      paperFileUrl: encrypt('research-papers/zakat-poverty-alleviation-pakistan.pdf'),
      assignedReviewerId: expert2User.id,
    },
  });

  await prisma.paperReviewSubmission.upsert({
    where: { id: 'seed-paper-review-002' },
    update: {},
    create: {
      id: 'seed-paper-review-002',
      userId: member3.id,
      title: 'Media Framing of the Gaza Conflict in Western and Arab Press: A Comparative Analysis',
      abstract:
        'This paper applies systematic framing analysis to coverage of the Gaza conflict in six news outlets — BBC, CNN, Al Jazeera, Reuters, The Guardian, and Al Arabiya — examining differences in source attribution, language choice, and contextual framing across 450 articles published between October and December 2023.',
      status: 'SUBMITTED',
      submittedAt: new Date('2024-09-05T14:00:00Z'),
      paperFileUrl: encrypt('research-papers/media-framing-gaza-conflict.pdf'),
    },
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Accounts created:');
  console.log('  Admin:         admin@ims-central.com        / Admin@IMS2024!');
  console.log('  Leader 1:      leader.ahmad@ims-central.com / Leader@IMS2024!');
  console.log('  Leader 2:      leader.fatima@ims-central.com / Leader@IMS2024!');
  console.log('  Editor 1:      editor.omar@ims-central.com  / Editor@IMS2024!');
  console.log('  Editor 2:      editor.zainab@ims-central.com / Editor@IMS2024!');
  console.log('  Expert 1:      expert.yusuf@ims-central.com  / Expert@IMS2024!');
  console.log('  Expert 2:      expert.mariam@ims-central.com / Expert@IMS2024!');
  console.log('  Member 1:      member.hassan@ims-central.com / Member@IMS2024!');
  console.log('  Member 2:      member.aisha@ims-central.com  / Member@IMS2024!');
  console.log('  Member 3:      member.bilal@ims-central.com  / Member@IMS2024!');
  console.log('  Member 4:      member.nadia@ims-central.com  / Member@IMS2024!');
  console.log('  Member 5:      member.tariq@ims-central.com  / Member@IMS2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
