import type {
  PipelineStage,
  PipelineNode,
  PipelineEdge,
  TraceScenario,
} from "./types";

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "stage-0",
    number: 0,
    title: "Client Ingress & Streams",
    subtitle: "Telephony & Desktop Apps",
    description:
      "Inbound call validation, native desktop client connection, PKCE OAuth, and bi-directional WebSocket audio channels.",
    badge: "01 / Ingress",
    color: "#4f46e5",
    bounds: { x: 50, y: 50, width: 330, height: 1040 },
  },
  {
    id: "stage-1",
    number: 1,
    title: "Acoustic Ingress & STT",
    subtitle: "Streaming Speech-to-Text",
    description:
      "VAD framing, circular biometric accumulation, and real-time partial/final transcription for both phone and desktop audio.",
    badge: "02 / STT",
    color: "#06b6d4",
    bounds: { x: 440, y: 50, width: 330, height: 1040 },
  },
  {
    id: "stage-2",
    number: 2,
    title: "Identity & Cache",
    subtitle: "Redis & Auth Resolution",
    description:
      "100ms strict deadline caller resolution, instant personalized greeting decider, and desktop session ticket negotiation.",
    badge: "03 / Identity",
    color: "#4338ca",
    bounds: { x: 830, y: 50, width: 330, height: 1040 },
  },
  {
    id: "stage-3",
    number: 3,
    title: "Turn Intelligence (Jev AI)",
    subtitle: "System One Decisions & Prefetch",
    description:
      "Sub-100ms structured decision engine: dynamic settling, barge-in arbitration, contextual fillers, and speculative routing.",
    badge: "04 / Jev AI",
    color: "#7c3aed",
    bounds: { x: 1220, y: 50, width: 660, height: 1040 },
  },
  {
    id: "stage-4",
    number: 4,
    title: "Vox Core Engine & Workers",
    subtitle: "Dual-Process Runtime",
    description:
      "Context assembly, Rig SSE token streaming from Gemini, PostgreSQL authoritative state, and vox-core-worker background daemon.",
    badge: "05 / Core",
    color: "#10b981",
    bounds: { x: 1940, y: 50, width: 660, height: 1040 },
  },
  {
    id: "stage-5",
    number: 5,
    title: "Chunker & TTS Engine",
    subtitle: "Audio Synthesis",
    description:
      "Punctuation streaming boundaries, leading filler stripping, and low-latency ElevenLabs/Sarvam TTS chunking.",
    badge: "06 / TTS",
    color: "#6366f1",
    bounds: { x: 2660, y: 50, width: 340, height: 1040 },
  },
  {
    id: "stage-6",
    number: 6,
    title: "Audio Egress & Sync",
    subtitle: "Telephony & Desktop Egress",
    description:
      "Linear PCM to 8kHz μ-law transcoding for Twilio, Mark event synchronization, and high-fidelity desktop PCM streaming.",
    badge: "07 / Egress",
    color: "#4f46e5",
    bounds: { x: 3060, y: 50, width: 340, height: 500 },
  },
  {
    id: "stage-7",
    number: 7,
    title: "Post-Session Analytics",
    subtitle: "Jev CRM & Long-Term Memory",
    description:
      "Instant single-call outcome classification, CSAT scoring (1-5), and background long-term memory consolidation by workers.",
    badge: "08 / CRM & Jobs",
    color: "#7c3aed",
    bounds: { x: 3060, y: 580, width: 340, height: 510 },
  },
];

