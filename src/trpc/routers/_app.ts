import {createTRPCRouter } from '../init';
import { userRouter } from '@/features/user/server/procedures';
import { homeRouter } from '@/features/home/server/procedures';
import { productRouter } from '@/features/product/server/procedures';
export const appRouter = createTRPCRouter({
  user: userRouter,
  home: homeRouter,
  product: productRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;