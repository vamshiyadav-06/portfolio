/**
 * Portfolio Configuration & Verified Data for Vamshi Budida
 * Positioned as: AI + Full Stack Engineer
 */

const PORTFOLIO_DATA = {
  personal: {
    name: "Vamshi Budida",
    title: "AI Engineer | Python Developer",
    positioning: "AI + Full Stack Engineer",
    statement: "I build intelligent applications, autonomous AI agents, and production-oriented software using modern AI, Python, robust backend architectures, and full-stack systems.",
    email: "vamshiyadav1905@gmail.com",
    github: "https://github.com/vamshiyadav-06",
    linkedin: "https://www.linkedin.com/in/vamshi-budida-087151425/",
    resumeUrl: "https://drive.google.com/file/d/1Cw5zAYogBXlEXsfJ7XzEkQovW-t6K0sp/view?usp=sharing",
    avatar: "assets/vamshi-profile.jpg",
    statusBadge: "Available for AI & Full Stack Roles",
    languages: ["Python", "SQL"]
  },

  admin: {
    authorizedEmail: "vamshiyadav1905@gmail.com",
    googleClientId: "452935950182-tjr2ktjhus4mc5cr8caigqsm2c77fbu8.apps.googleusercontent.com"
  },

  about: {
    headline: "Engineering intelligent, production-ready AI systems and resilient backend services.",
    bio: [
      "I am a Computer Science & Engineering graduate specializing in AI engineering, Python backend development, and modern full-stack architectures. My technical journey centers around building practical, high-throughput systems—spanning autonomous agents, Retrieval-Augmented Generation (RAG) pipelines, and intelligent automation bots.",
      "I emphasize deterministic engineering over fragile prototypes: constructing resilient FastAPI backends, vector search indexes with FAISS and pgvector, Supabase database schemas, and clean frontend interfaces. Having worked across the entire lifecycle—from data ingestion and prompt engineering to containerized deployments—I focus on real-world reliability and software craft."
    ],
    highlights: [
      { label: "Core Focus", value: "Generative AI & Agentic Workflows" },
      { label: "Backend", value: "FastAPI, Python, REST & Async" },
      { label: "Data & Vectors", value: "PostgreSQL, Supabase, FAISS" },
      { label: "Automation", value: "Playwright, Scrapers, Tool Use" }
    ]
  },

  skills: {
    programming: [
      { name: "Python", level: "Expert", icon: "code" },
      { name: "SQL", level: "Advanced", icon: "database" },
      { name: "Java", level: "Intermediate", icon: "cpu" },
      { name: "JavaScript", level: "Intermediate", icon: "layout" }
    ],
    aiMl: [
      { name: "PyTorch", level: "Advanced", icon: "brain" },
      { name: "Scikit-learn", level: "Advanced", icon: "activity" },
      { name: "XGBoost", level: "Proficient", icon: "trending-up" },
      { name: "LightGBM", level: "Proficient", icon: "zap" },
      { name: "YOLO", level: "Proficient", icon: "eye" }
    ],
    generativeAi: [
      { name: "LLMs & Prompt Engineering", level: "Advanced", icon: "sparkles" },
      { name: "RAG Architecture", level: "Advanced", icon: "layers" },
      { name: "LangChain & LangGraph", level: "Advanced", icon: "git-merge" },
      { name: "Autonomous AI Agents", level: "Advanced", icon: "bot" },
      { name: "MCP (Model Context Protocol)", level: "Proficient", icon: "share-2" },
      { name: "Embeddings & FAISS", level: "Advanced", icon: "compass" }
    ],
    backend: [
      { name: "FastAPI", level: "Advanced", icon: "server" },
      { name: "Django", level: "Intermediate", icon: "terminal" },
      { name: "REST APIs", level: "Advanced", icon: "network" },
      { name: "AsyncIO & Background Tasks", level: "Proficient", icon: "clock" }
    ],
    frontend: [
      { name: "Streamlit", level: "Advanced", icon: "monitor" },
      { name: "React", level: "Intermediate", icon: "atom" },
      { name: "HTML5 & CSS3", level: "Advanced", icon: "file-code" },
      { name: "JavaScript (ES6+)", level: "Intermediate", icon: "feather" }
    ],
    databases: [
      { name: "PostgreSQL", level: "Advanced", icon: "database" },
      { name: "Supabase", level: "Advanced", icon: "cloud" },
      { name: "SQLite", level: "Advanced", icon: "hard-drive" },
      { name: "pgvector", level: "Proficient", icon: "search" }
    ],
    toolsDeployment: [
      { name: "Git & GitHub", level: "Advanced", icon: "git-branch" },
      { name: "Docker", level: "Intermediate", icon: "package" },
      { name: "Playwright Automation", level: "Advanced", icon: "play" },
      { name: "Render & Vercel", level: "Proficient", icon: "cloud-rain" },
      { name: "Streamlit Cloud", level: "Advanced", icon: "upload-cloud" }
    ]
  },

  projects: [
    {
      id: "ai-recruitment-portal",
      title: "AI Recruitment Portal",
      category: "agentic-genai",
      categoryLabel: "Generative AI & Backend",
      summary: "AI-assisted end-to-end recruitment platform with candidate resume parsing, structured skill extraction, role fit scoring, and hiring dashboard.",
      techStack: ["TypeScript", "Python", "FastAPI", "Supabase", "LLMs"],
      githubUrl: "https://github.com/vamshiyadav-06/AI-Recruitment-Portal",
      liveUrl: null,
      featured: true,
      caseStudy: {
        problem: "Recruiters and hiring managers spend hours manually reviewing hundreds of heterogeneous resumes, leading to screening bottlenecks, subjective skill assessments, and delayed response cycles.",
        solution: "Engineered an AI-powered talent acquisition pipeline that automatically extracts candidate credentials from uploaded CVs, standardizes competencies, and ranks candidates against job requirements with structured AI reasoning.",
        keyFeatures: [
          "Candidate resume ingestion and structured data extraction",
          "Automated skill matrix mapping against job descriptions",
          "AI-assisted evaluation feedback and candidate shortlisting",
          "Postgres-backed Supabase database for candidate records and status tracking",
          "FastAPI endpoints handling asynchronous file processing"
        ],
        architectureNodes: [
          { id: "client", label: "Recruiter Web App", type: "frontend", desc: "Interactive recruitment portal & candidate table" },
          { id: "api", label: "FastAPI Backend", type: "backend", desc: "Async ingestion & parsing orchestration" },
          { id: "ai", label: "AI Evaluation Engine", type: "ai", desc: "Prompt-engineered LLM candidate matcher" },
          { id: "db", label: "Supabase (PostgreSQL)", type: "database", desc: "Structured candidate profiles & application states" }
        ],
        architectureFlow: [
          { from: "client", to: "api", label: "Upload CV & Job Spec" },
          { from: "api", to: "ai", label: "Extracted Text & Criteria" },
          { from: "ai", to: "api", label: "Structured Scoring & Reasoning" },
          { from: "api", to: "db", label: "Persist Profile & Match Score" },
          { from: "db", to: "client", label: "Live Dashboard Updates" }
        ],
        engineeringConsiderations: [
          "Handling non-standard PDF formats, tables, and varied layout encodings without text truncation.",
          "Preventing LLM hallucinations by enforcing strict JSON output schemas for parsed candidate attributes.",
          "Protecting candidate data privacy and separating authentication contexts in Supabase."
        ]
      }
    },
    {
      id: "ai-auto-job-apply-bot",
      title: "AI Auto Job Apply Bot",
      category: "automation",
      categoryLabel: "Automation & Python",
      summary: "Autonomous job search and application engine that parses applicant resumes, matches open roles, and automates application submission via Playwright.",
      techStack: ["Python", "Playwright", "pdfplumber", "SQLite", "Streamlit"],
      githubUrl: "https://github.com/vamshiyadav-06/AI_Auto_Job_Apply_Agent",
      liveUrl: null,
      featured: true,
      caseStudy: {
        problem: "Navigating high volumes of repetitive job listings, screening requirements, and manually re-entering resume details into applicant tracking portals is tedious and time-inefficient.",
        solution: "Built a fully autonomous desktop-grade automation agent that parses PDF resumes using pdfplumber, scrapes job postings, calculates match scores between candidate skills and role demands, and automates the multi-step browser application flow.",
        keyFeatures: [
          "PDF resume parsing and automated technical competency extraction",
          "Automated job listing scraping and JD requirement analysis",
          "Algorithmic job matching and compatibility ranking engine",
          "Browser session handling and Playwright-driven form automation",
          "Local SQLite repository logging application histories, dates, and response statuses",
          "Streamlit dashboard for reviewing tracked applications and bot logs"
        ],
        architectureNodes: [
          { id: "resume", label: "Resume Parser (pdfplumber)", type: "frontend", desc: "Extracts raw text, headers, and competencies" },
          { id: "scraper", label: "Job Scraper & JD Analyzer", type: "ai", desc: "Collects open listings & target requirements" },
          { id: "matcher", label: "Match & Rank Engine", type: "backend", desc: "Scores skill overlap and priority thresholds" },
          { id: "bot", label: "Playwright Automation Bot", type: "ai", desc: "Automates browser navigation & form submission" },
          { id: "db", label: "SQLite Repository", type: "database", desc: "Stores applied roles, status logs & queue history" }
        ],
        architectureFlow: [
          { from: "resume", to: "matcher", label: "Parsed Skills Vector" },
          { from: "scraper", to: "matcher", label: "Scraped Role Specs" },
          { from: "matcher", to: "bot", label: "High-Rank Job Queue" },
          { from: "bot", to: "db", label: "Write Application Result" }
        ],
        engineeringConsiderations: [
          "Designed dynamic delays and human-like interaction patterns in Playwright to prevent anti-bot throttling.",
          "Implemented fallback form selectors for varied ATS input designs and multi-step dialogs.",
          "Maintained transactional database consistency in SQLite during long-running background scraping jobs."
        ]
      }
    },
    {
      id: "ai-research-assistant",
      title: "AI Research Assistant",
      category: "agentic-genai",
      categoryLabel: "Agentic AI & RAG",
      summary: "Multi-agent autonomous research assistant capable of web searching via Tavily, reading web pages, analyzing PDFs, and producing structured reports.",
      techStack: ["FastAPI", "Streamlit", "LangChain", "Groq", "FAISS", "Tavily Search"],
      githubUrl: "https://github.com/vamshiyadav-06/AI_Research_Assistant",
      liveUrl: null,
      featured: true,
      caseStudy: {
        problem: "Synthesizing deep information across multiple web articles, live data sources, and dense PDF technical documents is cognitively demanding and prone to omission.",
        solution: "Created an autonomous research agent featuring a Planner, Executor, and Reflection loop. The system orchestrates live web searches via Tavily, reads external web pages, queries indexed PDF documents using FAISS, and compiles coherent synthesis documents.",
        keyFeatures: [
          "Autonomous Planner & Executor agent architecture with self-reflection",
          "Live web searching with Tavily API integration",
          "Deep PDF document vectorization and semantic search with FAISS",
          "Automated synthesis and downloadable Word (.docx) document generation",
          "FastAPI modular service layer paired with an interactive Streamlit UI"
        ],
        architectureNodes: [
          { id: "ui", label: "Streamlit UI", type: "frontend", desc: "Research prompt input & real-time report viewer" },
          { id: "api", label: "FastAPI /agent & /ask", type: "backend", desc: "Agent lifecycle & task orchestration endpoints" },
          { id: "agent", label: "Planner & Reflection Loop", type: "ai", desc: "Decomposes goals into discrete research queries" },
          { id: "tools", label: "Tavily & PDF Tools", type: "ai", desc: "Live web search, web scraper, and FAISS index" },
          { id: "doc", label: "Docx Generator", type: "database", desc: "Formats finalized synthesized findings" }
        ],
        architectureFlow: [
          { from: "ui", to: "api", label: "Submit Research Query" },
          { from: "api", to: "agent", label: "Formulate Execution Plan" },
          { from: "agent", to: "tools", label: "Retrieve Web & PDF Context" },
          { from: "tools", to: "agent", label: "Synthesized Evidence" },
          { from: "agent", to: "doc", label: "Generate Report Document" },
          { from: "doc", to: "ui", label: "Deliver Final Output" }
        ],
        engineeringConsiderations: [
          "Mitigating context-window overflow by chunking search results and utilizing FAISS cosine similarity pruning.",
          "Implementing a reflection step where the agent critiques its own draft before presenting the final answer.",
          "Graceful degradation when external web search queries fail or rate-limit."
        ]
      }
    },
    {
      id: "ai-study-planner",
      title: "AI Study Planner",
      category: "agentic-genai",
      categoryLabel: "AI & Full Stack",
      summary: "Intelligent study schedule generator that tailors daily preparation milestones, topic allocations, and revision cadences based on student availability and exam timelines.",
      techStack: ["Python", "Streamlit", "Groq LLM", "Prompt Engineering"],
      githubUrl: "https://github.com/vamshiyadav-06/in_class_ai_study_planner",
      liveUrl: null,
      featured: true,
      caseStudy: {
        problem: "Students struggle to allocate realistic daily preparation time across complex syllabi, often experiencing burnout or under-preparing for critical topics.",
        solution: "Developed an interactive AI study scheduler that accepts exam deadlines, available hours per day, and topic difficulty ratings, generating structured milestones and adaptive revision intervals.",
        keyFeatures: [
          "Customizable study scope input (exam date, daily hours, subject breakdown)",
          "LLM-generated adaptive schedule with realistic pacing and revision intervals",
          "Interactive milestone checklist and daily breakdown view",
          "Low-latency response times utilizing Groq inference"
        ],
        architectureNodes: [
          { id: "ui", label: "Streamlit UI", type: "frontend", desc: "User constraints & difficulty inputs" },
          { id: "engine", label: "Prompt Engine", type: "ai", desc: "Formats structured schema & temporal constraints" },
          { id: "groq", label: "Groq LLM API", type: "backend", desc: "Fast inference generating day-by-day roadmap" }
        ],
        architectureFlow: [
          { from: "ui", to: "engine", label: "Exam Timeline & Subjects" },
          { from: "engine", to: "groq", label: "Structured Schedule Prompt" },
          { from: "groq", to: "ui", label: "Render Daily Timetable" }
        ],
        engineeringConsiderations: [
          "Enforcing temporal validity so generated plans never schedule past target exam dates.",
          "Structuring prompt outputs into clean JSON for reliable frontend calendar rendering."
        ]
      }
    },
    {
      id: "ai-travel-agent",
      title: "AI Travel Agent / Planner",
      category: "fullstack",
      categoryLabel: "Full Stack & AI",
      summary: "AI-assisted travel itinerary and budget planning application pairing a modular FastAPI backend with an intuitive Streamlit interface.",
      techStack: ["Python", "FastAPI", "Streamlit", "AI Workflow"],
      githubUrl: "https://github.com/vamshiyadav-06/ai-travel-agent",
      liveUrl: null,
      featured: true,
      caseStudy: {
        problem: "Trip planning requires cross-referencing geographic routes, activity times, dietary preferences, and budgetary limits across fragmented websites.",
        solution: "Built an end-to-end trip curation service that generates day-by-day itineraries, estimated cost breakdowns, and local points of interest according to traveler profiles.",
        keyFeatures: [
          "Destination preference and budget threshold input forms",
          "Multi-day chronological itinerary generation with morning, afternoon, and evening slots",
          "FastAPI backend microservice handling trip logic and validation",
          "Streamlit interactive presentation with exportable travel guides"
        ],
        architectureNodes: [
          { id: "fe", label: "Streamlit Frontend", type: "frontend", desc: "Trip parameter inputs & interactive schedule" },
          { id: "be", label: "FastAPI Backend", type: "backend", desc: "Validates trip parameters & orchestrates prompts" },
          { id: "llm", label: "AI Planning Layer", type: "ai", desc: "Generates geo-aware itineraries & budget estimates" }
        ],
        architectureFlow: [
          { from: "fe", to: "be", label: "Destination, Dates, Budget" },
          { from: "be", to: "llm", label: "Prompt Payload" },
          { from: "llm", to: "be", label: "Structured Itinerary JSON" },
          { from: "be", to: "fe", label: "Display Chronological Plan" }
        ],
        engineeringConsiderations: [
          "Decoupling the frontend interface from LLM providers via a clean FastAPI contract.",
          "Formatting output itineraries to ensure geographically logical day routes without backtracking."
        ]
      }
    },
    {
      id: "smart-city-india",
      title: "Smart City India",
      category: "ml-vision",
      categoryLabel: "Computer Vision & ML",
      summary: "Urban analytics and municipal intelligence platform leveraging computer vision (YOLO) and LightGBM models with interactive Plotly visualizations.",
      techStack: ["Python", "FastAPI", "Streamlit", "Plotly", "YOLO", "LightGBM"],
      githubUrl: "https://github.com/vamshiyadav-06/the_smart_city",
      liveUrl: null,
      featured: true,
      caseStudy: {
        problem: "Municipal planners lack unified, data-driven interfaces that combine computer-vision surveillance feeds with predictive tabular models for urban flow management.",
        solution: "Engineered a smart city dashboard integrating YOLO object detection for traffic/density estimation and LightGBM for predictive analytics, presented via responsive Plotly charts.",
        keyFeatures: [
          "Object detection pipeline using YOLO for vehicular and pedestrian flow monitoring",
          "Predictive modeling with LightGBM on municipal activity datasets",
          "Interactive geospatial and timeseries charts using Plotly",
          "Streamlit dashboard backed by FastAPI computation services"
        ],
        architectureNodes: [
          { id: "stream", label: "Visual/Tabular Data Feed", type: "frontend", desc: "Input video streams and municipal timeseries logs" },
          { id: "yolo", label: "YOLO Inference Engine", type: "ai", desc: "Detects objects, counts vehicles, and density levels" },
          { id: "lgbm", label: "LightGBM Predictor", type: "backend", desc: "Forecasts demand and congestion trends" },
          { id: "viz", label: "Streamlit + Plotly Dashboard", type: "database", desc: "Real-time interactive telemetry charts" }
        ],
        architectureFlow: [
          { from: "stream", to: "yolo", label: "Feed Frames" },
          { from: "stream", to: "lgbm", label: "Historical Features" },
          { from: "yolo", to: "viz", label: "Detection Counts" },
          { from: "lgbm", to: "viz", label: "Forecast Metrics" }
        ],
        engineeringConsiderations: [
          "Balancing model inference throughput with browser rendering performance.",
          "Using vectorized data manipulation to process historical sensor feeds efficiently."
        ]
      }
    }
  ],

  experience: [
    {
      role: "AI Engineer Intern",
      company: "Clyptus Software Solutions Pvt. Ltd.",
      location: "Hyderabad, India",
      startDate: "September 7, 2026",
      endDate: "Present",
      type: "Internship",
      description: "Contributing to the engineering and deployment of AI-powered solutions, backend systems, and automated services.",
      responsibilities: [
        "Developing and testing AI agent workflows and LLM-driven application features.",
        "Building modular FastAPI endpoints and backend data processing pipelines in Python.",
        "Collaborating on prompt engineering, structured output validation, and RAG architectures.",
        "Assisting with database schemas, query optimization, and integration of external APIs."
      ],
      technologies: ["Python", "FastAPI", "LLMs", "RAG", "Prompt Engineering", "SQL"]
    }
  ],

  education: [
    {
      degree: "B.Tech — Computer Science & Engineering",
      institution: "Mahaveer Institute of Science and Engineering",
      period: "2022 — 2026",
      graduationYear: "2026",
      cgpa: "7.21",
      location: "Hyderabad, India",
      coursework: [
        "Data Structures & Algorithms",
        "Database Management Systems",
        "Artificial Intelligence & Machine Learning",
        "Operating Systems",
        "Computer Networks",
        "Software Engineering"
      ]
    }
  ]
};

// Freeze object to prevent mutations
if (typeof Object.freeze === 'function') {
  Object.freeze(PORTFOLIO_DATA);
}
