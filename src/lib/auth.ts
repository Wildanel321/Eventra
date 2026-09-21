import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export type UserRole = "SUPER_ADMIN" | "ORGANIZER" | "EVENT_ADMIN" | "STAFF" | "SPEAKER" | "ATTENDEE";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  company: string | null;
  jobTitle: string | null;
  activeOrgId?: string | null;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["*"],
  ORGANIZER: [
    "event.create",
    "event.update",
    "event.delete",
    "event.publish",
    "ticket.manage",
    "attendee.view",
    "attendee.manage",
    "attendee.checkin",
    "analytics.view",
    "staff.manage",
    "speaker.manage",
    "schedule.manage",
    "coupon.manage",
    "certificate.manage",
    "export.data",
  ],
  EVENT_ADMIN: [
    "event.update",
    "ticket.manage",
    "attendee.view",
    "attendee.manage",
    "attendee.checkin",
    "analytics.view",
    "speaker.manage",
    "schedule.manage",
    "certificate.manage",
  ],
  STAFF: [
    "attendee.view",
    "attendee.checkin",
    "ticket.validate",
    "scanner.use",
  ],
  SPEAKER: [
    "speaker.profile",
    "session.view",
    "session.materials",
  ],
  ATTENDEE: [
    "event.explore",
    "ticket.purchase",
    "ticket.view",
    "ticket.transfer",
    "certificate.view",
    "review.create",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission) || perms.includes("*");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const SESSION_COOKIE_NAME = "eventra_session";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      // Fallback default demo user if no cookie for instant smooth exploration
      const demoUser = await prisma.user.findFirst({
        where: { role: "ORGANIZER" },
        include: { memberships: true },
      });
      if (!demoUser) return null;
      return {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role as UserRole,
        avatar: demoUser.avatar,
        company: demoUser.company,
        jobTitle: demoUser.jobTitle,
        activeOrgId: demoUser.memberships[0]?.orgId || null,
      };
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as UserRole,
      avatar: session.user.avatar,
      company: session.user.company,
      jobTitle: session.user.jobTitle,
      activeOrgId: session.user.memberships[0]?.orgId || null,
    };
  } catch {
    return null;
  }
}
