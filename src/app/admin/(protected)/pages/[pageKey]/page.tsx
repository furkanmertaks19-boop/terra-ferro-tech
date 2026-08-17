import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { canPublish } from "@/lib/roles";
import { isPageKey } from "@/lib/page-cms";
import { getEditorPage } from "@/lib/pages";
import PageEditor from "@/components/admin/pages/PageEditor";

export const dynamic = "force-dynamic";

export default async function AdminPageEditorPage({ params }: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = await params;
  if (!isPageKey(pageKey)) notFound();
  const user = await getCurrentUser();
  const { revision, hasUnpublishedChanges } = await getEditorPage(pageKey);
  return (
    <PageEditor
      pageKey={pageKey}
      initial={revision}
      hasUnpublishedChanges={hasUnpublishedChanges}
      canPublishPages={user ? canPublish(user.role) : false}
    />
  );
}
