import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// GET /api/v1/foreign-policy/countries
router.get('/countries', (req: Request, res: Response) => {
  const countries = [
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

  res.json({ success: true, data: countries });
});

// GET /api/v1/foreign-policy/:code
router.get('/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const entries = [
    {
      id: '1',
      title: 'Country Policy Entry Title',
      date: '2023-01-15',
      type: 'BILATERAL',
      summary: 'Summary of the policy entry and its significance...',
    },
    {
      id: '2',
      title: 'Another Policy Development',
      date: '2022-06-20',
      type: 'MULTILATERAL',
      summary: 'Details of multilateral engagement...',
    },
  ];

  res.json({ success: true, data: entries });
});

// GET /api/v1/foreign-policy/compare
router.get('/compare', (req: Request, res: Response) => {
  const comparisonData = {
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
  };

  res.json({ success: true, data: comparisonData });
});

export default router;