export const PIPELINE_NODES: PipelineNode[] = [
  // STAGE 0: Ingress
  {
    id: "twilio_webhook",
    stageId: "stage-0",
    subsystem: "telephony",
    title: "Twilio Inbound Webhook",
    subtitle: "POST /bridge/twilio/voice",
    description:
      "Validates X-Twilio-Signature with HMAC-SHA1 and emits TwiML with WebSocket connect URL.",
    latency: "< 15ms",
    latencyMs: 15,
    protocol: "HTTP / TwiML",
    icon: "Radio",
    x: 85,
    y: 130,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_call",
        name: "Inbound PSTN Call",
        type: "in",
        dataType: "SIP / PSTN",
      },
    ],
    outputs: [
      {
        id: "out_twiml",
        name: "TwiML Stream URL",
        type: "out",
        dataType: "XML",
      },
    ],
    details: {
      summary:
        "First point of contact for telephone calls. Validates Twilio cryptographic signature against TWILIO_AUTH_TOKEN to reject spoofed webhooks.",
      latencyBudget: "Budget: 25ms. Observed: 10-14ms.",
      empiricalSla: "HTTP 200 within 50ms to prevent carrier ringing timeouts.",
      codeReference: "vox-bridge/src/channels/twilio.rs",
      sourceFile: "src/channels/twilio.rs",
      codeSnippet: `pub fn validate_twilio_signature(
    auth_token: &str,
    url: &str,
    params: &[(String, String)],
    signature: &str,
) -> bool`,
      payloadSample: `<Response>
  <Connect>
    <Stream url="wss://vox.example.com/bridge/twilio/voice/stream" />
  </Connect>
</Response>`,
      fallbackStrategy:
        "Rejects with HTTP 403 Forbidden on invalid signature; logs security anomaly.",
      keyInvariants: [
        "Strict HMAC-SHA1 validation over sorted form parameters",
        "Deterministic TwiML XML response with stream attributes",
      ],
    },
  },
  {
    id: "twilio_ws",
    stageId: "stage-0",
    subsystem: "telephony",
    title: "Twilio Media Stream",
    subtitle: "Bi-directional WebSocket",
    description:
      "Streams 8000Hz μ-law 20ms frames in base64 JSON packets for ultra-low packet jitter.",
    latency: "< 2ms",
    latencyMs: 2,
    protocol: "WebSocket / μ-law",
    icon: "Network",
    x: 85,
    y: 350,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_ws",
        name: "Twilio WebSocket",
        type: "in",
        dataType: "JSON Frames",
      },
    ],
    outputs: [
      {
        id: "out_audio",
        name: "Raw μ-law Bytes",
        type: "out",
        dataType: "Bytes",
      },
      {
        id: "out_events",
        name: "Call Lifecycle",
        type: "out",
        dataType: "CallEvent",
      },
    ],
    details: {
      summary:
        "Maintains bi-directional streaming connection with Twilio Media Stream. Dispatches incoming frames to STT and receives synthesized outbound audio.",
      latencyBudget: "Budget: 5ms. Observed: 1.2ms per frame.",
      empiricalSla: "20ms audio frame chunks at 160 bytes per packet.",
      codeReference: "vox-bridge/src/channels/routes.rs",
      sourceFile: "src/channels/routes.rs",
      codeSnippet: `match event {
    Some(CallEvent::Audio(bytes)) => stt.send_audio(bytes).await,
    Some(CallEvent::PlaybackFinished(name)) => ...,
}`,
      payloadSample: `{\n  "event": "media",\n  "media": {\n    "payload": "////7v7//v8="\n  }\n}`,
      fallbackStrategy:
        "On unexpected WebSocket disconnect, gracefully aborts active turn and signals Core session termination.",
      keyInvariants: [
        "Must process 20ms packets without blocking async loop",
        "Handles Twilio 'mark' events for precise playback tracking",
      ],
    },
  },
  {
    id: "desktop_app",
    stageId: "stage-0",
    subsystem: "desktop",
    title: "Vox Desktop Client",
    subtitle: "Tauri v2 + Rust / Dioxus",
    description:
      "Native cross-platform client with CPAL audio engine, 20ms mic frames, and deep-linked PKCE OAuth.",
    latency: "< 5ms",
    latencyMs: 5,
    protocol: "Native CPAL / CoreAudio",
    icon: "Monitor",
    x: 85,
    y: 570,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_mic",
        name: "Microphone Audio",
        type: "in",
        dataType: "PCM 16k/48k",
      },
      {
        id: "in_auth",
        name: "OAuth Deep Link",
        type: "in",
        dataType: "vox://auth/callback",
      },
    ],
    outputs: [
      {
        id: "out_pcm",
        name: "20ms Audio Frames",
        type: "out",
        dataType: "PCM Chunks",
      },
      {
        id: "out_auth_req",
        name: "Auth Exchange",
        type: "out",
        dataType: "PKCE Tokens",
      },
    ],
    details: {
      summary:
        "Native voice client built in Rust with Tauri v2 and Dioxus. Handles microphone capture via CPAL, buffers into 20ms chunks, manages deep-linked PKCE authentication via vox://auth/callback, and plays responses through native speakers.",
      latencyBudget: "Budget: 10ms. Observed: 3.5ms capture-to-socket latency.",
      empiricalSla: "Seamless native desktop integration with zero port bindings.",
      codeReference: "vox-desktop/src-tauri/src/audio.rs",
      sourceFile: "vox-desktop/src-tauri/src/audio.rs",
      codeSnippet: `pub fn start_audio_capture(
    producer: ringbuf::Producer<i16>,
    device: &cpal::Device,
) -> Result<cpal::Stream, AudioError>`,
      payloadSample: `{\n  "client": "vox-desktop-macos",\n  "version": "0.1.0",\n  "sample_rate": 16000,\n  "channels": 1\n}`,
      fallbackStrategy:
        "Falls back to system default audio input device if designated microphone is disconnected.",
      keyInvariants: [
        "Uses OS custom URL scheme vox://auth/callback with PKCE",
        "Tokens securely preserved in native OS Keychain",
      ],
    },
  },
  {
    id: "desktop_ws",
    stageId: "stage-0",
    subsystem: "desktop",
    title: "Desktop WebSocket Channel",
    subtitle: "/bridge/desktop/voice/stream",
    description:
      "Bi-directional stream for Desktop client with short-lived ticket auth, 20ms frames, and control events.",
    latency: "< 2ms",
    latencyMs: 2,
    protocol: "WebSocket / PCM + JSON",
    icon: "Network",
    x: 85,
    y: 800,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_desk_audio",
        name: "Desktop Audio Stream",
        type: "in",
        dataType: "PCM 20ms",
      },
      {
        id: "in_desk_ticket",
        name: "Session Ticket",
        type: "in",
        dataType: "Ticket String",
      },
    ],
    outputs: [
      {
        id: "out_pcm_audio",
        name: "Raw PCM Bytes",
        type: "out",
        dataType: "Bytes",
      },
      {
        id: "out_playback",
        name: "Synthesized Playback",
        type: "out",
        dataType: "AudioStream",
      },
    ],
    details: {
      summary:
        "Dedicated WebSocket endpoint on vox-bridge for desktop voice streaming. Validates single-use session tickets issued by /bridge/desktop/sessions, streaming audio directly to the acoustic pipeline.",
      latencyBudget: "Budget: 5ms. Observed: 1.4ms per frame.",
      empiricalSla: "High-throughput binary streaming without transcoding overhead.",
      codeReference: "vox-bridge/src/channels/desktop/stream.rs",
      sourceFile: "src/channels/desktop/stream.rs",
      codeSnippet: `pub async fn desktop_stream_handler(
    Query(params): Query<DesktopStreamParams>,
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> Response`,
      payloadSample: `{\n  "type": "Start",\n  "conversation_id": "desktop-conv-8f2a"\n}`,
      fallbackStrategy:
        "Rejects replay or expired tickets with 401 Unauthorized; reconnects automatically from desktop client.",
      keyInvariants: [
        "Single-use cryptographic ticket prevents replay attacks",
        "Binary WebSocket frames for PCM; JSON for Start/Stop/Mark events",
      ],
    },
  },

  // STAGE 1: Acoustic Ingress & STT
  {
    id: "audio_buffer",
    stageId: "stage-1",
    subsystem: "bridge",
    title: "Acoustic Buffer & VAD",
    subtitle: "Voice Activity & Biometrics",
    description:
      "Continuous circular audio buffer for voice biometrics and SpeechStarted edge detection.",
    latency: "< 1ms",
    latencyMs: 1,
    protocol: "Memory Buffer",
    icon: "Mic",
    x: 475,
    y: 220,
    width: 270,
    height: 170,
    inputs: [
      { id: "in_raw", name: "μ-law / PCM Frames", type: "in", dataType: "Bytes" },
    ],
    outputs: [
      {
        id: "out_bio",
        name: "Biometric Sample",
        type: "out",
        dataType: "PCM 16k",
      },
      {
        id: "out_speech",
        name: "SpeechStarted Event",
        type: "out",
        dataType: "Event",
      },
    ],
    details: {
      summary:
        "Maintains a 3-second circular sliding window of incoming audio. Instantly flags SpeechStarted for barge-in checks and feeds WeSpeaker ResNet-34 neural voice biometrics verification.",
      latencyBudget: "Budget: 2ms. Observed: < 0.5ms in-memory.",
      empiricalSla:
        "Zero heap reallocations during steady-state audio ingestion.",
      codeReference: "vox-bridge/src/voice/session/mod.rs",
      sourceFile: "src/voice/session/mod.rs",
      codeSnippet: `speech_started_at.get_or_insert_with(std::time::Instant::now);
settle_at = None;`,
      payloadSample: `CircularBuffer { capacity: 48000, read_pos: 0, write_pos: 3200 }`,
      fallbackStrategy:
        "Overwrites oldest audio frames if circular capacity is exceeded.",
      keyInvariants: [
        "Biometric audio sample must remain pristine without clipping",
        "SpeechStarted signals candidate barge-in state to session loop",
      ],
    },
  },
  {
    id: "stt_stream",
    stageId: "stage-1",
    subsystem: "bridge",
    title: "Streaming STT Engine",
    subtitle: "AssemblyAI / Deepgram",
    description:
      "Transcribes live audio into real-time partials and finalized turn transcripts.",
    latency: "140 - 220ms",
    latencyMs: 180,
    protocol: "WebSocket / Protobuf",
    icon: "Zap",
    x: 475,
    y: 620,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_pcm",
        name: "Linear PCM / μ-law",
        type: "in",
        dataType: "AudioStream",
      },
    ],
    outputs: [
      {
        id: "out_partial",
        name: "Partial Transcript",
        type: "out",
        dataType: "String",
      },
      {
        id: "out_final",
        name: "Final Transcript",
        type: "out",
        dataType: "String",
      },
    ],
    details: {
      summary:
        "Streams audio continuously to AssemblyAI Realtime / Deepgram Nova-3. Emits word-by-word partial transcripts that feed speculative execution.",
      latencyBudget: "Budget: 250ms. Observed: 140-190ms median.",
      empiricalSla: "Emits partials every 80-120ms during continuous speech.",
      codeReference: "vox-bridge/src/providers/stt/assemblyai.rs",
      sourceFile: "src/providers/stt/assemblyai.rs",
      codeSnippet: `match parsed {
    SttMessage::Partial(text) => SttEvent::PartialTranscript(text),
    SttMessage::Final(text) => SttEvent::FinalTranscript(text),
}`,
      payloadSample: `{\n  "message_type": "PartialTranscript",\n  "text": "where is my package"\n}`,
      fallbackStrategy:
        "Automatic reconnect with exponential backoff on WebSocket disruption.",
      keyInvariants: [
        "Partials feed Jev intent routing before speaker finishes sentence",
        "Final transcript triggers turn settling timer",
      ],
    },
  },

  // STAGE 2: Identity & Cache
  {
    id: "redis_lookup",
    stageId: "stage-2",
    subsystem: "storage",
    title: "Redis Minimal User Cache",
    subtitle: "vox:user & vox:channel",
    description:
      "Minimal user records with 100ms deadline. Ensures first-turn greetings are never blocked.",
    latency: "< 4ms",
    latencyMs: 4,
    protocol: "RESP3 / TCP",
    icon: "Database",
    x: 865,
    y: 150,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_phone",
        name: "E.164 Phone Key",
        type: "in",
        dataType: "String",
      },
    ],
    outputs: [
      {
        id: "out_profile",
        name: "Caller Profile",
        type: "out",
        dataType: "JSON",
      },
    ],
    details: {
      summary:
        "Stores minimal per-user records (vox:user:{id} with name + channels, plus vox:channel:{channel}:{external_id} indexes). Runs with AOF persistence. Strict 100ms deadline fails open on cache miss.",
      latencyBudget: "Budget: 100ms. Observed: 2.1-4.5ms over local Redis network.",
      empiricalSla: "P99 under 10ms; fails open immediately to anonymous greeting.",
      codeReference: "vox-core/src/cache/mod.rs",
      sourceFile: "vox-core/src/cache/mod.rs",
      codeSnippet: `let key = format!("vox:channel:{}:{}", channel, external_id);
let user_id = tokio::time::timeout(Duration::from_millis(100), redis.get(&key)).await;`,
      payloadSample: `{\n  "id": "usr_9124",\n  "name": "Rahul",\n  "channels": ["twilio", "desktop"]\n}`,
      fallbackStrategy:
        "If Redis lookup times out at 100ms, seamlessly defaults to generic greeting path.",
      keyInvariants: [
        "100ms hard deadline: never stalls the inbound telephone greeting",
        "AOF persistent Redis with minimal keys to conserve memory",
      ],
    },
  },
  {
    id: "greeting_branch",
    stageId: "stage-2",
    subsystem: "bridge",
    title: "First-Turn Greeting Decider",
    subtitle: "Personalized vs Onboarding",
    description:
      "Dispatches personalized greeting or spawns async COMMAND_CREATE_USER onboarding task.",
    latency: "< 1ms",
    latencyMs: 1,
    protocol: "In-Memory Logic",
    icon: "Sparkles",
    x: 865,
    y: 470,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_lookup",
        name: "Lookup Result",
        type: "in",
        dataType: "Option<Profile>",
      },
    ],
    outputs: [
      {
        id: "out_greet",
        name: "Greeting Prompt",
        type: "out",
        dataType: "String",
      },
      {
        id: "out_create",
        name: "Async Create User",
        type: "out",
        dataType: "Tokio Task",
      },
    ],
    details: {
      summary:
        "If user profile is found, emits 'Hi Rahul, welcome back to Vox'. If absent, emits anonymous onboarding and spawns background user creation in Supabase.",
      latencyBudget: "Budget: 1ms. Instant evaluation.",
      empiricalSla: "Immediate first-sentence synthesis dispatched to TTS.",
      codeReference: "vox-bridge/src/voice/session/mod.rs",
      sourceFile: "src/voice/session/mod.rs",
      codeSnippet: `if let Some(instruction) = context.initiation_context.clone() {
    active_response = Some(spawn_response(1, context, instruction, ...));
}`,
      payloadSample: `"Hi Rahul, welcome back to Vox. How can I help you today?"`,
      fallbackStrategy:
        "Safe generic greeting fallback if profile serialization fails.",
      keyInvariants: [
        "First turn plays immediately upon SIP call connection",
        "Background user provisioning never blocks real-time audio playback",
      ],
    },
  },
  {
    id: "desktop_session_auth",
    stageId: "stage-2",
    subsystem: "bridge",
    title: "Desktop Ticket & Auth",
    subtitle: "POST /bridge/desktop/sessions",
    description:
      "Validates Supabase JWT, exchanges tokens with Core, and issues signed short-lived session ticket.",
    latency: "< 10ms",
    latencyMs: 10,
    protocol: "REST / Bearer JWT",
    icon: "Shield",
    x: 865,
    y: 770,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_jwt",
        name: "Supabase JWT",
        type: "in",
        dataType: "Bearer Token",
      },
    ],
    outputs: [
      {
        id: "out_ticket",
        name: "Signed Ticket",
        type: "out",
        dataType: "Ticket String",
      },
    ],
    details: {
      summary:
        "Validates Desktop client user tokens against Supabase JWT secret. Exchanges identity with Core /v1/auth/exchange and generates a single-use session ticket for the WebSocket channel.",
      latencyBudget: "Budget: 25ms. Observed: 8ms.",
      empiricalSla: "Ensures no secrets or master credentials are distributed to clients.",
      codeReference: "vox-bridge/src/channels/desktop/session.rs",
      sourceFile: "src/channels/desktop/session.rs",
      codeSnippet: `pub async fn create_desktop_session(
    State(state): State<AppState>,
    Json(payload): Json<CreateDesktopSessionRequest>,
) -> Result<Json<CreateDesktopSessionResponse>, BridgeError>`,
      payloadSample: `{\n  "ticket": "dsk_ticket_9a1f4...",\n  "stream_url": "/bridge/desktop/voice/stream?ticket=..."\n}`,
      fallbackStrategy:
        "Returns 401 Unauthorized on invalid JWT, triggering Desktop client PKCE re-auth.",
      keyInvariants: [
        "Tickets expire in 60 seconds if unredeemed",
        "Non-reusable ticket binding to user ID",
      ],
    },
  },

  // STAGE 3: Turn Intelligence (Jev AI)
  {
    id: "jev_settle",
    stageId: "stage-3",
    subsystem: "jev",
    title: "Dynamic Turn Settling",
    subtitle: "Jev System One (Noul)",
    description:
      "Evaluates thought completeness: complete thought settles in 160ms; trailing clause waits 1100ms.",
    latency: "60 - 90ms",
    latencyMs: 75,
    protocol: "POST /v1/systemone",
    icon: "Clock",
    x: 1255,
    y: 150,
    width: 275,
    height: 170,
    inputs: [
      {
        id: "in_trans",
        name: "Final Transcript",
        type: "in",
        dataType: "String",
      },
    ],
    outputs: [
      {
        id: "out_delay",
        name: "Settle Delay",
        type: "out",
        dataType: "Duration",
      },
    ],
    details: {
      summary:
        "Replaces brittle regex heuristics with TypeSafe Jev Noul question. Complete sentences settle at 160ms for snappy response; hesitations get 1100ms so caller isn't interrupted.",
      latencyBudget: "Budget: 120ms. Observed: 65-85ms roundtrip.",
      empiricalSla: "Parallel evaluation while audio silence timer starts.",
      codeReference: "vox-bridge/src/providers/jev.rs",
      sourceFile: "src/providers/jev.rs",
      codeSnippet: `pub async fn is_complete_thought(&self, transcript: &str) -> Result<f64, VoiceError> {
    let prob = parsed["answers"]["is_complete"]["noul"].as_f64().unwrap_or(0.5);
    Ok(prob)
}`,
      payloadSample: `{\n  "state": "What are your business hours today?",\n  "questions": {\n    "is_complete": { "type": "noul" }\n  }\n}`,
      fallbackStrategy:
        "Falls back to 350ms static default if Jev API is unreachable or times out.",
      keyInvariants: [
        "Noul >= 0.85 -> 160ms settle delay",
        "Noul < 0.35 -> 1100ms settle delay",
        "Numeric strings automatically assign 1200ms delay",
      ],
    },
  },
  {
    id: "jev_barge",
    stageId: "stage-3",
    subsystem: "jev",
    title: "Smart Barge-In & Backchannel",
    subtitle: "Jev Choice Primitive",
    description:
      "Arbitrates speaker onset: ignores 'uh-huh' / 'yeah', flushes audio only on true interruption.",
    latency: "60 - 90ms",
    latencyMs: 75,
    protocol: "POST /v1/systemone",
    icon: "Shield",
    x: 1255,
    y: 470,
    width: 275,
    height: 170,
    inputs: [
      {
        id: "in_inter",
        name: "Playback Speech",
        type: "in",
        dataType: "Partial String",
      },
    ],
    outputs: [
      {
        id: "out_action",
        name: "Action (Ignore/Flush)",
        type: "out",
        dataType: "Enum",
      },
    ],
    details: {
      summary:
        "Prevents conversational clipping. Evaluates the first 1-2 words of user speech during assistant playback. Backchannels (uh-huh, yeah, okay) are ignored so playback continues smoothly.",
      latencyBudget: "Budget: 100ms. Observed: 60-78ms.",
      empiricalSla:
        "Immediate audio flush on 'interrupt'; zero interruption on 'backchannel'.",
      codeReference: "vox-bridge/src/providers/jev.rs",
      sourceFile: "src/providers/jev.rs",
      codeSnippet: `pub async fn classify_barge_in(&self, utterance: &str) -> Result<String, VoiceError> {
    Ok(choice)
}`,
      payloadSample: `{\n  "state": "yeah okay",\n  "questions": {\n    "intent": { "type": "choice", "criteria": { "backchannel": "..." } }\n  }\n}`,
      fallbackStrategy:
        "Fast local regex dictionary (is_backchannel) filters standard words in 0ms; defaults to interrupt if ambiguous.",
      keyInvariants: [
        "True interruption sends Twilio/Desktop Clear + invalidates playback generation",
        "Backchannel preserves audio stream without stutter",
      ],
    },
  },
  {
    id: "jev_speculate",
    stageId: "stage-3",
    subsystem: "jev",
    title: "Predictive Speculation Router",
    subtitle: "Jev Intent & Fan-Out",
    description:
      "Evaluates partial transcripts >= 3 words. Dispatches background tool prefetch before user finishes.",
    latency: "60 - 95ms",
    latencyMs: 80,
    protocol: "POST /v1/systemone",
    icon: "GitFork",
    x: 1255,
    y: 770,
    width: 275,
    height: 170,
    inputs: [
      {
        id: "in_partial",
        name: "Early Partial",
        type: "in",
        dataType: "String",
      },
    ],
    outputs: [
      {
        id: "out_domain",
        name: "Predicted Intent",
        type: "out",
        dataType: "SpeculativeIntent",
      },
    ],
    details: {
      summary:
        "Monitors streaming partials. When caller reaches >= 3 words, Jev determines if a database lookup or API retrieval is required, triggering speculative execution.",
      latencyBudget: "Budget: 120ms. Fires concurrently with human speech.",
      empiricalSla: "Finishes 200-400ms before user finishes their sentence.",
      codeReference: "vox-bridge/src/voice/session/speculation.rs",
      sourceFile: "src/voice/session/speculation.rs",
      codeSnippet: `let intent = jev.evaluate_speculative_intent(&text).await?;
if intent.requires_lookup {
    tracing::info!(domain = %intent.intent, "VOICE_SPECULATIVE_PREFETCH_TRIGGERED");
}`,
      payloadSample: `{\n  "requires_lookup": true,\n  "intent": "order_lookup"\n}`,
      fallbackStrategy:
        "Bypasses prefetch on error; normal turn assembly continues unimpeded.",
      keyInvariants: [
        "Only triggers for queries requiring data lookup (saves tokens & DB connections)",
        "Passes predicted domain into speculative call context",
      ],
    },
  },
  {
    id: "jev_filler",
    stageId: "stage-3",
    subsystem: "jev",
    title: "Contextual Filler Engine",
    subtitle: "Pre-warmed RAM Audio",
    description:
      "Jev selects tailored filler on 400ms LookupPending. Streams from RAM with 0ms TTS delay.",
    latency: "< 1ms (RAM)",
    latencyMs: 1,
    protocol: "In-Memory PCM Cache",
    icon: "Volume2",
    x: 1575,
    y: 470,
    width: 275,
    height: 170,
    inputs: [
      {
        id: "in_lookup",
        name: "LookupPending Event",
        type: "in",
        dataType: "Event",
      },
    ],
    outputs: [
      {
        id: "out_filler",
        name: "Pre-synthesized Audio",
        type: "out",
        dataType: "μ-law / PCM Bytes",
      },
    ],
    details: {
      summary:
        "All candidate filler phrases are pre-synthesized into RAM at boot. When Jev selects the phrase, audio is streamed to telephony or desktop in < 1ms with 0 TTS latency.",
      latencyBudget: "Budget: 400ms watchdog deadline. Audio start: < 1ms.",
      empiricalSla:
        "Zero dead air when external database queries exceed 400ms.",
      codeReference: "vox-bridge/src/voice/filler.rs",
      sourceFile: "src/voice/filler.rs",
      codeSnippet: `pub async fn play_filler(...) {
    if let Some(cached) = FILLER_CACHE.read().await.get(phrase) {
        output.send(CallCommand::Media(cached.clone())).await;
    }
}`,
      payloadSample: `"Let me check on that for you."`,
      fallbackStrategy:
        "Defaults instantly to 'I'm looking into that.' if Jev evaluation is still in flight.",
      keyInvariants: [
        "Pre-warmed at server boot (0ms synthesis delay)",
        "Leading acknowledgment stripped from subsequent LLM response",
      ],
    },
  },
  {
    id: "spec_tasks",
    stageId: "stage-3",
    subsystem: "storage",
    title: "Speculative Async Workers",
    subtitle: "Web Search / Supabase DB",
    description:
      "Non-blocking background Tokio tasks retrieving orders, inventory, or search results in parallel.",
    latency: "150 - 350ms",
    latencyMs: 250,
    protocol: "PostgreSQL / REST",
    icon: "Search",
    x: 1575,
    y: 770,
    width: 275,
    height: 170,
    inputs: [
      {
        id: "in_trig",
        name: "Speculative Trigger",
        type: "in",
        dataType: "Intent",
      },
    ],
    outputs: [
      {
        id: "out_res",
        name: "Cached Data Result",
        type: "out",
        dataType: "ToolResult",
      },
    ],
    details: {
      summary:
        "Executes in background while the caller is still vocalizing their request. Results are cached and immediately available when Core builds the final generation prompt.",
      latencyBudget:
        "Budget: 400ms. Overlaps 100% with human acoustic delivery.",
      empiricalSla: "Shaves 300-500ms off total end-to-end turnaround.",
      codeReference: "vox-core/agent/tools.py",
      sourceFile: "vox-core/agent/tools.py",
      codeSnippet: `async def prefetch_domain_data(domain: str, query: str):
    if domain == "order_lookup":
        return await supabase.orders.select().eq("id", order_id)`,
      payloadSample: `{\n  "order_id": "4912",\n  "status": "Out for delivery",\n  "carrier": "FedEx",\n  "eta": "Today by 4:00 PM"\n}`,
      fallbackStrategy:
        "If prefetch fails or runs past deadline, Core LLM performs standard tool call as fallback.",
      keyInvariants: [
        "Zero latency penalty on conversational path",
        "Results cached in local session context",
      ],
    },
  },

  // STAGE 4: Vox Core Engine & Workers
  {
    id: "core_prompt",
    stageId: "stage-4",
    subsystem: "core",
    title: "Context & Prompt Assembly",
    subtitle: "History + Injected Prefetch",
    description:
      "Merges conversation history, caller metadata, and speculative prefetch results into LLM prompt.",
    latency: "< 3ms",
    latencyMs: 3,
    protocol: "In-Memory Struct",
    icon: "FileText",
    x: 1975,
    y: 150,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_turn",
        name: "Settled Turn",
        type: "in",
        dataType: "DraftTurn",
      },
      {
        id: "in_pre",
        name: "Prefetched Data",
        type: "in",
        dataType: "Option<Data>",
      },
    ],
    outputs: [
      {
        id: "out_prompt",
        name: "Unified Prompt",
        type: "out",
        dataType: "LLMPrompt",
      },
    ],
    details: {
      summary:
        "Constructs the full system instructions, user message, short-term history, and seamlessly injects the pre-fetched data from speculative workers.",
      latencyBudget: "Budget: 5ms. Observed: 1.8ms.",
      empiricalSla:
        "Ensures model receives fresh external state without an in-flight tool hop.",
      codeReference: "vox-core/agent/prompt.py",
      sourceFile: "vox-core/agent/prompt.py",
      codeSnippet: `prompt = PromptBuilder(history=history)
if prefetched_data:
    prompt.inject_context(prefetched_data)
return prompt.build()`,
      payloadSample: `{\n  "system": "You are Vox, executive chief of staff.",\n  "injected_data": { "order_status": "Out for delivery" },\n  "turn": "Where is my package?"\n}`,
      fallbackStrategy:
        "Assembles prompt without prefetched context if background worker timed out.",
      keyInvariants: [
        "Deterministic context order and truncation",
        "Includes timestamped host assertion token for verification",
      ],
    },
  },
  {
    id: "core_llm",
    stageId: "stage-4",
    subsystem: "core",
    title: "Core Agent Engine (vox-core-api)",
    subtitle: "Rig SSE Streaming (Gemini)",
    description:
      "Authenticated API service streaming tokens via Rig SSE and emitting LookupPending events.",
    latency: "120 - 240ms (TTFT)",
    latencyMs: 180,
    protocol: "SSE / Rig",
    icon: "Bot",
    x: 1975,
    y: 470,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_prompt",
        name: "Unified Prompt",
        type: "in",
        dataType: "Prompt",
      },
    ],
    outputs: [
      {
        id: "out_events",
        name: "LookupPending Event",
        type: "out",
        dataType: "Event",
      },
      {
        id: "out_tokens",
        name: "Streaming Token Chunks",
        type: "out",
        dataType: "Text Stream",
      },
    ],
    details: {
      summary:
        "vox-core-api handles authenticated Bridge requests with host assertions. Streams tokens via SSE and emits LookupPending events to trigger low-latency audio fillers.",
      latencyBudget: "Budget: 250ms TTFT. Observed: 140-190ms.",
      empiricalSla: "High-throughput token streaming (> 90 tokens/sec).",
      codeReference: "vox-bridge/src/core/mod.rs",
      sourceFile: "src/core/mod.rs",
      codeSnippet: `match event {
    ConversationEvent::LookupPending => arm_filler_deadline(),
    ConversationEvent::Text(token) => chunker.push(&token),
}`,
      payloadSample: `event: LookupPending\nevent: Text\ndata: "Your package is currently with FedEx..."`,
      fallbackStrategy:
        "Retries stream or emits friendly conversational apology on provider 5xx.",
      keyInvariants: [
        "First token arrives in < 250ms",
        "LookupPending emitted on first tool initiation",
      ],
    },
  },
  {
    id: "jev_urgency",
    stageId: "stage-4",
    subsystem: "jev",
    title: "Caller Urgency Scorer",
    subtitle: "Jev Score Primitive (1-5)",
    description:
      "Analyzes caller emotion and urgency: score >= 3.5 adapts TTS speech rate and concise phrasing.",
    latency: "60 - 90ms",
    latencyMs: 75,
    protocol: "POST /v1/systemone",
    icon: "Activity",
    x: 1975,
    y: 770,
    width: 270,
    height: 170,
    inputs: [
      { id: "in_text", name: "Customer Turn", type: "in", dataType: "String" },
    ],
    outputs: [
      {
        id: "out_pace",
        name: "Urgency Score (1-5)",
        type: "out",
        dataType: "f64",
      },
    ],
    details: {
      summary:
        "Runs in parallel during the turn. High caller stress (score >= 3.5) signals the pipeline to increase TTS pace to 1.15x and instruct the LLM to be crisp and direct.",
      latencyBudget: "Budget: 100ms. Non-blocking parallel execution.",
      empiricalSla: "Zero delay impact on initial audio playback.",
      codeReference: "vox-bridge/src/voice/session/response.rs",
      sourceFile: "src/voice/session/response.rs",
      codeSnippet: `let score = jev.score_urgency(&text).await?;
if score >= 3.5 {
    tracing::info!(turn = number, urgency = score, "VOICE_CALLER_URGENCY_HIGH");
}`,
      payloadSample: `{\n  "state": "My card was compromised! Stop all charges!",\n  "questions": {\n    "urgency": { "type": "score", "score": 4.8 }\n  }\n}`,
      fallbackStrategy:
        "Defaults to standard neutral urgency score (1.0) on error.",
      keyInvariants: [
        "Calibrated 1-5 scale against descriptive criteria",
        "Triggers adaptive voice parameters",
      ],
    },
  },
  {
    id: "core_postgres",
    stageId: "stage-4",
    subsystem: "storage",
    title: "Authoritative PostgreSQL DB",
    subtitle: "Conversations, Context & Jobs",
    description:
      "Supabase PostgreSQL storing agents, conversations, turns, schedules, and durable task queue.",
    latency: "< 8ms",
    latencyMs: 8,
    protocol: "PostgreSQL 16 / SQLx",
    icon: "Database",
    x: 2300,
    y: 180,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_pg_write",
        name: "State & Turns",
        type: "in",
        dataType: "SQL Transactions",
      },
    ],
    outputs: [
      {
        id: "out_pg_jobs",
        name: "Durable Job Queue",
        type: "out",
        dataType: "Job Rows",
      },
    ],
    details: {
      summary:
        "PostgreSQL is authoritative across all services. Stores conversation history, agents, durable events, schedules, summaries, and pending job leases. All writes commit here before worker execution.",
      latencyBudget: "Budget: 15ms. Observed: 4-8ms query execution.",
      empiricalSla: "Full ACID durability; row-level locking for multi-instance safety.",
      codeReference: "vox-core/supabase_schema.sql",
      sourceFile: "vox-core/supabase_schema.sql",
      codeSnippet: `CREATE TABLE vox_jobs (
    id UUID PRIMARY KEY,
    job_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    leased_until TIMESTAMPTZ
);`,
      payloadSample: `{\n  "job_id": "job_01j4k...",\n  "type": "summarize_conversation",\n  "status": "pending",\n  "lease_owner": "worker-1"\n}`,
      fallbackStrategy:
        "Automatic retries with connection pool fallback on transient database spikes.",
      keyInvariants: [
        "Authoritative single source of truth for user state",
        "Provides durable job queue without requiring external message brokers",
      ],
    },
  },
  {
    id: "core_worker",
    stageId: "stage-4",
    subsystem: "worker",
    title: "vox-core-worker Daemon",
    subtitle: "Durable Job Leases (30s loop)",
    description:
      "Background daemon process leasing jobs via FOR UPDATE SKIP LOCKED, advancing schedules and dispatching actions.",
    latency: "30s loop",
    latencyMs: 30000,
    protocol: "FOR UPDATE SKIP LOCKED",
    icon: "Cpu",
    x: 2300,
    y: 580,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_jobs",
        name: "Postgres Job Lease",
        type: "in",
        dataType: "Row Leases",
      },
    ],
    outputs: [
      {
        id: "out_actions",
        name: "Dispatched Actions",
        type: "out",
        dataType: "Webhooks / Summaries",
      },
    ],
    details: {
      summary:
        "Autonomous worker daemon running alongside vox-core-api. Polling on a 30s interval, it leases durable jobs with row-level locks, advances recurring user schedules, summarizes finished calls, and dispatches external tool actions.",
      latencyBudget: "30s polling cycle; jobs execute within 200ms of pickup.",
      empiricalSla: "At-least-once execution with automatic lease reclamation.",
      codeReference: "vox-core/src/workers/mod.rs",
      sourceFile: "vox-core/src/workers/mod.rs",
      codeSnippet: `pub async fn lease_and_process_jobs(pool: &PgPool) -> Result<()> {
    let jobs = fetch_pending_jobs(pool, Duration::from_secs(30)).await?;
    for job in jobs { dispatch(job).await?; }
    Ok(())
}`,
      payloadSample: `{\n  "action": "dispatch_calendar_event",\n  "target": "google_calendar",\n  "scheduled_for": "2026-09-24T15:00:00Z"\n}`,
      fallbackStrategy:
        "Expired leases are reclaimed automatically by sibling workers if an instance crashes.",
      keyInvariants: [
        "Uses FOR UPDATE SKIP LOCKED to prevent duplicate execution across replicas",
        "Decoupled from user voice path so heavy work never causes audio jitter",
      ],
    },
  },

  // STAGE 5: Chunker & TTS Engine
  {
    id: "sentence_chunker",
    stageId: "stage-5",
    subsystem: "bridge",
    title: "Sentence & Clause Chunker",
    subtitle: "Punctuation Boundaries",
    description:
      "Splits token stream at punctuation (. ? ! ,) and 14-word clauses; strips leading acknowledgments.",
    latency: "< 1ms",
    latencyMs: 1,
    protocol: "In-Memory Stream",
    icon: "Sliders",
    x: 2700,
    y: 220,
    width: 270,
    height: 170,
    inputs: [
      { id: "in_tok", name: "Token Stream", type: "in", dataType: "String" },
    ],
    outputs: [
      {
        id: "out_sent",
        name: "Synthesizable Sentences",
        type: "out",
        dataType: "String",
      },
    ],
    details: {
      summary:
        "Accumulates incoming tokens until a natural breath boundary is hit. Also strips redundant acknowledgment phrases if a filler already played.",
      latencyBudget: "Budget: 1ms. Sub-millisecond string slicing.",
      empiricalSla: "First sentence synthesized after only 4-8 tokens.",
      codeReference: "vox-bridge/src/voice/chunker.rs",
      sourceFile: "src/voice/chunker.rs",
      codeSnippet: `let sentences = chunker.push(&chunk);
for sentence in sentences {
    if filler_played { trimmed = strip_leading_ack(trimmed); }
    play_sentence(trimmed, ...).await?;
}`,
      payloadSample: `"Your package is out for delivery with FedEx and will arrive today by 4 PM."`,
      fallbackStrategy:
        "Flushes remaining tokens immediately on LLM stream EOF.",
      keyInvariants: [
        "Protects abbreviations (Dr., Inc., e.g., i.e.) from false splits",
        "Splits long clauses (>14 words) at commas for fast TTFB",
      ],
    },
  },
  {
    id: "tts_streaming",
    stageId: "stage-5",
    subsystem: "tts",
    title: "Streaming TTS Engine",
    subtitle: "ElevenLabs / Sarvam / Cartesia",
    description:
      "Synthesizes sentence chunks into high-fidelity streaming audio chunks with sub-100ms TTFB.",
    latency: "60 - 120ms (TTFB)",
    latencyMs: 90,
    protocol: "WebSocket / HTTP Chunked",
    icon: "Volume2",
    x: 2700,
    y: 580,
    width: 270,
    height: 170,
    inputs: [
      { id: "in_txt", name: "Sentence Text", type: "in", dataType: "String" },
    ],
    outputs: [
      {
        id: "out_pcm",
        name: "Linear PCM Audio Chunks",
        type: "out",
        dataType: "AudioStream",
      },
    ],
    details: {
      summary:
        "Converts text sentences to audio with ultra-low first-byte latency. First chunk arrives in ~80ms and streams continuously to both telephony and desktop egress.",
      latencyBudget: "Budget: 120ms TTFB. Observed: 70-95ms.",
      empiricalSla:
        "Overlaps TTS synthesis of sentence N+1 with playback of sentence N.",
      codeReference: "vox-bridge/src/providers/tts/mod.rs",
      sourceFile: "src/providers/tts/mod.rs",
      codeSnippet: `let mut audio = tts.synthesize(text).await?;
while let Some(chunk) = audio.next().await {
    output.send(CallCommand::Media(chunk?)).await?;
}`,
      payloadSample: `AudioStreamChunk { bytes: 640, format: "pcm_16000", duration_ms: 20 }`,
      fallbackStrategy:
        "Falls back to Sarvam or Cartesia provider if primary provider hits rate limit.",
      keyInvariants: [
        "Sets audio_playing = true on first byte",
        "Pipes audio chunks immediately to telephony and desktop channels",
      ],
    },
  },

  // STAGE 6: Audio Egress & Sync
  {
    id: "audio_egress",
    stageId: "stage-6",
    subsystem: "telephony",
    title: "Telephony Egress & Transcoder",
    subtitle: "8kHz μ-law & Mark Sync",
    description:
      "Downsamples to 8kHz μ-law, wraps in Twilio base64 media frames, and sends Mark events.",
    latency: "< 2ms",
    latencyMs: 2,
    protocol: "WebSocket Frame",
    icon: "Network",
    x: 3100,
    y: 120,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_pcm_stream",
        name: "Audio Chunks",
        type: "in",
        dataType: "AudioStream",
      },
    ],
    outputs: [
      {
        id: "out_tw_frames",
        name: "Twilio Media Frames",
        type: "out",
        dataType: "JSON",
      },
      { id: "out_tw_mark", name: "Mark Events", type: "out", dataType: "JSON" },
    ],
    details: {
      summary:
        "Converts synthesized audio to 8000Hz G.711 μ-law. Transmits 20ms frames to Twilio and injects 'Mark' packets to track exactly when telephony playback completes.",
      latencyBudget: "Budget: 3ms. Observed: 1.1ms per frame.",
      empiricalSla:
        "Strict pacing to prevent buffer underrun or audio stutter over PSTN.",
      codeReference: "vox-bridge/src/voice/mp3.rs",
      sourceFile: "src/voice/mp3.rs",
      codeSnippet: `output.send(CallCommand::Media(chunk_bytes)).await?;
output.send(CallCommand::Mark(format!("response-{number}"))).await?;`,
      payloadSample: `{\n  "event": "mark",\n  "streamSid": "MZ123",\n  "mark": { "name": "response-1" }\n}`,
      fallbackStrategy:
        "Drops stale packets if Twilio backpressure exceeds 200ms.",
      keyInvariants: [
        "Mark acknowledgment resets dispatched state",
        "Allows clean interruption clearing without ghost echoes",
      ],
    },
  },
  {
    id: "desktop_egress",
    stageId: "stage-6",
    subsystem: "desktop",
    title: "Desktop Audio Egress",
    subtitle: "High-Fi Linear PCM",
    description:
      "Streams uncompressed 16kHz/24kHz PCM audio chunks directly to desktop WebSocket for native speaker playback.",
    latency: "< 2ms",
    latencyMs: 2,
    protocol: "WebSocket Binary / PCM",
    icon: "Volume2",
    x: 3100,
    y: 310,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_pcm_hi",
        name: "PCM Audio Chunks",
        type: "in",
        dataType: "Linear PCM",
      },
    ],
    outputs: [
      {
        id: "out_ws_pcm",
        name: "Desktop Frames",
        type: "out",
        dataType: "Binary WebSocket",
      },
    ],
    details: {
      summary:
        "Streams uncompressed synthesized PCM audio directly over the desktop WebSocket. Bypasses telephony downsampling for pristine, studio-quality native speaker and headphone output.",
      latencyBudget: "Budget: 3ms. Observed: 0.8ms.",
      empiricalSla: "Pristine audio fidelity without telephone codec artifacts.",
      codeReference: "vox-bridge/src/channels/desktop/stream.rs",
      sourceFile: "src/channels/desktop/stream.rs",
      codeSnippet: `let msg = DesktopOutboundText::AudioChunk { payload: base64_pcm };
ws_tx.send(Message::Text(serialize_outbound_text(&msg)?)).await?;`,
      payloadSample: `{\n  "type": "AudioChunk",\n  "sample_rate": 16000,\n  "samples": 640\n}`,
      fallbackStrategy:
        "Flushes and drops late frames if client network jitter causes buffer accumulation.",
      keyInvariants: [
        "Preserves 16kHz/24kHz bandwidth without 8kHz PSTN compression",
        "Zero jitter playback directly handled by CPAL in Tauri",
      ],
    },
  },

  // STAGE 7: Post-Session Analytics & Jobs
  {
    id: "jev_disposition",
    stageId: "stage-7",
    subsystem: "jev",
    title: "Post-Call Disposition & CRM",
    subtitle: "Multi-Question Evaluation",
    description:
      "Evaluates transcript upon hangup: outcome, 1-5 satisfaction score, and follow-up flag.",
    latency: "< 250ms",
    latencyMs: 250,
    protocol: "POST /v1/systemone",
    icon: "CheckCircle2",
    x: 3100,
    y: 640,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_transcript",
        name: "Full Transcript",
        type: "in",
        dataType: "Text",
      },
    ],
    outputs: [
      {
        id: "out_disposition",
        name: "CRM Payload",
        type: "out",
        dataType: "CallDisposition",
      },
    ],
    details: {
      summary:
        "Executed once when call or session terminates. Uses Jev to evaluate outcome (resolved, escalated, callback_requested), CSAT (1-5), and followup_required in 1 single call.",
      latencyBudget: "Budget: 1500ms post-call. Observed: 180-260ms.",
      empiricalSla:
        "Exports structured metadata directly into Salesforce, Zendesk, or HubSpot.",
      codeReference: "vox-bridge/src/voice/session/mod.rs",
      sourceFile: "src/voice/session/mod.rs",
      codeSnippet: `let disposition = jev.evaluate_call_disposition(&full_transcript).await?;
tracing::info!(outcome = %disposition.outcome, satisfaction = disposition.satisfaction, "VOICE_CALL_DISPOSITION_EVALUATED");`,
      payloadSample: `{\n  "outcome": "resolved",\n  "satisfaction": 4.8,\n  "followup_required": false\n}`,
      fallbackStrategy:
        "Logs raw transcript and queues async retry if network failure occurs.",
      keyInvariants: [
        "Structured answers without generative hallucinations or JSON markdown bloat",
        "Deterministic CRM routing tags",
      ],
    },
  },
  {
    id: "memory_summary",
    stageId: "stage-7",
    subsystem: "worker",
    title: "Context & Action Dispatcher",
    subtitle: "Durable Task Completion",
    description:
      "Worker process updates long-term memory embeddings, syncs CRM webhooks, and finalizes schedule records.",
    latency: "< 500ms",
    latencyMs: 500,
    protocol: "Async Tokio Tasks",
    icon: "CheckCircle2",
    x: 3100,
    y: 840,
    width: 270,
    height: 170,
    inputs: [
      {
        id: "in_summary_job",
        name: "Leased Job",
        type: "in",
        dataType: "Job Payload",
      },
    ],
    outputs: [
      {
        id: "out_pg_user",
        name: "Updated Context",
        type: "out",
        dataType: "Postgres Rows",
      },
    ],
    details: {
      summary:
        "Dispatched asynchronously by vox-core-worker. Computes vector embeddings of call insights, saves durable memory notes to user profile in PostgreSQL, and delivers scheduled reminder notifications.",
      latencyBudget: "Budget: 2000ms. Background non-blocking execution.",
      empiricalSla: "Guaranteed memory persistence for subsequent calls or desktop sessions.",
      codeReference: "vox-core/src/workers/actions.rs",
      sourceFile: "vox-core/src/workers/actions.rs",
      codeSnippet: `pub async fn execute_action(action: &ActionJob, db: &PgPool) -> Result<()> {
    match action.kind {
        ActionKind::UpdateUserMemory => update_vector_memory(action).await,
        ActionKind::DispatchWebhook => call_crm_webhook(action).await,
    }
}`,
      payloadSample: `{\n  "user_id": "usr_9124",\n  "summary": "Rahul confirmed shipment address for order 4912.",\n  "action_items": []\n}`,
      fallbackStrategy:
        "Retries with exponential backoff up to 5 times before moving to dead-letter queue.",
      keyInvariants: [
        "All updates write through authoritative PostgreSQL schema",
        "Subsequent sessions see updated context across all channels",
      ],
    },
  },
];

