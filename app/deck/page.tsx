import { DeckClient } from "@/app/deck/deck-client";
import { auth } from "@/lib/services/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DeckPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return <DeckClient  />;
}
