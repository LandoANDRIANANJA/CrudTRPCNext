import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import prisma from '@/db';

export const productRouter = createTRPCRouter({
  list: baseProcedure.query(async () => prisma.product.findMany()),
  get: baseProcedure.input(z.object({ id: z.number() })).query(async ({ input }) =>
    prisma.product.findUnique({ where: { id: input.id } })
  ),
  create: baseProcedure.input(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
  })).mutation(async ({ input }) => prisma.product.create({ data: input })),
  update: baseProcedure.input(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
  })).mutation(async ({ input }) =>
    prisma.product.update({
      where: { id: input.id },
      data: { name: input.name, description: input.description, price: input.price },
    })
  ),
  delete: baseProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) =>
    prisma.product.delete({ where: { id: input.id } })
  ),
}); 