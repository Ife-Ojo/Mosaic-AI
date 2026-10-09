# Mosaic AI — Multilingual Learning Companion for Notion

> **"Different Languages and Perspectives Coming Together"**  
> Mosaic is an AI learning companion designed to enhance your existing Notion academic workspace rather than replace it. It bridges dense university lectures, research documents, and project briefs into your primary language and persists structured, active-recall study packs directly into Notion.

---

## 🌟 Overview & Product Philosophy

- **Notion Remains Home:** Notion is the student's primary workspace for long-term organization, page linking, and note hierarchy. Mosaic does not build redundant calendars, meeting recorders, or page editors.
- **Multilingual Academic Equity:** Mosaic empowers students studying in a non-native language by bridging complex English or foreign lecture speech into their primary language with technical precision.
- **Cognitive Transformations:** Transforms raw transcripts into bilingual executive summaries, technical concept glossaries, Feynman plain-language analogies, active recall flashcards, and step-by-step Notion-ready checklists.

---

## 📓 Official Notion API Integration

Mosaic integrates directly with the **Official Notion API** using the `@notionhq/client` SDK. When connected, Mosaic programmatically constructs rich, authentic Notion pages in your workspace.

### What Gets Saved to Notion:
1. **Document Metadata:** Title, Subject, Source Language, Target Language, and Creation Date.
2. **Bilingual Executive Summary:** A stylized Notion callout block (`💡`) providing an academic synthesis in the student's native language.
3. **Key Study Takeaways:** Bulleted list items highlighting core analytical principles and exam focus areas.
4. **Bilingual Structured Notes:** Nested toggle blocks pairing original spoken segments with native translations and instructor insights.
5. **Technical Concept Glossaries:** Domain-specific terms paired with formal definitions and contextual native explanations.
6. **Revision Questions & Active Recall:** Toggle blocks containing test questions with hidden expandable answers in both English and the native language.
7. **Actionable Milestones:** Native Notion to-do blocks (`[ ]`) for multi-phase assignment execution.
8. **Collapsible Source Transcript:** An archived toggle block preserving the original ingested transcript without cluttering the page.

---

## 🔐 Authentication, Permissions & Security

### Security First: Zero Client-Side Secret Leakage
- **Server-Side Exclusivity:** All Notion authentication tokens (`NOTION_API_KEY`) and API calls occur exclusively within server-side Next.js API routes (`/api/notion/sync`, `/api/notion/status`, `/api/notion/import`).
- **No Client Exposure:** Notion tokens are never bundled into client JavaScript or stored in public browser storage.

### Deployment Scope: Authorized Internal Integration
- For single-workspace hackathon demos and individual student deployments, Mosaic utilizes an authorized **Internal Integration Token** (`secret_...` or `ntn_...`).
- *Important Architectural Clarification:* This single-workspace deployment is intentionally scoped to an authorized internal integration. It is **not** presented as a multi-tenant public OAuth marketplace application. For multi-tenant production hosting, a public OAuth 2.0 authorization redirect flow with per-user token encryption in a database would be required.

---

## 🚀 Step-by-Step Notion Setup Guide

