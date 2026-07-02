"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons, auditLog } from "@/lib/db/schema";

async function requireAcademyAdmin() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "kurs";
}

async function audit(session: { user: { id: string; name?: string | null } }, action: string, entityId: string) {
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action,
    entityType: "academy",
    entityId,
  });
}

export async function createCourse(input: { title: string; level: "basic" | "intermediate" | "advanced"; description?: string }) {
  const session = await requireAcademyAdmin();
  if (!input.title.trim()) throw new Error("Titel fehlt");
  const base = slugify(input.title);
  let slug = base;
  for (let i = 2; i < 20; i++) {
    const exists = await db.select({ id: academyCourses.id }).from(academyCourses).where(eq(academyCourses.slug, slug)).limit(1);
    if (exists.length === 0) break;
    slug = `${base}-${i}`;
  }
  const [row] = await db
    .insert(academyCourses)
    .values({ title: input.title.trim(), slug, level: input.level, description: input.description?.trim() || null })
    .returning();
  await audit(session, "academy_course_created", row.id);
  revalidatePath("/studio/academy");
  return row;
}

export async function updateCourse(input: {
  courseId: string;
  patch: { title?: string; description?: string | null; level?: "basic" | "intermediate" | "advanced"; position?: number; published?: boolean };
}) {
  const session = await requireAcademyAdmin();
  await db.update(academyCourses).set(input.patch).where(eq(academyCourses.id, input.courseId));
  await audit(session, "academy_course_updated", input.courseId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}

export async function deleteCourse(courseId: string) {
  const session = await requireAcademyAdmin();
  await db.delete(academyCourses).where(eq(academyCourses.id, courseId));
  await audit(session, "academy_course_deleted", courseId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}

export async function createLesson(input: { courseId: string; title: string }) {
  const session = await requireAcademyAdmin();
  if (!input.title.trim()) throw new Error("Titel fehlt");
  const base = slugify(input.title);
  let slug = base;
  for (let i = 2; i < 20; i++) {
    const exists = await db
      .select({ id: academyLessons.id })
      .from(academyLessons)
      .where(eq(academyLessons.slug, slug))
      .limit(1);
    if (exists.length === 0 || exists.every(() => false)) break;
    slug = `${base}-${i}`;
  }
  const siblings = await db.select({ id: academyLessons.id }).from(academyLessons).where(eq(academyLessons.courseId, input.courseId));
  const [row] = await db
    .insert(academyLessons)
    .values({ courseId: input.courseId, title: input.title.trim(), slug, position: siblings.length })
    .returning();
  await audit(session, "academy_lesson_created", row.id);
  revalidatePath("/studio/academy");
  return row;
}

export async function updateLesson(input: {
  lessonId: string;
  patch: { title?: string; body?: string; durationMin?: number | null; videoUrl?: string | null; position?: number; published?: boolean };
}) {
  const session = await requireAcademyAdmin();
  await db.update(academyLessons).set(input.patch).where(eq(academyLessons.id, input.lessonId));
  await audit(session, "academy_lesson_updated", input.lessonId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}

export async function deleteLesson(lessonId: string) {
  const session = await requireAcademyAdmin();
  await db.delete(academyLessons).where(eq(academyLessons.id, lessonId));
  await audit(session, "academy_lesson_deleted", lessonId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}
