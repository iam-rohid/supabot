import CloseChatboxButton from "@/components/CloseChatboxButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChatbotWidgetLayout, {
  useChatbotWidget,
} from "@/layouts/ChatbotWidgetLayout";
import { NextPageWithLayout } from "@/types/next";
import { trpc } from "@/utils/trpc";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";

const ConversationsPage: NextPageWithLayout = () => {
  const { chatbot, user, startConversation, startConversationLoading } =
    useChatbotWidget();
  const conversationsQuery = trpc.conversation.publicList.useQuery(
    {
      chatbotId: chatbot.id || "",
      userId: user?.id || "",
    },
    {
      enabled: !!user?.id,
    },
  );

  return (
    <>
      <header className="flex items-center gap-2 border-b p-2 pl-4">
        <h1 className="flex-1 text-lg font-semibold">
          Conversations ({conversationsQuery.data?.length || 0})
        </h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={startConversation}
              disabled={startConversationLoading}
            >
              <div className="sr-only">New Conversation</div>
              {startConversationLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Plus size={20} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Conversation</TooltipContent>
        </Tooltip>
        <CloseChatboxButton />
      </header>
      {user ? (
        <div className="flex-1 overflow-auto">
          {conversationsQuery.isLoading ? (
            new Array(5).fill(1).map((_, i) => (
              <div className="flex flex-col border-b p-4" key={i}>
                <Skeleton className="h-6 w-2/3" />
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))
          ) : conversationsQuery.isError ? (
            <p>{conversationsQuery.error.message}</p>
          ) : (
            conversationsQuery.data.map((conversation) => {
              const lastMessage = conversation.messages[0];
              return (
                <Link
                  href={`/widgets/c/${chatbot.id}/conversations/${conversation.id}`}
                  key={conversation.id}
                  className="flex flex-col border-b p-4 hover:bg-secondary"
                >
                  <p className="truncate font-medium">
                    {conversation.title ||
                      (lastMessage
                        ? `${lastMessage.role}: ${lastMessage.body}`
                        : undefined) ||
                      conversation.id}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{conversation.status}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(
                        new Date(conversation.messages[0].updatedAt),
                        {
                          addSuffix: true,
                        },
                      )}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="text-center text-2xl font-semibold">
            No Conversations
          </h2>
          <p className="mt-1 text-center text-muted-foreground">
            Please log in to preserve and see all your conversations here.
          </p>
          <Button asChild className="mt-8">
            <Link href={`/widgets/c/${chatbot.id}/account`}>
              Let&apos;s Log In
              <ArrowRight size={20} className="-mr-1 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
};

ConversationsPage.getLayout = (page) => (
  <ChatbotWidgetLayout>{page}</ChatbotWidgetLayout>
);

export default ConversationsPage;
