import { Language, StudyMaterial, NotionWorkspaceInfo } from '@/types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr' },
];

export const INITIAL_NOTION_WORKSPACE: NotionWorkspaceInfo = {
  connected: false,
  workspaceName: "My Notion Workspace",
  workspaceIcon: "📓",
  targetDatabaseName: "Course Notes & Research",
  lastSyncTimestamp: "Not connected",
  syncedItemsCount: 0,
  apiKeyConfigured: false,
};

export const SAMPLE_MATERIALS: StudyMaterial[] = [
  {
    id: "mat-1",
    title: "Distributed Systems & Raft Consensus Algorithm",
    subject: "Computer Science",
    type: "lecture",
    sourceLanguage: "en",
    targetLanguage: "es",
    createdAt: "2026-10-08T10:30:00Z",
    lastModified: "2026-10-09T09:15:00Z",
    tags: ["Distributed Systems", "Algorithms", "Consensus", "CS 402"],
    notionPageId: "notion-block-8823f9",
    notionSyncStatus: "local_only",
    notionUrl: "https://notion.so/aidens-vault/Distributed-Systems-Raft-Consensus-8823f9",
    stats: {
      wordCount: 3420,
      estimatedReadTimeMinutes: 12,
      masteryPercentage: 85,
    },
    content: {
      rawSourceText: "In distributed computing, achieving consensus among independent nodes in the presence of node failures and network partitions is one of the classic challenges. Today we analyze the Raft consensus protocol, designed specifically to be more understandable than Paxos...",
      summary: "Overview of the Raft consensus protocol for state machine replication across unreliable distributed networks, focusing on leader election, log replication, and safety guarantees.",
      translatedSummary: "Resumen del protocolo de consenso Raft para la replicación de máquinas de estados en redes distribuidas no confiables, con énfasis en la elección de líderes, replicación de registros y garantías de seguridad.",
      keyTakeaways: [
        "Raft decomposes consensus into three independent subproblems: Leader Election, Log Replication, and Safety.",
        "A leader node handles all client requests and replicates log entries across follower nodes via AppendEntries RPCs.",
        "Terms act as logical clocks, allowing servers to detect obsolete leaders and stale requests."
      ],
      translatedTakeaways: [
        "Raft descompone el consenso en tres subproblemas independientes: Elección de líder, Replicación de registro (log) y Seguridad.",
        "Un nodo líder gestiona todas las solicitudes del cliente y replica las entradas en los seguidores mediante RPCs de AppendEntries.",
        "Los mandatos (Terms) funcionan como relojes lógicos que permiten detectar líderes obsoletos y peticiones desactualizadas."
      ],
      bilingualGlossary: [
        {
          term: "Consensus",
          translation: "Consenso",
          definition: "Agreement among multiple autonomous servers on a shared state or sequence of actions.",
          nativeExplanation: "Acuerdo alcanzado entre múltiples servidores independientes sobre un estado o secuencia de operaciones compartida.",
          category: "Fundamentals"
        },
        {
          term: "Heartbeat",
          translation: "Latido de red (Heartbeat)",
          definition: "Periodic empty RPC message sent by the leader to reset followers' randomized election timers.",
          nativeExplanation: "Mensaje periódico y vacío enviado por el líder para reiniciar los temporizadores de elección de los seguidores y mantener su autoridad.",
          category: "Leader Election"
        },
        {
          term: "Split Vote",
          translation: "Voto dividido",
          definition: "A scenario where votes are evenly distributed among candidates so none reaches the majority quorum.",
          nativeExplanation: "Situación donde varios candidatos reciben igual número de votos y ninguno alcanza el cuórum de la mayoría, resuelto mediante temporizadores aleatorizados.",
          category: "Fault Tolerance"
        }
      ],
      bilingualSections: [
        {
          id: "sec-1",
          timestamp: "04:15",
          heading: "The Leader Election Mechanism",
          headingTranslation: "El mecanismo de elección del líder",
          originalText: "When followers do not hear from a leader within a randomized timeout window (typically 150ms-300ms), they transition to candidate state, increment their current term, and broadcast RequestVote RPCs.",
          translatedText: "Cuando los nodos seguidores no reciben noticias del líder dentro de un intervalo de tiempo de espera aleatorio (normalmente 150ms-300ms), cambian al estado de candidato, incrementan su término actual y transmiten solicitudes RequestVote RPC.",
          insightNotes: "Randomized timers are the key insight that prevents persistent split votes without requiring external coordination."
        },
        {
          id: "sec-2",
          timestamp: "18:40",
          heading: "Log Matching Property & Safety",
          headingTranslation: "Propiedad de coincidencia de registros y seguridad",
          originalText: "If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index. This guarantees linearizability across state machines.",
          translatedText: "Si dos registros contienen una entrada con el mismo índice y mandato, entonces los registros son exactamente idénticos en todas las entradas hasta el índice indicado. Esto garantiza la linearizabilidad en las máquinas de estados.",
          insightNotes: "Never overwrite committed entries: once an entry is safely replicated on a majority of nodes, it is permanently committed."
        }
      ]
    }
  },
  {
    id: "mat-2",
    title: "Cognitive Neuroscience: Long-Term Potentiation & Memory",
    subject: "Neuroscience",
    type: "study_notes",
    sourceLanguage: "en",
    targetLanguage: "zh",
    createdAt: "2026-10-07T14:20:00Z",
    lastModified: "2026-10-08T18:00:00Z",
    tags: ["Neuroscience", "Synaptic Plasticity", "Memory Consolidation", "NEUR 210"],
    notionPageId: "notion-block-9941a2",
    notionSyncStatus: "local_only",
    notionUrl: "https://notion.so/aidens-vault/Cognitive-Neuroscience-LTP-9941a2",
    stats: {
      wordCount: 2180,
      estimatedReadTimeMinutes: 8,
      masteryPercentage: 92,
    },
    content: {
      summary: "Cellular and molecular mechanisms of synaptic plasticity, focusing on NMDA and AMPA receptor dynamics in hippocampal CA1 neurons during memory formation.",
      translatedSummary: "突触可塑性的细胞与分子机制，重点关注海马体CA1区神经元在记忆形成过程中NMDA和AMPA受体的动态变化。",
      keyTakeaways: [
        "Long-Term Potentiation (LTP) is the primary cellular model for how memories are encoded physically in the brain.",
        "NMDA receptors act as molecular coincidence detectors requiring both glutamate binding and membrane depolarization to expel Mg2+ plugs.",
        "Retrograde messengers such as nitric oxide signal the presynaptic terminal to increase neurotransmitter vesicle release."
      ],
      translatedTakeaways: [
        "长时程增强（LTP）是大脑物理编码记忆的核心细胞生物学模型。",
        "NMDA受体充当分子巧合检测器，需要谷氨酸结合和细胞膜去极化双重条件来移除Mg2+离子阻塞。",
        "逆行信使（如一氧化氮）向突触前膜传递信号，从而增加神经递质囊泡的释放量。"
      ],
      bilingualGlossary: [
        {
          term: "Long-Term Potentiation (LTP)",
          translation: "长时程增强 (LTP)",
          definition: "A persistent strengthening of synapses based on recent patterns of activity.",
          nativeExplanation: "基于突触近期高频激活模式而产生的突触传递效能的持久性增强。",
          category: "Cellular Neurobiology"
        },
        {
          term: "Synaptic Plasticity",
          translation: "突触可塑性",
          definition: "The biological ability of chemical synapses to change their strength over time in response to increases or decreases in activity.",
          nativeExplanation: "化学突触根据神经活动强弱随时间动态调节其传递连接强度的生物学能力。"
        },
        {
          term: "Depolarization",
          translation: "去极化",
          definition: "A decrease in the absolute value of a cell's membrane potential, making the intracellular environment more positive.",
          nativeExplanation: "细胞膜电位绝对值减小，使细胞内电位向正电方向移动的电生理过程。"
        }
      ],
      flashcards: [
        {
          id: "fc-1",
          question: "Why is the NMDA receptor classified as a 'coincidence detector'?",
          questionTranslation: "为什么NMDA受体被归类为“巧合检测器”？",
          answer: "Because it requires two simultaneous events: glutamate binding from the presynaptic terminal AND sufficient postsynaptic depolarization to dislodge the Mg2+ ion block.",
          answerTranslation: "因为它需要同时满足两个条件：突触前释放的谷氨酸结合，以及足够的突触后膜去极化以移出镁离子（Mg2+）的物理阻断。",
          difficulty: "medium"
        },
        {
          id: "fc-2",
          question: "What is the immediate downstream effect of Ca2+ influx through activated NMDA channels?",
          questionTranslation: "Ca2+通过活化的NMDA通道内流后的直接下游效应是什么？",
          answer: "Ca2+ activates CaMKII (calcium/calmodulin-dependent protein kinase II), leading to phosphorylation and insertion of additional AMPA receptors into the postsynaptic density.",
          answerTranslation: "Ca2+激活CaMKII（钙/钙调素依赖性蛋白激酶II），促使更多AMPA受体磷酸化并插入突触后致密区膜中。",
          difficulty: "hard"
        }
      ],
      visualOutline: [
        {
          id: "node-1",
          label: "Synaptic Transmission Baseline",
          translation: "基础突触传递过程",
          level: 1,
          description: "Low-frequency stimulation activates only AMPA receptors; NMDA remains blocked by Mg2+.",
          children: [
            {
              id: "node-1-1",
              label: "AMPA Activation",
              translation: "AMPA受体激活与Na+内流",
              level: 2,
              description: "Glutamate binds, causing Na+ influx and modest EPSP generation."
            }
          ]
        },
        {
          id: "node-2",
          label: "Induction Phase (High Frequency Tetanus)",
          translation: "诱导阶段（高频强直刺激）",
          level: 1,
          description: "High-frequency stimulation leads to spatial/temporal summation and unblocking.",
          children: [
            {
              id: "node-2-1",
              label: "Mg2+ Unblocking & Ca2+ Influx",
              translation: "Mg2+解阻断与钙离子内流",
              level: 2,
              description: "Depolarization expels magnesium plug; calcium floods into dendritic spine."
            },
            {
              id: "node-2-2",
              label: "Kinase Cascades (CaMKII / PKC)",
              translation: "激酶级联反应激活",
              level: 2,
              description: "Persistent structural enhancement of dendritic spine geometry."
            }
          ]
        }
      ]
    }
  },
  {
    id: "mat-3",
    title: "CS 350 Capstone: Scalable Event-Driven Microservices",
    subject: "Software Engineering",
    type: "assignment_plan",
    sourceLanguage: "en",
    targetLanguage: "es",
    createdAt: "2026-10-06T11:00:00Z",
    lastModified: "2026-10-09T14:10:00Z",
    tags: ["Architecture", "Kafka", "Microservices", "Grading Rubric", "CS 350"],
    notionPageId: "notion-block-3312c1",
    notionSyncStatus: "local_only",
    notionUrl: "https://notion.so/aidens-vault/CS350-Capstone-Microservices-3312c1",
    stats: {
      wordCount: 1890,
      estimatedReadTimeMinutes: 6,
      masteryPercentage: 70,
    },
    content: {
      assignmentBreakdown: {
        plainSummary: "Build a production-grade distributed ordering pipeline with at least 3 decoupled microservices connected via an event stream (Kafka or RabbitMQ). Must handle network partitions gracefully and enforce idempotency on payment events.",
        translatedSummary: "Construir un canal de procesamiento de pedidos distribuido con al menos 3 microservicios desacoplados conectados mediante un flujo de eventos (Kafka o RabbitMQ). Debe tolerar particiones de red y garantizar idempotencia en eventos de pago.",
        professorIntent: "The professor does not care about fancy UI or complex business logic. They are strictly grading failure handling, distributed transaction recovery (Saga pattern or 2PC), and idempotent message consumption.",
        criticalRubricCriteria: [
          {
            criterion: "Idempotent Message Processing",
            weight: "30% of total grade",
            howToAce: "Use unique transaction UUIDs in database tables with unique constraints. Show proof of duplicate message handling in tests."
          },
          {
            criterion: "Partition & Chaos Tolerance",
            weight: "25% of total grade",
            howToAce: "Demonstrate in your demo video what happens when the Notification service drops out for 60 seconds; no orders should be lost."
          },
          {
            criterion: "Observability & Distributed Tracing",
            weight: "20% of total grade",
            howToAce: "Add OpenTelemetry trace correlation IDs spanning across HTTP boundaries and message headers."
          }
        ],
        commonPitfalls: [
          "Assuming network operations never time out without implementing retry backoff or dead-letter queues (DLQ).",
          "Hardcoding database connection strings instead of using environment variables / Docker secrets.",
          "Submitting an architecture diagram that doesn't match the actual Docker Compose service topology."
        ],
        milestones: [
          {
            phase: "Phase 1: Architecture Blueprint & Docker Compose",
            title: "Core Infrastructure & Schema Definitions",
            deadlineOffsetDays: 3,
            tasks: [
              { id: "t1", text: "Define Protobuf/JSON event schema for OrderPlaced and PaymentCompleted", done: true, estimatedHours: 2 },
              { id: "t2", text: "Create docker-compose.yml running Kafka, Zookeeper/KRaft, and Postgres instances", done: true, estimatedHours: 3 },
              { id: "t3", text: "Sync architecture schema blocks directly to your Notion Assignment page", done: true, estimatedHours: 0.5 }
            ]
          },
          {
            phase: "Phase 2: Service Implementation & Idempotency",
            title: "Orders, Billing, and Inventory Microservices",
            deadlineOffsetDays: 7,
            tasks: [
              { id: "t4", text: "Implement Order Service with PostgreSQL transaction outbox pattern", done: true, estimatedHours: 5 },
              { id: "t5", text: "Build Payment Service with idempotency key cache in Redis", done: false, estimatedHours: 4 },
              { id: "t6", text: "Write unit tests simulating duplicate event delivery", done: false, estimatedHours: 3 }
            ]
          },
          {
            phase: "Phase 3: Chaos Testing & Video Demonstration",
            title: "Resilience Validation & Final Submission",
            deadlineOffsetDays: 12,
            tasks: [
              { id: "t7", text: "Simulate service failure during active order spikes (Chaos test)", done: false, estimatedHours: 3 },
              { id: "t8", text: "Record 5-minute Loom walkthrough explaining the architecture", done: false, estimatedHours: 2 },
              { id: "t9", text: "Generate final Notion project export report with sync badge", done: false, estimatedHours: 1 }
            ]
          }
        ]
      }
    }
  },
  {
    id: "mat-4",
    title: "Macroeconomics: Central Bank Quantitative Easing & Inflation",
    subject: "Economics",
    type: "study_notes",
    sourceLanguage: "en",
    targetLanguage: "fr",
    createdAt: "2026-10-05T09:00:00Z",
    lastModified: "2026-10-07T16:30:00Z",
    tags: ["Economics", "Monetary Policy", "Inflation", "ECON 102"],
    notionPageId: "notion-block-5511b8",
    notionSyncStatus: "local_only",
    notionUrl: "https://notion.so/aidens-vault/Macroeconomics-QE-5511b8",
    stats: {
      wordCount: 1650,
      estimatedReadTimeMinutes: 5,
      masteryPercentage: 90,
    },
    content: {
      summary: "Analysis of non-conventional monetary policy tools when nominal interest rates hit the Zero Lower Bound (ZLB), examining balance sheet expansion, bond yields, and asset price transmission.",
      translatedSummary: "Analyse des outils de politique monétaire non conventionnels lorsque les taux d'intérêt nominaux atteignent la borne du zéro (ZLB), examinant l'expansion du bilan, le rendement obligataire et la transmission sur le prix des actifs.",
      feynmanAnalogy: "Imagine an economy as a garden irrigation system during a drought. Regular interest rate cuts are like opening the valve wider. When the valve is already 100% open (zero rates) and the plants are still thirsty, Quantitative Easing is like taking water tanker trucks directly into the fields and spraying water straight onto the soil roots.",
      keyTakeaways: [
        "Quantitative Easing (QE) involves central banks purchasing long-term government bonds to lower yields and stimulate private lending.",
        "The transmission mechanism operates through three channels: Portfolio Rebalancing, Signaling, and Liquidity.",
        "When rates are at zero, conventional open-market operations lose traction, requiring explicit forward guidance."
      ],
      translatedTakeaways: [
        "L'assouplissement quantitatif (QE) consiste pour les banques centrales à acheter des obligations souveraines à long terme afin de réduire les rendements et stimuler le crédit privé.",
        "Le mécanisme de transmission s'articule autour de trois canaux : le rééquilibrage de portefeuille, le signalement et la liquidité.",
        "Lorsque les taux directeurs touchent zéro, les opérations conventionnelles d'open market perdent leur efficacité, nécessitant un guidage prospectif (forward guidance)."
      ],
      bilingualGlossary: [
        {
          term: "Quantitative Easing (QE)",
          translation: "Assouplissement quantitatif",
          definition: "An unconventional monetary policy whereby a central bank purchases predetermined amounts of government bonds or other financial assets.",
          nativeExplanation: "Politique monétaire non conventionnelle par laquelle une banque centrale achète massivement des titres financiers pour injecter des liquidités dans l'économie."
        },
        {
          term: "Zero Lower Bound (ZLB)",
          translation: "Plancher du taux zéro (ZLB)",
          definition: "A macroeconomic situation where nominal interest rates are at or near zero, limiting the capacity of central banks to further stimulate growth.",
          nativeExplanation: "Situation macroéconomique où les taux d'intérêt nominaux sont proches de zéro, restreignant la capacité de baisse des taux conventionnelle."
        }
      ]
    }
  }
];

