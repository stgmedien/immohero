"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  grantEnrollment,
} from "@/app/studio/actions/academy";
import { QuizEditor, type QuizQuestionDraft } from "@/components/studio/quiz-editor";

type Level = "basic" | "intermediate" | "advanced";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  body: string;
  durationMin: number | null;
  videoUrl: string | null;
  quiz: QuizQuestionDraft[] | null;
  position: number;
  published: boolean;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  summary: string | null;
  level: Level;
  priceCents: number | null;
  position: number;
  published: boolean;
  lessons: Lesson[];
  enrollmentCount?: number;
  completedCount?: number;
}

const LEVELS: { value: Level; label: string }[] = [
  { value: "basic", label: "Einsteiger" },
  { value: "intermediate", label: "Fortgeschritten" },
  { value: "advanced", label: "Profi" },
];

export function AcademyManager({ initial }: { initial: Course[] }) {
  const [courses, setCourses] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState<Level>("basic");
  const [pending, startTransition] = useTransition();

  function addCourse() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      try {
        const row = await createCourse({ title: newTitle, level: newLevel });
        setCourses((c) => [...c, { ...row, lessons: [] } as Course]);
        setNewTitle("");
        toast.success("Kurs angelegt");
      } catch {
        toast.error("Anlegen fehlgeschlagen");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold">Neuer Kurs</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Kurstitel, z. B. „A1/A3 in 4 Wochen“"
            className="max-w-md"
          />
          <select
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value as Level)}
            className="h-10 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-3 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <Button onClick={addCourse} disabled={pending || !newTitle.trim()}>
            <Plus className="h-4 w-4" /> Anlegen
          </Button>
        </div>
      </Card>

      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onChange={(patch) => setCourses((cs) => cs.map((c) => (c.id === course.id ? { ...c, ...patch } : c)))}
          onDelete={() => setCourses((cs) => cs.filter((c) => c.id !== course.id))}
        />
      ))}
    </div>
  );
}

