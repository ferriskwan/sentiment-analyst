export default async function handler(req: any, res: any) {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'PEXELS_API_KEY is not configured in Vercel Environment Variables.' });
    }

    const response = await fetch('https://api.pexels.com/v1/search?query=coffee&per_page=5', {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch images' });
  }
}
