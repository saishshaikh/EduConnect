import React, { useState, useEffect } from "react";
import {
  IoClose,
  IoGlobeOutline,
  IoLogoGoogle,
  IoLogoYoutube,
  IoSchoolOutline,
  IoBookOutline,
  IoCodeSlashOutline,
  IoCompassOutline,
  IoBriefcaseOutline,
  IoSearchOutline,
  IoRocketOutline,
  IoSparkles,
  IoCheckmarkCircle,
} from "react-icons/io5";

export const DOMAIN_DETAILS = {
  ai: {
    id: "ai",
    title: "Artificial Intelligence & Machine Learning",
    badge: "Trending in 2026",
    color: "from-blue-600 via-indigo-600 to-purple-600",
    googleQuery: "Artificial Intelligence Machine Learning complete roadmap tutorials 2026",
    scholarQuery: "artificial intelligence deep learning neural networks research",
    youtubeQuery: "artificial intelligence full course for beginners to advanced",
    wikiQuery: "Artificial_intelligence",
    overview:
      "Artificial Intelligence (AI) and Machine Learning (ML) represent the frontier of modern technology, empowering computers to perceive, learn, reason, and solve complex problems autonomously. From Large Language Models (LLMs) and Generative AI to Computer Vision, Robotics, and Reinforcement Learning, AI is revolutionizing healthcare, finance, software engineering, scientific research, and academic discovery.",
    pillars: [
      {
        title: "Supervised & Unsupervised Learning",
        desc: "Foundational algorithms including Linear/Logistic Regression, Decision Trees, Random Forests, SVMs, K-Means Clustering, and PCA.",
      },
      {
        title: "Deep Learning & Neural Networks",
        desc: "Multi-layer Perceptrons (MLP), Convolutional Neural Networks (CNNs) for vision, and Recurrent Neural Networks (RNN/LSTM).",
      },
      {
        title: "Generative AI & Transformer Architectures",
        desc: "Self-attention mechanisms, GPT, BERT, Claude, Diffusion Models, Prompt Engineering, Fine-Tuning (LoRA), and RAG systems.",
      },
      {
        title: "Reinforcement Learning & AI Agents",
        desc: "Q-Learning, Policy Gradients, RLHF (Reinforcement Learning from Human Feedback), and Autonomous Multi-Agent Workflows.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Mathematics & Programming", items: ["Linear Algebra & Matrix Calculus", "Probability & Statistics", "Python (NumPy, Pandas, Matplotlib)"] },
      { stage: "Stage 2: Core Machine Learning", items: ["Scikit-Learn algorithms", "Feature Engineering", "Model Evaluation & Cross-Validation"] },
      { stage: "Stage 3: Deep Learning Frameworks", items: ["PyTorch & TensorFlow", "CNNs for Computer Vision", "Transformers & Hugging Face"] },
      { stage: "Stage 4: MLOps & GenAI Deployment", items: ["LangChain & LlamaIndex", "Vector Databases (Pinecone, Chroma)", "Docker, FastAPI & Cloud GPU Deployment"] },
    ],
    tools: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Hugging Face", "LangChain", "OpenAI API", "Jupyter", "CUDA", "Weights & Biases"],
    careers: ["AI/ML Research Scientist", "Machine Learning Engineer", "LLM Application Developer", "Computer Vision Specialist", "Data Scientist", "Prompt Engineer"],
    certifications: ["Stanford CS229 (Machine Learning)", "DeepLearning.AI Specialization (Andrew Ng)", "Fast.ai Practical Deep Learning", "Google Cloud Professional ML Engineer"],
  },
  programming: {
    id: "programming",
    title: "Computer Science & Software Development",
    badge: "Most In-Demand",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    googleQuery: "Computer Science software engineering full stack web development roadmap",
    scholarQuery: "software engineering algorithms distributed systems",
    youtubeQuery: "full stack web development complete course",
    wikiQuery: "Computer_science",
    overview:
      "Computer Science is the systematic study of computation, algorithmic problem solving, software architecture, data structures, and computer systems. Mastering software development enables engineers to build scalable web platforms, distributed cloud services, high-performance backends, and robust mobile applications that power the global digital economy.",
    pillars: [
      {
        title: "Data Structures & Algorithms (DSA)",
        desc: "Arrays, Linked Lists, Hash Tables, Trees, Graphs, Dynamic Programming, Sorting/Searching, and Big-O computational complexity.",
      },
      {
        title: "Full-Stack Web Architecture",
        desc: "Modern frontends (React, Next.js, TypeScript), high-throughput backends (Node.js, Go, Python, Java), REST & GraphQL APIs.",
      },
      {
        title: "System Design & Distributed Computing",
        desc: "Microservices architecture, Load Balancing, Caching (Redis), Message Queues (Kafka, RabbitMQ), Database Sharding & CAP Theorem.",
      },
      {
        title: "Database Management Systems",
        desc: "Relational DBs (PostgreSQL, MySQL), NoSQL Document Stores (MongoDB), ACID transactions, and Index Optimization.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Core Fundamentals", items: ["C / C++ or Java for memory concepts", "Object-Oriented Programming (OOP)", "Version Control with Git & GitHub"] },
      { stage: "Stage 2: DSA Mastery", items: ["LeetCode / Codeforces Problem Solving", "Time & Space Complexity Analysis", "Graph Algorithms & Dynamic Programming"] },
      { stage: "Stage 3: Full Stack Development", items: ["JavaScript / TypeScript & React", "Node.js / Express / Spring Boot", "SQL & Database Schema Modeling"] },
      { stage: "Stage 4: High-Scale Systems", items: ["High-Level & Low-Level System Design", "Docker & CI/CD Pipelines", "Cloud Microservices Deployment"] },
    ],
    tools: ["JavaScript/TypeScript", "Python", "Go", "C++", "React.js", "Node.js", "PostgreSQL", "MongoDB", "Git", "Docker", "Linux"],
    careers: ["Full Stack Developer", "Backend Systems Engineer", "Frontend Architect", "Software Development Engineer (SDE)", "DevOps Engineer"],
    certifications: ["Harvard CS50: Introduction to Computer Science", "Meta Full-Stack Developer Certificate", "AWS Certified Developer", "LeetCode 75 Mastery"],
  },
  datascience: {
    id: "datascience",
    title: "Data Science & Big Data Analytics",
    badge: "High Growth",
    color: "from-emerald-500 via-teal-600 to-cyan-600",
    googleQuery: "Data Science Big Data machine learning analytics roadmap",
    scholarQuery: "data science predictive analytics machine learning statistical modeling",
    youtubeQuery: "data science full course Python SQL machine learning",
    wikiQuery: "Data_science",
    overview:
      "Data Science combines statistical analysis, domain expertise, and advanced machine learning to uncover hidden patterns, generate predictive insights, and drive data-informed decision-making from massive datasets. It plays a critical role in business intelligence, scientific discovery, financial forecasting, and recommendation engines.",
    pillars: [
      {
        title: "Exploratory Data Analysis (EDA)",
        desc: "Data cleaning, missing value imputation, outlier detection, distribution analysis, and statistical hypothesis testing.",
      },
      {
        title: "Statistical Modeling & Probability",
        desc: "Bayesian inference, Regression analysis, ANOVA, A/B Testing methodologies, and Monte Carlo simulations.",
      },
      {
        title: "Big Data Processing",
        desc: "Processing multi-terabyte datasets using Apache Spark, Hadoop, PySpark, Databricks, and Cloud Data Warehouses (Snowflake, BigQuery).",
      },
      {
        title: "Data Visualization & Storytelling",
        desc: "Translating complex metrics into interactive dashboards using Tableau, Power BI, Seaborn, Plotly, and D3.js.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Math & Analytics Foundation", items: ["Inferential Statistics & Probability", "Advanced SQL queries & Window Functions", "Python for Data Analysis (Pandas, NumPy)"] },
      { stage: "Stage 2: Visualization & Business Intelligence", items: ["Tableau / PowerBI Dashboards", "Data Storytelling & KPI Tracking", "A/B Testing Experiments"] },
      { stage: "Stage 3: Predictive Modeling", items: ["Feature Selection & Scaling", "Scikit-Learn Machine Learning Models", "Time-Series Forecasting (ARIMA, Prophet)"] },
      { stage: "Stage 4: Big Data & Production", items: ["PySpark on Distributed Clusters", "SQL Warehouses (BigQuery / Snowflake)", "Automated ETL Pipelines with Airflow"] },
    ],
    tools: ["Python", "R", "SQL", "Pandas", "Apache Spark", "Tableau", "Power BI", "Snowflake", "Google BigQuery", "Jupyter Lab"],
    careers: ["Data Scientist", "Big Data Engineer", "Business Intelligence Analyst", "Quantitative Researcher", "Analytics Consultant"],
    certifications: ["IBM Data Science Professional Certificate", "Google Advanced Data Analytics Certificate", "Databricks Certified Associate", "MIT MicroMasters in Statistics & Data Science"],
  },
  cloud: {
    id: "cloud",
    title: "Cloud Computing & DevOps Engineering",
    badge: "Enterprise Standard",
    color: "from-sky-500 via-blue-600 to-indigo-700",
    googleQuery: "Cloud Computing DevOps Kubernetes AWS Docker tutorial roadmap",
    scholarQuery: "cloud computing virtualization containerization microservices architecture",
    youtubeQuery: "DevOps full course Docker Kubernetes CI CD AWS",
    wikiQuery: "Cloud_computing",
    overview:
      "Cloud Computing and DevOps bridge software development and operations by providing automated infrastructure, infinite scalability, continuous integration, and serverless computing. Organizations rely on AWS, Azure, Google Cloud, Docker, and Kubernetes to deploy resilient, zero-downtime applications globally.",
    pillars: [
      {
        title: "Cloud Infrastructure (IaaS / PaaS / Serverless)",
        desc: "Virtual Machines, VPCs, Subnets, IAM security policies, Object Storage (S3), and Serverless functions (AWS Lambda).",
      },
      {
        title: "Containerization & Orchestration",
        desc: "Packaging microservices with Docker, managing multi-node clusters with Kubernetes (K8s), Helm charts, and Pod autoscaling.",
      },
      {
        title: "CI/CD & Infrastructure as Code (IaC)",
        desc: "Automating deployments with GitHub Actions, Jenkins, Terraform, Ansible, and GitOps workflows (ArgoCD).",
      },
      {
        title: "Observability & Site Reliability",
        desc: "Monitoring metrics, distributed tracing, and log aggregation with Prometheus, Grafana, ELK Stack, and OpenTelemetry.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Linux & Networking", items: ["Linux Shell Scripting & Bash", "TCP/IP, DNS, SSL/TLS, Reverse Proxies (Nginx)", "Git Collaboration"] },
      { stage: "Stage 2: Containerization & Cloud Core", items: ["Docker Multi-stage builds", "AWS / Azure core architecture (EC2, S3, IAM)", "Terraform IaC"] },
      { stage: "Stage 3: Kubernetes & CI/CD", items: ["Kubernetes Deployments, Services & Ingress", "GitHub Actions / GitLab CI Pipelines", "Helm Package Manager"] },
      { stage: "Stage 4: SRE & Production Hardening", items: ["Prometheus & Grafana Alerting", "Zero-trust Cloud Security", "Chaos Engineering & Disaster Recovery"] },
    ],
    tools: ["AWS", "Google Cloud (GCP)", "Microsoft Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "Linux"],
    careers: ["DevOps Engineer", "Cloud Solutions Architect", "Site Reliability Engineer (SRE)", "Infrastructure Engineer", "Platform Engineer"],
    certifications: ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)", "Google Cloud Professional Cloud Architect", "HashiCorp Certified Terraform Associate"],
  },
  cybersecurity: {
    id: "cybersecurity",
    title: "Cybersecurity, Ethical Hacking & InfoSec",
    badge: "Critical Security",
    color: "from-amber-500 via-orange-600 to-red-600",
    googleQuery: "Cybersecurity ethical hacking penetration testing network security roadmap",
    scholarQuery: "cybersecurity cryptography malware analysis vulnerability assessment",
    youtubeQuery: "cybersecurity full course ethical hacking network security",
    wikiQuery: "Computer_security",
    overview:
      "Cybersecurity focuses on protecting computer systems, networks, devices, and sensitive user data from malicious attacks, unauthorized access, ransomware, and cyber espionage. As interconnected digital systems expand, ethical hackers and security engineers are indispensable in fortifying defensive perimeters and detecting vulnerabilities.",
    pillars: [
      {
        title: "Network Security & Penetration Testing",
        desc: "Port scanning, vulnerability assessment, Wireshark packet analysis, Metasploit, OWASP Top 10 vulnerabilities, and Kali Linux.",
      },
      {
        title: "Cryptography & Public Key Infrastructure",
        desc: "Symmetric/Asymmetric encryption (AES, RSA), hashing algorithms (SHA-256), SSL/TLS handshakes, and Zero-Knowledge Proofs.",
      },
      {
        title: "Security Operations Center (SOC) & SIEM",
        desc: "Threat intelligence, malware analysis, incident response, digital forensics, and log monitoring (Splunk, Wireshark).",
      },
      {
        title: "Application & Cloud Security",
        desc: "Securing APIs, preventing SQL Injection, XSS, CSRF, IAM hardening, and enforcing DevSecOps automated scanning (SonarQube, Snyk).",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Networking & Operating Systems", items: ["CompTIA Network+ / Security+ concepts", "Linux CLI & Windows Active Directory", "TCP/IP, OSI model, Firewalls & VPNs"] },
      { stage: "Stage 2: Ethical Hacking & OWASP", items: ["Kali Linux & Burp Suite", "OWASP Web Security Testing", "TryHackMe / HackTheBox Labs"] },
      { stage: "Stage 3: Defensive Security (Blue Team)", items: ["SIEM tools & Log Analysis", "Malware Sandboxing & Forensics", "Incident Response Protocols"] },
      { stage: "Stage 4: Advanced Security & Auditing", items: ["Exploit Development & Reverse Engineering", "Cloud Security (AWS IAM / CloudTrail)", "Compliance (ISO 27001, SOC2)"] },
    ],
    tools: ["Kali Linux", "Wireshark", "Burp Suite", "Metasploit", "Nmap", "Splunk", "Ghidra", "Python Scripting", "Snort", "Hashcat"],
    careers: ["Cybersecurity Analyst", "Penetration Tester / Ethical Hacker", "Security Architect", "SOC Analyst", "Information Security Officer (CISO)"],
    certifications: ["CompTIA Security+", "Certified Ethical Hacker (CEH)", "Offensive Security Certified Professional (OSCP)", "CISSP (Certified Information Systems Security Professional)"],
  },
  design: {
    id: "design",
    title: "UI/UX & Digital Product Design",
    badge: "Creative & Tech",
    color: "from-pink-500 via-rose-600 to-purple-600",
    googleQuery: "UI UX design Figma product design user research design systems roadmap",
    scholarQuery: "human computer interaction user experience design usability heuristics",
    youtubeQuery: "UI UX design complete course Figma tutorial",
    wikiQuery: "User_experience_design",
    overview:
      "UI/UX Design combines psychology, visual aesthetics, human-computer interaction (HCI), and product strategy to craft intuitive, accessible, and delightful digital experiences. Great designers conduct user research, create wireframes, test prototypes, and architect scalable design systems that bridge engineering and human needs.",
    pillars: [
      {
        title: "User Research & Information Architecture",
        desc: "User interviews, persona creation, journey mapping, empathy maps, card sorting, and navigation tree structures.",
      },
      {
        title: "Visual Design & Design Systems",
        desc: "Color theory, typography scales, spacing grids, atomic component libraries, auto-layout, and dark mode design in Figma.",
      },
      {
        title: "Interactive Prototyping & Micro-animations",
        desc: "Creating high-fidelity clickable mockups, smart animations, transition timing curves, and mobile gesture interactions.",
      },
      {
        title: "Usability Testing & Accessibility (a11y)",
        desc: "WCAG 2.1 compliance, color contrast ratios, screen reader compatibility, cognitive heuristics, and A/B design validation.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Design Fundamentals", items: ["Design Principles (Contrast, Hierarchy, Alignment)", "Typography & Color Psychology", "Figma Fundamentals & Shortcuts"] },
      { stage: "Stage 2: UX Research & Wireframing", items: ["Conducting User Interviews", "Lo-Fi Wireframing & User Flows", "Information Architecture"] },
      { stage: "Stage 3: High-Fidelity & Design Systems", items: ["Figma Auto-Layout & Component Variants", "Building Token-based Design Systems", "Responsive Mobile & Desktop Layouts"] },
      { stage: "Stage 4: Prototyping & Usability Testing", items: ["Interactive Micro-animations", "Moderated Usability Testing", "Developer Handoff & Design Specs"] },
    ],
    tools: ["Figma", "Adobe XD", "Framer", "Miro", "Principle", "LottieFiles", "Notion", "Zeplin"],
    careers: ["Product Designer", "UI/UX Designer", "UX Researcher", "Design Systems Lead", "Interaction Designer", "Visual Experience Designer"],
    certifications: ["Google UX Design Professional Certificate", "Nielsen Norman Group (NN/g) UX Certification", "Interaction Design Foundation (IxDF)", "CalArts UI/UX Design Specialization"],
  },
  research: {
    id: "research",
    title: "Academic Research, STEM & Scientific Inquiry",
    badge: "Scholarly",
    color: "from-purple-500 via-violet-600 to-indigo-800",
    googleQuery: "academic research methodology literature review scientific publication guide",
    scholarQuery: "academic research methodologies scientific discovery statistical analysis",
    youtubeQuery: "how to write a research paper academic research methodology",
    wikiQuery: "Scientific_method",
    overview:
      "Academic Research pushes the boundaries of human knowledge through rigorous empirical observation, theoretical modeling, peer review, and mathematical validation. Students and professors collaborate to formulate hypotheses, review existing literature, conduct laboratory experiments, and publish groundbreaking papers in top scientific journals and conferences.",
    pillars: [
      {
        title: "Literature Review & Research Gap Analysis",
        desc: "Systematic querying of academic databases (IEEE, ACM, PubMed, Google Scholar, arXiv), reference management, and state-of-the-art synthesis.",
      },
      {
        title: "Experimental Design & Methodology",
        desc: "Quantitative and qualitative research protocols, control groups, reproducibility standards, and error margin calculations.",
      },
      {
        title: "Statistical Verification & Data Modeling",
        desc: "Hypothesis testing (p-values, confidence intervals), regression modeling, MATLAB / R simulations, and statistical power analysis.",
      },
      {
        title: "Scientific Writing & Peer Review",
        desc: "Authoring manuscripts using LaTeX (Overleaf), adhering to IEEE/ACM/APA formatting, peer review response, and conference presentations.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Scientific Methodology", items: ["Formulating Testable Hypotheses", "Systematic Literature Reviews (Google Scholar, arXiv)", "Zotero / Mendeley Reference Management"] },
      { stage: "Stage 2: Quantitative Data & Simulation", items: ["Statistical Significance Testing", "MATLAB / Python (SciPy, SymPy) simulations", "Data Collection & Ethical Protocols"] },
      { stage: "Stage 3: Scientific Typesetting", items: ["LaTeX & Overleaf Mastery", "Vector Plotting (Matplotlib, OriginLab)", "Structuring Introduction, Methods, Results, Discussion"] },
      { stage: "Stage 4: Publication & Peer Review", items: ["Submitting to High-Impact Journals / Conferences", "Navigating Double-Blind Peer Review", "Academic Grant Writing & Presenting"] },
    ],
    tools: ["LaTeX / Overleaf", "Google Scholar", "arXiv", "Zotero", "MATLAB", "R Studio", "SciPy", "Notion Academic", "Mendeley"],
    careers: ["Academic Professor / Faculty", "Research Scientist", "R&D Engineer", "Postdoctoral Fellow", "Quantitative Analyst", "Policy Researcher"],
    certifications: ["Stanford Research Methods & Statistics", "Nature Masterclasses in Scientific Writing", "NIH Research Ethics & Compliance", "Elsevier Researcher Academy"],
  },
  career: {
    id: "career",
    title: "Internships, Career Growth & Tech Interview Prep",
    badge: "Career Hub",
    color: "from-yellow-500 via-amber-600 to-orange-600",
    googleQuery: "tech interview preparation resume building internships career roadmap 2026",
    scholarQuery: "career development engineering education technical recruitment",
    youtubeQuery: "tech interview prep coding behavioral resume guide",
    wikiQuery: "Career_development",
    overview:
      "Navigating your career path in technology and academia requires structured preparation, impactful portfolio projects, networking with recruiters and mentors, and mastering technical and behavioral interviews. EduConnect empowers students to bridge the gap between classroom learning and top industry internships and full-time roles.",
    pillars: [
      {
        title: "ATS-Optimized Resume & Portfolio Architecture",
        desc: "Structuring impactful bullet points (Action + Context + Quantified Metric), crafting high-converting GitHub repositories and live portfolios.",
      },
      {
        title: "Technical Coding Interviews (DSA & Problem Solving)",
        desc: "Patterns: Two Pointers, Sliding Window, Fast & Slow Pointers, Monotonic Stack, Backtracking, Graphs, Dynamic Programming on LeetCode.",
      },
      {
        title: "System Design & Object-Oriented Design (OOD)",
        desc: "Designing URL shorteners, Rate Limiters, Chat Systems, and Streaming Platforms with scaling, concurrency, and DB design.",
      },
      {
        title: "Behavioral & Leadership Interviews (STAR Method)",
        desc: "Storytelling using Situation, Task, Action, Result; conflict resolution, teamwork dynamics, and Amazon Leadership Principles.",
      },
    ],
    roadmap: [
      { stage: "Stage 1: Resume & Personal Brand", items: ["Clean 1-Page Tech Resume (LaTeX / Jake's Template)", "Polished LinkedIn & EduConnect Profiles", "3 Showcase Projects with Live Demo & GitHub"] },
      { stage: "Stage 2: Core Coding Interview Prep", items: ["Blind 75 & NeetCode 150 Core Problems", "Time & Space Complexity Explanations", "Mock Interviews on Pramp / Peer Sessions"] },
      { stage: "Stage 3: System Design & Domain Depth", items: ["System Design Primer (Grokking Systems)", "Database Indexing & API Rate Limiting", "Object-Oriented Design Principles"] },
      { stage: "Stage 4: Strategic Application & Negotiation", items: ["Reaching out to Alumni & Tech Referrals", "STAR Method Behavioral Stories", "Offer Evaluation & Compensation Negotiation"] },
    ],
    tools: ["LeetCode", "NeetCode", "GitHub", "LinkedIn", "Overleaf Resume", "Pramp", "Glassdoor", "Levels.fyi", "Notion Tracker"],
    careers: ["Software Engineering Intern", "Associate Product Manager", "Data Analyst Intern", "Graduate Engineer Trainee (GET)", "Junior Security Analyst"],
    certifications: ["Cracking the Coding Interview Mastery", "Grokking the System Design Interview", "Google Technical Career Prep", "Harvard Career Strategy Series"],
  },
};

export default function DomainDetailModal({ isOpen, onClose, domainId }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "roadmap" | "search" | "careers"
  const [customSearchQuery, setCustomSearchQuery] = useState("");

  const domain = DOMAIN_DETAILS[domainId] || DOMAIN_DETAILS.ai;

  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setCustomSearchQuery(domain.title);
    }
  }, [isOpen, domainId, domain.title]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenGoogleSearch = (query = domain.googleQuery) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenGoogleScholar = () => {
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(domain.scholarQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenYouTube = () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(domain.youtubeQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenWiki = () => {
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(domain.wikiQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[880px] max-h-[92vh] bg-white dark:bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col animate-slideUp text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className={`relative p-6 sm:p-8 bg-gradient-to-r ${domain.color} text-white flex flex-col justify-between overflow-hidden flex-shrink-0`}>
          {/* Background Decorative Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 z-10 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/30">
                {domain.badge}
              </span>
              <span className="text-white/80 text-xs font-semibold">
                🎓 Academic Domain Deep Dive
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
              title="Close"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          <div className="z-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mb-2">
              {domain.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-[640px] leading-relaxed">
              Explore in-depth roadmaps, research pillars, Google search resources, tutorials, and career pathways.
            </p>
          </div>

          {/* Quick Direct Web Search Buttons */}
          <div className="flex items-center gap-2 flex-wrap mt-5 z-10">
            <button
              onClick={() => handleOpenGoogleSearch()}
              className="px-3.5 py-1.5 rounded-xl bg-white text-gray-900 hover:bg-blue-50 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <IoLogoGoogle className="w-4 h-4 text-[#4285F4]" />
              <span>Search on Google ↗</span>
            </button>

            <button
              onClick={handleOpenGoogleScholar}
              className="px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-md text-white text-xs font-bold border border-white/25 hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <IoSchoolOutline className="w-4 h-4 text-amber-300" />
              <span>Google Scholar Research ↗</span>
            </button>

            <button
              onClick={handleOpenYouTube}
              className="px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-md text-white text-xs font-bold border border-white/25 hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <IoLogoYoutube className="w-4 h-4 text-rose-400" />
              <span>YouTube Tutorials ↗</span>
            </button>

            <button
              onClick={handleOpenWiki}
              className="px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/40 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
            >
              <IoGlobeOutline className="w-3.5 h-3.5" />
              <span>Wikipedia ↗</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-[#262626] bg-gray-50/70 dark:bg-[#18181b]/70 px-4 sm:px-6 overflow-x-auto no-scrollbar flex-shrink-0">
          {[
            { id: "overview", label: "In-Depth Overview", icon: IoBookOutline },
            { id: "roadmap", label: "Learning Roadmap", icon: IoCompassOutline },
            { id: "search", label: "Live Google Web Search", icon: IoSearchOutline },
            { id: "careers", label: "Careers & Courses", icon: IoBriefcaseOutline },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? "border-[#0066ff] text-[#0066ff]"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar flex flex-col gap-6 text-xs">
          
          {/* TAB 1: IN-DEPTH OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Summary Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 leading-relaxed text-gray-800 dark:text-gray-200">
                <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <IoSparkles className="w-4 h-4" />
                  Executive Domain Brief
                </h4>
                <p className="text-xs sm:text-sm font-medium">
                  {domain.overview}
                </p>
              </div>

              {/* Core Pillars & Fundamentals */}
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066ff]" />
                  Core Knowledge Pillars & Foundations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {domain.pillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181b] border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between gap-2"
                    >
                      <h5 className="font-bold text-gray-900 dark:text-white text-xs">
                        {pillar.title}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Tools & Tech Stack */}
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
                  <IoCodeSlashOutline className="w-4 h-4 text-emerald-500" />
                  Industry-Standard Tools & Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {domain.tools.map((tool, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenGoogleSearch(`${domain.title} ${tool} tutorial documentation`)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#1c1c1e] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] font-semibold border border-gray-200/80 dark:border-gray-800 transition flex items-center gap-1.5 shadow-xs"
                      title={`Search ${tool} on Google`}
                    >
                      <span>{tool}</span>
                      <span className="text-[10px] text-gray-400">↗</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LEARNING ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1">
                  Structured Step-by-Step Learning Path
                </h4>
                <p className="text-gray-500 text-[11px]">
                  Follow this structured curriculum from zero to professional proficiency.
                </p>
              </div>

              <div className="flex flex-col gap-3.5">
                {domain.roadmap.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-[#18181b] border border-gray-200/80 dark:border-gray-800 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-xs sm:text-sm text-[#0066ff]">
                        {step.stage}
                      </h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/50 text-[#0066ff]">
                        Step {idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {step.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          onClick={() => handleOpenGoogleSearch(`${item} tutorial learn`)}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#121212] border border-gray-200/60 dark:border-gray-800 flex items-center justify-between gap-2 hover:border-[#0066ff] cursor-pointer group transition"
                          title="Search topic on Google"
                        >
                          <span className="font-medium text-[11px] text-gray-800 dark:text-gray-200 group-hover:text-[#0066ff] transition">
                            {item}
                          </span>
                          <IoSearchOutline className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0066ff] flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE GOOGLE WEB SEARCH HUB */}
          {activeTab === "search" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              
              {/* Search Box */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#18181b] dark:to-[#202025] border border-blue-100 dark:border-gray-800 flex flex-col gap-3">
                <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <IoLogoGoogle className="w-4 h-4 text-[#4285F4]" />
                  Custom Google Web Search Hub
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Search any specific question, syllabus concept, or project topic in {domain.title} directly on Google.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={`e.g. ${domain.title} interview questions & answers`}
                      value={customSearchQuery}
                      onChange={(e) => setCustomSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleOpenGoogleSearch(customSearchQuery);
                      }}
                      className="w-full h-11 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-3 text-xs outline-none focus:border-[#0066ff]"
                    />
                    <IoSearchOutline className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                  <button
                    onClick={() => handleOpenGoogleSearch(customSearchQuery)}
                    className="px-5 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Search Google</span>
                    <IoGlobeOutline className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Popular Search Shortcuts */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Recommended Search Queries & Topics
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    `Best free courses and certifications for ${domain.title} in 2026`,
                    `Top 50 technical interview questions in ${domain.title}`,
                    `Real-world open source projects in ${domain.title} for resume`,
                    `Research papers and state of the art in ${domain.title}`,
                    `Complete beginner to advanced cheatsheet for ${domain.title}`,
                  ].map((query, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenGoogleSearch(query)}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#18181b] border border-gray-200/80 dark:border-gray-800 hover:border-[#0066ff] hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer flex items-center justify-between gap-3 group transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <IoSearchOutline className="w-4 h-4 text-gray-400 group-hover:text-[#0066ff]" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#0066ff]">
                          {query}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#0066ff] group-hover:underline flex-shrink-0">
                        Search ↗
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CAREERS & TOP COURSES */}
          {activeTab === "careers" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Careers Grid */}
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoRocketOutline className="w-4 h-4 text-amber-500" />
                  Career Pathways & Job Roles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {domain.careers.map((career, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenGoogleSearch(`${career} job roles salary requirements`)}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#18181b] border border-gray-200/80 dark:border-gray-800 hover:border-amber-400 flex items-center justify-between cursor-pointer group transition"
                    >
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#0066ff]">
                        {career}
                      </span>
                      <span className="text-[10px] font-bold text-[#0066ff] group-hover:underline">
                        Explore Salary ↗
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Courses & Certificates */}
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoSchoolOutline className="w-4 h-4 text-[#0066ff]" />
                  Top Verified Courses & Certifications
                </h4>
                <div className="flex flex-col gap-2.5">
                  {domain.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenGoogleSearch(`${cert} course enrollment syllabus`)}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#18181b] border border-gray-200/80 dark:border-gray-800 hover:border-[#0066ff] flex items-center justify-between cursor-pointer group transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-[#0066ff]">
                          {cert}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#0066ff] group-hover:underline">
                        View Course ↗
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-[#18181b] border-t border-gray-100 dark:border-[#262626] flex items-center justify-between flex-shrink-0">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Powered by EduConnect Knowledge Graph & Google Search integration.
          </p>
          <button
            onClick={() => handleOpenGoogleSearch()}
            className="px-4 py-1.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <span>Google Search "{domain.title}"</span>
            <IoGlobeOutline className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