function CourseCard({
  course,
  onChange,
  onDelete,
}: {
  course: Course;
  onChange: (patch: Partial<Course>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [summary, setSummary] = useState(course.summary ?? "");
  const [level, setLevel] = useState<Level>(course.level);
  const [priceEur, setPriceEur] = useState(course.priceCents ? String(course.priceCents / 100) : "");
  const [grantEmail, setGrantEmail] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function saveCourse() {
    startTransition(async () => {
      try {
        const priceCents = priceEur.trim() ? Math.round(parseFloat(priceEur.replace(",", ".")) * 100) : null;
        await updateCourse({
          courseId: course.id,
          patch: { title, description: description || null, summary: summary || null, level, priceCents },
        });
        onChange({ title, description, summary, level, priceCents });
        toast.success("Gespeichert");
      } catch {
        toast.error("Speichern fehlgeschlagen");
      }
    });
  }

  function grantAccess() {
    if (!grantEmail.trim()) return;
    startTransition(async () => {
      try {
        const res = await grantEnrollment({ email: grantEmail, courseId: course.id });
        toast.success(res.created ? `${res.userEmail} freigeschaltet` : `${res.userEmail} war schon eingeschrieben`);
        setGrantEmail("");
      } catch {
        toast.error("Freischalten fehlgeschlagen");
      }
    });
  }

  function togglePublish() {
    startTransition(async () => {
      try {
        await updateCourse({ courseId: course.id, patch: { published: !course.published } });
        onChange({ published: !course.published });
      } catch {
        toast.error("Fehlgeschlagen");
      }
    });
  }

  function removeCourse() {
    if (!confirm(`Kurs „${course.title}" inkl. aller Lektionen löschen?`)) return;
    startTransition(async () => {
      try {
        await deleteCourse(course.id);
        onDelete();
        toast.success("Kurs gelöscht");
      } catch {
        toast.error("Löschen fehlgeschlagen");
      }
    });
  }

  function addLesson() {
    if (!newLessonTitle.trim()) return;
    startTransition(async () => {
      try {
        const row = await createLesson({ courseId: course.id, title: newLessonTitle });
        onChange({ lessons: [...course.lessons, row as Lesson] });
        setNewLessonTitle("");
        toast.success("Lektion angelegt");
      } catch {
        toast.error("Anlegen fehlgeschlagen");
      }
    });
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(!open)} className="text-[var(--color-ink-3)]">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{course.title}</p>
          <p className="text-xs text-[var(--color-ink-3)]">
            /academy/{course.slug} · {course.lessons.length} Lektionen
            {course.enrollmentCount != null ? ` · ${course.enrollmentCount} Lernende` : ""}
            {course.completedCount ? ` · ${course.completedCount} Abschlüsse` : ""}
          </p>
        </div>
        {course.priceCents ? <Badge tone="accent">{(course.priceCents / 100).toLocaleString("de-DE")} €</Badge> : <Badge tone="neutral">Kostenlos</Badge>}
        <Badge tone={course.published ? "ok" : "neutral"}>{course.published ? "Live" : "Entwurf"}</Badge>
        <Button variant="secondary" size="sm" onClick={togglePublish} disabled={pending}>
          {course.published ? "Offline nehmen" : "Veröffentlichen"}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={removeCourse} disabled={pending} aria-label="Kurs löschen">
          <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-[var(--color-hair)] pt-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="grid gap-1.5">
              <Label mono>Titel</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Level</Label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-3 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Beschreibung (Markdown-lite)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <div className="grid gap-1.5">
              <Label mono>Katalog-Teaser (1 Satz)</Label>
              <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Kurz-Beschreibung für die Kurs-Karte" />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Preis in € (leer = kostenlos)</Label>
              <Input value={priceEur} onChange={(e) => setPriceEur(e.target.value)} placeholder="z. B. 149" inputMode="decimal" />
            </div>
          </div>
          <Button size="sm" onClick={saveCourse} disabled={pending}>Kurs speichern</Button>

          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hair)] p-3">
            <Label mono>Manuell freischalten (E-Mail — legt Account bei Bedarf an)</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="pilot@example.com"
                type="email"
                className="max-w-sm"
              />
              <Button variant="secondary" size="sm" onClick={grantAccess} disabled={pending || !grantEmail.trim()}>
                Freischalten
              </Button>
            </div>
          </div>

          <div className="space-y-3 border-t border-[var(--color-hair)] pt-4">
            <h3 className="text-sm font-semibold">Lektionen</h3>
            {course.lessons.map((lesson) => (
              <LessonEditor
                key={lesson.id}
                lesson={lesson}
                onChange={(patch) =>
                  onChange({ lessons: course.lessons.map((l) => (l.id === lesson.id ? { ...l, ...patch } : l)) })
                }
                onDelete={() => onChange({ lessons: course.lessons.filter((l) => l.id !== lesson.id) })}
              />
            ))}
            <div className="flex gap-2">
              <Input
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Neue Lektion — Titel"
                className="max-w-md"
              />
              <Button variant="secondary" size="sm" onClick={addLesson} disabled={pending || !newLessonTitle.trim()}>
                <Plus className="h-4 w-4" /> Lektion
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function LessonEditor({
  lesson,
  onChange,
  onDelete,
}: {
  lesson: Lesson;
  onChange: (patch: Partial<Lesson>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [body, setBody] = useState(lesson.body);
  const [duration, setDuration] = useState(lesson.durationMin?.toString() ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [quiz, setQuiz] = useState<QuizQuestionDraft[]>(lesson.quiz ?? []);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const cleanQuiz = quiz
          .map((q) => ({ ...q, options: q.options.filter((o) => o.trim()) }))
          .filter((q) => q.question.trim() && q.options.length >= 2);
        const patch = {
          title,
          body,
          durationMin: duration ? parseInt(duration, 10) : null,
          videoUrl: videoUrl || null,
          quiz: cleanQuiz.length > 0 ? cleanQuiz : null,
        };
        await updateLesson({ lessonId: lesson.id, patch });
        onChange(patch);
        toast.success("Lektion gespeichert");
      } catch {
        toast.error("Speichern fehlgeschlagen");
      }
    });
  }

  function togglePublish() {
    startTransition(async () => {
      try {
        await updateLesson({ lessonId: lesson.id, patch: { published: !lesson.published } });
        onChange({ published: !lesson.published });
      } catch {
        toast.error("Fehlgeschlagen");
      }
    });
  }

  function remove() {
    if (!confirm(`Lektion „${lesson.title}" löschen?`)) return;
    startTransition(async () => {
      try {
        await deleteLesson(lesson.id);
        onDelete();
      } catch {
        toast.error("Löschen fehlgeschlagen");
      }
    });
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-hair)] p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="text-[var(--color-ink-3)]">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <span className="flex-1 truncate text-sm font-medium">{lesson.title}</span>
        <Badge tone={lesson.published ? "ok" : "neutral"}>{lesson.published ? "Live" : "Entwurf"}</Badge>
        <Button variant="ghost" size="xs" onClick={togglePublish} disabled={pending}>
          {lesson.published ? "Offline" : "Live schalten"}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={remove} disabled={pending} aria-label="Lektion löschen">
          <Trash2 className="h-3.5 w-3.5 text-[var(--color-danger)]" />
        </Button>
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel" />
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Min." inputMode="numeric" />
          </div>
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video-URL (YouTube, Vimeo oder direkte MP4/Blob-URL)" />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder={"Inhalt in Markdown-lite:\n# Überschrift\n**fett**, *kursiv*, - Listen, [Link](https://…)"}
          />
          <div className="border-t border-[var(--color-hair)] pt-3">
            <QuizEditor value={quiz} onChange={setQuiz} />
          </div>
          <Button size="sm" onClick={save} disabled={pending}>Lektion speichern</Button>
        </div>
      )}
    </div>
  );
}
