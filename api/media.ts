export default async function handler(req: any, res: any) {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    const mediaType = (req.query.type as string) || 'photos'; // 'photos' | 'videos'
    const section = (req.query.section as string) || 'curated'; // 'curated' | 'popular' | 'trending' | 'discover' | 'search'
    const query = (req.query.query as string)?.trim() || '';
    const page = parseInt(req.query.page as string) || 1;
    const perPage = Math.min(parseInt(req.query.per_page as string) || 24, 80);
    const orientation = req.query.orientation as string;
    const size = req.query.size as string;
    const color = req.query.color as string;

    if (!apiKey) {
      return res.status(200).json({
        warning: 'PEXELS_API_KEY is not set. Showing curated preview data.',
        page: 1,
        per_page: perPage,
        total_results: 0,
        photos: [],
        videos: [],
        hasApiKey: false,
      });
    }

    let pexelsUrl = '';
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    if (orientation && orientation !== 'all') {
      params.append('orientation', orientation);
    }
    if (size && size !== 'all') {
      params.append('size', size);
    }

    if (mediaType === 'videos') {
      if (query) {
        pexelsUrl = `https://api.pexels.com/videos/search?${params.toString()}&query=${encodeURIComponent(query)}`;
      } else if (section === 'popular' || section === 'trending') {
        pexelsUrl = `https://api.pexels.com/videos/popular?${params.toString()}`;
      } else {
        // Curated / discover default queries for videos
        const defaultQuery = section === 'discover' ? 'cinematic nature 4k' : 'abstract background 4k';
        pexelsUrl = `https://api.pexels.com/videos/search?${params.toString()}&query=${encodeURIComponent(defaultQuery)}`;
      }
    } else {
      // Photos
      if (color && color !== 'all') {
        params.append('color', color.replace('#', ''));
      }

      if (query) {
        pexelsUrl = `https://api.pexels.com/v1/search?${params.toString()}&query=${encodeURIComponent(query)}`;
      } else if (section === 'curated') {
        pexelsUrl = `https://api.pexels.com/v1/curated?${params.toString()}`;
      } else if (section === 'popular') {
        pexelsUrl = `https://api.pexels.com/v1/search?${params.toString()}&query=${encodeURIComponent('popular wallpapers portrait landscape')}`;
      } else if (section === 'trending') {
        pexelsUrl = `https://api.pexels.com/v1/search?${params.toString()}&query=${encodeURIComponent('trending architecture minimal aesthetic')}`;
      } else {
        // Discover
        pexelsUrl = `https://api.pexels.com/v1/curated?${params.toString()}`;
      }
    }

    const response = await fetch(pexelsUrl, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Pexels API Error (${response.status}): ${response.statusText}`,
        details: errText,
        hasApiKey: true,
      });
    }

    const data = await response.json();
    res.status(200).json({
      ...data,
      hasApiKey: true,
      mediaType,
      section,
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch media' });
  }
}
