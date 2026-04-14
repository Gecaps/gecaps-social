"use server";

import { revalidatePath } from "next/cache";
import { upsertPlaybook } from "./queries";

export async function savePlaybookAction(
  accountId: string,
  formData: FormData
) {
  const tone_of_voice = (formData.get("tone_of_voice") as string) || null;
  const style = (formData.get("style") as string) || null;
  const default_cta = (formData.get("default_cta") as string) || null;
  const do_examples = (formData.get("do_examples") as string) || null;
  const dont_examples = (formData.get("dont_examples") as string) || null;
  const extra_instructions =
    (formData.get("extra_instructions") as string) || null;

  const mandatoryRaw = (formData.get("mandatory_words") as string) || "";
  const forbiddenRaw = (formData.get("forbidden_words") as string) || "";

  const mandatory_words = mandatoryRaw
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
  const forbidden_words = forbiddenRaw
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

  const postExamplesRaw = formData.get("post_examples") as string;
  const post_examples = postExamplesRaw
    ? JSON.parse(postExamplesRaw)
    : [];

  const playbook = await upsertPlaybook(accountId, {
    tone_of_voice,
    style,
    mandatory_words,
    forbidden_words,
    default_cta,
    do_examples,
    dont_examples,
    post_examples,
    extra_instructions,
  });

  revalidatePath(`/contas/${accountId}`);
  return playbook;
}
