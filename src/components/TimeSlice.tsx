/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity as ActivityIcon,
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Copy,
  Ellipsis,
  Grid2X2,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import {
  DAY_END,
  DAY_START,
  MIN_ACTIVITY_MINUTES,
  PX_PER_MINUTE,
  categories,
  categoryById,
  starterActivities,
} from "@/lib/data";
import type { Activity, CategoryId } from "@/lib/types";

const STORAGE_KEY = "timeslice-activities-v2";
const THEME_KEY = "timeslice-theme-v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function snapMinutes(minutes: number) {
  return Math.round(minutes / 15) * 15;
}

function formatTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

function shortTime(totalMinutes: number) {
  return formatTime(totalMinutes).replace(":00", "");
}

function durationText(start: number, end: number) {
  const minutes = Math.max(0, end - start);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function minutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function readableDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function totalPlanned(activities: Activity[]) {
  return activities.reduce((sum, activity) => sum + Math.max(0, activity.end - activity.start), 0);
}

function categoryMinutes(activities: Activity[], category: CategoryId) {
  return activities
    .filter((activity) => activity.category === category)
    .reduce((sum, activity) => sum + Math.max(0, activity.end - activity.start), 0);
}

function isOverlapping(a: Activity, b: Activity) {
  return a.id !== b.id && a.start < b.end && b.start < a.end;
}


export default function TimeSlice() {
  const [activities, setActivities] = useState<Activity[]>(starterActivities);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFocus, setFocus] = useState(false);
  const [isDark, setDark] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [localTimeZone, setLocalTimeZone] = useState("Local time");
  const [boardWidth, setBoardWidth] = useState(760);
  const [notice, setNotice] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [form, setForm] = useState({
    title: "",
    start: 600,
    end: 720,
    category: "work" as CategoryId,
  });

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setActivities(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark") setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const updateLocalClock = () => {
      setNow(new Date());
      setLocalTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time");
    };

    updateLocalClock();
    const timer = window.setInterval(updateLocalClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!boardRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setBoardWidth(width);
    });

    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const planned = totalPlanned(activities);
  const visibleDayMinutes = DAY_END - DAY_START;
  const plannedPercent = Math.min(100, Math.round((planned / visibleDayMinutes) * 100));
  const freeMinutes = Math.max(0, visibleDayMinutes - planned);

  const selected = activities.find((activity) => activity.id === selectedId) ?? null;

  const overlaps = useMemo(() => {
    const ids = new Set<string>();
    for (const activity of activities) {
      if (activities.some((other) => isOverlapping(activity, other))) ids.add(activity.id);
    }
    return ids;
  }, [activities]);

  const currentMinutes = now ? minutesFromDate(now) : DAY_START;
  const nowVisible = Boolean(now) && currentMinutes >= DAY_START && currentMinutes <= DAY_END;
  const nowY = (currentMinutes - DAY_START) * PX_PER_MINUTE;
  const activityWidth = Math.min(440, Math.max(220, boardWidth - 120));

  function updateActivity(id: string, patch: Partial<Activity>) {
    setActivities((current) =>
      current.map((activity) => (activity.id === id ? { ...activity, ...patch } : activity)),
    );
  }

  function openNewActivity(start = 600) {
    const cleanStart = clamp(snapMinutes(start), DAY_START, DAY_END - 30);
    setEditingId(null);
    setForm({
      title: "",
      start: cleanStart,
      end: Math.min(DAY_END, cleanStart + 60),
      category: "work",
    });
    setEditorOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      start: activity.start,
      end: activity.end,
      category: activity.category,
    });
    setEditorOpen(true);
  }

  function saveActivity() {
    const title = form.title.trim() || "Untitled activity";
    const start = clamp(snapMinutes(form.start), DAY_START, DAY_END - MIN_ACTIVITY_MINUTES);
    const end = clamp(snapMinutes(form.end), start + MIN_ACTIVITY_MINUTES, DAY_END);

    if (editingId) {
      updateActivity(editingId, { title, start, end, category: form.category });
      setSelectedId(editingId);
    } else {
      const activity: Activity = {
        id: uid(),
        title,
        start,
        end,
        category: form.category,
        completed: false,
        x: 56,
      };
      setActivities((current) => [...current, activity]);
      setSelectedId(activity.id);
    }

    setEditorOpen(false);
    setNotice(editingId ? "Activity updated" : "Activity added");
  }

  function deleteActivity(id: string) {
    setActivities((current) => current.filter((activity) => activity.id !== id));
    setSelectedId(null);
    setEditorOpen(false);
    setNotice("Activity deleted");
  }

  function toggleComplete(id: string) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id ? { ...activity, completed: !activity.completed } : activity,
      ),
    );
  }

  function duplicateActivity(activity: Activity) {
    const copyActivity: Activity = {
      ...activity,
      id: uid(),
      title: `${activity.title} copy`,
      start: clamp(activity.start + 30, DAY_START, DAY_END - MIN_ACTIVITY_MINUTES),
      end: clamp(activity.end + 30, DAY_START + MIN_ACTIVITY_MINUTES, DAY_END),
      x: activity.x + 20,
      completed: false,
    };
    setActivities((current) => [...current, copyActivity]);
    setSelectedId(copyActivity.id);
    setNotice("Activity duplicated");
  }

  function resetDay() {
    setActivities([]);
    setSelectedId(null);
    setEditorOpen(false);
    setNotice("Day cleared");
  }

  function handleDragStop(id: string, x: number, y: number) {
    const activity = activities.find((item) => item.id === id);
    if (!activity) return;

    const start = clamp(
      snapMinutes(DAY_START + y / PX_PER_MINUTE),
      DAY_START,
      DAY_END - (activity.end - activity.start),
    );

    updateActivity(id, { start, x: Math.max(0, x) });
  }

  function handleResizeStop(id: string, height: number, y: number) {
    const activity = activities.find((item) => item.id === id);
    if (!activity) return;

    const start = clamp(snapMinutes(DAY_START + y / PX_PER_MINUTE), DAY_START, DAY_END - MIN_ACTIVITY_MINUTES);
    const duration = Math.max(MIN_ACTIVITY_MINUTES, snapMinutes(height / PX_PER_MINUTE));
    const end = clamp(start + duration, start + MIN_ACTIVITY_MINUTES, DAY_END);

    updateActivity(id, { start, end });
  }

  function handleBoardDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    openNewActivity(DAY_START + y / PX_PER_MINUTE);
  }

  const hours = Array.from(
    { length: Math.floor((DAY_END - DAY_START) / 60) + 1 },
    (_, index) => DAY_START + index * 60,
  );

  const currentCategory = selected ? categoryById(selected.category) : null;
  const today = now ?? new Date();

  return (
    <main className={`timeslice-shell ${isDark ? "dark" : ""}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="app-frame">
        <aside className="sidebar">
          <div className="brand-row">
            <div className="brand-mark"><Sparkles size={18} strokeWidth={2.4} /></div>
            <div>
              <div className="brand">TimeSlice</div>
              <div className="brand-sub">shape your day</div>
            </div>
          </div>

          <button className="add-button" onClick={() => openNewActivity()}>
            <Plus size={19} />
            Add activity
          </button>

          <nav className="side-nav">
            <button className="nav-item active"><CalendarDays size={18} /> Day</button>
            <button className="nav-item" onClick={() => setNotice("Week view is coming next")}>
              <Grid2X2 size={18} /> Week
            </button>
            <button className="nav-item" onClick={() => setShowStats((value) => !value)}>
              <BarChart3 size={18} /> Stats
            </button>
            <button className="nav-item" onClick={() => setNotice("Your browser is your calendar for now")}>
              <Clock3 size={18} /> Calendar
            </button>
            <button className="nav-item" onClick={() => setNotice("Templates are coming next")}>
              <WandSparkles size={18} /> Templates
            </button>
          </nav>

          <div className="sidebar-divider" />

          <div className="section-label">CATEGORIES</div>
          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-item ${selected?.category === category.id ? "selected" : ""}`}
                onClick={() => {
                  const first = activities.find((activity) => activity.category === category.id);
                  if (first) setSelectedId(first.id);
                  else openNewActivity();
                }}
              >
                <span className="category-dot" style={{ background: category.color }}>
                  {category.icon}
                </span>
                <span>{category.label}</span>
                <span className="category-time">{durationText(0, categoryMinutes(activities, category.id))}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-footer-card">
            <div className="footer-art">
              <div className="hill hill-a" />
              <div className="hill hill-b" />
              <div className="sun-orb" />
            </div>
            <strong>Shape your day,<br /><span>your way.</span></strong>
            <small>Double-click the canvas to add a slice.</small>
          </div>

          <button className="theme-toggle" onClick={() => setDark((value) => !value)}>
            {isDark ? <Moon size={17} /> : <Sun size={17} />}
            <span>{isDark ? "Dark" : "Light"}</span>
            <span className={`switch ${isDark ? "on" : ""}`}><span /></span>
          </button>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <button className="icon-button" aria-label="Previous day"><ChevronLeft size={20} /></button>
            <div className="date-title">
              <div className="today-title">Today <ChevronRight size={16} className="tiny-chevron" /></div>
              <div className="today-date">{readableDate(today)} · {localTimeZone}</div>
            </div>
            <div className="top-actions">
              <button className="mode-pill" onClick={() => setDark(false)}><Sun size={18} /></button>
              <button className="mode-pill" onClick={() => setDark(true)}><Moon size={18} /></button>
              <button className="focus-button" onClick={() => setFocus(true)}><Target size={17} /> Focus</button>
              <button className="icon-button" onClick={() => setNotice("Settings will be added after the core planner")}><SlidersHorizontal size={19} /></button>
            </div>
          </header>

          <div className="content-grid">
            <section className="timeline-card">
              <div className="timeline-toolbar">
                <div className="toolbar-group">
                  <span className="tool-hint"><ActivityIcon size={15} /> Drag slices freely</span>
                </div>
                <div className="toolbar-actions">
                  <button className="mini-tool" onClick={() => openNewActivity()}><Plus size={16} /></button>
                  <button className="mini-tool" onClick={resetDay}><RotateCcw size={16} /></button>
                  <button className="mini-tool" onClick={() => setNotice("Select a slice to edit it")}><Settings2 size={16} /></button>
                </div>
              </div>

              <div className="timeline-scroll">
                <div
                  ref={boardRef}
                  className="timeline-board"
                  style={{ height: (DAY_END - DAY_START) * PX_PER_MINUTE }}
                  onDoubleClick={handleBoardDoubleClick}
                >
                  <div className="hour-column">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="hour-label"
                        style={{ top: (hour - DAY_START) * PX_PER_MINUTE }}
                      >
                        {shortTime(hour)}
                      </div>
                    ))}
                  </div>

                  <div className="grid-layer">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="hour-line"
                        style={{ top: (hour - DAY_START) * PX_PER_MINUTE }}
                      />
                    ))}
                    {Array.from({ length: (DAY_END - DAY_START) / 30 }).map((_, index) => (
                      <div
                        key={`half-${index}`}
                        className="half-line"
                        style={{ top: index * 30 * PX_PER_MINUTE }}
                      />
                    ))}
                  </div>

                  {nowVisible && (
                    <motion.div
                      className="now-line"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ top: nowY }}
                    >
                      <span>{formatTime(currentMinutes)}</span>
                      <i />
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {activities.map((activity) => {
                      const category = categoryById(activity.category);
                      const height = Math.max(
                        MIN_ACTIVITY_MINUTES * PX_PER_MINUTE,
                        (activity.end - activity.start) * PX_PER_MINUTE,
                      );
                      const isSelected = selectedId === activity.id;
                      const hasConflict = overlaps.has(activity.id);

                      return (
                        <Rnd
                          key={activity.id}
                          size={{ width: activityWidth, height }}
                          position={{
                            x: activity.x,
                            y: (activity.start - DAY_START) * PX_PER_MINUTE,
                          }}
                          bounds="parent"
                          minWidth={Math.min(260, activityWidth)}
                          maxWidth={activityWidth}
                          minHeight={MIN_ACTIVITY_MINUTES * PX_PER_MINUTE}
                          enableResizing={{
                            top: false,
                            right: false,
                            bottom: true,
                            left: false,
                            topRight: false,
                            bottomRight: true,
                            bottomLeft: false,
                            topLeft: false,
                          }}
                          dragHandleClassName="activity-drag-handle"
                          onMouseDown={() => setSelectedId(activity.id)}
                          onDragStop={(_, data) => handleDragStop(activity.id, data.x, data.y)}
                          onResizeStop={(_, __, ref, ___, position) =>
                            handleResizeStop(activity.id, ref.offsetHeight, position.y)
                          }
                          style={{ zIndex: isSelected ? 20 : 10 }}
                        >
                          <motion.article
                            layout
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: activity.completed ? 0.72 : 1, scale: 1, y: 0 }}
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            className={`activity-card ${isSelected ? "selected" : ""} ${activity.completed ? "completed" : ""} ${hasConflict ? "conflict" : ""}`}
                            style={{
                              "--accent": category.color,
                              "--soft": category.soft,
                            } as React.CSSProperties}
                          >
                            <div className="activity-drag-handle activity-main">
                              <div className="activity-icon">
                                {activity.completed ? <Check size={18} /> : category.icon}
                              </div>
                              <div className="activity-copy">
                                <div className="activity-title-row">
                                  <strong>{activity.title}</strong>
                                  {hasConflict && <span className="conflict-badge">Conflict</span>}
                                </div>
                                <span>
                                  {formatTime(activity.start)} — {formatTime(activity.end)} · {durationText(activity.start, activity.end)}
                                </span>
                              </div>
                            </div>

                            <div className="activity-actions">
                              <button title="Complete" onClick={() => toggleComplete(activity.id)}>
                                <Check size={16} />
                              </button>
                              <button title="Edit" onClick={() => openEdit(activity)}>
                                <Settings2 size={16} />
                              </button>
                              <button title="More" onClick={() => duplicateActivity(activity)}>
                                <Copy size={15} />
                              </button>
                            </div>

                            <button className="resize-hint" aria-label="Resize activity">
                              <span />
                            </button>
                          </motion.article>
                        </Rnd>
                      );
                    })}
                  </AnimatePresence>

                  <button className="canvas-add" onClick={() => openNewActivity()}>
                    <CirclePlus size={17} />
                    <span>Drag anywhere or click to add an activity</span>
                  </button>
                </div>
              </div>
            </section>

            {showStats && (
              <aside className="right-panel">
                <motion.section
                  className="stat-card primary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="card-heading">Your Day</div>
                  <div className="ring-wrap">
                    <svg viewBox="0 0 120 120" className="progress-ring">
                      <circle className="ring-bg" cx="60" cy="60" r="48" />
                      <motion.circle
                        className="ring-value"
                        cx="60"
                        cy="60"
                        r="48"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: plannedPercent / 100 }}
                        transition={{ duration: 0.9, type: "spring" }}
                      />
                    </svg>
                    <div className="ring-text">
                      <strong>{plannedPercent}%</strong>
                      <span>Planned</span>
                    </div>
                  </div>
                  <div className="stat-pair">
                    <div><strong>{durationText(0, planned)}</strong><span>Planned</span></div>
                    <div><strong>{durationText(0, freeMinutes)}</strong><span>Free</span></div>
                  </div>
                </motion.section>

                <section className="stat-card">
                  <div className="card-heading">Categories</div>
                  <div className="category-stats">
                    {categories.slice(0, 6).map((category) => {
                      const minutes = categoryMinutes(activities, category.id);
                      return (
                        <div className="category-stat-row" key={category.id}>
                          <span className="category-stat-name">
                            <i style={{ background: category.color }}>{category.icon}</i>
                            {category.label}
                          </span>
                          <strong>{durationText(0, minutes)}</strong>
                        </div>
                      );
                    })}
                  </div>
                  <button className="text-link" onClick={() => setShowStats(false)}>Hide stats <ChevronRight size={15} /></button>
                </section>

                <section className="encouragement-card">
                  <div className="encourage-icon"><Sparkles size={17} /></div>
                  <strong>You’re doing great!</strong>
                  <p>Keep balancing work, learning and rest.</p>
                  <div className="mini-chart">
                    <span /><span /><span /><span /><span />
                  </div>
                </section>

                <section className="up-next-card">
                  <div className="card-heading">Up Next</div>
                  {selected ? (
                    <>
                      <div className="next-row">
                        <div className="next-icon" style={{ background: currentCategory?.soft, color: currentCategory?.color }}>
                          {currentCategory?.icon}
                        </div>
                        <div>
                          <strong>{selected.title}</strong>
                          <span>{formatTime(selected.start)} — {formatTime(selected.end)}</span>
                        </div>
                      </div>
                      <button className="focus-start" onClick={() => setFocus(true)}>
                        <Target size={16} /> Start Focus Session
                      </button>
                    </>
                  ) : (
                    <p className="muted-copy">Select a slice to see what is next.</p>
                  )}
                </section>
              </aside>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setEditorOpen(false)}
          >
            <motion.div
              className="editor-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <span className="eyebrow">ACTIVITY</span>
                  <h2>{editingId ? "Edit activity" : "Add activity"}</h2>
                </div>
                <button className="icon-button" onClick={() => setEditorOpen(false)}><X size={18} /></button>
              </div>

              <label className="field">
                <span>What are you doing?</span>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="e.g. Build my portfolio"
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Start</span>
                  <input
                    type="time"
                    value={`${String(Math.floor(form.start / 60)).padStart(2, "0")}:${String(form.start % 60).padStart(2, "0")}`}
                    onChange={(event) => {
                      const [h, m] = event.target.value.split(":").map(Number);
                      setForm((current) => ({ ...current, start: h * 60 + m }));
                    }}
                  />
                </label>
                <label className="field">
                  <span>End</span>
                  <input
                    type="time"
                    value={`${String(Math.floor(form.end / 60)).padStart(2, "0")}:${String(form.end % 60).padStart(2, "0")}`}
                    onChange={(event) => {
                      const [h, m] = event.target.value.split(":").map(Number);
                      setForm((current) => ({ ...current, end: h * 60 + m }));
                    }}
                  />
                </label>
              </div>

              <div className="field">
                <span>Category</span>
                <div className="category-picker">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={form.category === category.id ? "picked" : ""}
                      onClick={() => setForm((current) => ({ ...current, category: category.id }))}
                    >
                      <i style={{ background: category.color }}>{category.icon}</i>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                {editingId && (
                  <button className="danger-button" onClick={() => deleteActivity(editingId)}>
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <div className="modal-footer-right">
                  <button className="secondary-button" onClick={() => setEditorOpen(false)}>Cancel</button>
                  <button className="primary-button" onClick={saveActivity}>Save activity</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFocus && selected && (
          <motion.div
            className="focus-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="focus-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <button className="focus-close" onClick={() => setFocus(false)}><X size={20} /></button>
              <div className="focus-orbit">
                <div className="focus-dot" />
              </div>
              <span className="eyebrow">FOCUS SESSION</span>
              <h2>{selected.title}</h2>
              <p>{formatTime(selected.start)} — {formatTime(selected.end)}</p>
              <div className="focus-duration">{durationText(selected.start, selected.end)}</div>
              <button
                className="primary-button focus-complete"
                onClick={() => {
                  toggleComplete(selected.id);
                  setFocus(false);
                  setNotice("Nice work — activity completed");
                }}
              >
                <Check size={17} /> Mark complete
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button className="active" onClick={() => setNotice("You are viewing today")}>
          <CalendarDays size={17} />
          <span>Today</span>
        </button>
        <button onClick={() => setShowStats((value) => !value)}>
          <BarChart3 size={17} />
          <span>Stats</span>
        </button>
        <button className="mobile-add" onClick={() => openNewActivity()}>
          <span><Plus size={18} /></span>
          <span>Add</span>
        </button>
        <button onClick={() => setFocus(true)} disabled={!selected}>
          <Target size={17} />
          <span>Focus</span>
        </button>
      </nav>

      <AnimatePresence>
        {notice && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            <Check size={16} /> {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
