"use client";

import ShareButton from "@/components/Section/ShareButton";
import { ENDPOINT, uploadApi } from "@/lib/endpoint";
import { Film, Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface VideoUrlResponse {
  status: string;
  url: string;
  expiresAt: number;
}

function StrewWatchPageContent() {
  const searchParams = useSearchParams();
  const publicId = searchParams.get("publicId");
  const title = searchParams.get("title") || "Strew";
  const poster = searchParams.get("poster") || undefined;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(publicId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchTemporaryVideoUrl = async () => {
      setLoading(true);
      setError(null);
      setVideoUrl(null);

      try {
        const response = await uploadApi.get<VideoUrlResponse>(
          ENDPOINT.fetchUploadedVideoUrl,
          {
            params: { publicId },
            signal: controller.signal,
          },
        );

        if (!response.data.url) {
          throw new Error("The server did not return a video URL");
        }

        setVideoUrl(response.data.url);
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to authorize video playback. Please log in again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTemporaryVideoUrl();
    return () => controller.abort();
  }, [publicId]);

  if (!publicId) {
    return (
      <UnavailableState
        icon={<TriangleAlert className="size-20" strokeWidth={1.25} />}
        message="This video does not have a streaming source."
      />
    );
  }

  if (error) {
    return (
      <UnavailableState
        icon={<TriangleAlert className="size-20" strokeWidth={1.25} />}
        message={error}
      />
    );
  }

  return (
    <main className="mt-16 min-h-[calc(100vh-4rem)] bg-surface lg:mt-0 lg:min-h-screen">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col lg:min-h-screen">
        <div className="flex flex-1 items-center bg-black">
          {loading || !videoUrl ? (
            <div className="flex w-full items-center justify-center text-content-muted">
              <Loader2 className="mr-2 size-5 animate-spin" /> Authorizing video...
            </div>
          ) : (
            <video
              key={publicId}
              src={videoUrl}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="max-h-[78vh] w-full"
              aria-label={`Watch ${title}`}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <h1 className="min-w-0 truncate text-lg font-semibold text-content sm:text-2xl">
            {title}
          </h1>
          <ShareButton />
        </div>
      </div>
    </main>
  );
}

function UnavailableState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <main className="mt-16 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-surface px-4 text-content-muted lg:mt-0 lg:min-h-screen">
      {icon}
      <p className="mt-4 text-center">{message}</p>
      <Link
        href="/strew"
        className="mt-4 rounded-md bg-brand px-3 py-2 text-sm text-brand-foreground hover:bg-brand-hover"
      >
        Browse Strews
      </Link>
    </main>
  );
}

function Page() {
  return (
    <Suspense
      fallback={
        <main className="mt-16 flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface text-content-muted lg:mt-0 lg:min-h-screen">
          <Film className="mr-2 size-5" /> Loading video...
        </main>
      }
    >
      <StrewWatchPageContent />
    </Suspense>
  );
}

export default Page;
