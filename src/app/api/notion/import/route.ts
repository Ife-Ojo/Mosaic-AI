import { NextRequest, NextResponse } from 'next/server';
import { fetchNotionPageContent } from '@/lib/notion';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageIdOrUrl, apiKey } = body;

    if (!pageIdOrUrl || typeof pageIdOrUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid Notion Page URL or Page ID is required.' },
        { status: 400 }
      );
    }

    const token = apiKey || process.env.NOTION_API_KEY;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Notion API key is not configured. Please set NOTION_API_KEY in .env.local or enter it in Settings to import from Notion pages.',
        },
        { status: 400 }
      );
    }

    const result = await fetchNotionPageContent(pageIdOrUrl, token);

    return NextResponse.json({
      success: true,
      title: result.title,
      text: result.text,
      wordCount: result.wordCount,
      pageUrl: result.pageUrl,
      message: `Successfully imported "${result.title}" (${result.wordCount} words) from Notion.`,
    });
  } catch (err: any) {
    console.error('Notion Page Import Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch page from Notion. Make sure the page is shared with your integration bot.',
      },
      { status: 500 }
    );
  }
}
