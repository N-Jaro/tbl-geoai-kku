import React, { useState, useMemo, useEffect } from 'react';
import {
  UserCheck,
  Users,
  MapPin,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  RotateCcw,
  Star,
  XCircle,
  Eye,
  EyeOff,
  Globe,
  Crown,
  LogOut,
  ArrowRight,
  Tv,
  BookOpen,
  Calendar,
  User,
  ShieldAlert
} from 'lucide-react';
import { UI_TEXT, TEAMS, MODULES, DEFAULT_ROSTER, DEFAULT_CLASSES } from './data/tblData';
import GeoAIMap from './components/GeoAIMap';
import StudentLanding from './components/StudentLanding';
import InstructorPortal from './components/InstructorPortal';
import AdminPortal from './components/AdminPortal';

const STEP_ICONS = [UserCheck, Users, MapPin, Award];

const STORAGE_KEY = 'kku_geoai_tbl_modules_v2';
const ROSTER_STORAGE_KEY = 'kku_geoai_tbl_roster_v2_clean';
const CHECKINS_STORAGE_KEY = 'kku_geoai_tbl_checkins_v2_clean';
const REPS_STORAGE_KEY = 'kku_geoai_tbl_reps_v2_clean';
const IRAT_STORAGE_KEY = 'kku_geoai_tbl_irat_records_v2_clean';
const TRAT_STORAGE_KEY = 'kku_geoai_tbl_trat_scratches_v2_clean';
const PEER_EVAL_STORAGE_KEY = 'kku_geoai_tbl_peer_evals_v2_clean';
const STICKERS_STORAGE_KEY = 'kku_geoai_tbl_stickers_v1';
const CLASSES_STORAGE_KEY = 'kku_geoai_tbl_classes_v1';
const SESSION_UI_STORAGE_KEY = 'kku_geoai_tbl_ui_session_v2_th';

