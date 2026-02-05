"use client";

import { useState } from "react";
import { ratings, users } from "@/lib/mock-data";

export function RatingsBoard() {
  const [score, setScore] = useState("5");
  const [comment, setComment] = useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {ratings.map((rating) => {
          const from = users.find((user) => user.userId === rating.fromUserId);
          const to = users.find((user) => user.userId === rating.toUserId);

          return (
            <article key={rating.ratingId} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-600">
                {from?.username} je ocenio/la korisnika {to?.username}
              </p>
              <p className="mt-1 text-lg font-semibold">{rating.score}/5</p>
              <p className="mt-2 text-sm text-slate-700">{rating.comment}</p>
            </article>
          );
        })}
      </div>

      <form
        className="rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setComment("");
        }}
      >
        <h2 className="text-base font-semibold">Ostavi Novu Ocenu</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[160px,1fr]">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-slate-500">Ocena</span>
            <select
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            >
              {["5", "4", "3", "2", "1"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-slate-500">Komentar</span>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Kratak utisak..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            />
          </label>
        </div>
        <button className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Pošalji
        </button>
      </form>
    </div>
  );
}
