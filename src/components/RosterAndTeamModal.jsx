import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Search,
  LogIn,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Plus,
  X
} from 'lucide-react';

export default function RosterAndTeamModal({
  isOpen,
  onClose,
  lang,
  currentModule,
  teams,
  roster,
  onUpdateRoster,
  weeklyCheckins, // { [moduleId]: { [teamId]: [{ id, name, section, checkedInAt }] } }
  onJoinWeeklyTeam,
  onRemoveFromWeeklyTeam,
  activeStudent, // { id, name, teamId }
  onSetActiveStudent,
  selectedTeamId,
  onSelectTeamId
}) {
  const [tab, setTab] = useState('checkin'); // 'checkin' | 'roster'
  const [studentIdInput, setStudentIdInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [targetTeamId, setTargetTeamId] = useState(selectedTeamId || teams[0]?.id);
  const [statusMsg, setStatusMsg] = useState(null);

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newSingleId, setNewSingleId] = useState('');
  const [newSingleName, setNewSingleName] = useState('');
  const [newSingleSec, setNewSingleSec] = useState('Sec 01');

  React.useEffect(() => {
    setTargetTeamId(selectedTeamId || teams[0]?.id);
  }, [selectedTeamId, teams]);

  // Live lookup of student ID from imported class roster
  const matchedStudent = useMemo(() => {
    const clean = studentIdInput.trim().toLowerCase();
    if (!clean) return null;
    return roster.find(
      (s) =>
        s.id.toLowerCase() === clean ||
        s.id.replace('-', '').toLowerCase() === clean.replace('-', '')
    );
  }, [studentIdInput, roster]);

  if (!isOpen) return null;

  const moduleCheckins = weeklyCheckins[currentModule.id] || {};

  // Handle Student ID Check-in to a Team for this Week
  const handleStudentJoin = (e) => {
    e.preventDefault();
    const trimmedId = studentIdInput.trim();
    if (!trimmedId) return;

    const studentObj = matchedStudent || {
      id: trimmedId,
      name: manualNameInput.trim() || (lang === 'en' ? `Student (${trimmedId})` : `นักศึกษา (${trimmedId})`),
      section: 'Sec 01'
    };

    // If not in master roster yet and manual name provided, add to master roster automatically
    if (!matchedStudent && manualNameInput.trim()) {
      onUpdateRoster([...roster, studentObj]);
    }

    onJoinWeeklyTeam(currentModule.id, targetTeamId, studentObj);
    onSelectTeamId(targetTeamId);
    onSetActiveStudent({ ...studentObj, teamId: targetTeamId });

    setStatusMsg({
      type: 'success',
      text:
        lang === 'en'
          ? `Checked in ${studentObj.name} (${studentObj.id}) to ${
              teams.find((t) => t.id === targetTeamId)?.name
            } for ${currentModule.code}!`
          : `ลงชื่อ ${studentObj.name} (${studentObj.id}) เข้าสู่ ${
              teams.find((t) => t.id === targetTeamId)?.thName
            } สำหรับ ${currentModule.code} เรียบร้อยแล้ว!`
    });
    setStudentIdInput('');
    setManualNameInput('');
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Parse CSV or pasted lines (supports: "653020101-2, Somchai Jaidee, Sec 01" or tab-separated from Excel)
  const parseRosterText = (rawText) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed = [];
    lines.forEach((line, idx) => {
      // Skip header row if detected
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
    if (parsed.length === 0) {
      setStatusMsg({
        type: 'error',
        text:
          lang === 'en'
            ? 'Could not parse any rows. Use format: StudentID, Full Name, Section (one per line).'
            : 'ไม่พบข้อมูลที่ถูกต้อง กรุณาใช้รูปแบบ: รหัสนักศึกษา, ชื่อ-นามสกุล, เซคชัน (1 คนต่อบรรทัด)'
      });
      return;
    }

    // Merge by ID (update existing or append new)
    const map = new Map(roster.map((s) => [s.id, s]));
    parsed.forEach((p) => map.set(p.id, p));
    const merged = Array.from(map.values());
    onUpdateRoster(merged);
    setBulkText('');
    setStatusMsg({
      type: 'success',
      text:
        lang === 'en'
          ? `Successfully imported/updated ${parsed.length} students into the class roster!`
          : `นำเข้า/อัปเดตรายชื่อนักศึกษาสำเร็จ ${parsed.length} คน!`
    });
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseRosterText(evt.target.result || '');
      if (parsed.length > 0) {
        const map = new Map(roster.map((s) => [s.id, s]));
        parsed.forEach((p) => map.set(p.id, p));
        onUpdateRoster(Array.from(map.values()));
        setStatusMsg({
          type: 'success',
          text:
            lang === 'en'
              ? `Imported ${parsed.length} students from ${file.name}!`
              : `นำเข้ารายชื่อนักศึกษา ${parsed.length} คนจากไฟล์ ${file.name} สำเร็จ!`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleAddSingleStudent = (e) => {
    e.preventDefault();
    if (!newSingleId.trim() || !newSingleName.trim()) return;
    const map = new Map(roster.map((s) => [s.id, s]));
    map.set(newSingleId.trim(), {
      id: newSingleId.trim(),
      name: newSingleName.trim(),
      section: newSingleSec.trim() || 'Sec 01'
    });
    onUpdateRoster(Array.from(map.values()));
    setNewSingleId('');
    setNewSingleName('');
  };

  const handleExportRosterCsv = () => {
    const rows = [
      ['Student_ID', 'Full_Name', 'Section', `${currentModule.code}_Assigned_Team`],
      ...roster.map((s) => {
        let foundTeamName = 'Not Checked In';
        teams.forEach((tm) => {
          const list = moduleCheckins[tm.id] || [];
          if (list.some((m) => m.id === s.id)) {
            foundTeamName = tm.name;
          }
        });
        return [s.id, `"${s.name}"`, s.section || 'Sec 01', `"${foundTeamName}"`];
      })
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csv));
    a.setAttribute('download', `KKU_GeoAI_Class_Roster_${currentModule.code.replace(' ', '_')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredRoster = roster.filter(
    (s) =>
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-kku-dark to-kku-terracotta text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 border border-white/20">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {currentModule.code} • Student ID & Team Check-In System
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold">
                {lang === 'en'
                  ? 'Weekly Team Join & Class Roster Manager'
                  : 'ระบบลงชื่อเข้ากลุ่มรายสัปดาห์ด้วยรหัสนักศึกษา และจัดการรายชื่อชั้นเรียน'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('checkin')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                tab === 'checkin'
                  ? 'bg-kku-terracotta text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              {lang === 'en'
                ? `1. Join Team by Student ID (${currentModule.code})`
                : `1. กรอกรหัสนักศึกษาเพื่อเข้าทีม (${currentModule.code})`}
            </button>

            <button
              type="button"
              onClick={() => setTab('roster')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                tab === 'roster'
                  ? 'bg-slate-900 text-amber-300 shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {lang === 'en'
                ? `2. Import / Manage Class Roster (${roster.length} Students)`
                : `2. นำเข้า / จัดการรายชื่อนักศึกษาทั้งหมด (${roster.length} คน)`}
            </button>
          </div>

          {activeStudent && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {lang === 'en' ? 'Active Student:' : 'ผู้ใช้งานปัจจุบัน:'}{' '}
                <strong>{activeStudent.name}</strong> ({activeStudent.id})
              </span>
            </div>
          )}
        </div>

        {/* Status Banner */}
        {statusMsg && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              statusMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {statusMsg.text}
            </span>
            <button type="button" onClick={() => setStatusMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {tab === 'checkin' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Enter Student ID to Join Team for This Week */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 h-fit space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-kku-terracotta">
                    {currentModule.code} Check-In
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {lang === 'en'
                      ? 'Enter Your KKU Student ID to Join Your Team'
                      : 'กรอกรหัสนักศึกษาเพื่อเข้าร่วมทีมในสัปดาห์นี้'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'en'
                      ? 'Type your Student ID (e.g., 653020101-2) or click a quick-select badge below. Your name and ID will be recorded on all iRAT, gRAT, 4S Case, and Peer Evaluation submissions for this week.'
                      : 'กรอกรหัสนักศึกษา (เช่น 653020101-2) ระบบจะดึงชื่อ-นามสกุลอัตโนมัติและบันทึกชื่อพร้อมรหัสของคุณลงในงานของกลุ่มประจำสัปดาห์นี้'}
                  </p>
                </div>

                <form onSubmit={handleStudentJoin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? '1. Select Your Team for This Week' : '1. เลือกกลุ่ม/ทีมของสัปดาห์นี้'}
                    </label>
                    <select
                      value={targetTeamId}
                      onChange={(e) => setTargetTeamId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-kku-terracotta"
                    >
                      {teams.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {lang === 'en' ? tm.name : tm.thName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? '2. Enter Student ID' : '2. กรอกรหัสนักศึกษา (Student ID)'}
                    </label>
                    <input
                      type="text"
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value)}
                      placeholder="e.g., 653020101-2"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-kku-terracotta"
                    />
                  </div>

                  {/* Live Match Preview or New Name Input */}
                  {studentIdInput.trim() && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        matchedStudent
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      {matchedStudent ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-emerald-700">
                              ✓ Found in Class Roster ({matchedStudent.section})
                            </div>
                            <div className="font-extrabold text-sm mt-0.5">
                              {matchedStudent.name}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded border border-emerald-200">
                            {matchedStudent.id}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="font-bold text-amber-800">
                            {lang === 'en'
                              ? 'ID not in roster yet — Enter your Full Name to register & join:'
                              : 'ยังไม่พบรหัสนี้ในระบบ — กรอกชื่อ-นามสกุลเพื่อลงทะเบียนเข้ากลุ่มทันที:'}
                          </div>
                          <input
                            type="text"
                            value={manualNameInput}
                            onChange={(e) => setManualNameInput(e.target.value)}
                            placeholder={lang === 'en' ? 'Your Full Name' : 'ชื่อ - นามสกุล'}
                            className="w-full rounded-lg border border-amber-300 px-3 py-1.5 text-xs bg-white font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!studentIdInput.trim()}
                    className="w-full py-3 rounded-xl bg-kku-terracotta hover:bg-kku-dark disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    {lang === 'en'
                      ? `Check In & Join Team for ${currentModule.code}`
                      : `ยืนยันรหัสนักศึกษาเพื่อเข้ากลุ่ม (${currentModule.code})`}
                  </button>
                </form>

                {/* Quick-Click Demo IDs from Roster */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 mb-2">
                    {lang === 'en'
                      ? 'Quick Fill from Imported Class Roster (Click an ID):'
                      : 'คลิกเลือกรหัสนักศึกษาจากรายชื่อในชั้นเรียนได้อย่างรวดเร็ว:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {roster.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStudentIdInput(st.id)}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-kku-light border border-slate-200 hover:border-kku-terracotta text-[11px] font-mono text-slate-700 transition"
                        title={st.name}
                      >
                        {st.id} ({st.name.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Live Weekly Team Rosters (Shows Name + ID for every group member) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {lang === 'en'
                        ? `Active Group Members for ${currentModule.code}`
                        : `รายชื่อสมาชิกและรหัสนักศึกษาในแต่ละกลุ่ม (${currentModule.code})`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'Students can join any team each week by entering their Student ID. Click a student to set them as the active user on this device.'
                        : 'นักศึกษาสามารถกรอกรหัสเพื่อเข้ากลุ่มในแต่ละสัปดาห์ คลิกที่รายชื่อเพื่อสลับเป็นผู้ใช้งานหลักบนเครื่องนี้'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((tm) => {
                    const checkedInList = moduleCheckins[tm.id] || [];
                    const isCurrentTeam = tm.id === selectedTeamId;
                    return (
                      <div
                        key={tm.id}
                        className={`rounded-2xl p-4 border transition ${
                          isCurrentTeam
                            ? 'bg-kku-light/50 border-kku-terracotta ring-1 ring-kku-terracotta/25'
                            : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">
                              {lang === 'en' ? tm.name : tm.thName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {checkedInList.length}{' '}
                              {lang === 'en' ? 'members checked in' : 'คนในกลุ่มสัปดาห์นี้'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTeamId(tm.id);
                              setTargetTeamId(tm.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              isCurrentTeam
                                ? 'bg-kku-terracotta text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isCurrentTeam
                              ? lang === 'en'
                                ? 'Selected Team'
                                : 'กลุ่มที่เลือกอยู่'
                              : lang === 'en'
                              ? 'Select Team'
                              : 'เลือกกลุ่มนี้'}
                          </button>
                        </div>

                        {checkedInList.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                            {lang === 'en'
                              ? 'No students checked in yet for this week.'
                              : 'ยังไม่มีนักศึกษาลงชื่อเข้ากลุ่มนี้'}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {checkedInList.map((member) => {
                              const isMe = activeStudent?.id === member.id;
                              return (
                                <div
                                  key={member.id}
                                  onClick={() => {
                                    onSetActiveStudent({ ...member, teamId: tm.id });
                                    onSelectTeamId(tm.id);
                                  }}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                                    isMe
                                      ? 'bg-emerald-50 border-emerald-400'
                                      : 'bg-slate-50 hover:bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                                      <span>{member.name}</span>
                                      {isMe && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-extrabold">
                                          YOU
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] font-mono text-kku-terracotta font-semibold">
                                      ID: {member.id} • {member.section || 'Sec 01'}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    title={lang === 'en' ? 'Remove from team this week' : 'นำออกจากกลุ่มในสัปดาห์นี้'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveFromWeeklyTeam(currentModule.id, tm.id, member.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: IMPORT & MANAGE CLASS ROSTER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Bulk Import CSV / Copy-Paste from Excel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3.5">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-kku-terracotta" />
                    {lang === 'en'
                      ? 'Bulk Import Students (CSV or Copy-Paste from Excel)'
                      : 'นำเข้ารายชื่อนักศึกษาทั้งชั้นเรียน (ไฟล์ CSV หรือวางจาก Excel)'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {lang === 'en'
                      ? 'Paste lines in format: Student_ID, Full_Name, Section (supports comma, semicolon, or Excel tab columns).'
                      : 'วางข้อมูลบรรทัดละ 1 คน ในรูปแบบ: รหัสนักศึกษา, ชื่อ-นามสกุล, เซคชัน (รองรับการคัดลอกจากตาราง Excel โดยตรง)'}
                  </p>

                  <textarea
                    rows={5}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`663020201-8, Somchai Rakrian, Sec 01\n663020202-6, Suda Rattana, Sec 01\n663020203-4, Kittipong Wong, Sec 02`}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono bg-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleBulkPasteImport}
                      className="py-2.5 px-3 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      {lang === 'en' ? 'Import Pasted Rows' : 'นำเข้าข้อมูลที่วาง'}
                    </button>

                    <label className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {lang === 'en' ? 'Upload .CSV File' : 'อัปโหลดไฟล์ .CSV'}
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCsvFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Add Single Student Form */}
                <form
                  onSubmit={handleAddSingleStudent}
                  className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3"
                >
                  <div className="text-xs font-extrabold text-slate-800">
                    {lang === 'en' ? 'Add Single Student' : 'เพิ่มนักศึกษารายบุคคล'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newSingleId}
                      onChange={(e) => setNewSingleId(e.target.value)}
                      placeholder="Student ID"
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={newSingleName}
                      onChange={(e) => setNewSingleName(e.target.value)}
                      placeholder="Full Name"
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={newSingleSec}
                      onChange={(e) => setNewSingleSec(e.target.value)}
                      placeholder="Sec 01"
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    + {lang === 'en' ? 'Add to Class Roster' : 'เพิ่มเข้าชั้นเรียน'}
                  </button>
                </form>
              </div>

              {/* Right: Searchable Master Class Roster Table */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'Search by Student ID or Name...'
                          : 'ค้นหาด้วยรหัสนักศึกษา หรือ ชื่อ...'
                      }
                      className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportRosterCsv}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Export Roster + Teams (.CSV)' : 'ส่งออกรายชื่อและกลุ่ม (.CSV)'}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">Student ID</th>
                        <th className="py-2.5 px-3 font-bold">Full Name</th>
                        <th className="py-2.5 px-3 font-bold">Section</th>
                        <th className="py-2.5 px-3 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-kku-terracotta">
                            {st.id}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-2 px-3 text-slate-500">{st.section || 'Sec 01'}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateRoster(roster.filter((r) => r.id !== st.id))
                              }
                              className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
