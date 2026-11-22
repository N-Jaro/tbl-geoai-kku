import React, { useState } from 'react';
import {
  Tv,
  Users,
  BarChart3,
  Download,
  Upload,
  Wrench,
  Dices,
  Crown,
  Eye,
  EyeOff,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  ShieldCheck,
  GraduationCap,
  AlertTriangle,
  X,
  BookOpen,
  Settings,
  UserPlus,
  Search,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import LessonBuilder from './LessonBuilder';

const PIN_STORAGE_KEY = 'kku_geoai_instructor_pin_v1';
const DEFAULT_PIN = '2026';

export default function InstructorPortal({
  lang,
  isInstructorAuthed,
  onSetInstructorAuthed,
  classes,
  selectedClassId,
  onSelectClassId,
  classInfo,
  onUpdateClassInfo,
  modules,
  selectedModuleId,
  onSelectModuleId,
  onSaveModule,
  onAddNewWeek,
  onDuplicateWeek,
  onDeleteWeek,
  onImportModules,
  teams,
  roster,
  onUpdateRoster,
  weeklyCheckins,
  onReshuffleAllRandomTeams,
  teamRepByMod,
  onSetTeamRep,
  getStudentIratScore,
  getStudentIratScoreForModule,
  getStudentPeerScore,
  getStudentPeerScoreForModule,
  getTeamTratSummaryForModule,
  tratTotalSummary,
  teamCaseChoiceByMod,
  teamCaseRationaleByMod,
  stickersByMod = {},
  onAdjustStudentSticker,
  formatLast4Id,
  simultaneousReveal,
  onToggleSimultaneousReveal,
  revealExpertAnswer = false,
  onToggleRevealExpertAnswer,
  unlockedSteps,
  onSetUnlockedSteps,
  iratRecordsByMod = {},
  tratScratchesByMod = {},
  projectorState,
  onUpdateProjectorState,
  onResetWeekScores,
  onClearAllSessionData,
  onSwitchToStudentView,
  onOpenAdminPortal
}) {
  // Security Passcode State (Per-Class PIN)
  const activeClassPin = classInfo?.pin || DEFAULT_PIN;
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangedMsg, setPinChangedMsg] = useState(false);

  // 5-Section Sidebar Navigation: 'stage' | 'scores' | 'roster' | 'lessons' | 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('kku_geoai_instructor_tab_v2');
      if (saved && ['stage', 'scores', 'roster', 'lessons', 'settings'].includes(saved)) {
        return saved;
      }
      return 'stage';
    } catch (e) {
      return 'stage';
    }
  });

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    try {
      localStorage.setItem('kku_geoai_instructor_tab_v2', tabId);
    } catch (e) {}
  };

  // Roster bulk import & search state
  const [bulkText, setBulkText] = useState('');
  const [importMsg, setImportMsg] = useState(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const [singleStudentId, setSingleStudentId] = useState('');
  const [singleStudentName, setSingleStudentName] = useState('');
  const [singleStudentSec, setSingleStudentSec] = useState('Sec 01');

  // Scores Sub-View Mode: 'weekly' (Selected Week) | 'semester' (Cumulative Multi-Week Summary)
  const [scoresViewMode, setScoresViewMode] = useState('weekly');
  const [iratWeightPct, setIratWeightPct] = useState(
    () => Number(classInfo?.iratWeightPct) || 40
  );
  const [tratWeightPct, setTratWeightPct] = useState(
    () => Number(classInfo?.tratWeightPct) || 60
  );
  const [usePeerMultiplier, setUsePeerMultiplier] = useState(
    () => classInfo?.usePeerMultiplier !== false
  );

  // Strict Clear All Confirmation Modal State
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearConfirmWord, setClearConfirmWord] = useState('');
  const [clearPinConfirm, setClearPinConfirm] = useState('');
  const [clearError, setClearError] = useState('');

  // Per-Week Score Reset Modal & Toast State
  const [resetWeekModalOpen, setResetWeekModalOpen] = useState(false);
  const [weekResetToast, setWeekResetToast] = useState(false);

  const currentModule = modules.find((m) => m.id === selectedModuleId) || modules[0];
  const moduleCheckins = weeklyCheckins[currentModule?.id] || {};
  const moduleReps = teamRepByMod[currentModule?.id] || {};
  const checkedInCount = teams.reduce(
    (acc, tm) => acc + (moduleCheckins[tm.id]?.length || 0),
    0
  );

  // Handle Passcode Login (Authenticates against the selected class's PIN)
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === activeClassPin) {
      setPinError(false);
      setPinInput('');
      onSetInstructorAuthed(true);
    } else {
      setPinError(true);
    }
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    const clean = newPinInput.trim();
    if (clean.length < 4) return;
    onUpdateClassInfo({ ...classInfo, pin: clean });
    setNewPinInput('');
    setPinChangedMsg(true);
    setTimeout(() => setPinChangedMsg(false), 3000);
  };

  // ================= SECURITY GATE SCREEN (BEFORE AUTHENTICATION) =================
  if (!isInstructorAuthed) {
    return (
      <div className="max-w-lg mx-auto my-8 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        {/* Top Dark Gradient Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-kku-dark text-white px-8 py-7 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <KeyRound className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Instructor Login' : 'เข้าสู่ระบบสำหรับอาจารย์ประจำวิชา'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
            {lang === 'en' ? 'Select Your Assigned Class' : 'เลือกรายวิชาของคุณและกรอกรหัส PIN'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {lang === 'en'
              ? 'Each instructor sees only their own assigned class after signing in.'
              : 'เมื่อเข้าสู่ระบบแล้ว อาจารย์จะเห็นเฉพาะข้อมูลและรายชื่อนักศึกษาในรายวิชาของตนเองเท่านั้น'}
          </p>
        </div>

        <div className="p-8 space-y-5">
          <form onSubmit={handlePinSubmit} className="space-y-4">
            {/* Select Instructor's Assigned Course BEFORE logging in */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                {lang === 'en'
                  ? '1. Select Your Assigned Course / Instructor'
                  : '1. เลือกรายวิชาและชื่ออาจารย์ผู้สอน'}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  onSelectClassId(e.target.value);
                  setPinError(false);
                }}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-kku-terracotta"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.courseCode}: {cls.courseName} — ({cls.instructorName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                {lang === 'en'
                  ? `2. Enter Class Passcode for ${classInfo.courseCode}`
                  : `2. กรอกรหัสผ่าน (PIN) ประจำวิชา ${classInfo.courseCode}`}
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder={lang === 'en' ? 'Enter Class PIN (e.g. 2026)' : 'กรอกรหัส PIN (เช่น 2026)'}
                className={`w-full rounded-2xl border-2 px-4 py-3.5 text-center text-xl font-mono font-extrabold tracking-widest focus:outline-none transition ${
                  pinError
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-kku-terracotta focus:ring-4 focus:ring-kku-terracotta/10'
                }`}
                autoFocus
                required
              />
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 text-center">
                {lang === 'en'
                  ? 'Incorrect PIN for this class.'
                  : 'รหัสผ่านประจำวิชานี้ไม่ถูกต้อง'}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onSwitchToStudentView}
                className="py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {lang === 'en' ? '← Student View' : '← กลับหน้านักศึกษา'}
              </button>
              <button
                type="submit"
                className="py-3.5 rounded-2xl bg-gradient-to-r from-kku-terracotta to-kku-dark hover:from-kku-dark hover:to-slate-900 text-white font-extrabold text-xs shadow-lg shadow-kku-terracotta/25 transition"
              >
                {lang === 'en' ? 'Sign In to My Class →' : 'เข้าสู่รายวิชาของฉัน →'}
              </button>
            </div>
          </form>

          {onOpenAdminPortal && (
            <div className="pt-4 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 underline"
              >
                {lang === 'en'
                  ? 'System Admin: Manage Instructors & Add/Remove Classes →'
                  : 'สำหรับผู้ดูแลระบบ (Admin): จัดการรายวิชาและอาจารย์ผู้สอนทั้งหมด →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Parse CSV or Excel paste
  const parseRosterText = (rawText) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && /student\s*id|รหัสนักศึกษา|name|ชื่อ/i.test(line)) return;
      const parts = line.split(/[\t,;]+/).map((p) => p.trim());
      if (parts.length >= 2) {
        parsed.push({
          id: parts[0],
          name: parts[1],
          section: parts[2] || 'Sec 01'
        });
      }
    });
    return parsed;
  };

  const handleBulkPasteImport = () => {
    const parsed = parseRosterText(bulkText);
    if (parsed.length === 0) return;
    const map = new Map(roster.map((s) => [s.id, s]));
    parsed.forEach((p) => map.set(p.id, p));
    onUpdateRoster(Array.from(map.values()));
    setBulkText('');
    setImportMsg(
      lang === 'en'
        ? `Imported ${parsed.length} students!`
        : `นำเข้ารายชื่อนักศึกษาสำเร็จ ${parsed.length} คน!`
    );
    setTimeout(() => setImportMsg(null), 3000);
  };

  const handleAddSingleStudent = (e) => {
    e.preventDefault();
    if (!singleStudentId.trim() || !singleStudentName.trim()) return;
    const newSt = {
      id: singleStudentId.trim(),
      name: singleStudentName.trim(),
      section: singleStudentSec.trim() || 'Sec 01'
    };
    const map = new Map(roster.map((s) => [s.id, s]));
    map.set(newSt.id, newSt);
    onUpdateRoster(Array.from(map.values()));
    setSingleStudentId('');
    setSingleStudentName('');
    setImportMsg(
      lang === 'en' ? `Added ${newSt.name}!` : `เพิ่มรายชื่อ ${newSt.name} เรียบร้อยแล้ว!`
    );
    setTimeout(() => setImportMsg(null), 3000);
  };

  const handleRemoveSingleStudent = (stId) => {
    onUpdateRoster(roster.filter((s) => s.id !== stId));
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseRosterText(evt.target.result || '');
      if (parsed.length > 0) {
        const map = new Map(roster.map((s) => [s.id, s]));
        parsed.forEach((p) => map.set(p.id, p));
        onUpdateRoster(Array.from(map.values()));
        setImportMsg(
          lang === 'en'
            ? `Imported ${parsed.length} students from ${file.name}!`
            : `นำเข้ารายชื่อ ${parsed.length} คนจากไฟล์ ${file.name}!`
        );
        setTimeout(() => setImportMsg(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const getStudentTeamForModule = (modId, studentId) => {
    const modTeams = weeklyCheckins[modId] || {};
    for (const tm of teams) {
      const list = modTeams[tm.id] || [];
      if (list.some((m) => m.id === studentId)) return tm;
    }
    return null;
  };

  const getStudentTeamForWeek = (studentId) =>
    getStudentTeamForModule(currentModule?.id, studentId);

  // Compute 1-week weighted score for a student (out of 100%)
  const computeStudentWeekBreakdown = (modObj, studentId) => {
    if (!modObj) return null;
    const tm = getStudentTeamForModule(modObj.id, studentId);
    const isLeader = tm && teamRepByMod[modObj.id]?.[tm.id] === studentId;
    const irat = getStudentIratScoreForModule
      ? getStudentIratScoreForModule(modObj, studentId)
      : getStudentIratScore(studentId);
    const peer = getStudentPeerScoreForModule
      ? getStudentPeerScoreForModule(modObj.id, studentId)
      : getStudentPeerScore(studentId);
    const tratSummary =
      tm && getTeamTratSummaryForModule
        ? getTeamTratSummaryForModule(modObj, tm.id)
        : tratTotalSummary;

    const iratPct = irat?.submitted ? irat.pct : 0;
    const tratPct = tm ? tratSummary?.pct || 0 : 0;
    const peerAvg10 =
      peer?.avgStars !== null && peer?.avgStars !== undefined ? peer.avgStars : 10;
    const peerFactor = usePeerMultiplier ? peerAvg10 / 10 : 1;

    const weightedIrat = (iratPct * iratWeightPct) / 100;
    const weightedTrat = ((tratPct * tratWeightPct) / 100) * peerFactor;
    const finalWeekScore = Math.round((weightedIrat + weightedTrat) * 10) / 10;
    const stickersCount = Number(stickersByMod?.[modObj.id]?.[studentId]) || 0;

    return {
      team: tm,
      isLeader,
      checkedIn: !!tm,
      irat,
      iratPct,
      tratPct,
      peer,
      peerAvg10,
      stickersCount,
      finalWeekScore
    };
  };

  // Compute full-semester multi-week cumulative summary for a student across all weeks in this class
  const computeStudentSemesterSummary = (studentId) => {
    let attendedWeeks = 0;
    let iratSum = 0;
    let tratSum = 0;
    let peerSum = 0;
    let peerRatedWeeks = 0;
    let totalStickers = 0;
    let finalScoreSum = 0;
    const perWeek = modules.map((mod) => {
      const wk = computeStudentWeekBreakdown(mod, studentId);
      if (wk?.checkedIn || wk?.irat?.submitted) {
        attendedWeeks += 1;
      }
      iratSum += wk?.iratPct || 0;
      tratSum += wk?.tratPct || 0;
      if (wk?.peer?.avgStars !== null && wk?.peer?.avgStars !== undefined) {
        peerSum += wk.peer.avgStars;
        peerRatedWeeks += 1;
      }
      totalStickers += wk?.stickersCount || 0;
      finalScoreSum += wk?.finalWeekScore || 0;
      return {
        moduleId: mod.id,
        code: mod.code,
        ...wk
      };
    });

    const totalWeeks = Math.max(1, modules.length);
    const avgIratPct = Math.round((iratSum / totalWeeks) * 10) / 10;
    const avgTratPct = Math.round((tratSum / totalWeeks) * 10) / 10;
    const avgPeer10 =
      peerRatedWeeks > 0 ? Math.round((peerSum / peerRatedWeeks) * 10) / 10 : 10.0;
    const semesterFinalPct = Math.round((finalScoreSum / totalWeeks) * 10) / 10;

    // Direct 10-point conversions for the user's syllabus:
    // 1. TBL (10% of course = 10 pts): scaled from semester average of iRAT & tRAT
    const tblScoreOutOf10 = Math.round((semesterFinalPct / 10) * 100) / 100;

    // 2. จิตพิสัย / Affective & Teamwork (10% of course = 10 pts):
    // Combines weekly TBL Attendance ratio (4 pts) + Peer Evaluation average out of 10 (4 pts) + Discussion Stickers (0.5 pt per sticker, up to +2 pts, capped at 10)
    const attendanceRatio = attendedWeeks / totalWeeks;
    const stickerBonusPts = Math.min(2, totalStickers * 0.5);
    const affectiveScoreOutOf10 = Math.min(
      10,
      Math.round((attendanceRatio * 4 + (avgPeer10 / 10) * 4 + stickerBonusPts) * 100) / 100
    );
    const combinedCourse20Pts =
      Math.round((tblScoreOutOf10 + affectiveScoreOutOf10) * 100) / 100;

    return {
      attendedWeeks,
      totalWeeks,
      avgIratPct,
      avgTratPct,
      avgPeer10,
      totalStickers,
      semesterFinalPct,
      tblScoreOutOf10,
      affectiveScoreOutOf10,
      combinedCourse20Pts,
      perWeek
    };
  };

  const handleExportMasterCsv = () => {
    const headers = [
      'Course_Code',
      'Week',
      'Student_ID',
      'Full_Name',
      'Section',
      'Random_Assigned_Team',
      'Role_In_Team',
      'Individual_iRAT_Score_Pct',
      'Individual_iRAT_Status',
      'Team_tRAT_Score_Pct',
      'Peer_Eval_Received_Avg_Out_Of_10',
      'Peer_Eval_Raters_Count',
      'Peer_Eval_Submitted_Own',
      `Final_Weighted_Score_Pct_(iRAT_${iratWeightPct}%_tRAT_${tratWeightPct}%)`,
      'Peer_Eval_Feedback_Notes',
      'Discussion_Stickers_Count',
      'Team_4S_Card',
      'Team_4S_Justification'
    ];

    const rows = roster.map((st) => {
      const wk = computeStudentWeekBreakdown(currentModule, st.id);
      const modChoices = teamCaseChoiceByMod[currentModule.id];
      const rawCard =
        (modChoices && typeof modChoices === 'object' && wk.team
          ? modChoices[wk.team.id]
          : null) || '-';
      const card = rawCard.replace('choice-', 'Card ');
      const teamReason =
        (wk.team && teamCaseRationaleByMod?.[currentModule.id]?.[wk.team.id]) || '';

      return [
        classInfo.courseCode,
        currentModule.code,
        st.id,
        `"${st.name}"`,
        st.section || 'Sec 01',
        wk.team ? `"${wk.team.name}"` : '"Not Checked In"',
        wk.isLeader ? 'Team Leader (tRAT Submitter)' : wk.team ? 'Team Member' : '-',
        `${wk.iratPct}%`,
        wk.irat?.submitted ? 'Submitted' : 'Pending',
        wk.team ? `${wk.tratPct}%` : '-',
        wk.peer?.avgStars !== null && wk.peer?.avgStars !== undefined
          ? `${wk.peer.avgStars} / 10`
          : '10.0 / 10 (Default)',
        wk.peer?.ratersCount || 0,
        wk.peer?.hasSubmittedOwn ? 'Submitted' : 'Pending',
        `${wk.finalWeekScore}%`,
        `"${(wk.peer?.notes || []).join(' | ')}"`,
        wk.stickersCount || 0,
        wk.team ? card : '-',
        `"${String(teamReason).replace(/"/g, '""')}"`
      ];
    });

    const csv =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csv));
    a.setAttribute(
      'download',
      `${classInfo.courseCode}_${currentModule.code.replace(' ', '_')}_Grades.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export ALL Weeks + Cumulative Final Semester Gradebook in ONE Excel-ready CSV
  const handleExportFullSemesterCsv = () => {
    const weekHeaders = [];
    modules.forEach((m) => {
      const wCode = m.code.replace(/\s+/g, '_');
      weekHeaders.push(
        `${wCode}_Team`,
        `${wCode}_iRAT_%`,
        `${wCode}_tRAT_%`,
        `${wCode}_Peer_10`,
        `${wCode}_Weighted_%`
      );
    });

    const headers = [
      'Course_Code',
      'Student_ID',
      'Full_Name',
      'Section',
      'Weeks_Attended',
      ...weekHeaders,
      'Semester_Avg_iRAT_%',
      'Semester_Avg_tRAT_%',
      'Semester_Avg_Peer_Out_Of_10',
      `TBL_Score_Out_Of_10_(10%_Course_Grade)`,
      `Affective_Jitpisai_Out_Of_10_(10%_Course_Grade_From_Attendance_&_Peer_Eval)`,
      `Total_Platform_Score_Out_Of_20_(TBL_10_+_Jitpisai_10)`,
      'Google_Colab_Lab_Out_Of_30_(30%)',
      'Midterm_Exam_Out_Of_20_(20%)',
      'Final_Project_Out_Of_30_(30%)',
      'Total_Course_Grade_Out_Of_100'
    ];

    const rows = roster.map((st) => {
      const sem = computeStudentSemesterSummary(st.id);
      const weekCols = [];
      sem.perWeek.forEach((wk) => {
        weekCols.push(
          wk.team ? `"${wk.team.name.split(':')[0]}"` : '"Absent"',
          `${wk.iratPct}%`,
          `${wk.tratPct}%`,
          wk.peerAvg10,
          `${wk.finalWeekScore}%`
        );
      });

      return [
        classInfo.courseCode,
        st.id,
        `"${st.name}"`,
        st.section || 'Sec 01',
        `${sem.attendedWeeks}/${sem.totalWeeks}`,
        ...weekCols,
        `${sem.avgIratPct}%`,
        `${sem.avgTratPct}%`,
        `${sem.avgPeer10}`,
        sem.tblScoreOutOf10,
        sem.affectiveScoreOutOf10,
        sem.combinedCourse20Pts,
        '',
        '',
        '',
        ''
      ];
    });

    const csv =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csv));
    a.setAttribute(
      'download',
      `${classInfo.courseCode}_All_${modules.length}_Weeks_Semester_Gradebook.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Dedicated 5-Item Navigation Menu Configuration
  const navItems = [
    {
      id: 'stage',
      icon: Tv,
      title: lang === 'en' ? 'Live Stage' : 'ควบคุมชั้นเรียน',
      badge: `${checkedInCount}`
    },
    {
      id: 'scores',
      icon: BarChart3,
      title: lang === 'en' ? 'Scores & CSV' : 'ตารางคะแนน',
      badge: null
    },
    {
      id: 'roster',
      icon: Users,
      title: lang === 'en' ? 'Student Roster' : 'รายชื่อนักศึกษา',
      badge: `${roster.length}`
    },
    {
      id: 'lessons',
      icon: BookOpen,
      title: lang === 'en' ? 'Lesson Builder' : 'สร้างบทเรียน & ข้อสอบ',
      badge: `${modules.length}W`
    },
    {
      id: 'settings',
      icon: Settings,
      title: lang === 'en' ? 'Course Settings' : 'ตั้งค่ารายวิชา',
      badge: null
    }
  ];

  const activeNavObj = navItems.find((n) => n.id === activeTab) || navItems[0];
  const filteredRoster = roster.filter(
    (s) =>
      !rosterSearch.trim() ||
      s.id.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* ================= UNIFIED TOP INSTRUCTOR NAVIGATION & CONTEXT BAR ================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-lg space-y-3">
        {/* Top Row: Locked Assigned Class Identity + Week Switcher + Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Locked Course Identity Badge (Each Instructor Only Sees Their Own Class) */}
            <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-extrabold text-white">
                {classInfo.courseCode}: {classInfo.courseName}
              </span>
              <span className="text-xs text-amber-300 font-semibold hidden sm:inline">
                ({classInfo.instructorName})
              </span>
            </div>

            {/* Week Switcher (Scoped strictly to this Instructor's Class) */}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-amber-400">
                {lang === 'en' ? 'Week:' : 'สัปดาห์:'}
              </span>
              <select
                value={currentModule?.id || ''}
                onChange={(e) => onSelectModuleId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[240px] sm:max-w-sm truncate"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.code} — {m.title[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}?projector=1`;
                window.open(url, 'tbl_projector_screen', 'noopener');
              }}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Open dedicated main-screen projector page in a new window"
            >
              <Tv className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Open Projector' : 'เปิดจอโปรเจคเตอร์'}
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleExportMasterCsv}
              className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Export CSV' : 'ส่งออก CSV'}
            </button>

            <button
              type="button"
              onClick={() => {
                onSetInstructorAuthed(false);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
              title="Sign out of this class to switch instructor account"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'en' ? 'Switch Instructor' : 'สลับบัญชีอาจารย์'}
            </button>

            <button
              type="button"
              onClick={() => {
                onSetInstructorAuthed(false);
                onSwitchToStudentView();
              }}
              className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Lock & Exit' : 'ล็อกระบบอาจารย์'}
            </button>
          </div>
        </div>

        {/* Bottom Row: Clean 5-Tab Horizontal Navigation Menu (Full Text, Zero Truncation) */}
        <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-kku-terracotta text-white shadow-md font-extrabold'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span className="text-xs whitespace-nowrap">{item.title}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold ${
                      isActive
                        ? 'bg-black/25 text-amber-200'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================= FULL-WIDTH MAIN WORKSPACE AREA ================= */}
      <section className="space-y-5 min-w-0">

        {/* ================= SECTION 1: LIVE MAIN STAGE ================= */}
        {activeTab === 'stage' && (
          <div className="space-y-5">
            {/* Live Classroom KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {lang === 'en' ? 'Enrolled Roster' : 'นักศึกษาในรายวิชา'}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {roster.length}{' '}
                    <span className="text-xs font-bold text-slate-500">
                      {lang === 'en' ? 'students' : 'คน'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {lang === 'en' ? 'Checked In Today' : 'เช็กอินเข้ากลุ่มวันนี้'}
                  </div>
                  <div className="text-xl font-extrabold text-kku-terracotta mt-0.5">
                    {checkedInCount}{' '}
                    <span className="text-xs font-bold text-slate-500">
                      / {teams.length} {lang === 'en' ? 'teams' : 'กลุ่ม'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-kku-light text-kku-terracotta flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {lang === 'en' ? 'Active Steps Open' : 'ขั้นตอนที่เปิดอยู่'}
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                    {unlockedSteps.length} / 4
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {lang === 'en' ? '4S Card Status' : 'สถานะป้าย 4S'}
                  </div>
                  <div className="text-sm font-extrabold text-amber-600 mt-1">
                    {simultaneousReveal
                      ? lang === 'en'
                        ? 'Revealed Live ★'
                        : 'เปิดป้ายพร้อมกันแล้ว ★'
                      : lang === 'en'
                      ? 'Hidden (Ready)'
                      : 'ซ่อนอยู่ (รอเปิดพร้อมกัน)'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  {simultaneousReveal ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Step Unlock Bar + Teacher-Paced Next Step Control */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700 mr-1">
                  {lang === 'en' ? 'Teacher Stage Control:' : 'ควบคุมขั้นตอนชั้นเรียน:'}
                </span>

                {/* One-click Advance to Next Step button */}
                {(() => {
                  const nextLockedStep = [1, 2, 3, 4].find((id) => !unlockedSteps.includes(id));
                  const nextLabels = {
                    1: lang === 'en' ? '▶ Start Step 1: iRAT' : '▶ เริ่มขั้นตอน 1: สอบเดี่ยว iRAT',
                    2: lang === 'en' ? '▶ Unlock Step 2: tRAT' : '▶ เปิดขั้นตอน 2: สอบทีม tRAT',
                    3: lang === 'en' ? '▶ Unlock Step 3: 4S Case' : '▶ เปิดขั้นตอน 3: โจทย์ 4S',
                    4: lang === 'en' ? '▶ Unlock Step 4: Peer Eval' : '▶ เปิดขั้นตอน 4: ประเมินเพื่อน'
                  };
                  return nextLockedStep ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSetUnlockedSteps((prev) =>
                          prev.includes(nextLockedStep) ? prev : [...prev, nextLockedStep]
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition"
                    >
                      {nextLabels[nextLockedStep]}
                    </button>
                  ) : null;
                })()}

                {[
                  { id: 1, label: '1. iRAT' },
                  { id: 2, label: '2. tRAT' },
                  { id: 3, label: '3. 4S Case' },
                  { id: 4, label: '4. Peer Eval' }
                ].map((st) => {
                  const isUnlocked = unlockedSteps.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        onSetUnlockedSteps((prev) =>
                          prev.includes(st.id)
                            ? prev.filter((x) => x !== st.id)
                            : [...prev, st.id]
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition ${
                        isUnlocked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {st.label}
                    </button>
                  );
                })}

                {unlockedSteps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onSetUnlockedSteps([])}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1 transition"
                    title="Lock all steps back to Step 0 Briefing"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Lock All (Briefing)' : 'ล็อกกลับหน้าวัตถุประสงค์'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Inline Quick Team Size Control */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Users className="w-3.5 h-3.5 text-kku-terracotta" />
                  <span className="font-bold text-slate-600">
                    {lang === 'en' ? 'Team Size:' : 'ขนาดกลุ่ม:'}
                  </span>
                  <select
                    value={Number(classInfo.targetTeamSize) || 5}
                    onChange={(e) => {
                      const sz = Number(e.target.value);
                      const autoTeams =
                        roster.length > 0 ? Math.max(2, Math.ceil(roster.length / sz)) : 4;
                      onUpdateClassInfo({
                        ...classInfo,
                        targetTeamSize: sz,
                        teamCount: autoTeams
                      });
                    }}
                    className="bg-white rounded-lg border border-slate-300 px-2 py-0.5 font-extrabold text-kku-terracotta focus:outline-none cursor-pointer"
                  >
                    {[3, 4, 5, 6, 7, 8, 10].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz} {lang === 'en' ? 'students/team' : 'คน/กลุ่ม'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Inline Number of Teams Control */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600">
                    {lang === 'en' ? 'Teams:' : 'จำนวนกลุ่ม:'}
                  </span>
                  <select
                    value={teams.length}
                    onChange={(e) =>
                      onUpdateClassInfo({
                        ...classInfo,
                        teamCount: Number(e.target.value)
                      })
                    }
                    className="bg-white rounded-lg border border-slate-300 px-2 py-0.5 font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((cnt) => (
                      <option key={cnt} value={cnt}>
                        {cnt} {lang === 'en' ? 'teams' : 'กลุ่ม'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => onReshuffleAllRandomTeams(currentModule.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-kku-terracotta to-kku-dark hover:from-kku-dark hover:to-slate-900 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Dices className="w-4 h-4" />
                  {lang === 'en' ? 'Randomize All Teams 🎲' : 'สุ่มกลุ่มใหม่ทั้งหมด 🎲'}
                </button>

                <button
                  type="button"
                  onClick={onToggleSimultaneousReveal}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  {simultaneousReveal ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      {lang === 'en' ? 'Hide 4S Cards' : 'ซ่อนป้าย 4S'}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      {lang === 'en' ? 'Reveal All 4S Cards!' : 'เปิดป้าย 4S พร้อมกัน!'}
                    </>
                  )}
                </button>

                {simultaneousReveal && onToggleRevealExpertAnswer && (
                  <button
                    type="button"
                    onClick={onToggleRevealExpertAnswer}
                    className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition border ${
                      revealExpertAnswer
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {revealExpertAnswer
                      ? lang === 'en'
                        ? '★ Expert Choice Shown'
                        : '★ เฉลยป้ายที่ดีที่สุดแล้ว'
                      : lang === 'en'
                      ? 'Reveal Expert Answer ★'
                      : 'เฉลยป้ายที่ดีที่สุด ★'}
                  </button>
                )}
              </div>
            </div>

            {/* QUESTIONS TO DISCUSS — MAIN SCREEN PROJECTOR REMOTE CONTROL */}
            {onUpdateProjectorState && currentModule?.questions?.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-kku-terracotta" />
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {lang === 'en'
                          ? 'Main Screen Discussion Remote (Projector Control)'
                          : 'ควบคุมหน้าจอโปรเจคเตอร์และเลือกข้อสอบอภิปราย'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'en'
                        ? 'Click any question below to push it live to the Projector Screen. Questions with <70% iRAT accuracy are flagged for discussion.'
                        : 'คลิกปุ่ม "ขึ้นจอ Q#" เพื่อส่งข้อสอบขึ้นหน้าจอโปรเจคเตอร์ทันที ข้อที่ได้คะแนน iRAT ต่ำกว่า 70% จะถูกทำเครื่องหมายแนะนำให้อภิปราย'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateProjectorState({ mode: 'teams' })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        (projectorState?.mode || 'teams') === 'teams'
                          ? 'bg-kku-terracotta border-kku-terracotta text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      {lang === 'en' ? 'Project Teams & Stars' : 'ขึ้นจอกลุ่ม & ดาวอภิปราย'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProjectorState({ showVotes: !(projectorState?.showVotes !== false) })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        projectorState?.showVotes !== false
                          ? 'bg-sky-50 border-sky-300 text-sky-800'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      {projectorState?.showVotes !== false
                        ? lang === 'en'
                          ? 'Votes Bar: ON'
                          : 'กราฟโหวต: เปิด'
                        : lang === 'en'
                        ? 'Votes Bar: OFF'
                        : 'กราฟโหวต: ซ่อน'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProjectorState({ showAnswer: !projectorState?.showAnswer })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        projectorState?.showAnswer
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      {projectorState?.showAnswer
                        ? lang === 'en'
                          ? '★ Answer Shown'
                          : '★ เปิดเฉลยอยู่'
                        : lang === 'en'
                        ? 'Reveal Answer ★'
                        : 'เปิดเฉลยบนจอ ★'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateProjectorState({ mode: 'case' })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        projectorState?.mode === 'case'
                          ? 'bg-slate-900 border-slate-900 text-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      {lang === 'en' ? 'Project 4S Case' : 'ขึ้นจอโจทย์ 4S'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}?projector=1`;
                        window.open(url, 'tbl_projector_screen', 'noopener');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Open Projector Tab' : 'เปิดแท็บโปรเจคเตอร์'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {currentModule.questions.map((q, idx) => {
                    const modIrat = iratRecordsByMod?.[currentModule.id] || {};
                    const modTrat = tratScratchesByMod?.[currentModule.id] || {};
                    const validKeys = [q.correct, ...(q.secondaryStars || [])];
                    let votes = 0;
                    let correct = 0;
                    Object.values(modIrat).forEach((rec) => {
                      const alloc = rec?.allocations?.[q.id] || {};
                      const picked = Object.keys(alloc).find((k) => alloc[k] > 0);
                      if (picked) {
                        votes += 1;
                        if (validKeys.includes(picked)) correct += 1;
                      }
                    });
                    const pct = votes > 0 ? Math.round((correct / votes) * 100) : null;
                    let tratFirstTry = 0;
                    let tratTotal = 0;
                    Object.values(modTrat).forEach((tMap) => {
                      const sc = tMap?.[q.id] || [];
                      const sIdx = sc.findIndex((k) => validKeys.includes(k));
                      if (sIdx !== -1) {
                        tratTotal += 1;
                        if (sIdx === 0) tratFirstTry += 1;
                      }
                    });
                    const needsDiscuss = pct !== null && pct < 70;
                    const isLiveOnProjector =
                      projectorState?.mode === 'rat' &&
                      (Number(projectorState?.questionIndex) || 0) === idx;

                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition ${
                          isLiveOnProjector
                            ? 'bg-kku-light/70 border-kku-terracotta ring-2 ring-kku-terracotta/20'
                            : needsDiscuss
                            ? 'bg-amber-50/70 border-amber-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-extrabold text-[11px]">
                              Q{idx + 1}
                            </span>
                            {pct !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                                  pct < 50
                                    ? 'bg-rose-100 text-rose-700'
                                    : pct < 70
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                iRAT {pct}% ({correct}/{votes})
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400">
                                iRAT: —
                              </span>
                            )}
                            {tratTotal > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-extrabold">
                                tRAT ★1st: {tratFirstTry}/{tratTotal}
                              </span>
                            )}
                            {needsDiscuss && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                                {lang === 'en' ? 'Discuss!' : 'ควรอภิปราย'}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 font-semibold line-clamp-2 leading-relaxed">
                          {q.stem?.[lang] || q.stem?.en}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateProjectorState({
                              mode: 'rat',
                              questionIndex: idx,
                              showAnswer: false
                            })
                          }
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                            isLiveOnProjector
                              ? 'bg-kku-terracotta text-white shadow-sm'
                              : 'bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-300'
                          }`}
                        >
                          <Tv className="w-3.5 h-3.5" />
                          {isLiveOnProjector
                            ? lang === 'en'
                              ? `Live on Projector (Q${idx + 1})`
                              : `กำลังแสดงบนจอ (Q${idx + 1})`
                            : lang === 'en'
                            ? `Project Q${idx + 1} on Screen`
                            : `ขึ้นจออภิปราย Q${idx + 1}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PROJECTOR-FRIENDLY 4S CHOICE DISTRIBUTION & DEBATE SUMMARY BAR (WHEN REVEALED) */}
            {simultaneousReveal && currentModule?.applicationCase?.specificChoices && (
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                      {lang === 'en'
                        ? '4S Simultaneous Report • Projector Distribution View'
                        : 'สรุปผลการชูป้าย 4S พร้อมกัน • สำหรับฉายโปรเจกเตอร์เพื่อตั้งประเด็นอภิปรายข้ามกลุ่ม'}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {currentModule.applicationCase.title[lang]}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {
                      teams.filter(
                        (tm) =>
                          teamCaseChoiceByMod?.[currentModule.id] &&
                          teamCaseChoiceByMod[currentModule.id][tm.id]
                      ).length
                    }{' '}
                    / {teams.length} {lang === 'en' ? 'Teams Locked' : 'กลุ่มที่เลือกป้ายแล้ว'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentModule.applicationCase.specificChoices.map((ch) => {
                    const letter = ch.id.replace('choice-', '');
                    const pickedTeams = teams.filter(
                      (tm) => teamCaseChoiceByMod?.[currentModule.id]?.[tm.id] === ch.id
                    );
                    const pct =
                      teams.length > 0
                        ? Math.round((pickedTeams.length / teams.length) * 100)
                        : 0;
                    const isBest =
                      revealExpertAnswer &&
                      currentModule.applicationCase.recommendedChoice === ch.id;

                    return (
                      <div
                        key={ch.id}
                        className={`p-3.5 rounded-2xl border space-y-1.5 ${
                          isBest
                            ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/30'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-extrabold">
                          <span className="text-amber-300">
                            Card {letter} {isBest ? '★ Best' : ''}
                          </span>
                          <span className="text-white">
                            {pickedTeams.length} {lang === 'en' ? 'teams' : 'กลุ่ม'} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isBest ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-300 truncate" title={ch.label[lang]}>
                          {ch.label[lang]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unified Team Cards (4 Columns on Large Screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map((tm, idx) => {
                const members = moduleCheckins[tm.id] || [];
                const leaderId = moduleReps[tm.id];
                const teamTratSummary = getTeamTratSummaryForModule
                  ? getTeamTratSummaryForModule(currentModule, tm.id)
                  : tratTotalSummary;
                const liveTrat =
                  teamTratSummary.resolvedCount > 0 ? teamTratSummary.pct : tm.mockTratScore;
                const modChoices = teamCaseChoiceByMod[currentModule.id];
                const chosenCard =
                  modChoices && typeof modChoices === 'object'
                    ? modChoices[tm.id] || null
                    : null;
                const cardLetter = chosenCard ? chosenCard.replace('choice-', '') : null;

                return (
                  <div
                    key={tm.id}
                    className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                        <div>
                          <span className="font-extrabold text-sm text-amber-300 block">
                            {lang === 'en' ? tm.name : tm.thName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {members.length} {lang === 'en' ? 'members checked in' : 'คนในกลุ่ม'}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs">
                          tRAT: {liveTrat}%
                        </span>
                      </div>

                      {members.length === 0 ? (
                        <div className="py-7 px-3 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                          {lang === 'en'
                            ? 'No students checked into this team yet.'
                            : 'ยังไม่มีนักศึกษาเช็กอินเข้ากลุ่มนี้'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {members.map((m) => {
                            const isLeader = m.id === leaderId;
                            const irat = getStudentIratScore(m.id);
                            const peer = getStudentPeerScore ? getStudentPeerScore(m.id) : null;
                            const stickerCnt =
                              Number(stickersByMod?.[currentModule.id]?.[m.id]) || 0;
                            const shortId4 = formatLast4Id
                              ? formatLast4Id(m.id)
                              : m.id.slice(-5);

                            return (
                              <div
                                key={m.id}
                                onClick={() => onSetTeamRep(currentModule.id, tm.id, m.id)}
                                className={`px-3 py-2 rounded-xl border cursor-pointer transition flex items-center justify-between gap-1.5 text-xs ${
                                  isLeader
                                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-sm'
                                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                                }`}
                                title="Click name to set as Team Leader"
                              >
                                <div className="truncate flex items-center gap-1.5 min-w-0">
                                  {isLeader && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                  <span className="font-bold truncate">{m.name}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="font-mono text-[11px] text-slate-300">
                                    {irat?.submitted ? `iRAT ${irat.pct}%` : shortId4}
                                    {peer?.avgStars !== null && peer?.avgStars !== undefined
                                      ? ` • ★${peer.avgStars}`
                                      : ''}
                                  </span>

                                  {/* Digital Discussion Sticker Button (+1 on click, right-click or minus to reduce) */}
                                  {onAdjustStudentSticker && (
                                    <div
                                      className="inline-flex items-center rounded-lg overflow-hidden border border-amber-400/40 bg-slate-950/70"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {stickerCnt > 0 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onAdjustStudentSticker(currentModule.id, m.id, -1)
                                          }
                                          className="px-1.5 py-0.5 text-[10px] font-extrabold text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                                          title="Remove 1 sticker"
                                        >
                                          -
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onAdjustStudentSticker(currentModule.id, m.id, 1)
                                        }
                                        className={`px-2 py-0.5 text-[11px] font-extrabold flex items-center gap-0.5 transition ${
                                          stickerCnt > 0
                                            ? 'bg-amber-400 text-slate-950'
                                            : 'text-amber-300 hover:bg-amber-400/20'
                                        }`}
                                        title={
                                          lang === 'en'
                                            ? 'Award +1 Discussion Sticker'
                                            : 'คลิกเพื่อให้สติกเกอร์ดาวการอภิปราย +1 ดวง'
                                        }
                                      >
                                        <span>🌟</span>
                                        <span>{stickerCnt > 0 ? stickerCnt : '+'}</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          {lang === 'en' ? '4S Case Card:' : 'ป้ายคำตอบ 4S:'}
                        </span>
                        {!simultaneousReveal ? (
                          <span
                            className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                              cardLetter
                                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <Lock className="w-3 h-3 text-amber-400" />
                            {cardLetter
                              ? lang === 'en'
                                ? 'Locked ✓ (Hidden)'
                                : 'เลือกป้ายแล้ว ✓'
                              : lang === 'en'
                              ? 'Waiting...'
                              : 'รอเลือกป้าย...'}
                          </span>
                        ) : cardLetter ? (
                          <span className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-extrabold text-sm shadow">
                            Card {cardLetter}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                            {lang === 'en' ? 'No Card Picked' : 'ยังไม่เลือกป้าย'}
                          </span>
                        )}
                      </div>

                      {/* Show Team's 1-Line Justification on Instructor Projector Once Revealed */}
                      {simultaneousReveal &&
                        teamCaseRationaleByMod?.[currentModule.id]?.[tm.id] && (
                          <div className="p-2.5 rounded-xl bg-slate-950/75 border border-white/10 text-[11px] text-slate-200 leading-relaxed">
                            <span className="text-amber-300 font-bold mr-1">
                              {lang === 'en' ? 'Why:' : 'เหตุผล:'}
                            </span>
                            “{teamCaseRationaleByMod[currentModule.id][tm.id]}”
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SECTION 2: SCORES & CSV GRADEBOOK (SINGLE WEEK + MULTI-WEEK SEMESTER SUMMARY) ================= */}
        {activeTab === 'scores' && (
          <div className="space-y-5">
            {/* Top Mode Switcher + Grading Formula Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Toggle: Single Week vs All-Weeks Semester Gradebook */}
                <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setScoresViewMode('weekly')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                      scoresViewMode === 'weekly'
                        ? 'bg-slate-900 text-amber-300 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'en'
                      ? `1. Single Week (${currentModule.code})`
                      : `1. คะแนนรายสัปดาห์ (${currentModule.code})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoresViewMode('semester')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                      scoresViewMode === 'semester'
                        ? 'bg-kku-terracotta text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'en'
                      ? `2. All Weeks Semester Summary (${modules.length} Weeks)`
                      : `2. คะแนนสะสมรวมทุกสัปดาห์ (${modules.length} สัปดาห์)`}
                  </button>
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportMasterCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    {lang === 'en'
                      ? `Export ${currentModule.code} (.CSV)`
                      : `ดาวน์โหลด ${currentModule.code} (.CSV)`}
                  </button>

                  <button
                    type="button"
                    onClick={handleExportFullSemesterCsv}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    {lang === 'en'
                      ? `Export All ${modules.length} Weeks Master Gradebook (.CSV)`
                      : `ดาวน์โหลดคะแนนรวมทุกสัปดาห์เข้า Excel (.CSV)`}
                  </button>

                  {onResetWeekScores && (
                    <button
                      type="button"
                      onClick={() => setResetWeekModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {lang === 'en'
                        ? `Reset ${currentModule.code} Scores`
                        : `รีเซ็ตคะแนน ${currentModule.code}`}
                    </button>
                  )}
                </div>
              </div>

              {weekResetToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {lang === 'en'
                    ? `Scores for ${currentModule.code} cleared! Roster, teams, and other weeks are intact.`
                    : `รีเซ็ตคะแนนของ ${currentModule.code} เรียบร้อยแล้ว! รายชื่อนักศึกษา กลุ่ม และสัปดาห์อื่นยังคงอยู่ครบถ้วน`}
                </div>
              )}

              {/* Automatic TBL Grading Weight Formula Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-slate-800">
                    {lang === 'en' ? 'Auto-Grading Formula:' : 'สูตรคำนวณคะแนน TBL อัตโนมัติ:'}
                  </span>

                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-300">
                    <span className="font-bold text-slate-600">iRAT %:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={iratWeightPct}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        setIratWeightPct(val);
                        setTratWeightPct(100 - val);
                        onUpdateClassInfo({
                          ...classInfo,
                          iratWeightPct: val,
                          tratWeightPct: 100 - val
                        });
                      }}
                      className="w-12 text-center font-mono font-extrabold text-kku-terracotta focus:outline-none"
                    />
                    <span className="text-slate-400">%</span>
                  </div>

                  <span className="font-extrabold text-slate-400">+</span>

                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-300">
                    <span className="font-bold text-slate-600">Team tRAT %:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tratWeightPct}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        setTratWeightPct(val);
                        setIratWeightPct(100 - val);
                        onUpdateClassInfo({
                          ...classInfo,
                          tratWeightPct: val,
                          iratWeightPct: 100 - val
                        });
                      }}
                      className="w-12 text-center font-mono font-extrabold text-amber-600 focus:outline-none"
                    />
                    <span className="text-slate-400">%</span>
                  </div>

                  <label className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-300 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={usePeerMultiplier}
                      onChange={(e) => {
                        setUsePeerMultiplier(e.target.checked);
                        onUpdateClassInfo({
                          ...classInfo,
                          usePeerMultiplier: e.target.checked
                        });
                      }}
                      className="accent-kku-terracotta"
                    />
                    {lang === 'en'
                      ? 'Multiply Team tRAT by Peer Score (★/10)'
                      : 'คูณคะแนนทีม tRAT ด้วยผลประเมินเพื่อน (★/10)'}
                  </label>
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  {usePeerMultiplier
                    ? `Final = (iRAT × ${iratWeightPct}%) + (tRAT × ${tratWeightPct}% × [Peer/10])`
                    : `Final = (iRAT × ${iratWeightPct}%) + (tRAT × ${tratWeightPct}%)`}
                </span>
              </div>
            </div>

            {/* SUB-VIEW A: SINGLE WEEK SCORE TABLE */}
            {scoresViewMode === 'weekly' ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {lang === 'en'
                      ? `Weekly Scores & Team Assignments — ${currentModule.code}`
                      : `ตารางคะแนนรายสัปดาห์และกลุ่มที่สุ่มได้ — ${currentModule.code}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Switch weeks in the top bar or click "2. All Weeks Semester Summary" above to view cumulative grades across the entire semester.'
                      : 'สลับสัปดาห์ได้ที่แถบด้านบน หรือคลิกปุ่ม "2. คะแนนสะสมรวมทุกสัปดาห์" เพื่อดูเกรดเฉลี่ยสะสมทั้งเทอม'}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="py-3 px-3 font-bold">Student ID</th>
                        <th className="py-3 px-3 font-bold">Full Name</th>
                        <th className="py-3 px-3 font-bold">Random Team</th>
                        <th className="py-3 px-3 font-bold">Role</th>
                        <th className="py-3 px-3 font-bold">iRAT ({iratWeightPct}%)</th>
                        <th className="py-3 px-3 font-bold">Team tRAT ({tratWeightPct}%)</th>
                        <th className="py-3 px-3 font-bold">Peer Eval (0–10)</th>
                        <th className="py-3 px-3 font-bold">
                          {lang === 'en' ? 'Stickers 🌟' : 'ดาวอภิปราย 🌟'}
                        </th>
                        <th className="py-3 px-3 font-bold bg-emerald-950 text-amber-300">
                          {lang === 'en' ? 'Week WeightedTotal' : 'คะแนนสุทธิสัปดาห์นี้'}
                        </th>
                        <th className="py-3 px-3 font-bold">Peer Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {roster.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 px-4 text-center text-slate-500">
                            <div className="max-w-md mx-auto space-y-3">
                              <div className="font-extrabold text-sm text-slate-800">
                                {lang === 'en'
                                  ? 'No Students Enrolled Yet'
                                  : 'ยังไม่มีรายชื่อนักศึกษาในระบบ'}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectTab('roster')}
                                className="px-4 py-2 rounded-xl bg-kku-terracotta text-white font-extrabold text-xs inline-flex items-center gap-1.5"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                {lang === 'en' ? 'Go to Student Roster' : 'ไปที่เมนูรายชื่อนักศึกษา'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        roster.map((st) => {
                          const wk = computeStudentWeekBreakdown(currentModule, st.id);
                          return (
                            <tr key={st.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-kku-terracotta">
                                {st.id}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {st.name}
                              </td>
                              <td className="py-2.5 px-3">
                                {wk.team ? (
                                  <span className="font-bold text-slate-800">
                                    {lang === 'en'
                                      ? wk.team.name.split(':')[0]
                                      : wk.team.thName.split(':')[0]}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {wk.isLeader ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                                    <Crown className="w-3 h-3 text-amber-600" /> Leader
                                  </span>
                                ) : wk.team ? (
                                  'Member'
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-bold">
                                {wk.irat?.submitted ? (
                                  <span className="text-emerald-700">{wk.iratPct}%</span>
                                ) : (
                                  <span className="text-slate-400">Pending</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-slate-900">
                                {wk.team ? `${wk.tratPct}%` : '-'}
                              </td>
                              <td className="py-2.5 px-3 font-bold">
                                {wk.peer?.avgStars !== null && wk.peer?.avgStars !== undefined ? (
                                  <span className="text-amber-600 font-extrabold">
                                    ★ {wk.peer.avgStars} / 10{' '}
                                    <span className="text-slate-400 font-normal">
                                      ({wk.peer.ratersCount})
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    {wk.peer?.hasSubmittedOwn
                                      ? lang === 'en'
                                        ? 'Submitted ✓'
                                        : 'ส่งผลแล้ว ✓'
                                      : 'Pending'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {onAdjustStudentSticker ? (
                                  <div className="inline-flex items-center gap-1">
                                    {wk.stickersCount > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onAdjustStudentSticker(currentModule.id, st.id, -1)
                                        }
                                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 font-extrabold text-xs"
                                      >
                                        -
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onAdjustStudentSticker(currentModule.id, st.id, 1)
                                      }
                                      className={`px-2.5 py-1 rounded-lg font-extrabold text-xs flex items-center gap-1 ${
                                        wk.stickersCount > 0
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-slate-100 hover:bg-amber-50 text-slate-500'
                                      }`}
                                    >
                                      🌟 {wk.stickersCount > 0 ? `x${wk.stickersCount}` : '+1'}
                                    </button>
                                  </div>
                                ) : (
                                  <span>{wk.stickersCount || 0}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-700 bg-emerald-50/50">
                                {wk.team || wk.irat?.submitted ? `${wk.finalWeekScore}%` : '0%'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                {wk.peer?.notes?.length > 0 ? wk.peer.notes.join(' | ') : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* SUB-VIEW B: ALL-WEEKS CUMULATIVE SEMESTER GRADEBOOK */
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {lang === 'en'
                        ? `Semester Gradebook: TBL (10%) + Affective/จิตพิสัย (10%) = 20% of Course Grade`
                        : `ตารางตัดเกรดรวมทั้งเทอม: คะแนน TBL (10 คะแนน) + จิตพิสัย (10 คะแนน) = 20% ของรายวิชา`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'Automatically converts all weekly sessions into your exact syllabus points: TBL (10 pts) + Affective/Teamwork (10 pts). Export to Excel to fill in Colab Labs (30%), Midterm (20%), and Final Project (30%).'
                        : 'ระบบแปลงคะแนนรายสัปดาห์ทั้งหมดให้เป็นคะแนนดิบตามโครงสร้างวิชาอัตโนมัติ: TBL (เต็ม 10) + จิตพิสัยจากการเข้าเรียนและประเมินเพื่อน (เต็ม 10) พร้อมคอลัมน์ว่างใน CSV สำหรับกรอก Lab Colab (30), Midterm (20) และ Final Project (30)'}
                    </p>
                  </div>
                </div>

                {/* Syllabus 100% Breakdown Visual Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="text-[10px] font-extrabold uppercase text-amber-700">
                      {lang === 'en' ? 'Auto from Platform' : 'คำนวณอัตโนมัติจากเว็บ'}
                    </div>
                    <div className="font-extrabold text-slate-900 mt-0.5">
                      1. จิตพิสัย (10%)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {lang === 'en'
                        ? 'Attendance (5) + Peer ★ (5)'
                        : 'เช็กอินเข้ากลุ่ม (5) + ประเมินเพื่อน (5)'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-kku-light border border-kku-terracotta/30">
                    <div className="text-[10px] font-extrabold uppercase text-kku-terracotta">
                      {lang === 'en' ? 'Auto from Platform' : 'คำนวณอัตโนมัติจากเว็บ'}
                    </div>
                    <div className="font-extrabold text-slate-900 mt-0.5">
                      2. กิจกรรม TBL (10%)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      iRAT ({iratWeightPct}%) + Team tRAT ({tratWeightPct}%)
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 opacity-80">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">
                      {lang === 'en' ? 'In Exported CSV' : 'กรอกในไฟล์ Excel ที่ส่งออก'}
                    </div>
                    <div className="font-extrabold text-slate-800 mt-0.5">
                      3. Lab Google Colab (30%)
                    </div>
                    <div className="text-[11px] text-slate-500">30 คะแนน</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 opacity-80">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">
                      {lang === 'en' ? 'In Exported CSV' : 'กรอกในไฟล์ Excel ที่ส่งออก'}
                    </div>
                    <div className="font-extrabold text-slate-800 mt-0.5">
                      4. Midterm (20%)
                    </div>
                    <div className="text-[11px] text-slate-500">20 คะแนน</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 opacity-80">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">
                      {lang === 'en' ? 'In Exported CSV' : 'กรอกในไฟล์ Excel ที่ส่งออก'}
                    </div>
                    <div className="font-extrabold text-slate-800 mt-0.5">
                      5. Final Project (30%)
                    </div>
                    <div className="text-[11px] text-slate-500">30 คะแนน</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="py-3 px-3 font-bold">Student ID</th>
                        <th className="py-3 px-3 font-bold">Full Name</th>
                        <th className="py-3 px-3 font-bold">
                          {lang === 'en' ? 'Attended' : 'เข้าเรียน'}
                        </th>
                        {modules.map((m) => (
                          <th
                            key={m.id}
                            className="py-3 px-3 font-bold text-slate-300 whitespace-nowrap"
                          >
                            {m.code} (%)
                          </th>
                        ))}
                        <th className="py-3 px-3 font-bold">Avg Peer (★)</th>
                        <th className="py-3 px-3 font-bold">
                          {lang === 'en' ? 'Total Stickers 🌟' : 'รวมดาวอภิปราย 🌟'}
                        </th>
                        <th className="py-3 px-3 font-bold bg-amber-950 text-amber-300">
                          {lang === 'en' ? 'จิตพิสัย (10 pts)' : 'จิตพิสัย (เต็ม 10)'}
                        </th>
                        <th className="py-3 px-3 font-bold bg-kku-dark text-white">
                          {lang === 'en' ? 'TBL (10 pts)' : 'คะแนน TBL (เต็ม 10)'}
                        </th>
                        <th className="py-3 px-3 font-bold bg-emerald-950 text-emerald-300">
                          {lang === 'en' ? 'Total (20 pts)' : 'รวม 2 ส่วน (เต็ม 20)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {roster.map((st) => {
                        const sem = computeStudentSemesterSummary(st.id);
                        return (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-kku-terracotta">
                              {st.id}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {st.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                              {sem.attendedWeeks}/{sem.totalWeeks}
                            </td>
                            {sem.perWeek.map((wk) => (
                              <td
                                key={wk.moduleId}
                                className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap"
                                title={`iRAT: ${wk.iratPct}% | tRAT: ${wk.tratPct}% | Peer: ★${wk.peerAvg10}/10`}
                              >
                                {wk.checkedIn || wk.irat?.submitted ? (
                                  <span>{wk.finalWeekScore}%</span>
                                ) : (
                                  <span className="text-slate-300">0%</span>
                                )}
                              </td>
                            ))}
                            <td className="py-2.5 px-3 font-bold text-amber-600">
                              ★ {sem.avgPeer10} / 10
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-amber-700">
                              {sem.totalStickers > 0 ? `🌟 x${sem.totalStickers}` : '-'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-extrabold text-amber-800 bg-amber-50/70">
                              {sem.affectiveScoreOutOf10} / 10
                            </td>
                            <td className="py-2.5 px-3 font-mono font-extrabold text-kku-terracotta bg-rose-50/50">
                              {sem.tblScoreOutOf10} / 10
                            </td>
                            <td className="py-2.5 px-3 font-mono font-extrabold text-sm text-emerald-800 bg-emerald-50/80">
                              {sem.combinedCourse20Pts} / 20
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 3: STUDENT ROSTER MANAGEMENT ================= */}
        {activeTab === 'roster' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Bulk Excel / CSV Import Card */}
              <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {lang === 'en'
                        ? 'Bulk Import from Excel / CSV'
                        : 'นำเข้ารายชื่อนักศึกษาจาก Excel หรือไฟล์ CSV'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'Format: Student_ID, Full_Name, Section (one student per line)'
                        : 'รูปแบบ: รหัสนักศึกษา, ชื่อ-นามสกุล, เซกชัน (บรรทัดละ 1 คน)'}
                    </p>
                  </div>
                  {importMsg && (
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                      {importMsg}
                    </span>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`663020201-8, Somchai Rakrian, Sec 01\n663020202-6, Suda Jaidee, Sec 01`}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-kku-terracotta"
                />

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleBulkPasteImport}
                    className="px-4 py-2.5 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'en' ? 'Import Pasted Rows' : 'นำเข้าข้อมูลที่วาง'}
                  </button>

                  <label className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4" />
                    {lang === 'en' ? 'Upload .CSV File' : 'อัปโหลดไฟล์ .CSV'}
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCsvUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Quick Single Student Add Card */}
              <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3.5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {lang === 'en' ? 'Add Individual Student' : 'เพิ่มรายชื่อนักศึกษารายบุคคล'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Quickly enroll a single student into the roster.'
                      : 'เพิ่มนักศึกษาเข้าสู่รายวิชาทีละคน'}
                  </p>
                </div>

                <form onSubmit={handleAddSingleStudent} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'en' ? 'Student ID' : 'รหัสนักศึกษา'}
                    </label>
                    <input
                      type="text"
                      value={singleStudentId}
                      onChange={(e) => setSingleStudentId(e.target.value)}
                      placeholder="e.g., 663020201-8"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {lang === 'en' ? 'Full Name' : 'ชื่อ - นามสกุล'}
                      </label>
                      <input
                        type="text"
                        value={singleStudentName}
                        onChange={(e) => setSingleStudentName(e.target.value)}
                        placeholder="Somchai Rakrian"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {lang === 'en' ? 'Section' : 'เซกชัน'}
                      </label>
                      <input
                        type="text"
                        value={singleStudentSec}
                        onChange={(e) => setSingleStudentSec(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    {lang === 'en' ? 'Add Student to Roster' : 'เพิ่มรายชื่อนักศึกษา'}
                  </button>
                </form>
              </div>
            </div>

            {/* Enrolled Students Directory Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {lang === 'en'
                    ? `Enrolled Students (${roster.length})`
                    : `รายชื่อนักศึกษาในระบบ (${roster.length} คน)`}
                </h3>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder={
                      lang === 'en' ? 'Search ID or name...' : 'ค้นหารหัส หรือ ชื่อนักศึกษา...'
                    }
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">#</th>
                      <th className="py-2.5 px-3 font-bold">Student ID</th>
                      <th className="py-2.5 px-3 font-bold">Full Name</th>
                      <th className="py-2.5 px-3 font-bold">Section</th>
                      <th className="py-2.5 px-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          {lang === 'en'
                            ? 'No students match or roster is currently empty.'
                            : 'ยังไม่มีรายชื่อนักศึกษาในระบบ'}
                        </td>
                      </tr>
                    ) : (
                      filteredRoster.map((st, i) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 font-mono">{i + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-kku-terracotta">
                            {st.id}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-2 px-3 text-slate-600">{st.section || 'Sec 01'}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveSingleStudent(st.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="Remove student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 4: WEEKLY LESSON & QUESTION STUDIO ================= */}
        {activeTab === 'lessons' && (
          <LessonBuilder
            lang={lang}
            modules={modules}
            selectedModuleId={currentModule.id}
            onSelectModule={onSelectModuleId}
            onSaveModule={onSaveModule}
            onAddNewWeek={onAddNewWeek}
            onDuplicateWeek={onDuplicateWeek}
            onDeleteWeek={onDeleteWeek}
            onImportModules={onImportModules}
          />
        )}

        {/* ================= SECTION 5: COURSE SETTINGS, PIN & DANGER ZONE ================= */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Course Profile Card (Scoped to this Instructor's Assigned Class) */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {lang === 'en' ? 'My Assigned Course Settings' : 'ตั้งค่ารายวิชาของฉัน'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Configure your course details and team size. (To add or assign other instructors/classes, use the System Admin Portal).'
                      : 'แก้ไขข้อมูลรายวิชาและขนาดกลุ่มของคุณ (การเพิ่มรายวิชาหรืออาจารย์ท่านอื่นต้องทำผ่านเมนูผู้ดูแลระบบ Admin)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={classInfo.courseCode}
                    onChange={(e) =>
                      onUpdateClassInfo({ ...classInfo, courseCode: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={classInfo.semester}
                    onChange={(e) =>
                      onUpdateClassInfo({ ...classInfo, semester: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={classInfo.courseName}
                  onChange={(e) =>
                    onUpdateClassInfo({ ...classInfo, courseName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Instructor / Teacher Name
                </label>
                <input
                  type="text"
                  value={classInfo.instructorName || ''}
                  onChange={(e) =>
                    onUpdateClassInfo({ ...classInfo, instructorName: e.target.value })
                  }
                  placeholder="e.g. Dr. Nathan"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>

              {/* Team Size & Number of Teams Configuration */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en'
                      ? 'Target Team Size (Students per Team)'
                      : 'ขนาดกลุ่มที่ต้องการ (จำนวนคนต่อกลุ่ม)'}
                  </label>
                  <select
                    value={Number(classInfo.targetTeamSize) || 5}
                    onChange={(e) => {
                      const sz = Number(e.target.value);
                      const autoTeams =
                        roster.length > 0 ? Math.max(2, Math.ceil(roster.length / sz)) : 4;
                      onUpdateClassInfo({
                        ...classInfo,
                        targetTeamSize: sz,
                        teamCount: autoTeams
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold text-kku-terracotta bg-slate-50"
                  >
                    {[3, 4, 5, 6, 7, 8, 10].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz} {lang === 'en' ? 'students per team (TBL Standard: 5–7)' : 'คนต่อกลุ่ม'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Total Number of Teams' : 'จำนวนกลุ่มทั้งหมดในห้อง'}
                  </label>
                  <select
                    value={teams.length}
                    onChange={(e) =>
                      onUpdateClassInfo({
                        ...classInfo,
                        teamCount: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold text-slate-900 bg-slate-50"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((cnt) => (
                      <option key={cnt} value={cnt}>
                        {cnt} {lang === 'en' ? 'teams' : 'กลุ่ม'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Security PIN & Danger Reset Column */}
            <div className="md:col-span-5 space-y-5">
              {/* Instructor PIN Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-kku-terracotta" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {lang === 'en' ? 'Instructor Security PIN' : 'เปลี่ยนรหัสผ่านอาจารย์ (PIN)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? `Current active PIN for ${classInfo.courseCode}: ${activeClassPin}`
                    : `รหัสผ่านอาจารย์ประจำวิชา ${classInfo.courseCode} ปัจจุบันคือ: ${activeClassPin}`}
                </p>

                <form onSubmit={handleUpdatePin} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder={lang === 'en' ? 'New 4+ digit PIN' : 'ระบุรหัสใหม่ (4 ตัวขึ้นไป)'}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs"
                  >
                    {lang === 'en' ? 'Save PIN' : 'บันทึกรหัส'}
                  </button>
                </form>
                {pinChangedMsg && (
                  <div className="text-xs font-bold text-emerald-600">
                    ✓ Instructor PIN updated!
                  </div>
                )}
              </div>

              {/* Reset Current Week Scores Only (Safe for pre-class testing) */}
              {onResetWeekScores && (
                <div className="bg-amber-50/80 rounded-3xl p-6 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900">
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <h3 className="text-sm font-extrabold">
                      {lang === 'en'
                        ? `Reset ${currentModule.code} Scores Only`
                        : `รีเซ็ตคะแนนเฉพาะ ${currentModule.code}`}
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {lang === 'en'
                      ? `Clear iRAT, tRAT, 4S Case, Peer Eval, and Bonus Stickers for ${currentModule.code} only. Keeps enrolled students, teams, lesson questions, and all other weeks intact.`
                      : `ล้างคะแนน iRAT, tRAT, โจทย์ 4S, ประเมินเพื่อน และสติกเกอร์เฉพาะ ${currentModule.code} เท่านั้น (เก็บรายชื่อนักศึกษา กลุ่ม ข้อสอบ และสัปดาห์อื่นไว้ครบถ้วน เหมาะสำหรับล้างผลหลังทดสอบก่อนสอนจริง)`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setResetWeekModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {lang === 'en'
                      ? `Reset ${currentModule.code} Scores...`
                      : `รีเซ็ตคะแนนเฉพาะ ${currentModule.code}...`}
                  </button>
                </div>
              )}

              {/* Danger Zone: Clear All Data */}
              {onClearAllSessionData && (
                <div className="bg-rose-50/70 rounded-3xl p-6 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h3 className="text-sm font-extrabold">
                      {lang === 'en' ? 'Reset Session & Roster Data' : 'ล้างข้อมูลนักศึกษาและคะแนนทั้งหมด'}
                    </h3>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {lang === 'en'
                      ? 'Clear all enrolled students, team assignments, iRAT/tRAT scores, and peer evaluations to start a brand-new semester or clean session.'
                      : 'ลบรายชื่อนักศึกษา กลุ่มที่สุ่ม และคะแนนทั้งหมดเพื่อเริ่มต้นภาคการศึกษาใหม่ (มีระบบยืนยัน 3 ขั้นตอนก่อนลบ)'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setClearConfirmWord('');
                      setClearPinConfirm('');
                      setClearError('');
                      setClearModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    {lang === 'en'
                      ? 'Clear All Students & Scores...'
                      : 'ล้างข้อมูลนักศึกษาและคะแนนทั้งหมด...'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================= PER-WEEK SCORE RESET CONFIRMATION MODAL ================= */}
      {resetWeekModalOpen && onResetWeekScores && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border-2 border-amber-200 shadow-2xl overflow-hidden">
            <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-5 h-5 shrink-0" />
                <h3 className="font-extrabold text-base">
                  {lang === 'en'
                    ? `Reset Scores for ${currentModule.code}?`
                    : `ยืนยันรีเซ็ตคะแนนของ ${currentModule.code}?`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetWeekModalOpen(false)}
                className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950">
                {currentModule.code}: {currentModule.title[lang]}
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                {lang === 'en'
                  ? 'This will clear iRAT answers, tRAT scratches, 4S team case cards & rationales, Peer Evaluations, and Bonus Stickers for this week ONLY. Your student roster, team assignments, lesson questions, and all other weeks will remain untouched.'
                  : 'ระบบจะล้างคำตอบ iRAT, บัตรขูด tRAT, ป้ายคำตอบ/เหตุผล 4S, ผลประเมินเพื่อน และสติกเกอร์เฉพาะสัปดาห์นี้เท่านั้น รายชื่อนักศึกษา กลุ่ม ข้อสอบ และคะแนนของสัปดาห์อื่นจะไม่ถูกลบ'}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResetWeekModalOpen(false)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetWeekScores(currentModule.id);
                    setResetWeekModalOpen(false);
                    setWeekResetToast(true);
                    setTimeout(() => setWeekResetToast(false), 4000);
                  }}
                  className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {lang === 'en' ? `Reset ${currentModule.code}` : `ยืนยันรีเซ็ต ${currentModule.code}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STRICT CLEAR-ALL SAFETY CONFIRMATION MODAL ================= */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border-2 border-rose-200 shadow-2xl overflow-hidden">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-amber-200 shrink-0" />
                <h3 className="font-extrabold text-base">
                  {lang === 'en'
                    ? 'Permanent Data Deletion Warning'
                    : 'คำเตือน: ยืนยันการล้างข้อมูลทั้งหมดอย่างถาวร'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <p className="leading-relaxed font-medium">
                {lang === 'en'
                  ? 'This action will permanently erase all enrolled students, random team assignments, individual iRAT scores, Team tRAT scores, and Peer Evaluations. We strongly recommend downloading a backup CSV first.'
                  : 'การดำเนินการนี้จะลบรายชื่อนักศึกษา กลุ่มที่สุ่ม คะแนนสอบ iRAT/tRAT และผลประเมินเพื่อนทั้งหมดอย่างถาวร แนะนำให้กดดาวน์โหลดไฟล์ CSV สำรองไว้ก่อน'}
              </p>

              <button
                type="button"
                onClick={handleExportMasterCsv}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'en'
                  ? '1. Download Backup Gradebook (.CSV) First'
                  : '1. ดาวน์โหลดไฟล์คะแนนสำรอง (.CSV) เก็บไว้ก่อน'}
              </button>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    {lang === 'en'
                      ? '2. Type DELETE (in capital letters) to confirm:'
                      : '2. พิมพ์คำว่า DELETE (ตัวพิมพ์ใหญ่) เพื่อยืนยัน:'}
                  </label>
                  <input
                    type="text"
                    value={clearConfirmWord}
                    onChange={(e) => {
                      setClearConfirmWord(e.target.value);
                      setClearError('');
                    }}
                    placeholder="Type DELETE"
                    className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-sm font-mono font-extrabold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    {lang === 'en'
                      ? '3. Enter Instructor Security PIN:'
                      : '3. กรอกรหัสผ่านอาจารย์ (Instructor PIN):'}
                  </label>
                  <input
                    type="password"
                    value={clearPinConfirm}
                    onChange={(e) => {
                      setClearPinConfirm(e.target.value);
                      setClearError('');
                    }}
                    placeholder="Enter Instructor PIN"
                    className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-sm font-mono font-extrabold focus:outline-none focus:border-rose-500"
                  />
                </div>

                {clearError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                    {clearError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setClearModalOpen(false)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  {lang === 'en' ? 'Cancel (Keep Data)' : 'ยกเลิก (เก็บข้อมูลไว้)'}
                </button>
                <button
                  type="button"
                  disabled={clearConfirmWord.trim() !== 'DELETE' || !clearPinConfirm.trim()}
                  onClick={() => {
                    if (clearConfirmWord.trim() !== 'DELETE') {
                      setClearError(
                        lang === 'en'
                          ? 'Please type DELETE in capital letters.'
                          : 'กรุณาพิมพ์คำว่า DELETE ให้ถูกต้อง'
                      );
                      return;
                    }
                    if (clearPinConfirm.trim() !== activeClassPin) {
                      setClearError(
                        lang === 'en'
                          ? 'Incorrect Instructor PIN.'
                          : 'รหัสผ่านอาจารย์ไม่ถูกต้อง'
                      );
                      return;
                    }
                    onClearAllSessionData();
                    setClearModalOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-35 text-white font-extrabold text-xs shadow"
                >
                  {lang === 'en' ? 'Permanently Erase All' : 'ยืนยันลบข้อมูลทั้งหมด'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
