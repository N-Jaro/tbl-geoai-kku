import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Copy,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  MapPin,
  Award,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

const GEOAI_QUESTION_TEMPLATES = [
  {
    name: {
      en: "Spatial Autocorrelation & Data Leakage Case",
      th: "โจทย์ปัญหา Spatial Autocorrelation และการแบ่งข้อมูลรั่วไหล"
    },
    stem: {
      en: "A team trains a deep segmentation model on 256×256m image tiles extracted with 50% overlap across Khon Kaen. Using an 80/20 random split, validation IoU is 93%, but drops to 56% when tested on an adjacent province. Which decision best resolves this issue before deployment?",
      th: "ทีมวิจัยฝึกโมเดลสกัดพื้นที่จากแผ่นภาพขนาด 256×256 เมตร ที่ตัดซ้อนทับกัน 50% ในจังหวัดขอนแก่น โดยสุ่มแบ่ง Train/Validation 80/20 ได้ค่า IoU 93% แต่เมื่อนำไปทดสอบในจังหวัดใกล้เคียง ค่า IoU ลดลงเหลือ 56% ทีมควรตัดสินใจแก้ไขอย่างไรจึงจะเหมาะสมที่สุด?"
    },
    options: [
      {
        key: "A",
        en: "Increase training epochs from 50 to 300 and add dropout layers to the encoder.",
        th: "เพิ่มจำนวนรอบการฝึก (Epochs) จาก 50 เป็น 300 รอบ และเพิ่มชั้น Dropout ในส่วน Encoder"
      },
      {
        key: "B",
        en: "Enforce non-overlapping Spatial Block Cross-Validation partitioned by hydrological sub-basin or district.",
        th: "เปลี่ยนไปใช้การแบ่งข้อมูลตามบล็อกเชิงพื้นที่ (Spatial Block Cross-Validation) ตามขอบเขตลุ่มน้ำย่อยหรืออำเภอโดยไม่ให้แผ่นภาพซ้อนทับกัน"
      },
      {
        key: "C",
        en: "Apply spatial variogram range estimation to buffer training polygons by at least the autocorrelation distance before splitting.",
        th: "คำนวณระยะอิทธิพลจาก Variogram เพื่อเว้นระยะกันชน (Buffer Distance) ระหว่างชุดข้อมูลฝึกและทดสอบตามระยะสหสัมพันธ์เชิงพื้นที่"
      },
      {
        key: "D",
        en: "Convert multispectral reflectance values from 16-bit integer to 8-bit grayscale.",
        th: "แปลงค่าการสะท้อนแสงจากข้อมูล 16 บิต ให้เป็นภาพขาวดำ 8 บิต"
      }
    ],
    correct: "B",
    secondaryStars: ["C"],
    isControversial: true,
    rationale: {
      en: "Per Dr. Cherdsak's TBL guidelines: Both B (watershed block split) and C (variogram buffer split) are valid professional practices in GeoAI that spark rich debate on trade-offs between sample size and spatial independence!",
      th: "ตามหลักการออกข้อสอบ TBL ของ รศ.ดร.นพ.เชิดศักดิ์: ทั้งตัวเลือก B (แบ่งบล็อกตามลุ่มน้ำ) และ C (เว้นระยะ Buffer ตามค่า Variogram) ต่างก็เป็นวิธีที่ถูกต้องในทางปฏิบัติแต่มีข้อดี-ข้อเสียต่างกัน ช่วยกระตุ้นให้เกิดการถกเถียงในทีม"
    }
  },
  {
    name: {
      en: "Sensor Trade-off Under Monsoon Cloud & Urban Double-Bounce",
      th: "โจทย์วิเคราะห์ข้อจำกัดเซ็นเซอร์ใต้เมฆฝนและการสะท้อนตึกในเมือง"
    },
    stem: {
      en: "During a flash flood in Mueang Khon Kaen, cloud cover is 95% and flooded concrete streets surrounded by shophouses exhibit bright Sentinel-1 SAR backscatter (-6 dB) instead of dark specular water (<-18 dB). What should the GeoAI pipeline do?",
      th: "ระหว่างเกิดน้ำท่วมฉับพลันในเขตเทศบาลนครขอนแก่น มีเมฆปกคลุม 95% และถนนคอนกรีตที่ถูกน้ำท่วมท่ามกลางตึกแถวมีค่าการสะท้อนเรดาร์ Sentinel-1 SAR สูง (-6 dB) แทนที่จะมืดเหมือนผิวน้ำเปิด (<-18 dB) ทีมควรออกแบบการประมวลผลอย่างไร?"
    },
    options: [
      {
        key: "A",
        en: "Switch exclusively to Sentinel-2 MNDWI optical thresholding.",
        th: "เปลี่ยนไปใช้ดัชนี MNDWI จากภาพถ่ายช่วงคลื่นแสง Sentinel-2 เพียงอย่างเดียว"
      },
      {
        key: "B",
        en: "Combine multi-temporal SAR Interferometric Coherence (InSAR decorrelation) with LiDAR Height Above Nearest Drainage (HAND).",
        th: "ผสมผสานค่าความสอดคล้องของเฟสเรดาร์หลายช่วงเวลา (InSAR Coherence) ร่วมกับดัชนีความสูงเหนือทางน้ำ (LiDAR HAND)"
      },
      {
        key: "C",
        en: "Lower the global Otsu SAR threshold from -18 dB to -25 dB.",
        th: "ปรับลดเกณฑ์ Otsu Threshold ของภาพ SAR ทั้งจังหวัดจาก -18 dB ลงเป็น -25 dB"
      },
      {
        key: "D",
        en: "Mask out all urban pixels using OpenStreetMap building footprints and interpolate flood depth from adjacent rural gauges.",
        th: "ตัดพิกเซลเขตเมืองออกด้วยขอบเขตอาคาร OpenStreetMap แล้วประมาณระดับน้ำท่วมจากจุดวัดน้ำรอบนอกร่วมกับแบบจำลองภูมิประเทศ"
      }
    ],
    correct: "B",
    secondaryStars: ["D"],
    isControversial: true,
    rationale: {
      en: "Option B directly resolves urban double-bounce via InSAR phase decorrelation + HAND, while Option D is a pragmatic engineering workaround when InSAR pairs aren't available in time.",
      th: "ตัวเลือก B แก้ปัญหา Double-bounce โดยตรงด้วย InSAR Coherence + HAND ส่วนตัวเลือก D เป็นทางเลือกเชิงวิศวกรรมที่ใช้งานได้จริงหากไม่มีคู่ภาพ InSAR ทันเวลา"
    }
  }
];

