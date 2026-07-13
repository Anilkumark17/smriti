import { useState, useEffect, useRef, useCallback } from 'react'
import {
  BookOpen,
  HelpCircle,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Mic,
  Square,
  Tv,
  Users,
  UserRound,
  MessageCircle,
  ChevronRight,
  Send,
  Plus,
  Heart,
  ThumbsUp,
  Smile,
  Zap,
  Share2,
  CheckCircle2,
  Radio,
  ScrollText,
  Briefcase,
  Soup,
  Home,
  Wand2,
  RefreshCw,
  Mail,
  PenLine,
  Eye,
} from 'lucide-react'
import './App.css'

const PANEL_COUNT = 11
const PANEL_OVERRIDES = { 1: '/pic1.png', 2: '/pic2.png', 3: '/pic3.png', 4: '/pic4.png' }
const PANELS = Array.from({ length: PANEL_COUNT }, (_, i) => {
  const n = i + 1
  return {
    src: PANEL_OVERRIDES[n] || `/panels/panel-${n}.png`,
    alt: `Comic panel ${n} of ${PANEL_COUNT}`,
  }
})

const CATEGORIES = [
  {
    id: 'rule',
    title: 'Rules I Lived By',
    description: 'A principle or saying that guided your life.',
    icon: ScrollText,
  },
  {
    id: 'career',
    title: 'Career & First Job',
    description: 'Work stories worth passing down.',
    icon: Briefcase,
  },
  {
    id: 'food',
    title: 'Family Recipes',
    description: 'Meals and the memories around the table.',
    icon: Soup,
  },
  {
    id: 'home',
    title: 'Places That Felt Like Home',
    description: 'Houses, towns, or rooms you loved.',
    icon: Home,
  },
]

const CAPTION_TEMPLATES = {
  rule: [
    'He always said, "Be kind first, be right later."',
    'That one line shaped every hard decision that followed.',
    'Even now, I hear it before I speak.',
  ],
  career: [
    'My first paycheck barely covered the bus fare home.',
    'My manager taught me one thing: show up early, always.',
    'That habit outlasted the job by decades.',
  ],
  food: [
    'The kitchen smelled like cardamom every single Sunday.',
    'She never measured anything — just tasted and adjusted.',
    "I still can't get the dal to taste quite like hers.",
  ],
  home: [
    'It was never the house — it was the porch swing.',
    'Every evening ended there, tea in hand, world outside.',
    "That's the room I still return to in my mind.",
  ],
}

// Seed data — simulates an existing family account with prior activity.
const SEED_USERS = [
  { id: 'u1', name: 'Sunita Sharma', email: 'sunita@smriti.family', password: 'demo1234', role: 'elder' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@smriti.family', password: 'demo1234', role: 'child' },
]

const SEED_LESSONS = [
  {
    id: 'l1',
    categoryId: 'rule',
    question: 'Tell me about a rule you lived by',
    hint: 'Think of a saying or principle that guided your life.',
    status: 'comic',
    noteText: 'Always be kind first, beta — you can be right later.',
    aiCaptions: CAPTION_TEMPLATES.rule,
    comicId: 'c1',
  },
  {
    id: 'l2',
    categoryId: 'rule',
    question: "What's the best advice you ever gave?",
    hint: 'Who did you give it to, and did they listen?',
    status: 'ready',
    noteText: 'Always leave people better than you found them.',
    aiCaptions: [
      '"Always leave people better than you found them," I used to tell her.',
      'She rolled her eyes then. She quotes it now.',
      'Funny how advice skips a generation before it lands.',
    ],
  },
  {
    id: 'l3',
    categoryId: 'rule',
    question: 'A mistake that taught you something important',
    hint: 'What happened, and what did you learn from it?',
    status: 'new',
  },
  {
    id: 'l4',
    categoryId: 'career',
    question: 'What was your first job like?',
    hint: 'Describe the place, the people, and how you felt.',
    status: 'ready',
    noteText: 'My first paycheck barely covered the bus fare home.',
    aiCaptions: CAPTION_TEMPLATES.career,
  },
  {
    id: 'l5',
    categoryId: 'career',
    question: 'Tell me about a boss or mentor who shaped you',
    hint: 'What did they teach you, on purpose or by accident?',
    status: 'new',
  },
  {
    id: 'l6',
    categoryId: 'food',
    question: 'Describe a meal that brings back memories',
    hint: 'Who made it? Where were you? What did it taste like?',
    status: 'comic',
    noteText: 'The kitchen always smelled like cardamom on Sundays.',
    aiCaptions: CAPTION_TEMPLATES.food,
    comicId: 'c2',
  },
  {
    id: 'l7',
    categoryId: 'food',
    question: "A recipe that's been passed down in your family",
    hint: 'Who taught it to you, and who have you taught it to?',
    status: 'new',
  },
  {
    id: 'l8',
    categoryId: 'home',
    question: 'Tell me about a place that felt like home',
    hint: 'It could be a house, a town, or even a corner of a room.',
    status: 'new',
  },
  {
    id: 'l9',
    categoryId: 'home',
    question: 'A house or room you still think about',
    hint: "What made it special? Do you remember how it smelled, or sounded?",
    status: 'new',
  },
]

const SEED_COMICS = [
  { id: 'c1', lessonId: 'l1', title: 'The Rule I Lived By', categoryId: 'rule', date: '2 days ago', status: 'shared' },
  { id: 'c2', lessonId: 'l6', title: "Grandma's Dal", categoryId: 'food', date: '2 weeks ago', status: 'shared' },
]

const CUSTOMIZE_MESSAGES = [
  'Reading your memory...',
  'Sketching the scene...',
  'Adding your family as characters...',
  'Writing the dialogue...',
]

const GENERATE_MESSAGES = [
  'Laying out the panels...',
  'Coloring each scene...',
  'Adding speech bubbles...',
  'Finishing touches...',
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Story Capture',
    short: 'Record or write a memory, one lesson at a time.',
    icon: Mic,
    detail:
      'The older adult records or writes a memory for a specific lesson inside a category — like "Tell me about a rule you lived by" — since specific prompts consistently produce richer stories.',
  },
  {
    step: 2,
    title: 'AI Customization',
    short: 'AI turns the memory into an editable comic script.',
    icon: Wand2,
    detail:
      'Once saved, AI rewrites the memory as panel-by-panel captions. Nothing is final — every line can be edited before it becomes part of the family archive.',
  },
  {
    step: 3,
    title: 'Comic Generation',
    short: 'Pick a ready story and generate the comic.',
    icon: BookOpen,
    detail:
      'From the Comics tab, choose any story that has been captured and edited, then generate it into a personal family comic, added straight to the library.',
  },
  {
    step: 4,
    title: 'Grandchild Involvement',
    short: 'Kids request stories, react, and add their own versions.',
    icon: Users,
    detail:
      "Grandchildren aren't passive viewers — they can request stories on topics they're curious about, react, ask follow-up questions, or add their own version of a story.",
  },
  {
    step: 5,
    title: 'Shared Viewing',
    short: 'Watch together on a call, not alone on a screen.',
    icon: Tv,
    detail:
      'The comic is viewed together with family, on a call or screen-share, rather than sent as content to consume alone.',
  },
]

