"use server";

import { revalidatePath } from "next/cache";
import type { PieceStatus } from "@/modules/accounts/types";
import { validateTransition } from "./status-machine";
import { getPieceById, updatePiece, createVersion } from "./queries";

export async function transitionPieceStatus(
  pieceId: string,
  newStatus: PieceStatus,
  reason?: string
) {
  const piece = await getPieceById(pieceId);
  if (!piece) throw new Error("Piece not found");

  validateTransition(piece.status, newStatus);

  const updates: Record<string, unknown> = { status: newStatus };

  if (newStatus === "rejected" && reason) {
    updates.rejection_reason = reason;
  }
  if (newStatus === "published") {
    updates.published_date = new Date().toISOString();
  }

  const updated = await updatePiece(pieceId, updates);
  revalidatePath("/");
  return updated;
}

export async function savePieceAction(pieceId: string, formData: FormData) {
  const piece = await getPieceById(pieceId);
  if (!piece) throw new Error("Piece not found");

  const caption = formData.get("caption") as string | null;
  const hashtags = formData.get("hashtags") as string | null;
  const imageUrl = formData.get("image_url") as string | null;
  const creativeBrief = formData.get("creative_brief") as string | null;
  const visualDirection = formData.get("visual_direction") as string | null;
  const slideStructureRaw = formData.get("slide_structure") as string | null;
  const changeType = formData.get("change_type") as string | null;
  const feedback = formData.get("feedback") as string | null;

  const slideStructure = slideStructureRaw
    ? JSON.parse(slideStructureRaw)
    : null;

  // Create version snapshot
  await createVersion({
    piece_id: pieceId,
    version: piece.current_version,
    caption: piece.caption,
    hashtags: piece.hashtags,
    image_url: piece.image_url,
    creative_brief: piece.creative_brief,
    visual_direction: piece.visual_direction,
    slide_structure: piece.slide_structure,
    change_type: changeType,
    feedback,
  });

  // Update piece with new fields and increment version
  const updated = await updatePiece(pieceId, {
    caption,
    hashtags,
    image_url: imageUrl,
    creative_brief: creativeBrief,
    visual_direction: visualDirection,
    slide_structure: slideStructure,
    current_version: piece.current_version + 1,
  });

  revalidatePath("/");
  return updated;
}
