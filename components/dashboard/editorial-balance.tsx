import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post, EditorialLine } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS } from "@/lib/types";

interface EditorialBalanceProps {
  posts: Post[];
  editorialLines: EditorialLine[];
}

export function EditorialBalance({ posts, editorialLines }: EditorialBalanceProps) {
  if (editorialLines.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Linha editorial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {editorialLines.map((line) => {
          const count = posts.filter(p => p.pilar === line.pilar).length;
          const target = line.posts_per_week;
          const pct = Math.min((count / target) * 100, 100);

          return (
            <div key={line.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{PILAR_LABELS[line.pilar]}</span>
                <span className="text-muted-foreground">{count}/{target} posts</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: count >= target ? "#25F4EE" : count > 0 ? "#FFB300" : "transparent",
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
