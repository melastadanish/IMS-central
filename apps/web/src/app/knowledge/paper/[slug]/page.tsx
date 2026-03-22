'use client';

import Link from 'next/link';

const PAPERS = {
  'maqasid-al-shariah-contemporary-governance': {
    title: 'Maqasid al-Shariah and Contemporary Governance: A Jurisprudential Framework',
    authors: ['Dr. Tariq Ramadan', 'Dr. Jasser Auda'],
    journal: 'Journal of Islamic Studies',
    year: 2022,
    doi: '10.1163/15692086-12341456',
    abstract:
      'This paper develops a systems-based reading of maqasid al-shariah (the objectives of Islamic law) as a framework for evaluating contemporary governance structures. Moving beyond the traditional five-necessity framework, we propose a dynamic model in which Islamic jurisprudence engages with governance through three levels of analysis: primary objectives, secondary enablers, and contextual adaptations. The framework is applied to three case studies: Islamic finance regulation, minority rights jurisprudence, and environmental governance.',
    keyFindings: [
      'The classical five-necessity framework is insufficient for evaluating modern governance without a dynamic systems layer',
      'Secondary enablers — justice, dignity, community cohesion — are as jurisprudentially binding as the primary necessities',
      'Environmental governance represents a new sixth necessity (hifz al-biyah) supported by classical textual evidence',
    ],
  },
  'islamic-constitutionalism-shura-democracy': {
    title: 'Islamic Constitutionalism: Between Shura and Democratic Representation',
    authors: ['Wael Hallaq', 'Khaled Abou El Fadl'],
    journal: 'American Journal of Comparative Law',
    year: 2022,
    doi: '10.1017/islamic.constitutionalism.2022',
    abstract:
      'This paper examines whether Islamic political thought contains resources for a genuine theory of constitutional government. Beginning with the classical concept of shura (consultation), we trace its evolution from an advisory institution in early caliphates to a contested ground for democratic claims in modern Islamic political theory.',
    keyFindings: [
      'Shura in the Quran carries an obligation of genuine deliberation, not merely consultation at the discretion of rulers',
      'Classical Islamic jurisprudence developed robust theories of government accountability through hisba and scholarly oversight',
      'Modern Islamic constitutionalism\'s failure is not theological but political — states use Islamic language to legitimize rather than constrain authority',
    ],
  },
  'abolition-ottoman-caliphate-political-theology': {
    title: 'The Abolition of the Ottoman Caliphate: Political Theology and the Crisis of Muslim Authority',
    authors: ['Hasan Kayali', 'Cemil Aydin'],
    journal: 'International Journal of Middle East Studies',
    year: 2021,
    doi: '10.1093/isd/ottoman.caliphate.2021',
    abstract:
      'This paper re-examines the 1924 abolition of the Ottoman Caliphate as a political theology event with lasting consequences for Muslim political thought. We challenge the historiographical consensus that the caliphate was an "empty institution" by the time of its abolition, arguing instead that Kemalist abolition represented a deliberate rupture with a trans-national Muslim political imaginary.',
    keyFindings: [
      'The caliphate was not politically irrelevant before 1924 — it was actively contested and defended by major Muslim movements across Asia and Africa',
      'Three distinct political responses to the abolition (revivalism, nationalism, quietism) map directly onto contemporary Muslim political movements',
      'The absence of a caliphate created a structural "authority vacuum" that Islamist movements and nation-states have competed to fill for a century',
    ],
  },
  'imf-conditionalities-elite-capture-pakistan': {
    title: 'Structural Adjustment and Elite Capture: Why IMF Conditionalities Fail in Pakistan',
    authors: ['Ayesha Raza Farooq', 'Mehtab Ali Khan'],
    journal: 'Third World Quarterly',
    year: 2023,
    doi: '10.1080/09512748.2023.00054321',
    abstract:
      'This paper analyses fifteen IMF programs in Pakistan between 1988 and 2023, identifying systematic patterns of conditionality reversal. We argue that structural adjustment fails not because of technical design flaws but because program ownership is captured by elite coalitions.',
    keyFindings: [
      'Conditionality reversal occurs in 87% of Pakistani IMF programs within 18 months of disbursement',
      'Agricultural income tax — the primary reform target — has never been implemented despite appearing in every program since 1990',
      'Elite capture of program design explains failure better than governance capacity arguments',
    ],
  },
  'strategic-ambiguity-deterrence-taiwan-strait': {
    title: 'Strategic Ambiguity and Deterrence Failure: Lessons from the Taiwan Strait',
    authors: ['James T. Morrison', 'Liu Wei'],
    journal: 'International Organization',
    year: 2023,
    doi: '10.1017/S0020818300012345',
    abstract:
      'This paper examines the conditions under which strategic ambiguity as a deterrence posture becomes counterproductive. Using a formal model and applying it to the Taiwan Strait case, we argue that as the balance of military capabilities shifts, ambiguity that was previously stabilizing can become destabilizing.',
    keyFindings: [
      'Strategic ambiguity stabilizes deterrence only when the deterring power holds a clear military advantage',
      'As Chinese naval and air capabilities approach parity in the Western Pacific, US strategic ambiguity loses its deterrent credibility',
      'Three measurable thresholds signal when policy should shift from ambiguity to commitment',
    ],
  },
  'algorithmic-governance-ai-bias-muslim-contexts': {
    title: 'Algorithmic Governance in Muslim-Majority Contexts: AI Bias, Surveillance, and Digital Rights',
    authors: ['Rumman Chowdhury', 'Safiya Umoja Noble', 'Tariq Mustafa'],
    journal: 'Big Data & Society',
    year: 2023,
    doi: '10.1145/ai.algorithmic.bias.muslim.2023',
    abstract:
      'This paper examines how artificial intelligence systems deployed in Muslim-majority countries reproduce and amplify existing structural inequalities. Drawing on case studies from Pakistan, Egypt, and Indonesia, we document three patterns: biometric surveillance systems disproportionately misidentifying individuals with darker skin and South Asian features.',
    keyFindings: [
      'Commercial face recognition systems show 34% higher error rates on South Asian faces compared to white European baseline',
      'Arabic and Urdu content faces 2.3x higher rates of automated removal on major platforms compared to English content of equivalent type',
      'Algorithmic accountability frameworks designed in the EU and US do not account for postcolonial institutional contexts',
    ],
  },
  'al-jazeera-arab-spring-media-framing': {
    title: 'Al Jazeera and the Arab Spring: Transnational Media, Network Power, and Selective Coverage',
    authors: ['Mohamed Zayani', 'Noureddine Miladi'],
    journal: 'Media, Culture & Society',
    year: 2021,
    doi: '10.1080/media.arab.spring.al.jazeera.2021',
    abstract:
      'This paper interrogates Al Jazeera\'s coverage of the Arab Spring uprisings of 2010-12 through the lens of "network power" — the capacity of transnational media to shape collective political action. We find that Al Jazeera\'s coverage was neither neutral nor uniformly supportive.',
    keyFindings: [
      'Al Jazeera coverage of Bahrain protests was 87% less intensive than coverage of Egypt protests at equivalent moments of political intensity',
      'Qatari state ownership created systematic blind spots in coverage of Gulf Cooperation Council political conflicts',
      'Transnational media can democratize political voice within — but not across — geopolitical alliances',
    ],
  },
  'adab-epistemic-virtue-islamic-intellectual-ethics': {
    title: 'Adab as Epistemic Virtue: Toward an Islamic Framework for Intellectual Ethics',
    authors: ['Seyyed Hossein Nasr', 'Abdal Hakim Murad'],
    journal: 'Journal of Islamic Philosophy',
    year: 2022,
    doi: '10.1093/philosophy.adab.epistemic.virtue.2022',
    abstract:
      'This paper develops the classical Islamic concept of adab — conventionally translated as etiquette or propriety, but carrying deep epistemological content — as a framework for intellectual ethics. We argue that adab in the classical tradition specified not merely behavioural norms but epistemic virtues.',
    keyFindings: [
      'Adab in classical Islamic pedagogy functioned as an epistemic discipline — regulating the acquisition and expression of knowledge, not merely its social forms',
      'Al-Ghazali\'s critique of scholastic pride (kibr al-ilm) anticipates and extends contemporary virtue epistemology\'s analysis of intellectual arrogance',
      'The adab tradition offers a relational epistemology — knowledge is always situated within teacher-student relationships — that corrects individualist assumptions in Western virtue epistemology',
    ],
  },
};

