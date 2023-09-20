import DashboardPageHeader from "@/components/DashboardPageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatbotLayout from "@/layouts/ChatbotLayout";
import { useChatbot } from "@/providers/ChatbotProvider";
import { NextPageWithLayout } from "@/types/next";
import { trpc } from "@/utils/trpc";
import { ChatbotUser } from "@prisma/client";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

type Data = ChatbotUser & { _count: { conversations: number } };

const columns: ColumnDef<Data>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "id",
    header: () => <div>ID</div>,
  },
  {
    accessorKey: "name",
    header: () => <div>NAME</div>,
  },
  {
    accessorKey: "email",
    header: () => <div>EMAIL</div>,
  },
  {
    id: "conversations",
    header: () => <div>Conversations</div>,
    cell: ({ row }) => <div>{row.original._count.conversations || "0"}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => {
      return <ActionButton data={row.original} />;
    },
  },
];

const ActionButton = ({ data }: { data: Data }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Block User</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ChatbotUsersPage: NextPageWithLayout = () => {
  const { isLoaded, chatbot } = useChatbot();
  const chatbotUsersQuery = trpc.chatbotUser.list.useQuery(
    {
      chatbotId: chatbot?.id || "",
    },
    { enabled: isLoaded },
  );

  const data = useMemo(
    () => chatbotUsersQuery.data || [],
    [chatbotUsersQuery.data],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <DashboardPageHeader title="Users" />

      <div className="container">
        {chatbotUsersQuery.isLoading ? (
          <div className="flex items-center justify-center rounded-lg border py-32">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <DataTable table={table} />
        )}
      </div>
    </>
  );
};

ChatbotUsersPage.getLayout = (page) => <ChatbotLayout>{page}</ChatbotLayout>;

export default ChatbotUsersPage;
