"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useChatbot } from "@/providers/ChatbotProvider";
import { useConversation } from "@/providers/ConversatonProvider";

const schema = z.object({
  message: z.string().min(1, "Please enter your message").max(500),
});
type FormType = z.infer<typeof schema>;

export default function MessageInputForm() {
  const { settings } = useChatbot();
  const { sendMessage, isSending } = useConversation();
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
    },
  });

  return (
    <form
      className="relative"
      onSubmit={form.handleSubmit((data) => {
        sendMessage(data);
        form.reset();
      })}
    >
      <input
        type="text"
        className="h-[52px] w-full rounded-xl bg-slate-100 pl-4 pr-14 placeholder-slate-400"
        placeholder={settings.placeholderText}
        {...form.register("message")}
      />
      <button
        type="submit"
        className="absolute right-1 top-1 flex h-[44px] w-[44px] items-center justify-center rounded-lg bg-[var(--primary-bg)] text-[var(--primary-fg)] disabled:opacity-50"
        disabled={isSending}
      >
        {isSending ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin"
          >
            <path
              d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5004 12H5.00043M4.91577 12.2915L2.58085 19.2662C2.39742 19.8142 2.3057 20.0881 2.37152 20.2569C2.42868 20.4034 2.55144 20.5145 2.70292 20.5567C2.87736 20.6054 3.14083 20.4869 3.66776 20.2497L20.3792 12.7296C20.8936 12.4981 21.1507 12.3824 21.2302 12.2216C21.2993 12.082 21.2993 11.9181 21.2302 11.7784C21.1507 11.6177 20.8936 11.5019 20.3792 11.2705L3.66193 3.74776C3.13659 3.51135 2.87392 3.39315 2.69966 3.44164C2.54832 3.48375 2.42556 3.59454 2.36821 3.74078C2.30216 3.90917 2.3929 4.18255 2.57437 4.72931L4.91642 11.7856C4.94759 11.8795 4.96317 11.9264 4.96933 11.9744C4.97479 12.0171 4.97473 12.0602 4.96916 12.1028C4.96289 12.1508 4.94718 12.1977 4.91577 12.2915Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        )}
      </button>
    </form>
  );
}
