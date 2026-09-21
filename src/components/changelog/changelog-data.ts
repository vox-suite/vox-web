export interface ChangelogItem {
  id: string;
  date: string;
  formattedDate: string;
  version: string;
  title: string;
  summary: string;
  subsystems: ("vox-bridge" | "vox-core" | "vox-web" | "vox-deploy")[];
  category: "voice" | "core" | "biometrics" | "web" | "infra";
  tags: string[];
  metrics?: {
    label: string;
    value: string;
  };
  features: {
    category: string;
    items: {
      title: string;
      description: string;
    }[];
  }[];
  highlight?: {
    title: string;
    description: string;
  };
}

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    id: "2026-09-21-wespeaker-biometrics-elevenlabs-mp3",
    date: "2026-09-21",
    formattedDate: "Sep 21, 2026",
    version: "v0.5.0",
    title: "WeSpeaker Neural Voice Biometrics, Live Speaker Enrollment & ElevenLabs MP3 Streaming",
    summary:
      "Integrated WeSpeaker ResNet-34 ONNX neural speaker embeddings for deep biometric identification, introduced live mid-call speaker enrollment and active caller handoff, added real-time streaming MP3-to-mu-law transcoding for ElevenLabs telephony, and synchronized sub-millisecond personalized caller greetings.",
    subsystems: ["vox-bridge", "vox-core", "vox-deploy"],
    category: "biometrics",
    tags: [
      "WeSpeaker ONNX",
      "ResNet-34",
      "Voice Biometrics",
      "Speaker Enrollment",
      "Active Handoff",
      "ElevenLabs MP3",
      "Telephony",
      "Greeting Sync",
    ],
    metrics: {
      label: "Biometric Backbone",
      value: "ResNet-34 ONNX",
    },
    features: [
      {
        category: "Neural Voice Biometrics & Identity Handoff",
        items: [
          {
            title: "WeSpeaker ResNet-34 ONNX Integration",
            description:
              "Directly embedded deep 256/512-dimensional acoustic feature extraction via ONNX Runtime C++ backend in vox-bridge, replacing baseline Mel-filterbanks with state-of-the-art neural speaker verification.",
          },
          {
            title: "Real-Time Mid-Call Speaker Handoff",
            description:
              "Continually compares turn voice embeddings against enrolled speaker profiles. When a voice divergence is detected (cosine similarity < 0.55), automatically intercepts ('It sounds like someone else is speaking. What is your name?') and seamlessly re-routes active user context.",
          },
          {
            title: "Autonomous Conversational Speaker Enrollment",
            description:
              "Natural conversational profile enrollment: when a new speaker introduces themselves ('My name is...'), the cognitive engine immediately captures their voiceprint, creates their user profile, and binds their identity in Postgres and Redis.",
          },
        ],
      },
      {
        category: "Telephony & Audio Streaming Engine",
        items: [
          {
            title: "ElevenLabs Streaming MP3-to-MuLaw Transcoder",
            description:
              "Engineered an in-memory asynchronous audio decoder and resampler using minimp3 and tokio-util, dynamically transcoding 44.1kHz MP3 streaming chunks into 8kHz G.711 mu-law for Twilio telephony compatibility without requiring ElevenLabs Pro PCM tier.",
          },
          {
            title: "Sub-Millisecond Caller Greeting Synchronization",
            description:
              "Pre-caches known caller names in Redis (vox:greeting-names) on startup with fallback to Postgres, delivering instant personalized greetings ('Hello Rahul! How can I help you today?') before full LLM deliberation.",
          },
          {
            title: "Adaptive Onboarding Protocol",
            description:
              "Redesigned first-time caller prompts to warmly assist callers without gating their immediate requests, gathering user identity in the background through natural dialogue.",
          },
        ],
      },
    ],
    highlight: {
      title: "Zero-Leakage Multi-Speaker Security",
      description:
        "By coupling WeSpeaker ResNet-34 neural embeddings with sub-second active speaker triage, Vox automatically prevents multi-user data leakage and securely isolates personal task contexts even when phones are shared.",
    },
  },
  {
    id: "2026-09-19-zero-latency-audio-cache",
    date: "2026-09-19",
    formattedDate: "Sep 19, 2026",
    version: "v0.4.0",
    title: "Zero-Latency Audio Cache, Domain Fillers & Continuous Turn Biometrics",
    summary:
      "Achieved sub-millisecond Time-To-First-Audio (TTFA) on telephony task turns via pre-warmed audio caches, introduced domain-tailored contextual fillers across 10 functional domains, added structured VAD tracing, and enabled continuous turn-by-turn voice biometric extraction.",
    subsystems: ["vox-bridge", "vox-core"],
    category: "voice",
    tags: ["Audio Cache", "Voice Telephony", "VAD", "Biometrics", "TTFA", "SSE Streaming"],
    metrics: {
      label: "Task First Audio Latency",
      value: "< 1ms",
    },
    features: [
      {
        category: "Voice Telephony & Audio Pipeline",
        items: [
          {
            title: "Pre-Warmed In-Memory Audio Cache (FILLER_CACHE)",
            description:
              "Pre-renders and stores G.711 mu-law audio frames in-memory on server startup. Delivers instant speech playback for task acknowledgments before the LLM generates tokens.",
          },
          {
            title: "Domain-Tailored Spoken Acknowledgment Taxonomy",
            description:
              "Intelligent context-aware filler selection categorized across 10 functional domains (tasks, calendar, notes, calculations, navigation, weather, sports, messages, chitchat avoidance) with rotational variety.",
          },
          {
            title: "Sub-Sentence Acoustic Clause Chunking",
            description:
              "Upgraded chunker logic to break speech at punctuation clauses (commas, semicolons, dashes) when phrases exceed 5 words, triggering earlier TTS synthesis.",
          },
          {
            title: "Structured VAD Diagnostic Telemetry",
            description:
              "Added comprehensive tracing logs capturing frame RMS, dynamic thresholds, running noise floor, and barge-in playback cancellation markers.",
          },
        ],
      },
      {
        category: "Biometrics & Cognitive Engine",
        items: [
          {
            title: "Continuous Per-Turn Biometric Signature Extraction",
            description:
              "Upgraded speech accumulator to extract 192-dimensional Mel-filterbank embeddings on every conversational turn, enabling mid-call multi-speaker detection.",
          },
          {
            title: "Rig Real-Time SSE Token Streaming",
            description:
              "Enabled Rig SSE token streaming from vox-core to vox-bridge, pipelining Gemini LLM tokens directly into the audio synthesis pipeline.",
          },
          {
            title: "Duplicate Conversational Acknowledgment Stripping",
            description:
              "Extended regex filter in vox-bridge to strip conversational prefixes from the subsequent LLM output, preventing redundant spoken phrases.",
          },
        ],
      },
    ],
    highlight: {
      title: "Zero-Lag Perception Breakthrough",
      description:
        "By playing pre-warmed mu-law audio frames concurrently with background LLM token generation, the user hears an immediate natural acknowledgment (<1ms) while complex tool execution runs behind the scenes.",
    },
  },
  {
    id: "2026-09-18-edge-vad-barge-in-jev",
    date: "2026-09-18",
    formattedDate: "Sep 18, 2026",
    version: "v0.3.5",
    title: "Edge VAD Instant Barge-In, Mel Voiceprints & Jev System 1 Intelligence",
    summary:
      "Implemented local edge Voice Activity Detection (VAD) directly on raw G.711 mu-law frames for sub-50ms barge-in interruption, engineered 80-bin Mel-filterbank speaker embeddings, and integrated TypeSafe Jev System 1 for instant semantic triage.",
    subsystems: ["vox-bridge", "vox-core"],
    category: "biometrics",
    tags: ["Edge VAD", "Barge-In", "Mel Filterbank", "Jev System 1", "Voiceprints", "Identity"],
    metrics: {
      label: "Local Barge-In Response",
      value: "< 50ms",
    },
    features: [
      {
        category: "Biometrics & Security",
        items: [
          {
            title: "Local Edge VAD in Rust",
            description:
              "Processes incoming 8kHz mu-law audio frames with an adaptive noise floor and energy multiplier, triggering instant Twilio buffer clearance and speech cancellation upon user speech.",
          },
          {
            title: "80-Bin Mel-Filterbank Acoustic Extraction",
            description:
              "Converts 8kHz mu-law audio into 16kHz linear PCM, computes 80-bin Mel filterbanks and Discrete Cosine Transform (DCT) to yield 192-dim biometric feature vectors.",
          },
          {
            title: "Voiceprint Verification & Multi-Speaker Interception",
            description:
              "Core checks cosine similarity against enrolled user profiles. When speaker voice changes mid-call, triggers an immediate security verification challenge.",
          },
        ],
      },
      {
        category: "Cognitive Engine & Core Architecture",
        items: [
          {
            title: "TypeSafe Jev System 1 Triage",
            description:
              "Fast schema classification and semantic routing model that filters event urgency, pre-filters scheduled actions, and executes call-opening fast paths.",
          },
          {
            title: "Fragmented Utterance Stitching",
            description:
              "Automatically stitches audio turn fragments across natural mid-sentence pauses when interrupted utterances are continued.",
          },
          {
            title: "Dynamic Schema & Time Anchor",
            description:
              "Anchored all LLM temporal reasoning to the current server timestamp, with support for flexible ISO-8601 and natural language due dates.",
          },
        ],
      },
    ],
    highlight: {
      title: "Sub-50ms Instant Barge-In",
      description:
        "Local VAD detects user voice on the edge in Rust without waiting for cloud speech-to-text roundtrips, aborting active playback and clearing the telephony buffer immediately.",
    },
  },
  {
    id: "2026-09-17-low-latency-telephony-pipeline",
    date: "2026-09-17",
    formattedDate: "Sep 17, 2026",
    version: "v0.3.0",
    title: "Pipelined Streaming Telephony & Endpointing Optimization",
    summary:
      "Overhauled end-to-end telephony latency with AssemblyAI STT silence calibration, TCP_NODELAY connection pooling, Core-to-Bridge SSE streaming, and sentence-level pipelined Sarvam TTS synthesis.",
    subsystems: ["vox-bridge", "vox-core"],
    category: "voice",
    tags: ["STT Tuning", "Sarvam TTS", "TCP_NODELAY", "Endpointing", "Latency", "Greetings"],
    metrics: {
      label: "STT Endpointing Silence",
      value: "200ms",
    },
    features: [
      {
        category: "Audio Streaming & Networking",
        items: [
          {
            title: "AssemblyAI STT Endpointing Latency Tuning",
            description:
              "Reduced silence threshold to 200ms with dynamic speech thresholds, accelerating final transcript emission.",
          },
          {
            title: "TCP_NODELAY Connection Pooling",
            description:
              "Disabled Nagle's algorithm across HTTP and WebSocket connection pools, eliminating packet coalescing latency on media channels.",
          },
          {
            title: "Pipelined Sentence-Level Sarvam TTS",
            description:
              "Grammatical sentence chunking synthesizes audio incrementally as tokens stream in, overlapping LLM generation with audio streaming.",
          },
          {
            title: "Personalized Call Opening Fast-Path",
            description:
              "Instant caller greeting generated from Redis cache-aside user profiles without waiting for full LLM cognitive deliberation.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-09-16-autonomous-tasks-cross-channel",
    date: "2026-09-16",
    formattedDate: "Sep 16, 2026",
    version: "v0.2.0",
    title: "Autonomous Task Executor & Cross-Channel Identity Linking",
    summary:
      "Introduced background cron task execution, automated WhatsApp sweeper, autonomous outbound calling, cross-channel phone and WhatsApp identity resolution, and 10+ core database agent tools.",
    subsystems: ["vox-core", "vox-bridge"],
    category: "core",
    tags: ["Autonomous Tasks", "WhatsApp", "Cross-Channel", "Outbound Calls", "Database Tools"],
    metrics: {
      label: "Core Agent Tools",
      value: "10+ Tools",
    },
    features: [
      {
        category: "Autonomous Capabilities",
        items: [
          {
            title: "Autonomous Background Task Executor",
            description:
              "Continuous scheduler monitoring pending schedules, reminders, and follow-ups with Postgres-backed lease management.",
          },
          {
            title: "WhatsApp Sweeper & Profile Extraction",
            description:
              "Integrated Meta WhatsApp webhook with automatic profile name extraction and conversational triage.",
          },
          {
            title: "Autonomous Outbound Call Tool",
            description:
              "Enabled the AI agent to proactively place phone calls to users or external contacts to deliver urgent briefings or verify tasks.",
          },
          {
            title: "Cross-Channel Identity Linking",
            description:
              "Unified caller identity across phone calls and WhatsApp messages into a single user memory graph.",
          },
        ],
      },
      {
        category: "Agent Tooling",
        items: [
          {
            title: "Comprehensive Database Agent Tools",
            description:
              "Direct SQL-backed agent capabilities for calendar events, structured notes, task commitments, expenses, and proactive reminders.",
          },
          {
            title: "Supabase Consolidated Schema",
            description:
              "Consolidated database migration script unifying user profiles, conversation histories, voiceprints, schedules, and agent actions.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-09-15-admin-workspace-infrastructure",
    date: "2026-09-15",
    formattedDate: "Sep 15, 2026",
    version: "v0.1.5",
    title: "Admin Workspace Migration & Production Infrastructure",
    summary:
      "Migrated web console to Next.js 16 with React 19 and Tailwind CSS v4, implemented secure Google OAuth administration with Redis key inspection, and containerized Caddy reverse proxy.",
    subsystems: ["vox-web", "vox-deploy", "vox-core"],
    category: "web",
    tags: ["Next.js 16", "React 19", "Tailwind v4", "Admin Console", "Redis Explorer", "Caddy"],
    metrics: {
      label: "Admin Inspection Window",
      value: "Bounded O(N)",
    },
    features: [
      {
        category: "Web & Administration",
        items: [
          {
            title: "Next.js 16 App Directory & React 19",
            description:
              "Re-architected the frontend platform using Next.js 16 with Turbopack, React 19 Server Components, and zero-runtime Tailwind CSS v4.",
          },
          {
            title: "Secured Admin Workspace & Google OAuth",
            description:
              "Superuser authentication with email allowlisting, encrypted 8-hour HTTP-only session cookies, and safe callback redirection.",
          },
          {
            title: "Live Bounded Redis State Explorer",
            description:
              "Administrative inspection interface for Redis session keys, user profiles, verification states, and memory caches without memory blowup.",
          },
        ],
      },
      {
        category: "Infrastructure & Security",
        items: [
          {
            title: "Dockerized Caddy Reverse Proxy",
            description:
              "Containerized Caddy proxy with automated Let's Encrypt TLS provisioning and WebSocket streaming reverse proxying.",
          },
          {
            title: "Supabase Row-Level Security (RLS)",
            description:
              "Applied strict PostgreSQL schema definitions with row-level policies protecting user transcripts and voice data.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-09-14-ci-cd-release-orchestration",
    date: "2026-09-14",
    formattedDate: "Sep 14, 2026",
    version: "v0.1.0",
    title: "Centralized Release Orchestration & Multi-Arch CI/CD",
    summary:
      "Automated multi-repository CI/CD release pipelines for Vox Core and Vox Bridge, publishing container images to GitHub Container Registry and orchestrating production deployments.",
    subsystems: ["vox-deploy", "vox-core", "vox-bridge"],
    category: "infra",
    tags: ["CI/CD", "Docker", "GHCR", "Musl Rust", "Deploy Orchestrator"],
    metrics: {
      label: "Deployment Pipeline",
      value: "Zero-Downtime",
    },
    features: [
      {
        category: "DevOps & Deployment",
        items: [
          {
            title: "Centralized Container Publication",
            description:
              "GitHub Actions workflow building multi-architecture Docker images with statically linked Rust musl binaries.",
          },
          {
            title: "Vox Deploy Orchestrator Hand-off",
            description:
              "Automated release hand-off delivering updated containers to production nodes with automated health check rollbacks.",
          },
          {
            title: "Service Token Secret Provisioning",
            description:
              "Automated generation and distribution of internal Core service tokens between telephony gateway and cognitive workers.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-09-13-distributed-runtime-twilio-bridge",
    date: "2026-09-13",
    formattedDate: "Sep 13, 2026",
    version: "v0.0.5",
    title: "Distributed Core Runtime & Twilio Voice Gateway",
    summary:
      "Built the initial high-throughput Rust telephony bridge for Twilio Media Streams, implemented durable job leasing with PostgreSQL row locks, and configured speech-ready prompting.",
    subsystems: ["vox-bridge", "vox-core"],
    category: "voice",
    tags: ["Twilio Gateway", "Rust WebSocket", "Durable Leases", "Speech Prompting"],
    metrics: {
      label: "Telephony Protocol",
      value: "G.711 8kHz",
    },
    features: [
      {
        category: "Telephony & Core Systems",
        items: [
          {
            title: "Twilio Media Streams Bridge in Rust",
            description:
              "High-throughput WebSocket microservice handling bidirectional G.711 mu-law 8kHz audio streams with mark-based playback coordination.",
          },
          {
            title: "Durable Job Leases with PostgreSQL",
            description:
              "Atomic database leases ensuring idempotent task processing and preventing concurrent worker race conditions.",
          },
          {
            title: "Speech-Ready Agent Persona Prompting",
            description:
              "Tailored conversation instructions producing clean, direct spoken responses without markdown or unpronounceable characters.",
          },
          {
            title: "Redis Ephemeral Context Caching",
            description:
              "Sub-millisecond access to active call states, prompt buffers, and caller parameters.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-09-07-inception-design-language",
    date: "2026-09-07",
    formattedDate: "Sep 07, 2026",
    version: "v0.0.1",
    title: "Project Inception & Design Language",
    summary:
      "Established the core vision of Vox as a voice-first chief of staff, designed the high-contrast monochrome design language, and launched the public interactive demonstration.",
    subsystems: ["vox-web"],
    category: "web",
    tags: ["Inception", "Brand", "Design System", "Interactive Demo", "Tailwind v4"],
    metrics: {
      label: "Platform Inception",
      value: "Day 1",
    },
    features: [
      {
        category: "Brand & Foundation",
        items: [
          {
            title: "The Vox Mission",
            description:
              "Conceived 'Your chief of staff, on speed dial. Less screen time. More human.' To replace visual clutter with voice intelligence.",
          },
          {
            title: "Design System Foundations",
            description:
              "Engineered high-contrast monochrome tokens, Manrope typography, Space Grotesk controls, and signal ring artwork.",
          },
          {
            title: "Interactive Voice Scenario Demo",
            description:
              "Created realistic spoken dialogue demonstrations exploring agenda organization, commitments, and daily coordination.",
          },
        ],
      },
    ],
  },
];