export const PIPELINE_EDGES: PipelineEdge[] = [
  // Telephony Ingress
  {
    id: "e1",
    from: "twilio_webhook",
    to: "twilio_ws",
    label: "TwiML Stream",
    type: "sync",
    latency: "< 15ms",
  },
  {
    id: "e2",
    from: "twilio_ws",
    to: "audio_buffer",
    label: "Acoustic Stream",
    type: "sync",
    latency: "< 1ms",
  },
  {
    id: "e3",
    from: "twilio_ws",
    to: "stt_stream",
    label: "8kHz μ-law",
    type: "sync",
    latency: "< 2ms",
  },
  {
    id: "e4",
    from: "twilio_webhook",
    to: "redis_lookup",
    label: "Caller Phone Key",
    type: "sync",
    latency: "< 4ms",
    route: "top-highway",
  },

  // Desktop Client Ingress & Auth
  {
    id: "e_desk_auth",
    from: "desktop_app",
    to: "desktop_session_auth",
    label: "PKCE Auth & Ticket",
    type: "sync",
    latency: "< 20ms",
  },
  {
    id: "e_desk_ticket",
    from: "desktop_session_auth",
    to: "desktop_ws",
    label: "Verified Ticket",
    type: "sync",
    latency: "< 1ms",
  },
  {
    id: "e_desk_connect",
    from: "desktop_app",
    to: "desktop_ws",
    label: "App WS Connect",
    type: "sync",
    latency: "< 5ms",
  },
  {
    id: "e_desk_audio",
    from: "desktop_ws",
    to: "audio_buffer",
    label: "20ms Mic Audio",
    type: "sync",
    latency: "< 1ms",
  },
  {
    id: "e_desk_stt",
    from: "desktop_ws",
    to: "stt_stream",
    label: "Raw PCM Stream",
    type: "sync",
    latency: "< 2ms",
  },

  // Identity & Greeting
  {
    id: "e5",
    from: "redis_lookup",
    to: "greeting_branch",
    label: "Profile (100ms max)",
    type: "sync",
    latency: "< 1ms",
  },
  {
    id: "e6",
    from: "greeting_branch",
    to: "sentence_chunker",
    label: "Greeting Prompt",
    type: "sync",
    latency: "< 1ms",
    route: "corridor-middle",
  },

  // Speculative & Turn Settling
  {
    id: "e7",
    from: "stt_stream",
    to: "jev_speculate",
    label: "Early Partials (>= 3 wds)",
    type: "speculative",
    latency: "60-90ms",
    labelOffset: { x: -120, y: 20 },
  },
  {
    id: "e8",
    from: "jev_speculate",
    to: "spec_tasks",
    label: "Speculative Fan-out",
    type: "speculative",
    latency: "150-350ms",
  },
  {
    id: "e9",
    from: "stt_stream",
    to: "jev_settle",
    label: "Finalized Turn",
    type: "sync",
    latency: "60-90ms",
    labelOffset: { x: -160, y: 70 },
  },
  {
    id: "e10",
    from: "jev_settle",
    to: "core_prompt",
    label: "Settled Turn (160ms)",
    type: "sync",
    latency: "< 1ms",
  },
  {
    id: "e11",
    from: "spec_tasks",
    to: "core_prompt",
    label: "Injected Data Cache",
    type: "async",
    latency: "0ms (Cached)",
  },
  {
    id: "e12",
    from: "core_prompt",
    to: "core_llm",
    label: "Unified Prompt",
    type: "sync",
    latency: "< 2ms",
  },

  // Core Engine to Filler, Chunker, DB
  {
    id: "e13",
    from: "core_llm",
    to: "jev_filler",
    label: "LookupPending Event",
    type: "async",
    latency: "400ms Deadline",
  },
  {
    id: "e14",
    from: "jev_filler",
    to: "audio_egress",
    label: "Prewarmed Filler Audio",
    type: "sync",
    latency: "< 1ms (RAM)",
    route: "corridor-middle",
  },
  {
    id: "e15",
    from: "core_llm",
    to: "sentence_chunker",
    label: "Streaming SSE Tokens",
    type: "sync",
    latency: "140ms TTFT",
  },
  {
    id: "e_core_db",
    from: "core_llm",
    to: "core_postgres",
    label: "Persist Turn & Job Queue",
    type: "sync",
    latency: "< 5ms",
  },
  {
    id: "e_pg_worker",
    from: "core_postgres",
    to: "core_worker",
    label: "FOR UPDATE SKIP LOCKED",
    type: "async",
    latency: "30s Poll",
  },
  {
    id: "e_worker_act",
    from: "core_worker",
    to: "memory_summary",
    label: "Execute Scheduled Jobs",
    type: "async",
    latency: "< 500ms",
  },

  // TTS & Audio Synthesis
  {
    id: "e16",
    from: "sentence_chunker",
    to: "tts_streaming",
    label: "Clauses & Sentences",
    type: "sync",
    latency: "< 1ms",
  },
  {
    id: "e17",
    from: "tts_streaming",
    to: "audio_egress",
    label: "Streaming μ-law PCM",
    type: "sync",
    latency: "70-90ms TTFB",
  },
  {
    id: "e_tts_desk",
    from: "tts_streaming",
    to: "desktop_egress",
    label: "High-Fi PCM Chunks",
    type: "sync",
    latency: "70-90ms TTFB",
  },

  // Egress back to Ingress Channels
  {
    id: "e_desk_playback",
    from: "desktop_egress",
    to: "desktop_ws",
    label: "Desktop Stream Out",
    type: "sync",
    latency: "< 2ms",
    route: "bottom-highway",
  },
  {
    id: "e_desk_hear",
    from: "desktop_ws",
    to: "desktop_app",
    label: "Local Playback",
    type: "sync",
    latency: "< 2ms",
  },
  {
    id: "e18",
    from: "audio_egress",
    to: "twilio_ws",
    label: "μ-law Packets & Marks",
    type: "sync",
    latency: "< 2ms",
    route: "loop-back",
  },

  // Barge-In & Urgency
  {
    id: "e19",
    from: "audio_buffer",
    to: "jev_barge",
    label: "Speech during Playback",
    type: "barge",
    latency: "< 2ms",
    labelOffset: { x: -160, y: -70 },
  },
  {
    id: "e20",
    from: "jev_barge",
    to: "audio_egress",
    label: "Clear / Invalidate",
    type: "barge",
    latency: "< 5ms",
    route: "corridor-middle",
  },
  {
    id: "e21",
    from: "stt_stream",
    to: "jev_urgency",
    label: "Turn Urgency Check",
    type: "async",
    latency: "60-90ms",
  },

  // Disposition & Lifecycle
  {
    id: "e22",
    from: "twilio_ws",
    to: "jev_disposition",
    label: "Call Hangup Event",
    type: "async",
    latency: "< 10ms",
    route: "bottom-highway",
  },
  {
    id: "e_desk_close",
    from: "desktop_ws",
    to: "jev_disposition",
    label: "Session Close Event",
    type: "async",
    latency: "< 10ms",
    route: "bottom-highway",
  },
];

