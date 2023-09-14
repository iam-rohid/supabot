import { router } from "../trpc";
import { chatbotRouter } from "./chatbot";
import { chatbotUserRouter } from "./chatbotUser";
import { clerkRouter } from "./clerk";
import { conversationRouter } from "./conversation";
import { linkRouter } from "./link";
import { messageRouter } from "./message";
import { quickPromptRouter } from "./quickPrompt";
import { stripeRouter } from "./stripe";
import { subscriptionRouter } from "./subscription";
import { utilsRouter } from "./utils";

export const appRouter = router({
  chatbot: chatbotRouter,
  link: linkRouter,
  utils: utilsRouter,
  quickPrompt: quickPromptRouter,
  conversation: conversationRouter,
  chatbotUser: chatbotUserRouter,
  message: messageRouter,
  clerk: clerkRouter,
  subscription: subscriptionRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
