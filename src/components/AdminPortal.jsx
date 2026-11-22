import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Plus,
  Trash2,
  Users,
  BookOpen,
  UserCheck,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Tv,
  Settings,
  Lock
} from 'lucide-react';

const ADMIN_PIN_STORAGE_KEY = 'kku_geoai_master_admin_pin_v1';
const DEFAULT_ADMIN_PIN = '9999';

export default function AdminPortal({
  lang,
  isAdminAuthed,
  onSetAdminAuthed,
  classes,
  onUpdateClass,
  onCreateClass,
  onDeleteClass,
  rostersByClass,
  modules,
  onOpenClassAsInstructor,
  onSwitchToStudentView
}) {
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_PIN_STORAGE_KEY) || DEFAULT_ADMIN_PIN;
    } catch (e) {
      return DEFAULT_ADMIN_PIN;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newAdminPinInput, setNewAdminPinInput] = useState('');
  const [adminPinSavedMsg, setAdminPinSavedMsg] = useState(false);

  // New Course / Instructor Form State
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newSemester, setNewSemester] = useState('Semester 1 / 2026');
  const [newCoursePin, setNewCoursePin] = useState('2026');
  const [createdBanner, setCreatedBanner] = useState(null);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === adminPin) {
      setPinError(false);
      setPinInput('');
      onSetAdminAuthed(true);
    } else {
      setPinError(true);
    }
  };

  const handleChangeAdminPin = (e) => {
    e.preventDefault();
    const clean = newAdminPinInput.trim();
    if (clean.length < 4) return;
    setAdminPin(clean);
    try {
      localStorage.setItem(ADMIN_PIN_STORAGE_KEY, clean);
    } catch (e) {}
    setNewAdminPinInput('');
    setAdminPinSavedMsg(true);
    setTimeout(() => setAdminPinSavedMsg(false), 3000);
  };

  const handleAddCourseSubmit = (e) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim() || !newInstructorName.trim()) return;
    const created = onCreateClass({
      courseCode: newCourseCode.trim().toUpperCase(),
      courseName: newCourseName.trim(),
      instructorName: newInstructorName.trim(),
      semester: newSemester.trim() || 'Semester 1 / 2026',
      pin: newCoursePin.trim() || '2026',
      targetTeamSize: 5,
      teamCount: 4
    });
    setNewCourseCode('');
    setNewCourseName('');
    setNewInstructorName('');
    setNewCoursePin('2026');
    setCreatedBanner(created.courseCode);
    setTimeout(() => setCreatedBanner(null), 3500);
  };

  // ================= ADMIN SECURITY GATE =================
  if (!isAdminAuthed) {
    return (
      <div className="max-w-lg mx-auto my-8 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white px-8 py-7 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            {lang === 'en' ? 'System Administrator' : 'ระบบผู้ดูแลระบบสูงสุด (System Admin)'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
            {lang === 'en'
              ? 'Admin Portal — Instructors & Classes'
              : 'เข้าสู่ระบบผู้ดูแลระบบ (จัดการอาจารย์และรายวิชา)'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {lang === 'en'
              ? 'Manage instructors, course workspaces, and per-class access PINs'
              : 'สร้างรายวิชา กำหนดชื่ออาจารย์ผู้สอน และตั้งรหัสผ่านแยกแต่ละรายวิชา'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-xs text-slate-600 text-center leading-relaxed">
            {lang === 'en'
              ? 'Enter the Master Admin Passcode to manage all instructors and classes. (Default Admin PIN: 9999)'
              : 'กรุณากรอกรหัสผู้ดูแลระบบ (Master Admin PIN) เพื่อจัดการรายวิชาและอาจารย์ทั้งหมด (รหัสเริ่มต้น: 9999)'}
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder={
                lang === 'en' ? 'Enter Admin PIN (9999)' : 'กรอกรหัส Admin PIN (เช่น 9999)'
              }
              className={`w-full rounded-2xl border-2 px-4 py-3.5 text-center text-xl font-mono font-extrabold tracking-widest focus:outline-none transition ${
                pinError
                  ? 'border-rose-400 bg-rose-50 text-rose-900'
                  : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600'
              }`}
              autoFocus
              required
            />

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 text-center">
                {lang === 'en'
                  ? 'Incorrect Admin PIN. Default is 9999.'
                  : 'รหัสผู้ดูแลระบบไม่ถูกต้อง (รหัสเริ่มต้นคือ 9999)'}
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
                className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs shadow-lg transition"
              >
                {lang === 'en' ? 'Unlock Admin →' : 'เข้าสู่หน้าผู้ดูแลระบบ →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ================= MAIN ADMIN DASHBOARD =================
  return (
    <div className="space-y-6">
      {/* Top Admin Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              {lang === 'en'
                ? 'Platform Administration Console'
                : 'แผงควบคุมผู้ดูแลระบบ (System Administrator)'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'en'
                ? 'Manage Instructors & Assigned Classes'
                : 'จัดการรายวิชา อาจารย์ผู้สอน และสิทธิ์การเข้าถึง'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {lang === 'en'
                ? 'Each instructor logs in with their class PIN and sees ONLY their own assigned class, roster, and weekly lessons.'
                : 'อาจารย์แต่ละท่านจะเข้าสู่ระบบด้วยรหัส PIN ประจำวิชา และมองเห็นเฉพาะรายวิชา รายชื่อนักศึกษา และบทเรียนของตนเองเท่านั้น'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onSetAdminAuthed(false);
            onSwitchToStudentView();
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 font-extrabold text-xs flex items-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" />
          {lang === 'en' ? 'Lock Admin Portal' : 'ล็อกและออกจากโหมด Admin'}
        </button>
      </div>

      {/* Top Row: Create New Class & Instructor + Master Admin PIN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Create New Class & Assign Instructor Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {lang === 'en'
                  ? 'Add New Class & Assign Instructor'
                  : 'สร้างรายวิชาใหม่และกำหนดอาจารย์ผู้สอน'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Create an isolated class workspace with its own dedicated Instructor PIN.'
                  : 'สร้างพื้นที่รายวิชาแยกอิสระ พร้อมกำหนดรหัสผ่าน (PIN) เฉพาะสำหรับอาจารย์ประจำวิชา'}
              </p>
            </div>
            {createdBanner && (
              <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'en'
                  ? `Created ${createdBanner}!`
                  : `สร้างวิชา ${createdBanner} สำเร็จ!`}
              </span>
            )}
          </div>

          <form onSubmit={handleAddCourseSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Course Code' : 'รหัสวิชา (Course Code)'}
                </label>
                <input
                  type="text"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  placeholder="e.g., GEOAI-402"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Course Title' : 'ชื่อรายวิชา (Course Name)'}
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g., Spatial Data Science & GeoAI"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Assigned Instructor Name' : 'ชื่ออาจารย์ผู้สอน'}
                </label>
                <input
                  type="text"
                  value={newInstructorName}
                  onChange={(e) => setNewInstructorName(e.target.value)}
                  placeholder="e.g., Dr. Nathan"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Semester' : 'ภาคการศึกษา'}
                </label>
                <input
                  type="text"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  placeholder="Semester 1 / 2026"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kku-terracotta mb-1">
                  {lang === 'en' ? 'Instructor Login PIN' : 'รหัส PIN สำหรับอาจารย์วิชานี้'}
                </label>
                <input
                  type="text"
                  value={newCoursePin}
                  onChange={(e) => setNewCoursePin(e.target.value)}
                  placeholder="e.g., 2026"
                  className="w-full rounded-xl border-2 border-amber-300 bg-amber-50/40 px-3 py-2 text-xs font-mono font-extrabold"
                  required
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-kku-terracotta hover:bg-kku-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                {lang === 'en'
                  ? 'Create Class & Assign Instructor'
                  : '+ สร้างรายวิชาและกำหนดอาจารย์'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Master Admin PIN & Isolation Policy Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold">
                {lang === 'en' ? 'Master Admin Security PIN' : 'ตั้งค่ารหัสผ่านผู้ดูแลระบบ (Admin PIN)'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'en'
                ? `Current Master Admin PIN: ${adminPin}. Only the Admin can add/remove classes or view all instructors.`
                : `รหัส Admin ปัจจุบันคือ: ${adminPin} เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเพิ่ม/ลบรายวิชา หรือดูรายวิชาทั้งหมดได้`}
            </p>

            <form onSubmit={handleChangeAdminPin} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newAdminPinInput}
                onChange={(e) => setNewAdminPinInput(e.target.value)}
                placeholder={lang === 'en' ? 'New Admin PIN' : 'รหัส Admin ใหม่'}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs"
              >
                {lang === 'en' ? 'Save' : 'บันทึก'}
              </button>
            </form>
            {adminPinSavedMsg && (
              <div className="text-xs font-bold text-emerald-600">
                ✓ Master Admin PIN updated!
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-kku-terracotta" />
              {lang === 'en' ? 'Strict Class Isolation Active' : 'ระบบแยกสิทธิ์รายวิชาอัตโนมัติ'}
            </div>
            <p className="text-[11px] leading-relaxed">
              {lang === 'en'
                ? 'When an instructor logs into their class, they cannot switch to or view other instructors’ classes, rosters, or lessons.'
                : 'เมื่ออาจารย์เข้าสู่ระบบของวิชาตนเองแล้ว จะไม่สามารถสลับไปดูหรือแก้ไขรายวิชา รายชื่อนักศึกษา หรือบทเรียนของอาจารย์ท่านอื่นได้'}
            </p>
          </div>
        </div>
      </div>

      {/* Directory of All Assigned Classes & Instructors */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {lang === 'en'
                ? `All Classes & Assigned Instructors (${classes.length})`
                : `รายวิชาและอาจารย์ผู้สอนทั้งหมดในระบบ (${classes.length} รายวิชา)`}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Edit instructor assignments, update class PINs, or open any class dashboard.'
                : 'แก้ไขชื่ออาจารย์ รหัส PIN ประจำวิชา หรือกดเข้าดูหน้าจัดการของแต่ละรายวิชา'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const classRoster = rostersByClass[cls.id] || [];
            const classMods = modules.filter(
              (m) => (m.classId || classes[0]?.id) === cls.id
            );

            return (
              <div
                key={cls.id}
                className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono font-extrabold text-xs">
                        {cls.courseCode}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {cls.courseName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                        {classRoster.length} {lang === 'en' ? 'students' : 'คน'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-kku-terracotta">
                        {classMods.length} {lang === 'en' ? 'weeks' : 'สัปดาห์'}
                      </span>
                    </div>
                  </div>

                  {/* Inline Editable Fields for Admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                        {lang === 'en' ? 'Course Code' : 'รหัสวิชา'}
                      </label>
                      <input
                        type="text"
                        value={cls.courseCode}
                        onChange={(e) =>
                          onUpdateClass(cls.id, { courseCode: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                        {lang === 'en' ? 'Semester' : 'ภาคการศึกษา'}
                      </label>
                      <input
                        type="text"
                        value={cls.semester}
                        onChange={(e) =>
                          onUpdateClass(cls.id, { semester: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                      {lang === 'en' ? 'Course Title' : 'ชื่อรายวิชา'}
                    </label>
                    <input
                      type="text"
                      value={cls.courseName}
                      onChange={(e) =>
                        onUpdateClass(cls.id, { courseName: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                        {lang === 'en' ? 'Assigned Instructor' : 'อาจารย์ผู้สอนประจำวิชา'}
                      </label>
                      <input
                        type="text"
                        value={cls.instructorName || ''}
                        onChange={(e) =>
                          onUpdateClass(cls.id, { instructorName: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-kku-terracotta mb-0.5">
                        {lang === 'en' ? 'Class PIN' : 'รหัส PIN ประจำวิชา'}
                      </label>
                      <input
                        type="text"
                        value={cls.pin || '2026'}
                        onChange={(e) =>
                          onUpdateClass(cls.id, { pin: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-amber-300 bg-amber-50/50 px-2.5 py-1.5 text-xs font-mono font-extrabold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  {classes.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => onDeleteClass(cls.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Delete Class' : 'ลบรายวิชา'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {lang === 'en' ? 'Primary Class' : 'รายวิชาหลัก'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenClassAsInstructor(cls.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-kku-terracotta text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Tv className="w-3.5 h-3.5 text-amber-300" />
                    {lang === 'en'
                      ? 'Open Instructor View →'
                      : 'เปิดหน้าจัดการของวิชานี้ →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