export const PRESET_LECTURE_TRANSCRIPTS = [
  {
    title: "Quantum Mechanics: The Double-Slit Experiment & Wave-Particle Duality",
    subject: "Physics",
    defaultSource: "en" as const,
    defaultTarget: "es" as const,
    text: `Professor Mitchell: Welcome back everyone. Today we are diving into the heart of quantum weirdness: wave-particle duality, specifically through the lens of Thomas Young's double-slit experiment, but updated for single-photon and single-electron emitters.

When light passes through two narrow, closely spaced slits, we observe an interference pattern—alternating bands of constructive and destructive interference on the detector screen. This makes total classical sense if light is purely an electromagnetic wave. Waves diffract and interfere.

However, the real revolution occurred when physicists repeated this experiment by firing electrons—indisputably particles with mass—one at a time. If you fire a single electron every ten minutes, what do you expect? You might assume that each electron must pass through slit A or slit B, accumulating into two distinct clumps behind each slit.

Remarkably, that is not what happens. Even when fired individually, the statistical distribution of electron strikes over thousands of iterations still builds up the exact same wave-like interference pattern! This implies that each individual electron's probability wave passes through both slits simultaneously, interfering with itself.

Now comes the kicker: what happens if we place a microscopic photodetector directly at slit A to watch which path the electron actually takes? The moment you observe the electron's path, the interference pattern disappears completely, collapsing into two classical clumps! The act of measurement perturbs the quantum state, causing wave function collapse.`
  },
  {
    title: "Introduction to Artificial Intelligence: Gradient Descent & Loss Landscapes",
    subject: "Computer Science",
    defaultSource: "en" as const,
    defaultTarget: "zh" as const,
    text: `Lecturer: Today we tackle the core optimization engine behind modern deep learning: gradient descent and how neural networks navigate complex non-convex loss landscapes.

At its core, training a machine learning model is an optimization problem. We define a loss function, L of theta, which quantifies the discrepancy between our model's predictions and the ground truth labels. Our objective is to discover the parameter configuration theta star that minimizes this loss.

In high-dimensional space, the loss landscape is not a simple smooth convex bowl like linear regression. Instead, it features saddle points, ravines with high curvature in one direction and gentle slopes in another, and flat plateaus where gradients vanish.

Vanilla Gradient Descent computes the exact gradient over the entire dataset before making a single update: theta becomes theta minus alpha times the gradient of L. But computing this over billions of tokens or images is computationally prohibitive. Therefore, we use Stochastic Gradient Descent (SGD) and mini-batching. The noise introduced by mini-batches is actually beneficial: it injects stochastic momentum that helps the optimizer escape shallow saddle points and sharp sub-optimal local minima.`
  },
  {
    title: "European History: The Black Death and the Breakdown of Feudalism",
    subject: "History",
    defaultSource: "en" as const,
    defaultTarget: "fr" as const,
    text: `Professor Laurent: Good morning. When the bubonic plague struck Western Europe between 1347 and 1351, wiping out between 30 and 60 percent of the population, it triggered not merely a demographic catastrophe, but a structural economic collapse that fatally undermined the institution of feudalism.

Before 1348, Europe was characterized by land scarcity and labor surplus. Feudal lords held virtually all bargaining power; serfs were legally tied to their estates, bound by customary labor services with little recourse.

The sudden mortality shock inverted the factor endowments. Suddenly, arable land was plentiful and fertile, but human agricultural labor was exceptionally scarce. Crops were rotting in unharvested fields.

Basic supply and demand took hold: the marginal productivity of labor skyrocketed. Surviving peasant laborers discovered that they could demand substantial cash wages and better leases. When royal authorities attempted to freeze wages via statutes like the English Ordinance of Labourers in 1349, it sparked widespread agrarian rebellion, accelerating the transition toward a commercial, wage-based market economy.`
  }
];

