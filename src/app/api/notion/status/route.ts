import { NextRequest, NextResponse } from 'next/server';
import { testNotionConnection } from '@/lib/notion';

export async function GET() {
  try {
    const hasApiKey = Boolean(process.env.NOTION_API_KEY && process.env.NOTION_API_KEY.trim().length > 0);
    const hasDatabaseId = Boolean(process.env.NOTION_DATABASE_ID && process.env.NOTION_DATABASE_ID.trim().length > 0);
    const hasParentPageId = Boolean(process.env.NOTION_PARENT_PAGE_ID && process.env.NOTION_PARENT_PAGE_ID.trim().length > 0);

    if (!hasApiKey) {
      return NextResponse.json({
        configured: false,
        valid: false,
        mode: 'preview',
        hasDatabaseId,
        hasParentPageId,
        message: 'Notion API key is not configured in server environment (.env.local). Operating in preview simulation mode.',
      });
    }

    const testResult = await testNotionConnection();

    return NextResponse.json({
      configured: true,
      valid: testResult.valid,
      mode: testResult.valid ? 'live' : 'invalid_credentials',
      botName: testResult.botName,
      workspaceName: testResult.workspaceName,
      hasDatabaseId,
      hasParentPageId,
      accessibleDatabases: testResult.accessibleDatabases,
      accessiblePages: testResult.accessiblePages,
      message: testResult.message,
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      valid: false,
      error: err.message || 'Failed to check Notion connection status.',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    const tokenToTest = apiKey || process.env.NOTION_API_KEY;
    if (!tokenToTest) {
      return NextResponse.json({
        valid: false,
        message: 'No API key provided to test.',
      }, { status: 400 });
    }

    const testResult = await testNotionConnection(tokenToTest);

    return NextResponse.json({
      valid: testResult.valid,
      botName: testResult.botName,
      workspaceName: testResult.workspaceName,
      accessibleDatabases: testResult.accessibleDatabases,
      accessiblePages: testResult.accessiblePages,
      message: testResult.message,
    });
  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      error: err.message || 'Failed to test Notion connection.',
    }, { status: 500 });
  }
}
