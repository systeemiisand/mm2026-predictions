"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  display_name: string;
  avatar: string | null;
  created_at: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar, created_at")
        .order("created_at", { ascending: true });

      setMembers(data ?? []);
    }

    loadMembers();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-black">Osalejad</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-cyan-300">
                Member {index + 1}
              </div>

              {member.id === userId && (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                  You
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                {member.avatar ?? "⚽"}
              </div>

              <div className="text-xl font-black">{member.display_name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
