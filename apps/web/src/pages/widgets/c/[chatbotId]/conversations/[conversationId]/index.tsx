import BotMessageBubble from "@/components/BotMessageBubble";
import ChatboxHeader from "@/components/ChatboxHeader";
import UserMessageBubble from "@/components/UserMessageBubble";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import ChatbotWidgetLayout, {
  useChatbotWidget,
} from "@/layouts/ChatbotWidgetLayout";
import { NextPageWithLayout } from "@/types/next";
import { trpc } from "@/utils/trpc";
import { ArrowLeft, Loader2, RefreshCw, SendHorizonal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useCompletion } from "ai/react";
import TextareaAutosize from "react-textarea-autosize";
import { Message } from "@acme/db";
import { ChatbotSettings } from "@acme/core/validators";

const ConversationPage: NextPageWithLayout = () => {
  const router = useRouter();
  const conversationId = router.query.conversationId as string;
  const chatbotId = router.query.chatbotId as string;
  const { user, chatbot } = useChatbotWidget();
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const utils = trpc.useContext();
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatbotSettings = (chatbot.settings ?? {}) as ChatbotSettings;
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const messagesQuery = trpc.message.list.useQuery(
    { conversationId },
    { enabled: router.isReady },
  );

  const scrollToBottom = useCallback(() => {
    if (!scrollElRef.current) return;
    if (!autoScroll) return;
    scrollElRef.current.scrollTo({
      top: scrollElRef.current.scrollHeight,
      behavior: isScrolledToBottom ? "smooth" : "instant",
    });
    if (messagesQuery.isSuccess && !isScrolledToBottom) {
      setIsScrolledToBottom(true);
    }
  }, [autoScroll, isScrolledToBottom, messagesQuery.isSuccess]);

  const { completion, complete } = useCompletion({
    api: `/api/chat`,
    body: {
      conversationId,
      userId: user?.id,
    },
    async onError(error) {
      toast({
        title: "Error",
        description: error.message ?? "Something went wrong!",
        variant: "destructive",
      });
      setIsLoading(false);
      await messagesQuery.refetch();
    },
    async onFinish(_, comp) {
      utils.message.list.setData({ conversationId }, (data) => [
        ...(data || []),
        {
          id: "bot-msg",
          role: "BOT",
          body: comp,
          conversationId,
          userId: user?.id ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: null,
          reaction: null,
        },
      ]);
      setIsLoading(false);
      await messagesQuery.refetch();
    },
  });

  const conversationQuery = trpc.conversation.public.publicGetById.useQuery(
    { conversationId },
    { enabled: router.isReady },
  );

  const quickPromptsQuery = trpc.quickPrompt.list.useQuery(
    { chatbotId },
    { enabled: router.isReady },
  );

  const reactOnMessageMutation = trpc.message.react.useMutation({
    onSuccess: () => {
      toast({ title: "Thank you for your feedback" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMessageReact = useCallback(
    async (message: Message, reaction: Message["reaction"]) => {
      if (!conversationQuery.isSuccess) return;
      if (conversationQuery.data.status === "CLOSED") return;
      if (message.reaction === reaction) {
        reaction = null;
      }

      utils.message.list.setData(
        { conversationId: conversationQuery.data.id },
        (data) =>
          data?.map((msg) =>
            msg.id === message.id ? { ...msg, reaction } : msg,
          ),
      );
      try {
        await reactOnMessageMutation.mutateAsync({ id: message.id, reaction });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong!",
          variant: "destructive",
        });
        utils.message.list.setData(
          { conversationId: conversationQuery.data.id },
          (data) =>
            data?.map((msg) =>
              msg.id === message.id
                ? { ...msg, reaction: message.reaction }
                : msg,
            ),
        );
      }
    },
    [
      conversationQuery.data?.id,
      conversationQuery.data?.status,
      conversationQuery.isSuccess,
      reactOnMessageMutation,
      toast,
      utils.message.list,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (isLoading || conversationQuery.data?.status !== "OPEN") {
      return;
    }

    const message = input.trim();
    if (message.length === 0) {
      toast({ title: "Please enter your message", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setInput("");

    utils.message.list.setData({ conversationId }, (data) => [
      ...(data || []),
      {
        id: "optimestic-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "USER",
        body: message,
        userId: user?.id || null,
        conversationId,
        reaction: null,
        metadata: null,
      },
    ]);

    complete(message);
  }, [
    complete,
    conversationId,
    conversationQuery.data?.status,
    input,
    isLoading,
    toast,
    user?.id,
    utils.message.list,
  ]);

  useEffect(() => {
    if (!scrollElRef.current) return;
    const el = scrollElRef.current;
    const handleWheel = () => {
      if (el.scrollTop === el.scrollHeight - el.clientHeight && !autoScroll) {
        setAutoScroll(true);
      }
      if (el.scrollTop !== el.scrollHeight - el.clientHeight && autoScroll) {
        setAutoScroll(false);
      }
    };
    el.addEventListener("wheel", handleWheel);
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScroll, scrollElRef.current]);

  useEffect(() => {
    if (!autoScroll) return;
    scrollToBottom();
  }, [autoScroll, completion, messagesQuery.data?.length, scrollToBottom]);

  if (conversationQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (conversationQuery.error) {
    return <div>{conversationQuery.error.message}</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatboxHeader
        title={conversationQuery.data.title || chatbot.name}
        leading={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" asChild>
                <Link href={`/widgets/c/${chatbot.id}`}>
                  <p className="sr-only">go to home</p>
                  <ArrowLeft size={22} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to home</TooltipContent>
          </Tooltip>
        }
        trailing={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  conversationQuery.refetch();
                  messagesQuery.refetch();
                }}
                disabled={
                  conversationQuery.isRefetching || messagesQuery.isRefetching
                }
              >
                <p className="sr-only">Refresh Conversation</p>
                {conversationQuery.isRefetching ||
                messagesQuery.isRefetching ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <RefreshCw size={22} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Conversation</TooltipContent>
          </Tooltip>
        }
      />

      {messagesQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : messagesQuery.isError ? (
        <div className="flex-1 p-4">
          <p>Messages Error: {messagesQuery.error.message}</p>
        </div>
      ) : (
        <div className="relative flex-1 overflow-y-auto" ref={scrollElRef}>
          <div className="space-y-6 p-4">
            {chatbotSettings.welcomeMessage && (
              <BotMessageBubble
                name="BOT"
                message={chatbotSettings.welcomeMessage}
                date={conversationQuery.data.createdAt}
                theme={chatbotSettings.theme}
              />
            )}

            {messagesQuery.data.map((message) => {
              return (
                <Fragment key={message.id}>
                  {message.role === "BOT" ? (
                    <BotMessageBubble
                      name="BOT"
                      message={message.body}
                      onReact={(value) => handleMessageReact(message, value)}
                      reaction={message.reaction}
                      sources={(message.metadata as any)?.sources}
                      date={message.createdAt}
                      theme={chatbotSettings.theme}
                    />
                  ) : (
                    <UserMessageBubble
                      name="YOU"
                      message={message.body}
                      date={message.createdAt}
                    />
                  )}
                </Fragment>
              );
            })}

            {isLoading ? (
              completion ? (
                <BotMessageBubble
                  message={completion}
                  theme={chatbotSettings.theme}
                  date={new Date()}
                  name="BOT"
                />
              ) : (
                <div className="flex items-start">
                  <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-xl rounded-tl-sm p-4">
                    <Skeleton className="bg-foreground/20 h-2 w-2 rounded-full"></Skeleton>
                    <Skeleton className="bg-foreground/20 h-2 w-2 rounded-full delay-300"></Skeleton>
                    <Skeleton className="bg-foreground/20 h-2 w-2 rounded-full delay-700"></Skeleton>
                  </div>
                </div>
              )
            ) : null}
          </div>

          {!isLoading && quickPromptsQuery.isSuccess && (
            <div className="flex flex-wrap justify-end gap-2 p-4">
              {quickPromptsQuery.data
                .filter(
                  (p) =>
                    p.isFollowUpPrompt !== (messagesQuery.data?.length === 0),
                )
                .map((prompt) => (
                  <Button
                    key={prompt.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(prompt.prompt);
                      handleSubmit();
                    }}
                  >
                    {prompt.title}
                  </Button>
                ))}
            </div>
          )}
        </div>
      )}

      {conversationQuery.data.status === "OPEN" ? (
        <div className="bg-card text-card-foreground border-t backdrop-blur-lg">
          <form
            className="flex items-center gap-2 p-0"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <TextareaAutosize
              className="flex-1 resize-none bg-transparent p-4 outline-none"
              autoFocus
              placeholder={
                chatbotSettings.placeholderText ?? "Ask me anything..."
              }
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              minRows={1}
              maxRows={5}
              onKeyDown={(e) => {
                if (e.code === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center pr-2">
              <button
                type="submit"
                disabled={isLoading}
                className="text-primary p-2 transition-all hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <SendHorizonal size={24} />
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex h-14 items-center border-t px-4">
          <p className="text-muted-foreground flex-1 text-center">
            This conversation has been closed
          </p>
        </div>
      )}
    </div>
  );
};

ConversationPage.getLayout = (page) => (
  <ChatbotWidgetLayout hideTabBar>{page}</ChatbotWidgetLayout>
);

export default ConversationPage;
