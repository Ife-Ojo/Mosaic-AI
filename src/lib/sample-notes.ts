import { SharedNote } from '@/types/exchange';

export const SAMPLE_EXCHANGE_NOTES: SharedNote[] = [
  {
    id: "sn-1",
    title: "Transformer Attention Mechanisms & Scaled Dot-Product Math",
    subject: "Machine Learning",
    language: "en",
    author_id: "usr-elena-rodriguez",
    created_at: "2026-10-09T08:30:00Z",
    read_time_minutes: 6,
    tags: ["Deep Learning", "Transformers", "NLP", "Linear Algebra"],
    author: {
      id: "usr-elena-rodriguez",
      display_name: "Elena Rodriguez",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
    },
    content: `# Transformer Attention Mechanisms & Scaled Dot-Product Math

## 1. Motivation: Why Self-Attention?
Traditional Recurrent Neural Networks (RNNs and LSTMs) process sequences sequentially, creating an $O(N)$ computational bottleneck that prevents parallelization during training. Transformers replace recurrence entirely with Self-Attention ($O(1)$ sequential operations).

## 2. Mathematical Definition
Given queries $Q$, keys $K$, and values $V$ with dimension $d_k$:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

### Why scale by $\\sqrt{d_k}$?
- For large values of $d_k$, the dot products grow large in magnitude.
- Large values push the softmax function into regions with extremely small gradients (vanishing gradient problem).
- Scaling by $1/\\sqrt{d_k}$ stabilizes the variance to 1.

## 3. Multi-Head Attention
Instead of performing a single attention function with $d_{\\text{model}}$-dimensional queries, keys, and values, Multi-Head Attention projects them $h$ times with different learned linear projections:

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O$$

where:
$$\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

## 4. Key Takeaways for Exams
- Self-attention allows each position to attend to all positions simultaneously.
- Positional Encodings (sinusoidal or learned) are required because attention is inherently permutation-invariant.
- Complexity per layer: $O(N^2 \\cdot d)$ where $N$ is sequence length and $d$ is representation dimension.`
  },
  {
    id: "sn-2",
    title: "Distribución de Poisson y Procesos Estocásticos (Resumen y Ejercicios)",
    subject: "Mathematics",
    language: "es",
    author_id: "usr-carlos-mendoza",
    created_at: "2026-10-08T19:15:00Z",
    read_time_minutes: 5,
    tags: ["Probabilidad", "Estadística", "Poisson", "Procesos Estocásticos"],
    author: {
      id: "usr-carlos-mendoza",
      display_name: "Carlos Mendoza",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80",
    },
    content: `# Distribución de Poisson y Procesos Estocásticos

## 1. Definición y Propiedades Fundamentales
La distribución de Poisson modela el número de eventos independientes que ocurren en un intervalo fijo de tiempo o espacio, con una tasa promedio constante $\\lambda > 0$.

### Función de Probabilidad de Masa (PMF):
$$P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad k \\in \\{0, 1, 2, \\dots\\}$$

### Propiedades clave:
- **Esperanza matemática:** $E[X] = \\lambda$
- **Varianza:** $\\text{Var}(X) = \\lambda$ (La media es igual a la varianza)
- **Aproximación de Poisson a la Binomial:** Válida cuando $n \\ge 20$ y $p \\le 0.05$, donde $\\lambda = np$.

## 2. Proceso de Poisson Homogéneo
Un proceso de conteo $\{N(t), t \\ge 0\}$ es un proceso de Poisson con tasa $\\lambda$ si:
1. $N(0) = 0$.
2. Los incrementos son independientes: el número de eventos en intervalos disjuntos son variables aleatorias independientes.
3. El número de eventos en cualquier intervalo de longitud $t$ tiene distribución $\\text{Poisson}(\\lambda t)$.

## 3. Distribución del Tiempo entre Llegadas
- El tiempo entre eventos consecutivos sigue una **distribución exponencial** con parámetro $\\lambda$: $f(t) = \\lambda e^{-\\lambda t}$.
- Propiedad de pérdida de memoria: $P(T > s + t \\mid T > s) = P(T > t)$.

## 4. Consejos para el Examen Parcial
- Si el enunciado menciona "eventos raros e independientes a tasa constante", usa Poisson.
- Recuerda verificar que $\\lambda$ esté ajustado a la unidad de tiempo correcta del problema.`
  },
  {
    id: "sn-3",
    title: "Operating Systems: Virtual Memory Paging & TLB Hit Rate Formulas",
    subject: "Computer Science",
    language: "en",
    author_id: "usr-aiden-clark",
    created_at: "2026-10-08T14:40:00Z",
    read_time_minutes: 7,
    tags: ["Operating Systems", "Virtual Memory", "Paging", "TLB", "Hardware"],
    author: {
      id: "usr-aiden-clark",
      display_name: "Aiden Clark",
      avatar_url: null,
    },
    content: `# Operating Systems: Virtual Memory Paging & TLB Hit Rate

## 1. Hierarchical Paging Architecture
Modern 64-bit architectures use multi-level page tables (e.g., 4-level paging in x86-64: PML4, PDPT, PD, PT) to prevent allocating massive contiguous memory blocks for sparse address spaces.

### Virtual Address Breakdown (4KB Page Size):
- **Page Offset:** 12 bits ($2^{12} = 4096$ bytes)
- **Virtual Page Number (VPN):** Remaining upper bits indexed through table hierarchy.

## 2. Translation Lookaside Buffer (TLB)
A hardware cache in the MMU storing recent virtual-to-physical address mappings.

### Effective Access Time (EAT) Formula:
Let:
- $\\alpha$ = TLB Hit Ratio
- $\\epsilon$ = TLB Access Time (typically 1-2 ns)
- $m$ = Main Memory Access Time (typically 50-100 ns)

$$\\text{EAT} = (\\epsilon + m) \\cdot \\alpha + (\\epsilon + 2m) \\cdot (1 - \\alpha)$$

*Note for 2-level paging without TLB hit:* Requires 2 memory lookups for page tables + 1 lookup for actual frame = $3m$.

## 3. Page Replacement Algorithms Comparison
1. **FIFO:** Simple queue, suffers from Belady's Anomaly (more frames can cause more page faults).
2. **LRU (Least Recently Used):** Optimal practical approximation, implemented via stack or counter bits.
3. **Clock / Second Chance:** Circular buffer with use bit (0 or 1). Low hardware overhead.

## 4. Key Takeaways
- Thrashing occurs when the sum of process working sets exceeds total physical memory available.
- Demand Paging only swaps frames into memory upon a Page Fault interrupt.`
  },
  {
    id: "sn-4",
    title: "量子力学基础：薛定谔方程与一维无限深势阱详解 (Schrödinger Equation & Potential Well)",
    subject: "Physics",
    language: "zh",
    author_id: "usr-li-wei",
    created_at: "2026-10-07T16:20:00Z",
    read_time_minutes: 6,
    tags: ["量子力学", "薛定谔方程", "波函数", "势阱", "现代物理"],
    author: {
      id: "usr-li-wei",
      display_name: "Li Wei (李伟)",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
    },
    content: `# 量子力学基础：薛定谔方程与一维无限深势阱

## 1. 定态薛定谔方程 (Time-Independent Schrödinger Equation)
对于在不随时间改变的势场 $V(x)$ 中运动的粒子，其波函数可以分离变量为 $\\Psi(x,t) = \\psi(x) e^{-iEt/\\hbar}$。定态方程为：

$$-\\frac{\\hbar^2}{2m} \\frac{d^2\\psi(x)}{dx^2} + V(x)\\psi(x) = E\\psi(x)$$

## 2. 一维无限深势阱模型 (1D Infinite Square Well)
定义势能函数：
$$V(x) = \\begin{cases} 0 & 0 < x < a \\\\ \\infty & x \\le 0 \\text{ 或 } x \\ge a \\end{cases}$$

### 边界条件：
- 在势阱外由于 $V = \\infty$，粒子存在的概率为 0，即 $\\psi(0) = 0$ 且 $\\psi(a) = 0$。

### 解的形式与本征能量：
解定解微分方程得到归一化本征波函数：
$$\\psi_n(x) = \\sqrt{\\frac{2}{a}} \\sin\\left(\\frac{n\\pi x}{a}\\right), \\quad n = 1, 2, 3, \\dots$$

相应的本征能级为量子化的：
$$E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2m a^2} = \\frac{n^2 h^2}{8m a^2}$$

## 3. 核心物理意义与考试重点
1. **零点能 (Zero-Point Energy)：** 当 $n=1$ 时，$E_1 > 0$。粒子即使在基态也不能完全静止，这直接源于海森堡测不准原理（$\\Delta x \\Delta p \\ge \\hbar / 2$）。
2. **正交归一性：** $\\int_0^a \\psi_m^*(x)\\psi_n(x)dx = \\delta_{mn}$。
3. **节点数：** 第 $n$ 个态具有 $n-1$ 个波节（不包括两端边界）。`
  },
  {
    id: "sn-5",
    title: "Neurobiologie: Synaptische Plastizität & Long-Term Potentiation (LTP)",
    subject: "Neuroscience",
    language: "de",
    author_id: "usr-lukas-weber",
    created_at: "2026-10-07T11:00:00Z",
    read_time_minutes: 5,
    tags: ["Neurowissenschaften", "Biologie", "LTP", "Gedächtnis", "Hippocampus"],
    author: {
      id: "usr-lukas-weber",
      display_name: "Lukas Weber",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80",
    },
    content: `# Neurobiologie: Synaptische Plastizität & Langzeitpotenzierung (LTP)

## 1. Hebbsche Lernregel (1949)
*"Neurons that fire together, wire together."*  
Wenn ein Axon der Zelle A Zelle B wiederholt erregt, finden metabolische oder strukturelle Wachstumsveränderungen statt, sodass die Effizienz der synaptischen Übertragung zunimmt.

## 2. Der zelluläre Mechanismus im Hippocampus (CA1-Region)
Die Langzeitpotenzierung an glutamatergen Synapsen basiert auf zwei Haupttypen ionotroper Glutamatrezeptoren:

### AMPA-Rezeptoren:
- Werden durch Glutamat geöffnet.
- Leiten hauptsächlich $Na^+$-Ionen in die Postsynapse.
- Bewirken ein exzitatorisches postsynaptisches Potenzial (EPSP).

### NMDA-Rezeptoren als Koinzidenzdetektoren:
- Bei Ruhemembranpotenzial blockiert ein Magnesium-Ion ($Mg^{2+}$) die Ionenpore.
- Nur wenn die postsynaptische Membran durch starke AMPA-Aktivität ausreichend depolarisiert ist, wird der $Mg^{2+}$-Block elektrostatisch ausgestoßen.
- Glutamatbindung + Depolarisation führen zum Einstrom von Calcium-Ionen ($Ca^{2+}$).

## 3. Signaltransduktionskaskade & Konsolidierung
1. **Frühphase (E-LTP):** $Ca^{2+}$-Aktivierung von CaMKII $\\rightarrow$ Phosphorylierung vorhandener AMPA-Rezeptoren + Insertion neuer AMPA-Rezeptoren in die postsynaptische Dichte.
2. **Spätphase (L-LTP):** PKA $\\rightarrow$ CREB-Aktivierung im Zellkern $\\rightarrow$ Neusynthese von Proteinen (Strukturelles Wachstum der dendritischen Dornen).`
  },
  {
    id: "sn-6",
    title: "Macroéconomie: Modèle IS-LM et Politiques Économiques en Économie Fermée",
    subject: "Economics",
    language: "fr",
    author_id: "usr-sophie-dubois",
    created_at: "2026-10-06T15:30:00Z",
    read_time_minutes: 6,
    tags: ["Économie", "Macroéconomie", "Modèle IS-LM", "Politique Budgétaire", "Keynes"],
    author: {
      id: "usr-sophie-dubois",
      display_name: "Sophie Dubois",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80",
    },
    content: `# Macroéconomie: Modèle IS-LM et Politiques Économiques

## 1. Fondements du Modèle Hicks-Hansen
Le modèle IS-LM synthétise le marché des biens et services (IS) et le marché de la monnaie (LM) pour déterminer simultanément le revenu d'équilibre ($Y$) et le taux d'intérêt ($i$).

### Courbe IS (Investment-Saving):
- Équilibre sur le marché des biens: $Y = C(Y - T) + I(i) + G$.
- Pente décroissante: Une hausse du taux d'intérêt $i$ réduit l'investissement ($I$), entraînant une baisse de la demande globale et de la production ($Y$).

### Courbe LM (Liquidity-Money):
- Équilibre sur le marché monétaire: $\\frac{M}{P} = L(Y, i)$.
- Pente croissante: Une augmentation de la production ($Y$) accroît la demande de monnaie pour des motifs de transaction; pour une offre de monnaie fixe, le taux d'intérêt doit augmenter pour restaurer l'équilibre.

## 2. Analyse des Chocs et Politiques
### A. Politique Budgétaire Expansionniste ($\\Delta G > 0$):
- Déplace la courbe IS vers la droite.
- Résultats: Augmentation de $Y$ et hausse du taux d'intérêt $i$.
- **Effet d'éviction (Crowding-out):** La hausse du taux d'intérêt décourage une partie de l'investissement privé.

### B. Politique Monétaire Expansionniste ($\\Delta M > 0$):
- Déplace la courbe LM vers le bas / la droite.
- Résultats: Hausse de $Y$ et baisse du taux d'intérêt $i$.
- Favorise l'investissement en diminuant le coût du capital.

## 3. Cas Particuliers Fréquents aux Examens
- **Trappe à liquidité:** LM horizontale à taux d'intérêt nul ($i \\approx 0$). La politique monétaire devient inefficace; seule la relance budgétaire a un plein multiplicateur.
- **Cas classique:** LM verticale; la demande de monnaie est insensible au taux d'intérêt.`
  },
  {
    id: "sn-7",
    title: "Organic Chemistry: Carbonyl Addition Mechanisms (Aldehydes vs Ketones)",
    subject: "Chemistry",
    language: "en",
    author_id: "usr-marcus-vance",
    created_at: "2026-10-06T09:45:00Z",
    read_time_minutes: 5,
    tags: ["Organic Chemistry", "Carbonyls", "Nucleophilic Addition", "Mechanisms", "MCAT"],
    author: {
      id: "usr-marcus-vance",
      display_name: "Marcus Vance",
      avatar_url: null,
    },
    content: `# Organic Chemistry: Carbonyl Addition Mechanisms

## 1. Electrophilicity of the Carbonyl Carbon
The carbonyl group ($C=O$) is polarized due to oxygen's higher electronegativity ($\\delta^+ C = O \\delta^-$).

### Relative Reactivity:
$$\\text{Formaldehyde} > \\text{Aldehydes} > \\text{Ketones} > \\text{Esters} > \\text{Amides}$$

### Why are aldehydes more reactive than ketones?
1. **Steric effects:** Aldehydes have only one alkyl substituent vs. two in ketones, reducing steric hindrance during nucleophilic attack.
2. **Electronic effects:** Alkyl groups are electron-donating by induction, stabilizing the partial positive charge on ketone carbons more than aldehydes.

## 2. Nucleophilic Addition Under Basic Conditions
A strong nucleophile ($Nu^-$: e.g., Grignard $RMgX$, Hydride $NaBH_4 / LiAlH_4$, Cyanide $CN^-$) directly attacks the electrophilic carbon:
1. **Step 1:** $Nu^-$ attacks $C=O$ carbon $\\rightarrow$ Tetrahedral alkoxide intermediate.
2. **Step 2:** Proton transfer from solvent ($H_2O / H^+$) yields the alcohol product.

## 3. Acid-Catalyzed Nucleophilic Addition
Weak nucleophiles (e.g., $H_2O$, $ROH$) require acid catalysis:
1. **Step 1:** Protonation of the carbonyl oxygen increases electrophilicity of carbon.
2. **Step 2:** Nucleophile attacks activated carbonyl carbon.
3. **Step 3:** Deprotonation yields hemiketal / hemiacetal.

## 4. Key Takeaways for Synthesis
- Grignard reagents cannot be used in protic solvents (they act as strong bases and deprotonate water/alcohols).
- Hemiacetals react with a second alcohol equivalent in acid to yield stable acetal protecting groups.`
  },
  {
    id: "sn-8",
    title: "データ構造とアルゴリズム：ダイクストラ法とA*探索アルゴリズムの比較 (Dijkstra vs A* Search)",
    subject: "Computer Science",
    language: "ja",
    author_id: "usr-kenji-sato",
    created_at: "2026-10-05T14:10:00Z",
    read_time_minutes: 5,
    tags: ["アルゴリズム", "グラフ理論", "ダイクストラ", "最短経路", "A*探索"],
    author: {
      id: "usr-kenji-sato",
      display_name: "Kenji Sato (佐藤健二)",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
    },
    content: `# データ構造とアルゴリズム：ダイクストラ法とA*探索アルゴリズム

## 1. ダイクストラ法 (Dijkstra's Algorithm)
非負の重みを持つ有向・無向グラフにおいて、単一始点からの最短経路を求めるアルゴリズム。

### 計算量：
- 二分ヒープ（優先度付きキュー）使用時: $O((V + E) \\log V)$
- フィボナッチヒープ使用時: $O(E + V \\log V)$

### アルゴリズムの流れ：
1. 始点の距離を 0、その他のすべての頂点の距離を $\\infty$ に初期化。
2. 未確定頂点の中で暫定距離が最小のノード $u$ を取り出す。
3. ノード $u$ から隣接する各頂点 $v$ への緩和操作（Relaxation）を実行：
   $$\\text{dist}[v] = \\min(\\text{dist}[v], \\text{dist}[u] + \\text{weight}(u, v))$$
4. すべての頂点が確定するまで繰り返す。

## 2. A*（エースター）探索アルゴリズム
ダイクストラ法にヒューリスティック関数 $h(n)$ を組み合わせた最良優先探索。

### 評価関数：
$$f(n) = g(n) + h(n)$$
- $g(n)$: スタートノードからノード $n$ までの確定コスト
- $h(n)$: ノード $n$ からゴールまでの推定推定コスト

### 許容性（Admissibility）と一貫性（Consistency）：
- **許容性:** $h(n) \\le h^*(n)$（実際の最短コストを決して過大評価しない）。
- 許容性を満たす場合、A* は常に最適解（最短経路）を見つけることが保証される。

## 3. まとめ：どちらを使うべきか？
- 全方位に探索するダイクストラに対し、A* はゴール方向へ偏向して探索するため訪問ノード数が大幅に削減される。
- ゲームAIやナビゲーションマップでは A* が標準。`
  }
];

export const DEMO_CONTRIBUTOR_PROFILE = {
  id: "usr-current-demo-student",
  display_name: "Aiden Clark (You)",
  avatar_url: null,
};
