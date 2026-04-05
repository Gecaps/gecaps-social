"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";
import type { Post } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

interface PostOfDayProps {
  post: Post;
}

export function PostOfDay({ post }: PostOfDayProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Post do dia</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={PILAR_COLORS[post.pilar]}
            >
              {PILAR_LABELS[post.pilar]}
            </Badge>
            <Badge
              variant="outline"
              className={STATUS_COLORS[post.status]}
            >
              {STATUS_LABELS[post.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Preview placeholder — dark neon style */}
          <div className="relative aspect-[4/5] w-full max-w-[270px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-[#0a0a0a] via-[#121218] to-[#0a0a0a] border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-pink/5" />
            <div className="relative flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-white/50">
                  GECAPS
                </span>
                <span className="rounded-full bg-neon-pink/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-pink">
                  {PILAR_LABELS[post.pilar]}
                </span>
              </div>

              <div className="space-y-3">
                {post.hook && (
                  <p className="text-xs font-medium uppercase tracking-widest text-neon-cyan/60">
                    {post.hook.split(" ").slice(0, 4).join(" ")}
                  </p>
                )}
                <h3 className="text-lg font-extrabold leading-tight text-white">
                  {post.title}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neon-cyan">
                  {post.cta}
                </span>
                <span className="text-xs font-medium text-white/30">
                  @gecapsbrasil
                </span>
              </div>
            </div>
          </div>

          {/* Caption + Actions */}
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h3 className="mb-1 font-semibold">{post.title}</h3>
              {post.hook && (
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{post.hook}&rdquo;
                </p>
              )}
            </div>

            <Separator />

            <div className="flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Legenda
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {post.caption}
              </p>
            </div>

            {post.hashtags && (
              <p className="text-xs text-neon-cyan/70">
                {post.hashtags}
              </p>
            )}

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <Button className="bg-neon-cyan text-black font-semibold hover:bg-neon-cyan/80">
                <CheckCircle2 className="size-4" />
                Aprovar
              </Button>
              <Button variant="outline" className="border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10">
                <RefreshCw className="size-4" />
                Refazer
              </Button>
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-foreground">
                <ExternalLink className="size-4" />
                Ver completo
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Agendado para {post.scheduled_date} as {post.scheduled_time} · Versao {post.current_version}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
