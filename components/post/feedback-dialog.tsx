"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  loading: boolean;
}

export function FeedbackDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">O que precisa mudar?</CardTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            disabled={loading}
          >
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ex: mudar o tom para mais informal, trocar o CTA..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={() => onSubmit(feedback)}
              disabled={loading || !feedback.trim()}
              className="bg-neon-pink text-white hover:bg-neon-pink/80"
            >
              Enviar feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
