"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

const fieldClass =
  "w-full rounded-[10px] border border-[#3a3f46] bg-[#1c1f24] px-3 py-3 text-sm text-[#f3eee4] outline-none placeholder:text-[#8b9098] focus-visible:border-[#c4962c] focus-visible:ring-2 focus-visible:ring-[#c4962c]/40";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [visible, setVisible] = useState(false);

  return (
    <div className="min-h-dvh bg-[#111315] text-[#f3eee4]">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <motion.div
          className="relative hidden overflow-hidden lg:block"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgb(196_150_44/0.18),transparent_55%),linear-gradient(180deg,#16181c,#0d0f11)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Terra Ferro Tech" width={44} height={44} className="h-11 w-11 object-contain" />
              <div>
                <p className="text-sm font-semibold tracking-wide text-[#f3eee4]">Terra Ferro Tech</p>
                <p className="text-[11px] tracking-[0.16em] uppercase text-[#9aa0a8]">Management Console</p>
              </div>
            </div>
            <div>
              <p className="text-[12px] tracking-[0.22em] uppercase text-[#c4962c]">Admin</p>
              <h1 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[0.95] text-[#f3eee4]">
                Yönetim paneli
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#c5c0b6]">
                Ürün, galeri ve içerik yönetimi. Oturumlar kayıt altına alınır.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-center bg-[#15171a] px-5 py-12">
          <motion.div
            className="w-full max-w-md rounded-[16px] border border-[#2c3036] bg-[#1a1d21] p-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
              <p className="text-sm font-semibold text-[#f3eee4]">Terra Ferro Tech</p>
            </div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#c4962c]">Yönetim Paneli</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#f3eee4]">Giriş Yap</h2>
            <p className="mt-1 text-sm text-[#c5c0b6]">E-posta veya kullanıcı adınızla oturum açın.</p>

            <form action={formAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#d8d3c9]" htmlFor="username">
                  E-posta veya kullanıcı adı
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  autoFocus
                  aria-invalid={state.error ? true : undefined}
                  aria-describedby={state.error ? "login-error" : undefined}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#d8d3c9]" htmlFor="password">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    aria-invalid={state.error ? true : undefined}
                    aria-describedby={state.error ? "login-error" : undefined}
                    className={`${fieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#9aa0a8] hover:text-[#f3eee4]"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {state.error ? (
                <p id="login-error" role="alert" className="text-sm text-[#f0a8a2]">
                  {state.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-[10px] bg-[#c4962c] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-[#1a1404] uppercase disabled:opacity-60"
              >
                {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
