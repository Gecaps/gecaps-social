"use server";

import { revalidatePath } from "next/cache";
import { createIdea, updateIdeaStatus } from "./queries";

export async function createManualIdeaAction(
  accountId: string,
  formData: FormData
) {
  const theme = formData.get("theme") as string;
  const angle = formData.get("angle") as string | null;
  const objective = formData.get("objective") as string | null;
  const suggestedFormat = formData.get("format") as string | null;
  const justification = formData.get("justification") as string | null;

  const idea = await createIdea({
    account_id: accountId,
    reference_id: null,
    theme,
    angle,
    objective,
    suggested_format: suggestedFormat,
    justification,
    brand_fit: null,
    status: "pending",
    is_manual: true,
  });

  revalidatePath("/");
  return idea;
}

export async function approveIdeaAction(accountId: string, ideaId: string) {
  const idea = await updateIdeaStatus(ideaId, "approved");
  revalidatePath("/");
  return { ...idea, accountId };
}

export async function rejectIdeaAction(accountId: string, ideaId: string) {
  const idea = await updateIdeaStatus(ideaId, "rejected");
  revalidatePath("/");
  return { ...idea, accountId };
}
