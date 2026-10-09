import { GoogleGenAI } from '@google/genai';
import { StudyRequest, StudyResult, StudyAction } from '@/types';

// Map language codes to clear full names
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese (Simplified)',
  fr: 'French',
  ar: 'Arabic',
  de: 'German',
  hi: 'Hindi',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  it: 'Italian',
  ru: 'Russian',
};

export function resolveLanguageName(codeOrName: string): string {
  if (!codeOrName) return 'English';
  const lower = codeOrName.toLowerCase().trim();
  return LANGUAGE_NAMES[lower] || codeOrName;
}

/**
 * Validates a StudyRequest
 */
export function validateStudyRequest(req: any): { valid: boolean; error?: string } {
  if (!req || typeof req !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  if (typeof req.text !== 'string' || req.text.trim().length === 0) {
    return { valid: false, error: 'Text field is required and cannot be empty' };
  }

  if (req.text.length > 50000) {
    return { valid: false, error: 'Text exceeds maximum length limit of 50,000 characters' };
  }

  const validActions: StudyAction[] = [
    'translate',
    'summarize',
    'study-notes',
    'simplify',
    'questions',
    'visual-outline',
  ];

  if (!req.action || !validActions.includes(req.action)) {
    return {
      valid: false,
      error: `Action must be one of: ${validActions.join(', ')}`,
    };
  }

  if (typeof req.targetLanguage !== 'string' || req.targetLanguage.trim().length === 0) {
    return { valid: false, error: 'Target language is required' };
  }

  return { valid: true };
}

/**
 * Builds the operation-specific system instruction and prompt for Gemini
 */
function buildPromptConfig(request: StudyRequest) {
  const { text, sourceLanguage, targetLanguage, action } = request;
  const targetLangName = resolveLanguageName(targetLanguage);
  const sourceLangName = resolveLanguageName(sourceLanguage || 'en');

  const baseConstraint = `
LANGUAGE REQUIREMENT:
All output must be written in ${targetLangName} (except preserved original code snippets, formulas, and standard technical terminology).

PRESERVATION RULES (STRICT):
1. Preserve all code blocks (fenced by \`\`\`), code snippets (\`code\`), and variable names exactly as-is.
2. Preserve all mathematical and scientific formulas (LaTeX $...$ or standard algebraic notations) verbatim.
3. Preserve key technical terms, constants, citations, and quantitative facts without distortion.
4. Always provide a clear, descriptive title on the very first line starting with "# ".
`.trim();

  switch (action) {
    case 'translate':
      return {
        systemInstruction: `You are Mosaic AI's technical and academic translation engine.
Your task is to accurately translate text from ${sourceLangName} into ${targetLangName}.
Preserve meaning, nuances, formulas, and technical terminology.
${baseConstraint}`,
        prompt: `Translate the following educational/technical content into ${targetLangName}. Ensure technical precision and fluency:

\`\`\`
${text}
\`\`\``,
      };

    case 'summarize':
      return {
        systemInstruction: `You are Mosaic AI's academic summarization specialist.
Create a concise, structured executive summary in ${targetLangName}.
Structure your output into:
- Executive Summary
- Core Key Points (bulleted)
- Critical Takeaways & Practical Implications
${baseConstraint}`,
        prompt: `Summarize the following text concisely and structurally in ${targetLangName}:

\`\`\`
${text}
\`\`\``,
      };

    case 'study-notes':
      return {
        systemInstruction: `You are Mosaic AI's study notes architect.
Generate comprehensive, well-structured revision study notes in ${targetLangName}.
Organize the notes with clear Markdown headings:
# [Document Title]
## 1. Core Framework & Fundamental Concepts
## 2. In-Depth Breakdown & Mechanisms
## 3. Practical Examples & Applications
## 4. Key Terminology & Formula Reference
${baseConstraint}`,
        prompt: `Transform the following academic material into organized revision study notes in ${targetLangName}:

\`\`\`
${text}
\`\`\``,
      };

    case 'simplify':
      return {
        systemInstruction: `You are Mosaic AI's Feynman Technique mentor.
Explain difficult or complex concepts in plain, accessible language in ${targetLangName} without compromising technical accuracy.
Include:
- An intuitive, relatable real-world analogy
- Step-by-step breakdown of how it works in simple terms
- Common misconceptions or stumbling blocks
- Why it matters
${baseConstraint}`,
        prompt: `Explain and simplify the following complex content in plain language using the Feynman technique in ${targetLangName}:

\`\`\`
${text}
\`\`\``,
      };

    case 'questions':
      return {
        systemInstruction: `You are Mosaic AI's active-recall exam assessment generator.
Create high-yield revision questions with detailed answer explanations in ${targetLangName}.
Include 3 distinct tiers:
1. Conceptual Understanding Questions (3 questions with complete answers)
2. Applied Problem / Scenario Questions (2 questions with step-by-step answers)
3. Rapid-Fire Flashcard Recall (3 question/answer pairs)
Format each question clearly with:
### Question X: ...
**Answer:** ...
${baseConstraint}`,
        prompt: `Generate a structured set of revision questions with comprehensive answers in ${targetLangName} based on:

\`\`\`
${text}
\`\`\``,
      };

    case 'visual-outline':
      return {
        systemInstruction: `You are Mosaic AI's visual concept map & outline architect.
Produce a hierarchical outline in ${targetLangName} suitable for rendering as a mind map or visual concept tree.
Structure:
1. A hierarchical Markdown outline using nested levels (# Root, ## Main Concepts, ### Sub-topics, - Components/Properties)
2. An ASCII/Text Mind Map tree diagram using symbols (├── └──) showing the parent-child relationships clearly
${baseConstraint}`,
        prompt: `Create a hierarchical visual outline and mind-map structure in ${targetLangName} for:

\`\`\`
${text}
\`\`\``,
      };
  }
}

/**
 * Extracts a clean title from markdown output, or falls back to action default
 */
function extractTitle(content: string, action: StudyAction, targetLangName: string): { title: string; cleanContent: string } {
  const lines = content.trim().split('\n');
  const firstLine = lines[0]?.trim() || '';

  if (firstLine.startsWith('# ')) {
    const rawTitle = firstLine.replace(/^#\s+/, '').trim();
    // Return title and rest of content
    return {
      title: rawTitle,
      cleanContent: content,
    };
  }

  // Action-specific fallback titles
  const actionTitles: Record<StudyAction, string> = {
    translate: `Translation (${targetLangName})`,
    summarize: `Summary (${targetLangName})`,
    'study-notes': `Study Notes (${targetLangName})`,
    simplify: `Simplified Explanation (${targetLangName})`,
    questions: `Revision Questions & Answers (${targetLangName})`,
    'visual-outline': `Concept Outline (${targetLangName})`,
  };

  return {
    title: actionTitles[action] || `Study Material (${targetLangName})`,
    cleanContent: `# ${actionTitles[action]}\n\n${content}`,
  };
}

/**
 * High-quality curated demo generator when GEMINI_API_KEY is unavailable
 * Explicitly marks result as demo content to ensure results are never fabricated.
 */
function generateDemoStudyResult(request: StudyRequest): StudyResult {
  const { text, targetLanguage, action } = request;
  const targetLangName = resolveLanguageName(targetLanguage);
  const excerpt = text.slice(0, 120).replace(/\n+/g, ' ').trim();
  const titleTopic = excerpt.length > 5 ? excerpt.slice(0, 45) + '...' : 'Academic Topic';

  const demoNotice = `> ⚠️ **Demo Mode Notice**: Running in demonstration mode because no server-side \`GEMINI_API_KEY\` is configured. Set \`GEMINI_API_KEY\` in your environment to enable live Gemini AI generation.\n\n`;

  let title = `[Demo] `;
  let bodyContent = '';

  switch (action) {
    case 'translate':
      title += `Translation: ${titleTopic} (${targetLangName})`;
      bodyContent = `${demoNotice}## Translated Text (${targetLangName})

${text.split('\n\n').map(p => `*[${targetLangName}]* ${p}`).join('\n\n')}

### Preserved Technical Elements
- All formulas ($E = mc^2$, $O(\\log N)$, etc.) and code blocks remain preserved in exact original syntax.
- Domain-specific academic terminology aligned with standard ${targetLangName} conventions.`;
      break;

    case 'summarize':
      title += `Executive Summary: ${titleTopic} (${targetLangName})`;
      bodyContent = `${demoNotice}### Executive Summary
This material presents fundamental concepts regarding **${titleTopic}**, establishing core definitions, operational constraints, and analytical implications for student revision.

### Core Key Points
- **Primary Mechanism**: The central process relies on sequential state transitions governed by foundational domain principles.
- **Critical Boundary Constraints**: Operational limits must be maintained to avoid failure modes or computational degradation.
- **Retention Takeaway**: Key formulas and definitions must be committed to memory for practical application and exams.

### Practical Implications
1. Use structured problem sets to verify edge-case comprehension.
2. Cross-reference with lecture notes in Notion for dual-language alignment.`;
      break;

    case 'study-notes':
      title += `Structured Study Notes: ${titleTopic} (${targetLangName})`;
      bodyContent = `${demoNotice}## 1. Core Framework & Definitions
- **Topic Scope**: ${titleTopic}
- **Primary Law**: Core constants and axioms dictate predictable outcomes within this system.
- **Target Language Synthesis**: Formulated for bilingual active recall in **${targetLangName}**.

## 2. In-Depth Breakdown
1. **Initial State & Prerequisites**: System inputs are verified against required preconditions.
2. **Execution & Transformation**: Core algorithms or physical laws manipulate inputs under boundary constraints.
3. **Verification & Output**: Observable invariants confirm steady-state completion.

## 3. Practical Examples & Applications
\`\`\`ts
// Exemplary implementation / pseudo-code
function verifySystemInvariant(input: number): boolean {
  // Boundary check preserving algorithmic invariants
  return input >= 0 && Number.isFinite(input);
}
\`\`\`

## 4. Key Terminology & Formula Glossary
| Technical Term | Meaning in ${targetLangName} | Context / Usage |
| :--- | :--- | :--- |
| **Invariant** | Invariante central | State that remains unchanged under transformation |
| **Complexity** | Complejidad algorítmica | Time & space resource growth rate |
| **Equilibrium** | Equilibrio del sistema | Balanced condition free of net divergent forces |`;
      break;

    case 'simplify':
      title += `Feynman Simplification: ${titleTopic} (${targetLangName})`;
      bodyContent = `${demoNotice}### 🎯 The Everyday Analogy
Imagine **${titleTopic}** like an airport luggage conveyor system:
Instead of passengers rummaging randomly through the airplane cargo hold, luggage is tagged with barcodes and placed onto a rotating belt. Everyone waits in their designated zone, and the system delivers bags sequentially with predictable timing.

### 💡 Plain-Language Breakdown
1. **What is it really doing?** It takes a potentially messy, random problem and channels it through an orderly set of rules so nothing gets lost.
2. **Why do we need it?** Without this mechanism, as scale increases, confusion grows exponentially.
3. **The Simple Rule**: Keep things organized from the moment they enter, so looking them up later takes seconds rather than hours.

### ⚠️ Common Pitfalls to Avoid
- Don't confuse the indexing mechanism with the underlying data storage itself.
- Remember that extreme throughput requires trade-offs between write speed and search speed.`;
      break;

    case 'questions':
      title += `Revision Questions & Answers: ${titleTopic} (${targetLangName})`;
      bodyContent = `${demoNotice}### Conceptual Understanding Questions

#### Question 1: What is the primary invariant governing ${titleTopic}?
**Answer:** The primary invariant ensures that systemic equilibrium and state consistency are maintained across all operational boundaries, preventing cascading data corruption.

#### Question 2: Why are edge cases and boundary conditions critical in this framework?
**Answer:** Boundary conditions establish the exact limits where the model remains mathematically and practically valid. Exceeding these limits without compensatory checks leads to systemic failure.

---

### Applied Problem / Scenario Questions

#### Question 3: Given a high-throughput scenario, how should trade-offs be balanced?
**Answer:** Prioritize write latency vs. read amplification depending on workload characteristics (e.g., append-only structures for writes, balanced trees for point reads).

---

### Rapid-Recall Flashcards
- **Q:** What is the primary time complexity for balanced tree lookups?
  - **A:** $O(\\log N)$ point lookup time.
- **Q:** How are uncommitted writes preserved in crash-resilient designs?
  - **A:** Sequential Write-Ahead Logs (WAL) or in-memory MemTables backed by disk logs.`;
      break;

    case 'visual-outline':
      title += `Concept Map Outline: ${titleTopic} (${targetLangName})`;
      bodyContent = `${demoNotice}### Hierarchical Mind Map Structure

\`\`\`
[${titleTopic}]
├── 1. Foundations & Axioms
│   ├── 1.1 Core Definitions
│   └── 1.2 Initial Preconditions
├── 2. Core Mechanisms
│   ├── 2.1 State Transitions
│   ├── 2.2 Invariant Checks ($O(\\log N)$)
│   └── 2.3 Boundary Damping
└── 3. Applications & Review
    ├── 3.1 Exam High-Yield Topics
    └── 3.2 Notion Vault Sync
\`\`\`

### Detailed Topic Breakdown
- **1. Foundations**: Fundamental terminology translated and retained for ${targetLangName} study.
- **2. Core Mechanisms**: The driving steps that transform raw input into verified knowledge.
- **3. Practical Synthesis**: Real-world evaluation, exam review questions, and Notion archival.`;
      break;
  }

  return {
    title,
    content: bodyContent,
    targetLanguage,
    isDemo: true,
    demoNotice: 'Demo Mode: No GEMINI_API_KEY configured on server. Displaying structured sample content.',
    action,
    model: 'demo-curated-sample',
  };
}

/**
 * Main AI Engine function: processes a StudyRequest and returns a StudyResult.
 * Uses official @google/genai SDK with GEMINI_API_KEY from server environment variables.
 * Falls back to clearly-labelled demo mode if GEMINI_API_KEY is not configured.
 */
export async function executeStudyAction(request: StudyRequest): Promise<StudyResult> {
  const validation = validateStudyRequest(request);
  if (!validation.valid) {
    throw new Error(`Validation Error: ${validation.error}`);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Check if API key is present
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    // Return sample/demo mode clearly labeled as demo content
    return generateDemoStudyResult(request);
  }

  // Live Gemini generation using official @google/genai SDK
  const targetLangName = resolveLanguageName(request.targetLanguage);
  const { systemInstruction, prompt } = buildPromptConfig(request);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3, // low temperature for high precision and terminology preservation
      },
    });

    const rawText = response.text || '';
    if (!rawText.trim()) {
      throw new Error('Received empty response from Gemini model');
    }

    const { title, cleanContent } = extractTitle(rawText, request.action, targetLangName);

    return {
      title,
      content: cleanContent,
      targetLanguage: request.targetLanguage,
      isDemo: false,
      action: request.action,
      model: modelName,
    };
  } catch (error: any) {
    console.error(`Gemini AI execution failed for action "${request.action}":`, error);
    // If live API call fails due to invalid key, quota, or network, provide clear error message
    throw new Error(`Gemini Engine Error: ${error?.message || 'Failed to generate study content'}`);
  }
}