### Step 1: Create an Internal Integration
1. Log in to Notion and navigate to the [Notion Developers Integrations Portal](https://www.notion.so/profile/integrations).
2. Click **"+ New integration"**.
3. Name it **"Mosaic AI"**, select your target workspace, and confirm.
4. Under **Capabilities**, ensure the following are enabled:
   - **Read content**
   - **Update content**
   - **Insert content**
5. Copy your **Internal Integration Secret** (`secret_...` or `ntn_...`).

### Step 2: Share Your Target Page or Database (Crucial!)
By default, Notion integrations have **zero permissions** across your workspace until explicitly invited:
1. Open your desired target parent page (e.g. `Mosaic Study Vault`) or database in Notion.
2. Click the **"..."** menu in the top-right corner.
3. Scroll down and select **"Connect to"** (or **"Add connections"**).
4. Search for your integration name (**Mosaic AI**) and click to authorize it.

> ⚠️ **Common Issue:** If you omit this step, the Notion API will return an `object_not_found` (404/403) permission error.

### Step 3: Find Your Page or Database ID
In your browser address bar while viewing the target page:
```text
https://www.notion.so/my-workspace/Mosaic-Vault-32_character_hex_id
```
The 32-character string at the end of the URL is your `NOTION_DATABASE_ID` or `NOTION_PARENT_PAGE_ID`.

### Step 4: Configure Server Environment
Create or edit `.env.local`:
```env
NOTION_API_KEY=secret_your_notion_internal_integration_token
NOTION_DATABASE_ID=your_32_character_database_id
# Or if targeting a root page instead of a database:
# NOTION_PARENT_PAGE_ID=your_32_character_parent_page_id
```

---

## 🔍 Notion API vs. Notion MCP (Model Context Protocol) Investigation

Before designing workspace AI features, we inspected both the **official Notion REST API** documentation and the **official Notion Model Context Protocol (MCP)** specifications to distinguish their capabilities:

| Capability / Attribute | Official Notion REST API | Official Notion MCP Server |
| :--- | :--- | :--- |
| **Endpoint / Interface** | `https://api.notion.com/v1` (HTTP REST) | `https://mcp.notion.com/mcp` (Remote Stream / OAuth) |
| **Primary Use Case** | Direct application backend integration | LLM Agent Tool-Calling (Claude, Cursor, Goose) |
| **Page & Block Creation** | Full support (`pages.create`, `blocks.children.append`) | Supported via `create_page`, `update_page` tools |
| **Search & Retrieval** | `POST /v1/search`, `GET /v1/blocks/{id}/children` | `notion-search`, `get_page` tools |
| **Live Microphone Audio** | ❌ **NOT AVAILABLE** | ❌ **NOT AVAILABLE** |
| **Live Meeting Streaming** | ❌ **NOT AVAILABLE** | ❌ **NOT AVAILABLE** |
| **Real-time Calendar Daemon** | ❌ **NOT AVAILABLE** | ❌ **NOT AVAILABLE** |

### Verified Limitations & Non-Existent Endpoints
- **No Audio Drivers or Microphone Capture:** Neither the Notion REST API nor the Notion MCP server connects to audio hardware, records microphone input, or performs speech-to-text transcription.
- **No Meeting Interception:** Neither protocol hooks into live meeting streams (Zoom, Teams, Google Meet) or Notion's proprietary desktop meeting recorder.
- **No Background Calendar Scheduler:** Neither protocol acts as an autonomous background calendar listener.

### Optional MCP Integration
For developers using MCP-enabled agents (like Claude Desktop, Cursor, or Goose), Mosaic provides a reference `notion-mcp-config.json` configuration file pointing to `https://mcp.notion.com/mcp`. An MCP agent can utilize the `notion-search` and `get_page` tools to inspect transcripts and query existing study databases.

---

## 🎙️ Meeting & Transcript Workflow

Mosaic provides a verified three-pronged ingestion workflow:

1. **Paste from Notion AI Meeting Notes:**  
   Students who use Notion AI Meeting Notes to transcribe university lectures or project meetings can paste the exported notes directly into Mosaic. Mosaic includes a built-in **"⚡ Notion AI Notes"** preset demonstrating this exact format.
2. **Import Directly from a Notion Page:**  
   Using Mosaic's verified `/api/notion/import` endpoint, students can enter a Notion page URL or ID. Mosaic fetches the page's child blocks via the official Notion API, parses headings, paragraphs, and quotes into a clean transcript, and populates the editor automatically.
3. **File Upload:**  
   Upload local `.txt`, `.srt`, `.vtt`, or `.md` files.

Once ingested, Mosaic translates and structures the content, generating a full multilingual study pack with active recall revision questions, and publishes the structured blocks back to the student's Notion workspace.

---

## 🛡️ Error Handling & Fallbacks (Zero-Lockin Guarantee)

Mosaic handles all integration edge cases gracefully:

- **Missing Credentials:** Clearly flags unconfigured integrations and operates in rich preview mode.
- **Invalid Tokens (401 Unauthorized):** Displays actionable diagnostics instructing the user to verify `NOTION_API_KEY`.
- **Missing Permissions (403 / 404 Object Not Found):** Informs the user that the integration bot has not been added to the target page via the **"Add connections"** menu.
- **1-Click Markdown Fallback:** If Notion is unconfigured or a network failure occurs, Mosaic generates copy-ready Markdown formatted to paste directly into any Notion page, converting instantly into native Notion blocks.
- **JSON Package Export:** Download the entire bilingual study archive for local backup.

---

## 🛠️ Tech Stack & Routes

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.7
- **Notion SDK:** `@notionhq/client` (v5.27.0)
- **Styling:** Tailwind CSS with jewel-tone theme and geometric mosaic tessellation
- **Icons:** Lucide React

### API Routes:
- `POST /api/notion/sync`: Creates live Notion pages with batching and error translation.
- `GET|POST /api/notion/status`: Diagnostic health check and accessible target discovery.
- `POST /api/notion/import`: Retrieves and parses child blocks from shared Notion pages.
- `POST /api/transform`: Synthesizes multilingual notes, glossaries, Feynman analogies, and revision questions.

### Application Routes:
- `/`: Dashboard & Notion Workspace Health Ribbon.
- `/lecture-companion`: Ingestion (Notion AI Meeting Notes, file, or Notion import), bilingual notes, and revision questions.
- `/study-studio`: Feynman technique simplifier and interactive flashcards.
- `/assignment-simplifier`: Rubric weights and actionable milestone checklists.
- `/my-learning`: Searchable study archive with live Notion sync triggers.
- `/settings`: Full Notion connection manager, 4-step setup guide, and MCP architecture analysis.

---

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/Ife-Ojo/Mosaic-AI.git
cd Mosaic-AI

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and navigate to **Settings** (`/settings`) to connect your Notion workspace.
