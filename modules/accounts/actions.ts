"use server";

import { revalidatePath } from "next/cache";
import { createAccount, updateAccount } from "./queries";

export async function createAccountAction(formData: FormData) {
  const name = formData.get("name") as string;
  const handle = formData.get("handle") as string;
  const platform = formData.get("platform") as string;
  const avatar_url = (formData.get("avatar_url") as string) || null;

  const account = await createAccount({
    name,
    handle,
    platform,
    avatar_url,
    active: true,
  });

  revalidatePath("/contas");
  return account;
}

export async function updateAccountAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const handle = formData.get("handle") as string;
  const platform = formData.get("platform") as string;
  const avatar_url = (formData.get("avatar_url") as string) || null;
  const active = formData.get("active") === "true";

  const account = await updateAccount(id, {
    name,
    handle,
    platform,
    avatar_url,
    active,
  });

  revalidatePath("/contas");
  return account;
}
