'use client';

import Link from 'next/link';
import { useState } from 'react';

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'US', name: 'United States' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'CN', name: 'China' },
];

const COMPARISON_DATA = {
  PK: {
    primaryAlliances: ['China', 'Saudi Arabia', 'Turkey'],
    keyVulnerabilities: ['Economic instability', 'India rivalry', 'Terrorism'],
    strategicPriorities: ['CPEC completion', 'Kashmir autonomy', 'Energy security'],
  },
  US: {
    primaryAlliances: ['EU', 'Japan', 'South Korea', 'Israel'],
    keyVulnerabilities: ['Great power competition', 'Domestic polarization'],
    strategicPriorities: ['China containment', 'Allies reassurance', 'Hegemonic stability'],
  },
  SA: {
    primaryAlliances: ['US', 'UAE', 'Egypt'],
    keyVulnerabilities: ['Iran rivalry', 'Oil price volatility', 'Regional instability'],
    strategicPriorities: ['Vision 2030', 'Yemen stability', 'Chinese investment'],
  },
  TR: {
    primaryAlliances: ['NATO', 'Azerbaijan', 'Qatar'],
    keyVulnerabilities: ['Kurdish movements', 'Economic struggles', 'Greece tensions'],
    strategicPriorities: ['Regional primacy', 'Refugee management', 'Great power balancing'],
  },
  CN: {
    primaryAlliances: ['Russia', 'Pakistan', 'Iran'],
    keyVulnerabilities: ['Taiwan', 'South China Sea disputes', 'US containment'],
    strategicPriorities: ['BRI expansion', 'Taiwan unification', 'Superpower status'],
  },
};

export default function CompareCountriesPage() {
  const [selected, setSelected] = useState<string[]>(['PK', 'US']);

  const toggleCountry = (code: string) => {
    if (selected.includes(code)) {
      if (selected.length > 1) setSelected(selected.filter((c) => c !== code));
    } else {
      if (selected.length < 3) setSelected([...selected, code]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/foreign-policy" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Foreign Policy
          </Link>
          <h1 className="text-3xl font-bold">Compare Countries</h1>
          <p className="opacity-90 mt-2">Select up to 3 countries to compare their strategic profiles</p>
        </div>
      </div>

      {/* Selection */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Select Countries</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => toggleCountry(country.code)}
              className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                selected.includes(country.code)
                  ? 'border-primary bg-light-blue text-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
              }`}
            >
              {country.name}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        {selected.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header */}
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Aspect</th>
                    {selected.map((code) => (
                      <th key={code} className="px-6 py-4 text-left font-bold text-gray-900">
                        {COUNTRIES.find((c) => c.code === code)?.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Body */}
                <tbody>
                  {/* Primary Alliances */}
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 font-bold text-gray-900">Primary Alliances</td>
                    {selected.map((code) => (
                      <td key={code} className="px-6 py-4 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          {COMPARISON_DATA[code as keyof typeof COMPARISON_DATA].primaryAlliances.map((ally, idx) => (
                            <li key={idx}>{ally}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  {/* Key Vulnerabilities */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">Key Vulnerabilities</td>
                    {selected.map((code) => (
                      <td key={code} className="px-6 py-4 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          {COMPARISON_DATA[code as keyof typeof COMPARISON_DATA].keyVulnerabilities.map((vuln, idx) => (
                            <li key={idx}>{vuln}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  {/* Strategic Priorities */}
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">Strategic Priorities</td>
                    {selected.map((code) => (
                      <td key={code} className="px-6 py-4 text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          {COMPARISON_DATA[code as keyof typeof COMPARISON_DATA].strategicPriorities.map((priority, idx) => (
                            <li key={idx}>{priority}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
