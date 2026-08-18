"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

const fieldClass =
  "w-full rounded-[8px] border border-[#e8e8e8] bg-white px-3 py-3 text-sm text-[#14171c] outline-none placeholder:text-[#6b7280] focus-visible:border-[#c4962c] focus-visible:ring-2 focus-visible:ring-[#c4962c]/30";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [visible, setVisible] = useState(false);

  return (
    <div className="min-h-dvh bg-[#fafafa] text-[#14171c]">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <motion.div
          className="relative hidden overflow-hidden border-r border-[#e8e8e8] bg-white lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Terra Ferro Tech" width={44} height={44} className="h-11 w-11 object-contain" />
              <div>
                <p className="text-sm font-semibold tracking-wide">Terra Ferro Tech</p>
                <p className="text-[11px] tracking-[0.16em] uppercase text-[#6b7280]">Management Console</p>
              </div>
            </div>
            <div>
              <p className="text-[12px] tracking-[0.22em] uppercase text-[#a67b1d]">Admin</p>
              <h1 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[0.95]">Yönetim paneli</h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#4d5561]">
                Ürün, galeri ve içerik yönetimi. Oturumlar kayıt altına alınır.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-center bg-[#f8f9fa] px-5 py-12">
          <motion.div
            className="w-full max-w-md rounded-[12px] border border-[#e8e8e8] bg-white p-7 shadow-[0_8px_24px_rgb(17_19_21/0.04)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
              <p className="text-sm font-semibold">Terra Ferro Tech</p>
            </div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#a67b1d]">Yönetim Paneli</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Giriş Yap</h2>
            <p className="mt-1 text-sm text-[#4d5561]">E-posta veya kullanıcı adınızla oturum açın.</p>

            <form action={formAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#4d5561]" htmlFor="username">
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
                <label className="mb-1.5 block text-xs font-medium text-[#4d5561]" htmlFor="password">
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#6b7280] hover:text-[#14171c]"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {state.error ? (
                <p id="login-error" role="alert" className="text-sm text-[#b42318]">
                  {state.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-[8px] bg-[#c4962c] px-4 py-3 text-sm font-semibold tracking-[0.08em] text-[#1a1404] uppercase disabled:opacity-60"
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
