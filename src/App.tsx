import { useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, ChevronRight, Fingerprint, House, ListChecks, LockKeyhole, Pause, Phone, Play, Sparkles, Wallet, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import VoiceOrb from './components/VoiceOrb'

const examples: { title: string; label: string; icon: LucideIcon; description: string; request: string; response: string; actions: string[] }[] = [
  { title: 'Take care of the everyday.', label: 'Everyday tasks', icon: ListChecks, description: 'The appointments, reminders, and little things that fill your head. Imagine handing them over in a conversation.', request: '“Vox, help me get tomorrow sorted.”', response: 'A calmer start. Your day, brought together.', actions: ['Find a time for your appointment', 'Bring your reminders into one place', 'Plan around what matters to you'] },
  { title: 'See the patterns in your life.', label: 'Understand your life', icon: Sparkles, description: 'Connect the dots between your routines, goals, and time. An assistant that helps you reflect and make room for what matters.', request: '“Vox, where does all my time go?”', response: 'A little perspective on your everyday.', actions: ['Look back at your weekly routines', 'Spot patterns in how you spend time', 'Make space for your personal goals'] },
  { title: 'Make yourself at home.', label: 'Connected devices', icon: House, description: 'Your lights, your space, your preferences. Our vision is to bring the devices you choose into one natural conversation.', request: '“Vox, get the house ready for the evening.”', response: 'Your space, just the way you like it.', actions: ['Bring connected lights into the conversation', 'Adjust your space to your routine', 'Keep device permissions in your hands'] },
  { title: 'Make sense of your money.', label: 'Personal finances', icon: Wallet, description: 'Understand your spending, keep track of bills, and feel more organized. Financial clarity, without another spreadsheet to maintain.', request: '“Vox, help me understand this month’s spending.”', response: 'A clearer picture. More informed decisions.', actions: ['Bring your spending into focus', 'Keep upcoming bills on your radar', 'Review next steps before taking action'] },
]

function Brand({ footer = false }: { footer?: boolean }) {
  return <a href="#top" aria-label="Vox home" className={`brand ${footer ? 'brand-footer' : ''}`}><Waves aria-hidden="true" strokeWidth={2.5} /><span>vox<span className="brand-period">.</span></span></a>
}

export default function App() {
  const [paused, setPaused] = useState(false)
  const [selected, setSelected] = useState(0)
  const example = examples[selected]
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header id="top" className="border-b border-white/7">
        <div className="page-width flex min-h-22 items-center justify-between gap-6">
          <Brand />
          <nav aria-label="Main navigation" className="flex items-center gap-7 md:gap-9 text-sm text-muted">
            <a className="nav-link" href="#vision">The vision</a><a className="nav-link hidden sm:block" href="#possibilities">Possibilities</a><a className="nav-link hidden md:block" href="#principles">Our principles</a>
            <span className="availability"><span className="status-dot" />Coming soon</span>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="page-width hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <div className="eyebrow flex items-center gap-3"><span className="small-signal"><i /><i /><i /><i /></span>A more human kind of AI</div>
            <h1 id="hero-heading">Your life,<br />one call away.</h1>
            <p className="hero-description">An assistant for everything that makes you, you. Your tasks, your routines, your home, your finances. All through a simple phone call.</p>
            <a className="primary-link" href="#vision">Meet the vision <ArrowDown size={17} aria-hidden="true" /></a>
            <p className="hero-note"><span className="status-dot" />In the making. Built around you.</p>
          </div>
          <div className="voice-panel">
            <div className="panel-top"><span className="flex items-center gap-2"><Waves size={15} aria-hidden="true" /> A presence, not another app.</span><span className="panel-badge">Concept preview</span></div>
            <VoiceOrb paused={paused} />
            <div className="orb-caption"><span className="waveform" aria-hidden="true">{[9, 17, 25, 13, 31, 19, 11, 23, 33, 16, 9].map((height, i) => <i key={i} style={{ height }} />)}</span><p>A familiar voice.<br /><span>A world of possibility.</span></p></div>
            <div className="panel-bottom"><span><span className="status-dot" />The future sounds personal.</span><button type="button" className="motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume orb animation' : 'Pause orb animation'} aria-pressed={paused}>{paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}<span>{paused ? 'Resume' : 'Pause'}</span></button></div>
          </div>
        </section>
        <div className="page-width capability-strip" aria-label="Vox's planned capabilities">{examples.map(({ label, icon: Icon }) => <a key={label} href="#possibilities" onClick={() => setSelected(examples.findIndex(e => e.label === label))}><Icon size={18} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span><ArrowUpRight className="strip-arrow" size={14} aria-hidden="true" /></a>)}</div>
        <section id="vision" className="page-width vision-section section-space" aria-labelledby="vision-heading">
          <div><p className="eyebrow">The vision</p><h2 id="vision-heading">Less managing life.<br />More living it.</h2></div>
          <div className="vision-copy"><p>Technology was supposed to give us time back. Somewhere along the way, it gave us more screens to check.</p><p>We’re building Vox to change that. One personal AI assistant that brings the pieces of your life together. Just pick up the phone, say what’s on your mind, and let the conversation move things forward.</p><span className="vision-signoff"><Phone size={15} aria-hidden="true" /> A simple phone call. A little more life.</span></div>
        </section>
        <section id="possibilities" className="page-width possibilities-section" aria-labelledby="possibilities-heading">
          <div className="section-heading"><div><p className="eyebrow">Made for your real life</p><h2 id="possibilities-heading">A lot on your mind?<br />That’s where Vox comes in.</h2></div><p className="section-aside">One conversation, so many possibilities.<br />Here’s what we’re working toward.</p></div>
          <div className="example-panel">
            <div className="example-nav" role="group" aria-label="Explore planned capabilities">{examples.map(({ label, icon: Icon }, index) => <button key={label} type="button" aria-pressed={selected === index} aria-controls="example-content" onClick={() => setSelected(index)} className={`example-button ${selected === index ? 'selected' : ''}`}><Icon size={18} aria-hidden="true" /><span>{label}</span><ChevronRight size={15} className="ml-auto" aria-hidden="true" /></button>)}</div>
            <div id="example-content" className="example-content" aria-live="polite" aria-atomic="true"><div><p className="example-label">Imagine this</p><h3>{example.title}</h3><p className="example-description">{example.description}</p><p className="example-disclaimer">Illustrative example · capabilities in development</p></div><div className="conversation"><div className="request"><Phone size={15} aria-hidden="true" /><p>{example.request}</p></div><div className="response"><span className="mini-orb" aria-hidden="true" /><div><span className="text-xs text-signal">Vox, envisioned</span><p>{example.response}</p><ul>{example.actions.map(action => <li key={action}><Check size={13} aria-hidden="true" />{action}</li>)}</ul></div></div></div></div>
          </div>
        </section>
        <section id="how-it-works" className="page-width section-space" aria-labelledby="how-heading">
          <div className="section-heading"><div><p className="eyebrow">Naturally simple</p><h2 id="how-heading">You already know<br />how to use it.</h2></div><p className="section-aside">No new habits to learn.<br />Just the most natural interface: your voice.</p></div>
          <div className="steps">{[{ n: '01', title: 'Pick up the phone.', body: 'Reach your assistant with a simple call. The idea is to meet you wherever life happens.', icon: Phone }, { n: '02', title: 'Say it your way.', body: 'Talk naturally about what you need. No perfect prompts. No navigating menus.', icon: Waves }, { n: '03', title: 'Let life move forward.', body: 'Vox’s goal: coordinate the details, check with you when needed, and give you time back.', icon: Sparkles }].map(({ n, title, body, icon: Icon }) => <article key={n}><div className="step-top"><span>{n}</span><Icon size={21} strokeWidth={1.4} aria-hidden="true" /></div><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>
        <section id="principles" className="page-width" aria-labelledby="principles-heading"><div className="principles-panel"><div className="principles-intro"><span className="privacy-mark"><Fingerprint size={34} strokeWidth={1.2} aria-hidden="true" /></span><p className="eyebrow">Personal should mean personal</p><h2 id="principles-heading">Your life.<br />Your say. Always.</h2><p>An assistant that knows your world should respect your boundaries. These are the principles guiding how we build Vox.</p></div><div className="principle-list"><article><LockKeyhole size={20} strokeWidth={1.4} aria-hidden="true" /><div><h3>Trust comes first.</h3><p>We’re designing for thoughtful access to your personal context, with privacy considered from the start.</p></div></article><article><Check size={20} strokeWidth={1.4} aria-hidden="true" /><div><h3>You stay in control.</h3><p>Our aim is clear permissions and your confirmation for important actions. Especially when it comes to your money.</p></div></article><article><Sparkles size={20} strokeWidth={1.4} aria-hidden="true" /><div><h3>Helpful. Never intrusive.</h3><p>Technology should fit into your life quietly. We’re building for useful moments, not more time on a screen.</p></div></article></div></div></section>
        <section className="page-width closing" aria-labelledby="closing-heading"><span className="closing-signal" aria-hidden="true"><Waves size={30} /></span><p className="eyebrow">A new conversation is coming</p><h2 id="closing-heading">The best interface<br />might just be a hello.</h2><p>We’re building Vox. For everything life calls for.</p><span className="availability"><span className="status-dot" />Coming soon</span></section>
      </main>
      <footer className="border-t border-white/7"><div className="page-width footer-content"><div><Brand footer /><p>Your life, one call away.</p></div><nav aria-label="Footer navigation"><a className="nav-link" href="#vision">The vision</a><a className="nav-link" href="#principles">Our principles</a><a className="nav-link" href="#top">Back to top ↑</a></nav></div><div className="page-width footer-base"><span>© {new Date().getFullYear()} Vox</span><span>A little less screen. A little more human.</span></div></footer>
    </>
  )
}
