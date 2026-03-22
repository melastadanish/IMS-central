import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// GET /api/v1/videos
router.get('/', (req: Request, res: Response) => {
  const videos = [
    {
      id: '1',
      slug: 'understanding-us-china-rivalry',
      title: 'Understanding the US-China Rivalry: A Structural Analysis',
      topic: 'Geopolitics',
      difficulty: 'INTERMEDIATE',
      duration: 3420,
      thumbnail: '🎥',
      description: 'A deep structural analysis of the US-China rivalry',
    },
    {
      id: '2',
      slug: 'pakistan-economy-structural-crisis',
      title: "Pakistan's Structural Economic Crisis",
      topic: 'Economics',
      difficulty: 'ADVANCED',
      duration: 4800,
      thumbnail: '📊',
      description: 'Analysis of Pakistan\'s economic challenges',
    },
    {
      id: '3',
      slug: 'maqasid-shariah-modern-governance',
      title: 'Maqasid al-Shariah: Principles for Modern Governance',
      topic: 'Religion',
      difficulty: 'BEGINNER',
      duration: 2760,
      thumbnail: '🕌',
      description: 'Islamic jurisprudential framework for governance',
    },
    {
      id: '4',
      slug: 'ai-governance-ethics-muslim-societies',
      title: 'AI Governance and Ethics',
      topic: 'Technology',
      difficulty: 'BEGINNER',
      duration: 2580,
      thumbnail: '🤖',
      description: 'AI governance and ethical frameworks',
    },
    {
      id: '5',
      slug: 'climate-change-muslim-world-vulnerability',
      title: 'Climate Change and the Muslim World',
      topic: 'Environment',
      difficulty: 'INTERMEDIATE',
      duration: 3060,
      thumbnail: '🌍',
      description: 'Climate vulnerability and adaptation strategies',
    },
  ];

  res.json({ success: true, data: videos });
});

// GET /api/v1/videos/:slug
router.get('/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const video = {
    slug,
    title: 'Video Title',
    topic: 'Topic Name',
    difficulty: 'INTERMEDIATE',
    duration: 3600,
    youtubeId: 'dQw4w9WgXcQ',
    description: 'Video description...',
    discussionBrief: 'Discussion points and preparation guide...',
  };

  res.json({ success: true, data: video });
});

// GET /api/v1/videos/:id/player-url
// Requires authentication
router.get('/:id/player-url', authenticate, (req: Request, res: Response) => {
  const { id } = req.params;
  const signedUrl = `https://example.bunnycdn.net/video/${id}?token=signed&expires=1234567890`;

  res.json({ success: true, data: { url: signedUrl } });
});

export default router;
