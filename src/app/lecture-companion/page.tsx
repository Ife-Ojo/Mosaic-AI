'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, Upload, FileText, Sparkles, Database, 
  Copy, Download, Check, RefreshCw, BookOpen, Layers, 
  ExternalLink, ChevronRight, Volume2, Globe, Clock, ArrowRight,
  Mic, MicOff, AlertCircle, FileCheck, CheckCircle2, Info, X
  HelpCircle, ArrowDownToLine, X
} from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MosaicBadge } from '@/components/MosaicBadge';
import { NotionModal } from '@/components/NotionModal';
import { useToast } from '@/components/Toast';
import { PRESET_LECTURE_TRANSCRIPTS, SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode, StudyMaterial } from '@/types';
import { addOrUpdateMaterial, getPreferredTargetLanguage, simulateNotionSync } from '@/lib/storage';

export default function LectureCompanionPage() {
  const { success, error, info } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [sourceLang, setSourceLang] = useState<SupportedLanguageCode>('en');
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [transcriptText, setTranscriptText] = useState('');
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);

  // Workflow input method tabs: 'paste' | 'upload' | 'audio' | 'record'
  const [inputTab, setInputTab] = useState<'paste' | 'upload' | 'audio' | 'record'>('paste');

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);

  // Audio Transcription State (Groq Speech-to-Text)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Microphone Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Transformation & Generation State
  // Notion Page Import Bridge State
  const [showNotionImport, setShowNotionImport] = useState(false);
  const [notionImportUrl, setNotionImportUrl] = useState('');
  const [isImportingFromNotion, setIsImportingFromNotion] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedMaterial, setGeneratedMaterial] = useState<StudyMaterial | null>(null);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bilingual' | 'glossary' | 'takeaways' | 'questions' | 'original'>('bilingual');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);

  useEffect(() => {
    setTargetLang(getPreferredTargetLanguage());
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleImportFromNotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notionImportUrl.trim()) {
      error('Notion URL Required', 'Please enter a Notion page URL or 32-character ID.');
      return;
    }

    setIsImportingFromNotion(true);
    try {
      const res = await fetch('/api/notion/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIdOrUrl: notionImportUrl.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setTranscriptText(data.text);
        if (data.title && !title) setTitle(data.title);
        setShowNotionImport(false);
        success('Notion Page Imported', `Retrieved ${data.wordCount} words from "${data.title}".`);
      } else {
        error('Import Failed', data.error || 'Make sure the page is shared with your integration bot.');
      }
    } catch (err: any) {
      error('Import Error', err.message);
    } finally {
      setIsImportingFromNotion(false);
    }
  };

  const handleLoadPreset = (presetIndex: number) => {
    const preset = PRESET_LECTURE_TRANSCRIPTS[presetIndex];
    if (!preset) return;
    setTitle(preset.title);
    setSubject(preset.subject);
    setSourceLang(preset.defaultSource);
    setTargetLang(preset.defaultTarget);
    setTranscriptText(preset.text);
    setActivePresetIndex(presetIndex);
    setUploadedFileName(null);
    info('Sample Lecture Loaded', `${preset.title} (Pre-loaded demonstration content)`);
  };

  // Text Transcript File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed text transcript extensions
    const validExtensions = /\.(txt|srt|vtt|md|json)$/i;
    if (!file.name.match(validExtensions)) {
      error(
        'Unsupported File Format',
        'Please upload a .txt, .srt, .vtt, .md, or .json transcript file.'
      );
      return;
    }

    // Size limit: 10 MB for text files
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      error(
        'File Too Large',
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit for text transcripts.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let text = (event.target?.result as string) || '';
        
        // If JSON file, attempt to extract transcript string field if present
        if (file.name.endsWith('.json')) {
          try {
            const parsed = JSON.parse(text);
            if (typeof parsed.transcript === 'string') text = parsed.transcript;
            else if (typeof parsed.text === 'string') text = parsed.text;
            else if (typeof parsed.content === 'string') text = parsed.content;
          } catch {
            // Keep raw text if not structured transcript json
          }
        }

        setTranscriptText(text);
        setUploadedFileName(file.name);
        setUploadedFileSize(file.size);
        setActivePresetIndex(null);
        if (!title.trim()) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        success(
          'Transcript File Loaded',
          `Extracted ${text.split(/\s+/).filter(Boolean).length} words from ${file.name}. Review below.`
        );
      } catch (err: any) {
        error('File Read Failed', err.message || 'Could not parse the selected file.');
      }
    };
    reader.readAsText(file);
  };

  // Audio File Selection Handler
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedAudioTypes = /\.(mp3|mp4|mpeg|mpga|m4a|wav|webm|ogg|flac)$/i;
    if (!file.name.match(allowedAudioTypes)) {
      error('Unsupported Audio Format', 'Supported formats: .mp3, .m4a, .wav, .webm, .ogg, .flac');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      error('Audio File Too Large', 'Audio file must be under 25 MB for transcription.');
      return;
    }

    setAudioFile(file);
    setTranscriptionError(null);
  };

  // Execute Groq Speech-to-Text via Server API
  const handleTranscribeAudio = async (fileToTranscribe?: File | Blob) => {
    const targetFile = fileToTranscribe || audioFile;
    if (!targetFile) {
      error('No Audio File', 'Please select or record an audio file first.');
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      const formData = new FormData();
      if (targetFile instanceof File) {
        formData.append('file', targetFile);
      } else {
        // Blob from live microphone recording
        formData.append('file', targetFile, `recording-${Date.now()}.webm`);
      }
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', sourceLang);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.missingApiKey) {
          setTranscriptionError(
            'Groq Speech-to-Text requires GROQ_API_KEY in your server .env. You can still paste or upload transcripts directly without any API key.'
          );
        } else {
          setTranscriptionError(data.error || 'Failed to transcribe audio.');
        }
        return;
      }

      setTranscriptText(data.text);
      setUploadedFileName(targetFile instanceof File ? targetFile.name : 'Microphone Recording');
      setActivePresetIndex(null);
      if (!title.trim()) {
        setTitle(
          targetFile instanceof File
            ? targetFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
            : `Lecture Audio (${new Date().toLocaleDateString()})`
        );
      }
      success(
        'Speech Transcribed',
        `Successfully transcribed audio (${data.text.split(/\s+/).filter(Boolean).length} words). Review below.`
      );
    } catch (err: any) {
      setTranscriptionError(err.message || 'Network error connecting to speech-to-text service.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Microphone Recording Handlers
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        error('Not Supported', 'Microphone recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        if (audioBlob.size > 0) {
          await handleTranscribeAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      info('Recording Started', 'Speak clearly into your microphone.');
    } catch (err: any) {
      error('Microphone Access Denied', 'Please allow microphone access in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Shared Mosaic AI Engine Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptText.trim()) {
      error('Transcript Missing', 'Please paste a transcript, upload a file, or transcribe audio first.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Analyzing transcript speech & timestamps...');

    try {
      setTimeout(() => setLoadingStep('Extracting key academic theorems & domain concepts...'), 500);
      setTimeout(() => setLoadingStep(`Translating into ${targetLang.toUpperCase()} with cultural and technical context...`), 1100);

      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'lecture',
          inputText: transcriptText,
          title: title || 'University Lecture Notes',
          subject: subject || 'General Studies',
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate');
      }

      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: title || 'University Lecture Notes',
        subject: subject || 'General Studies',
        type: 'lecture',
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [subject, 'Lecture Notes', `${sourceLang.toUpperCase()}→${targetLang.toUpperCase()}`],
        notionSyncStatus: 'local_only',
        stats: {
          wordCount: data.wordCount || Math.round(transcriptText.length / 5),
          estimatedReadTimeMinutes: Math.max(3, Math.round((data.wordCount || 850) / 250)),
          masteryPercentage: 75,
        },
        content: {
          ...data.content,
          rawSourceText: transcriptText,
        },
      };

      addOrUpdateMaterial(newMaterial);
      setGeneratedMaterial(newMaterial);
      success('Lecture Companion Ready', 'Bilingual notes and Notion blocks created.');
    } catch (err: any) {
      error('Generation Failed', err.message || 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedMaterial) return;
    const lines = [
      `# ${generatedMaterial.title}`,
      `**Subject:** ${generatedMaterial.subject} | **Source:** ${sourceLang.toUpperCase()} | **Target:** ${targetLang.toUpperCase()}`,
      '',
      `> 💡 **Bilingual Executive Summary (${targetLang.toUpperCase()})**`,
      `> ${generatedMaterial.content.translatedSummary || generatedMaterial.content.summary}`,
      '',
      '## 📌 Key Lecture Takeaways',
      ...(generatedMaterial.content.translatedTakeaways || []).map((t) => `- [x] ${t}`),
      '',
      '## 📖 Technical Terminology Glossary',
      ...(generatedMaterial.content.bilingualGlossary || []).map(
        (g) => `- **${g.term}** (${g.translation}): ${g.nativeExplanation || g.definition}`
      ),
      '',
      '## 🎙️ Bilingual Lecture Notes',
      ...(generatedMaterial.content.bilingualSections || []).map(
        (s) => `### ${s.heading} (${s.timestamp || ''})\n**Original:** ${s.originalText}\n\n**${targetLang.toUpperCase()}:** ${s.translatedText}\n`
      ),
      '',
      '## 🧠 Revision Questions & Active Recall',
      ...(generatedMaterial.content.revisionQuestions || []).map(
        (q) => `- **Q:** ${q.question} *(${q.questionTranslation || ''})*\n  - **A:** ${q.answer} *[${targetLang.toUpperCase()}]: ${q.answerTranslation || ''}*`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    success('Markdown Copied', 'Paste into Notion or your markdown notes editor.');
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!generatedMaterial) return;
    const blob = new Blob([JSON.stringify(generatedMaterial, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedMaterial.title.toLowerCase().replace(/\s+/g, '-')}-mosaic.json`;
    a.click();
    URL.revokeObjectURL(url);
    info('Package Downloaded', 'Exported JSON study material archive.');
  };

  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
  const sourceLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);
  const wordCount = transcriptText ? transcriptText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <Headphones className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Lecture Intelligence & Transcript Workflow
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lecture Companion
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Ingest transcripts from Notion AI Meeting Notes, recordings, or text files and prepare bilingual structured notes, technical glossaries, and Notion blocks.
          </p>
        </div>

        {/* Quick Sample Presets (Clearly Labelled) */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span>Labelled Demonstration Samples:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { idx: 0, label: '⚛️ Sample: Quantum', name: 'Quantum Mechanics' },
              { idx: 1, label: '🧠 Sample: ML', name: 'Machine Learning' },
              { idx: 2, label: '🏰 Sample: History', name: 'European History' },
            ].map((preset) => (
              <button
                key={preset.idx}
                type="button"
                onClick={() => handleLoadPreset(preset.idx)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  activePresetIndex === preset.idx
                    ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-300 hover:text-white'
                }`}
                title={`Load sample: ${preset.name}`}
              >
                {preset.label}
              </button>
            ))}
        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Try a sample:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleLoadPreset(0)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              ⚛️ Quantum
            </button>
            <button
              onClick={() => handleLoadPreset(1)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              🧠 Machine Learning
            </button>
            <button
              onClick={() => handleLoadPreset(2)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              🏰 History
            </button>
            <button
              onClick={() => handleLoadPreset(3)}
              className="px-2.5 py-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 text-purple-200 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
              title="Load transcript captured via Notion AI Meeting Notes"
            >
              <span>⚡ Notion AI Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Workflow Panel (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
            
            {/* Title & Word Count Header */}
            <h2 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Lecture Content & Transcript
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {wordCount > 0 ? `${wordCount} words (${transcriptText.length} chars)` : 'No content'}
              </span>
            </h2>

            {/* Lecture / Course Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Lecture / Topic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems 101"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Neuroscience">Neuroscience</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="Bioengineering">Bioengineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>
            </div>

            {/* Language Selectors (Source & Target) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <LanguageSelector
                label="Lecture Language (Source)"
                selectedCode={sourceLang}
                onChange={setSourceLang}
              />
              <LanguageSelector
                label="Study Language (Target)"
                selectedCode={targetLang}
                onChange={setTargetLang}
              />
            </div>

            {/* Input Method Selector Tabs */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Ingestion Method
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setInputTab('paste')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    inputTab === 'paste'
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Copy className="w-3 h-3" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('upload')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    inputTab === 'upload'
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('audio')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    inputTab === 'audio'
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('record')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    inputTab === 'record'
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>Record</span>
                </button>
              </div>
            </div>

            {/* Method 1: Paste Transcript Workflow */}
            {inputTab === 'paste' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Paste from Notion AI Meeting Notes, Otter, or transcription tools
                  </span>
                  {transcriptText && (
                    <button
                      type="button"
                      onClick={() => {
                        setTranscriptText('');
                        setActivePresetIndex(null);
                        setUploadedFileName(null);
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      Clear text
                    </button>
                  )}
                </div>
                <textarea
                  rows={9}
                  placeholder="Paste your lecture transcript here... (e.g. copied from Notion AI Meeting Notes, Zoom transcript, or lecture recording)"
                  value={transcriptText}
                  onChange={(e) => {
                    setTranscriptText(e.target.value);
                    setActivePresetIndex(null);
                  }}
                  className="w-full p-3 bg-slate-950/80 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-500">
                  💡 Tip: The paste-transcript workflow works directly without needing any audio API key or server credentials.
                </p>
              </div>
            )}

            {/* Method 2: Upload Transcript File Workflow */}
            {inputTab === 'upload' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-750 hover:border-purple-500/60 rounded-xl p-5 text-center transition-colors bg-slate-950/40">
                  <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white mb-0.5">
                    Upload Lecture Transcript File
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Supports <span className="font-mono text-purple-300">.txt</span>, <span className="font-mono text-purple-300">.srt</span>, <span className="font-mono text-purple-300">.vtt</span>, <span className="font-mono text-purple-300">.md</span>, <span className="font-mono text-purple-300">.json</span> (Max 10 MB)
                  </p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer transition-colors shadow-sm">
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept=".txt,.srt,.vtt,.md,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadedFileName && (
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between text-xs text-purple-200">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="truncate font-medium">{uploadedFileName}</span>
                      {uploadedFileSize && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({(uploadedFileSize / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Extracted
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Method 3: Optional Audio Transcription (Groq Whisper) */}
            {inputTab === 'audio' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                      Groq Speech-to-Text (Whisper API)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Server API
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Transcribe audio recordings using Groq's official Whisper engine (<code className="text-purple-300">whisper-large-v3-turbo</code>). API key is kept secure on the server.
                  </p>

                  <div className="pt-2">
                    <input
                      type="file"
                      accept="audio/*,.mp3,.m4a,.wav,.webm,.ogg,.flac"
                      onChange={handleAudioFileSelect}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-900/60 file:text-purple-200 hover:file:bg-purple-800 cursor-pointer"
                    />
                  </div>

                  {audioFile && (
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
                      <span className="truncate max-w-[200px]">{audioFile.name}</span>
                      <button
                        type="button"
                        disabled={isTranscribing}
                        onClick={() => handleTranscribeAudio()}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {isTranscribing ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Transcribing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Transcribe Audio</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {transcriptionError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-[11px] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{transcriptionError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Method 4: Optional Microphone Recording */}
            {inputTab === 'record' && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-slate-900 border border-slate-750">
                  {isRecording ? (
                    <div className="w-4 h-4 rounded bg-rose-500 animate-pulse" />
                  ) : (
                    <Mic className="w-5 h-5 text-purple-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white">
                    {isRecording ? 'Recording Lecture Audio...' : 'Record Lecture Clip'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isRecording ? (
                      <span className="font-mono text-rose-400 font-semibold">{formatTimer(recordingSeconds)}</span>
                    ) : (
                      'Capture professor speech or your spoken summary from your microphone.'
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isTranscribing}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop & Transcribe</span>
                    </button>
                  )}
                </div>

                {isTranscribing && (
                  <div className="text-xs text-purple-300 flex items-center justify-center gap-1.5 pt-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Processing speech with Groq Whisper API...</span>
                  </div>
                )}

                {transcriptionError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-[11px] text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{transcriptionError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Transcript Preview & Review Area (Always Visible Before Processing) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Transcript Review Before Processing</span>
                </label>
                {activePresetIndex !== null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300">
                    Sample Content
                  </span>
                )}
            {/* Transcript Input Area Header with Notion Bridge */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-medium text-slate-400">
                  Lecture Transcript / Meeting Notes
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNotionImport(!showNotionImport)}
                    className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <ArrowDownToLine className="w-3 h-3" />
                    <span>Import from Notion</span>
                  </button>
                  <label className="cursor-pointer text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload .txt/.srt</span>
                    <input
                      type="file"
                      accept=".txt,.srt,.vtt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Collapsible Notion Import Card */}
              {showNotionImport && (
                <div className="mb-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-2 animate-in fade-in">
                  <div className="font-semibold text-purple-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-purple-400" />
                      Import Meeting Transcript from Notion Page
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNotionImport(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste the URL or 32-character ID of a Notion page containing your meeting notes or recorded transcript. (Make sure the page is shared with your integration bot via &quot;Add connections&quot;).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://notion.so/workspace/Sprint-Notes-1234567890..."
                      value={notionImportUrl}
                      onChange={(e) => setNotionImportUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-750 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleImportFromNotion}
                      disabled={isImportingFromNotion}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isImportingFromNotion ? 'animate-spin' : ''}`} />
                      {isImportingFromNotion ? 'Importing...' : 'Fetch'}
                    </button>
                  </div>
                </div>
              )}

              <textarea
                rows={inputTab === 'paste' ? 5 : 8}
                placeholder="The transcript text will appear here for review before you submit it to the Mosaic AI engine..."
                rows={9}
                placeholder="Paste the recorded lecture transcript or Notion AI Meeting Notes export here..."
                value={transcriptText}
                onChange={(e) => {
                  setTranscriptText(e.target.value);
                  setActivePresetIndex(null);
                }}
                className="w-full p-3 bg-slate-950 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>You can edit or refine any words before sending to the engine.</span>
                <span>{wordCount} words</span>
              </div>
            </div>

            {/* Feature Options */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeGlossary}
                  onChange={(e) => setIncludeGlossary(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Generate Bilingual Academic Glossary (Terms & Context)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Extract Timestamped Sections for Notion toggles</span>
              </label>
            </div>

            {/* Generate Action Button */}
            <button
              type="submit"
              disabled={isLoading || !transcriptText.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Synthesizing Multilingual Notes...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process Transcript in Mosaic AI Engine</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Output / Study Pack (7 cols) */}
        <div className="lg:col-span-7">
          {generatedMaterial ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Output Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MosaicBadge variant="purple" size="sm">
                      {generatedMaterial.subject}
                    </MosaicBadge>
                    <MosaicBadge variant="emerald" size="sm">
                      {sourceLangObj?.flag} {sourceLang.toUpperCase()} → {targetLangObj?.flag} {targetLang.toUpperCase()}
                    </MosaicBadge>
                    <span className="text-[11px] text-slate-500">
                      {generatedMaterial.stats?.estimatedReadTimeMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {generatedMaterial.title}
                  </h2>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNotionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>Export to Notion</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                    title="Download JSON Archive"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                {[
                  { id: 'bilingual', label: 'Bilingual Notes', icon: BookOpen },
                  { id: 'takeaways', label: 'Key Takeaways', icon: Sparkles },
                  { id: 'glossary', label: 'Concept Glossary', icon: Layers },
                  { id: 'questions', label: 'Revision Questions', icon: HelpCircle },
                  { id: 'original', label: 'Raw Transcript', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                        isActive
                          ? 'border-purple-500 text-purple-300'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Bilingual Notes */}
              {activeTab === 'bilingual' && (
                <div className="space-y-5">
                  {/* Executive Summary Callout */}
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                      <span>✨</span>
                      <span>Executive Synthesis ({targetLang.toUpperCase()})</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {generatedMaterial.content.translatedSummary || generatedMaterial.content.summary}
                    </p>
                  </div>

                  {/* Section Walkthrough */}
                  <div className="space-y-4">
                    {(generatedMaterial.content.bilingualSections || []).map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sec.heading}</span>
                            {sec.headingTranslation && (
                              <span className="text-xs text-purple-300">({sec.headingTranslation})</span>
                            )}
                          </div>
                          {sec.timestamp && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Clock className="w-3 h-3" />
                              {sec.timestamp}
                            </span>
                          )}
                        </div>

                        {/* Dual Column Transcript Excerpt */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              ORIGINAL ({sourceLang.toUpperCase()})
                            </span>
                            <p className="leading-relaxed">{sec.originalText}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/40 text-purple-100">
                            <span className="text-[10px] font-bold text-purple-400 block mb-1">
                              TRANSLATION ({targetLang.toUpperCase()})
                            </span>
                            <p className="leading-relaxed">{sec.translatedText}</p>
                          </div>
                        </div>

                        {sec.insightNotes && (
                          <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2.5 flex items-center gap-2">
                            <span className="shrink-0">💡</span>
                            <span>{sec.insightNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Key Takeaways */}
              {activeTab === 'takeaways' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                      Core Academic Insights ({targetLang.toUpperCase()})
                    </h3>
                    <div className="space-y-2.5">
                      {(generatedMaterial.content.translatedTakeaways || generatedMaterial.content.keyTakeaways || []).map((t, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-200">
                          <div className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Glossary */}
              {activeTab === 'glossary' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Specialized terminology explained with domain precision in {targetLangObj?.name}.
                  </p>

                  <div className="space-y-3">
                    {(generatedMaterial.content.bilingualGlossary || []).map((g, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{g.term}</span>
                            <span className="text-slate-500">→</span>
                            <span className="font-bold text-purple-300 text-sm">{g.translation}</span>
                          </div>
                          {g.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {g.category}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                          <div className="p-2.5 rounded bg-slate-900/70 border border-slate-850">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">ENGLISH DEFINITION</span>
                            <p>{g.definition}</p>
                          </div>
                          <div className="p-2.5 rounded bg-purple-950/20 border border-purple-900/30 text-purple-200">
                            <span className="text-[10px] font-bold text-purple-400 block mb-1">NATIVE CONTEXT ({targetLang.toUpperCase()})</span>
                            <p>{g.nativeExplanation || g.definition}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Revision Questions */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Active Recall &amp; Revision Questions ({targetLang.toUpperCase()})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Practice testing your retention with bilingual questions derived from the lecture.
                    </p>

                    <div className="space-y-3 pt-1">
                      {(generatedMaterial.content.revisionQuestions || []).map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <div className="font-bold text-white flex items-start gap-2">
                            <span className="text-purple-400 font-mono">Q{idx + 1}:</span>
                            <span>{q.question}</span>
                          </div>
                          {q.questionTranslation && (
                            <div className="text-slate-400 italic text-[11px] pl-6">
                              [{targetLang.toUpperCase()}]: {q.questionTranslation}
                            </div>
                          )}
                          <div className="pl-6 pt-2 border-t border-slate-800/80 text-purple-200">
                            <strong className="text-emerald-400 font-semibold block text-[11px] mb-0.5">EXPLANATION &amp; ANSWER:</strong>
                            <p className="text-slate-300 leading-relaxed">{q.answer}</p>
                            {q.answerTranslation && (
                              <p className="text-purple-300/90 text-[11px] mt-1 italic">
                                [{targetLang.toUpperCase()}]: {q.answerTranslation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Original Transcript */}
              {activeTab === 'original' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {generatedMaterial.content.rawSourceText || transcriptText}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[420px] rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-purple-400 flex items-center justify-center mb-4">
                <Headphones className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                No Lecture Processed Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Paste your lecture transcript on the left, upload a transcript file, or select one of the clearly labelled sample presets above.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadPreset(0)}
                  className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <span>Load Quantum Mechanics Sample</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notion Page Modal */}
      <NotionModal
        material={generatedMaterial}
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
        onSynced={(updated) => {
          setGeneratedMaterial(updated);
        }}
      />
    </div>
  );
}
