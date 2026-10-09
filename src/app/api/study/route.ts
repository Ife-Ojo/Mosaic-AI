import { NextRequest, NextResponse } from 'next/server';
import { executeStudyAction, validateStudyRequest } from '@/lib/ai/engine';
import { StudyRequest } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/study
 * Processes a StudyRequest using the Mosaic AI engine.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request payload',
        },
        { status: 400 }
      );
    }

    // Input validation
    const validation = validateStudyRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Invalid study request',
        },
        { status: 400 }
      );
    }

    const studyRequest: StudyRequest = {
      text: body.text.trim(),
      sourceLanguage: body.sourceLanguage || 'en',
      targetLanguage: body.targetLanguage || 'es',
      action: body.action,
    };

    // Execute through shared AI engine
    const result = await executeStudyAction(studyRequest);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('API /api/study error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal server error while executing study action',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/study
 * Returns engine diagnostics and configuration status (without exposing secret keys).
 */
export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  return NextResponse.json({
    status: 'online',
    engine: 'Mosaic AI Engine',
    provider: '@google/genai',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    apiKeyConfigured: hasKey,
    mode: hasKey ? 'live' : 'demo',
    supportedActions: [
      'translate',
      'summarize',
      'study-notes',
      'simplify',
      'questions',
      'visual-outline',
    ],
  });
}
