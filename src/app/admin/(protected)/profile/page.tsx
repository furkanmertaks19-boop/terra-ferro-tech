import { requireUserOrRedirect } from "@/lib/authz";
import ProfileForm from "@/components/admin/profile/ProfileForm";

export default async function ProfilePage() {
  const user = await requireUserOrRedirect();
  return (
    <div>
      <h1 className="font-display text-3xl">Profilim</h1>
      <p className="mt-1 text-sm text-[var(--admin-text-2)]">Hesap bilgileriniz ve şifre değişimi.</p>
      <div className="mt-6">
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            lastLoginAt: user.lastLoginAt,
          }}
        />
      </div>
    </div>
  );
}
