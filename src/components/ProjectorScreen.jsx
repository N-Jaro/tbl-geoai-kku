import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BarChart3,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Star,
  Map as MapIcon,
  Lock,
  Sparkles,
  Users,
  HelpCircle,
  MapPin,
  Crown
} from 'lucide-react';
import GeoAIMap from './GeoAIMap';

export default function ProjectorScreen({
  lang,
  onToggleLang,
  classInfo,
  currentModule,
  teams,
  weeklyCheckins = {},
  teamRepByMod = {},
  stickersByMod = {},
  iratRecordsByMod,
  tratScratchesByMod,
  teamCaseChoiceByMod,
  teamCaseRationaleByMod,
  simultaneousReveal,
  revealExpertAnswer,
  projectorState,
  onUpdateProjectorState,
  serverSyncStatus
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState(
    () => currentModule?.applicationCase?.spatialZones?.[0]?.id || 'zone-1'
  );

  // Built-in Classroom Discussion Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    const zones = currentModule?.applicationCase?.spatialZones || [];
    if (zones.length === 0) return;
    setActiveZoneId((prev) => (zones.some((z) => z.id === prev) ? prev : zones[0].id));
  }, [currentModule?.id, currentModule?.applicationCase?.spatialZones]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const questions = currentModule?.questions || [];
  const safeQIdx = Math.min(
    Math.max(0, Number(projectorState?.questionIndex) || 0),
    Math.max(0, questions.length - 1)
  );
  const currentQ = questions[safeQIdx];
  const mode =
    projectorState?.mode === 'rat'
      ? 'rat'
      : projectorState?.mode === 'case'
      ? 'case'
      : 'teams';
  const showAnswer = !!projectorState?.showAnswer;
  const showVotes = projectorState?.showVotes !== false;
  const showMap = !!projectorState?.showMap;

  const moduleCheckins = weeklyCheckins?.[currentModule?.id] || {};
  const moduleReps = teamRepByMod?.[currentModule?.id] || {};
  const moduleStickers = stickersByMod?.[currentModule?.id] || {};

  // Flatten all checked-in members with >=1 discussion star for live discussion ribbon
  const starredStudents = useMemo(() => {
    const list = [];
    teams.forEach((tm) => {
      const members = moduleCheckins[tm.id] || [];
      members.forEach((m) => {
        const stars = Number(moduleStickers[m.id]) || 0;
        if (stars > 0) {
          list.push({
            id: m.id,
            name: m.name,
            stars,
            teamColor: tm.color || '#A73B24',
            teamShort: (lang === 'en' ? tm.name : tm.thName || tm.name).split(':')[0]
          });
        }
      });
    });
    return list.sort((a, b) => b.stars - a.stars);
  }, [teams, moduleCheckins, moduleStickers, lang]);

  const totalCheckedIn = useMemo(
    () => teams.reduce((sum, tm) => sum + (moduleCheckins[tm.id]?.length || 0), 0),
    [teams, moduleCheckins]
  );

  const totalStarsAwarded = useMemo(
    () => Object.values(moduleStickers).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [moduleStickers]
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Keyboard shortcuts for classroom presenter clicker / keyboard
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight' && mode === 'rat' && questions.length > 0) {
        onUpdateProjectorState({
          questionIndex: Math.min(questions.length - 1, safeQIdx + 1),
          showAnswer: false
        });
      } else if (e.key === 'ArrowLeft' && mode === 'rat' && questions.length > 0) {
        onUpdateProjectorState({
          questionIndex: Math.max(0, safeQIdx - 1),
          showAnswer: false
        });
      } else if (e.key === 'r' || e.key === 'R') {
        if (mode === 'rat') onUpdateProjectorState({ showAnswer: !showAnswer });
      } else if (e.key === 'v' || e.key === 'V') {
        if (mode === 'rat') onUpdateProjectorState({ showVotes: !showVotes });
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, safeQIdx, questions.length, showAnswer, showVotes, onUpdateProjectorState]);

  // Compute anonymized iRAT & tRAT stats per question (NO student names!)
  const questionStats = useMemo(() => {
    const modIrat = iratRecordsByMod?.[currentModule?.id] || {};
    const modTrat = tratScratchesByMod?.[currentModule?.id] || {};
    const iratList = Object.values(modIrat);
    const tratTeams = Object.values(modTrat);

    return questions.map((q) => {
      const counts = { A: 0, B: 0, C: 0, D: 0 };
      let totalVotes = 0;
      let correctVotes = 0;
      const validKeys = [q.correct, ...(q.secondaryStars || [])];

      iratList.forEach((rec) => {
        const alloc = rec?.allocations?.[q.id] || {};
        const picked = Object.keys(alloc).find((k) => alloc[k] > 0);
        if (picked) {
          counts[picked] = (counts[picked] || 0) + 1;
          totalVotes += 1;
          if (validKeys.includes(picked)) correctVotes += 1;
        }
      });

      let teamsResolved = 0;
      let teamsFirstTry = 0;
      tratTeams.forEach((teamMap) => {
        const scratched = teamMap?.[q.id] || [];
        const starIdx = scratched.findIndex((k) => validKeys.includes(k));
        if (starIdx !== -1) {
          teamsResolved += 1;
          if (starIdx === 0) teamsFirstTry += 1;
        }
      });

      const iratPct = totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : null;
      return {
        counts,
        totalVotes,
        correctVotes,
        iratPct,
        teamsResolved,
        teamsFirstTry,
        needsDiscussion: iratPct !== null && iratPct < 70
      };
    });
  }, [questions, iratRecordsByMod, tratScratchesByMod, currentModule?.id]);

  const activeStats = questionStats[safeQIdx] || {
    counts: { A: 0, B: 0, C: 0, D: 0 },
    totalVotes: 0,
    correctVotes: 0,
    iratPct: null,
    teamsResolved: 0,
    teamsFirstTry: 0,
    needsDiscussion: false
  };

  const modCaseChoices = teamCaseChoiceByMod?.[currentModule?.id] || {};
  const modCaseRationales = teamCaseRationaleByMod?.[currentModule?.id] || {};

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <p className="text-xl font-bold">Loading classroom session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none">
      {/* TOP PROJECTOR CONTROL BAR */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2.5 py-1 rounded-lg bg-kku-terracotta text-white font-black text-xs tracking-wider uppercase shrink-0">
            PROJECTOR
          </span>
          <div className="truncate">
            <div className="text-sm sm:text-base font-extrabold text-white truncate">
              {classInfo?.courseCode} • {currentModule.code}: {currentModule.title[lang]}
            </div>
          </div>
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
              serverSyncStatus === 'live'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                serverSyncStatus === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            {serverSyncStatus === 'live' ? 'LIVE SYNC' : 'LOCAL'}
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => onUpdateProjectorState({ mode: 'teams' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
              mode === 'teams'
                ? 'bg-kku-terracotta text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Teams & Stars' : 'กลุ่ม & ดาวอภิปราย'}
          </button>
          <button
            type="button"
            onClick={() => onUpdateProjectorState({ mode: 'rat' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
              mode === 'rat'
                ? 'bg-kku-terracotta text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {lang === 'en' ? 'RAT Discussion' : 'อภิปรายข้อสอบ RAT'}
          </button>
          <button
            type="button"
            onClick={() => onUpdateProjectorState({ mode: 'case' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
              mode === 'case'
                ? 'bg-kku-terracotta text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {lang === 'en' ? '4S Case Reveal' : 'เปิดป้าย 4S พร้อมกัน'}
          </button>
        </div>

        {/* Right: Discussion Timer + Lang + Fullscreen */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compact Discussion Timer */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-extrabold ${
              timerSeconds === 0
                ? 'bg-rose-600/30 border-rose-500 text-rose-200 animate-pulse'
                : timerSeconds <= 30 && timerRunning
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-slate-800 border-slate-700 text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm w-12 text-center">{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white"
              title={timerRunning ? 'Pause' : 'Start'}
            >
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            {[60, 120, 180, 300].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(preset);
                }}
                className="px-1.5 py-0.5 rounded bg-slate-700/80 hover:bg-slate-600 text-[10px] font-sans font-bold text-slate-200"
              >
                {preset / 60}m
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(120);
              }}
              className="p-1 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-300"
              title="Reset Timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-amber-300"
          >
            {lang === 'en' ? 'TH' : 'EN'}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN PROJECTOR STAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {mode === 'teams' ? (
          /* ================= FIRST SCREEN: TEAMS, NAMES & DISCUSSION STARS ================= */
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {lang === 'en'
                    ? 'Live Classroom Teams & Discussion Stars'
                    : 'รายชื่อกลุ่มประจำสัปดาห์และดาวอภิปรายในชั้นเรียน'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                  {currentModule.code}: {currentModule.title[lang]}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    {lang === 'en' ? 'Teams' : 'กลุ่ม'}
                  </div>
                  <div className="text-xl font-black text-white">{teams.length}</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    {lang === 'en' ? 'Students' : 'นักศึกษา'}
                  </div>
                  <div className="text-xl font-black text-emerald-400">{totalCheckedIn}</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-center">
                  <div className="text-[11px] font-bold text-amber-300 uppercase">
                    {lang === 'en' ? 'Discussion ★' : 'ดาวอภิปรายรวม'}
                  </div>
                  <div className="text-xl font-black text-amber-300 flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    {totalStarsAwarded}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teams.map((tm) => {
                const members = moduleCheckins[tm.id] || [];
                const repId = moduleReps[tm.id];
                const teamStars = members.reduce(
                  (sum, m) => sum + (Number(moduleStickers[m.id]) || 0),
                  0
                );
                return (
                  <div
                    key={tm.id}
                    className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col"
                  >
                    <div
                      className="px-5 py-3.5 flex items-center justify-between gap-2 border-b border-slate-800"
                      style={{
                        borderTop: `4px solid ${tm.color || '#A73B24'}`
                      }}
                    >
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                          {lang === 'en' ? tm.name : tm.thName || tm.name}
                        </h2>
                        <div className="text-xs font-bold text-slate-400">
                          {members.length} {lang === 'en' ? 'members' : 'คน'}
                        </div>
                      </div>
                      {teamStars > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-sm flex items-center gap-1 shrink-0">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {teamStars}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1">
                      {members.length === 0 ? (
                        <div className="py-8 text-center text-xs font-semibold text-slate-500">
                          {lang === 'en'
                            ? 'Waiting for students to join...'
                            : 'รอนักศึกษาเข้ากลุ่ม...'}
                        </div>
                      ) : (
                        members.map((m) => {
                          const isLeader = repId === m.id;
                          const stars = Number(moduleStickers[m.id]) || 0;
                          return (
                            <div
                              key={m.id}
                              className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                stars > 0
                                  ? 'bg-amber-500/10 border-amber-400/35'
                                  : isLeader
                                  ? 'bg-slate-800/90 border-slate-700'
                                  : 'bg-slate-950/60 border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isLeader && (
                                  <Crown
                                    className="w-4 h-4 text-amber-400 shrink-0"
                                    title={lang === 'en' ? 'Team Leader' : 'หัวหน้ากลุ่ม'}
                                  />
                                )}
                                <span className="text-sm sm:text-base font-bold text-white truncate">
                                  {m.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {stars > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-xs">
                                    {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                                      />
                                    ))}
                                    {stars > 5 && <span className="ml-0.5">×{stars}</span>}
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-slate-600">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : mode === 'rat' ? (
          currentQ ? (
            <>
              {/* Question Navigator + Reveal Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={safeQIdx <= 0}
                    onClick={() =>
                      onUpdateProjectorState({
                        questionIndex: Math.max(0, safeQIdx - 1),
                        showAnswer: false
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {questions.map((q, idx) => {
                    const st = questionStats[idx];
                    const isActive = idx === safeQIdx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() =>
                          onUpdateProjectorState({ questionIndex: idx, showAnswer: false })
                        }
                        className={`relative px-4 py-2 rounded-xl font-extrabold text-sm border transition ${
                          isActive
                            ? 'bg-kku-terracotta border-amber-300 text-white shadow-lg scale-105'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Q{idx + 1}
                        {st?.needsDiscussion && (
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-950"
                            title="Low iRAT accuracy (<70%) — recommended for discussion"
                          />
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={safeQIdx >= questions.length - 1}
                    onClick={() =>
                      onUpdateProjectorState({
                        questionIndex: Math.min(questions.length - 1, safeQIdx + 1),
                        showAnswer: false
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Live Anonymized Stats + Reveal Toggles */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-3">
                    <span>
                      iRAT:{' '}
                      <strong className="text-white">
                        {activeStats.totalVotes} {lang === 'en' ? 'votes' : 'คน'}
                      </strong>
                      {activeStats.iratPct !== null && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.5 rounded font-extrabold ${
                            activeStats.iratPct < 50
                              ? 'bg-rose-500/25 text-rose-300'
                              : activeStats.iratPct < 75
                              ? 'bg-amber-500/25 text-amber-300'
                              : 'bg-emerald-500/25 text-emerald-300'
                          }`}
                        >
                          {activeStats.iratPct}%
                        </span>
                      )}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>
                      tRAT:{' '}
                      <strong className="text-amber-300">
                        {activeStats.teamsFirstTry}/{activeStats.teamsResolved || teams.length}
                      </strong>{' '}
                      {lang === 'en' ? '1st-try ★' : 'ถูกครั้งเดียว ★'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateProjectorState({ showVotes: !showVotes })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition ${
                      showVotes
                        ? 'bg-sky-600/25 border-sky-400/50 text-sky-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    {showVotes
                      ? lang === 'en'
                        ? 'Votes ON'
                        : 'แสดงผลโหวต'
                      : lang === 'en'
                      ? 'Votes OFF'
                      : 'ซ่อนผลโหวต'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateProjectorState({ showAnswer: !showAnswer })}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition shadow-sm ${
                      showAnswer
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-slate-950'
                    }`}
                  >
                    {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAnswer
                      ? lang === 'en'
                        ? 'Hide Answer'
                        : 'ซ่อนเฉลย'
                      : lang === 'en'
                      ? 'Reveal Answer ★'
                      : 'เปิดเฉลย ★'}
                  </button>
                </div>
              </div>

              {/* Giant Question Card */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-start gap-4">
                  <span className="px-4 py-2 rounded-2xl bg-kku-terracotta text-white font-black text-xl sm:text-2xl shrink-0">
                    Q{safeQIdx + 1}
                  </span>
                  <div className="space-y-2 flex-1">
                    {currentQ.isControversial && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
                        <Sparkles className="w-3.5 h-3.5" />
                        {lang === 'en'
                          ? 'Controversy / Multi-Perspective Discussion'
                          : 'โจทย์ประเด็นถกเถียง (Controversy)'}
                      </span>
                    )}
                    <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
                      {currentQ.stem?.[lang] || currentQ.stem?.en}
                    </h1>
                  </div>
                </div>

                {/* 2x2 Options Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(currentQ.options || []).map((opt) => {
                    const isPrimary = currentQ.correct === opt.key;
                    const isSecondary = (currentQ.secondaryStars || []).includes(opt.key);
                    const voteCount = activeStats.counts[opt.key] || 0;
                    const votePct =
                      activeStats.totalVotes > 0
                        ? Math.round((voteCount / activeStats.totalVotes) * 100)
                        : 0;

                    let cardStyle = 'bg-slate-800/80 border-slate-700 text-slate-100';
                    let badgeStyle = 'bg-slate-700 text-white';
                    if (showAnswer && isPrimary) {
                      cardStyle =
                        'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/40 text-white';
                      badgeStyle = 'bg-emerald-500 text-slate-950';
                    } else if (showAnswer && isSecondary) {
                      cardStyle =
                        'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/30 text-white';
                      badgeStyle = 'bg-amber-400 text-slate-950';
                    } else if (showAnswer) {
                      cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-75';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between gap-4 ${cardStyle}`}
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className={`w-11 h-11 rounded-xl font-black text-lg flex items-center justify-center shrink-0 ${badgeStyle}`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1 space-y-1.5">
                            <p className="text-base sm:text-xl font-bold leading-relaxed">
                              {opt[lang] || opt.en}
                            </p>
                            {showAnswer && (isPrimary || isSecondary) && (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                  isPrimary
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-amber-400 text-slate-950'
                                }`}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {isPrimary
                                  ? lang === 'en'
                                    ? 'Primary Correct ★'
                                    : 'คำตอบหลัก ★'
                                  : lang === 'en'
                                  ? 'Acceptable Co-Star ★'
                                  : 'คำตอบร่วมที่ยอมรับได้ ★'}
                              </span>
                            )}
                          </div>
                        </div>

                        {showVotes && (
                          <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span className="text-slate-300">
                                {lang === 'en' ? 'Class iRAT Picks' : 'ผลเลือก iRAT ในชั้นเรียน'}
                              </span>
                              <span className="text-amber-300">
                                {voteCount} ({votePct}%)
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-950/80 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  showAnswer && isPrimary
                                    ? 'bg-emerald-400'
                                    : showAnswer && isSecondary
                                    ? 'bg-amber-400'
                                    : 'bg-sky-400'
                                }`}
                                style={{ width: `${votePct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Immediate Feedback Rationale (only when Revealed) */}
                {showAnswer && (currentQ.rationale?.[lang] || currentQ.rationale?.en) && (
                  <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 space-y-1.5">
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-emerald-300" />
                      {lang === 'en'
                        ? 'Discussion Rationale & Key Takeaway'
                        : 'เหตุผลประกอบเฉลยและประเด็นสรุป'}
                    </div>
                    <p className="text-base sm:text-lg font-semibold leading-relaxed text-white">
                      {currentQ.rationale[lang] || currentQ.rationale.en}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-slate-500 font-semibold">
                {lang === 'en'
                  ? 'Shortcuts: ← / → Next/Prev Question • R Reveal Answer • V Toggle Votes • F Fullscreen'
                  : 'คีย์ลัด: ← / → เปลี่ยนข้อ • R เปิด/ซ่อนเฉลย • V แสดง/ซ่อนผลโหวต • F เต็มหน้าจอ'}
              </div>
            </>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-12 border border-slate-800 text-center text-slate-400">
              No questions in this week yet.
            </div>
          )
        ) : (
          /* ================= 4S SIMULTANEOUS CASE REVEAL MODE ================= */
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    4S Application Case • Simultaneous Reveal
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {currentModule.applicationCase?.title?.[lang]}
                  </h1>
                </div>

                {currentModule.applicationCase?.showMap !== false &&
                  Array.isArray(currentModule.applicationCase?.spatialZones) &&
                  currentModule.applicationCase.spatialZones.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onUpdateProjectorState({ showMap: !showMap })}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition ${
                        showMap
                          ? 'bg-kku-terracotta border-amber-300 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <MapIcon className="w-4 h-4" />
                      {showMap
                        ? lang === 'en'
                          ? 'Hide Map'
                          : 'ซ่อนแผนที่'
                        : lang === 'en'
                        ? 'Show Interactive Map'
                        : 'แสดงแผนที่ GeoAI'}
                    </button>
                  )}
              </div>

              <p className="text-base sm:text-xl text-slate-200 leading-relaxed font-medium">
                {currentModule.applicationCase?.scenario?.[lang]}
              </p>

              {/* Specific Choices A/B/C/D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {(currentModule.applicationCase?.specificChoices || []).map((ch, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isRec =
                    revealExpertAnswer && currentModule.applicationCase?.recommendedChoice === ch.id;
                  return (
                    <div
                      key={ch.id}
                      className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                        isRec
                          ? 'bg-emerald-950/90 border-emerald-400'
                          : 'bg-slate-800/70 border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-9 h-9 rounded-xl font-black text-base flex items-center justify-center shrink-0 ${
                          isRec
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-slate-700 text-amber-300'
                        }`}
                      >
                        {letter}
                      </span>
                      <div>
                        <div className="font-extrabold text-base text-white">
                          {ch.label?.[lang]}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                          {ch.summary?.[lang]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {showMap &&
              Array.isArray(currentModule.applicationCase?.spatialZones) &&
              currentModule.applicationCase.spatialZones.length > 0 && (
                <div className="text-slate-900">
                  <GeoAIMap
                    zones={currentModule.applicationCase.spatialZones}
                    lang={lang}
                    activeZoneId={activeZoneId}
                    onSelectZone={setActiveZoneId}
                  />
                </div>
              )}

            {/* Simultaneous Team Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-amber-300 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {simultaneousReveal
                    ? lang === 'en'
                      ? 'All Teams Revealed — Cross-Team Debate!'
                      : 'เปิดป้ายคำตอบทุกกลุ่มพร้อมกัน — อภิปรายข้ามกลุ่ม!'
                    : lang === 'en'
                    ? 'Waiting for Simultaneous Reveal from Instructor Portal...'
                    : 'รออาจารย์กดเปิดป้ายคำตอบทุกกลุ่มพร้อมกัน...'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((tm) => {
                  const chosenId = modCaseChoices[tm.id];
                  const chosenIdx = (currentModule.applicationCase?.specificChoices || []).findIndex(
                    (c) => c.id === chosenId
                  );
                  const letter = chosenIdx >= 0 ? String.fromCharCode(65 + chosenIdx) : null;
                  const rationale = modCaseRationales[tm.id] || '';
                  const isRec =
                    revealExpertAnswer &&
                    chosenId &&
                    chosenId === currentModule.applicationCase?.recommendedChoice;

                  return (
                    <div
                      key={tm.id}
                      className={`rounded-2xl p-5 border-2 flex flex-col justify-between gap-3 transition-all ${
                        simultaneousReveal && isRec
                          ? 'bg-emerald-950/90 border-emerald-400'
                          : simultaneousReveal && letter
                          ? 'bg-slate-900 border-amber-400/60'
                          : 'bg-slate-900/70 border-slate-800'
                      }`}
                    >
                      <div className="text-sm font-extrabold text-slate-200 truncate">
                        {lang === 'en' ? tm.name : tm.thName || tm.name}
                      </div>

                      {!simultaneousReveal ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-950/70 border border-slate-800">
                          <Lock
                            className={`w-7 h-7 ${letter ? 'text-emerald-400' : 'text-slate-600'}`}
                          />
                          <span
                            className={`text-xs font-extrabold ${
                              letter ? 'text-emerald-300' : 'text-slate-500'
                            }`}
                          >
                            {letter
                              ? lang === 'en'
                                ? 'Card Locked ✓'
                                : 'เลือกป้ายแล้ว ✓'
                              : lang === 'en'
                              ? 'Discussing...'
                              : 'กำลังปรึกษา...'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center py-4 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span
                              className={`text-5xl font-black ${
                                isRec
                                  ? 'text-emerald-400'
                                  : letter
                                  ? 'text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            >
                              {letter || '—'}
                            </span>
                          </div>
                          {rationale && (
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                              “{rationale}”
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Live Discussion Stars Ribbon (shown during RAT & 4S discussions when anyone has stars) */}
        {mode !== 'teams' && starredStudents.length > 0 && (
          <div className="bg-slate-900/90 rounded-2xl px-4 py-3 border border-amber-400/30 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mr-1 shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {lang === 'en' ? 'Discussion Stars:' : 'ดาวอภิปราย:'}
            </span>
            {starredStudents.map((st) => (
              <span
                key={st.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/35 text-xs font-extrabold text-white"
              >
                <span>{st.name}</span>
                <span className="text-amber-300 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {st.stars}
                </span>
              </span>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
