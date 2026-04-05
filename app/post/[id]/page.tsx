import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post/post-detail";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: post } = await supabase()
    .from("social_posts")
    .select("*, social_accounts(handle)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  // Flatten account handle
  const postWithHandle = {
    ...post,
    account_handle: post.social_accounts?.handle || "@gecapsbrasil",
  };

  const { data: versions } = await supabase()
    .from("social_post_versions")
    .select("*")
    .eq("post_id", id)
    .order("version", { ascending: false });

  return <PostDetail post={postWithHandle} versions={versions || []} />;
}
