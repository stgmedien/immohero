import type { User } from "@/lib/db/schema";

export type Role = "customer" | "photographer" | "drone_pilot" | "editor" | "admin";

export const TEAM_ROLES: Role[] = ["photographer", "drone_pilot", "editor", "admin"];

export function isTeamRole(role: string | null | undefined): role is Role {
  return TEAM_ROLES.includes(role as Role);
}

export function canAccessAdmin(role?: string | null) {
  return role === "admin";
}

export function canAccessStudio(role?: string | null) {
  return isTeamRole(role);
}

export function canAccessCustomers(role?: string | null) {
  return role === "admin" || role === "editor";
}

export function canCreateProjects(role?: string | null) {
  return role === "admin" || role === "editor";
}

export function canManageTeam(role?: string | null) {
  return role === "admin";
}

export function canViewAudit(role?: string | null) {
  return role === "admin";
}

export function canManageCatalog(role?: string | null) {
  return role === "admin";
}

export function userInitials(user: { name?: string | null; email?: string | null; initials?: string | null } | null | undefined): string {
  if (!user) return "??";
  if (user.initials) return user.initials.toUpperCase().slice(0, 2);
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (user.email ?? "??").slice(0, 2).toUpperCase();
}

export function userDisplayName(user: Pick<User, "name" | "email"> | null | undefined): string {
  if (!user) return "Unbekannt";
  return user.name ?? user.email ?? "Unbekannt";
}

export function roleLabel(role: string | null | undefined): string {
  switch (role) {
    case "admin": return "Admin";
    case "editor": return "Editor";
    case "photographer": return "Fotograf";
    case "drone_pilot": return "Drohnen-Pilot";
    case "customer": return "Kunde";
    default: return role ?? "—";
  }
}
