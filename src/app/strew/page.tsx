"use client";

import { uploadApi, ENDPOINT } from "@/lib/endpoint";
import { useEffect, useState } from "react";
import Image from "next/image";
import Skeleton from "@/components/atom/Skeleton";
import { Film } from "lucide-react";

interface Strew {
  _id: string;
  tittle: string;
  description: string;
  genre: string;
  tags: string[];
  thumbnail: string[];
  s3_video_source: string;
  createdAt: string;
  updatedAt: string;
}

function StrewPage() {
  const [data, setData] = useState<Strew[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrews = async () => {
      try {
        setLoading(true);
        const response = await uploadApi.get(ENDPOINT.fetchAllStrews);
        if (response.data.strews) {
          setData(response.data.strews);
        }
      } catch (error) {
        console.error("Failed to fetch strews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrews();
  }, []);

  return (
    <div className="mt-[75px] lg:mt-0">
      {loading ? <StrewSectionFallback /> : <StrewSectionData data={data} />}
    </div>
  );
}

function StrewSectionData({ data }: { data: Strew[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-8 px-6 bg-[#0c0a09] text-[white]">
        <h2 className="text-2xl font-medium mb-6">Strews</h2>
        <div>No strews have been uploaded yet</div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 bg-[#0c0a09] text-[white]">
      <h2 className="text-2xl font-medium mb-6">Strews</h2>
      <div className="flex flex-wrap gap-4 w-full">
        {data.map((strew) => (
          <div
            key={strew._id}
            className="group relative w-[180px] aspect-[2/3] cursor-pointer overflow-hidden rounded-lg bg-surface-inset"
          >
            {strew.thumbnail?.[0] ? (
              <Image
                alt={strew.tittle}
                fill
                unoptimized
                className="object-cover"
                src={strew.thumbnail[0]}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-content-subtle">
                <Film className="size-8" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 ease-out group-hover:translate-y-0">
              <p className="truncate text-sm font-semibold text-white">
                {strew.tittle}
              </p>
              <span className="mt-1.5 inline-block rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-medium text-brand">
                {strew.genre}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrewSectionFallback() {
  return (
    <div className="py-8 px-6 bg-[#0c0a09] text-[white]">
      <h2 className="text-2xl font-medium mb-6">Strews</h2>
      <div className="flex flex-wrap gap-4 w-full">
        {new Array(8).fill(0).map((_, index) => (
          <Skeleton key={index} className="w-[180px] aspect-[2/3] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default StrewPage;
