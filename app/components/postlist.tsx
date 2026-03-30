"use client";

import { useState } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export default function PostList({ posts }: { posts: Post[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition"
        >
          <h3 className="text-lg font-bold capitalize">
            {post.title}
          </h3>

          {expandedId === post.id && (
            <p className="text-gray-600 mt-2">{post.body}</p>
          )}

          <button
            onClick={() =>
              setExpandedId(expandedId === post.id ? null : post.id)
            }
            className="mt-3 text-blue-600 font-semibold hover:underline"
          >
            {expandedId === post.id ? "Sembunyikan" : "Baca Selengkapnya"}
          </button>
        </div>
      ))}
    </div>
  );
}