export const TRACE_SCENARIOS: TraceScenario[] = [
  {
    id: "scenario_speculative_turn",
    title: "Scenario 1: Happy Path Speculative Turn (Order Status)",
    description:
      "Caller asks 'Where is my order?'. Speculative execution pre-fetches order details before user finishes speaking; LLM responds immediately with 0ms tool wait.",
    callerUtterance:
      "Where is my package? Has order forty-nine twelve shipped yet?",
    totalExpectedMs: 670,
    steps: [
      {
        step: 1,
        nodeId: "twilio_ws",
        edgeId: "e3",
        label: "Incoming Audio Packets",
        elapsedMs: 20,
        description:
          "20ms μ-law frames stream from Twilio over WebSocket connection.",
        dataPayload: `WebSocket Frame: 160 bytes G.711 μ-law`,
      },
      {
        step: 2,
        nodeId: "stt_stream",
        edgeId: "e7",
        label: "Streaming Partials (>= 3 words)",
        elapsedMs: 180,
        description:
          "AssemblyAI emits real-time partial transcript: 'Where is my package...'",
        dataPayload: `{"partial": "Where is my package"}`,
      },
      {
        step: 3,
        nodeId: "jev_speculate",
        edgeId: "e8",
        label: "Jev Intent Classification",
        elapsedMs: 250,
        description:
          "Jev evaluates partial: intent: 'order_status', domain: 'e-commerce', requires_lookup: true.",
        dataPayload: `{"intent": "order_lookup", "requires_lookup": true}`,
      },
      {
        step: 4,
        nodeId: "spec_tasks",
        edgeId: "e11",
        label: "Async DB Prefetch",
        elapsedMs: 350,
        description:
          "Fetches order #4912 from Supabase while user is still speaking.",
        dataPayload: `{"order_id": "4912", "status": "Out for delivery", "carrier": "FedEx"}`,
      },
      {
        step: 5,
        nodeId: "stt_stream",
        edgeId: "e9",
        label: "Final Transcript",
        elapsedMs: 380,
        description:
          "STT finalizes sentence: 'Where is my package? Has order 4912 shipped yet?'",
        dataPayload: `{"final": "Where is my package? Has order 4912 shipped yet?"}`,
      },
      {
        step: 6,
        nodeId: "jev_settle",
        edgeId: "e10",
        label: "Dynamic Settle (160ms)",
        elapsedMs: 440,
        description:
          "Jev Noul rates completeness = 0.94 -> Settles immediately in 160ms instead of 350ms!",
        dataPayload: `{"is_complete": 0.94, "settle_delay_ms": 160}`,
      },
      {
        step: 7,
        nodeId: "core_prompt",
        edgeId: "e12",
        label: "Context Injection",
        elapsedMs: 445,
        description:
          "Pre-fetched order details injected into LLM prompt with zero extra wait.",
        dataPayload: `{"injected_order": "4912", "status": "Out for delivery"}`,
      },
      {
        step: 8,
        nodeId: "core_llm",
        edgeId: "e13",
        label: "LookupPending Event",
        elapsedMs: 460,
        description: "LLM emits LookupPending event; triggers 400ms watchdog.",
        dataPayload: `ConversationEvent::LookupPending`,
      },
      {
        step: 9,
        nodeId: "jev_filler",
        edgeId: "e14",
        label: "Instant RAM Filler",
        elapsedMs: 465,
        description:
          "Jev selects 'Let me check on your order.' Streamed from RAM in <1ms!",
        dataPayload: `"Let me check on your order."`,
      },
      {
        step: 10,
        nodeId: "core_llm",
        edgeId: "e15",
        label: "Streaming Token Chunks",
        elapsedMs: 580,
        description:
          "Core LLM streams tokens: 'Your package is out for delivery with FedEx...'",
        dataPayload: `"Your package is out for delivery..."`,
      },
      {
        step: 11,
        nodeId: "sentence_chunker",
        edgeId: "e16",
        label: "Sentence Punctuation Split",
        elapsedMs: 590,
        description:
          "First sentence clause bounded and sent to TTS synthesizer.",
        dataPayload: `"Your package is out for delivery with FedEx."`,
      },
      {
        step: 12,
        nodeId: "tts_streaming",
        edgeId: "e17",
        label: "TTS Synthesis TTFB",
        elapsedMs: 665,
        description: "ElevenLabs / Sarvam emits first audio chunk (75ms TTFB).",
        dataPayload: `AudioStream: 8000Hz PCM chunk`,
      },
      {
        step: 13,
        nodeId: "audio_egress",
        edgeId: "e18",
        label: "PSTN Playback & Mark",
        elapsedMs: 670,
        description:
          "Audio frames and Mark packet stream over WebSocket to Twilio.",
        dataPayload: `Mark: "response-2"`,
      },
    ],
  },
  {
    id: "scenario_desktop_session",
    title: "Scenario 2: Native Desktop Client Voice Session & Worker Job",
    description:
      "Desktop user talks to agent via native CPAL microphone. Core LLM streams tokens and commits turn to PostgreSQL; background worker leases job and completes scheduled sync.",
    callerUtterance:
      "Schedule a product sync with Rahul tomorrow at 3 PM and update my notes.",
    totalExpectedMs: 620,
    steps: [
      {
        step: 1,
        nodeId: "desktop_app",
        edgeId: "e_desk_connect",
        label: "Native Mic Audio Capture",
        elapsedMs: 15,
        description:
          "Tauri CPAL captures 20ms audio frame; streams over authenticated WebSocket channel.",
        dataPayload: `AudioChunk { sample_rate: 16000, samples: 320 }`,
      },
      {
        step: 2,
        nodeId: "desktop_ws",
        edgeId: "e_desk_stt",
        label: "Desktop WebSocket Stream",
        elapsedMs: 25,
        description:
          "Bridge verifies short-lived ticket; forwards PCM audio directly into STT engine.",
        dataPayload: `wss://api.voxagent.in/bridge/desktop/voice/stream?ticket=...`,
      },
      {
        step: 3,
        nodeId: "stt_stream",
        edgeId: "e9",
        label: "Finalized Speech Turn",
        elapsedMs: 220,
        description:
          "AssemblyAI transcribes utterance: 'Schedule a product sync with Rahul tomorrow at 3 PM...'",
        dataPayload: `{"final": "Schedule a product sync with Rahul tomorrow at 3 PM and update my notes."}`,
      },
      {
        step: 4,
        nodeId: "jev_settle",
        edgeId: "e10",
        label: "Turn Settling Decision",
        elapsedMs: 285,
        description:
          "Jev Noul rates completeness = 0.96; settles immediately in 160ms.",
        dataPayload: `{"is_complete": 0.96, "settle_delay_ms": 160}`,
      },
      {
        step: 5,
        nodeId: "core_prompt",
        edgeId: "e12",
        label: "Unified Context Assembly",
        elapsedMs: 290,
        description:
          "Context assembled with minimal Redis user profile and calendar schedule tools.",
        dataPayload: `{"user": "Rahul", "tools": ["schedule_event", "update_notes"]}`,
      },
      {
        step: 6,
        nodeId: "core_llm",
        edgeId: "e_core_db",
        label: "Core LLM SSE Stream & DB Commit",
        elapsedMs: 440,
        description:
          "vox-core-api streams spoken response tokens and writes durable job row to PostgreSQL.",
        dataPayload: `INSERT INTO vox_jobs (job_type, payload) VALUES ('schedule_sync', ...)`,
      },
      {
        step: 7,
        nodeId: "sentence_chunker",
        edgeId: "e16",
        label: "Punctuation Sentence Split",
        elapsedMs: 450,
        description:
          "Splits first clause: 'I have scheduled your product sync with Rahul for tomorrow at 3 PM.'",
        dataPayload: `"I have scheduled your product sync with Rahul for tomorrow at 3 PM."`,
      },
      {
        step: 8,
        nodeId: "tts_streaming",
        edgeId: "e_tts_desk",
        label: "High-Fidelity Audio Synthesis",
        elapsedMs: 530,
        description:
          "Synthesizes 24kHz studio PCM chunk for desktop output without telephony downsampling.",
        dataPayload: `AudioStream: 24kHz PCM chunk`,
      },
      {
        step: 9,
        nodeId: "desktop_egress",
        edgeId: "e_desk_playback",
        label: "Desktop WebSocket Egress",
        elapsedMs: 535,
        description:
          "Pipes uncompressed audio frames to desktop client WebSocket.",
        dataPayload: `DesktopOutboundText::AudioChunk`,
      },
      {
        step: 10,
        nodeId: "desktop_app",
        edgeId: "e_desk_hear",
        label: "Native Speaker Playback",
        elapsedMs: 540,
        description:
          "Tauri audio player renders crisp speech through user headphones/speakers.",
        dataPayload: `Playback started: 0ms buffer underrun`,
      },
      {
        step: 11,
        nodeId: "core_postgres",
        edgeId: "e_pg_worker",
        label: "Durable Job Row Locked",
        elapsedMs: 580,
        description:
          "PostgreSQL row locked via FOR UPDATE SKIP LOCKED by vox-core-worker.",
        dataPayload: `SELECT * FROM vox_jobs FOR UPDATE SKIP LOCKED LIMIT 5`,
      },
      {
        step: 12,
        nodeId: "core_worker",
        edgeId: "e_worker_act",
        label: "vox-core-worker Background Dispatch",
        elapsedMs: 620,
        description:
          "Background worker daemon commits calendar invite and writes updated context note to user memory.",
        dataPayload: `{"status": "completed", "event_id": "cal_sync_92b"}`,
      },
    ],
  },
  {
    id: "scenario_barge_in_filter",
    title: "Scenario 3: Intelligent Barge-In (Backchannel Filtered)",
    description:
      "Caller murmurs 'uh-huh' while bot is speaking. Jev classifies as backchannel, preventing false audio interruption.",
    callerUtterance: "uh-huh... yeah...",
    totalExpectedMs: 110,
    steps: [
      {
        step: 1,
        nodeId: "audio_buffer",
        edgeId: "e19",
        label: "Speech Detected during Playback",
        elapsedMs: 15,
        description:
          "AudioBuffer flags SpeechStarted during active playback session.",
        dataPayload: `audio_playing: true, energy_threshold: exceeded`,
      },
      {
        step: 2,
        nodeId: "stt_stream",
        label: "Fast Partial Utterance",
        elapsedMs: 60,
        description:
          "AssemblyAI partial returns single short token: 'uh-huh'.",
        dataPayload: `{"partial": "uh-huh"}`,
      },
      {
        step: 3,
        nodeId: "jev_barge",
        label: "Jev Choice Classification",
        elapsedMs: 105,
        description:
          "Jev classifies 'uh-huh' as Backchannel (confidence: 0.98).",
        dataPayload: `{"decision": "backchannel", "confidence": 0.98}`,
      },
      {
        step: 4,
        nodeId: "audio_egress",
        label: "Audio Playback Continues",
        elapsedMs: 110,
        description:
          "Playback NOT interrupted! Bot audio continues without stutter.",
        dataPayload: `playback_action: NOOP (preserved)`,
      },
    ],
  },
];