const TOPIC_SUGGESTIONS = [
  'School days',
  'First love',
  'A funny mistake',
  'Family traditions',
  'Travel adventures',
  'Childhood friends',
]

const CONVERSATION_PROMPTS = [
  { label: 'For Grandchild', text: 'What surprised you most about this story?' },
  { label: 'For Elder', text: 'Can you tell us more about what happened next?' },
  { label: 'For Everyone', text: 'Does this remind you of something in our family today?' },
  { label: 'For Grandchild', text: 'If you were there, what would you have done?' },
]

const REACTIONS = [
  { key: 'love', icon: Heart, label: 'Loved it' },
  { key: 'funny', icon: Smile, label: 'Funny' },
  { key: 'wow', icon: Zap, label: 'Surprising' },
  { key: 'great', icon: ThumbsUp, label: 'Great story' },
  { key: 'curious', icon: HelpCircle, label: 'Curious' },
]

const HOME_TAB_SCREENS = new Set([
  'home',
  'category-detail',
  'lesson-capture',
  'ai-processing',
  'edit-story',
  'grandchild-hub',
])

const COMICS_TAB_SCREENS = new Set([
  'comics',
  'generate-comic',
  'comic-generating',
  'comic-preview',
  'shared-viewing',
  'conversation',
])

function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]
}

function PanelSlider({ panels, children }) {
  const [index, setIndex] = useState(0)
  const total = panels.length

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1))

  return (
    <div className="panel-slider">
      <div className="panel-slider__viewport">
        <div
          className="panel-slider__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {panels.map((panel) => (
            <div className="panel-slider__slide" key={panel.src}>
              <img src={panel.src} alt={panel.alt} draggable={false} />
            </div>
          ))}
        </div>
        {children}
        <button
          className="panel-slider__arrow panel-slider__arrow--left"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous panel"
        >
          <ChevronLeft size={20} strokeWidth={2.25} />
        </button>
        <button
          className="panel-slider__arrow panel-slider__arrow--right"
          onClick={goNext}
          disabled={index === total - 1}
          aria-label="Next panel"
        >
          <ChevronRight size={20} strokeWidth={2.25} />
        </button>
      </div>
      <div className="panel-slider__meta">
        <span className="panel-slider__count">Panel {index + 1} of {total}</span>
        <div className="panel-slider__progress">
          <div
            className="panel-slider__progress-bar"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="toast">
      <CheckCircle2 size={18} strokeWidth={2.25} />
      <span>{message}</span>
    </div>
  )
}

