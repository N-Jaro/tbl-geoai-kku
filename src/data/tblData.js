export const UI_TEXT = {
  en: {
    uniName: "TBL Classroom Studio",
    deptName: "Interactive Team-Based Learning Platform",
    courseCode: "GEOAI-402",
    courseTitle: "GeoAI & Spatial Deep Learning",
    tblSubtitle: "Team-Based Learning (TBL) Interactive Classroom",
    roleStudent: "Student View",
    roleInstructor: "Instructor Dashboard",
    teamLabel: "Active Team",
    selectModule: "Select Module",
    tblProcessOverview: "4-Step In-Class TBL Process",
    lockedStep: "Locked by Instructor",
    unlockHint: "Switch to Instructor Dashboard to unlock or advance phases.",
    steps: [
      { id: 1, key: "irat", short: "1. iRAT", name: "Individual Readiness Test", desc: "Individual multiple-choice test in class." },
      { id: 2, key: "trat", short: "2. tRAT / gRAT", name: "Team Scratch Test & Discussion", desc: "Discuss in teams and scratch IF-AT boxes (4 / 2 / 1 / 0 pts)." },
      { id: 3, key: "application", short: "3. 4S Case", name: "4S Application Exercise", desc: "Solve the same real-world GeoAI problem & raise choice cards simultaneously." },
      { id: 4, key: "peereval", short: "4. Peer Eval", name: "Weekly Peer Evaluation", desc: "Distribute 100 points and feedback to checked-in teammates." }
    ],
    prework: {
      learningOutcomes: "Learning Outcomes",
      materials: "Required Pre-Work Materials",
      sandboxTitle: "Interactive Spectral Index & Feature Explorer",
      sandboxDesc: "Experiment with Sentinel-2 surface reflectance bands before taking your iRAT.",
      readCheck: "Mark as Completed",
      completed: "Completed",
      readProgress: "Pre-work Readiness"
    },
    irat: {
      title: "Individual Readiness Assurance Test (iRAT)",
      subtitle: "Answer independently without notes. You may allocate 4 points across options (standard or confidence-weighted).",
      modeStandard: "Single Choice Mode (4 pts)",
      modeConfidence: "Confidence Allocation Mode (Split 4 pts)",
      submitBtn: "Submit Individual iRAT",
      submittedBadge: "iRAT Submitted",
      scoreLabel: "Your iRAT Score",
      resetBtn: "Retake / Reset iRAT"
    },
    trat: {
      title: "Team Readiness Assurance Test (tRAT — IF-AT Scratch Card)",
      subtitle: "Discuss as a team first! Click a foil box to scratch it. Find the ★ Star on the 1st try for 4 pts, 2nd try = 2 pts, 3rd try = 1 pt, 4th try = 0 pts.",
      teamScore: "Team tRAT Score",
      resetCard: "Reset Scratch Card",
      foundStar: "★ Correct Answer Found!",
      rationale: "GeoAI Concept Explanation",
      triesUsed: "attempts used"
    },
    clarification: {
      title: "Clarification & Team Appeals",
      subtitle: "Teams may appeal missed tRAT questions with scholarly/technical justification, or flag muddy GeoAI concepts for the instructor's mini-lecture.",
      submitAppeal: "Submit Team Appeal / Question",
      questionSelect: "Related Question / Concept",
      appealTextPlaceholder: "Cite pre-work reading, spectral formula, or architecture logic to support your team's reasoning...",
      currentAppeals: "Submitted Team Appeals & Muddy Points",
      instructorNote: "Instructor Mini-Lecture Focus",
      endorse: "Upvote / Also Confused"
    },
    application: {
      title: "4S Application Case Workshop",
      subtitle: "Significant Problem • Same Problem • Specific Choice • Simultaneous Report",
      fourSBadges: [
        { code: "S1", label: "Significant Problem", desc: "Authentic Isan / Mekong spatial challenge" },
        { code: "S2", label: "Same Problem", desc: "All teams analyze the exact same dataset & ROI" },
        { code: "S3", label: "Specific Choice", desc: "Teams must defend one concrete architecture/deployment choice" },
        { code: "S4", label: "Simultaneous Report", desc: "All teams lock choices before simultaneous reveal" }
      ],
      mapTitle: "Interactive Khon Kaen / Isan GeoAI Spatial Inspector",
      layerToggle: "Spatial Layers",
      teamDecisionTitle: "Lock Your Team's Specific Choice",
      rationaleLabel: "Technical Defense & Spatial Validation Strategy",
      rationalePlaceholder: "Explain how your team handles spatial autocorrelation, cloud cover, class imbalance, or edge deployment...",
      lockChoiceBtn: "Lock Team Decision for Simultaneous Report",
      revealSimultaneous: "Simultaneous Class Reveal (Gallery Walk)",
      hideSimultaneous: "Hide Other Teams (Prevent Anchoring)"
    },
    peereval: {
      title: "Peer Evaluation (Koles TBL Method)",
      subtitle: "Distribute exactly 100 points among your 4 teammates based on preparation, contribution to tRAT discussion, and 4S case collaboration. Avoid giving everyone 25 unless justified.",
      pointsRemaining: "Points Remaining to Allocate",
      quantTitle: "Quantitative Point Allocation (Total = 100)",
      qualTitle: "Qualitative Constructive Feedback",
      appreciateLabel: "One thing I appreciate about your contribution:",
      requestLabel: "One thing I request for our next TBL module:",
      submitEval: "Submit Peer Evaluation",
      submittedMsg: "Peer Evaluation recorded! Thank you for strengthening team accountability."
    },
    instructor: {
      title: "Instructor Control Center & Analytics",
      subtitle: "Manage live TBL pacing, compare iRAT vs. tRAT assurance gains, review team appeals, and trigger simultaneous 4S case reveals.",
      phaseControl: "Live Classroom Phase Control",
      unlockAll: "Unlock All Phases",
      lockFuture: "Lock Phases After Current",
      setCurrent: "Set Active",
      analyticsTitle: "Readiness Assurance Analytics (iRAT vs. tRAT)",
      avgIrat: "Class Avg iRAT",
      avgTrat: "Class Avg tRAT",
      gainLabel: "Team Synergy Gain",
      itemAnalysis: "Question-Level Item Analysis (Flag <60% iRAT for Clarification)",
      simultaneousControl: "4S Simultaneous Report Control",
      triggerReveal: "Trigger Simultaneous Reveal Now",
      exportCsv: "Export Session Grades (CSV)"
    }
  },
  th: {
    uniName: "ระบบห้องเรียน TBL Studio",
    deptName: "แพลตฟอร์มการเรียนรู้แบบเป็นทีมเชิงรุก",
    courseCode: "GEOAI-402",
    courseTitle: "GeoAI และการเรียนรู้เชิงลึกเชิงพื้นที่",
    tblSubtitle: "แพลตฟอร์มการเรียนรู้แบบเป็นทีม (Team-Based Learning)",
    roleStudent: "มุมมองนักศึกษา",
    roleInstructor: "แดชบอร์ดอาจารย์ผู้สอน",
    teamLabel: "ทีมปัจจุบัน",
    selectModule: "เลือกบทเรียน (Module)",
    tblProcessOverview: "กระบวนการ TBL ในชั้นเรียน 4 ขั้นตอน",
    lockedStep: "ขั้นตอนถูกล็อกโดยผู้สอน",
    unlockHint: "สลับไปยังแดชบอร์ดอาจารย์เพื่อปลดล็อกหรือเปลี่ยนขั้นตอน",
    steps: [
      { id: 1, key: "irat", short: "1. สอบเดี่ยว (iRAT)", name: "แบบทดสอบรายบุคคล (iRAT)", desc: "ทำข้อสอบปรนัยรายบุคคลในห้องเรียน" },
      { id: 2, key: "trat", short: "2. สอบทีม (tRAT)", name: "แบบทดสอบทีม (บัตรขูด IF-AT)", desc: "อภิปรายในทีมและขูดเลือกคำตอบรับผลสะท้อนทันที (4 / 2 / 1 / 0 คะแนน)" },
      { id: 3, key: "application", short: "3. โจทย์ประยุกต์ (4S)", name: "กรณีศึกษาประยุกต์ (หลัก 4S)", desc: "แก้ปัญหาเดียวกัน เลือกตัวเลือกที่ชัดเจน และชูป้ายคำตอบพร้อมกัน" },
      { id: 4, key: "peereval", short: "4. ประเมินเพื่อน", name: "ประเมินเพื่อนร่วมทีม", desc: "จัดสรร 100 คะแนนให้สมาชิกในกลุ่มประจำสัปดาห์" }
    ],
    prework: {
      learningOutcomes: "ผลลัพธ์การเรียนรู้ (Learning Outcomes)",
      materials: "สื่อการเรียนรู้ล่วงหน้าที่ต้องศึกษา",
      sandboxTitle: "เครื่องมือจำลองดัชนีสเปกตรัมดาวเทียม (Interactive Sandbox)",
      sandboxDesc: "ทดลองปรับค่าการสะท้อนแสงของดาวเทียม Sentinel-2 ก่อนเริ่มทำแบบทดสอบ iRAT",
      readCheck: "ทำเครื่องหมายว่าศึกษาแล้ว",
      completed: "ศึกษาเสร็จสิ้น",
      readProgress: "ความพร้อมก่อนเรียน"
    },
    irat: {
      title: "แบบทดสอบความพร้อมรายบุคคล (iRAT)",
      subtitle: "ตอบด้วยตนเองโดยไม่เปิดโพย สามารถเลือกโหมดตัวเลือกเดียว หรือโหมดกระจายคะแนนความมั่นใจ 4 คะแนน",
      modeStandard: "โหมดเลือกคำตอบเดียว (4 คะแนน)",
      modeConfidence: "โหมดกระจายความมั่นใจ (แบ่ง 4 คะแนน)",
      submitBtn: "ส่งคำตอบ iRAT รายบุคคล",
      submittedBadge: "ส่ง iRAT เรียบร้อยแล้ว",
      scoreLabel: "คะแนน iRAT ของคุณ",
      resetBtn: "ทำใหม่ / รีเซ็ต iRAT"
    },
    trat: {
      title: "แบบทดสอบความพร้อมระดับทีม (tRAT — บัตรขูด IF-AT)",
      subtitle: "อภิปรายร่วมกันในทีมก่อนคลิกขูด! หากพบดาว ★ ในครั้งที่ 1 ได้ 4 คะแนน, ครั้งที่ 2 = 2 คะแนน, ครั้งที่ 3 = 1 คะแนน, ครั้งที่ 4 = 0 คะแนน",
      teamScore: "คะแนนรวม tRAT ของทีม",
      resetCard: "รีเซ็ตบัตรขูดใหม่",
      foundStar: "★ พบคำตอบที่ถูกต้องแล้ว!",
      rationale: "คำอธิบายแนวคิดทาง GeoAI",
      triesUsed: "ครั้งที่ขูด"
    },
    clarification: {
      title: "การซักถามและยื่นอุทธรณ์ของทีม (Clarification & Appeals)",
      subtitle: "ทีมสามารถยื่นอุทธรณ์ข้อสอบที่มีหลักฐานทางวิชาการรองรับ หรือแจ้งหัวข้อที่ยังไม่เข้าใจเพื่อให้อาจารย์อธิบายเสริม",
      submitAppeal: "ส่งคำอุทธรณ์ / คำถามของทีม",
      questionSelect: "ข้อสอบหรือหัวข้อที่เกี่ยวข้อง",
      appealTextPlaceholder: "ระบุหลักฐานจากเอกสาร Pre-work สมการสเปกตรัม หรือเหตุผลทางสถาปัตยกรรมโมเดล...",
      currentAppeals: "รายการคำอุทธรณ์และประเด็นซักถามในชั้นเรียน",
      instructorNote: "ประเด็นที่อาจารย์เน้นย้ำ (Mini-Lecture)",
      endorse: "เห็นด้วย / สงสัยเหมือนกัน"
    },
    application: {
      title: "โจทย์ประยุกต์เชิงพื้นที่ตามหลัก 4S (Application Cases)",
      subtitle: "ปัญหาสำคัญ (Significant) • โจทย์เดียวกัน (Same) • ตัวเลือกชัดเจน (Specific) • รายงานพร้อมกัน (Simultaneous)",
      fourSBadges: [
        { code: "S1", label: "Significant Problem", desc: "โจทย์ปัญหาจริงในพื้นที่ขอนแก่นและลุ่มน้ำโขง" },
        { code: "S2", label: "Same Problem", desc: "ทุกทีมวิเคราะห์ชุดข้อมูลและพื้นที่ศึกษาเดียวกัน" },
        { code: "S3", label: "Specific Choice", desc: "ต้องตัดสินใจเลือกแนวทาง/โมเดลที่ชัดเจนเพียงข้อเดียว" },
        { code: "S4", label: "Simultaneous Report", desc: "ทุกทีมล็อกคำตอบและเปิดเผยผลพร้อมกันทั้งชั้นเรียน" }
      ],
      mapTitle: "แผนที่วิเคราะห์ข้อมูลเชิงพื้นที่ GeoAI (จ.ขอนแก่น)",
      layerToggle: "ชั้นข้อมูลแผนที่",
      teamDecisionTitle: "ล็อกคำตอบของทีม (Specific Choice)",
      rationaleLabel: "เหตุผลเชิงเทคนิคและกลยุทธ์การตรวจสอบความถูกต้องเชิงพื้นที่",
      rationalePlaceholder: "อธิบายวิธีจัดการ Spatial Autocorrelation, เมฆบดบัง, ความไม่สมดุลของคลาส หรือการนำไปใช้จริง...",
      lockChoiceBtn: "ยืนยันคำตอบของทีมเพื่อรอเปิดผลพร้อมกัน",
      revealSimultaneous: "แสดงคำตอบของทุกทีมพร้อมกัน (Simultaneous Reveal)",
      hideSimultaneous: "ซ่อนคำตอบทีมอื่น (ป้องกันการลอกแนวคิด)"
    },
    peereval: {
      title: "การประเมินเพื่อนร่วมทีม (Koles Method Peer Evaluation)",
      subtitle: "จัดสรรคะแนนรวม 100 คะแนนให้เพื่อนร่วมทีม 4 คนตามการเตรียมตัว การมีส่วนร่วมใน tRAT และการแก้โจทย์ 4S",
      pointsRemaining: "คะแนนที่เหลือที่ต้องจัดสรร",
      quantTitle: "การให้คะแนนเชิงปริมาณ (รวมต้องได้ 100 คะแนน)",
      qualTitle: "ข้อเสนอแนะเชิงคุณภาพอย่างสร้างสรรค์",
      appreciateLabel: "สิ่งที่ชื่นชมในการมีส่วนร่วมของเพื่อน:",
      requestLabel: "สิ่งที่อยากให้พัฒนาในบทเรียนถัดไป:",
      submitEval: "ส่งผลการประเมินเพื่อนร่วมทีม",
      submittedMsg: "บันทึกการประเมินเพื่อนเรียบร้อยแล้ว! ขอบคุณที่ช่วยสร้างความรับผิดชอบร่วมกันในทีม"
    },
    instructor: {
      title: "แผงควบคุมอาจารย์และวิเคราะห์ผลการเรียน",
      subtitle: "ควบคุมจังหวะการเรียน TBL เปรียบเทียบคะแนน iRAT กับ tRAT ตรวจสอบคำอุทธรณ์ และสั่งเปิดคำตอบ 4S พร้อมกัน",
      phaseControl: "ควบคุมการปลดล็อกขั้นตอนในชั้นเรียน",
      unlockAll: "ปลดล็อกทุกขั้นตอน",
      lockFuture: "ล็อกขั้นตอนถัดไปทั้งหมด",
      setCurrent: "ตั้งเป็นขั้นตอนปัจจุบัน",
      analyticsTitle: "สถิติเปรียบเทียบความพร้อม (iRAT เทียบกับ tRAT)",
      avgIrat: "ค่าเฉลี่ย iRAT ทั้งชั้น",
      avgTrat: "ค่าเฉลี่ย tRAT ทั้งชั้น",
      gainLabel: "คะแนนที่เพิ่มขึ้นจากการทำงานเป็นทีม",
      itemAnalysis: "วิเคราะห์รายข้อ (แจ้งเตือนข้อที่ iRAT ต่ำกว่า 60% เพื่ออธิบายเสริม)",
      simultaneousControl: "ควบคุมการเปิดผลโจทย์ประยุกต์ 4S พร้อมกัน",
      triggerReveal: "เปิดเผยคำตอบของทุกทีมพร้อมกันทันที",
      exportCsv: "ส่งออกคะแนนทั้งหมด (CSV)"
    }
  }
};

