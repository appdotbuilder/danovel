
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createUserInputSchema,
  createNovelInputSchema,
  createChapterInputSchema,
  createReviewInputSchema,
  createCommentInputSchema,
  updateUserInputSchema,
  updateNovelInputSchema,
  updateChapterInputSchema,
  getNovelsQuerySchema,
  getChaptersQuerySchema,
  getUsersQuerySchema,
  searchNovelsInputSchema,
  getReviewsInputSchema,
  getCommentsInputSchema,
  moderateCommentInputSchema,
  purchaseCoinsInputSchema,
  unlockChapterInputSchema,
  getTransactionsInputSchema,
  updateReadingProgressInputSchema,
  toggleFavoriteInputSchema,
  getAuthorStatsInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { updateUser } from './handlers/update_user';
import { createNovel } from './handlers/create_novel';
import { getNovels } from './handlers/get_novels';
import { updateNovel } from './handlers/update_novel';
import { createChapter } from './handlers/create_chapter';
import { getChapters } from './handlers/get_chapters';
import { updateChapter } from './handlers/update_chapter';
import { createReview } from './handlers/create_review';
import { getReviews } from './handlers/get_reviews';
import { createComment } from './handlers/create_comment';
import { getComments } from './handlers/get_comments';
import { moderateComment } from './handlers/moderate_comment';
import { purchaseCoins } from './handlers/purchase_coins';
import { unlockChapter } from './handlers/unlock_chapter';
import { getTransactions } from './handlers/get_transactions';
import { updateReadingProgress } from './handlers/update_reading_progress';
import { getReadingProgress } from './handlers/get_reading_progress';
import { toggleFavorite } from './handlers/toggle_favorite';
import { getDashboardStats } from './handlers/get_dashboard_stats';
import { searchNovels } from './handlers/search_novels';
import { getAuthorStats } from './handlers/get_author_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUsers: publicProcedure
    .input(getUsersQuerySchema)
    .query(({ input }) => getUsers(input)),

  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  // Novel management
  createNovel: publicProcedure
    .input(createNovelInputSchema)
    .mutation(({ input }) => createNovel(input, 1)), // TODO: Get author ID from context

  getNovels: publicProcedure
    .input(getNovelsQuerySchema)
    .query(({ input }) => getNovels(input)),

  updateNovel: publicProcedure
    .input(updateNovelInputSchema)
    .mutation(({ input }) => updateNovel(input)),

  searchNovels: publicProcedure
    .input(searchNovelsInputSchema)
    .query(({ input }) => searchNovels(input.query, input.limit)),

  // Chapter management
  createChapter: publicProcedure
    .input(createChapterInputSchema)
    .mutation(({ input }) => createChapter(input)),

  getChapters: publicProcedure
    .input(getChaptersQuerySchema)
    .query(({ input }) => getChapters(input)),

  updateChapter: publicProcedure
    .input(updateChapterInputSchema)
    .mutation(({ input }) => updateChapter(input)),

  // Review system
  createReview: publicProcedure
    .input(createReviewInputSchema)
    .mutation(({ input }) => createReview(input, 1)), // TODO: Get user ID from context

  getReviews: publicProcedure
    .input(getReviewsInputSchema)
    .query(({ input }) => getReviews(input.novelId)),

  // Comment system
  createComment: publicProcedure
    .input(createCommentInputSchema)
    .mutation(({ input }) => createComment(input, 1)), // TODO: Get user ID from context

  getComments: publicProcedure
    .input(getCommentsInputSchema)
    .query(({ input }) => getComments(input.chapterId)),

  moderateComment: publicProcedure
    .input(moderateCommentInputSchema)
    .mutation(({ input }) => moderateComment(input.commentId, input.isApproved)),

  // Monetization
  purchaseCoins: publicProcedure
    .input(purchaseCoinsInputSchema)
    .mutation(({ input }) => purchaseCoins(1, input.amount, input.description)), // TODO: Get user ID from context

  unlockChapter: publicProcedure
    .input(unlockChapterInputSchema)
    .mutation(({ input }) => unlockChapter(1, input.chapterId, input.coinCost)), // TODO: Get user ID from context

  getTransactions: publicProcedure
    .input(getTransactionsInputSchema)
    .query(({ input }) => getTransactions(input.userId)),

  // Reading progress
  updateReadingProgress: publicProcedure
    .input(updateReadingProgressInputSchema)
    .mutation(({ input }) => updateReadingProgress(1, input.novelId, input.chapterId)), // TODO: Get user ID from context

  getReadingProgress: publicProcedure
    .query(() => getReadingProgress(1)), // TODO: Get user ID from context

  toggleFavorite: publicProcedure
    .input(toggleFavoriteInputSchema)
    .mutation(({ input }) => toggleFavorite(1, input.novelId)), // TODO: Get user ID from context

  // Admin dashboard
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),

  getAuthorStats: publicProcedure
    .input(getAuthorStatsInputSchema)
    .query(({ input }) => getAuthorStats(input.authorId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`DANOVEL TRPC server listening at port: ${port}`);
}

start();
