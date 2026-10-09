import { NextRequest, NextResponse } from 'next/server';

// Official Groq API speech-to-text endpoint
// https://api.groq.com/openai/v1/audio/transcriptions
const GROQ_AUDIO_TRANSCRIPTIONS_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Allowed audio types for speech-to-text
const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/webm',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB (Groq file size limit)

export async function POST(req: NextRequest) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;

    const formData = await req.formData();
    const audioFile = formData.get('file') as File | null;
    const model = (formData.get('model') as string) || 'whisper-large-v3-turbo';
    const language = formData.get('language') as string | null;
    const prompt = formData.get('prompt') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided. Please attach an audio file or recording.' },
        { status: 400 }
      );
    }

    // Size validation
    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Audio file is too large (${(audioFile.size / (1024 * 1024)).toFixed(1)} MB). Maximum size is 25 MB.`,
        },
        { status: 400 }
      );
    }

    // Check if GROQ_API_KEY is configured on the server
    if (!groqApiKey || groqApiKey.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          missingApiKey: true,
          error:
            'GROQ_API_KEY is not configured on the server. To enable audio transcription, add GROQ_API_KEY to your server .env file or environment variables.',
        },
        { status: 503 }
      );
    }

    // Prepare forward FormData to official Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile, audioFile.name || 'audio.webm');
    groqFormData.append('model', model);
    groqFormData.append('response_format', 'verbose_json');

    if (language && language.trim().length > 0) {
      groqFormData.append('language', language.trim());
    }

    if (prompt && prompt.trim().length > 0) {
      groqFormData.append('prompt', prompt.trim());
    }

    const groqResponse = await fetch(GROQ_AUDIO_TRANSCRIPTIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey.trim()}`,
      },
      body: groqFormData,
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      let parsedError = errorText;
      try {
        const errObj = JSON.parse(errorText);
        parsedError = errObj.error?.message || errorText;
      } catch {
        // use raw error text
      }

      return NextResponse.json(
        {
          success: false,
          error: `Groq Speech-to-Text API returned error (${groqResponse.status}): ${parsedError}`,
        },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();

    return NextResponse.json({
      success: true,
      text: data.text || '',
      language: data.language || language || 'en',
      duration: data.duration || null,
      segments: data.segments || [],
      modelUsed: model,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An unexpected error occurred during audio transcription.',
      },
      { status: 500 }
    );
  }
}
