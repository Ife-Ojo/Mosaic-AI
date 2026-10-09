import { NextRequest, NextResponse } from 'next/server';
import { createNotionPage, generateNotionMarkdown } from '@/lib/notion';
import { StudyMaterial } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      material,
      materialId,
      title,
      subject,
      content,
      targetLanguage,
      sourceLanguage = 'en',
      type = 'lecture',
      parentType,
      parentId,
      apiKey,
      preferLive = false,
    } = body;

    // Construct full StudyMaterial object
    const studyMaterial: StudyMaterial = material || {
      id: materialId || `mat-${Date.now()}`,
      title: title || 'Mosaic Study Notes',
      subject: subject || 'General Studies',
      type: type || 'lecture',
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage: targetLanguage || 'es',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: [subject || 'General', 'Mosaic AI'],
      notionSyncStatus: 'pending',
      content: content || {},
    };

    const serverApiKey = apiKey || process.env.NOTION_API_KEY;
    const serverParentId = parentId || process.env.NOTION_DATABASE_ID || process.env.NOTION_PARENT_PAGE_ID;

    // If real credentials are provided or configured on server
    if (serverApiKey && serverParentId) {
      try {
        const result = await createNotionPage(studyMaterial, {
          apiKey: serverApiKey,
          parentId: serverParentId,
          parentType: parentType || (process.env.NOTION_DATABASE_ID ? 'database' : 'page'),
        });

        return NextResponse.json({
          success: true,
          mode: 'live',
          pageId: result.pageId,
          notionUrl: result.notionUrl,
          blocksCount: result.blocksCount,
          message: 'Page created successfully in live Notion workspace using the official Notion API.',
          timestamp: new Date().toISOString(),
        });
      } catch (notionErr: any) {
        console.error('Notion API Live Sync Error:', notionErr);
        return NextResponse.json(
          {
            success: false,
            mode: 'error',
            error: notionErr.message || 'Failed to create page in Notion.',
            fallbackMarkdown: generateNotionMarkdown(studyMaterial),
          },
          { status: 400 }
        );
      }
    }

    // If the user requested live sync but credentials are not configured
    if (preferLive) {
      return NextResponse.json(
        {
          success: false,
          mode: 'unconfigured',
          error:
            'Notion API credentials are not configured. Please set NOTION_API_KEY and NOTION_DATABASE_ID (or NOTION_PARENT_PAGE_ID) in your .env.local file or workspace Settings.',
          fallbackMarkdown: generateNotionMarkdown(studyMaterial),
        },
        { status: 422 }
      );
    }

    // Fallback simulated / preview mode (ready out of the box for hackathon presentation)
    const mockId = `page-${Math.random().toString(36).substring(2, 9)}`;
    const mockUrl = `https://notion.so/workspace/${encodeURIComponent(studyMaterial.title || 'Course-Note')}-${mockId}`;

    return NextResponse.json({
      success: true,
      mode: 'simulated',
      pageId: mockId,
      notionUrl: mockUrl,
      message:
        'Created Notion page in preview mode. To write to your live Notion workspace, configure NOTION_API_KEY and NOTION_DATABASE_ID in Settings or .env.local.',
      timestamp: new Date().toISOString(),
      fallbackMarkdown: generateNotionMarkdown(studyMaterial),
      metadata: {
        targetLanguage: studyMaterial.targetLanguage,
        syncedBlocks: [
          'Callout (Header & Languages)',
          'Callout (Bilingual Summary)',
          'Bulleted List (Key Takeaways)',
          'Toggle Blocks (Bilingual Notes)',
          'Table/List (Bilingual Glossary)',
          'Toggle Blocks (Revision Questions & Flashcards)',
          'To-do Items (Action Checklist)',
          'Toggle (Raw Ingested Transcript)',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync with Notion',
      },
      { status: 500 }
    );
  }
}