function Header({ user, onNavigate, activeTab }) {
  if (!user) return null
  return (
    <header className="header">
      <button className="header__logo" onClick={() => onNavigate('home')}>
        <span className="header__logo-icon">
          <BookOpen size={18} strokeWidth={2.25} />
        </span>
        Smriti
      </button>
      <nav className="header__nav">
        <div className="header__tabs">
          <button
            className={`header__tab ${activeTab === 'home' ? 'header__tab--active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            <Home size={15} strokeWidth={2} />
            Home
          </button>
          <button
            className={`header__tab ${activeTab === 'comics' ? 'header__tab--active' : ''}`}
            onClick={() => onNavigate('comics')}
          >
            <BookOpen size={15} strokeWidth={2} />
            Comics
          </button>
        </div>
        <button
          className="btn btn--ghost btn--sm header__help"
          onClick={() => onNavigate('how-it-works')}
          aria-label="How it works"
          title="How it works"
        >
          <HelpCircle size={16} />
        </button>
        <span className={`header__avatar header__avatar--${user.role}`}>
          {initials(user.name)}
        </span>
      </nav>
    </header>
  )
}

function WelcomeScreen({ onNavigate }) {
  return (
    <div className="screen welcome">
      <div className="welcome__hero">
        <div className="welcome__icon">
          <BookOpen size={32} strokeWidth={2} />
        </div>
        <span className="welcome__eyebrow">Family storytelling, reimagined</span>
        <h1 className="welcome__title">Smriti</h1>
        <p className="welcome__subtitle">
          Turn family memories into shared comic stories — together.
        </p>
        <p className="welcome__tagline">Built for grandparents &amp; grandchildren</p>
      </div>
      <div className="welcome__actions">
        <button className="btn btn--primary btn--large" onClick={() => onNavigate('signup')}>
          Get Started
        </button>
        <button className="btn btn--outline btn--large" onClick={() => onNavigate('login')}>
          Log In
        </button>
        <button className="welcome__link" onClick={() => onNavigate('how-it-works')}>
          See how it works <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

function LoginScreen({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin({ id: 'custom', name: email.split('@')[0] || 'Family Member', email, role: 'elder' })
  }

  return (
    <div className="screen auth">
      <button className="back-btn" onClick={() => onNavigate('welcome')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="auth__card">
        <h1 className="auth__title">Welcome back</h1>
        <p className="auth__desc">Log in to continue your family stories.</p>

        <div className="auth__seed">
          <span className="auth__seed-label">Quick demo access</span>
          <div className="auth__seed-list">
            {SEED_USERS.map((seedUser) => (
              <button
                key={seedUser.id}
                type="button"
                className="auth__seed-btn"
                onClick={() => onLogin(seedUser)}
              >
                <span className="auth__seed-avatar">{initials(seedUser.name)}</span>
                <span className="auth__seed-info">
                  <strong>{seedUser.name}</strong>
                  <small>{seedUser.role === 'elder' ? 'Grandparent' : 'Grandchild'}</small>
                </span>
                <ChevronRight size={15} className="auth__seed-arrow" />
              </button>
            ))}
          </div>
        </div>

        <div className="auth__divider"><span>or log in manually</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary btn--large">Log In</button>
        </form>
        <button className="welcome__link" style={{ marginTop: 20 }} onClick={() => onNavigate('signup')}>
          New here? <span>Sign up</span>
        </button>
      </div>
    </div>
  )
}

function SignupScreen({ onNavigate, onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('elder')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin({ id: 'custom', name, email, role })
  }

  return (
    <div className="screen auth">
      <button className="back-btn" onClick={() => onNavigate('welcome')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="auth__card">
        <h1 className="auth__title">Create your account</h1>
        <p className="auth__desc">Join Smriti and start sharing stories.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-picker">
              <button
                type="button"
                className={`role-card ${role === 'elder' ? 'role-card--active' : ''}`}
                onClick={() => setRole('elder')}
              >
                <div className="role-card__icon">
                  <UserRound size={20} strokeWidth={2} />
                </div>
                <div className="role-card__title">Older Adult</div>
                <div className="role-card__desc">Share your memories</div>
              </button>
              <button
                type="button"
                className={`role-card ${role === 'child' ? 'role-card--active' : ''}`}
                onClick={() => setRole('child')}
              >
                <div className="role-card__icon">
                  <Users size={20} strokeWidth={2} />
                </div>
                <div className="role-card__title">Grandchild</div>
                <div className="role-card__desc">Discover family stories</div>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Grandma Sunita"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary btn--large">Create Account</button>
        </form>
        <button className="welcome__link" style={{ marginTop: 20 }} onClick={() => onNavigate('login')}>
          Already have an account? <span>Log in</span>
        </button>
      </div>
    </div>
  )
}

function HowItWorksScreen({ onNavigate, user }) {
  const [activeStep, setActiveStep] = useState(0)
  const step = HOW_IT_WORKS[activeStep]
  const StepIcon = step.icon

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => onNavigate(user ? 'home' : 'welcome')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header">
        <h1>How It Works</h1>
        <p>From a captured memory to a family comic.</p>
      </div>

      <div className="step-detail" style={{ marginBottom: 24 }}>
        <div className="step-detail__icon">
          <StepIcon size={26} strokeWidth={2} />
        </div>
        <h2 className="step-detail__title">Step {step.step} — {step.title}</h2>
        <p className="step-detail__text">{step.detail}</p>
        {step.step === 1 && user?.role === 'elder' && (
          <button className="btn btn--primary" onClick={() => onNavigate('home')}>
            Browse Categories <ChevronRight size={16} />
          </button>
        )}
        {step.step === 3 && user?.role === 'elder' && (
          <button className="btn btn--primary" onClick={() => onNavigate('comics')}>
            Open Comics <ChevronRight size={16} />
          </button>
        )}
        {step.step === 4 && user?.role === 'child' && (
          <button className="btn btn--primary" onClick={() => onNavigate('grandchild-hub')}>
            Explore Grandchild Hub <ChevronRight size={16} />
          </button>
        )}
        {step.step === 5 && (
          <button className="btn btn--primary" onClick={() => onNavigate('shared-viewing')}>
            Start Shared Viewing <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="steps">
        {HOW_IT_WORKS.map((s, i) => {
          const Icon = s.icon
          return (
            <button
              key={s.step}
              className={`step-card ${i === activeStep ? 'step-card--active' : ''}`}
              onClick={() => setActiveStep(i)}
            >
              <span className="step-card__number">
                <Icon size={18} strokeWidth={2} />
              </span>
              <div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__desc">{s.short}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function HomeScreen({ user, lessons, onNavigate, onOpenCategory }) {
  const isElder = user.role === 'elder'
  const comicCount = lessons.filter((l) => l.status === 'comic').length
  const readyCount = lessons.filter((l) => l.status === 'ready').length

  return (
    <div className="screen">
      <div className="dashboard__greeting">
        <h1>Hello, {user.name}</h1>
        <p>{isElder ? "Turn today's memory into tomorrow's comic." : "Explore your family's stories"}</p>
      </div>

      <div className="home-stats">
        <div className="home-stat">
          <span className="home-stat__value">{comicCount}</span>
          <span className="home-stat__label">Comics created</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">{readyCount}</span>
          <span className="home-stat__label">Ready to generate</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">{lessons.length}</span>
          <span className="home-stat__label">Total prompts</span>
        </div>
      </div>

      <h2 className="section-title">Categories</h2>
      <div className="category-grid">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const catLessons = lessons.filter((l) => l.categoryId === cat.id)
          const done = catLessons.filter((l) => l.status !== 'new').length
          return (
            <button key={cat.id} className="category-card" onClick={() => onOpenCategory(cat)}>
              <div className="category-card__icon">
                <Icon size={20} strokeWidth={2} />
              </div>
              <h3 className="category-card__title">{cat.title}</h3>
              <p className="category-card__desc">{cat.description}</p>
              <span className="category-card__meta">{done} of {catLessons.length} captured</span>
            </button>
          )
        })}
      </div>

      {!isElder && (
        <button
          className="btn btn--primary btn--large"
          style={{ marginTop: 24 }}
          onClick={() => onNavigate('grandchild-hub')}
        >
          <Sparkles size={16} /> Request a Story
        </button>
      )}
    </div>
  )
}

function LessonRow({ lesson, isElder, onNote, onRecord, onEdit, onViewComic, onRequest }) {
  const statusLabel = lesson.status === 'new' ? 'Not started' : lesson.status === 'ready' ? 'Ready to generate' : 'Comic created'

  return (
    <div className="lesson-row">
      <div className="lesson-row__main">
        <p className="lesson-row__question">{lesson.question}</p>
        <span className={`lesson-status lesson-status--${lesson.status}`}>{statusLabel}</span>
      </div>
      <div className="lesson-row__actions">
        {isElder && lesson.status === 'new' && (
          <>
            <button className="btn btn--outline btn--sm" onClick={() => onNote(lesson)}>
              <PenLine size={14} /> Note
            </button>
            <button className="btn btn--primary btn--sm" onClick={() => onRecord(lesson)}>
              <Mic size={14} /> Record
            </button>
          </>
        )}
        {isElder && lesson.status === 'ready' && (
          <button className="btn btn--secondary btn--sm" onClick={() => onEdit(lesson)}>
            <PenLine size={14} /> Edit Script
          </button>
        )}
        {isElder && lesson.status === 'comic' && (
          <button className="btn btn--outline btn--sm" onClick={() => onViewComic(lesson)}>
            <Eye size={14} /> View Comic
          </button>
        )}
        {!isElder && lesson.status !== 'comic' && (
          <button className="btn btn--outline btn--sm" onClick={() => onRequest(lesson)}>
            <Mail size={14} /> Request
          </button>
        )}
        {!isElder && lesson.status === 'comic' && (
          <button className="btn btn--primary btn--sm" onClick={() => onViewComic(lesson)}>
            <Eye size={14} /> Read Comic
          </button>
        )}
      </div>
    </div>
  )
}

function CategoryDetailScreen({ category, lessons, isElder, onNavigate, onNote, onRecord, onEdit, onViewComic, onRequest }) {
  const activeCategory = category || CATEGORIES[0]
  const Icon = activeCategory.icon
  const categoryLessons = lessons.filter((l) => l.categoryId === activeCategory.id)

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="category-detail__header">
        <div className="category-detail__icon">
          <Icon size={22} strokeWidth={2} />
        </div>
        <div>
          <h1>{activeCategory.title}</h1>
          <p>{activeCategory.description}</p>
        </div>
      </div>

      <div className="lesson-list">
        {categoryLessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            isElder={isElder}
            onNote={onNote}
            onRecord={onRecord}
            onEdit={onEdit}
            onViewComic={onViewComic}
            onRequest={onRequest}
          />
        ))}
      </div>
    </div>
  )
}

function LessonCaptureScreen({ lesson, mode, onNavigate, onSave }) {
  const activeLesson = lesson || SEED_LESSONS[0]
  const category = categoryOf(activeLesson.categoryId)
  const CategoryIcon = category.icon
  const isNoteMode = mode !== 'record'

  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [sttSupported, setSttSupported] = useState(true)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (isNoteMode) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setSttSupported(false)
      return
    }
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setAnswer(transcript)
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
  }, [isNoteMode])

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }, [isRecording])

  const handleSave = () => {
    if (isRecording) recognitionRef.current?.stop()
    onSave(answer)
  }

  return (
    <div className="screen capture">
      <button className="back-btn" onClick={() => onNavigate('category-detail')}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="capture__tags">
        <span className="capture__category-tag">
          <CategoryIcon size={13} strokeWidth={2} />
          {category.title}
        </span>
        <span className="capture__mode-tag">
          {isNoteMode ? <PenLine size={12} strokeWidth={2} /> : <Mic size={12} strokeWidth={2} />}
          {isNoteMode ? 'Note' : 'Record'}
        </span>
      </div>

      <p className="capture__prompt">{activeLesson.question}</p>
      <p className="capture__hint">{activeLesson.hint} <span className="capture__optional">(optional)</span></p>

      {isNoteMode ? (
        <div className="capture__input-area">
          <textarea
            className="capture__textarea"
            placeholder="Write your memory here... (not required)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
        </div>
      ) : (
        <>
          <div className="voice-controls">
            <button
              className={`voice-btn ${isRecording ? 'voice-btn--recording' : 'voice-btn--idle'}`}
              onClick={toggleRecording}
              disabled={!sttSupported}
              aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? <Square size={24} strokeWidth={2} /> : <Mic size={26} strokeWidth={2} />}
            </button>
            <span className={`voice-status ${isRecording ? 'voice-status--active' : ''}`}>
              {!sttSupported
                ? 'Voice input not supported in this browser. Please type your story instead.'
                : isRecording
                  ? 'Listening... tap to stop'
                  : 'Tap the microphone to speak your story'}
            </span>
          </div>
          <div className="capture__input-area">
            <textarea
              className="capture__textarea"
              placeholder="Your transcript will appear here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="capture__nav">
        <button className="btn btn--primary btn--large" onClick={handleSave}>
          Save &amp; Let AI Customize <Wand2 size={16} />
        </button>
      </div>
    </div>
  )
}

function AIProcessingScreen({ title, messages, onComplete }) {
  const msgs = messages || CUSTOMIZE_MESSAGES
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const duration = 2400
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      setStepIndex(Math.min(msgs.length - 1, Math.floor((elapsed / duration) * msgs.length)))
      if (pct >= 100) {
        clearInterval(timer)
        setTimeout(onComplete, 450)
      }
    }, 60)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen ai-processing">
      <div className="ai-processing__card">
        <div className="ai-processing__spinner">
          <Wand2 size={24} strokeWidth={2} />
        </div>
        <h2 className="ai-processing__title">{title}</h2>
        <p className="ai-processing__status">{msgs[stepIndex]}</p>
        <div className="ai-processing__progress">
          <div className="ai-processing__progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <button className="btn btn--ghost btn--sm" onClick={onComplete}>Skip</button>
      </div>
    </div>
  )
}

function EditStoryScreen({ lesson, draftText, onNavigate, onSaveReady }) {
  const activeLesson = lesson || SEED_LESSONS[0]
  const category = categoryOf(activeLesson.categoryId)
  const template = activeLesson.aiCaptions || CAPTION_TEMPLATES[category.id] || CAPTION_TEMPLATES.rule
  const initial = draftText?.trim() ? [draftText.trim(), ...template.slice(1)] : template

  const [captions, setCaptions] = useState(initial)

  const updateCaption = (i, value) => {
    setCaptions((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => onNavigate('category-detail')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header">
        <h1>Review Your Comic Script</h1>
        <p>AI turned "{activeLesson.question}" into panel captions. Edit anything before saving.</p>
      </div>

      <div className="edit-story__list">
        {captions.map((text, i) => (
          <div key={i} className="edit-story__panel">
            <span className="edit-story__panel-number">{i + 1}</span>
            <textarea
              className="edit-story__textarea"
              value={text}
              onChange={(e) => updateCaption(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="edit-story__actions">
        <button className="btn btn--ghost" onClick={() => setCaptions(template)}>
          <RefreshCw size={15} /> Regenerate with AI
        </button>
        <button className="btn btn--primary btn--large" onClick={() => onSaveReady(captions)}>
          Save as Ready <CheckCircle2 size={16} />
        </button>
      </div>
    </div>
  )
}

function ComicsScreen({ comics, isElder, onNavigate, onOpenComic }) {
  return (
    <div className="screen screen--wide">
      <div className="comics-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Comics</h1>
          <p>Every memory that's become a family comic.</p>
        </div>
        {isElder && (
          <button className="btn btn--primary" onClick={() => onNavigate('generate-comic')}>
            <Sparkles size={16} /> Generate Comic
          </button>
        )}
      </div>

      <div className="comics-grid">
        {comics.map((comic, i) => {
          const category = categoryOf(comic.categoryId)
          const thumb = PANELS[i % PANELS.length].src
          return (
            <button key={comic.id} className="comic-card" onClick={() => onOpenComic(comic)}>
              <div className="comic-card__thumb">
                <img src={thumb} alt={comic.title} />
              </div>
              <div className="comic-card__body">
                <span className="comic-card__category">{category.title}</span>
                <h3 className="comic-card__title">{comic.title}</h3>
                <div className="comic-card__meta">
                  <span>{comic.date}</span>
                  <span className={`badge badge--${comic.status}`}>
                    {comic.status === 'new' ? 'New' : 'Shared'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GenerateComicScreen({ lessons, onNavigate, onGenerate }) {
  const readyLessons = lessons.filter((l) => l.status === 'ready')
  const [selectedId, setSelectedId] = useState(readyLessons[0]?.id || null)

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => onNavigate('comics')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header">
        <h1>Generate a Comic</h1>
        <p>Choose a story that's ready, and AI will lay it out as a comic.</p>
      </div>

      {readyLessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <Wand2 size={22} strokeWidth={2} />
          </div>
          <h3>No stories are ready yet</h3>
          <p>Capture and edit a memory first — once it's ready, it'll show up here.</p>
          <button className="btn btn--primary" onClick={() => onNavigate('home')}>Go to Categories</button>
        </div>
      ) : (
        <>
          <div className="generate-list">
            {readyLessons.map((lesson) => {
              const category = categoryOf(lesson.categoryId)
              const Icon = category.icon
              const active = selectedId === lesson.id
              return (
                <button
                  key={lesson.id}
                  className={`generate-option ${active ? 'generate-option--active' : ''}`}
                  onClick={() => setSelectedId(lesson.id)}
                >
                  <div className="generate-option__icon">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="generate-option__body">
                    <span className="generate-option__category">{category.title}</span>
                    <p className="generate-option__question">{lesson.question}</p>
                  </div>
                  <span className={`generate-option__radio ${active ? 'generate-option__radio--active' : ''}`} />
                </button>
              )
            })}
          </div>
          <button
            className="btn btn--primary btn--large"
            disabled={!selectedId}
            onClick={() => onGenerate(selectedId)}
          >
            Generate Comic <Sparkles size={16} />
          </button>
        </>
      )}
    </div>
  )
}

function ComicPreviewScreen({ onNavigate, comic }) {
  return (
    <div className="screen comic">
      <button className="back-btn" onClick={() => onNavigate('comics')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>{comic ? comic.title : 'A Life Lesson'}</h1>
        <p>Your memory, told one panel at a time</p>
      </div>

      <div className="comic__chars">
        <span className="char-chip char-chip--elder"><UserRound size={14} /> Grandfather</span>
        <span className="char-chip char-chip--child"><Users size={14} /> Grandson</span>
      </div>

      <div className="comic__frame">
        <PanelSlider panels={PANELS} />
      </div>

      <div className="comic__actions">
        <button className="btn btn--primary btn--large" onClick={() => onNavigate('shared-viewing')}>
          <Tv size={17} /> Watch Together with Family
        </button>
        <button className="btn btn--secondary btn--large" onClick={() => onNavigate('conversation')}>
          <MessageCircle size={17} /> Start a Conversation
        </button>
        <button className="btn btn--outline btn--large" onClick={() => onNavigate('grandchild-hub')}>
          <Share2 size={17} /> Share with Grandchildren
        </button>
      </div>
    </div>
  )
}

function GrandchildHubScreen({ onNavigate, onToast, initialTopic }) {
  const [selectedTopic, setSelectedTopic] = useState('')
  const [customRequest, setCustomRequest] = useState(initialTopic || '')
  const [reaction, setReaction] = useState('')
  const [questions, setQuestions] = useState([
    { from: 'child', text: 'Did you really walk 3 miles every day?' },
    { from: 'elder', text: 'Yes beta, and I loved every step!' },
  ])
  const [newQuestion, setNewQuestion] = useState('')

  const sendRequest = () => {
    const topic = customRequest || selectedTopic
    if (!topic) return
    onToast(`Story request sent: "${topic}"`)
    setCustomRequest('')
    setSelectedTopic('')
  }

  const askQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions((q) => [...q, { from: 'child', text: newQuestion }])
    setNewQuestion('')
    onToast('Question sent to Grandma!')
  }

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header">
        <h1>Grandchild Hub</h1>
        <p>Request stories, react, and ask follow-up questions.</p>
      </div>

      <div className="card request-form">
        <h3 className="section-title">Request a Story</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          What are you curious about?
        </p>
        <div className="topic-chips">
          {TOPIC_SUGGESTIONS.map((topic) => (
            <button
              key={topic}
              className={`topic-chip ${selectedTopic === topic ? 'topic-chip--active' : ''}`}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <input
            className="form-input"
            placeholder="Or type your own topic..."
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
          />
        </div>
        <button className="btn btn--primary" onClick={sendRequest} style={{ width: '100%' }}>
          <Mail size={16} /> Send Request to Grandma
        </button>
      </div>

      <h3 className="section-title">React to a Story</h3>
      <div className="reaction-bar">
        {REACTIONS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            className={`reaction-btn ${reaction === key ? 'reaction-btn--active' : ''}`}
            onClick={() => { setReaction(key); onToast(`You reacted: ${label}`) }}
            aria-label={label}
            title={label}
          >
            <Icon size={18} strokeWidth={2} />
          </button>
        ))}
      </div>

      <h3 className="section-title">Ask a Follow-up</h3>
      <div className="question-list">
        {questions.map((q, i) => (
          <div key={i} className={`question-bubble question-bubble--${q.from}`}>
            {q.text}
          </div>
        ))}
      </div>
      <div className="question-input-row">
        <input
          className="form-input"
          placeholder="Ask Grandma a question..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button className="btn btn--primary btn--icon-only" onClick={askQuestion} aria-label="Send">
          <Send size={17} />
        </button>
      </div>

      <button
        className="btn btn--secondary btn--large"
        style={{ marginTop: 24 }}
        onClick={() => onNavigate('home')}
      >
        <PenLine size={16} /> Add My Own Version of the Story
      </button>
    </div>
  )
}

function SharedViewingScreen({ onNavigate }) {
  return (
    <div className="screen viewing">
      <button className="back-btn" onClick={() => onNavigate('comics')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>Watch Together</h1>
        <p>View the comic as a family — on a call or screen-share</p>
      </div>

      <div className="viewing__stage">
        <PanelSlider panels={PANELS}>
          <div className="viewing__live">
            <Radio size={13} strokeWidth={2.5} />
            Live
          </div>
          <div className="viewing__participants">
            <span className="participant participant--1">G</span>
            <span className="participant participant--2">S</span>
            <span className="participant participant--3">A</span>
          </div>
        </PanelSlider>
      </div>

      <button className="btn btn--primary btn--large" onClick={() => onNavigate('conversation')}>
        <MessageCircle size={17} /> This reminds me of... (Start Talking)
      </button>
    </div>
  )
}

function ConversationScreen({ onNavigate, onToast }) {
  const [activePrompt, setActivePrompt] = useState(null)

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => onNavigate('comics')}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="page-header">
        <h1>Keep the Conversation Going</h1>
        <p>The comic is just the beginning — tap a prompt to spark deeper dialogue.</p>
      </div>

      <div className="series-banner">
        <div className="series-banner__count">2</div>
        <div className="series-banner__label">comics in your family series</div>
      </div>

      <div className="conversation-prompts">
        {CONVERSATION_PROMPTS.map((p, i) => (
          <button
            key={i}
            className="conv-prompt"
            onClick={() => {
              setActivePrompt(i)
              onToast('Prompt shared with family!')
            }}
          >
            <div className="conv-prompt__label">{p.label}</div>
            <p className="conv-prompt__text">{p.text}</p>
          </button>
        ))}
      </div>

      {activePrompt !== null && (
        <div className="card active-prompt-card">
          <p className="active-prompt-card__text">
            "{CONVERSATION_PROMPTS[activePrompt].text}"
          </p>
          <button className="btn btn--primary" onClick={() => onNavigate('home')}>
            <Mic size={16} /> Record the Answer
          </button>
        </div>
      )}

      <button className="btn btn--outline btn--large" onClick={() => onNavigate('home')}>
        <Plus size={16} /> Add Another Story to the Series
      </button>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('welcome')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)

  const [lessons, setLessons] = useState(SEED_LESSONS)
  const [comics, setComics] = useState(SEED_COMICS)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [captureMode, setCaptureMode] = useState('note')
  const [draftText, setDraftText] = useState('')
  const [selectedComic, setSelectedComic] = useState(null)
  const [generateLessonId, setGenerateLessonId] = useState(null)
  const [requestTopic, setRequestTopic] = useState('')

  const navigate = (s) => setScreen(s)
  const showToast = (msg) => setToast(msg)

  const updateLesson = (id, patch) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setScreen('home')
    setToast(`Welcome, ${userData.name}!`)
  }

  const handleOpenCategory = (cat) => {
    setSelectedCategory(cat)
    navigate('category-detail')
  }

  const handleStartCapture = (lesson, mode) => {
    setSelectedLesson(lesson)
    setCaptureMode(mode)
    navigate('lesson-capture')
  }

  const handleCaptureSave = (text) => {
    setDraftText(text)
    navigate('ai-processing')
  }

  const handleAICustomizeComplete = () => {
    navigate('edit-story')
  }

  const handleEditReady = (lesson) => {
    setSelectedLesson(lesson)
    setDraftText('')
    navigate('edit-story')
  }

  const handleSaveReady = (captions) => {
    const target = selectedLesson || lessons[0]
    if (!target) {
      navigate('home')
      return
    }
    updateLesson(target.id, {
      status: 'ready',
      aiCaptions: captions,
      noteText: draftText?.trim() ? draftText.trim() : target.noteText,
    })
    setToast('Saved! Ready to generate a comic.')
    navigate(selectedCategory ? 'category-detail' : 'home')
  }

  const handleViewComicForLesson = (lesson) => {
    if (!lesson) return
    const comic = comics.find((c) => c.id === lesson.comicId)
    if (comic) {
      setSelectedComic(comic)
      navigate('comic-preview')
    }
  }

  const handleOpenComic = (comic) => {
    setSelectedComic(comic)
    navigate('comic-preview')
  }

  const handleRequestFromLesson = (lesson) => {
    setRequestTopic(lesson.question)
    navigate('grandchild-hub')
  }

  const handleConfirmGenerate = (lessonId) => {
    setGenerateLessonId(lessonId)
    navigate('comic-generating')
  }

  const handleGenerateComplete = () => {
    const lesson = lessons.find((l) => l.id === generateLessonId)
    if (!lesson) {
      navigate('comics')
      return
    }
    const newComic = {
      id: `c${Date.now()}`,
      lessonId: lesson.id,
      title: lesson.question,
      categoryId: lesson.categoryId,
      date: 'Just now',
      status: 'new',
    }
    setComics((prev) => [newComic, ...prev])
    updateLesson(lesson.id, { status: 'comic', comicId: newComic.id })
    setSelectedComic(newComic)
    setToast('Your comic is ready!')
    navigate('comic-preview')
  }

  const activeTab = COMICS_TAB_SCREENS.has(screen) ? 'comics' : HOME_TAB_SCREENS.has(screen) ? 'home' : null

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={navigate} />
      case 'login':
        return <LoginScreen onNavigate={navigate} onLogin={handleLogin} />
      case 'signup':
        return <SignupScreen onNavigate={navigate} onLogin={handleLogin} />
      case 'how-it-works':
        return <HowItWorksScreen onNavigate={navigate} user={user} />
      case 'home':
        return (
          <HomeScreen
            user={user}
            lessons={lessons}
            onNavigate={navigate}
            onOpenCategory={handleOpenCategory}
          />
        )
      case 'category-detail':
        return (
          <CategoryDetailScreen
            category={selectedCategory}
            lessons={lessons}
            isElder={user?.role === 'elder'}
            onNavigate={navigate}
            onNote={(lesson) => handleStartCapture(lesson, 'note')}
            onRecord={(lesson) => handleStartCapture(lesson, 'record')}
            onEdit={handleEditReady}
            onViewComic={handleViewComicForLesson}
            onRequest={handleRequestFromLesson}
          />
        )
      case 'lesson-capture':
        return (
          <LessonCaptureScreen
            lesson={selectedLesson}
            mode={captureMode}
            onNavigate={navigate}
            onSave={handleCaptureSave}
          />
        )
      case 'ai-processing':
        return (
          <AIProcessingScreen
            title={`Turning "${selectedLesson?.question}" into a script`}
            messages={CUSTOMIZE_MESSAGES}
            onComplete={handleAICustomizeComplete}
          />
        )
      case 'edit-story':
        return (
          <EditStoryScreen
            lesson={selectedLesson}
            draftText={draftText}
            onNavigate={navigate}
            onSaveReady={handleSaveReady}
          />
        )
      case 'comics':
        return (
          <ComicsScreen
            comics={comics}
            isElder={user?.role === 'elder'}
            onNavigate={navigate}
            onOpenComic={handleOpenComic}
          />
        )
      case 'generate-comic':
        return (
          <GenerateComicScreen
            lessons={lessons}
            onNavigate={navigate}
            onGenerate={handleConfirmGenerate}
          />
        )
      case 'comic-generating':
        return (
          <AIProcessingScreen
            title="Generating your comic"
            messages={GENERATE_MESSAGES}
            onComplete={handleGenerateComplete}
          />
        )
      case 'comic-preview':
        return <ComicPreviewScreen onNavigate={navigate} comic={selectedComic} />
      case 'grandchild-hub':
        return <GrandchildHubScreen onNavigate={navigate} onToast={showToast} initialTopic={requestTopic} />
      case 'shared-viewing':
        return <SharedViewingScreen onNavigate={navigate} />
      case 'conversation':
        return <ConversationScreen onNavigate={navigate} onToast={showToast} />
      default:
        return <WelcomeScreen onNavigate={navigate} />
    }
  }

  return (
    <div className="app">
      <Header user={user} onNavigate={navigate} activeTab={activeTab} />
      {renderScreen()}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}

export default App
