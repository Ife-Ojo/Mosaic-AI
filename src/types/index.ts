export type SupportedLanguageCode = 
  | 'en' | 'es' | 'zh' | 'fr' | 'ar' | 'de' | 'hi' | 'pt' | 'ja' | 'ko' | 'it' | 'ru';

export interface Language {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export type MaterialType = 
  | 'lecture' 
  | 'study_notes' 
  | 'flashcards' 
  | 'visual_outline' 
  | 'assignment_plan';

export type NotionSyncStatus = 'synced' | 'pending' | 'failed' | 'local_only';

export interface GlossaryTerm {
  term: string;
  translation: string;
  definition: string;
  nativeExplanation: string;
  category?: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  questionTranslation: string;
  answer: string;
  answerTranslation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OutlineNode {
  id: string;
  label: string;
  translation: string;
  level: number;
  description: string;
  children?: OutlineNode[];
}

export interface MilestoneTask {
  id: string;
  text: string;
  done: boolean;
  estimatedHours: number;
  subtasks?: string[];
}

export interface AssignmentMilestone {
  phase: string;
  title: string;
  deadlineOffsetDays: number;
  tasks: MilestoneTask[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: MaterialType;
  sourceLanguage: SupportedLanguageCode;
  targetLanguage: SupportedLanguageCode;
  createdAt: string;
  lastModified: string;
  tags: string[];
  notionPageId?: string;
  notionSyncStatus: NotionSyncStatus;
  notionUrl?: string;
  stats?: {
    wordCount?: number;
    estimatedReadTimeMinutes?: number;
    masteryPercentage?: number;
  };
  content: {
    rawSourceText?: string;
    summary?: string;
    translatedSummary?: string;
    bilingualGlossary?: GlossaryTerm[];
    keyTakeaways?: string[];
    translatedTakeaways?: string[];
    bilingualSections?: Array<{
      id: string;
      timestamp?: string;
      heading: string;
      headingTranslation?: string;
      originalText: string;
      translatedText: string;
      insightNotes?: string;
    }>;
    flashcards?: FlashcardItem[];
    visualOutline?: OutlineNode[];
    simplifiedExplanation?: string;
    feynmanAnalogy?: string;
    assignmentBreakdown?: {
      plainSummary: string;
      translatedSummary: string;
      professorIntent: string;
      criticalRubricCriteria: Array<{ criterion: string; weight: string; howToAce: string }>;
      commonPitfalls: string[];
      milestones: AssignmentMilestone[];
    };
  };
}

export interface NotionWorkspaceInfo {
  connected: boolean;
  workspaceName: string;
  workspaceIcon: string;
  targetDatabaseName: string;
  lastSyncTimestamp: string;
  syncedItemsCount: number;
  apiKeyConfigured: boolean;
}

export * from './exchange';

