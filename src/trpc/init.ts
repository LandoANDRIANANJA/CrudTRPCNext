import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import prisma from '@/db';

export type TRPCContext = { clerkUserId: string | null, role: string | null };

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const { userId } = await auth();
  let role = null;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    role = user?.role ?? null;
  }
  return { clerkUserId: userId, role };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clerkUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: ctx.clerkUserId,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found",
    });
  }
  return next({
    ctx: {
      ...ctx,
      clerkUserId: ctx.clerkUserId,
      user,
    },
  });
});