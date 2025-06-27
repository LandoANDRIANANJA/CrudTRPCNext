import { z } from 'zod';
import {  protectedProcedure, createTRPCRouter } from '@/trpc/init';
import prisma from '@/db';
import { TRPCError } from '@trpc/server';

export const homeRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(z.object({
      lastName: z.string(),
      firstName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        try {
            const {user} = ctx;
            const {lastName, firstName} = input;
           
            const updatedUser = await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    lastName, firstName,
                },
            });
            return updatedUser;
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            });
        }
    }),
});