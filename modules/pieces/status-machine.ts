import type { PieceStatus } from "@/modules/accounts/types";

const VALID_TRANSITIONS: Record<PieceStatus, PieceStatus[]> = {
  reference: ["idea"],
  idea: ["idea_approved", "rejected"],
  idea_approved: ["in_production"],
  in_production: ["final_approved", "rejected"],
  final_approved: ["scheduled"],
  scheduled: ["published"],
  rejected: ["in_adjustment"],
  in_adjustment: ["in_production"],
  published: [],
  paused: [],
};

const PAUSABLE: PieceStatus[] = [
  "reference",
  "idea",
  "idea_approved",
  "in_production",
  "final_approved",
  "scheduled",
  "rejected",
  "in_adjustment",
];

export function canTransition(from: PieceStatus, to: PieceStatus): boolean {
  if (to === "paused") return PAUSABLE.includes(from);
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidNextStatuses(current: PieceStatus): PieceStatus[] {
  const next = [...(VALID_TRANSITIONS[current] ?? [])];
  if (PAUSABLE.includes(current)) next.push("paused");
  return next;
}

export function validateTransition(from: PieceStatus, to: PieceStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} → ${to}`);
  }
}
