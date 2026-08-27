export type ProjectStatus =
  | "planned"
  | "in_progress"
  | "validated"
  | "released";

export type RoadmapProject = {
  id: string;
  title: string;
  category:
    | "AI & Agents"
    | "Computer Vision & Robotics"
    | "IoT & Automation"
    | "Software, Web & Data";
  difficulty: 3 | 4 | 5;
  platforms: string[];
  releaseOrder: number;
  status: ProjectStatus;
  summary: string;
  prerequisites: string;
  validationCriteria: string;
};

export const ROADMAP_PROJECTS: RoadmapProject[] = [
  {
    id: "personal-ai-assistant",
    title: "Personal AI Assistant",
    category: "AI & Agents",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 1,
    status: "in_progress",
    summary:
      "A persistent, task-aware assistant workspace with real conversations and follow-up planning.",
    prerequisites:
      "Secure LLM service, authentication, database, and server-side rate limits.",
    validationCriteria:
      "Task flow, session persistence, response states, type checks, tests, and production build all pass.",
  },
  {
    id: "ai-coding-agent",
    title: "AI Coding Agent",
    category: "AI & Agents",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 2,
    status: "planned",
    summary:
      "A codebase-aware agent for planning, editing, testing, and reviewing isolated workspaces.",
    prerequisites:
      "Sandbox isolation, repository adapters, tool permissions, and model evaluation fixtures.",
    validationCriteria:
      "Safe edit, test, rollback, and repository policy scenarios pass in isolated fixtures.",
  },
  {
    id: "computer-use-agent",
    title: "Computer-Use AI Agent",
    category: "AI & Agents",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 3,
    status: "planned",
    summary:
      "A consent-first agent that perceives and acts in controlled desktop or browser environments.",
    prerequisites:
      "Secure runner, user approval gates, accessibility tree integration, and audit logging.",
    validationCriteria:
      "Permission boundaries, recovery paths, and benchmark workflows are independently verified.",
  },
  {
    id: "vision-voice-assistant",
    title: "Vision + Voice AI Assistant",
    category: "AI & Agents",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 4,
    status: "planned",
    summary:
      "A multimodal assistant combining camera, microphone, transcription, and visual reasoning.",
    prerequisites:
      "Consent UX, speech services, vision model adapters, and device testing matrix.",
    validationCriteria:
      "Audio/video permissions, transcription, visual prompts, and graceful fallback tests pass.",
  },
  {
    id: "ai-browser-automation-agent",
    title: "AI Browser Automation Agent",
    category: "AI & Agents",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 5,
    status: "planned",
    summary:
      "A browser task agent with explicit approval boundaries and structured run logs.",
    prerequisites:
      "Browser automation sandbox, policy engine, credentials vault, and replay fixtures.",
    validationCriteria:
      "Approved actions complete while sensitive and unapproved actions are blocked and logged.",
  },
  {
    id: "local-offline-assistant",
    title: "Local Offline AI Assistant",
    category: "AI & Agents",
    difficulty: 5,
    platforms: ["Windows", "macOS", "Linux"],
    releaseOrder: 6,
    status: "planned",
    summary:
      "A privacy-oriented assistant operating with local models and local document indexing.",
    prerequisites:
      "Cross-platform desktop shell, local model runtime, storage encryption, and hardware profile docs.",
    validationCriteria:
      "Offline installation, local inference, retrieval, and data-deletion flows work on supported systems.",
  },
  {
    id: "ai-automation-platform",
    title: "AI-Powered Automation Platform",
    category: "Software, Web & Data",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 7,
    status: "planned",
    summary:
      "A configurable automation platform with agentic workflows, approvals, and run history.",
    prerequisites:
      "Workflow engine, connectors, queues, authorization model, and observability.",
    validationCriteria:
      "Trigger, approval, retry, and audit scenarios pass against documented connectors.",
  },
  {
    id: "vision-robot-navigation",
    title: "Vision-Based Robot Navigation",
    category: "Computer Vision & Robotics",
    difficulty: 5,
    platforms: ["Linux", "ROS 2", "Supported robot hardware"],
    releaseOrder: 8,
    status: "planned",
    summary: "A simulation-first visual navigation stack for a mobile robot.",
    prerequisites:
      "ROS 2, simulator, calibration workflow, sensor interface, and safety envelope.",
    validationCriteria:
      "Simulation routes, obstacle handling, and emergency-stop behavior satisfy predefined tests.",
  },
  {
    id: "visual-tracking-robot",
    title: "Visual Object Tracking Robot",
    category: "Computer Vision & Robotics",
    difficulty: 5,
    platforms: ["Linux", "ROS 2", "Supported robot hardware"],
    releaseOrder: 9,
    status: "planned",
    summary:
      "A robot control stack that detects and follows a designated object.",
    prerequisites:
      "Camera calibration, control loop, tracking model, simulator, and hardware-safe limits.",
    validationCriteria:
      "Target acquisition, temporary occlusion recovery, and stop conditions pass in simulation.",
  },
  {
    id: "tinyml-edge-device",
    title: "TinyML Edge AI Device",
    category: "IoT & Automation",
    difficulty: 5,
    platforms: ["Embedded", "Windows", "macOS", "Linux"],
    releaseOrder: 10,
    status: "planned",
    summary:
      "A reproducible edge-inference workflow for a resource-constrained device.",
    prerequisites:
      "Target board, data-collection plan, model compression toolchain, and power measurement.",
    validationCriteria:
      "Model accuracy, memory footprint, latency, and device flashing are documented and repeatable.",
  },
  {
    id: "esp32-ai-voice-controller",
    title: "ESP32 AI Voice Controller",
    category: "IoT & Automation",
    difficulty: 5,
    platforms: ["ESP32", "Windows", "macOS", "Linux"],
    releaseOrder: 11,
    status: "planned",
    summary:
      "An ESP32 voice-control prototype with secure cloud or edge command routing.",
    prerequisites:
      "ESP32 board, audio hardware, wake-word approach, command protocol, and safety controls.",
    validationCriteria:
      "Provisioning, recognized command execution, failure reporting, and device reset tests pass.",
  },
  {
    id: "predictive-maintenance",
    title: "Predictive Maintenance System",
    category: "IoT & Automation",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux", "Industrial sensors"],
    releaseOrder: 12,
    status: "planned",
    summary:
      "A condition-monitoring and maintenance-risk platform with explainable alerts.",
    prerequisites:
      "Representative sensor data, failure labels, security model, alert policy, and evaluation baseline.",
    validationCriteria:
      "Data-quality checks, benchmark metrics, alert thresholds, and false-positive review are documented.",
  },
  {
    id: "plc-iot-digital-twin",
    title: "PLC + IoT Digital Twin",
    category: "IoT & Automation",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux", "PLC test environment"],
    releaseOrder: 13,
    status: "planned",
    summary:
      "A safe digital twin that visualizes and simulates PLC-linked industrial signals.",
    prerequisites:
      "PLC sandbox, protocol adapter, signal schema, simulator, and network segmentation.",
    validationCriteria:
      "Read-only telemetry, simulation fidelity checks, and fault isolation scenarios pass.",
  },
  {
    id: "cross-border-logistics",
    title: "Cross-Border Logistics Platform",
    category: "Software, Web & Data",
    difficulty: 5,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 14,
    status: "planned",
    summary:
      "A logistics coordination platform with shipment, document, and event tracking foundations.",
    prerequisites:
      "Domain model, compliance review, carrier adapters, roles, and audit requirements.",
    validationCriteria:
      "Traceable shipment lifecycle, role access, import/export validation, and reconciliation tests pass.",
  },
  {
    id: "multi-agent-task-manager",
    title: "Multi-Agent Task Manager",
    category: "AI & Agents",
    difficulty: 4,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 15,
    status: "planned",
    summary:
      "A task workspace that coordinates specialized agents with human review.",
    prerequisites:
      "Task graph, agent contracts, approval model, and observability.",
    validationCriteria:
      "Delegation, dependency, handoff, and failure-recovery scenarios pass.",
  },
  {
    id: "ai-research-agent",
    title: "AI Research Agent",
    category: "AI & Agents",
    difficulty: 4,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 16,
    status: "planned",
    summary:
      "A research assistant that gathers, cites, synthesizes, and exposes source provenance.",
    prerequisites:
      "Source connectors, citation policy, retrieval evaluation, and review workflow.",
    validationCriteria:
      "Source attribution, citation links, conflict handling, and citation-quality fixtures pass.",
  },
  {
    id: "personal-memory-ai",
    title: "Personal Memory AI",
    category: "AI & Agents",
    difficulty: 4,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 17,
    status: "planned",
    summary:
      "A user-controlled semantic memory layer with retrieval and deletion controls.",
    prerequisites:
      "Consent-led ingestion, encryption, vector storage, retention policy, and access controls.",
    validationCriteria:
      "Opt-in ingestion, correct retrieval, deletion propagation, and export tests pass.",
  },
  {
    id: "smart-security-camera",
    title: "Smart Security Camera",
    category: "Computer Vision & Robotics",
    difficulty: 4,
    platforms: ["Web", "Linux", "Supported camera hardware"],
    releaseOrder: 18,
    status: "planned",
    summary:
      "An event-driven security camera system with privacy-aware monitoring controls.",
    prerequisites:
      "Camera pipeline, event storage, privacy policy, retention controls, and notification service.",
    validationCriteria:
      "Event detection, access rules, retention deletion, and offline-camera behavior pass.",
  },
  {
    id: "ai-traffic-monitoring",
    title: "AI Traffic Monitoring System",
    category: "Computer Vision & Robotics",
    difficulty: 4,
    platforms: ["Web", "Linux", "Supported camera hardware"],
    releaseOrder: 19,
    status: "planned",
    summary:
      "A traffic analytics system for counting, classification, and aggregate flow insights.",
    prerequisites:
      "Permitted video data, detection model, calibration, anonymization plan, and dashboard.",
    validationCriteria:
      "Counting accuracy, privacy filters, ingestion resilience, and report calculations pass.",
  },
  {
    id: "gesture-controlled-computer",
    title: "AI Gesture-Controlled Computer",
    category: "Computer Vision & Robotics",
    difficulty: 4,
    platforms: ["Windows", "macOS", "Linux"],
    releaseOrder: 20,
    status: "planned",
    summary:
      "A configurable gesture-control utility with visible feedback and accessibility safeguards.",
    prerequisites:
      "Camera permissions, gesture model, OS input adapter, calibration, and escape controls.",
    validationCriteria:
      "Calibration, gesture recognition, accidental-action prevention, and emergency disable tests pass.",
  },
  {
    id: "industrial-iot-dashboard",
    title: "Industrial IoT Dashboard",
    category: "IoT & Automation",
    difficulty: 4,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 21,
    status: "planned",
    summary:
      "A monitored dashboard for industrial telemetry, alarms, and historical trends.",
    prerequisites:
      "Telemetry contract, device gateway, alert rules, roles, and data-retention policy.",
    validationCriteria:
      "Live updates, threshold alerts, historical views, access controls, and unavailable-device states pass.",
  },
  {
    id: "ai-ecommerce-decision-engine",
    title: "AI E-commerce Decision Engine",
    category: "Software, Web & Data",
    difficulty: 4,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 22,
    status: "planned",
    summary:
      "A transparent decision-support system for catalog, demand, and inventory analysis.",
    prerequisites:
      "Authorized commerce data, forecasting baseline, explanation model, and privacy review.",
    validationCriteria:
      "Data import, baseline comparison, explanation visibility, and report reproducibility pass.",
  },
  {
    id: "collaborative-web-app",
    title: "Real-Time Collaborative Web App",
    category: "Software, Web & Data",
    difficulty: 4,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 23,
    status: "planned",
    summary:
      "A shared workspace with real-time presence, edits, and conflict handling.",
    prerequisites:
      "Realtime transport, authorization, conflict model, performance baseline, and audit policy.",
    validationCriteria:
      "Concurrent edit, disconnect/reconnect, access-control, and load tests pass.",
  },
  {
    id: "ai-pdf-document-agent",
    title: "AI PDF/Document Agent",
    category: "AI & Agents",
    difficulty: 3,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 24,
    status: "planned",
    summary:
      "A document assistant for extraction, question answering, and traceable document citations.",
    prerequisites:
      "File validation, extraction pipeline, storage policy, LLM adapter, and citation schema.",
    validationCriteria:
      "Upload validation, extraction accuracy fixtures, citation links, and deletion tests pass.",
  },
  {
    id: "human-pose-analysis",
    title: "Human Pose Analysis System",
    category: "Computer Vision & Robotics",
    difficulty: 3,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 25,
    status: "planned",
    summary:
      "A pose-estimation application focused on visualized movement analytics.",
    prerequisites:
      "Permitted datasets, pose model, calibration, accessibility guidance, and privacy controls.",
    validationCriteria:
      "Pose benchmark, confidence display, low-light handling, and consent controls pass.",
  },
  {
    id: "esp32-smart-home-hub",
    title: "ESP32 Smart Home Hub",
    category: "IoT & Automation",
    difficulty: 3,
    platforms: ["ESP32", "Web", "Windows", "macOS", "Linux"],
    releaseOrder: 26,
    status: "planned",
    summary: "An ESP32-based hub for opt-in sensor and actuator control.",
    prerequisites:
      "Hardware bill of materials, provisioning, local network policy, and device protocol.",
    validationCriteria:
      "Pairing, secure command routing, device state updates, and factory reset pass.",
  },
  {
    id: "iot-environmental-monitor",
    title: "IoT Environmental Monitoring System",
    category: "IoT & Automation",
    difficulty: 3,
    platforms: ["ESP32", "Web", "Windows", "macOS", "Linux"],
    releaseOrder: 27,
    status: "planned",
    summary:
      "A sensor-to-dashboard system for environmental observations and threshold alerts.",
    prerequisites:
      "Sensors, calibration method, ingestion endpoint, dashboard, and notification policy.",
    validationCriteria:
      "Calibration records, telemetry integrity, alert delivery, and sensor-loss behavior pass.",
  },
  {
    id: "realtime-object-detection",
    title: "Real-Time Object Detection System",
    category: "Computer Vision & Robotics",
    difficulty: 3,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 28,
    status: "planned",
    summary:
      "A real-time object-detection application with confidence and performance telemetry.",
    prerequisites:
      "Model adapter, camera handling, device test matrix, and sample data policy.",
    validationCriteria:
      "Detection benchmark, latency measurement, permission errors, and CPU fallback pass.",
  },
  {
    id: "face-recognition-attendance",
    title: "Face Recognition + Attendance System",
    category: "Computer Vision & Robotics",
    difficulty: 3,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 29,
    status: "planned",
    summary:
      "A consent-first attendance prototype with explicit biometric governance requirements.",
    prerequisites:
      "Legal/privacy review, consent workflow, biometric security plan, liveness controls, and opt-out process.",
    validationCriteria:
      "Only after appropriate governance approval: consent, liveness, accuracy, deletion, and audit controls pass.",
  },
  {
    id: "developer-dashboard",
    title: "Personal Developer Dashboard",
    category: "Software, Web & Data",
    difficulty: 3,
    platforms: ["Web", "Windows", "macOS", "Linux"],
    releaseOrder: 30,
    status: "planned",
    summary:
      "A personal workspace for project visibility, developer metrics, and configurable shortcuts.",
    prerequisites:
      "Data adapters, user preferences, local caching policy, and accessible visualizations.",
    validationCriteria:
      "Data refresh, empty states, preference persistence, and visual accessibility checks pass.",
  },
];

export const roadmapStatusLabel: Record<ProjectStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  validated: "Validated",
  released: "Released",
};
