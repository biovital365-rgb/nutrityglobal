import "server-only";

import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export type AppRole = "USER" | "COACH" | "ADMIN";
export type AuthenticatedUser = User & { organization: { id: string; name: string } | null };

export class AccessDeniedError extends Error {
  constructor(message: "Unauthorized" | "Forbidden" = "Forbidden") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) return null;

  return prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { firebaseUid: user.id },
        ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
      ],
    },
    include: { organization: true },
  });
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user || user.status === "BLOCKED") throw new AccessDeniedError("Unauthorized");
  return user;
}

export async function requireRole(...roles: AppRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!roles.includes(user.role as AppRole)) throw new AccessDeniedError();
  return user;
}

export async function findUserByIdOrAuthId(idOrUid: string) {
  if (!idOrUid) throw new AccessDeniedError();
  return prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id: idOrUid }, { firebaseUid: idOrUid }],
    },
  });
}

export async function requireUserAccess(
  idOrUid: string,
  options: { coachAllowed?: boolean } = {},
) {
  const actor = await requireUser();
  const target = await findUserByIdOrAuthId(idOrUid);
  if (!target) throw new AccessDeniedError();

  const isSelf = actor.id === target.id;
  const isAdmin = actor.role === "ADMIN";
  const isAssignedCoach = options.coachAllowed === true
    && actor.role === "COACH"
    && Boolean(actor.organizationId)
    && actor.organizationId === target.organizationId;

  if (!isSelf && !isAdmin && !isAssignedCoach) throw new AccessDeniedError();
  return { actor, target };
}

export function organizationScope(actor: AuthenticatedUser, requested?: string | null) {
  if (actor.role === "ADMIN") return requested || undefined;
  if (actor.role === "COACH" && actor.organizationId) return actor.organizationId;
  throw new AccessDeniedError();
}

export async function requireOrganizationResource(
  organizationId: string | null,
  roles: AppRole[] = ["COACH", "ADMIN"],
) {
  const actor = await requireRole(...roles);
  if (actor.role !== "ADMIN" && actor.organizationId !== organizationId) {
    throw new AccessDeniedError();
  }
  return actor;
}
