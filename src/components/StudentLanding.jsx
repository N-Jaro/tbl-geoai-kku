import React, { useState, useMemo } from 'react';
import {
  Dices,
  Crown,
  CheckCircle2,
  ArrowRight,
  Globe,
  Sparkles,
  Users,
  BookOpen,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Tv
} from 'lucide-react';

export default function StudentLanding({
  lang,
  onToggleLang,
  classes,
  selectedClassId,
  onSelectClassId,
  classInfo,
  currentModule,
  classModules,
  selectedModuleId,
  onSelectModuleId,
  teams,
  roster,
  onUpdateRoster,
  weeklyCheckins,
  teamRepByMod,
  onRandomAssignStudent, // (moduleId, studentObj) => { assignedTeamId, isLeader }
  onEnterClassroom, // (studentObj, teamId)
  onOpenInstructorPortal,
  onOpenAdminPortal
}) {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [drawnResult, setDrawnResult] = useState(null); // { student, teamId, isLeader }

  // Match student ID against imported class roster
  const matchedStudent = useMemo(() => {
    const clean = studentIdInput.trim().toLowerCase();
    if (!clean) return null;
    return roster.find(
      (s) =>
        s.id.toLowerCase() === clean ||
        s.id.replace('-', '').toLowerCase() === clean.replace('-', '')
    );
  }, [studentIdInput, roster]);

  // Check if student already checked into a random team this week
  const existingTeamForStudent = useMemo(() => {
    const clean = studentIdInput.trim().toLowerCase();
    if (!clean || !currentModule) return null;
    const modTeams = weeklyCheckins[currentModule.id] || {};
    for (const tm of teams) {
      const list = modTeams[tm.id] || [];
      const found = list.find(
        (m) =>
          m.id.toLowerCase() === clean ||
          m.id.replace('-', '').toLowerCase() === clean.replace('-', '')
      );
      if (found) return { team: tm, member: found };
    }
    return null;
  }, [studentIdInput, weeklyCheckins, currentModule, teams]);

  const handleDrawTeam = (e) => {
    e.preventDefault();
    const trimmedId = studentIdInput.trim();
    if (!trimmedId || !currentModule) return;

    const studentObj = matchedStudent || {
      id: trimmedId,
      name:
        manualNameInput.trim() ||
        (lang === 'en' ? `Student ${trimmedId}` : `นักศึกษา ${trimmedId}`),
      section: 'Sec 01'
    };

    if (!matchedStudent && manualNameInput.trim()) {
      onUpdateRoster([...roster, studentObj]);
    }

    const { assignedTeamId, isLeader } = onRandomAssignStudent(
      currentModule.id,
      studentObj
    );
    setDrawnResult({
      student: studentObj,
      teamId: assignedTeamId,
      isLeader
    });
  };

  const assignedTeamObj = drawnResult
    ? teams.find((t) => t.id === drawnResult.teamId) || teams[0]
    : null;
  const assignedTeamMembers =
    drawnResult && currentModule
      ? weeklyCheckins[currentModule.id]?.[drawnResult.teamId] || []
      : [];
  const assignedTeamLeaderId =
    drawnResult && currentModule
      ? teamRepByMod[currentModule.id]?.[drawnResult.teamId]
      : null;

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern text-white flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-kku-terracotta/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl" />

      {/* Top Platform Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kku-terracotta to-amber-600 flex items-center justify-center font-extrabold text-sm shadow-lg shadow-kku-terracotta/30 border border-white/20">
              TBL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  {lang === 'en' ? 'TBL Classroom Studio' : 'ระบบห้องเรียน TBL Studio'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Interactive Classroom' : 'ห้องเรียนเชิงรุก'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenInstructorPortal}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'en' ? 'Instructor' : 'สำหรับอาจารย์'}</span>
            </button>

            {onOpenAdminPortal && (
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-xs font-bold text-indigo-200 flex items-center gap-1.5 transition"
                title="System Admin Portal"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'en' ? 'Admin' : 'ผู้ดูแลระบบ'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleLang}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              {lang === 'en' ? 'ไทย / EN' : 'EN / ไทย'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Hero & Check-In Portal */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Course Context & 4-Step TBL Visual Roadmap */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{classInfo.semester}</span>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              {classInfo.courseCode} • {classInfo.instructorName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 leading-tight">
              {classInfo.courseName}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {currentModule?.code} — {currentModule?.title[lang]}
            </p>
          </div>

          {/* 4-Step In-Class TBL Roadmap Pills */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? "Today's 4-Step TBL Flow" : 'ขั้นตอนการเรียนรู้ในคาบเรียนวันนี้'}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  step: '01',
                  title: lang === 'en' ? 'Individual iRAT' : '1. สอบเดี่ยว (iRAT)',
                  desc: lang === 'en' ? 'Personal readiness quiz' : 'วัดความเข้าใจรายบุคคล'
                },
                {
                  step: '02',
                  title: lang === 'en' ? 'Team tRAT Scratch' : '2. สอบทีม (tRAT)',
                  desc: lang === 'en' ? 'Leader scratches IF-AT card' : 'หัวหน้าทีมขูดบัตรคำตอบ'
                },
                {
                  step: '03',
                  title: lang === 'en' ? '4S Case Card' : '3. โจทย์ประยุกต์ 4S',
                  desc: lang === 'en' ? 'Raise A/B/C/D placards' : 'ชูป้ายตัดสินใจพร้อมกัน'
                },
                {
                  step: '04',
                  title: lang === 'en' ? '0–10 Peer Rating' : '4. ประเมินเพื่อน (0–10)',
                  desc: lang === 'en' ? 'Confidential team rating' : 'ให้คะแนนเพื่อนในกลุ่ม'
                }
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="text-xs font-mono font-extrabold text-amber-400">
                    STEP {item.step}
                  </div>
                  <div className="font-extrabold text-sm text-white mt-0.5">{item.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Elevated White Check-In & Random Team Draw Card */}
        <div className="lg:col-span-7">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
            {/* Course & Lesson Selector Header inside Card */}
            <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                  {lang === 'en' ? 'Course / Class' : 'รายวิชาที่เรียน'}
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    onSelectClassId(e.target.value);
                    setDrawnResult(null);
                  }}
                  className="w-full rounded-xl bg-slate-800 text-white border border-slate-700 px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.courseCode}: {cls.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                  {lang === 'en' ? 'Weekly Session' : 'บทเรียนประจำสัปดาห์'}
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    onSelectModuleId(e.target.value);
                    setDrawnResult(null);
                  }}
                  className="w-full rounded-xl bg-slate-800 text-amber-200 border border-slate-700 px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  {classModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code}: {m.title[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {!drawnResult ? (
                /* STEP 0A: ENTER STUDENT ID ONLY */
                <div className="space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kku-light text-kku-terracotta font-extrabold text-xs">
                      <Dices className="w-4 h-4" />
                      {lang === 'en' ? 'Automatic Random Team Assignment' : 'ระบบสุ่มกลุ่มอัตโนมัติ'}
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                      {lang === 'en'
                        ? 'Student Check-In'
                        : 'ลงชื่อเข้าเรียนด้วยรหัสนักศึกษา'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'en'
                        ? 'Enter your Student ID below to draw your random team and begin today’s TBL activity.'
                        : 'กรอกรหัสนักศึกษาด้านล่างเพื่อสุ่มกลุ่มและเริ่มทำกิจกรรม TBL ประจำวันนี้'}
                    </p>
                  </div>

                  <form onSubmit={handleDrawTeam} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                        {lang === 'en' ? 'Your Student ID' : 'รหัสนักศึกษา (Student ID)'}
                      </label>
                      <input
                        type="text"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                        placeholder="e.g., 653020101-2"
                        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3.5 text-lg font-mono font-extrabold bg-slate-50 focus:bg-white focus:outline-none focus:border-kku-terracotta focus:ring-4 focus:ring-kku-terracotta/10 transition"
                        required
                      />
                    </div>

                    {/* Live Roster Verification */}
                    {studentIdInput.trim() && (
                      <div
                        className={`p-4 rounded-2xl border text-xs transition ${
                          matchedStudent
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50/80 border-amber-300 text-amber-950'
                        }`}
                      >
                        {matchedStudent ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div>
                                <div className="text-[10px] font-bold uppercase text-emerald-700">
                                  {lang === 'en' ? 'Verified Student' : 'พบชื่อในรายวิชา'} ({matchedStudent.section})
                                </div>
                                <div className="font-extrabold text-base">{matchedStudent.name}</div>
                              </div>
                            </div>
                            {existingTeamForStudent && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">
                                {lang === 'en'
                                  ? `Already in ${existingTeamForStudent.team.name.split(':')[0]}`
                                  : `อยู่ ${existingTeamForStudent.team.thName.split(':')[0]}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="font-bold text-amber-900">
                              {lang === 'en'
                                ? 'Enter your Full Name to register and join:'
                                : 'กรุณากรอกชื่อ-นามสกุลของคุณเพื่อเข้าเรียน:'}
                            </div>
                            <input
                              type="text"
                              value={manualNameInput}
                              onChange={(e) => setManualNameInput(e.target.value)}
                              placeholder={
                                lang === 'en'
                                  ? 'Full Name (e.g. Somchai Jaidee)'
                                  : 'ชื่อ - นามสกุล'
                              }
                              className="w-full rounded-xl border border-amber-300 px-3.5 py-2.5 text-sm bg-white font-semibold focus:outline-none focus:border-kku-terracotta"
                              required
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!studentIdInput.trim()}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-kku-terracotta to-amber-700 hover:from-kku-dark hover:to-kku-terracotta disabled:opacity-40 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-kku-terracotta/25 transition"
                    >
                      <Dices className="w-5 h-5" />
                      {existingTeamForStudent
                        ? lang === 'en'
                          ? 'Resume With My Assigned Team →'
                          : 'เข้าสู่กลุ่มที่สุ่มไว้แล้ว →'
                        : lang === 'en'
                        ? 'Check In & Draw My Random Team 🎲'
                        : 'ลงชื่อเข้าเรียนและสุ่มกลุ่มประจำสัปดาห์ 🎲'}
                    </button>
                  </form>
                </div>
              ) : (
                /* STEP 0B: RANDOM TEAM REVEAL CARD */
                <div className="text-center space-y-5 py-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4" />
                    {lang === 'en' ? 'Random Team Assigned!' : 'สุ่มกลุ่มสำเร็จแล้ว!'}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500">
                      {drawnResult.student.name} ({drawnResult.student.id})
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-kku-terracotta mt-1">
                      {lang === 'en' ? assignedTeamObj.name : assignedTeamObj.thName}
                    </div>
                  </div>

                  {/* Role Badge: Team Leader vs Team Member */}
                  <div
                    className={`p-4 rounded-2xl border text-left ${
                      drawnResult.student.id === assignedTeamLeaderId
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-extrabold text-sm">
                      <Crown
                        className={`w-5 h-5 ${
                          drawnResult.student.id === assignedTeamLeaderId
                            ? 'text-amber-500'
                            : 'text-slate-400'
                        }`}
                      />
                      {drawnResult.student.id === assignedTeamLeaderId
                        ? lang === 'en'
                          ? 'You are the Team Leader (tRAT Submitter) today!'
                          : 'คุณได้รับบทบาทเป็น หัวหน้ากลุ่ม (ผู้กดส่งคำตอบ tRAT) ในวันนี้!'
                        : lang === 'en'
                        ? 'You are a Team Member today'
                        : 'คุณเป็นสมาชิกร่วมอภิปรายในกลุ่ม'}
                    </div>
                    <p className="text-xs mt-1 opacity-85">
                      {drawnResult.student.id === assignedTeamLeaderId
                        ? lang === 'en'
                          ? 'In Step 1 you take your own iRAT. In Step 2 (tRAT), YOU will click the scratch card answers for your team.'
                          : 'ในขั้นตอนที่ 1 คุณทำข้อสอบเดี่ยว iRAT ของตนเอง และในขั้นตอนที่ 2 (tRAT) คุณจะเป็นผู้คลิกขูดบัตรคำตอบให้กลุ่ม'
                        : lang === 'en'
                        ? 'In Step 1 you take your own iRAT. In Step 2 (tRAT), discuss together while your Team Leader clicks the answers.'
                        : 'ในขั้นตอนที่ 1 คุณทำข้อสอบเดี่ยว iRAT ของตนเอง และในขั้นตอนที่ 2 (tRAT) ร่วมอภิปรายเพื่อให้หัวหน้ากลุ่มกดคำตอบ'}
                    </p>
                  </div>

                  {/* Teammates in this Random Group */}
                  <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="text-xs font-extrabold text-slate-600 mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-kku-terracotta" />
                      {lang === 'en'
                        ? `Your Random Teammates Today (${assignedTeamMembers.length}):`
                        : `เพื่อนร่วมกลุ่มจากการสุ่มในวันนี้ (${assignedTeamMembers.length} คน):`}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedTeamMembers.map((m) => (
                        <span
                          key={m.id}
                          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                            m.id === drawnResult.student.id
                              ? 'bg-kku-terracotta text-white border-kku-terracotta shadow-sm'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}
                        >
                          {m.id === assignedTeamLeaderId && (
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          {m.name} ({m.id})
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onEnterClassroom(drawnResult.student, drawnResult.teamId)
                    }
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <span>
                      {lang === 'en'
                        ? 'Start Step 1: Individual Quiz (iRAT)'
                        : 'เริ่มขั้นตอนที่ 1: ทำข้อสอบเดี่ยว (iRAT)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/60 py-4 px-6">
        <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            © 2026 {classInfo?.courseName || 'Team-Based Learning Platform'}. A{' '}
            <span className="font-bold text-amber-300">nattapon.io</span> project.
          </span>
          <span>iRAT • IF-AT Scratch tRAT • 4S Simultaneous Case • 0–10 Peer Rating</span>
        </div>
      </footer>
    </div>
  );
}
