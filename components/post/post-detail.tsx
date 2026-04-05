"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Clock,
  History,
} from "lucide-react";
import type { Post, PostVersion, PostLayout } from "@/lib/types";
import {
  PILAR_LABELS,
  PILAR_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/types";
import { FeedbackDialog } from "./feedback-dialog";
import { LayoutSelector } from "./layout-selector";
import { GenerateCaptionButton } from "./generate-caption-button";

interface PostDetailProps {
  post: Post;
  versions: PostVersion[];
}

export function PostDetail({ post, versions }: PostDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(post.status);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [layout, setLayout] = useState<PostLayout>((post.layout as PostLayout) || "branco");
  const [captionText, setCaptionText] = useState(post.caption || "");
  const [hashtagsText, setHashtagsText] = useState(post.hashtags || "");

  const previewUrl = `/api/preview?title=${encodeURIComponent(post.title)}&hook=${encodeURIComponent(post.hook || "")}&pilar=${post.pilar}&cta=${encodeURIComponent(post.cta || "")}&layout=${layout}`;

  async function handleLayoutChange(newLayout: PostLayout) {
    setLayout(newLayout);
    await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: newLayout }),
    });
  }

  async function handleApprove() {
    setLoading(true);
    const res = await fetch(`/api/posts/${post.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) {
      setStatus("approved");
      setToast("Post aprovado!");
      setTimeout(() => setToast(null), 3000);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleReject(feedback: string) {
    setLoading(true);
    const res = await fetch(`/api/posts/${post.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", feedback }),
    });
    if (res.ok) {
      setStatus("rejected");
      setShowFeedback(false);
      setToast("Post rejeitado. Nova versao sera gerada.");
      setTimeout(() => setToast(null), 3000);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Detalhe do post</h1>
          <p className="text-sm text-muted-foreground">
            {post.scheduled_date} as {post.scheduled_time}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={PILAR_COLORS[post.pilar]}>
            {PILAR_LABELS[post.pilar]}
          </Badge>
          <Badge variant="outline" className={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        {/* Preview + layout selector */}
        <div className="space-y-3 lg:w-[400px]">
          <LayoutSelector selected={layout} onSelect={handleLayoutChange} />
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Image
                key={layout}
                src={previewUrl}
                alt={post.title}
                width={1080}
                height={layout === "quote" ? 1080 : 1350}
                className="w-full"
                unoptimized
              />
            </CardContent>
          </Card>
        </div>

        {/* Details panel */}
        <div className="space-y-4">
          {/* Title & hook */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-lg font-bold">{post.title}</h2>
              {post.hook && (
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{post.hook}&rdquo;
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {post.scheduled_time}
                </span>
                <span>Versao {post.current_version}</span>
                <span className="capitalize">{post.format}</span>
              </div>
            </CardContent>
          </Card>

          {/* Caption */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Legenda</CardTitle>
              <GenerateCaptionButton
                postId={post.id}
                onGenerated={(c, h) => {
                  setCaptionText(c);
                  setHashtagsText(h);
                }}
              />
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {captionText || post.caption || "Nenhuma legenda gerada ainda. Clique em 'Gerar com IA'."}
              </p>
              {(hashtagsText || post.hashtags) && (
                <p className="mt-3 text-xs text-neon-pink dark:text-neon-cyan/70">
                  {hashtagsText || post.hashtags}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {status === "pending" && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-primary text-primary-foreground font-semibold hover:bg-primary/80"
                >
                  <CheckCircle2 className="size-4" />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(true)}
                  disabled={loading}
                  className="border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10"
                >
                  <RefreshCw className="size-4" />
                  Refazer
                </Button>
              </>
            )}
            {status === "approved" && (
              <div className="flex items-center gap-2 rounded-lg bg-status-approved/10 px-4 py-2 text-sm font-medium text-neon-cyan dark:text-neon-cyan">
                <CheckCircle2 className="size-4" />
                Post aprovado
              </div>
            )}
            {status === "rejected" && (
              <Button
                onClick={() => setStatus("pending")}
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/80"
              >
                Revisar novamente
              </Button>
            )}
          </div>

          {/* Version history */}
          {versions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="size-4" />
                  Historico de versoes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold">
                        Versao {v.version}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {v.feedback && (
                      <p className="text-xs text-neon-pink">
                        Feedback: {v.feedback}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {v.caption}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-card px-4 py-2 text-sm font-medium shadow-lg border border-border lg:bottom-6">
          {toast}
        </div>
      )}

      {/* Feedback dialog */}
      <FeedbackDialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleReject}
        loading={loading}
      />
    </div>
  );
}