export const PRESET_ASSIGNMENT_PROMPTS = [
  {
    title: "CS 420: Distributed Database Raft Implementation",
    subject: "Computer Science",
    defaultTarget: "es" as const,
    text: `Course: CS 420 Distributed Computing
Assignment 2: Replicated Fault-Tolerant State Machine (Raft)
Due: October 24 at 11:59 PM. Late penalty: 10% per 24 hours.

Objective: You must implement the Raft consensus algorithm in Go. Your service must maintain an append-only log replicated across 5 network nodes and execute state machine transactions reliably under simulated network drops.

Specifications & Requirements:
1. Leader Election: Implement randomized election timers between 150ms and 300ms. Handle candidate step-down if an incoming RPC has a higher term.
2. Log Replication: Leader must broadcast AppendEntries heartbeats every 50ms. Followers must verify log consistency before appending.
3. Network Partitions: Your system will be tested using a Chaos Monkey simulator that splits the network into a majority (3 nodes) and minority (2 nodes) partition. Transactions accepted on the majority must survive and commit; requests sent to the minority must be rejected or buffered without inconsistency.
4. Testing: 100% of grading relies on automated race-detector tests (go test -race). Memory leaks and deadlocks will result in an immediate failing grade for that test suite.
5. Submission: Git repository link, comprehensive architecture document (max 3 pages), and a 3-minute video explaining your election timeout design.`
  },
  {
    title: "BIO 380: CRISPR-Cas9 Therapeutics Policy & Research Proposal",
    subject: "Bioengineering",
    defaultTarget: "zh" as const,
    text: `Course: BIO 380 Advanced Molecular Therapeutics
Project: Translational Grant Proposal & Ethics Defense
Weight: 35% of Final Grade. Due: November 5.

Overview: Submit a formal National Institutes of Health (NIH) style exploratory research proposal outlining an in-vivo CRISPR-Cas9 delivery mechanism targeting monogenic neurodegenerative conditions (e.g., Huntington's Disease or ALS).

Required Sections:
1. Specific Aims (1 page): Define hypothesis and primary engineering benchmarks (target editing efficiency > 40%, off-target cleavages < 0.1%).
2. Delivery Modality Analysis: Compare Adeno-Associated Viruses (AAV) vs. Lipid Nanoparticles (LNPs) crossing the blood-brain barrier. Justify your choice with empirical literature from the past 3 years.
3. Immunogenicity & Safety Protocol: How do you address pre-existing Cas9 antibodies and off-target double-stranded breaks?
4. Ethical & Regulatory Framework: Address WHO germline vs. somatic editing guidelines and discuss global accessibility considerations for developing healthcare markets.

Formatting: Single-spaced, 11pt Arial, NIH biosketch format. Submissions missing statistical power calculations will forfeit 15 marks.`
  }
];
