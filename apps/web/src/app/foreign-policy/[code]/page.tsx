'use client';

import Link from 'next/link';

const ENTRIES_BY_COUNTRY = {
  PK: [
    {
      id: '1',
      title: 'Pakistan Joins SCO as Full Member',
      date: '2017-06-09',
      type: 'MULTILATERAL',
      summary:
        'Pakistan formally joined the Shanghai Cooperation Organisation as a full member, marking a significant shift in its multilateral engagement beyond traditional Western alliances.',
    },
    {
      id: '2',
      title: 'CPEC Phase II Launches with Focus on Special Economic Zones',
      date: '2019-11-05',
      type: 'BILATERAL',
      summary:
        'Pakistan and China announced the launch of Phase II of the China-Pakistan Economic Corridor, expanding beyond infrastructure into industrial cooperation.',
    },
    {
      id: '3',
      title: 'Pakistan-India Relations Suspended After Article 370 Revocation',
      date: '2019-08-07',
      type: 'BILATERAL',
      summary:
        'Pakistan downgraded diplomatic relations with India following New Delhi\'s revocation of Article 370, which had granted special status to Jammu and Kashmir.',
    },
    {
      id: '4',
      title: 'Pakistan Abstains on UN Resolution Condemning Russia\'s Invasion of Ukraine',
      date: '2022-03-02',
      type: 'MULTILATERAL',
      summary:
        'Pakistan abstained from the UN General Assembly resolution condemning Russia\'s invasion of Ukraine, maintaining a policy of neutrality.',
    },
    {
      id: '5',
      title: 'Pakistan Joins Saudi-Led Broader Middle East Security Alliance Discussions',
      date: '2024-05-18',
      type: 'MULTILATERAL',
      summary:
        'Pakistani officials participated in preliminary discussions around a proposed Middle East security architecture led by Saudi Arabia.',
    },
  ],
  US: [
    {
      id: '1',
      title: 'US Withdraws from JCPOA and Reimports Sanctions on Iran',
      date: '2018-05-08',
      type: 'BILATERAL',
      summary:
        'The Trump administration formally withdrew the United States from the Joint Comprehensive Plan of Action (Iran nuclear deal) and reimposed comprehensive economic sanctions.',
    },
    {
      id: '2',
      title: 'US Recognizes Jerusalem as Israel\'s Capital and Opens Embassy',
      date: '2018-05-14',
      type: 'BILATERAL',
      summary:
        'The United States formally recognized Jerusalem as the capital of Israel and relocated its embassy from Tel Aviv, reversing decades of US foreign policy.',
    },
    {
      id: '3',
      title: 'Abraham Accords Normalize Relations Between Israel and Arab States',
      date: '2020-09-15',
      type: 'MULTILATERAL',
      summary:
        'The United States brokered normalization agreements between Israel and the UAE, Bahrain, Sudan, and Morocco.',
    },
  ],
  SA: [
    {
      id: '1',
      title: 'Saudi Arabia Launches Vision 2030 Economic Diversification Plan',
      date: '2016-04-25',
      type: 'INTERNAL',
      summary:
        'Crown Prince Mohammed bin Salman unveiled Vision 2030, an ambitious plan to reduce Saudi Arabia\'s dependence on oil by developing tourism, entertainment, and technology sectors.',
    },
    {
      id: '2',
      title: 'Saudi-Led Coalition Intervenes in Yemen Civil War',
      date: '2015-03-26',
      type: 'BILATERAL',
      summary:
        'A Saudi-led military coalition began airstrikes in Yemen to restore the internationally recognized government after Houthi forces captured the capital Sana\'a.',
    },
    {
      id: '3',
      title: 'Saudi Arabia and Iran Restore Diplomatic Relations in China-Brokered Deal',
      date: '2023-03-10',
      type: 'BILATERAL',
      summary:
        'Saudi Arabia and Iran agreed to restore diplomatic relations severed in 2016, in a deal brokered by China in Beijing.',
    },
  ],
  TR: [
    {
      id: '1',
      title: 'Turkey Blocks Sweden\'s NATO Membership for Over a Year',
      date: '2022-05-18',
      type: 'MULTILATERAL',
      summary:
        'Turkey blocked Sweden\'s bid to join NATO for over fourteen months, citing Swedish tolerance of Kurdish groups that Ankara designates as terrorist organizations.',
    },
    {
      id: '2',
      title: 'Turkey Mediates Russia-Ukraine Grain Deal Through Istanbul Agreement',
      date: '2022-07-22',
      type: 'MULTILATERAL',
      summary:
        'Turkey brokered the Black Sea Grain Initiative between Russia and Ukraine, allowing Ukrainian grain exports blocked by Russia\'s invasion to resume.',
    },
  ],
  CN: [
    {
      id: '1',
      title: 'China Launches Belt and Road Initiative with Global Infrastructure Push',
      date: '2013-09-07',
      type: 'MULTILATERAL',
      summary:
        'China announced the Belt and Road Initiative, committing hundreds of billions of dollars to infrastructure investment across Asia, Africa, the Middle East, and Europe.',
    },
    {
      id: '2',
      title: 'China Establishes First Overseas Military Base in Djibouti',
      date: '2017-08-01',
      type: 'BILATERAL',
      summary:
        'China opened its first overseas military base in Djibouti, a small Horn of Africa nation that also hosts US, French, and Japanese military installations.',
    },
  ],
};

const COUNTRY_INFO = {
  PK: { name: 'Pakistan', flag: '🇵🇰' },
  US: { name: 'United States', flag: '🇺🇸' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦' },
  TR: { name: 'Turkey', flag: '🇹🇷' },
  CN: { name: 'China', flag: '🇨🇳' },
};

export default function CountryPage({ params }: { params: { code: string } }) {
  const entries = ENTRIES_BY_COUNTRY[params.code as keyof typeof ENTRIES_BY_COUNTRY] || [];
  const info = COUNTRY_INFO[params.code as keyof typeof COUNTRY_INFO];

  if (!info) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
          <Link href="/foreign-policy" className="text-primary hover:text-accent">
            ← Back to Foreign Policy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/foreign-policy" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Foreign Policy
          </Link>
          <div className="text-6xl mb-4">{info.flag}</div>
          <h1 className="text-4xl font-bold">{info.name}</h1>
          <p className="text-lg opacity-90 mt-2">Geopolitical history and strategic developments</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Policy Timeline</h2>
        <div className="space-y-6">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()} • {entry.type}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{entry.summary}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No entries found for this country.</p>
          )}
        </div>
      </div>
    </div>
  );
}
