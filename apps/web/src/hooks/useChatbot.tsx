import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export const useChatbot = () => {
  const router = useRouter();
  const chatbotId = router.query.chatbotId as string;
  return trpc.chatbot.findById.useQuery(
    { chatbotId },
    { enabled: router.isReady && !!chatbotId },
  );
};
