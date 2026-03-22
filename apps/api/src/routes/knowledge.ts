import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/v1/knowledge/topics
router.get('/topics', (req: Request, res: Response) => {
  const topics = [
    {
      slug: 'islamic-jurisprudence',
      name: 'Islamic Jurisprudence',
      icon: '⚖️',
      description: 'Classical and contemporary Islamic law',
    },
    {
      slug: 'political-philosophy',
      name: 'Political Philosophy',
      icon: '🏛️',
      description: 'Governance, authority, and justice',
    },
    {
      slug: 'history',
      name: 'History',
      icon: '📚',
      description: 'Islamic and world history',
    },
    {
      slug: 'economics-policy',
      name: 'Economics & Policy',
      icon: '📊',
      description: 'Economic systems and policy analysis',
    },
    {
      slug: 'international-relations',
      name: 'International Relations',
      icon: '🌍',
      description: 'Geopolitics and diplomacy',
    },
    {
      slug: 'science-society',
      name: 'Science & Society',
      icon: '🔬',
      description: 'Science, technology, and society',
    },
    {
      slug: 'media-communication',
      name: 'Media & Communication',
      icon: '📻',
      description: 'Media studies and communication theory',
    },
    {
      slug: 'philosophy-ethics',
      name: 'Philosophy & Ethics',
      icon: '💭',
      description: 'Philosophical inquiry and ethics',
    },
  ];

  res.json({ success: true, data: topics });
});

// GET /api/v1/knowledge/papers
router.get('/papers', (req: Request, res: Response) => {
  const papers = [
    {
      id: '1',
      title: 'Maqasid al-Shariah and Contemporary Governance',
      slug: 'maqasid-al-shariah-contemporary-governance',
      authors: ['Dr. Tariq Ramadan', 'Dr. Jasser Auda'],
      journal: 'Journal of Islamic Studies',
      year: 2022,
      topic: 'islamic-jurisprudence',
    },
    {
      id: '2',
      title: 'Islamic Constitutionalism: Between Shura and Democracy',
      slug: 'islamic-constitutionalism-shura-democracy',
      authors: ['Wael Hallaq', 'Khaled Abou El Fadl'],
      journal: 'American Journal of Comparative Law',
      year: 2022,
      topic: 'political-philosophy',
    },
    {
      id: '3',
      title: 'The Abolition of the Ottoman Caliphate: Political Theology',
      slug: 'abolition-ottoman-caliphate-political-theology',
      authors: ['Hasan Kayali', 'Cemil Aydin'],
      journal: 'International Journal of Middle East Studies',
      year: 2021,
      topic: 'history',
    },
    {
      id: '4',
      title: 'Structural Adjustment and Elite Capture: Why IMF Conditionalities Fail',
      slug: 'imf-conditionalities-elite-capture-pakistan',
      authors: ['Ayesha Raza Farooq', 'Mehtab Ali Khan'],
      journal: 'Third World Quarterly',
      year: 2023,
      topic: 'economics-policy',
    },
    {
      id: '5',
      title: 'Strategic Ambiguity and Deterrence Failure: Taiwan Strait',
      slug: 'strategic-ambiguity-deterrence-failure-taiwan-strait',
      authors: ['James T. Morrison', 'Liu Wei'],
      journal: 'International Organization',
      year: 2023,
      topic: 'international-relations',
    },
    {
      id: '6',
      title: 'Algorithmic Governance in Muslim-Majority Contexts',
      slug: 'algorithmic-governance-ai-bias-muslim-contexts',
      authors: ['Rumman Chowdhury', 'Safiya Umoja Noble', 'Tariq Mustafa'],
      journal: 'Big Data & Society',
      year: 2023,
      topic: 'science-society',
    },
    {
      id: '7',
      title: 'Al Jazeera and the Arab Spring: Transnational Media',
      slug: 'al-jazeera-arab-spring-media-framing',
      authors: ['Mohamed Zayani', 'Noureddine Miladi'],
      journal: 'Media, Culture & Society',
      year: 2021,
      topic: 'media-communication',
    },
    {
      id: '8',
      title: 'Adab as Epistemic Virtue: Islamic Framework for Intellectual Ethics',
      slug: 'adab-epistemic-virtue-islamic-intellectual-ethics',
      authors: ['Seyyed Hossein Nasr', 'Abdal Hakim Murad'],
      journal: 'Journal of Islamic Philosophy',
      year: 2022,
      topic: 'philosophy-ethics',
    },
  ];

  res.json({ success: true, data: papers });
});

// GET /api/v1/knowledge/papers/:slug
router.get('/papers/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const paper = {
    slug,
    title: 'Academic Paper Title',
    authors: ['Author 1', 'Author 2'],
    journal: 'Journal Name',
    year: 2023,
    doi: '10.1234/example.doi',
    abstract: 'This is the paper abstract...',
    keyFindings: [
      'Finding 1 explaining key insight',
      'Finding 2 with important implication',
      'Finding 3 addressing research question',
    ],
  };

  res.json({ success: true, data: paper });
});

export default router;
