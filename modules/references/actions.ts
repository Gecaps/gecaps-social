"use server";

import { revalidatePath } from "next/cache";
import { extractContent } from "./extractor";
import { createReference, deleteReference } from "./queries";
import type { ReferenceType } from "./types";

export async function addReferenceAction(
  accountId: string,
  formData: FormData
) {
  const type = formData.get("type") as ReferenceType;
  const sourceUrl = formData.get("source_url") as string | null;
  const rawText = formData.get("raw_text") as string | null;
  const fileUrl = formData.get("file_url") as string | null;

  let rawContent: string | null = null;

  if (type === "link" && sourceUrl) {
    rawContent = await extractContent("link", sourceUrl);
  } else if (type === "pdf" && (sourceUrl || fileUrl)) {
    rawContent = await extractContent("pdf", (sourceUrl || fileUrl)!);
  } else if (type === "text" && rawText) {
    rawContent = rawText;
  } else if (type === "file" && fileUrl) {
    rawContent = fileUrl;
  }

  const ref = await createReference({
    account_id: accountId,
    type,
    source_url: sourceUrl,
    raw_content: rawContent,
    file_url: fileUrl,
    summary: null,
    tags: [],
    suggested_pilar: null,
    suggested_format: null,
    relevance_score: null,
    status: "novo",
  });

  revalidatePath("/");
  return ref;
}

export async function deleteReferenceAction(
  accountId: string,
  referenceId: string
) {
  await deleteReference(referenceId);
  revalidatePath("/");
  return { success: true, accountId };
}