export const DEFAULT_CLASSES = [
  {
    id: "cls-geoai-402",
    courseCode: "GEOAI-402",
    courseName: "GeoAI & Spatial Deep Learning",
    instructorName: "Dr. Nathan (College of Computing)",
    semester: "Semester 1 / 2026",
    pin: "2026"
  },
  {
    id: "cls-gis-301",
    courseCode: "GIS-301",
    courseName: "Remote Sensing & Digital Image Processing",
    instructorName: "Assoc. Prof. Somchai (Geoinformatics)",
    semester: "Semester 1 / 2026",
    pin: "2026"
  },
  {
    id: "cls-sc-105",
    courseCode: "SC-105",
    courseName: "Environmental Data Science & Climate Modeling",
    instructorName: "Dr. Pimchanok (Faculty of Science)",
    semester: "Semester 1 / 2026",
    pin: "2026"
  }
];

export const DEFAULT_ROSTER = [];

export const TEAMS = [
  { id: "team-chi", name: "Team 1: Chi River Basin AI", thName: "ทีม 1: ลุ่มน้ำชี GeoAI", color: "#A73B24", members: [], defaultMemberIds: [], mockIratAvg: 0, mockTratScore: 0 },
  { id: "team-ubonrat", name: "Team 2: Ubol Ratana Vision", thName: "ทีม 2: อุบลรัตน์วิทัศน์", color: "#0284C7", members: [], defaultMemberIds: [], mockIratAvg: 0, mockTratScore: 0 },
  { id: "team-mittraphap", name: "Team 3: Mittraphap SpatialNet", thName: "ทีม 3: มิตรภาพสเปเชียลเน็ต", color: "#059669", members: [], defaultMemberIds: [], mockIratAvg: 0, mockTratScore: 0 },
  { id: "team-phuwiang", name: "Team 4: Phu Wiang GeoLab", thName: "ทีม 4: ภูเวียงจีโอแล็บ", color: "#7C3AED", members: [], defaultMemberIds: [], mockIratAvg: 0, mockTratScore: 0 }
];

