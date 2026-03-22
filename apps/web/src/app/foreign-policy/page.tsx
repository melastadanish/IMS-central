'use client';

import Link from 'next/link';

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', region: 'South Asia' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Middle East / Europe' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'East Asia' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Middle East / North Africa' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', region: 'Middle East' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'South Asia' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', region: 'South Asia' },
];

export default function ForeignPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Foreign Policy Tracker</h1>
          <p className="text-lg opacity-90">
            Track geopolitical developments, bilateral relations, and strategic shifts across key nations.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <Link
            href="/foreign-policy"
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Countries
          </Link>
          <Link
            href="/foreign-policy/compare"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Compare
          </Link>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Key Nations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COUNTRIES.map((country) => (
            <Link
              key={country.code}
              href={`/foreign-policy/${country.code}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-3">{country.flag}</div>
              <h3 className="font-bold text-xl mb-1">{country.name}</h3>
              <p className="text-sm text-gray-600">{country.region}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