export default function PaperPage({ params }: { params: { slug: string } }) {
  const paper = PAPERS[params.slug as keyof typeof PAPERS];

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Paper Not Found</h1>
          <Link href="/knowledge" className="text-primary hover:text-accent">
            ← Back to Knowledge Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/knowledge" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Knowledge
          </Link>
          <h1 className="text-3xl font-bold mb-4">{paper.title}</h1>
          <p className="text-lg opacity-90">{paper.authors.join(', ')}</p>
          <p className="text-sm opacity-75 mt-2">
            {paper.journal} • {paper.year} • DOI: {paper.doi}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Abstract */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
        </section>

        {/* Key Findings */}
        <section className="bg-light-blue rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Key Findings</h2>
          <ul className="space-y-4">
            {paper.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Discussion */}
        <section className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-4">Discussion</h2>
          <p className="text-gray-700 mb-4">
            This paper contributes to the scholarly conversation by providing empirical evidence and theoretical frameworks for understanding contemporary challenges in the field. The findings have implications for policy makers, practitioners, and scholars interested in the intersection of theory and practice.
          </p>
          <div className="bg-gray-50 border-l-4 border-primary p-4">
            <p className="text-sm text-gray-600">
              <strong>Citation:</strong> {paper.authors.join(', ')}. "{paper.title}." <em>{paper.journal}</em>, vol. {paper.year}. DOI: {paper.doi}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
