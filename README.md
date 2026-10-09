# Mosaic AI — Multilingual Learning Companion for Notion

> **"Different Languages and Perspectives Coming Together"**  
> Mosaic is a multilingual AI learning companion designed to enhance your existing Notion academic workspace rather than replace it.

---

## 🌟 Overview & Product Philosophy

- **Notion Remains Home:** Notion is the ultimate workspace for organization, databases, page linking, and long-term storage. Mosaic does not build redundant calendars, meeting recorders, or messaging tools.
- **Multilingual Intelligence:** Mosaic empowers students who study in a secondary or non-native language by bridging academic content—lectures, research papers, and complex syllabi—into their primary language.
- **Cognitive Transformations:** Transforms dense lecture speech and assignment prompts into bilingual summaries, technical glossaries, Feynman analogies, interactive flashcards, and step-by-step Notion-ready checklists.

---

## 🚀 Key Modules & Pages

### 1. Dashboard (`/`)
- **Welcome & Study Streak:** Tracks consecutive active study days and student mastery levels.
- **Notion Sync Health Bar:** Displays connected workspace (`Aiden's Academic Notion Vault`), synced page count, and one-click workspace synchronization.
- **Quick Action Launchers:** Instant shortcuts to process transcripts, transform study concepts, or simplify assignment briefs.
- **Recent Materials Feed:** Quick-access cards with language indicators, read times, and Notion preview triggers.
- **Language & Study Preferences:** Configure default target language across 12 supported languages (Spanish, Mandarin, French, Arabic, German, Hindi, Portuguese, Japanese, Korean, Italian, Russian, English) and display mode (Dual-Language, Native-First with English Gloss, Feynman Plain-Language).

### 2. Lecture Companion (`/lecture-companion`)
- **Lecture Input & Transcript Workflow:**
  1. **Paste Transcript:** Large text area for pasting meeting notes, Notion AI lecture summaries, or transcripts from any transcription tool.
  2. **Upload Transcript:** Secure file upload supporting `.txt`, `.srt`, `.vtt`, `.md`, and `.json` files up to 10 MB with automated validation and full text preview.
  3. **Audio Transcription (Groq Whisper):** Optional server-side speech-to-text integration powered by Groq's official Whisper API (`whisper-large-v3-turbo`) using `GROQ_API_KEY` stored exclusively on the server.
  4. **Live Microphone Recording:** In-browser audio recording directly into the transcription engine with visual live timer and recording controls.
- **Review Before Processing:** Full editable transcript review pane with word count and character count prior to AI synthesis.
- **Language Selection:** Customizable source lecture language and target study language (12 supported languages).
- **Domain-Specific Glossaries:** Technical terms paired with native translations, formal definitions, and contextual native explanations.
- **Export & Sync:** One-click export to Notion page blocks, clipboard markdown copy, and JSON package download.

### 3. AI Study Studio (`/study-studio`)
- **Feynman Technique Simplifier:** Deconstructs dense academic theory into intuitive real-world metaphors in your native language.
- **Interactive Bilingual Flashcards:** Flip cards with prompt and answer in both English and your native language. Includes self-grading mastery buttons (*"Mark as Mastered"* vs *"Review Again"*) and progress indicators.
- **Visual Concept Outline:** Hierarchical tree breakdown with parent/child concept relationships and bilingual node descriptions.

### 4. Assignment Simplifier (`/assignment-simplifier`)
- **Executive Plain-Language Briefing:** Translates complex project requirements into clear, student-friendly objectives.
- **Grading Rubric Decoder:** Extracts weighted evaluation criteria and provides *"How to Ace"* strategies so students never miss hidden rubric marks.
- **Actionable Milestone Checklist:** Breaks assignments into structured phases (*Discovery*, *Implementation*, *Verification*) with interactive task checkboxes, estimated hours, and a real-time progress bar that persists in state.
- **Notion Checklist Sync:** Directly generates Notion to-do block structures.

### 5. My Learning (`/my-learning`)
- **Unified Academic Library:** Search and filter your generated study materials by subject, material type, target language, or Notion sync status.
- **Notion Page Simulator:** Click *"Notion"* on any material to view an authentic Notion preview with breadcrumbs, database properties, callout blocks, toggle sections, and live deep-link / block copy controls.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS with a custom jewel-tone mosaic theme and tessellation background
- **Icons:** Lucide React
- **State & Persistence:** Client persistence layer (`localStorage`) with SSR hydration safety and server-side API routes (`/api/transform`, `/api/notion/sync`).
- **Security:** All API credentials (`NOTION_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`) remain strictly on the server.

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 24 LTS recommended)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/Ife-Ojo/Mosaic-AI.git
cd Mosaic-AI
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```

### 5. Environment Configuration (Optional)
Mosaic works out-of-the-box with realistic presets and simulated Notion syncing. To connect live external services:
```env
# .env.local
NOTION_API_KEY=secret_your_notion_internal_integration_token
NOTION_DATABASE_ID=your_database_id
GEMINI_API_KEY=your_gemini_api_key
```