export default function App() {
  // Load persisted UI navigation state so F5 / Browser Refresh stays on Instructor Page or Active Student Step
  const initialSession = useMemo(() => {
    try {
      const saved = localStorage.getItem(SESSION_UI_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }, []);

  const [lang, setLang] = useState(() => initialSession?.lang || 'th'); // 'th' (default) | 'en'
  const [role, setRole] = useState(() => initialSession?.role || 'student'); // 'student' | 'instructor' | 'admin'
  const [isInstructorAuthed, setIsInstructorAuthed] = useState(
    () => !!initialSession?.isInstructorAuthed
  );
  const [isAdminAuthed, setIsAdminAuthed] = useState(
    () => !!initialSession?.isAdminAuthed
  );

  // Live Multi-Device MySQL Server Sync Helper (pushes state updates to ./api.php)
  const [serverSyncStatus, setServerSyncStatus] = useState('checking'); // 'checking' | 'live' | 'local'
  const pushToServer = async (updates, mode = 'merge') => {
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, updates })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) setServerSyncStatus('live');
      }
    } catch (e) {
      // Offline / local dev fallback
    }
  };

  // Multi-Teacher / Multi-Course Directory
  const [classes, setClasses] = useState(() => {
    try {
      const saved = localStorage.getItem(CLASSES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CLASSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    } catch (e) {}
  }, [classes]);

  const [selectedClassId, setSelectedClassId] = useState(
    () => initialSession?.selectedClassId || classes[0]?.id || DEFAULT_CLASSES[0].id
  );

  const classInfo = useMemo(
    () => classes.find((c) => c.id === selectedClassId) || classes[0],
    [classes, selectedClassId]
  );

  const handleUpdateClassInfo = (updatedCls) => {
    setClasses((prev) => {
      const next = prev.map((c) =>
        c.id === selectedClassId ? { ...c, ...updatedCls } : c
      );
      pushToServer({ classes: next }, 'replace');
      return next;
    });
  };

  const handleAdminUpdateClass = (clsId, updates) => {
    setClasses((prev) => {
      const next = prev.map((c) => (c.id === clsId ? { ...c, ...updates } : c));
      pushToServer({ classes: next }, 'replace');
      return next;
    });
  };

  // Dynamic unlimited weekly modules persisted in localStorage
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MODULES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    } catch (e) {}
  }, [modules]);

  // Filter modules strictly for the active class so each instructor only sees their own course's weeks
  const classModules = useMemo(() => {
    const firstClassId = classes[0]?.id || DEFAULT_CLASSES[0].id;
    const filtered = modules.filter(
      (m) => (m.classId || firstClassId) === selectedClassId
    );
    return filtered.length > 0 ? filtered : modules.slice(0, 1);
  }, [modules, selectedClassId, classes]);

  const [selectedModuleId, setSelectedModuleId] = useState(
    () => initialSession?.selectedModuleId || classModules[0]?.id || MODULES[0].id
  );

  // Whenever the authenticated Instructor switches class or week, broadcast activeClassId & activeModuleId to all student devices
  useEffect(() => {
    if (role === 'instructor' && isInstructorAuthed && selectedClassId && selectedModuleId) {
      pushToServer(
        {
          activeClassId: selectedClassId,
          activeModuleId: selectedModuleId
        },
        'replace'
      );
    }
  }, [role, isInstructorAuthed, selectedClassId, selectedModuleId]);
  useEffect(() => {
    if (!classModules.some((m) => m.id === selectedModuleId)) {
      if (classModules[0]?.id) {
        setSelectedModuleId(classModules[0].id);
      }
    }
  }, [classModules, selectedModuleId]);

  const [selectedTeamId, setSelectedTeamId] = useState(
    () => initialSession?.selectedTeamId || TEAMS[0].id
  );
  const [activeStep, setActiveStep] = useState(
    () => initialSession?.activeStep || 1
  ); // 1..4

  // Per-Class Rosters Map: { [classId]: [{ id, name, section }] } so each instructor only sees their own class roster
  const [rostersByClass, setRostersByClass] = useState(() => {
    try {
      const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return { [DEFAULT_CLASSES[0].id]: parsed };
        }
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(rostersByClass));
    } catch (e) {}
  }, [rostersByClass]);

  const roster = useMemo(
    () => rostersByClass[selectedClassId] || [],
    [rostersByClass, selectedClassId]
  );

  const setRoster = (newRosterOrUpdater) => {
    setRostersByClass((prev) => {
      const curList = prev[selectedClassId] || [];
      const nextList =
        typeof newRosterOrUpdater === 'function'
          ? newRosterOrUpdater(curList)
          : newRosterOrUpdater;
      const nextMap = { ...prev, [selectedClassId]: nextList };
      pushToServer({ rostersByClass: nextMap }, 'replace');
      return nextMap;
    });
  };

  const handleAdminCreateClass = (newClsData) => {
    const newId = `cls-${Date.now()}`;
    const newCls = {
      id: newId,
      courseCode: newClsData.courseCode,
      courseName: newClsData.courseName,
      instructorName: newClsData.instructorName,
      semester: newClsData.semester || 'Semester 1 / 2026',
      targetTeamSize: newClsData.targetTeamSize || 5,
      teamCount: newClsData.teamCount || 4,
      pin: newClsData.pin || '2026'
    };
    setClasses((prev) => {
      const next = [...prev, newCls];
      pushToServer({ classes: next }, 'replace');
      return next;
    });

    // Also seed Week 1 module specifically for this new class
    const starterWeekId = `week-1-${newId}`;
    const starterWeek = {
      ...JSON.parse(JSON.stringify(MODULES[0])),
      id: starterWeekId,
      classId: newId,
      weekNumber: 1,
      code: 'Week 1',
      title: {
        en: `Week 1: ${newCls.courseName} TBL Session`,
        th: `สัปดาห์ที่ 1: บทเรียน TBL วิชา ${newCls.courseName}`
      }
    };
    setModules((prev) => {
      const next = [...prev, starterWeek];
      pushToServer({ modules: next }, 'replace');
      return next;
    });
    return newCls;
  };

  const handleAdminDeleteClass = (clsId) => {
    if (classes.length <= 1) return;
    const remaining = classes.filter((c) => c.id !== clsId);
    setClasses(remaining);
    pushToServer({ classes: remaining }, 'replace');
    if (selectedClassId === clsId) {
      setSelectedClassId(remaining[0].id);
    }
  };

  // Dynamic Teams Pool based on Instructor Team Size & Number of Teams Settings
  const targetTeamSize = Number(classInfo?.targetTeamSize) || 5;
  const configuredTeamCount = Number(classInfo?.teamCount) || 4;

  const activeTeams = useMemo(() => {
    const neededByRoster =
      roster.length > 0 && targetTeamSize > 0
        ? Math.ceil(roster.length / targetTeamSize)
        : configuredTeamCount;
    const count = Math.max(2, Math.min(20, Math.max(configuredTeamCount, neededByRoster)));
    const palette = ['#A73B24', '#0284C7', '#059669', '#7C3AED', '#D97706', '#E11D48'];
    return Array.from({ length: count }, (_, idx) => {
      if (TEAMS[idx]) return TEAMS[idx];
      const num = idx + 1;
      return {
        id: `team-${num}`,
        name: `Team ${num}: Spatial Group #${num}`,
        thName: `ทีม ${num}: กลุ่มวิเคราะห์ที่ ${num}`,
        color: palette[idx % palette.length],
        members: [],
        defaultMemberIds: [],
        mockIratAvg: 0,
        mockTratScore: 0
      };
    });
  }, [configuredTeamCount, roster.length, targetTeamSize]);

  // weeklyCheckins: { [moduleId]: { [teamId]: [{ id, name, section, checkedInAt }] } }
  const [weeklyCheckins, setWeeklyCheckins] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKINS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    const seed = {};
    MODULES.forEach((m) => {
      seed[m.id] = {};
      TEAMS.forEach((tm) => {
        seed[m.id][tm.id] = (tm.defaultMemberIds || [])
          .map((id) => DEFAULT_ROSTER.find((r) => r.id === id))
          .filter(Boolean);
      });
    });
    return seed;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(weeklyCheckins));
    } catch (e) {}
  }, [weeklyCheckins]);

  // Active signed-in student (null means on Student Check-In Landing Page)
  const [activeStudent, setActiveStudent] = useState(
    () => initialSession?.activeStudent || null
  );

  // Persist current UI view state (role, auth, active student, class, week, step, language) across page refreshes
  useEffect(() => {
    try {
      localStorage.setItem(
        SESSION_UI_STORAGE_KEY,
        JSON.stringify({
          lang,
          role,
          isInstructorAuthed,
          isAdminAuthed,
          selectedClassId,
          selectedModuleId,
          selectedTeamId,
          activeStep,
          activeStudent
        })
      );
    } catch (e) {}
  }, [
    lang,
    role,
    isInstructorAuthed,
    isAdminAuthed,
    selectedClassId,
    selectedModuleId,
    selectedTeamId,
    activeStep,
    activeStudent
  ]);

  // Team Leader (tRAT Submitter) per module & team: { [moduleId]: { [teamId]: studentId } }
  const [teamRepByMod, setTeamRepByMod] = useState(() => {
    try {
      const saved = localStorage.getItem(REPS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const seed = {};
    MODULES.forEach((m) => {
      seed[m.id] = {};
      TEAMS.forEach((tm) => {
        if (tm.defaultMemberIds?.[0]) {
          seed[m.id][tm.id] = tm.defaultMemberIds[0];
        }
      });
    });
    return seed;
  });

  useEffect(() => {
    try {
      localStorage.setItem(REPS_STORAGE_KEY, JSON.stringify(teamRepByMod));
    } catch (e) {}
  }, [teamRepByMod]);

  // Per-student Individual iRAT records: { [moduleId]: { [studentId]: { allocations, submitted } } }
  const [iratRecordsByMod, setIratRecordsByMod] = useState(() => {
    try {
      const saved = localStorage.getItem(IRAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(IRAT_STORAGE_KEY, JSON.stringify(iratRecordsByMod));
    } catch (e) {}
  }, [iratRecordsByMod]);

  // Format Student ID to show the last 4 digits (excluding hyphen, e.g. "673380105-0" -> "105-0" or 4 digits)
  const formatLast4Id = (idStr) => {
    const raw = String(idStr || '').trim();
    const digitsOnly = raw.replace(/[^0-9a-zA-Z]/g, '');
    if (digitsOnly.length <= 4) return raw;
    // If it ends with "-X", show 3 digits before hyphen + "-X" (4 digits total, e.g. "105-0")
    if (/-\w$/.test(raw) && raw.length >= 5) {
      return raw.slice(-5);
    }
    return digitsOnly.slice(-4);
  };

  // Normalize Student IDs (ignores hyphens/spaces) so "6733801377" matches "673380137-7"
  const normalizeStudentId = (idStr) =>
    String(idStr || '')
      .trim()
      .toLowerCase()
      .replace(/[-\s]/g, '');

  // Balanced Random Team Assignment whenever a student checks in with their Student ID (respects targetTeamSize)
  const handleRandomAssignStudent = (modId, studentObj) => {
    const modTeams = { ...(weeklyCheckins[modId] || {}) };
    const normTargetId = normalizeStudentId(studentObj.id);

    // 1. Check if student already has a random team for this week (including across any team key)
    for (const [tId, list] of Object.entries(modTeams)) {
      if (!Array.isArray(list)) continue;
      const found = list.find((s) => normalizeStudentId(s.id) === normTargetId);
      if (found) {
        const currentLeader = teamRepByMod[modId]?.[tId] || list[0]?.id;
        return {
          assignedTeamId: tId,
          isLeader: normalizeStudentId(currentLeader) === normTargetId
        };
      }
    }

    // 2. Otherwise, find teams under targetTeamSize with the minimum headcount to keep random teams balanced
    const counts = activeTeams.map((tm) => ({
      teamId: tm.id,
      count: (modTeams[tm.id] || []).length
    }));
    const underCap = counts.filter((c) => c.count < targetTeamSize);
    const pool = underCap.length > 0 ? underCap : counts;
    const minCount = Math.min(...pool.map((c) => c.count));
    const candidateTeams = pool.filter((c) => c.count === minCount);
    const randomPick =
      candidateTeams[Math.floor(Math.random() * candidateTeams.length)];
    const assignedTeamId = randomPick.teamId;

    const existingMembers = modTeams[assignedTeamId] || [];
    const updatedMembers = [
      ...existingMembers,
      { ...studentObj, checkedInAt: new Date().toLocaleTimeString() }
    ];

    setWeeklyCheckins((prev) => {
      const next = {
        ...prev,
        [modId]: {
          ...(prev[modId] || {}),
          [assignedTeamId]: updatedMembers
        }
      };
      pushToServer(
        {
          weeklyCheckins: {
            [modId]: { [assignedTeamId]: updatedMembers }
          }
        },
        'merge'
      );
      return next;
    });

    // If this team doesn't have a Team Leader yet, make this student the Team Leader
    const currentLeaderId = teamRepByMod[modId]?.[assignedTeamId];
    const isLeader = !currentLeaderId || existingMembers.length === 0;
    if (isLeader) {
      handleSetTeamRep(modId, assignedTeamId, studentObj.id);
    }

    return { assignedTeamId, isLeader };
  };

  // Instructor 1-click Re-Shuffle ALL students in the class into fresh balanced random teams respecting targetTeamSize
  const handleReshuffleAllRandomTeams = (modId) => {
    const shuffled = [...roster].sort(() => Math.random() - 0.5);
    const newModTeams = {};
    const newModLeaders = {};
    activeTeams.forEach((tm) => {
      newModTeams[tm.id] = [];
    });

    shuffled.forEach((student, idx) => {
      const team = activeTeams[idx % activeTeams.length];
      newModTeams[team.id].push({
        ...student,
        checkedInAt: new Date().toLocaleTimeString()
      });
    });

    // Randomly pick 1 member in each team to be the Team Leader (tRAT Submitter)
    activeTeams.forEach((tm) => {
      const list = newModTeams[tm.id];
      if (list.length > 0) {
        const randLeader = list[Math.floor(Math.random() * list.length)];
        newModLeaders[tm.id] = randLeader.id;
      }
    });

    setWeeklyCheckins((prev) => {
      const next = { ...prev, [modId]: newModTeams };
      return next;
    });
    setTeamRepByMod((prev) => {
      const next = { ...prev, [modId]: newModLeaders };
      return next;
    });
    // Push BOTH weeklyCheckins and teamRepByMod in ONE atomic transaction so leaders are never wiped out
    pushToServer(
      {
        weeklyCheckins: { [modId]: newModTeams },
        teamRepByMod: { [modId]: newModLeaders }
      },
      'replace'
    );
  };

  const handleSetTeamRep = (modId, teamId, studentId) => {
    setTeamRepByMod((prev) => {
      const next = {
        ...prev,
        [modId]: {
          ...(prev[modId] || {}),
          [teamId]: studentId
        }
      };
      pushToServer(
        {
          teamRepByMod: {
            [modId]: { [teamId]: studentId }
          }
        },
        'merge'
      );
      return next;
    });
  };

  const handleEnterClassroom = (studentObj, teamId) => {
    setSelectedTeamId(teamId);
    setActiveStudent({ ...studentObj, teamId });
    setActiveStep(1);
    setRole('student');
  };

  // Instructor phase lock controls (4 core in-class steps)
  const [unlockedSteps, setUnlockedSteps] = useState([1, 2, 3, 4]);
  // Per-week & per-team tRAT scratches: { [moduleId]: { [teamId]: { [questionId]: ['A', 'B'] } } }
  const [tratScratchesByMod, setTratScratchesByMod] = useState(() => {
    try {
      const saved = localStorage.getItem(TRAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRAT_STORAGE_KEY, JSON.stringify(tratScratchesByMod));
    } catch (e) {}
  }, [tratScratchesByMod]);

  // Step 3: 4S Application Case & Discussion Stickers
  const [activeZoneId, setActiveZoneId] = useState('zone-1');
  const [teamCaseChoiceByMod, setTeamCaseChoiceByMod] = useState({});
  const [teamCaseRationaleByMod, setTeamCaseRationaleByMod] = useState({});
  const [caseLockedByMod, setCaseLockedByMod] = useState({});
  const [simultaneousReveal, setSimultaneousReveal] = useState(false);
  const [revealExpertAnswer, setRevealExpertAnswer] = useState(false);
  const [zoomedCaseImage, setZoomedCaseImage] = useState(null);

  // Digital Discussion Stickers per module & studentId: { [moduleId]: { [studentId]: count } }
  const [stickersByMod, setStickersByMod] = useState(() => {
    try {
      const saved = localStorage.getItem(STICKERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STICKERS_STORAGE_KEY, JSON.stringify(stickersByMod));
    } catch (e) {}
  }, [stickersByMod]);

  const handleAdjustStudentSticker = (modId, studentId, delta = 1) => {
    setStickersByMod((prev) => {
      const modMap = { ...(prev[modId] || {}) };
      const curCount = Number(modMap[studentId]) || 0;
      const nextCount = Math.max(0, curCount + delta);
      modMap[studentId] = nextCount;
      const next = { ...prev, [modId]: modMap };
      pushToServer(
        {
          stickersByMod: {
            [modId]: { [studentId]: nextCount }
          }
        },
        'merge'
      );
      return next;
    });
  };

  // Step 4: Peer Evaluation per week & per evaluator studentId
  // peerEvalsByMod: { [moduleId]: { [evaluatorId]: { pointsByTargetId: { [targetId]: pts }, commentsByTargetId: { [targetId]: text }, submitted: true } } }
  const [peerEvalsByMod, setPeerEvalsByMod] = useState(() => {
    try {
      const saved = localStorage.getItem(PEER_EVAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(PEER_EVAL_STORAGE_KEY, JSON.stringify(peerEvalsByMod));
    } catch (e) {}
  }, [peerEvalsByMod]);

  const t = UI_TEXT[lang];
  const currentModule = useMemo(
    () => classModules.find((m) => m.id === selectedModuleId) || classModules[0],
    [classModules, selectedModuleId]
  );
  // Find which team the activeStudent actually belongs to in `weeklyCheckins[currentModule.id]`
  // so if the instructor clicks "Randomize All Teams 🎲", every logged-in student's iPad automatically updates to their new team!
  const resolvedStudentTeamId = useMemo(() => {
    if (!activeStudent || !currentModule) return selectedTeamId;
    const normMe = normalizeStudentId(activeStudent.id);
    const weekMap = weeklyCheckins[currentModule.id] || {};
    for (const [tId, list] of Object.entries(weekMap)) {
      if (Array.isArray(list) && list.some((m) => normalizeStudentId(m.id) === normMe)) {
        return tId;
      }
    }
    return selectedTeamId;
  }, [activeStudent, currentModule, weeklyCheckins, selectedTeamId]);

  useEffect(() => {
    if (
      role === 'student' &&
      activeStudent &&
      resolvedStudentTeamId &&
      resolvedStudentTeamId !== selectedTeamId
    ) {
      setSelectedTeamId(resolvedStudentTeamId);
      setActiveStudent((prev) =>
        prev ? { ...prev, teamId: resolvedStudentTeamId } : prev
      );
    }
  }, [role, activeStudent, resolvedStudentTeamId, selectedTeamId]);

  const currentTeam = useMemo(
    () => activeTeams.find((tm) => tm.id === resolvedStudentTeamId) || activeTeams[0],
    [activeTeams, resolvedStudentTeamId]
  );

  const currentTeamMembers = useMemo(() => {
    const weekMap = weeklyCheckins[currentModule.id] || {};
    const list = weekMap[currentTeam.id];
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    return activeStudent && activeStudent.teamId === currentTeam.id
      ? [activeStudent]
      : [];
  }, [weeklyCheckins, currentModule.id, currentTeam, activeStudent]);

  useEffect(() => {
    if (!currentModule) return;
    const firstZone = currentModule.applicationCase?.spatialZones?.[0]?.id;
    if (firstZone) setActiveZoneId(firstZone);
  }, [currentModule]);

  // Per-student iRAT state
  const activeStudentId = activeStudent?.id || 'guest';
  const currentStudentIratRecord =
    iratRecordsByMod[currentModule.id]?.[activeStudentId] || {
      allocations: {},
      submitted: false
    };
  const iratAllocations = currentStudentIratRecord.allocations || {};
  const iratSubmitted = !!currentStudentIratRecord.submitted;

  // Designated Team Leader (tRAT & 4S Card Submitter)
  const currentTeamRepId =
    teamRepByMod[currentModule.id]?.[currentTeam.id] ||
    currentTeamMembers[0]?.id ||
    null;
  const currentTeamRepObj =
    currentTeamMembers.find((m) => normalizeStudentId(m.id) === normalizeStudentId(currentTeamRepId)) ||
    roster.find((r) => normalizeStudentId(r.id) === normalizeStudentId(currentTeamRepId)) ||
    currentTeamMembers[0];
  const isCurrentUserTeamRep =
    normalizeStudentId(activeStudent?.id) === normalizeStudentId(currentTeamRepId);

  // Per-week & Per-team 4S Card Choice: teamCaseChoiceByMod[moduleId][teamId]
  const modCaseChoices = teamCaseChoiceByMod[currentModule.id];
  const teamCaseChoice =
    (modCaseChoices && typeof modCaseChoices === 'object'
      ? modCaseChoices[currentTeam.id]
      : null) || null;
  const teamCaseRationale =
    teamCaseRationaleByMod[currentModule.id]?.[currentTeam.id] ?? '';
  const caseLocked = !!caseLockedByMod[currentModule.id];

  // Per-evaluator 0-10 Peer Evaluation state for the currently active student
  const currentStudentPeerRecord =
    peerEvalsByMod[currentModule.id]?.[activeStudentId] || null;

  const peerStarsByTarget = useMemo(() => {
    const map = {};
    currentTeamMembers.forEach((m) => {
      const savedVal = currentStudentPeerRecord?.starsByTargetId?.[m.id];
      map[m.id] = typeof savedVal === 'number' ? savedVal : 10;
    });
    return map;
  }, [currentStudentPeerRecord, currentTeamMembers]);

  const peerComments = currentStudentPeerRecord?.commentsByTargetId || {};
  const peerSubmitted = !!currentStudentPeerRecord?.submitted;

  const updateCurrentStudentPeerEval = (updater) => {
    if (!activeStudent) return;
    setPeerEvalsByMod((prev) => {
      const modMap = { ...(prev[currentModule.id] || {}) };
      const defaultStars = {};
      currentTeamMembers.forEach((m) => {
        defaultStars[m.id] = 10;
      });
      const curRec = modMap[activeStudent.id] || {
        starsByTargetId: defaultStars,
        commentsByTargetId: {},
        submitted: false
      };
      const updatedRec = updater(curRec);
      modMap[activeStudent.id] = updatedRec;
      pushToServer(
        {
          peerEvalsByMod: {
            [currentModule.id]: { [activeStudent.id]: updatedRec }
          }
        },
        'merge'
      );
      return { ...prev, [currentModule.id]: modMap };
    });
  };

  // Compute received 0-10 Peer Evaluation average & feedback for any studentId (supports any week/module)
  const getStudentPeerScoreForModule = (modId, studentId) => {
    const modEvals = peerEvalsByMod[modId] || {};
    const receivedStars = [];
    const receivedNotes = [];
    Object.values(modEvals).forEach((rec) => {
      const starVal = rec?.starsByTargetId?.[studentId];
      if (rec?.submitted && typeof starVal === 'number') {
        receivedStars.push(starVal);
        const note = rec.commentsByTargetId?.[studentId];
        if (note && note.trim()) receivedNotes.push(note.trim());
      }
    });
    const hasSubmittedOwn = !!modEvals[studentId]?.submitted;
    if (receivedStars.length === 0) {
      return {
        avgStars: null,
        ratersCount: 0,
        notes: [],
        hasSubmittedOwn
      };
    }
    const sum = receivedStars.reduce((a, b) => a + b, 0);
    const avgStars = Math.round((sum / receivedStars.length) * 10) / 10;
    return {
      avgStars,
      ratersCount: receivedStars.length,
      notes: receivedNotes,
      hasSubmittedOwn
    };
  };

  const getStudentPeerScore = (studentId) =>
    getStudentPeerScoreForModule(currentModule.id, studentId);

  // ================= WEEKLY LESSON BUILDER HANDLERS =================
  const handleSaveModule = (updatedMod) => {
    setModules((prev) => {
      const exists = prev.some((m) => m.id === updatedMod.id);
      const next = exists
        ? prev.map((m) => (m.id === updatedMod.id ? updatedMod : m))
        : [...prev, updatedMod];
      pushToServer({ modules: next }, 'replace');
      return next;
    });
  };

  const handleAddNewWeek = () => {
    const nextWeekNum = classModules.length + 1;
    const newId = `week-${nextWeekNum}-${Date.now()}`;
    const newWeek = {
      id: newId,
      classId: selectedClassId,
      weekNumber: nextWeekNum,
      code: `Week ${nextWeekNum}`,
      title: {
        en: `Week ${nextWeekNum}: Custom TBL Lesson`,
        th: `สัปดาห์ที่ ${nextWeekNum}: บทเรียนปฏิบัติการแบบ TBL`
      },
      duration: '3 Hours',
      outcomes: {
        en: ['Analyze spatial data trade-offs and select the optimal GeoAI pipeline.'],
        th: ['วิเคราะห์ข้อจำกัดของข้อมูลเชิงพื้นที่และตัดสินใจเลือกแนวทาง GeoAI ที่เหมาะสมที่สุด']
      },
      preworkMaterials: [],
      questions: [
        {
          id: `q-${Date.now()}-1`,
          stem: {
            en: `Week ${nextWeekNum} Scenario: A GeoAI team in Khon Kaen faces conflicting accuracy vs. spatial generalization constraints. Which approach is most appropriate?`,
            th: `โจทย์สถานการณ์สัปดาห์ที่ ${nextWeekNum}: ทีมพัฒนาระบบ GeoAI ในขอนแก่นพบปัญหาความแม่นยำขัดแย้งกับความสามารถในการนำไปใช้ข้ามพื้นที่ ทีมควรตัดสินใจอย่างไร?`
          },
          options: [
            { key: 'A', en: 'Option A: Standard baseline with random split', th: 'ตัวเลือก A: วิธีพื้นฐานโดยสุ่มแบ่งข้อมูลแบบทั่วไป' },
            { key: 'B', en: 'Option B: Spatial Block Validation + Domain Adaptation', th: 'ตัวเลือก B: แบ่งข้อมูลตามบล็อกเชิงพื้นที่ร่วมกับการปรับโดเมน' },
            { key: 'C', en: 'Option C: Physics-informed auxiliary terrain fusion', th: 'ตัวเลือก C: ผสานข้อมูลภูมิประเทศและกฎทางกายภาพเข้ากับโมเดล' },
            { key: 'D', en: 'Option D: Uncalibrated threshold rules', th: 'ตัวเลือก D: ใช้เกณฑ์วัดค่าคงที่โดยไม่ปรับแก้' }
          ],
          correct: 'B',
          secondaryStars: ['C'],
          isControversial: true,
          iratClassPct: 62,
          rationale: {
            en: 'Both B and C address spatial generalization from complementary angles.',
            th: 'ทั้งตัวเลือก B และ C ช่วยแก้ปัญหาการนำไปใช้ข้ามพื้นที่ในมุมที่เสริมกัน'
          }
        }
      ],
      applicationCase: {
        title: {
          en: `Week ${nextWeekNum} 4S Application Exercise`,
          th: `โจทย์ประยุกต์ 4S ประจำสัปดาห์ที่ ${nextWeekNum}`
        },
        scenario: {
          en: 'All teams receive the exact same significant spatial problem and raise their chosen card (A/B/C/D) simultaneously.',
          th: 'ทุกทีมได้รับโจทย์ปัญหาสำคัญเดียวกันและชูป้ายตัวเลือก (A/B/C/D) พร้อมกัน'
        },
        specificChoices: [
          {
            id: 'choice-A',
            label: { en: 'Option A: High-Resolution Optical Pipeline', th: 'ตัวเลือก A: ระบบวิเคราะห์ภาพถ่ายดาวเทียมช่วงคลื่นแสง' },
            summary: { en: 'Prioritize spatial detail under clear-sky conditions.', th: 'เน้นความคมชัดเชิงพื้นที่เมื่อท้องฟ้าเปิด' }
          },
          {
            id: 'choice-B',
            label: { en: 'Option B: Multi-Modal SAR + Terrain GeoAI Pipeline', th: 'ตัวเลือก B: ระบบหลอมรวมเรดาร์ SAR และข้อมูลภูมิประเทศ' },
            summary: { en: 'All-weather resilience with spatial block validation.', th: 'ทนทานต่อสภาพอากาศพร้อมตรวจสอบด้วย Spatial Block CV' }
          }
        ],
        recommendedChoice: 'choice-B',
        spatialZones: [
          {
            id: `zone-${Date.now()}-1`,
            name: { en: 'Zone 1: KKU & Mueang Khon Kaen Core', th: 'โซน 1: มหาวิทยาลัยขอนแก่น และเขตเมือง' },
            coords: [16.462, 102.825],
            radius: 3200,
            risk: 'High',
            color: '#dc2626',
            sarVvDb: '-14.2 dB',
            handMeters: '2.1 m',
            cloudPct: '85%',
            notes: {
              en: 'Primary study area for this week’s 4S application case.',
              th: 'พื้นที่ศึกษาหลักสำหรับโจทย์ประยุกต์ประจำสัปดาห์นี้'
            }
          }
        ],
        otherTeamsResponses: [
          {
            teamId: 'team-ubonrat',
            teamName: 'Team 2: Ubol Ratana Vision',
            choiceId: 'choice-B',
            rationale: 'We raised Card B because all-weather SAR + terrain constraints are critical.'
          }
        ]
      }
    };

    setModules((prev) => {
      const next = [...prev, newWeek];
      pushToServer({ modules: next }, 'replace');
      return next;
    });
    setSelectedModuleId(newId);
  };

  const handleDuplicateWeek = (modId) => {
    const orig = classModules.find((m) => m.id === modId);
    if (!orig) return;
    const nextWeekNum = classModules.length + 1;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = `week-${nextWeekNum}-${Date.now()}`;
    copy.classId = selectedClassId;
    copy.weekNumber = nextWeekNum;
    copy.code = `Week ${nextWeekNum}`;
    copy.title.en = `${orig.title.en} (Copy)`;
    copy.title.th = `${orig.title.th} (สำเนา)`;
    setModules((prev) => {
      const next = [...prev, copy];
      pushToServer({ modules: next }, 'replace');
      return next;
    });
    setSelectedModuleId(copy.id);
  };

  const handleDeleteWeek = (modId) => {
    if (classModules.length <= 1) return;
    const filteredAll = modules.filter((m) => m.id !== modId);
    setModules(filteredAll);
    pushToServer({ modules: filteredAll }, 'replace');
    if (selectedModuleId === modId) {
      const nextForClass = classModules.filter((m) => m.id !== modId);
      if (nextForClass[0]?.id) setSelectedModuleId(nextForClass[0].id);
    }
  };

  // ================= STUDENT iRAT & tRAT LOGIC =================
  const isOptionAcceptableStar = (q, optKey) => {
    return q.correct === optKey || (q.secondaryStars || []).includes(optKey);
  };

  const updateCurrentStudentIrat = (updater) => {
    if (!activeStudent) return;
    setIratRecordsByMod((prev) => {
      const modMap = { ...(prev[currentModule.id] || {}) };
      const curRec = modMap[activeStudent.id] || { allocations: {}, submitted: false };
      const updatedRec = updater(curRec);
      modMap[activeStudent.id] = updatedRec;
      pushToServer(
        {
          iratRecordsByMod: {
            [currentModule.id]: { [activeStudent.id]: updatedRec }
          }
        },
        'merge'
      );
      return { ...prev, [currentModule.id]: modMap };
    });
  };

  // Simple 1-click option pick for iRAT
  const handleIratSelectOption = (qId, optKey) => {
    if (iratSubmitted) return;
    updateCurrentStudentIrat((curRec) => ({
      ...curRec,
      allocations: {
        ...(curRec.allocations || {}),
        [qId]: { A: 0, B: 0, C: 0, D: 0, [optKey]: 4 }
      }
    }));
  };

  const iratScoreSummary = useMemo(() => {
    const maxPts = currentModule.questions.length * 4;
    let earned = 0;
    currentModule.questions.forEach((q) => {
      const alloc = iratAllocations[q.id] || {};
      const validKeys = [q.correct, ...(q.secondaryStars || [])];
      validKeys.forEach((k) => {
        earned += alloc[k] || 0;
      });
    });
    const pct = maxPts > 0 ? Math.round((earned / maxPts) * 100) : 0;
    return { earned, maxPts, pct };
  }, [currentModule, iratAllocations]);

  const getStudentIratScoreForModule = (modObj, studentId) => {
    if (!modObj) return null;
    const rec = iratRecordsByMod[modObj.id]?.[studentId];
    if (!rec) return null;
    const maxPts = modObj.questions.length * 4;
    let earned = 0;
    modObj.questions.forEach((q) => {
      const alloc = rec.allocations?.[q.id] || {};
      const validKeys = [q.correct, ...(q.secondaryStars || [])];
      validKeys.forEach((k) => {
        earned += alloc[k] || 0;
      });
    });
    const pct = maxPts > 0 ? Math.round((earned / maxPts) * 100) : 0;
    return { earned, maxPts, pct, submitted: !!rec.submitted };
  };

  const getStudentIratScore = (studentId) =>
    getStudentIratScoreForModule(currentModule, studentId);

  // Current team's tRAT scratches for the active module
  const tratScratches = useMemo(
    () => tratScratchesByMod[currentModule.id]?.[currentTeam.id] || {},
    [tratScratchesByMod, currentModule.id, currentTeam.id]
  );

  // Scratch a tRAT IF-AT option (ONLY the Team Leader can pick answers)
  const handleScratch = (q, optKey) => {
    if (!isCurrentUserTeamRep) return;
    setTratScratchesByMod((prev) => {
      const modTeams = { ...(prev[currentModule.id] || {}) };
      const teamScratches = { ...(modTeams[currentTeam.id] || {}) };
      const scratched = teamScratches[q.id] || [];
      const alreadyFoundStar = scratched.some((k) => isOptionAcceptableStar(q, k));
      if (scratched.includes(optKey) || alreadyFoundStar) {
        return prev;
      }
      const nextList = [...scratched, optKey];
      teamScratches[q.id] = nextList;
      modTeams[currentTeam.id] = teamScratches;
      pushToServer(
        {
          tratScratchesByMod: {
            [currentModule.id]: {
              [currentTeam.id]: { [q.id]: nextList }
            }
          }
        },
        'merge'
      );
      return {
        ...prev,
        [currentModule.id]: modTeams
      };
    });
  };

  const getQuestionTratScore = (q, customScratches = tratScratches) => {
    const scratched = customScratches[q.id] || [];
    const starIndex = scratched.findIndex((k) => isOptionAcceptableStar(q, k));
    if (starIndex === -1) return { resolved: false, pts: 0, tries: scratched.length };
    const ptsMap = [4, 2, 1, 0];
    return {
      resolved: true,
      pts: ptsMap[starIndex] ?? 0,
      tries: starIndex + 1
    };
  };

  const getTeamTratSummaryForModule = (modObj, teamId) => {
    if (!modObj) return { earned: 0, maxPts: 0, pct: 0, resolvedCount: 0 };
    const teamScratches = tratScratchesByMod[modObj.id]?.[teamId] || {};
    const maxPts = modObj.questions.length * 4;
    let earned = 0;
    let resolvedCount = 0;
    modObj.questions.forEach((q) => {
      const res = getQuestionTratScore(q, teamScratches);
      earned += res.pts;
      if (res.resolved) resolvedCount += 1;
    });
    const pct = maxPts > 0 ? Math.round((earned / maxPts) * 100) : 0;
    return { earned, maxPts, pct, resolvedCount };
  };

  const tratTotalSummary = useMemo(
    () => getTeamTratSummaryForModule(currentModule, currentTeam.id),
    [currentModule, currentTeam.id, tratScratchesByMod]
  );

  const handleClearAllSessionData = () => {
    setRoster([]);
    setWeeklyCheckins({});
    setTeamRepByMod({});
    setIratRecordsByMod({});
    setPeerEvalsByMod({});
    setTratScratchesByMod({});
    setStickersByMod({});
    setActiveStudent(null);
    pushToServer(
      {
        weeklyCheckins: {},
        teamRepByMod: {},
        iratRecordsByMod: {},
        peerEvalsByMod: {},
        tratScratchesByMod: {},
        stickersByMod: {}
      },
      'replace'
    );
  };

  // Poll MySQL Server (./api.php) every 2.5 seconds so all student phones and instructor screens stay in sync live
  useEffect(() => {
    let isMounted = true;
    const syncFromServer = async () => {
      try {
        const res = await fetch('./api.php');
        if (!res.ok) {
          if (isMounted) setServerSyncStatus('local');
          return;
        }
        const data = await res.json();
        if (!data?.ok || !data.state) return;
        if (isMounted) setServerSyncStatus('live');
        const st = data.state;

        if (Array.isArray(st.classes) && st.classes.length > 0) {
          setClasses(st.classes);
        }
        if (Array.isArray(st.modules) && st.modules.length > 0) {
          setModules(st.modules);
        }
        if (st.rostersByClass && typeof st.rostersByClass === 'object') {
          setRostersByClass(st.rostersByClass);
        }
        if (st.weeklyCheckins && typeof st.weeklyCheckins === 'object') {
          setWeeklyCheckins(st.weeklyCheckins);
        }
        if (st.teamRepByMod && typeof st.teamRepByMod === 'object') {
          setTeamRepByMod(st.teamRepByMod);
        }
        if (st.iratRecordsByMod && typeof st.iratRecordsByMod === 'object') {
          setIratRecordsByMod(st.iratRecordsByMod);
        }
        if (st.tratScratchesByMod && typeof st.tratScratchesByMod === 'object') {
          setTratScratchesByMod(st.tratScratchesByMod);
        }
        if (st.peerEvalsByMod && typeof st.peerEvalsByMod === 'object') {
          setPeerEvalsByMod(st.peerEvalsByMod);
        }
        if (st.teamCaseChoiceByMod && typeof st.teamCaseChoiceByMod === 'object') {
          setTeamCaseChoiceByMod(st.teamCaseChoiceByMod);
        }
        if (st.teamCaseRationaleByMod && typeof st.teamCaseRationaleByMod === 'object') {
          setTeamCaseRationaleByMod(st.teamCaseRationaleByMod);
        }
        if (st.stickersByMod && typeof st.stickersByMod === 'object') {
          setStickersByMod(st.stickersByMod);
        }
        if (Array.isArray(st.unlockedSteps)) {
          setUnlockedSteps(st.unlockedSteps);
        }
        if (typeof st.simultaneousReveal === 'boolean') {
          setSimultaneousReveal(st.simultaneousReveal);
        }
        if (typeof st.revealExpertAnswer === 'boolean') {
          setRevealExpertAnswer(st.revealExpertAnswer);
        }
        // Sync Instructor's active Class & Week to students so everyone is on the exact same session
        if (role === 'student') {
          if (st.activeClassId) {
            setSelectedClassId(st.activeClassId);
          }
          if (st.activeModuleId) {
            setSelectedModuleId(st.activeModuleId);
          }
        }
      } catch (e) {
        if (isMounted) setServerSyncStatus('local');
      }
    };

    syncFromServer();
    const timer = setInterval(syncFromServer, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // If in Student mode and not signed in yet, show the Ultra-Simple Student Check-In & Random Team Landing Page
  if (role === 'student' && !activeStudent) {
    return (
      <StudentLanding
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'th' : 'en')}
        classes={classes}
        selectedClassId={selectedClassId}
        onSelectClassId={setSelectedClassId}
        classInfo={classInfo}
        currentModule={currentModule}
        classModules={classModules}
        selectedModuleId={selectedModuleId}
        onSelectModuleId={setSelectedModuleId}
        teams={activeTeams}
        roster={roster}
        onUpdateRoster={setRoster}
        weeklyCheckins={weeklyCheckins}
        teamRepByMod={teamRepByMod}
        onRandomAssignStudent={handleRandomAssignStudent}
        onEnterClassroom={handleEnterClassroom}
        onOpenInstructorPortal={() => setRole('instructor')}
        onOpenAdminPortal={() => setRole('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* LAYER 1: GLOBAL PLATFORM HEADER (Responsive for iPad Portrait & Mobile) */}
      <header className="bg-slate-950/95 backdrop-blur-md text-white border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-[4rem] py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Platform Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="./logo.png"
              alt="TBL Studio"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain select-none"
            />
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline-block px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] font-bold text-amber-300 tracking-wider">
                nattapon.io
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  serverSyncStatus === 'live'
                    ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={
                  serverSyncStatus === 'live'
                    ? 'Connected to MySQL Database (nattapon_tbl) — All devices sync in real time'
                    : 'Local Browser Mode'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    serverSyncStatus === 'live'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {serverSyncStatus === 'live' ? 'Live DB' : 'Local'}
                </span>
              </span>
            </div>
          </div>

          {/* Right Global Controls: Active Student Badge / Role Switch / Language */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {role === 'student' && activeStudent && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs shadow-inner">
                {isCurrentUserTeamRep && (
                  <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3" /> Leader
                  </span>
                )}
                <span className="font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[180px]">
                  {activeStudent.name}
                </span>
                <span className="font-mono text-amber-300 hidden xl:inline font-semibold">
                  ({activeStudent.id})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStudent(null)}
                  className="ml-0.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-200 border border-slate-700 hover:border-rose-400/30 text-[11px] font-bold text-slate-300 flex items-center gap-1 transition"
                  title="Switch Student ID"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {lang === 'en' ? 'Switch ID' : 'สลับรหัส'}
                  </span>
                </button>
              </div>
            )}

            {/* Hide Instructor & Admin buttons when a student is actively taking a quiz unless already in instructor/admin mode, or collapse them to compact icons on iPad portrait */}
            {(!activeStudent || role !== 'student') && (
              <>
                <button
                  type="button"
                  onClick={() => setRole(role === 'instructor' ? 'student' : 'instructor')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition shadow-sm ${
                    role === 'instructor'
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 font-extrabold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {role === 'instructor'
                      ? lang === 'en'
                        ? 'Exit Instructor'
                        : 'ออกโหมดอาจารย์'
                      : lang === 'en'
                      ? 'Instructor'
                      : 'อาจารย์'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole(role === 'admin' ? 'student' : 'admin')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition shadow-sm ${
                    role === 'admin'
                      ? 'bg-indigo-500 hover:bg-indigo-400 text-white border-indigo-400 font-extrabold'
                      : 'bg-slate-900 hover:bg-slate-800 text-indigo-200 border-slate-700'
                  }`}
                  title="System Admin Portal"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">
                    {role === 'admin'
                      ? lang === 'en'
                        ? 'Exit Admin'
                        : 'ออก Admin'
                      : lang === 'en'
                      ? 'Admin'
                      : 'ผู้ดูแลระบบ'}
                  </span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
              className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1 transition"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* LAYER 2: COURSE & WEEKLY LESSON CONTEXT SUB-BAR (ONLY SHOWN FOR STUDENTS IN CLASS) */}
      {role === 'student' && (
        <div className="bg-gradient-to-r from-slate-900 via-kku-dark to-kku-terracotta text-white border-b border-white/10 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Course & Teacher Context */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Multi-Teacher Course Switcher */}
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/15 transition">
                <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-white text-xs font-extrabold focus:outline-none cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                      {cls.courseCode}: {cls.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-amber-100/95 flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg bg-black/20 border border-white/10">
                <User className="w-3.5 h-3.5 text-amber-300" />
                {classInfo.instructorName || 'Course Instructor'} • {classInfo.semester}
              </span>
            </div>

            {/* Active Week / Topic Selector */}
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/15 transition">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-[11px] font-extrabold text-amber-200 uppercase tracking-wider">
                {lang === 'en' ? 'Module:' : 'บทเรียน:'}
              </span>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[260px] sm:max-w-md truncate"
              >
                {classModules.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.code} — {m.title[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ELEVATED 4-STEP PROGRESS WIZARD & TEAM HUB FOR STUDENTS */}
      {role === 'student' && (
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
            {/* Random Teammates & Live Session Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 px-4 py-2.5 rounded-2xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-kku-terracotta/10 border border-kku-terracotta/20 font-extrabold text-kku-terracotta text-xs sm:text-sm">
                  <Users className="w-4 h-4" />
                  {lang === 'en' ? currentTeam.name : currentTeam.thName}
                </span>
                {currentTeamMembers.map((m) => {
                  const isMe = activeStudent?.id === m.id;
                  const isLeader = currentTeamRepId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveStudent({ ...m, teamId: currentTeam.id })}
                      className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 border transition text-xs sm:text-sm ${
                        isMe
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/15'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isLeader && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{m.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                {(stickersByMod[currentModule.id]?.[activeStudent?.id] || 0) > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-extrabold shadow-sm flex items-center gap-1 animate-bounce">
                    🌟 x{stickersByMod[currentModule.id]?.[activeStudent?.id]}{' '}
                    {lang === 'en' ? 'Stickers!' : 'ดาวอภิปราย!'}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                  iRAT:{' '}
                  <strong className="text-kku-terracotta">
                    {iratSubmitted ? `${iratScoreSummary.pct}%` : 'In Progress'}
                  </strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                  Team tRAT: <strong className="text-amber-600">{tratTotalSummary.pct}%</strong>
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg border ${
                    peerSubmitted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Peer Eval:{' '}
                  <strong>
                    {peerSubmitted
                      ? lang === 'en'
                        ? 'Submitted ✓'
                        : 'ส่งแล้ว ✓'
                      : lang === 'en'
                      ? 'Pending'
                      : 'รอประเมิน'}
                  </strong>
                </span>
              </div>
            </div>

            {/* 4 Numbered Step Wizard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {t.steps.map((st, idx) => {
                const Icon = STEP_ICONS[idx];
                const isUnlocked = unlockedSteps.includes(st.id);
                const isActive = activeStep === st.id;
                const isCompleted =
                  (st.id === 1 && iratSubmitted) ||
                  (st.id === 2 &&
                    tratTotalSummary.resolvedCount === currentModule.questions.length) ||
                  (st.id === 4 && peerSubmitted);

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveStep(st.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-gradient-to-br from-kku-terracotta to-kku-dark text-white border-kku-terracotta shadow-lg shadow-kku-terracotta/20 -translate-y-0.5'
                        : isUnlocked
                        ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm'
                        : 'bg-slate-100/80 text-slate-400 border-slate-200 opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs transition ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/25'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        {isCompleted && !isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <div
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            isActive ? 'text-amber-200' : 'text-slate-400'
                          }`}
                        >
                          Step 0{st.id}
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold truncate">
                          {st.short.replace(/^\d+\.\s*/, '')}
                        </div>
                      </div>
                    </div>
                    {!isUnlocked && <Lock className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {role === 'admin' ? (
          <AdminPortal
            lang={lang}
            isAdminAuthed={isAdminAuthed}
            onSetAdminAuthed={setIsAdminAuthed}
            classes={classes}
            onUpdateClass={handleAdminUpdateClass}
            onCreateClass={handleAdminCreateClass}
            onDeleteClass={handleAdminDeleteClass}
            rostersByClass={rostersByClass}
            modules={modules}
            onOpenClassAsInstructor={(clsId) => {
              setSelectedClassId(clsId);
              setIsInstructorAuthed(true);
              setRole('instructor');
            }}
            onSwitchToStudentView={() => setRole('student')}
          />
        ) : role === 'instructor' ? (
          <InstructorPortal
            lang={lang}
            isInstructorAuthed={isInstructorAuthed}
            onSetInstructorAuthed={setIsInstructorAuthed}
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            classInfo={classInfo}
            onUpdateClassInfo={handleUpdateClassInfo}
            modules={classModules}
            selectedModuleId={currentModule.id}
            onSelectModuleId={setSelectedModuleId}
            onSaveModule={(updatedMod) =>
              handleSaveModule({ ...updatedMod, classId: selectedClassId })
            }
            onAddNewWeek={handleAddNewWeek}
            onDuplicateWeek={handleDuplicateWeek}
            onDeleteWeek={handleDeleteWeek}
            onImportModules={(imported) => {
              const tagged = imported.map((m) => ({
                ...m,
                classId: selectedClassId
              }));
              setModules((prev) => [
                ...prev.filter((m) => (m.classId || classes[0]?.id) !== selectedClassId),
                ...tagged
              ]);
              setSelectedModuleId(tagged[0].id);
            }}
            teams={activeTeams}
            roster={roster}
            onUpdateRoster={setRoster}
            weeklyCheckins={weeklyCheckins}
            onReshuffleAllRandomTeams={handleReshuffleAllRandomTeams}
            teamRepByMod={teamRepByMod}
            onSetTeamRep={handleSetTeamRep}
            getStudentIratScore={getStudentIratScore}
            getStudentIratScoreForModule={getStudentIratScoreForModule}
            getStudentPeerScore={getStudentPeerScore}
            getStudentPeerScoreForModule={getStudentPeerScoreForModule}
            getTeamTratSummaryForModule={getTeamTratSummaryForModule}
            tratTotalSummary={tratTotalSummary}
            teamCaseChoiceByMod={teamCaseChoiceByMod}
            teamCaseRationaleByMod={teamCaseRationaleByMod}
            stickersByMod={stickersByMod}
            onAdjustStudentSticker={handleAdjustStudentSticker}
            formatLast4Id={formatLast4Id}
            simultaneousReveal={simultaneousReveal}
            onToggleSimultaneousReveal={() => {
              const next = !simultaneousReveal;
              setSimultaneousReveal(next);
              if (!next) setRevealExpertAnswer(false);
              pushToServer(
                {
                  simultaneousReveal: next,
                  ...(next ? {} : { revealExpertAnswer: false })
                },
                'replace'
              );
            }}
            revealExpertAnswer={revealExpertAnswer}
            onToggleRevealExpertAnswer={() => {
              const next = !revealExpertAnswer;
              setRevealExpertAnswer(next);
              pushToServer({ revealExpertAnswer: next }, 'replace');
            }}
            unlockedSteps={unlockedSteps}
            onSetUnlockedSteps={(updater) => {
              setUnlockedSteps((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;
                pushToServer({ unlockedSteps: next }, 'replace');
                return next;
              });
            }}
            onClearAllSessionData={handleClearAllSessionData}
            onSwitchToStudentView={() => setRole('student')}
            onOpenAdminPortal={() => setRole('admin')}
          />
        ) : !unlockedSteps.includes(activeStep) ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto my-8 shadow-sm">
            <Lock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-slate-900">{t.lockedStep}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'en'
                ? 'Please wait for your instructor to unlock this step on the main stage.'
                : 'กรุณารออาจารย์ผู้สอนปลดล็อกขั้นตอนนี้บนหน้าจอหลัก'}
            </p>
          </div>
        ) : (
          /* ================= ULTRA-SIMPLE 4-STEP STUDENT WIZARD ================= */
          <div className="max-w-5xl mx-auto space-y-6">
            {/* STEP 1: SIMPLE SINGLE-CHOICE iRAT */}
            {activeStep === 1 && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-extrabold uppercase text-kku-terracotta">
                      Step 1 of 4 • Individual Quiz (iRAT)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {lang === 'en'
                        ? 'Tap One Answer (A, B, C, or D) for Each Question'
                        : 'เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว (A, B, C หรือ D)'}
                    </h2>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-sm font-bold text-slate-800">
                    {activeStudent?.name} ({activeStudent?.id})
                  </span>
                </div>

                <div className="space-y-5">
                  {currentModule.questions.map((q, idx) => {
                    const alloc = iratAllocations[q.id] || {};
                    const pickedKey = Object.keys(alloc).find((k) => alloc[k] > 0);

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
                      >
                        <div className="flex gap-3.5">
                          <span className="w-8 h-8 rounded-xl bg-kku-terracotta text-white font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                            {q.stem[lang]}
                          </p>
                        </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                          {q.options.map((opt) => {
                            const isSelected = pickedKey === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                disabled={iratSubmitted}
                                onClick={() => handleIratSelectOption(q.id, opt.key)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 active:scale-[0.99] ${
                                  isSelected
                                    ? 'bg-kku-light border-kku-terracotta ring-4 ring-kku-terracotta/15 shadow-sm'
                                    : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <span
                                  className={`w-9 h-9 rounded-xl text-sm font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                                    isSelected
                                      ? 'bg-kku-terracotta text-white'
                                      : 'bg-white border border-slate-300 text-slate-800'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                                  {opt[lang]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Bar */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                  {iratSubmitted ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <div>
                          <div className="text-xs text-emerald-300 font-bold">
                            {lang === 'en' ? 'iRAT Recorded!' : 'บันทึกคะแนน iRAT แล้ว!'}
                          </div>
                          <div className="text-base font-extrabold">
                            Score: {iratScoreSummary.earned}/{iratScoreSummary.maxPts} ({iratScoreSummary.pct}%)
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-2"
                      >
                        {lang === 'en' ? 'Continue to Step 2: Team tRAT' : 'ไปขั้นตอนที่ 2: สอบทีม tRAT'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-300">
                        {lang === 'en'
                          ? 'Answer all questions above, then submit your individual score.'
                          : 'เลือกคำตอบให้ครบทุกข้อแล้วกดส่งคะแนนรายบุคคล'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentStudentIrat((curRec) => ({
                            ...curRec,
                            submitted: true
                          }))
                        }
                        className="px-6 py-3 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-xs"
                      >
                        {t.irat.submitBtn}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: TEAM tRAT (ONLY TEAM LEADER PICKS ANSWERS) */}
            {activeStep === 2 && (
              <div className="space-y-5">
                {/* Team Leader Role Banner */}
                <div
                  className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                    isCurrentUserTeamRep
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Crown
                      className={`w-5 h-5 shrink-0 ${
                        isCurrentUserTeamRep ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <div className="font-extrabold text-sm">
                        {isCurrentUserTeamRep
                          ? lang === 'en'
                            ? `You are the Team Leader (${activeStudent?.name}) — Pick the scratch answers for your team!`
                            : `คุณคือหัวหน้ากลุ่ม (${activeStudent?.name}) — คลิกขูดเลือกคำตอบให้ทีมได้เลย!`
                          : lang === 'en'
                          ? `Discuss with your team! Only Team Leader (${currentTeamRepObj?.name}) can pick answers.`
                          : `ร่วมอภิปรายกับเพื่อน! เฉพาะหัวหน้ากลุ่ม (${currentTeamRepObj?.name}) เท่านั้นที่กดขูดคำตอบ`}
                      </div>
                    </div>
                  </div>

                  {!isCurrentUserTeamRep && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetTeamRep(currentModule.id, currentTeam.id, activeStudent.id)
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs"
                    >
                      {lang === 'en' ? 'Take Over as Team Leader' : 'เปลี่ยนฉันเป็นหัวหน้ากลุ่ม'}
                    </button>
                  )}
                </div>

                {/* Scratch Questions */}
                <div className="space-y-5">
                  {currentModule.questions.map((q, idx) => {
                    const scratched = tratScratches[q.id] || [];
                    const status = getQuestionTratScore(q);

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3.5">
                            <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                              {q.stem[lang]}
                            </p>
                          </div>
                          {status.resolved && (
                            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm shrink-0">
                              ★ +{status.pts} pts
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                          {q.options.map((opt) => {
                            const isScratched = scratched.includes(opt.key);
                            const isStar = isOptionAcceptableStar(q, opt.key);

                            return (
                              <div
                                key={opt.key}
                                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                                  isScratched && isStar
                                    ? 'bg-emerald-50 border-emerald-400'
                                    : isScratched
                                    ? 'bg-rose-50/50 border-rose-200 opacity-70'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-sm font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                    {opt.key}
                                  </span>
                                  <span className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                                    {opt[lang]}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  disabled={isScratched || status.resolved || !isCurrentUserTeamRep}
                                  onClick={() => handleScratch(q, opt.key)}
                                  className={`w-full sm:w-32 h-12 rounded-xl shrink-0 font-extrabold text-sm flex items-center justify-center gap-1 active:scale-95 transition ${
                                    !isScratched
                                      ? isCurrentUserTeamRep
                                        ? 'scratch-foil text-slate-900 cursor-pointer'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                      : isStar
                                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                                      : 'bg-slate-200 text-rose-700'
                                  }`}
                                >
                                  {!isScratched ? (
                                    <span className="text-xs bg-white/85 px-2.5 py-0.5 rounded-md shadow-sm">
                                      {isCurrentUserTeamRep ? 'SCRATCH' : '🔒 LEADER'}
                                    </span>
                                  ) : isStar ? (
                                    <span>★ STAR</span>
                                  ) : (
                                    <span className="line-through">Empty</span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {status.resolved && (
                          <div className="p-4 rounded-xl bg-emerald-950 text-emerald-100 text-sm leading-relaxed">
                            <strong className="text-amber-300">★ Explanation: </strong>
                            {q.rationale[lang]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
                  <div className="text-sm font-extrabold">
                    Team tRAT Score: {tratTotalSummary.earned}/{tratTotalSummary.maxPts} ({tratTotalSummary.pct}%)
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-2"
                  >
                    {lang === 'en' ? 'Continue to Step 3: 4S Case' : 'ไปขั้นตอนที่ 3: โจทย์ประยุกต์ 4S'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 4S CASE CARD RAISE (TEAM LEADER PICKS CARD + CROSS-TEAM DISCUSSION BOARD) */}
            {activeStep === 3 && (
              <div className="space-y-5">
                {/* Team Leader Role Banner for Step 3 */}
                <div
                  className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                    isCurrentUserTeamRep
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Crown
                      className={`w-5 h-5 shrink-0 ${
                        isCurrentUserTeamRep ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    />
                    <div className="font-extrabold text-sm">
                      {isCurrentUserTeamRep
                        ? lang === 'en'
                          ? `You are the Team Leader (${activeStudent?.name}) — Select your team’s 4S Decision Card (A/B/C/D) below!`
                          : `คุณคือหัวหน้ากลุ่ม (${activeStudent?.name}) — คลิกเลือกป้ายตัดสินใจ 4S (A/B/C/D) ของกลุ่มด้านล่าง!`
                        : lang === 'en'
                        ? `Discuss the spatial data together! Your Team Leader (${currentTeamRepObj?.name}) will lock your team’s 4S Card.`
                        : `ร่วมวิเคราะห์แผนที่และอภิปรายในกลุ่ม! เฉพาะหัวหน้ากลุ่ม (${currentTeamRepObj?.name}) เท่านั้นที่เป็นผู้กดเลือกป้ายคำตอบ 4S`}
                    </div>
                  </div>

                  {!isCurrentUserTeamRep && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetTeamRep(currentModule.id, currentTeam.id, activeStudent.id)
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs"
                    >
                      {lang === 'en' ? 'Take Over as Team Leader' : 'เปลี่ยนฉันเป็นหัวหน้ากลุ่ม'}
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <span className="text-sm font-extrabold uppercase text-kku-terracotta">
                      Step 3 of 4 • 4S Application Case (Significant • Same • Specific Choice • Simultaneous)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {currentModule.applicationCase.title[lang]}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                      {currentModule.applicationCase.scenario[lang]}
                    </p>
                  </div>

                  {/* Optional Weekly Case Figure / Diagram Image (Tap to Zoom on iPad) */}
                  {currentModule.applicationCase.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          setZoomedCaseImage({
                            url: currentModule.applicationCase.imageUrl,
                            title: currentModule.applicationCase.title[lang]
                          })
                        }
                        className="block w-full group relative cursor-zoom-in"
                      >
                        <img
                          src={currentModule.applicationCase.imageUrl}
                          alt={currentModule.applicationCase.title[lang]}
                          className="max-h-[420px] w-auto mx-auto rounded-xl object-contain transition group-hover:scale-[1.01]"
                        />
                        <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 text-amber-300 text-xs font-extrabold shadow">
                          🔍 {lang === 'en' ? 'Tap image to zoom full-screen on iPad' : 'แตะที่รูปภาพเพื่อขยายเต็มจอ (สำหรับดูตาราง/กราฟบน iPad)'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Optional Reference / Google Colab / Dataset Button */}
                  {currentModule.applicationCase.referenceUrl && (
                    <div>
                      <a
                        href={currentModule.applicationCase.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs shadow-sm transition"
                      >
                        <BookOpen className="w-4 h-4" />
                        {lang === 'en'
                          ? 'Open Weekly Case Dataset / Google Colab Notebook ↗'
                          : 'เปิดดูข้อมูลประกอบโจทย์ / Google Colab ประจำสัปดาห์นี้ ↗'}
                      </a>
                    </div>
                  )}
                </div>

                {currentModule.applicationCase.showMap !== false &&
                  Array.isArray(currentModule.applicationCase.spatialZones) &&
                  currentModule.applicationCase.spatialZones.length > 0 && (
                    <GeoAIMap
                      zones={currentModule.applicationCase.spatialZones}
                      lang={lang}
                      activeZoneId={activeZoneId}
                      onSelectZone={setActiveZoneId}
                    />
                  )}

                {/* Team Leader Specific Choice Card Selection */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      {lang === 'en'
                        ? `Team ${currentTeam.name.split(':')[0]} Decision Card (A, B, C, or D)`
                        : `เลือกแผ่นป้ายคำตอบของ ${currentTeam.thName.split(':')[0]} (A, B, C หรือ D)`}
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      {isCurrentUserTeamRep
                        ? lang === 'en'
                          ? '👑 Tap a card below to lock your team choice'
                          : '👑 คลิกเลือกป้ายคำตอบด้านล่างให้ทีมของคุณ'
                        : lang === 'en'
                        ? `🔒 Synced live with Team Leader (${currentTeamRepObj?.name})`
                        : `🔒 ซิงค์ตามที่หัวหน้ากลุ่ม (${currentTeamRepObj?.name}) เลือกแบบเรียลไทม์`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                    {currentModule.applicationCase.specificChoices.map((ch) => {
                      const selected = teamCaseChoice === ch.id;
                      const letter = ch.id.replace('choice-', '');
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          disabled={!isCurrentUserTeamRep}
                          onClick={() => {
                            if (!isCurrentUserTeamRep) return;
                            setTeamCaseChoiceByMod((prev) => {
                              const curModMap =
                                prev[currentModule.id] &&
                                typeof prev[currentModule.id] === 'object'
                                  ? prev[currentModule.id]
                                  : {};
                              const nextModMap = {
                                ...curModMap,
                                [currentTeam.id]: ch.id
                              };
                              const next = {
                                ...prev,
                                [currentModule.id]: nextModMap
                              };
                              pushToServer(
                                {
                                  teamCaseChoiceByMod: {
                                    [currentModule.id]: {
                                      [currentTeam.id]: ch.id
                                    }
                                  }
                                },
                                'merge'
                              );
                              return next;
                            });
                          }}
                          className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                            selected
                              ? 'bg-kku-light border-kku-terracotta ring-4 ring-kku-terracotta/15 shadow-sm'
                              : isCurrentUserTeamRep
                              ? 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                              : 'bg-slate-50/70 border-slate-200 opacity-80 cursor-not-allowed'
                          }`}
                        >
                          <div
                            className={`w-11 h-11 rounded-xl font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm ${
                              selected
                                ? 'bg-kku-terracotta text-white'
                                : 'bg-white border border-slate-300 text-slate-800'
                            }`}
                          >
                            {letter}
                          </div>
                          <div>
                            <div className="font-bold text-sm sm:text-base text-slate-900">
                              {ch.label[lang]}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                              {ch.summary[lang]}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Required 1-Line Team Justification ("Explain This" Habit) */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[11px]">
                          Explain This
                        </span>
                        {lang === 'en'
                          ? 'One-Line Team Justification (Required before locking your card)'
                          : 'เหตุผลสั้นๆ 1 บรรทัดของกลุ่ม (อธิบายว่าทำไมทีมจึงเลือกป้ายนี้ เพื่อใช้ดีเบตข้ามกลุ่ม)'}
                      </label>
                      {teamCaseChoice && teamCaseRationale.trim() && (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          {lang === 'en'
                            ? `✓ Card ${teamCaseChoice.replace('choice-', '')} + Reason Locked`
                            : `✓ บันทึกป้าย ${teamCaseChoice.replace('choice-', '')} และเหตุผลของทีมแล้ว`}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        disabled={!isCurrentUserTeamRep}
                        value={teamCaseRationale}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTeamCaseRationaleByMod((prev) => {
                            const curMod =
                              prev[currentModule.id] && typeof prev[currentModule.id] === 'object'
                                ? prev[currentModule.id]
                                : {};
                            const nextMod = { ...curMod, [currentTeam.id]: val };
                            return { ...prev, [currentModule.id]: nextMod };
                          });
                        }}
                        onBlur={() => {
                          if (!isCurrentUserTeamRep) return;
                          pushToServer(
                            {
                              teamCaseRationaleByMod: {
                                [currentModule.id]: {
                                  [currentTeam.id]: teamCaseRationale
                                }
                              }
                            },
                            'merge'
                          );
                        }}
                        placeholder={
                          lang === 'en'
                            ? 'e.g., Card B prevents spatial autocorrelation leakage while keeping SAR all-weather coverage...'
                            : 'พิมพ์เหตุผลสำคัญ 1 บรรทัดของกลุ่ม เช่น เลือกป้ายนี้เพราะแก้ปัญหาเมฆบังด้วย SAR และป้องกัน Spatial Leakage...'
                        }
                        className="flex-1 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-kku-terracotta disabled:opacity-75"
                      />
                      {isCurrentUserTeamRep && (
                        <button
                          type="button"
                          onClick={() => {
                            pushToServer(
                              {
                                teamCaseChoiceByMod: {
                                  [currentModule.id]: {
                                    [currentTeam.id]: teamCaseChoice
                                  }
                                },
                                teamCaseRationaleByMod: {
                                  [currentModule.id]: {
                                    [currentTeam.id]: teamCaseRationale
                                  }
                                }
                              },
                              'merge'
                            );
                          }}
                          className="px-4 py-2.5 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-xs shrink-0 shadow-sm transition"
                        >
                          {lang === 'en' ? 'Save Team Reason ✓' : 'บันทึกเหตุผลของกลุ่ม ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SIMULTANEOUS CROSS-TEAM REVEAL & WHOLE-CLASS DISCUSSION BOARD (BEFORE PEER EVAL) */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                        {lang === 'en'
                          ? '4th S: Simultaneous Report & Cross-Team Discussion'
                          : 'หลัก 4S ข้อที่ 4: เปิดป้ายพร้อมกันและอภิปรายข้ามกลุ่มทั้งชั้นเรียน'}
                      </span>
                      <h3 className="text-lg font-extrabold text-white mt-0.5">
                        {simultaneousReveal
                          ? lang === 'en'
                            ? 'All Team Cards Revealed! Discuss & Defend Across Teams'
                            : 'เปิดป้ายครบทุกกลุ่มแล้ว! ร่วมอภิปรายเหตุผลระหว่างกลุ่มก่อนไปประเมินเพื่อน'
                          : lang === 'en'
                          ? 'Waiting for All Teams to Lock Cards Before Instructor Reveals'
                          : 'รอทุกกลุ่มเลือกป้ายคำตอบ (อาจารย์จะกดเปิดป้ายพร้อมกันเพื่อเริ่มอภิปรายทั้งห้อง)'}
                      </h3>
                    </div>

                    <span
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                        simultaneousReveal
                          ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                          : 'bg-slate-800 border border-slate-700 text-amber-300'
                      }`}
                    >
                      {simultaneousReveal ? (
                        <>
                          <Eye className="w-4 h-4" />
                          {lang === 'en' ? 'Cards Revealed Live' : 'เปิดป้ายพร้อมกันแล้ว'}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {lang === 'en' ? 'Cards Hidden Until Reveal' : 'ซ่อนป้ายไว้จนกว่าจะเปิดพร้อมกัน'}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Choice Distribution Bar (Shown Once Simultaneous Reveal is Triggered) */}
                  {simultaneousReveal && (
                    <div className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                        {lang === 'en'
                          ? 'Class Choice Distribution (4S Simultaneous Report)'
                          : 'สรุปจำนวนกลุ่มที่เลือกแต่ละป้าย (ใช้ตั้งประเด็นถกเถียงข้ามกลุ่ม)'}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {currentModule.applicationCase.specificChoices.map((ch) => {
                          const letter = ch.id.replace('choice-', '');
                          const pickedTeams = activeTeams.filter(
                            (tm) =>
                              modCaseChoices &&
                              typeof modCaseChoices === 'object' &&
                              modCaseChoices[tm.id] === ch.id
                          );
                          const pct =
                            activeTeams.length > 0
                              ? Math.round((pickedTeams.length / activeTeams.length) * 100)
                              : 0;
                          const isBest =
                            revealExpertAnswer &&
                            currentModule.applicationCase.recommendedChoice === ch.id;
                          return (
                            <div
                              key={ch.id}
                              className={`p-3 rounded-xl border ${
                                isBest
                                  ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/30'
                                  : 'bg-slate-900 border-slate-800'
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
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                                <div
                                  className={`h-full rounded-full ${
                                    isBest ? 'bg-emerald-400' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grid of All Teams' Cards & 1-Line Justifications for Cross-Team Debate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeTeams.map((tm) => {
                      const isMyTeam = tm.id === currentTeam.id;
                      const tmChoice =
                        modCaseChoices && typeof modCaseChoices === 'object'
                          ? modCaseChoices[tm.id]
                          : null;
                      const tmReason =
                        teamCaseRationaleByMod[currentModule.id]?.[tm.id] || '';
                      const letter = tmChoice ? tmChoice.replace('choice-', '') : null;

                      return (
                        <div
                          key={tm.id}
                          className={`p-4 rounded-2xl border text-left space-y-2.5 flex flex-col justify-between ${
                            isMyTeam
                              ? 'bg-kku-terracotta/25 border-amber-400'
                              : 'bg-slate-800/90 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-extrabold text-slate-200 truncate">
                              {lang === 'en' ? tm.name.split(':')[0] : tm.thName.split(':')[0]}
                              {isMyTeam && (
                                <span className="ml-1 text-amber-300">
                                  ({lang === 'en' ? 'You' : 'ทีมเรา'})
                                </span>
                              )}
                            </div>

                            {simultaneousReveal || isMyTeam ? (
                              letter ? (
                                <span className="py-1 px-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs shadow">
                                  Card {letter}
                                </span>
                              ) : (
                                <span className="py-1 px-2.5 rounded-xl bg-slate-950/60 text-slate-400 font-bold text-[11px]">
                                  {lang === 'en' ? 'Choosing...' : 'กำลังเลือก...'}
                                </span>
                              )
                            ) : (
                              <span className="py-1 px-2.5 rounded-xl bg-slate-950/80 text-slate-300 font-bold text-[11px] flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-400" />
                                {tmChoice
                                  ? lang === 'en'
                                    ? 'Locked ✓'
                                    : 'เลือกแล้ว ✓'
                                  : lang === 'en'
                                  ? 'Thinking...'
                                  : 'กำลังปรึกษา...'}
                              </span>
                            )}
                          </div>

                          {/* Team's 1-Line Justification (Visible to own team or after Simultaneous Reveal) */}
                          {(simultaneousReveal || isMyTeam) && (
                            <div className="text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-xl border border-white/10 leading-relaxed">
                              {tmReason.trim() ? (
                                <>
                                  <span className="text-amber-300 font-bold mr-1">
                                    {lang === 'en' ? 'Reason:' : 'เหตุผล:'}
                                  </span>
                                  <span>“{tmReason}”</span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic">
                                  {lang === 'en'
                                    ? 'No 1-line justification entered yet.'
                                    : 'ยังไม่ได้ระบุเหตุผล 1 บรรทัด'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expert / Best Answer Reveal Banner (When Instructor Releases Expert Choice After Debate) */}
                  {simultaneousReveal && revealExpertAnswer && (
                    <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 space-y-1.5">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        {lang === 'en'
                          ? 'Instructor Expert Synthesis & Recommended Decision'
                          : 'เฉลยแนวทางที่เหมาะสมที่สุดโดยอาจารย์ผู้สอน (หลังจบการดีเบตข้ามกลุ่ม)'}
                      </div>
                      {(() => {
                        const recId = currentModule.applicationCase.recommendedChoice;
                        const recObj = currentModule.applicationCase.specificChoices.find(
                          (c) => c.id === recId
                        );
                        const recLetter = recId ? recId.replace('choice-', '') : '?';
                        return (
                          <div>
                            <div className="text-sm sm:text-base font-extrabold text-white">
                              ★ Card {recLetter}: {recObj ? recObj.label[lang] : recId}
                            </div>
                            {recObj && (
                              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5 leading-relaxed">
                                {recObj.summary[lang]}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Bottom Action to Advance to Step 4 Peer Evaluation After Class Discussion */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      {lang === 'en'
                        ? 'After the instructor reveals all cards and leads the cross-team discussion, continue to Step 4 (Peer Evaluation).'
                        : 'เมื่ออาจารย์เปิดป้ายครบทุกกลุ่มและอภิปรายแลกเปลี่ยนเหตุผลระหว่างกลุ่มเสร็จแล้ว ให้กดไปขั้นตอนที่ 4 (ประเมินเพื่อน)'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow"
                    >
                      {lang === 'en'
                        ? 'Finish Discussion & Go to Step 4: Peer Eval'
                        : 'จบการอภิปรายและไปขั้นตอนที่ 4: ประเมินเพื่อน'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SIMPLE 0-10 PEER EVALUATION & COMPLETION RECEIPT */}
            {activeStep === 4 && (
              <div className="space-y-5">
                {peerSubmitted ? (
                  /* ================= SIMPLE SCORE-FREE CLASS COMPLETION SCREEN ================= */
                  <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden max-w-2xl mx-auto my-4 text-center">
                    <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-10 space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/30 flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle2 className="w-10 h-10 text-amber-300" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-extrabold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        {classInfo.courseCode} • {currentModule.code}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold">
                        {lang === 'en'
                          ? 'TBL Activity Session Complete!'
                          : 'เสร็จสิ้นกิจกรรมช่วงการเรียนรู้แบบเป็นทีม (TBL) แล้ว!'}
                      </h2>
                      <p className="text-sm sm:text-base text-emerald-100 max-w-lg mx-auto leading-relaxed">
                        {lang === 'en'
                          ? 'Thank you for your teamwork! Your responses and peer evaluations have been confidentially recorded. Please await your instructor for the next part of class.'
                          : 'ขอบคุณสำหรับการมีส่วนร่วมและการทำงานเป็นทีม! ระบบได้บันทึกคำตอบและผลการประเมินแบบปกปิดเรียบร้อยแล้ว กรุณารอฟังคำชี้แจงจากอาจารย์สำหรับช่วงถัดไปของชั้นเรียน'}
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      {(stickersByMod[currentModule.id]?.[activeStudent?.id] || 0) > 0 && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 text-amber-950 inline-flex items-center gap-3 shadow-sm">
                          <span className="text-2xl">🌟</span>
                          <div className="text-left">
                            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                              {lang === 'en'
                                ? 'Class Discussion Sticker Award!'
                                : 'ได้รับสติกเกอร์ดาวการอภิปรายในชั้นเรียน!'}
                            </div>
                            <div className="text-base font-extrabold">
                              {lang === 'en'
                                ? `You earned ${stickersByMod[currentModule.id]?.[activeStudent?.id]} Discussion Sticker(s) today!`
                                : `วันนี้คุณได้รับสติกเกอร์ดาวการอภิปราย ${stickersByMod[currentModule.id]?.[activeStudent?.id]} ดวง!`}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-flex flex-wrap items-center justify-center gap-3 text-sm">
                          <span className="font-extrabold text-slate-900">
                            {activeStudent?.name}
                          </span>
                          <span className="font-mono text-kku-terracotta font-bold">
                            ({activeStudent?.id})
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-slate-700">
                            {lang === 'en' ? currentTeam.name : currentTeam.thName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateCurrentStudentPeerEval((curRec) => ({
                              ...curRec,
                              submitted: false
                            }))
                          }
                          className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                        >
                          {lang === 'en' ? '← Edit My Submission' : '← กลับไปแก้ไขการประเมิน'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveStudent(null)}
                          className="px-6 py-3 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-sm flex items-center gap-2 shadow"
                        >
                          <LogOut className="w-4 h-4" />
                          {lang === 'en'
                            ? 'Exit TBL Session'
                            : 'ออกจากช่วงกิจกรรม TBL'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-sm font-extrabold uppercase text-kku-terracotta">
                          Step 4 of 4 • Quick 0–10 Peer Evaluation
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                          {lang === 'en'
                            ? 'Rate Each Teammate Today from 0 to 10 (★)'
                            : 'ให้คะแนนเพื่อนร่วมทีมที่สุ่มได้ในวันนี้ (ระดับ 0 ถึง 10 ★)'}
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {currentTeamMembers.map((member, idx) => {
                        const currentScore = peerStarsByTarget[member.id] ?? 10;
                        return (
                          <div
                            key={member.id || idx}
                            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-extrabold text-base text-slate-900">
                                  {member.name}
                                </div>
                                <div className="text-xs font-mono text-kku-terracotta font-semibold">
                                  ID: {member.id}
                                </div>
                              </div>
                              <span className="px-3.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-base font-extrabold">
                                ★ {currentScore} / 10
                              </span>
                            </div>

                            {/* Interactive 0 to 10 Score Buttons (Touch-Friendly Minimum 42px Targets on iPad) */}
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                  const isSelected = num === currentScore;
                                  const isFilled = num <= currentScore && num > 0;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() =>
                                        updateCurrentStudentPeerEval((curRec) => ({
                                          ...curRec,
                                          starsByTargetId: {
                                            ...(curRec.starsByTargetId || {}),
                                            [member.id]: num
                                          }
                                        }))
                                      }
                                      className={`min-h-[42px] rounded-xl font-extrabold text-xs sm:text-sm transition active:scale-95 ${
                                        isSelected
                                          ? 'bg-kku-terracotta text-white shadow-md ring-2 ring-kku-terracotta/40 scale-105'
                                          : isFilled
                                          ? 'bg-amber-200 text-amber-950 hover:bg-amber-300'
                                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between text-[11px] font-bold text-slate-500 px-1">
                                <span>
                                  0 = {lang === 'en' ? 'Absent / No Contribution' : 'ไม่ร่วมงาน'}
                                </span>
                                <span>
                                  {currentScore >= 9
                                    ? lang === 'en'
                                      ? '9–10: Outstanding'
                                      : '9–10: ดีเยี่ยม'
                                    : currentScore >= 7
                                    ? lang === 'en'
                                      ? '7–8: Good Contribution'
                                      : '7–8: ดีมาก'
                                    : currentScore >= 5
                                    ? lang === 'en'
                                      ? '5–6: Moderate'
                                      : '5–6: ปานกลาง'
                                    : lang === 'en'
                                    ? '0–4: Needs Improvement'
                                    : '0–4: ควรปรับปรุง'}
                                </span>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={peerComments[member.id] || ''}
                              onChange={(e) =>
                                updateCurrentStudentPeerEval((curRec) => ({
                                  ...curRec,
                                  commentsByTargetId: {
                                    ...(curRec.commentsByTargetId || {}),
                                    [member.id]: e.target.value
                                  }
                                }))
                              }
                              placeholder={
                                lang === 'en'
                                  ? 'Optional short appreciation note...'
                                  : 'ข้อความชื่นชมเพื่อนสั้นๆ (ไม่บังคับ)...'
                              }
                              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                      <span className="text-sm text-slate-300">
                        {lang === 'en'
                          ? 'Tap a score (0–10) for each teammate above, then click Finish.'
                          : 'คลิกเลือกคะแนน (0–10) ให้เพื่อนแต่ละคนด้านบน แล้วกดส่งผลประเมิน'}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentStudentPeerEval((curRec) => ({
                            ...curRec,
                            submitted: true
                          }))
                        }
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow"
                      >
                        {lang === 'en' ? 'Submit & Complete TBL Activity ✓' : 'ส่งผลประเมินและจบกิจกรรม TBL ✓'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Platform Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-4 px-6 mt-auto">
        <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            © 2026 TBL Studio. A{' '}
            <strong className="text-kku-terracotta font-extrabold">nattapon.io</strong> project.
          </span>
          <span>iRAT • IF-AT Scratch tRAT • 4S Simultaneous Case • 0–10 Peer Rating</span>
        </div>
      </footer>

      {/* FULL-SCREEN IPAD TAP-TO-ZOOM DIAGRAM / CONFUSION MATRIX LIGHTBOX MODAL */}
      {zoomedCaseImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setZoomedCaseImage(null)}
        >
          <div
            className="max-w-6xl w-full flex items-center justify-between text-white mb-3 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-extrabold text-sm sm:text-base text-amber-300 truncate">
              {zoomedCaseImage.title}
            </div>
            <button
              type="button"
              onClick={() => setZoomedCaseImage(null)}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-rose-500/80 text-white font-extrabold text-xs transition"
            >
              {lang === 'en' ? '✕ Close Zoom' : '✕ ปิดภาพขยาย'}
            </button>
          </div>
          <div
            className="max-w-6xl max-h-[84vh] w-full overflow-auto rounded-2xl bg-slate-900 border border-white/15 p-3 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedCaseImage.url}
              alt={zoomedCaseImage.title}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