export default function LessonBuilder({
  lang,
  modules,
  selectedModuleId,
  onSelectModule,
  onSaveModule,
  onAddNewWeek,
  onDuplicateWeek,
  onDeleteWeek,
  onImportModules
}) {
  const activeMod = modules.find((m) => m.id === selectedModuleId) || modules[0];
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(activeMod)));
  const [activeTab, setActiveTab] = useState('meta'); // 'meta' | 'prework' | 'rat' | 'case' | 'peereval'
  const [saveBanner, setSaveBanner] = useState(false);

  // Sync draft when switching week
  React.useEffect(() => {
    const found = modules.find((m) => m.id === selectedModuleId) || modules[0];
    if (found) {
      setDraft(JSON.parse(JSON.stringify(found)));
    }
  }, [selectedModuleId, modules]);

  const handleSave = () => {
    onSaveModule(draft);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  // Export all weeks JSON
  const handleExportAllJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(modules, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `KKU_GeoAI_TBL_All_Weeks_${modules.length}w.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportModules(parsed);
        } else if (parsed && parsed.id) {
          onSaveModule(parsed);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Add Prework item
  const addPreworkItem = () => {
    const nextId = `pw-${Date.now()}`;
    setDraft((prev) => ({
      ...prev,
      preworkMaterials: [
        ...prev.preworkMaterials,
        {
          id: nextId,
          type: 'Reading / Lab',
          duration: '20 min',
          releaseLeadDays: 7,
          essentialOnly: true,
          title: {
            en: 'New Essential GeoAI Pre-work Material',
            th: 'เอกสารเตรียมความพร้อมก่อนเรียนชิ้นใหม่'
          },
          summary: {
            en: 'Concise foundational knowledge required directly for the in-class RAT and 4S case.',
            th: 'เนื้อหาพื้นฐานที่คัดเฉพาะสิ่งที่จำเป็นต้องใช้ทำข้อสอบ RAT และโจทย์ประยุกต์ในห้องเรียน'
          },
          formula: 'IoU = TP / (TP + FP + FN)'
        }
      ]
    }));
  };

  // Add Question (blank or from SHEE template)
  const addQuestion = (tpl = null) => {
    const nextQId = `q-${Date.now()}`;
    if (tpl) {
      setDraft((prev) => ({
        ...prev,
        questions: [
          ...prev.questions,
          {
            id: nextQId,
            stem: { ...tpl.stem },
            options: tpl.options.map((o) => ({ ...o })),
            correct: tpl.correct,
            secondaryStars: tpl.secondaryStars || [],
            isControversial: !!tpl.isControversial,
            iratClassPct: 60,
            rationale: { ...tpl.rationale }
          }
        ]
      }));
      return;
    }

    setDraft((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: nextQId,
          stem: {
            en: `Week ${prev.weekNumber || ''} Scenario: Describe a real-world GeoAI problem with multi-factor constraints that cannot be answered by simple lookup...`,
            th: `โจทย์สถานการณ์จริงประจำสัปดาห์: ระบุปัญหาการประยุกต์ใช้ GeoAI ที่มีเงื่อนไขซับซ้อน ไม่สามารถค้นคำตอบจากตำราได้โดยตรง...`
          },
          options: [
            { key: 'A', en: 'Option A (Plausible approach with specific trade-off)', th: 'ตัวเลือก A (แนวทางที่เป็นไปได้แต่มีข้อจำกัดเฉพาะ)' },
            { key: 'B', en: 'Option B (Most appropriate analytical decision)', th: 'ตัวเลือก B (แนวทางการตัดสินใจที่เหมาะสมที่สุด)' },
            { key: 'C', en: 'Option C (Alternative valid/controversial approach)', th: 'ตัวเลือก C (แนวทางทางเลือกที่อาจถูกได้เช่นกันเพื่อกระตุ้นการถกเถียง)' },
            { key: 'D', en: 'Option D (Common misconception)', th: 'ตัวเลือก D (ความเข้าใจผิดที่พบบ่อย)' }
          ],
          correct: 'B',
          secondaryStars: [],
          isControversial: false,
          iratClassPct: 65,
          rationale: {
            en: 'Explain the analytical reasoning behind the correct choice(s) and why other options fall short under the scenario constraints.',
            th: 'อธิบายเหตุผลเชิงวิเคราะห์ของตัวเลือกที่ถูกต้อง และข้อจำกัดของตัวเลือกอื่นภายใต้เงื่อนไขของโจทย์'
          }
        }
      ]
    }));
  };

  // Toggle secondary acceptable star for multi-correct TBL debate
  const toggleSecondaryStar = (qIdx, optKey) => {
    setDraft((prev) => {
      const nextQs = [...prev.questions];
      const q = { ...nextQs[qIdx] };
      const curSec = q.secondaryStars || [];
      if (optKey === q.correct) return prev; // primary star is already correct
      if (curSec.includes(optKey)) {
        q.secondaryStars = curSec.filter((k) => k !== optKey);
      } else {
        q.secondaryStars = [...curSec, optKey];
      }
      nextQs[qIdx] = q;
      return { ...prev, questions: nextQs };
    });
  };

  // Add 4S Choice
  const addCaseChoice = () => {
    const nextLetter = String.fromCharCode(65 + draft.applicationCase.specificChoices.length);
    setDraft((prev) => ({
      ...prev,
      applicationCase: {
        ...prev.applicationCase,
        specificChoices: [
          ...prev.applicationCase.specificChoices,
          {
            id: `choice-${nextLetter}`,
            label: {
              en: `Option ${nextLetter}: Specific GeoAI Pipeline Decision`,
              th: `ตัวเลือก ${nextLetter}: แนวทางการตัดสินใจเชิงเทคนิคที่ชัดเจน`
            },
            summary: {
              en: 'Concrete architecture, sensor fusion, and validation choice that teams must commit to.',
              th: 'รายละเอียดสถาปัตยกรรมโมเดล ข้อมูลที่ใช้ และวิธีตรวจสอบที่ทีมต้องเลือกตัดสินใจ'
            }
          }
        ]
      }
    }));
  };

  // Add Spatial Zone for Map
  const addSpatialZone = () => {
    const idx = draft.applicationCase.spatialZones.length + 1;
    setDraft((prev) => ({
      ...prev,
      applicationCase: {
        ...prev.applicationCase,
        spatialZones: [
          ...prev.applicationCase.spatialZones,
          {
            id: `zone-${Date.now()}`,
            name: {
              en: `Zone ${idx}: New Inspection Area`,
              th: `โซน ${idx}: พื้นที่วิเคราะห์ใหม่`
            },
            coords: [16.45 + idx * 0.03, 102.83 + idx * 0.03],
            radius: 3500,
            risk: 'High',
            color: '#dc2626',
            sarVvDb: '-18.5 dB',
            handMeters: '1.5 m',
            cloudPct: '80%',
            notes: {
              en: 'Field observation & sensor telemetry notes for this spatial zone.',
              th: 'ข้อมูลสัญญาณดาวเทียมและข้อสังเกตภาคสนามของโซนนี้'
            }
          }
        ]
      }
    }));
  };

  return (
    <div className="space-y-5">
      {/* TOP HORIZONTAL WEEK SELECTOR BAR (Full Width — No Cramped Nested Left Column) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {lang === 'en'
                ? `Select or Add Weekly Lesson (${modules.length} weeks)`
                : `เลือกสัปดาห์ที่ต้องการแก้ไข หรือเพิ่มสัปดาห์ใหม่ (${modules.length} สัปดาห์)`}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAddNewWeek}
              className="px-3.5 py-2 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              {lang === 'en' ? 'Add New Week' : '+ เพิ่มสัปดาห์ใหม่'}
            </button>

            <button
              type="button"
              onClick={handleExportAllJson}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Export JSON' : 'ส่งออก JSON'}
            </button>

            <label className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Import JSON' : 'นำเข้า JSON'}
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Horizontal Week Pills */}
        <div className="flex flex-wrap gap-2">
          {modules.map((m) => {
            const isSelected = m.id === selectedModuleId;
            return (
              <div
                key={m.id}
                onClick={() => onSelectModule(m.id)}
                className={`px-3.5 py-2 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-kku-terracotta text-white border-kku-terracotta shadow-sm font-extrabold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 font-bold'
                }`}
              >
                <div className="text-xs">
                  <span className="uppercase tracking-wider mr-1.5">{m.code}:</span>
                  <span className="opacity-95">{m.title[lang].slice(0, 32)}</span>
                </div>

                <div className="flex items-center gap-1 border-l border-current/20 pl-2">
                  <button
                    type="button"
                    title={lang === 'en' ? 'Duplicate Week' : 'คัดลอกสัปดาห์นี้'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateWeek(m.id);
                    }}
                    className="p-1 rounded hover:bg-black/15"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      title={lang === 'en' ? 'Delete Week' : 'ลบสัปดาห์นี้'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWeek(m.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/25"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN FULL-WIDTH AUTHORING WORKSPACE */}
      <div className="space-y-5">
        {/* Top Save & Sub-step Navigation Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'meta', icon: FileText, label: lang === 'en' ? '1. Week Info' : '1. ข้อมูลสัปดาห์' },
              { id: 'rat', icon: HelpCircle, label: lang === 'en' ? '2. iRAT / tRAT Questions' : '2. ข้อสอบ iRAT / tRAT' },
              { id: 'case', icon: MapPin, label: lang === 'en' ? '3. 4S Application Case' : '3. โจทย์ประยุกต์ 4S' },
              { id: 'peereval', icon: Award, label: lang === 'en' ? '4. Peer Eval' : '4. ประเมินเพื่อน' }
            ].map((tb) => {
              const Icon = tb.icon;
              const active = activeTab === tb.id;
              return (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setActiveTab(tb.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    active
                      ? 'bg-slate-900 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tb.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {saveBanner && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'en' ? 'Saved to Classroom!' : 'บันทึกเข้าชั้นเรียนแล้ว!'}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              {lang === 'en' ? 'Save Week Changes' : 'บันทึกบทเรียนสัปดาห์นี้'}
            </button>
          </div>
        </div>

        {/* TAB 1: WEEK METADATA & LEARNING OUTCOMES */}
        {activeTab === 'meta' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-slate-900">
              {lang === 'en'
                ? 'Weekly Lesson Identity & Learning Outcomes'
                : 'ข้อมูลประจำสัปดาห์และผลลัพธ์การเรียนรู้'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Week / Module Code' : 'รหัสสัปดาห์ (เช่น Week 1, Week 12)'}
                </label>
                <input
                  type="text"
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                  placeholder="e.g., Week 3"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Class Duration & Schedule Note' : 'ระยะเวลาเรียน / กำหนดการ'}
                </label>
                <input
                  type="text"
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  placeholder="3 Hours (Pre-work released 7 days prior)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lesson Title (English)
                </label>
                <input
                  type="text"
                  value={draft.title.en}
                  onChange={(e) =>
                    setDraft({ ...draft, title: { ...draft.title, en: e.target.value } })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อบทเรียนประจำสัปดาห์ (ภาษาไทย)
                </label>
                <input
                  type="text"
                  value={draft.title.th}
                  onChange={(e) =>
                    setDraft({ ...draft, title: { ...draft.title, th: e.target.value } })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Learning Outcomes Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  {lang === 'en'
                    ? 'Actionable Learning Outcomes (What students will apply in class)'
                    : 'วัตถุประสงค์การเรียนรู้เชิงประยุกต์ (สิ่งที่นักศึกษาต้องทำได้ในคาบ)'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      outcomes: {
                        en: [...prev.outcomes.en, 'New analytical GeoAI learning outcome...'],
                        th: [...prev.outcomes.th, 'ผลลัพธ์การเรียนรู้เชิงวิเคราะห์ข้อใหม่...']
                      }
                    }))
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Add Outcome' : 'เพิ่มวัตถุประสงค์'}
                </button>
              </div>

              <div className="space-y-2.5">
                {draft.outcomes.en.map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                  >
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        value={draft.outcomes.en[i] || ''}
                        onChange={(e) => {
                          const nextEn = [...draft.outcomes.en];
                          nextEn[i] = e.target.value;
                          setDraft({ ...draft, outcomes: { ...draft.outcomes, en: nextEn } });
                        }}
                        placeholder="English outcome..."
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        value={draft.outcomes.th[i] || ''}
                        onChange={(e) => {
                          const nextTh = [...draft.outcomes.th];
                          nextTh[i] = e.target.value;
                          setDraft({ ...draft, outcomes: { ...draft.outcomes, th: nextTh } });
                        }}
                        placeholder="วัตถุประสงค์ภาษาไทย..."
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="md:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDraft({
                            ...draft,
                            outcomes: {
                              en: draft.outcomes.en.filter((__, idx) => idx !== i),
                              th: draft.outcomes.th.filter((__, idx) => idx !== i)
                            }
                          });
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRE-WORK AUTHORING */}
        {activeTab === 'prework' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'en'
                    ? 'Step 1: Self-Directed Pre-work Materials'
                    : 'ขั้นตอนที่ 1: เอกสารและสื่อการเรียนรู้ด้วยตนเองก่อนเข้าชั้นเรียน'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Per Dr. Cherdsak (p. 23): Provide materials ≥1 week before class; keep volume focused strictly on what is required for in-class activities.'
                    : 'คำแนะนำจากบทความ (หน้า 23): เปิดให้ดาวน์โหลดก่อนคาบเรียนไม่ต่ำกว่า 1 สัปดาห์ และคัดเฉพาะเนื้อหาที่จำเป็นต้องใช้ทำกิจกรรมจริง'}
                </p>
              </div>
              <button
                type="button"
                onClick={addPreworkItem}
                className="px-3.5 py-2 rounded-xl bg-kku-terracotta text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {lang === 'en' ? 'Add Pre-work Material' : 'เพิ่มสื่อการสอนล่วงหน้า'}
              </button>
            </div>

            <div className="space-y-4">
              {draft.preworkMaterials.map((mat, idx) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-bold text-xs">
                        Material #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={mat.type}
                        onChange={(e) => {
                          const next = [...draft.preworkMaterials];
                          next[idx] = { ...mat, type: e.target.value };
                          setDraft({ ...draft, preworkMaterials: next });
                        }}
                        placeholder="Reading / Video / GEE Script"
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold w-36"
                      />
                      <input
                        type="text"
                        value={mat.duration}
                        onChange={(e) => {
                          const next = [...draft.preworkMaterials];
                          next[idx] = { ...mat, duration: e.target.value };
                          setDraft({ ...draft, preworkMaterials: next });
                        }}
                        placeholder="20 min"
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs w-24"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          preworkMaterials: draft.preworkMaterials.filter((_, i) => i !== idx)
                        })
                      }
                      className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Remove' : 'ลบ'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        Title (EN)
                      </label>
                      <input
                        type="text"
                        value={mat.title.en}
                        onChange={(e) => {
                          const next = [...draft.preworkMaterials];
                          next[idx] = { ...mat, title: { ...mat.title, en: e.target.value } };
                          setDraft({ ...draft, preworkMaterials: next });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        ชื่อสื่อการเรียนรู้ (TH)
                      </label>
                      <input
                        type="text"
                        value={mat.title.th}
                        onChange={(e) => {
                          const next = [...draft.preworkMaterials];
                          next[idx] = { ...mat, title: { ...mat.title, th: e.target.value } };
                          setDraft({ ...draft, preworkMaterials: next });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        Core Concept Summary (EN)
                      </label>
                      <textarea
                        rows={2}
                        value={mat.summary.en}
                        onChange={(e) => {
                          const next = [...draft.preworkMaterials];
                          next[idx] = { ...mat, summary: { ...mat.summary, en: e.target.value } };
                          setDraft({ ...draft, preworkMaterials: next });
                        }}
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        สรุปแนวคิดสำคัญ (TH)
                      </label>
                      <textarea
                        rows={2}
                        value={mat.summary.th}
                        onChange={(e) => {
                          const next = [...draft.preworkMaterials];
                          next[idx] = { ...mat, summary: { ...mat.summary, th: e.target.value } };
                          setDraft({ ...draft, preworkMaterials: next });
                        }}
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Key Equation / Code Snippet / Reference Link
                    </label>
                    <input
                      type="text"
                      value={mat.formula}
                      onChange={(e) => {
                        const next = [...draft.preworkMaterials];
                        next[idx] = { ...mat, formula: e.target.value };
                        setDraft({ ...draft, preworkMaterials: next });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: iRAT / tRAT QUESTION DESIGN STUDIO */}
        {activeTab === 'rat' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'en'
                    ? 'Step 2 & 3: iRAT / tRAT Question Authoring (SHEE TBL Standard)'
                    : 'ขั้นตอนที่ 2 & 3: ออกข้อสอบ iRAT / tRAT (ตามหลักการสร้างข้อสอบ TBL)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Design complex real-world scenarios. You can designate 1 primary ★ Star and optional secondary ★ Stars for controversial/multi-correct items.'
                    : 'สร้างโจทย์สถานการณ์จริงที่ซับซ้อน สามารถกำหนดคำตอบหลัก (★) และคำตอบที่ยอมรับได้เพิ่มเติมสำหรับข้อที่มีประเด็นถกเถียง (Controversy)'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion(null)}
                  className="px-3.5 py-2 rounded-xl bg-kku-terracotta text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'en' ? 'Add Blank Question' : 'เพิ่มข้อสอบใหม่'}
                </button>
                {GEOAI_QUESTION_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addQuestion(tpl)}
                    className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    + {tpl.name[lang].slice(0, 26)}...
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {draft.questions.map((q, qIdx) => {
                const secStars = q.secondaryStars || [];
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-xs">
                          Q{qIdx + 1}
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1 rounded-lg border border-slate-200">
                          <input
                            type="checkbox"
                            checked={!!q.isControversial}
                            onChange={(e) => {
                              const next = [...draft.questions];
                              next[qIdx] = { ...q, isControversial: e.target.checked };
                              setDraft({ ...draft, questions: next });
                            }}
                            className="accent-kku-terracotta"
                          />
                          {lang === 'en'
                            ? 'Controversy / Multi-Perspective Discussion Item'
                            : 'โจทย์ประเด็นถกเถียง (Controversy)'}
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            questions: draft.questions.filter((_, i) => i !== qIdx)
                          })
                        }
                        className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {lang === 'en' ? 'Delete Q' : 'ลบข้อนี้'}
                      </button>
                    </div>

                    {/* Question Stem EN & TH */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Scenario Question Stem (English)
                        </label>
                        <textarea
                          rows={3}
                          value={q.stem.en}
                          onChange={(e) => {
                            const next = [...draft.questions];
                            next[qIdx] = { ...q, stem: { ...q.stem, en: e.target.value } };
                            setDraft({ ...draft, questions: next });
                          }}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          โจทย์สถานการณ์ปัญหา (ภาษาไทย)
                        </label>
                        <textarea
                          rows={3}
                          value={q.stem.th}
                          onChange={(e) => {
                            const next = [...draft.questions];
                            next[qIdx] = { ...q, stem: { ...q.stem, th: e.target.value } };
                            setDraft({ ...draft, questions: next });
                          }}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                        />
                      </div>
                    </div>

                    {/* Options A-D with Primary Star & Optional Multi-Star */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-600">
                        {lang === 'en'
                          ? 'Options A–D (Click "Primary ★" for main answer, or "+ Multi ★" if more than one option is acceptable in TBL discussion)'
                          : 'ตัวเลือก A–D (คลิก "เฉลยหลัก ★" หรือ "+ เฉลยร่วม ★" หากต้องการให้มีคำตอบที่ถูกได้มากกว่า 1 ข้อตามแนวทาง TBL)'}
                      </div>
                      {q.options.map((opt, oIdx) => {
                        const isPrimary = q.correct === opt.key;
                        const isSecondary = secStars.includes(opt.key);
                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-xl border grid grid-cols-1 md:grid-cols-12 gap-2 items-center ${
                              isPrimary
                                ? 'bg-emerald-50 border-emerald-400'
                                : isSecondary
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="md:col-span-2 flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                {opt.key}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...draft.questions];
                                  next[qIdx] = {
                                    ...q,
                                    correct: opt.key,
                                    secondaryStars: (q.secondaryStars || []).filter(
                                      (k) => k !== opt.key
                                    )
                                  };
                                  setDraft({ ...draft, questions: next });
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-extrabold ${
                                  isPrimary
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {isPrimary ? '★ Primary' : 'Set ★'}
                              </button>
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => toggleSecondaryStar(qIdx, opt.key)}
                                  className={`px-1.5 py-1 rounded text-[10px] font-bold ${
                                    isSecondary
                                      ? 'bg-amber-400 text-slate-950'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                  title="Allow as second valid answer in TBL discussion"
                                >
                                  {isSecondary ? '★ Co-Star' : '+2nd'}
                                </button>
                              )}
                            </div>

                            <div className="md:col-span-5">
                              <input
                                type="text"
                                value={opt.en}
                                onChange={(e) => {
                                  const next = [...draft.questions];
                                  const nextOpts = [...q.options];
                                  nextOpts[oIdx] = { ...opt, en: e.target.value };
                                  next[qIdx] = { ...q, options: nextOpts };
                                  setDraft({ ...draft, questions: next });
                                }}
                                placeholder={`Option ${opt.key} (EN)`}
                                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                              />
                            </div>
                            <div className="md:col-span-5">
                              <input
                                type="text"
                                value={opt.th}
                                onChange={(e) => {
                                  const next = [...draft.questions];
                                  const nextOpts = [...q.options];
                                  nextOpts[oIdx] = { ...opt, th: e.target.value };
                                  next[qIdx] = { ...q, options: nextOpts };
                                  setDraft({ ...draft, questions: next });
                                }}
                                placeholder={`ตัวเลือก ${opt.key} (TH)`}
                                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rationale / Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Immediate Feedback Rationale (EN)
                        </label>
                        <textarea
                          rows={2}
                          value={q.rationale.en}
                          onChange={(e) => {
                            const next = [...draft.questions];
                            next[qIdx] = {
                              ...q,
                              rationale: { ...q.rationale, en: e.target.value }
                            };
                            setDraft({ ...draft, questions: next });
                          }}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          คำอธิบายเฉลยและเหตุผลประกอบ (TH)
                        </label>
                        <textarea
                          rows={2}
                          value={q.rationale.th}
                          onChange={(e) => {
                            const next = [...draft.questions];
                            next[qIdx] = {
                              ...q,
                              rationale: { ...q.rationale, th: e.target.value }
                            };
                            setDraft({ ...draft, questions: next });
                          }}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 4S APPLICATION CASE AUTHORING */}
        {activeTab === 'case' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {lang === 'en'
                  ? 'Step 5: 4S Application Exercise Builder (Significant • Same • Specific Choice • Simultaneous)'
                  : 'ขั้นตอนที่ 5: ออกแบบโจทย์ประยุกต์ตามหลัก 4S'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Per Dr. Cherdsak (p. 27): Use Specific Choice MCQs rather than long essays so teams spend their time debating concepts rather than splitting up writing tasks.'
                  : 'ตามคำแนะนำในบทความ (หน้า 27): ให้ใช้รูปแบบตัวเลือกที่ชัดเจน (Specific Choice) แทนการเขียนบรรยายยาวๆ เพื่อให้นักศึกษาใช้เวลาอภิปรายร่วมกันทั้งทีม'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4S Case Title (EN)
                </label>
                <input
                  type="text"
                  value={draft.applicationCase.title.en}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      applicationCase: {
                        ...draft.applicationCase,
                        title: { ...draft.applicationCase.title, en: e.target.value }
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อโจทย์กรณีศึกษาประยุกต์ 4S (TH)
                </label>
                <input
                  type="text"
                  value={draft.applicationCase.title.th}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      applicationCase: {
                        ...draft.applicationCase,
                        title: { ...draft.applicationCase.title, th: e.target.value }
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Significant Same-Problem Scenario (EN)
                </label>
                <textarea
                  rows={3}
                  value={draft.applicationCase.scenario.en}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      applicationCase: {
                        ...draft.applicationCase,
                        scenario: { ...draft.applicationCase.scenario, en: e.target.value }
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายละเอียดสถานการณ์ปัญหาสำคัญที่ทุกทีมต้องแก้ร่วมกัน (TH)
                </label>
                <textarea
                  rows={3}
                  value={draft.applicationCase.scenario.th}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      applicationCase: {
                        ...draft.applicationCase,
                        scenario: { ...draft.applicationCase.scenario, th: e.target.value }
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs"
                />
              </div>
            </div>

            {/* Specific Choices Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  {lang === 'en'
                    ? 'Specific Choices (Teams raise cards A/B/C/D simultaneously)'
                    : 'ตัวเลือกการตัดสินใจที่ชัดเจน (Specific Choices สำหรับยกป้ายตอบพร้อมกัน)'}
                </label>
                <button
                  type="button"
                  onClick={addCaseChoice}
                  className="px-3 py-1.5 rounded-lg bg-kku-terracotta text-white font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Add Choice Option' : 'เพิ่มตัวเลือก'}
                </button>
              </div>

              <div className="space-y-3">
                {draft.applicationCase.specificChoices.map((ch, cIdx) => {
                  const isRec = draft.applicationCase.recommendedChoice === ch.id;
                  return (
                    <div
                      key={ch.id}
                      className={`p-3.5 rounded-xl border space-y-2 ${
                        isRec ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-slate-900 text-amber-300 font-extrabold text-xs">
                            {ch.id.replace('choice-', 'Card ')}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                applicationCase: {
                                  ...draft.applicationCase,
                                  recommendedChoice: ch.id
                                }
                              })
                            }
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              isRec
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {isRec ? '★ Best Choice' : 'Set as Best Choice'}
                          </button>
                        </div>

                        {draft.applicationCase.specificChoices.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                applicationCase: {
                                  ...draft.applicationCase,
                                  specificChoices: draft.applicationCase.specificChoices.filter(
                                    (_, i) => i !== cIdx
                                  )
                                }
                              })
                            }
                            className="text-rose-600 hover:bg-rose-100 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ch.label.en}
                          onChange={(e) => {
                            const next = [...draft.applicationCase.specificChoices];
                            next[cIdx] = { ...ch, label: { ...ch.label, en: e.target.value } };
                            setDraft({
                              ...draft,
                              applicationCase: { ...draft.applicationCase, specificChoices: next }
                            });
                          }}
                          placeholder="Option Title (EN)"
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={ch.label.th}
                          onChange={(e) => {
                            const next = [...draft.applicationCase.specificChoices];
                            next[cIdx] = { ...ch, label: { ...ch.label, th: e.target.value } };
                            setDraft({
                              ...draft,
                              applicationCase: { ...draft.applicationCase, specificChoices: next }
                            });
                          }}
                          placeholder="ชื่อตัวเลือก (TH)"
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ch.summary.en}
                          onChange={(e) => {
                            const next = [...draft.applicationCase.specificChoices];
                            next[cIdx] = { ...ch, summary: { ...ch.summary, en: e.target.value } };
                            setDraft({
                              ...draft,
                              applicationCase: { ...draft.applicationCase, specificChoices: next }
                            });
                          }}
                          placeholder="Technical details (EN)"
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={ch.summary.th}
                          onChange={(e) => {
                            const next = [...draft.applicationCase.specificChoices];
                            next[cIdx] = { ...ch, summary: { ...ch.summary, th: e.target.value } };
                            setDraft({
                              ...draft,
                              applicationCase: { ...draft.applicationCase, specificChoices: next }
                            });
                          }}
                          placeholder="คำอธิบายแนวทาง (TH)"
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Map Zones Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  {lang === 'en'
                    ? 'Interactive Map Spatial Zones (Lat/Lng & Sensor Telemetry)'
                    : 'พิกัดโซนบนแผนที่โต้ตอบและค่าสัญญาณดาวเทียมประจำสัปดาห์'}
                </label>
                <button
                  type="button"
                  onClick={addSpatialZone}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Add Map Zone' : 'เพิ่มโซนแผนที่'}
                </button>
              </div>

              <div className="space-y-2.5">
                {draft.applicationCase.spatialZones.map((zn, zIdx) => (
                  <div
                    key={zn.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={zn.name[lang]}
                        onChange={(e) => {
                          const next = [...draft.applicationCase.spatialZones];
                          next[zIdx] = {
                            ...zn,
                            name: { ...zn.name, [lang]: e.target.value }
                          };
                          setDraft({
                            ...draft,
                            applicationCase: { ...draft.applicationCase, spatialZones: next }
                          });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1 font-bold"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={zn.coords[0]}
                        onChange={(e) => {
                          const next = [...draft.applicationCase.spatialZones];
                          next[zIdx] = {
                            ...zn,
                            coords: [parseFloat(e.target.value) || 16.4, zn.coords[1]]
                          };
                          setDraft({
                            ...draft,
                            applicationCase: { ...draft.applicationCase, spatialZones: next }
                          });
                        }}
                        className="w-1/2 rounded border border-slate-300 px-1.5 py-1 font-mono text-[11px]"
                        title="Latitude"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={zn.coords[1]}
                        onChange={(e) => {
                          const next = [...draft.applicationCase.spatialZones];
                          next[zIdx] = {
                            ...zn,
                            coords: [zn.coords[0], parseFloat(e.target.value) || 102.8]
                          };
                          setDraft({
                            ...draft,
                            applicationCase: { ...draft.applicationCase, spatialZones: next }
                          });
                        }}
                        className="w-1/2 rounded border border-slate-300 px-1.5 py-1 font-mono text-[11px]"
                        title="Longitude"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={zn.sarVvDb}
                        onChange={(e) => {
                          const next = [...draft.applicationCase.spatialZones];
                          next[zIdx] = { ...zn, sarVvDb: e.target.value };
                          setDraft({
                            ...draft,
                            applicationCase: { ...draft.applicationCase, spatialZones: next }
                          });
                        }}
                        placeholder="Sensor Telemetry"
                        className="w-full rounded-lg border border-slate-300 px-2 py-1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={zn.notes[lang]}
                        onChange={(e) => {
                          const next = [...draft.applicationCase.spatialZones];
                          next[zIdx] = {
                            ...zn,
                            notes: { ...zn.notes, [lang]: e.target.value }
                          };
                          setDraft({
                            ...draft,
                            applicationCase: { ...draft.applicationCase, spatialZones: next }
                          });
                        }}
                        placeholder="Diagnostic note"
                        className="w-full rounded-lg border border-slate-300 px-2 py-1"
                      />
                    </div>
                    <div className="md:col-span-1 text-right">
                      {draft.applicationCase.spatialZones.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              applicationCase: {
                                ...draft.applicationCase,
                                spatialZones: draft.applicationCase.spatialZones.filter(
                                  (_, i) => i !== zIdx
                                )
                              }
                            })
                          }
                          className="text-rose-600 p-1 hover:bg-rose-100 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEEKLY PEER EVALUATION CONFIGURATION */}
        {activeTab === 'peereval' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {lang === 'en'
                ? 'Step 6: Weekly Peer Evaluation Criteria & Point Pool'
                : 'ขั้นตอนที่ 6: กำหนดเกณฑ์การประเมินเพื่อนร่วมทีมประจำสัปดาห์'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Customize the weekly peer evaluation prompt and criteria for this specific GeoAI lesson.'
                : 'ปรับแต่งเกณฑ์การให้คะแนนและคำถามสะท้อนคิดในการทำงานร่วมกันของสัปดาห์นี้'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weekly Evaluation Focus Prompt (EN)
                </label>
                <textarea
                  rows={3}
                  value={
                    draft.peerEvalConfig?.prompt?.en ||
                    'Evaluate your teammates on: (1) Pre-work readiness, (2) Active reasoning during gRAT/tRAT discussion, and (3) Evidence defense during the 4S Simultaneous Report.'
                  }
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      peerEvalConfig: {
                        ...(draft.peerEvalConfig || {}),
                        prompt: {
                          ...(draft.peerEvalConfig?.prompt || {}),
                          en: e.target.value
                        }
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  โจทย์เน้นย้ำในการประเมินเพื่อนประจำสัปดาห์ (TH)
                </label>
                <textarea
                  rows={3}
                  value={
                    draft.peerEvalConfig?.prompt?.th ||
                    'ประเมินเพื่อนร่วมทีมในสัปดาห์นี้จาก: (1) การอ่านเอกสารล่วงหน้า, (2) การร่วมวิเคราะห์และแลกเปลี่ยนความเห็นในข้อสอบ gRAT/tRAT, และ (3) การช่วยกันหาเหตุผลสนับสนุนตัวเลือกในโจทย์ประยุกต์ 4S'
                  }
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      peerEvalConfig: {
                        ...(draft.peerEvalConfig || {}),
                        prompt: {
                          ...(draft.peerEvalConfig?.prompt || {}),
                          th: e.target.value
                        }
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