export const MODULES = [
  {
    id: "mod-flood-cnn",
    classId: "cls-geoai-402",
    weekNumber: 1,
    code: "Week 1",
    title: {
      en: "Multispectral & SAR Deep Learning for Flood Mapping in Chi-Mun Basin",
      th: "การเรียนรู้เชิงลึกจากภาพหลายช่วงคลื่นและเรดาร์ SAR สำหรับทำแผนที่น้ำท่วมลุ่มน้ำชี-มูล"
    },
    duration: "3 Hours (1 TBL Cycle)",
    outcomes: {
      en: [
        "Explain why optical indices (NDWI/MNDWI) fail under persistent monsoon cloud cover and how Sentinel-1 SAR backscatter (VV/VH) resolves water boundaries.",
        "Diagnose spatial autocorrelation leakage when splitting training/validation patches in geospatial semantic segmentation (U-Net / SegFormer).",
        "Design an operational multi-modal flood mapping pipeline for Khon Kaen disaster response under strict inference latency and class imbalance constraints."
      ],
      th: [
        "อธิบายข้อจำกัดของดัชนีช่วงคลื่นแสง (NDWI/MNDWI) เมื่อมีเมฆปกคลุมในฤดูมรสุม และการใช้สัญญาณสะท้อนกลับเรดาร์ Sentinel-1 SAR (VV/VH) แยกขอบเขตน้ำ",
        "วิเคราะห์ปัญหาการรั่วไหลของข้อมูลจากสหสัมพันธ์เชิงพื้นที่ (Spatial Autocorrelation Leakage) เมื่อแบ่งชุดข้อมูลฝึกสอนและตรวจสอบในโมเดล U-Net",
        "ออกแบบระบบสกัดพื้นที่น้ำท่วมแบบหลอมรวมข้อมูลหลายแหล่ง (Multi-modal GeoAI) สำหรับรับมือภัยพิบัติในจังหวัดขอนแก่น"
      ]
    },
    preworkMaterials: [
      {
        id: "pw-1",
        type: "Reading",
        duration: "20 min",
        title: {
          en: "Tobler's First Law & Spatial Cross-Validation in GeoAI",
          th: "กฎข้อที่หนึ่งของ Tobler และการทำ Spatial Block Cross-Validation ในงาน GeoAI"
        },
        summary: {
          en: "Random pixel/patch splitting inflates test IoU by 12–25% because adjacent patches share atmospheric conditions, soil moisture, and topography. Spatial block partitioning (e.g., checkerboard or watershed-level splits) is mandatory for honest generalization assessment.",
          th: "การสุ่มแบ่งพิกเซลหรือแผ่นภาพ (Random Split) ทำให้ค่าความแม่นยำ IoU สูงเกินจริง 12–25% เนื่องจากพื้นที่ติดกันมีลักษณะภูมิประเทศและความชื้นใกล้เคียงกัน จึงต้องใช้การแบ่งตามบล็อกพื้นที่ (Spatial Block Split) หรือแบ่งตามลุ่มน้ำย่อย"
        },
        formula: "Moran's I > 0.65 across adjacent 256×256m Sentinel tiles"
      },
      {
        id: "pw-2",
        type: "Technical Note",
        duration: "25 min",
        title: {
          en: "Sentinel-2 Spectral Indices (NDWI, MNDWI) vs. Sentinel-1 SAR Backscatter",
          th: "การเปรียบเทียบดัชนีสเปกตรัม Sentinel-2 (NDWI, MNDWI) กับเรดาร์ Sentinel-1 SAR"
        },
        summary: {
          en: "Open calm water acts as a specular reflector at C-band SAR (5.4 GHz), producing very low VV and VH backscatter (<-18 dB). However, emergent paddy rice or wind-roughened water causes double-bounce backscatter, requiring multi-temporal SAR + DEM (HAND index) fusion.",
          th: "ผิวน้ำนิ่งจะสะท้อนคลื่นไมโครเวฟ C-band ออกไปในทิศทางตรงข้าม ทำให้ค่าการสะท้อนกลับ VV/VH ต่ำมาก (<-18 dB) แต่หากมีต้นข้าวโผล่พ้นน้ำหรือคลื่นลมแรงอาจเกิด Double-bounce จึงต้องใช้ข้อมูล DEM (ดัชนี HAND) ร่วมด้วย"
        },
        formula: "MNDWI = (Green - SWIR1) / (Green + SWIR1)"
      },
      {
        id: "pw-3",
        type: "Architecture Lab",
        duration: "15 min",
        title: {
          en: "U-Net Skip Connections & Dice/Focal Loss for Imbalanced Flood Masks",
          th: "โครงสร้าง U-Net Skip Connections และการใช้ Dice/Focal Loss แก้ปัญหาคลาสไม่สมดุล"
        },
        summary: {
          en: "In flood mapping, flooded pixels often represent <8% of the scene. Standard Cross-Entropy Loss biases the model toward predicting 'non-flood' everywhere (92% accuracy, 0% IoU on flood). Combining Dice Loss + Focal Loss directly optimizes boundary overlap (IoU).",
          th: "ในภาพถ่ายดาวเทียม พื้นที่น้ำท่วมมักมีสัดส่วนน้อยกว่า 8% การใช้ Cross-Entropy Loss ปกติทำให้โมเดลทายว่า 'ไม่ท่วม' ทั้งหมด การใช้ Dice Loss ร่วมกับ Focal Loss ช่วยบังคับให้โมเดลเรียนรู้ขอบเขตพื้นที่น้ำท่วมได้อย่างแม่นยำ"
        },
        formula: "Dice Loss = 1 - (2|Y ∩ Ŷ| + ε) / (|Y| + |Ŷ| + ε)"
      }
    ],
    questions: [
      {
        id: "q1",
        stem: {
          en: "A student trains a U-Net flood segmentation model on 5,000 image patches (256×256 px) extracted with 50% overlap from Khon Kaen province. Using an 80/20 random train/test split, the model achieves 94% IoU. When deployed on neighboring Maha Sarakham province during the same storm, IoU drops to 58%. What is the PRIMARY methodological flaw?",
          th: "นักศึกษาฝึกโมเดล U-Net สกัดพื้นที่น้ำท่วมจากแผ่นภาพ 5,000 แผ่น (ขนาด 256×256 พิกเซล ที่ตัดซ้อนทับกัน 50%) ในจังหวัดขอนแก่น โดยสุ่มแบ่ง Train/Test แบบ 80/20 ได้ค่า IoU สูงถึง 94% แต่เมื่อนำไปรันในจังหวัดมหาสารคามที่อยู่ติดกันในพายุลูกเดียวกัน ค่า IoU ตกเหลือ 58% ข้อผิดพลาดหลักคืออะไร?"
        },
        options: [
          {
            key: "A",
            en: "The U-Net encoder lacked batch normalization layers for SAR speckle noise.",
            th: "โครงสร้าง U-Net Encoder ไม่มีชั้น Batch Normalization สำหรับลดสัญญาณรบกวน Speckle"
          },
          {
            key: "B",
            en: "Spatial autocorrelation leakage: overlapping and adjacent patches in random splits violated independence between train and test sets.",
            th: "การรั่วไหลจากสหสัมพันธ์เชิงพื้นที่ (Spatial Autocorrelation Leakage): การสุ่มแบ่งแผ่นภาพที่ซ้อนทับและอยู่ติดกันทำให้ชุดข้อมูลฝึกและทดสอบไม่เป็นอิสระต่อกัน"
          },
          {
            key: "C",
            en: "Sentinel-2 SWIR bands have 20m resolution which cannot be resampled to 10m.",
            th: "ย่านความถี่ SWIR ของ Sentinel-2 มีความละเอียด 20 เมตร ซึ่งไม่สามารถปรับขนาดเป็น 10 เมตรได้"
          },
          {
            key: "D",
            en: "Cross-entropy loss over-weighted the minority flood class during training.",
            th: "ฟังก์ชัน Cross-entropy loss ให้ความสำคัญกับคลาสพื้นที่น้ำท่วมซึ่งเป็นส่วนน้อยมากเกินไป"
          }
        ],
        correct: "B",
        secondaryStars: [],
        isControversial: false,
        iratClassPct: 54,
        rationale: {
          en: "By Tobler's First Law, nearby pixels are highly correlated—especially with 50% patch overlap where identical pixels appear in both train and test sets! Spatial block cross-validation (e.g., splitting by district or sub-basin) is essential to measure true spatial generalization.",
          th: "ตามกฎของ Tobler พื้นที่ใกล้กันย่อมคล้ายกัน โดยเฉพาะเมื่อตัดภาพซ้อนทับกัน 50% ทำให้พิกเซลเดียวกันปรากฏทั้งในชุด Train และ Test จึงต้องแบ่งข้อมูลแบบ Spatial Block Cross-Validation (เช่น แบ่งตามอำเภอหรือลุ่มน้ำย่อย)"
        }
      },
      {
        id: "q2",
        stem: {
          en: "During peak monsoon flooding along the Chi River in October, 95% of Khon Kaen is covered by thick cumulonimbus clouds. Which primary sensor feature and physical mechanism allow reliable delineation of open floodwater beneath the clouds?",
          th: "ในช่วงน้ำท่วมสูงสุดริมแม่น้ำชีในเดือนตุลาคม พื้นที่ขอนแก่นกว่า 95% ถูกปกคลุมด้วยเมฆฝนหนาทึบ ข้อมูลใดและกลไกทางฟิสิกส์ใดที่ช่วยให้สกัดขอบเขตน้ำท่วมใต้เมฆได้อย่างแม่นยำ?"
        },
        options: [
          {
            key: "A",
            en: "Sentinel-2 NDWI using Near-Infrared (B8) absorption through cloud droplets.",
            th: "ดัชนี NDWI จาก Sentinel-2 โดยอาศัยการดูดกลืนแสง NIR (B8) ทะลุผ่านหยดน้ำในเมฆ"
          },
          {
            key: "B",
            en: "Landsat-9 Thermal Infrared (TIRS) surface temperature anomalies above clouds.",
            th: "ข้อมูลความร้อนพื้นผิว (Thermal Infrared) จากดาวเทียม Landsat-9 เหนือชั้นเมฆ"
          },
          {
            key: "C",
            en: "Sentinel-1 C-band SAR (VV/VH) active microwave penetration and specular reflection off smooth water surfaces (low dB backscatter).",
            th: "เรดาร์คลื่นไมโครเวฟแบบแอกทีฟ Sentinel-1 C-band SAR (VV/VH) ที่ทะลุเมฆได้ และเกิดการสะท้อนแบบกระจกเงา (Specular Reflection) บนผิวน้ำทำให้ค่าสะท้อนกลับต่ำมาก"
          },
          {
            key: "D",
            en: "PlanetScope RGB high-resolution daily optical mosaic with histogram stretching.",
            th: "ภาพสี RGB รายวันความละเอียดสูงจาก PlanetScope ที่ผ่านการปรับ Histogram Stretching"
          }
        ],
        correct: "C",
        iratClassPct: 78,
        rationale: {
          en: "C-band SAR (~5.6 cm wavelength) penetrates clouds and rain independently of solar illumination. Smooth open water reflects radar pulses away from the sensor (specular reflection), appearing dark (typically < -18 dB in VV).",
          th: "คลื่นไมโครเวฟ C-band (ความยาวคลื่น ~5.6 ซม.) ทะลุผ่านเมฆและทำงานได้ทั้งกลางวันและกลางคืน ผิวน้ำเรียบจะสะท้อนคลื่นเรดาร์หนีออกจากตัวรับสัญญาณ (Specular Reflection) ทำให้ปรากฏเป็นสีมืดที่มีค่า dB ต่ำมาก (< -18 dB)"
        }
      },
      {
        id: "q3",
        stem: {
          en: "In a scene covering Mueang Khon Kaen, flooded pixels make up only 4% of the total area while 96% is non-flooded land. If a team trains a U-Net using standard unweighted Binary Cross-Entropy (BCE) loss, what behavior is most likely?",
          th: "ในภาพถ่ายดาวเทียมอำเภอเมืองขอนแก่น มีพิกเซลน้ำท่วมเพียง 4% และพื้นที่ไม่ท่วม 96% หากทีมฝึกโมเดล U-Net ด้วย Binary Cross-Entropy (BCE) Loss แบบปกติโดยไม่ถ่วงน้ำหนัก จะเกิดผลลัพธ์ใดมากที่สุด?"
        },
        options: [
          {
            key: "A",
            en: "High overall pixel accuracy (~96%), but very low Recall and IoU on the flood class due to majority-class dominance.",
            th: "ได้ค่าความแม่นยำรวมทุกพิกเซลสูง (~96%) แต่ค่า Recall และ IoU ของคลาสน้ำท่วมต่ำมากเพราะโมเดลเอนเอียงไปทางคลาสส่วนใหญ่"
          },
          {
            key: "B",
            en: "High False Positive rate where all roads and roofs are classified as deep floodwater.",
            th: "เกิดผลบวกลวงสูงมาก โดยโมเดลทายว่าถนนและหลังคาทั้งหมดเป็นพื้นที่น้ำท่วม"
          },
          {
            key: "C",
            en: "Gradient explosion in the decoder skip connections during the first epoch.",
            th: "เกิดปัญหา Gradient Explosion ในส่วน Skip Connections ของ Decoder ตั้งแต่รอบแรก"
          },
          {
            key: "D",
            en: "Equal Precision and Recall of 96% on both flooded and non-flooded classes.",
            th: "ได้ค่า Precision และ Recall เท่ากันที่ 96% ทั้งคลาสน้ำท่วมและไม่ท่วม"
          }
        ],
        correct: "A",
        iratClassPct: 69,
        rationale: {
          en: "With 96% non-flood pixels, a trivial model predicting 'no flood everywhere' achieves 96% overall pixel accuracy while completely missing the disaster (0% flood IoU). Region-based losses like Dice/Tversky Loss or Focal Loss solve this imbalance.",
          th: "เมื่อพื้นที่ 96% ไม่ใช่น้ำท่วม โมเดลที่ทายว่า 'ไม่ท่วมเลย' จะได้ Pixel Accuracy ถึง 96% แต่ได้ค่า IoU ของน้ำท่วมเป็น 0% ดังนั้นจึงต้องใช้ Dice Loss, Tversky Loss หรือ Focal Loss"
        }
      },
      {
        id: "q4",
        stem: {
          en: "Why do U-Net skip connections (concatenating encoder feature maps directly to decoder layers) significantly improve urban flood boundary mapping compared to a basic Encoder-Decoder without skip connections?",
          th: "เหตุใดโครงสร้าง Skip Connections ใน U-Net (ที่เชื่อมฟีเจอร์จาก Encoder ไปยัง Decoder โดยตรง) จึงช่วยให้การสกัดขอบเขตน้ำท่วมในเขตเมืองแม่นยำกว่า Encoder-Decoder ทั่วไปที่ไม่มี Skip Connections?"
        },
        options: [
          {
            key: "A",
            en: "They reduce the number of trainable parameters by 90% so the model needs no GPU.",
            th: "ช่วยลดจำนวนพารามิเตอร์ลง 90% ทำให้ไม่จำเป็นต้องใช้ GPU ในการประมวลผล"
          },
          {
            key: "B",
            en: "They restore fine-grained spatial localization lost during max-pooling/downsampling, fusing high-resolution edges with deep semantic context.",
            th: "ช่วยคืนรายละเอียดตำแหน่งเชิงพื้นที่ความละเอียดสูงที่สูญเสียไประหว่างการย่อขนาด (Downsampling) โดยผสานขอบภาพที่คมชัดเข้ากับบริบทเชิงความหมายระดับลึก"
          },
          {
            key: "C",
            en: "They automatically convert WGS84 coordinates into UTM Zone 48N projection.",
            th: "ช่วยแปลงระบบพิกัด WGS84 ให้เป็น UTM Zone 48N โดยอัตโนมัติในชั้นข้อมูล"
          },
          {
            key: "D",
            en: "They replace all convolutional kernels with global self-attention matrices.",
            th: "เปลี่ยนตัวกรอง Convolution ทั้งหมดให้เป็นเมทริกซ์ Global Self-Attention"
          }
        ],
        correct: "B",
        iratClassPct: 82,
        rationale: {
          en: "Pooling layers expand the receptive field to capture semantic context ('is this a river basin?'), but discard exact pixel edges. Skip connections pass fine spatial features from early encoder blocks directly to the decoder for crisp shoreline reconstruction.",
          th: "การทำ Pooling ช่วยให้โมเดลเข้าใจบริบทภาพรวม แต่ทำให้สูญเสียความคมชัดของขอบพิกเซล Skip Connections จึงทำหน้าที่ส่งต่อรายละเอียดเชิงพื้นที่ความละเอียดสูงจาก Encoder มารวมกับ Decoder ได้โดยตรง"
        }
      },
      {
        id: "q5",
        stem: {
          en: "Under flooded trees and dense urban buildings along Mittraphap Road, Sentinel-1 SAR often fails to show low backscatter because of radar 'double-bounce' (water → vertical wall/trunk → sensor). Which auxiliary geospatial feature best helps a GeoAI model reduce these false negatives?",
          th: "ในพื้นที่ป่าริมน้ำหรือเขตอาคารหนาแน่นริมถนนมิตรภาพ สัญญาณ Sentinel-1 SAR มักไม่มืดลงแม้น้ำท่วม เพราะเกิดปรากฏการณ์สะท้อนสองจังหวะ (Double-bounce) กับผนังตึกหรือลำต้นไม้ ข้อมูลภูมิสารสนเทศเสริมใดช่วยแก้ปัญหานี้ได้ดีที่สุด?"
        },
        options: [
          {
            key: "A",
            en: "Height Above Nearest Drainage (HAND) derived from a high-resolution LiDAR/hydrologically conditioned DEM.",
            th: "ดัชนีความสูงเหนือทางระบายน้ำที่ใกล้ที่สุด (HAND) ที่คำนวณจากแบบจำลองความสูงภูมิประเทศ (DEM/LiDAR) ที่ปรับแก้ทางอุทกวิทยาแล้ว"
          },
          {
            key: "B",
            en: "MODIS 1-km daily sea surface temperature (SST) product.",
            th: "ข้อมูลอุณหภูมิผิวน้ำทะเลรายวัน (SST) ความละเอียด 1 กิโลเมตรจากดาวเทียม MODIS"
          },
          {
            key: "C",
            en: "Random gaussian noise channel appended to the RGB bands.",
            th: "การเพิ่มช่องสัญญาณสุ่มแบบ Gaussian Noise เข้าไปในแบนด์สี RGB"
          },
          {
            key: "D",
            en: "Nighttime light intensity from VIIRS DNB only.",
            th: "การใช้เพียงข้อมูลความสว่างแสงไฟยามค่ำคืนจากดาวเทียม VIIRS เท่านั้น"
          }
        ],
        correct: "A",
        secondaryStars: [],
        isControversial: true,
        iratClassPct: 48,
        rationale: {
          en: "HAND (Height Above Nearest Drainage) measures the vertical elevation of each pixel relative to the nearest stream channel it drains into. Pixels with low HAND (<2m) adjacent to confirmed open-water SAR pixels have high physical flood susceptibility even when double-bounce masks the radar return.",
          th: "ดัชนี HAND บอกความสูงของแต่ละพิกเซลเทียบกับลำน้ำที่ใกล้ที่สุด พื้นที่ที่มีค่า HAND ต่ำ (<2 เมตร) และอยู่ติดกับผิวน้ำที่ตรวจพบจาก SAR จะมีความน่าจะเป็นทางกายภาพที่จะเกิดน้ำท่วมสูง แม้สัญญาณเรดาร์จะเกิด Double-bounce ก็ตาม"
        }
      }
    ],
    applicationCase: {
      title: {
        en: "Emergency GeoAI Deployment: Ubol Ratana Dam Spillway Release & Chi-Nam Phong Confluence Flood",
        th: "ภารกิจฉุกเฉิน GeoAI: การระบายน้ำเขื่อนอุบลรัตน์และน้ำท่วมจุดบรรจบแม่น้ำชี–ลำน้ำพอง"
      },
      scenario: {
        en: "Heavy tropical depression rainfall has pushed Ubol Ratana Dam to 112% capacity. The Provincial Disaster Prevention and Mitigation Office (DDPM Khon Kaen) requires an automated GeoAI flood mapping pipeline updated every 12 hours across 4 critical zones (Ubol Ratana Spillway, KKU Campus Drainage, Chi-Nam Phong Confluence, and Mueang Khon Kaen Bypass). Cloud cover is currently 90%, urban double-bounce is severe in Mueang district, and rescue teams need village-level flood polygons with uncertainty estimates within 30 minutes of satellite overpass.",
        th: "พายุโซนร้อนทำให้เขื่อนอุบลรัตน์มีปริมาณน้ำถึง 112% ของความจุ สำนักงานป้องกันและบรรเทาสาธารณภัยจังหวัดขอนแก่น (ปภ.ขอนแก่น) ต้องการระบบ GeoAI สกัดพื้นที่น้ำท่วมอัตโนมัติทุก 12 ชั่วโมงครอบคลุม 4 โซนวิกฤต ขณะนี้เมฆปกคลุม 90% เขตเมืองเกิดสัญญาณเรดาร์สะท้อนตึก (Double-bounce) และทีมกู้ภัยต้องการแผนที่ขอบเขตน้ำท่วมพร้อมค่าความไม่แน่นอนภายใน 30 นาทีหลังดาวเทียมโคจรผ่าน"
      },
      specificChoices: [
        {
          id: "choice-A",
          label: {
            en: "Option A: Optical-Only SegFormer (Sentinel-2 + PlanetScope 3m)",
            th: "ตัวเลือก A: โมเดล SegFormer ใช้ภาพช่วงคลื่นแสงอย่างเดียว (Sentinel-2 + PlanetScope 3m)"
          },
          summary: {
            en: "Wait for cloud-free windows; train with random 80/20 patch splits and standard Cross-Entropy loss for maximum spatial sharpness.",
            th: "รอจังหวะเมฆเปิด ใช้การสุ่มแบ่งข้อมูล 80/20 และ Cross-Entropy Loss เพื่อความคมชัดสูงสุดระดับ 3 เมตร"
          }
        },
        {
          id: "choice-B",
          label: {
            en: "Option B: Multi-Modal Dual-Stream U-Net (S1 SAR VV/VH + S2 Cloud-Free Pre-Flood + LiDAR HAND DEM)",
            th: "ตัวเลือก B: โมเดล Dual-Stream U-Net หลอมรวมหลายแหล่ง (S1 SAR + ภาพก่อนน้ำท่วม S2 + LiDAR HAND DEM)"
          },
          summary: {
            en: "Fuse change-detection SAR log-ratio with topographic HAND index; train with Dice+Focal loss, validate via Sub-Basin Spatial Block CV, and output Monte Carlo Dropout uncertainty maps.",
            th: "ใช้สัดส่วนการเปลี่ยนแปลงเรดาร์ SAR ร่วมกับดัชนีความสูง HAND ฝึกด้วย Dice+Focal Loss ตรวจสอบด้วย Spatial Block ตามลุ่มน้ำย่อย และสร้างแผนที่ความไม่แน่นอนด้วย MC Dropout"
          }
        },
        {
          id: "choice-C",
          label: {
            en: "Option C: Unsupervised Otsu Thresholding on Raw Single-Date Sentinel-1 VV Band",
            th: "ตัวเลือก C: การตัดเกณฑ์ Otsu Thresholding แบบไม่ใช้ผู้สอนบนภาพ Sentinel-1 VV วันเดียว"
          },
          summary: {
            en: "Zero deep learning training time; apply global Otsu threshold (-16 dB) across the entire province without DEM or multi-temporal reference.",
            th: "ไม่ต้องฝึกโมเดล ใช้ค่า Threshold เดียวทั้งจังหวัด (-16 dB) โดยไม่ใช้ข้อมูลความสูงภูมิประเทศหรือภาพเปรียบเทียบก่อนน้ำท่วม"
          }
        },
        {
          id: "choice-D",
          label: {
            en: "Option D: Vision Foundation Model (Prithvi-100M Zero-Shot) on MODIS 500m Composites",
            th: "ตัวเลือก D: โมเดลพื้นฐาน Prithvi-100M แบบ Zero-Shot บนภาพ MODIS ความละเอียด 500 เมตร"
          },
          summary: {
            en: "Run zero-shot inference on coarse 500m daily composites without local Isan fine-tuning to prioritize regional overview.",
            th: "รันโมเดลขนาดใหญ่แบบไม่ต้องฝึกเพิ่มบนภาพความละเอียดหยาบ 500 เมตร เพื่อดูภาพรวมระดับภูมิภาค"
          }
        }
      ],
      recommendedChoice: "choice-B",
      spatialZones: [
        {
          id: "zone-1",
          name: { en: "Zone 1: Ubol Ratana Dam Downstream", th: "โซน 1: ท้ายเขื่อนอุบลรัตน์ (ลำน้ำพอง)" },
          coords: [16.775, 102.618],
          radius: 4500,
          risk: "High",
          color: "#ef4444",
          sarVvDb: "-21.4 dB (Clear Open Water)",
          handMeters: "1.2 m",
          cloudPct: "94%",
          notes: {
            en: "Rapid discharge corridor. Optical sensors completely blind; SAR VV change ratio (-8.2 dB drop vs dry baseline) clearly delineates surging channel.",
            th: "แนวรับน้ำระบายจากเขื่อน เมฆหนา 94% ภาพแสงปกติมองไม่เห็น แต่ค่าการเปลี่ยนแปลง SAR VV ลดลง -8.2 dB ชี้ชัดพื้นที่น้ำหลาก"
          }
        },
        {
          id: "zone-2",
          name: { en: "Zone 2: KKU Campus & Si Than Lake", th: "โซน 2: มหาวิทยาลัยขอนแก่น และบึงสีฐาน" },
          coords: [16.462, 102.825],
          radius: 2600,
          risk: "Moderate",
          color: "#f59e0b",
          sarVvDb: "-11.8 dB (Tree Canopy & Urban Mix)",
          handMeters: "3.8 m",
          cloudPct: "85%",
          notes: {
            en: "Retention pond buffer around Si Than. Dense campus trees cause radar volume scattering; LiDAR HAND DEM prevents false flood calls on elevated faculty buildings.",
            th: "พื้นที่แก้มลิงบึงสีฐาน ต้นไม้หนาแน่นใน มข. ทำให้เรดาร์กระเจิงแสง การใช้ LiDAR HAND ช่วยป้องกันการทายผิดบนเนินอาคารเรียน"
          }
        },
        {
          id: "zone-3",
          name: { en: "Zone 3: Chi–Nam Phong River Confluence", th: "โซน 3: จุดบรรจบแม่น้ำชี–ลำน้ำพอง (อ.น้ำพอง/เมือง)" },
          coords: [16.385, 102.942],
          radius: 5200,
          risk: "Critical",
          color: "#dc2626",
          sarVvDb: "-19.8 dB (Submerged Paddy Fields)",
          handMeters: "0.7 m",
          cloudPct: "92%",
          notes: {
            en: "Over-bank flooding across agricultural floodplains. Partially submerged rice stalks create double-bounce; multi-temporal SAR coherence + HAND < 1.5m isolates true inundation.",
            th: "น้ำเอ่อล้นตลิ่งท่วมนาข้าว ต้นข้าวที่โผล่พ้นน้ำทำให้เกิด Double-bounce ต้องใช้ข้อมูล SAR หลายช่วงเวลาร่วมกับ HAND < 1.5 เมตร"
          }
        },
        {
          id: "zone-4",
          name: { en: "Zone 4: Mueang Khon Kaen Urban & Bueng Kaen Nakhon", th: "โซน 4: เขตเทศบาลนครขอนแก่น และบึงแก่นนคร" },
          coords: [16.421, 102.838],
          radius: 3100,
          risk: "High",
          color: "#ea580c",
          sarVvDb: "-7.5 dB (Strong Urban Double-Bounce)",
          handMeters: "1.9 m",
          cloudPct: "88%",
          notes: {
            en: "High-density buildings cause bright SAR backscatter (+4 dB increase when streets flood due to corner reflection). Single-band Otsu fails completely here!",
            th: "อาคารหนาแน่นทำให้เกิดการสะท้อนมุมฉาก (Corner Reflection) ค่า SAR สว่างขึ้นเมื่อถนนน้ำท่วม การใช้ Otsu Threshold แบบเดิมจะล้มเหลวโดยสิ้นเชิงในโซนนี้!"
          }
        }
      ],
      otherTeamsResponses: [
        {
          teamId: "team-ubonrat",
          teamName: "Team 2: Ubol Ratana Vision",
          choiceId: "choice-B",
          rationale: "We selected Option B because Zone 4 (Mueang Khon Kaen) exhibits -7.5 dB urban double-bounce where Option C's Otsu thresholding misses flooded streets. Combining pre/post SAR log-ratio with HAND < 2m and spatial block CV by sub-basin prevents spatial leakage and gives DDPM calibrated uncertainty."
        },
        {
          teamId: "team-mittraphap",
          teamName: "Team 3: Mittraphap SpatialNet",
          choiceId: "choice-C",
          rationale: "We initially leaned toward Option C for speed (<2 mins runtime), but realized permanent water bodies and urban corner reflectors in Zone 4 create massive false negatives without HAND DEM and change detection."
        },
        {
          teamId: "team-phuwiang",
          teamName: "Team 4: Phu Wiang GeoLab",
          choiceId: "choice-B",
          rationale: "Option B is the only pipeline that satisfies all 3 operational constraints: 90% cloud penetration via C-band SAR, minority flood class optimization via Dice+Focal loss, and honest spatial generalization via sub-basin block validation."
        }
      ]
    }
  },
  {
    id: "mod-sugarcane-burn",
    classId: "cls-geoai-402",
    weekNumber: 2,
    code: "Week 2",
    title: {
      en: "Object Detection & Spatio-Temporal Transformers for Sugarcane Burn Scar & PM2.5 Monitoring",
      th: "การตรวจจับวัตถุและ Spatio-Temporal Transformer สำหรับติดตามแปลงอ้อยไฟไหม้และฝุ่น PM2.5 ในภาคอีสาน"
    },
    duration: "3 Hours (1 TBL Cycle)",
    outcomes: {
      en: [
        "Differentiate spectral signatures of fresh charcoal burn scars vs. harvested green sugarcane using Normalized Burn Ratio (NBR) and SWIR2 bands.",
        "Evaluate Temporal Attention mechanisms (L-TAE / TempCNN) on multi-date Sentinel-2 phenology curves.",
        "Formulate an equitable GeoAI verification protocol for Khon Kaen sugar mills and environmental agencies."
      ],
      th: [
        "แยกแยะลายเซ็นสเปกตรัมของแปลงอ้อยที่ถูกเผาเทียบกับอ้อยตัดสดด้วยดัชนี NBR และย่านความถี่ SWIR2",
        "ประเมินกลไก Temporal Attention บนกราฟการเจริญเติบโตของพืชหลายช่วงเวลา (Phenology Time-Series)",
        "ออกแบบระบบตรวจสอบย้อนกลับแปลงอ้อยปลอดการเผาสำหรับโรงงานน้ำตาลและหน่วยงานสิ่งแวดล้อมในขอนแก่น"
      ]
    },
    preworkMaterials: [
      {
        id: "pw-2-1",
        type: "Reading",
        duration: "20 min",
        title: {
          en: "Normalized Burn Ratio (NBR) & Charcoal SWIR Absorption in Tropical Croplands",
          th: "ดัชนีการเผาไหม้ NBR และการดูดกลืนคลื่น SWIR ของเถ้าถ่านในพื้นที่เกษตรเขตร้อน"
        },
        summary: {
          en: "Healthy green sugarcane reflects strongly in NIR (B8) and absorbs SWIR2 (B12) due to leaf water content. Post-fire ash and charred stubble destroy chlorophyll (dropping NIR) while raising SWIR2 reflectance, causing a sharp negative drop in NBR (ΔNBR > 0.35).",
          th: "อ้อยสดที่มีคลอโรฟิลล์และความชื้นจะสะท้อน NIR สูงและดูดกลืน SWIR2 แต่หลังการเผา เถ้าถ่านจะทำให้ค่า NIR ตกลงและค่า SWIR2 พุ่งสูงขึ้น ส่งผลให้ค่า NBR ลดลงอย่างฉับพลัน"
        },
        formula: "NBR = (NIR - SWIR2) / (NIR + SWIR2)"
      },
      {
        id: "pw-2-2",
        type: "Architecture Lab",
        duration: "25 min",
        title: {
          en: "Single-Date CNN vs. Spatio-Temporal Transformer (SITS-Former) for Crop Harvest Classification",
          th: "การเปรียบเทียบ CNN ภาพวันเดียว กับ Spatio-Temporal Transformer สำหรับจำแนกวิธีเก็บเกี่ยวอ้อย"
        },
        summary: {
          en: "Ash in tropical fields washes away or gets plowed within 5–10 days. Single-date imagery often confuses bare dark vertisol soil with burn scars. Spatio-temporal transformers attend to the abrupt transition from high NDVI -> VIIRS thermal hotspot -> low NBR.",
          th: "เถ้าถ่านในแปลงอ้อยมักถูกไถกลบหรือชะล้างภายใน 5–10 วัน การดูภาพวันเดียวอาจสับสนกับดินเหนียวสีเข้ม โมเดล Spatio-Temporal จึงใช้การเปลี่ยนแปลงต่อเนื่องตั้งแต่ NDVI สูง -> จุดความร้อน VIIRS -> ค่า NBR ลดฮวบ"
        },
        formula: "Attention(Q,K,V) over T=24 Sentinel-2 acquisitions + Day-of-Year positional encoding"
      }
    ],
    questions: [
      {
        id: "m2-q1",
        stem: {
          en: "Why does Normalized Burn Ratio (NBR = [NIR - SWIR2]/[NIR + SWIR2]) outperform simple RGB visual inspection for detecting pre-harvest sugarcane burning in Khon Kaen?",
          th: "เหตุใดดัชนี NBR จึงมีประสิทธิภาพสูงกว่าการดูด้วยภาพสีจริง (RGB) ในการตรวจจับการเผาอ้อยก่อนเก็บเกี่ยวในจังหวัดขอนแก่น?"
        },
        options: [
          {
            key: "A",
            en: "Chararring destroys leaf cellular structure (lowering NIR) and vaporizes canopy moisture while exposing carbon ash (increasing SWIR2 reflectance).",
            th: "การเผาทำลายโครงสร้างเซลล์ใบ (ทำให้ NIR ลดลง) และไล่ความชื้นออกพร้อมเปิดผิวเถ้าคาร์บอน (ทำให้ SWIR2 สูงขึ้น)"
          },
          {
            key: "B",
            en: "SWIR2 wavelengths (2190 nm) are emitted only at midnight by sugar mill chimneys.",
            th: "ความยาวคลื่น SWIR2 (2190 นาโนเมตร) ถูกปล่อยออกมาเฉพาะเวลาเที่ยงคืนจากปล่องโรงงานน้ำตาล"
          },
          {
            key: "C",
            en: "RGB bands cannot be processed by convolutional neural networks.",
            th: "แบนด์สี RGB ไม่สามารถนำมาประมวลผลด้วยโครงข่ายประสาทเทียมแบบ Convolution ได้"
          },
          {
            key: "D",
            en: "NIR reflectance increases by 300% immediately after vegetation is burned to ash.",
            th: "ค่าการสะท้อนแสง NIR จะเพิ่มขึ้น 300% ทันทีหลังจากพืชถูกเผาเป็นเถ้าถ่าน"
          }
        ],
        correct: "A",
        iratClassPct: 71,
        rationale: {
          en: "NIR responds to internal leaf structure (mesophyll) while SWIR2 responds to water absorption and char/soil exposure. Burn events invert these two bands dramatically.",
          th: "NIR ตอบสนองต่อโครงสร้างเซลล์ใบ ในขณะที่ SWIR2 ไวต่อความชื้นและเถ้าถ่าน เมื่อเกิดการเผา ค่าทั้งสองแบนด์จะสวนทางกันอย่างชัดเจน"
        }
      },
      {
        id: "m2-q2",
        stem: {
          en: "When training a Spatio-Temporal Transformer on irregular Sentinel-2 time series (where cloudy dates are masked out), why must the positional encoding use actual Day-of-Year (DOY) rather than sequential array index (t = 1, 2, 3...)?",
          th: "ในการฝึกโมเดล Spatio-Temporal Transformer กับข้อมูลอนุกรมเวลา Sentinel-2 ที่ตัดวันที่เมฆบังออกไป เหตุใดจึงต้องเข้ารหัสตำแหน่งเวลาด้วย 'ลำดับวันในรอบปี (Day-of-Year)' แทนลำดับอาร์เรย์ (1, 2, 3...)?"
        },
        options: [
          {
            key: "A",
            en: "Sequential indices distort physical time gaps when cloudy scenes are dropped, preventing alignment of crop phenology across regions with different cloud cover.",
            th: "ลำดับอาร์เรย์ทำให้ระยะห่างของเวลาจริงบิดเบือนเมื่อตัดวันที่มีเมฆออก ทำให้โมเดลไม่สามารถเทียบเคียงวงจรการเจริญเติบโตของพืชในพื้นที่ที่มีเมฆไม่เท่ากันได้"
          },
          {
            key: "B",
            en: "DOY encoding reduces floating-point memory usage from 64-bit to 2-bit.",
            th: "การใช้ DOY ช่วยลดการใช้หน่วยความจำจาก 64 บิต เหลือ 2 บิต"
          },
          {
            key: "C",
            en: "Sentinel-2 satellites only orbit over Thailand on odd-numbered days of the year.",
            th: "ดาวเทียม Sentinel-2 โคจรผ่านประเทศไทยเฉพาะวันคี่ของปีเท่านั้น"
          },
          {
            key: "D",
            en: "Transformers cannot process arrays with more than 5 elements without DOY.",
            th: "โมเดล Transformer ไม่สามารถประมวลผลอาร์เรย์ที่มีมากกว่า 5 ค่าได้หากไม่ใช้ DOY"
          }
        ],
        correct: "A",
        iratClassPct: 58,
        rationale: {
          en: "Cloud removal creates irregular time intervals (e.g., 5 days gap in January, 35 days gap in August). DOY positional encoding preserves true calendar seasonality.",
          th: "การกรองเมฆออกทำให้ช่วงห่างระหว่างภาพไม่คงที่ การใช้ Day-of-Year (DOY) ช่วยรักษาจังหวะเวลาตามปฏิทินและฤดูกาลเพาะปลูกจริง"
        }
      }
    ],
    applicationCase: {
      title: {
        en: "Zero-Burn Sugarcane Supply Chain Audit in Nam Phong & Kranuan Districts",
        th: "ระบบตรวจสอบอ้อยปลอดการเผา (Zero-Burn Audit) ในพื้นที่อำเภอน้ำพองและกระนวน"
      },
      scenario: {
        en: "A coalition of Khon Kaen sugar mills and the Pollution Control Department needs a parcel-level GeoAI system to reward green-harvest farmers with a price bonus while flagging illegal night burning that drives hazardous PM2.5 spikes across KKU and Mueang Khon Kaen.",
        th: "กลุ่มโรงงานน้ำตาลและสำนักงานสิ่งแวดล้อมในขอนแก่นต้องการระบบ GeoAI ระดับแปลงเกษตร เพื่อจ่ายเงินโบนัสให้เกษตรกรที่ตัดอ้อยสด และตรวจจับการลักลอบเผาอ้อยยามค่ำคืนซึ่งเป็นต้นเหตุของฝุ่น PM2.5"
      },
      specificChoices: [
        {
          id: "choice-A",
          label: {
            en: "Option A: Single-Date RGB CNN at End of Harvest Season (April)",
            th: "ตัวเลือก A: โมเดล CNN ภาพสี RGB เพียงวันเดียวตอนสิ้นสุดฤดูหีบอ้อย (เมษายน)"
          },
          summary: {
            en: "Classify all fields once in April using a single high-res RGB image.",
            th: "จำแนกแปลงอ้อยครั้งเดียวในเดือนเมษายนจากภาพสี RGB"
          }
        },
        {
          id: "choice-B",
          label: {
            en: "Option B: Parcel-Based Spatio-Temporal Transformer (S2 ΔNBR Time-Series + VIIRS Night Thermal + SAR Roughness)",
            th: "ตัวเลือก B: โมเดล Spatio-Temporal Transformer ระดับแปลง (อนุกรมเวลา S2 ΔNBR + จุดความร้อน VIIRS ยามค่ำคืน + ความขรุขระผิวดิน SAR)"
          },
          summary: {
            en: "Track continuous parcel phenology with DOY encoding, fuse night thermal anomalies, and require human-in-the-loop review on borderline confidence parcels.",
            th: "ติดตามการเปลี่ยนแปลงรายแปลงด้วย DOY ผสานจุดความร้อนกลางคืน และมีระบบให้เจ้าหน้าที่ตรวจสอบซ้ำในแปลงที่ค่าความมั่นใจก้ำกึ่ง"
          }
        }
      ],
      recommendedChoice: "choice-B",
      spatialZones: [
        {
          id: "zone-kranuan",
          name: { en: "Zone 1: Kranuan Sugarcane Belt", th: "โซน 1: แหล่งปลูกอ้อย อ.กระนวน" },
          coords: [16.705, 103.078],
          radius: 4800,
          risk: "High",
          color: "#dc2626",
          sarVvDb: "ΔNBR = -0.44 (Fresh Burn Scar Detected)",
          handMeters: "VIIRS 375m Night Anomaly: Active",
          cloudPct: "15%",
          notes: {
            en: "Abrupt NDVI drop paired with ΔNBR = -0.44 and a 02:15 AM VIIRS thermal hotspot confirms pre-harvest burning prior to mechanical loading.",
            th: "ค่า NDVI ลดลงฉับพลันพร้อมกับ ΔNBR = -0.44 และพบจุดความร้อนเวลา 02:15 น. ยืนยันการเผาก่อนเก็บเกี่ยว"
          }
        },
        {
          id: "zone-namphong",
          name: { en: "Zone 2: Nam Phong Green Harvest Co-op", th: "โซน 2: สหกรณ์ตัดอ้อยสด อ.น้ำพอง" },
          coords: [16.632, 102.855],
          radius: 4200,
          risk: "Low",
          color: "#16a34a",
          sarVvDb: "ΔNBR = -0.08 (Green Trash Mulch Blanket)",
          handMeters: "VIIRS Night Anomaly: None",
          cloudPct: "10%",
          notes: {
            en: "Harvested mechanically leaving dry cane leaf mulch on ground. High SWIR1/SWIR2 ratio without charcoal absorption confirms zero-burn compliance.",
            th: "เก็บเกี่ยวด้วยรถตัดอ้อยสด มีใบอ้อยคลุมดิน ค่าสเปกตรัมไม่พบการดูดกลืนของเถ้าถ่าน ยืนยันการทำเกษตรปลอดการเผา"
          }
        }
      ],
      otherTeamsResponses: [
        {
          teamId: "team-ubonrat",
          teamName: "Team 2: Ubol Ratana Vision",
          choiceId: "choice-B",
          rationale: "Single-date April imagery misses early December burns that have already regrown ratoon shoots or been plowed. Parcel time-series ΔNBR + night VIIRS is essential."
        }
      ]
    }
  }
];
