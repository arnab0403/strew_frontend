"use client"

import Image from "next/image";
import { ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Clapperboard, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ENDPOINT, uploadApi } from "@/lib/endpoint";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadedVideo {
  bucket: string;
  key: string;
  contentType: string;
  size: number;
}

interface UploadVideoResponse {
  message: string;
  status: string;
  upload: UploadedVideo;
}

const STATUS_TEXT: Record<UploadStatus, string> = {
  idle: "",
  uploading: "Uploading high definition asset...",
  success: "Upload complete",
  error: "Upload failed",
};

const MAX_TRAILER_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
const TRAILER_TYPES = ["video/mp4", "video/quicktime"];
const THUMBNAIL_SLOTS = 3;

function formatSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

const labelClass = "mb-2 block text-xs font-semibold text-brand";
const lightInputClass = "w-full rounded-md bg-content px-3 py-2.5 text-sm text-surface placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-brand/60";

function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [trailer, setTrailer] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const uploadController = useRef<AbortController | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [thumbnails, setThumbnails] = useState<(string | null)[]>(Array(THUMBNAIL_SLOTS).fill(null));
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const thumbnailInput = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef(0);
  const thumbnailUrls = useRef(thumbnails);
  thumbnailUrls.current = thumbnails;

  // Free object URLs and stop any in-flight upload when leaving the page
  useEffect(() => () => {
    thumbnailUrls.current.forEach((url) => url && URL.revokeObjectURL(url));
    uploadController.current?.abort();
  }, []);

  const startUpload = async (file: File) => {
    uploadController.current?.abort();
    const controller = new AbortController();
    uploadController.current = controller;

    setProgress(0);
    setUploadStatus("uploading");
    setUploadedVideo(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await uploadApi.post<UploadVideoResponse>(ENDPOINT.uploadVideo, formData, {
        signal: controller.signal,
        // hold at 99% until the server confirms the file is stored
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.min(99, (e.loaded / e.total) * 100));
        },
      });

      if (response.data.status !== "success") throw new Error(response.data.message);

      setProgress(100);
      setUploadStatus("success");
      setUploadedVideo(response.data.upload);
      toast.success(response.data.message || "Video uploaded successfully");
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      setUploadStatus("error");
      toast.error(error.response?.data?.message || error.message || "Video upload failed");
    } finally {
      if (uploadController.current === controller) uploadController.current = null;
    }
  };

  const cancelUpload = () => {
    uploadController.current?.abort();
    uploadController.current = null;
    setTrailer(null);
    setProgress(0);
    setUploadStatus("idle");
    setUploadedVideo(null);
  };

  const selectTrailer = (file?: File) => {
    if (!file) return;
    if (!TRAILER_TYPES.includes(file.type)) return toast.warning("Only MP4 or MOV files are supported");
    if (file.size > MAX_TRAILER_BYTES) return toast.warning("Trailer must be 2GB or smaller");
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    setTrailer(file);
    startUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    selectTrailer(e.dataTransfer.files[0]);
  };

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) setTags([...tags, tag]);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const openThumbnailPicker = (slot: number) => {
    pendingSlot.current = slot;
    thumbnailInput.current?.click();
  };

  const handleThumbnail = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const slot = pendingSlot.current;
    setThumbnails((prev) => {
      const next = [...prev];
      if (next[slot]) URL.revokeObjectURL(next[slot]);
      next[slot] = URL.createObjectURL(file);
      return next;
    });
    setActiveThumbnail(slot);
  };

  const resetForm = () => {
    thumbnails.forEach((url) => url && URL.revokeObjectURL(url));
    setTitle("");
    setDescription("");
    setTags([]);
    setTagInput("");
    cancelUpload();
    setThumbnails(Array(THUMBNAIL_SLOTS).fill(null));
    setActiveThumbnail(0);
  };

  const handlePublish = () => {
    if (!trailer) return toast.warning("Please upload a trailer");
    if (!title.trim()) return toast.warning("Title is required");
    if (uploadStatus === "uploading") return toast.warning("Please wait for the upload to finish");
    if (uploadStatus !== "success") return toast.warning("Trailer upload failed, please retry");
    toast.success("Your movie is ready to publish", { description: uploadedVideo?.key });
  };

  const roundedProgress = Math.round(progress);
  const ringCircumference = 2 * Math.PI * 22;
  const activePreview = thumbnails[activeThumbnail];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-surface px-4 pb-16 pt-24 text-content md:px-8 lg:px-10 lg:pt-10">
      {/* Page background: poster wall under a deep black overlay that melts into the footer */}
      <Image src="/background-upload.png" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/85 via-black/90 to-surface" />

      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight">Upload Movie</h1>
        <p className="mt-1 text-sm text-content-muted">Share your masterpiece with the exclusive Strew community.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left column: upload status + details form */}
          <div className="flex flex-col gap-4">
            {trailer && (
              <div className="flex items-center gap-5 rounded-xl border border-brand/10 bg-brand/10 p-5">
                <div className="relative grid size-14 shrink-0 place-items-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="22" fill="none" strokeWidth="3" className="stroke-hairline" />
                    <circle
                      cx="25" cy="25" r="22" fill="none" strokeWidth="3" strokeLinecap="round"
                      className={`${uploadStatus === "error" ? "stroke-destructive" : "stroke-brand"} transition-[stroke-dashoffset] duration-300`}
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringCircumference * (1 - progress / 100)}
                    />
                  </svg>
                  <span className="text-xs font-bold text-brand">{roundedProgress}%</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold">{title || trailer.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-content-muted">
                    {STATUS_TEXT[uploadStatus]}
                    {uploadStatus === "error" && (
                      <button
                        type="button"
                        onClick={() => startUpload(trailer)}
                        className="ml-2 cursor-pointer text-brand underline-offset-2 hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-content-muted">
                      {trailer.type === "video/quicktime" ? "MOV" : "MP4"}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-content-muted">
                      {formatSize(trailer.size)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Cancel upload"
                  onClick={cancelUpload}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-content-muted transition-colors hover:bg-white/10 hover:text-content"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface-raised p-5">
              <div>
                <label htmlFor="title" className={labelClass}>Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Interstellar - Director's Cut"
                  className={lightInputClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>Description</label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers what your movie is about..."
                  className="w-full resize-none rounded-md border border-hairline bg-surface-inset px-3 py-2.5 text-sm leading-6 text-content placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-brand/60"
                />
              </div>

              <div>
                <label htmlFor="tags" className={labelClass}>Genre Tags</label>
                {tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand">
                        {tag}
                        <button
                          type="button"
                          aria-label={`Remove ${tag}`}
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="cursor-pointer hover:text-brand-hover"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder="Add more tags (Press Enter)"
                  className={lightInputClass}
                />
              </div>
            </div>
          </div>

          {/* Right column: trailer drop zone, thumbnails, actions */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-hairline bg-surface-raised p-3">
              <p className="mb-3 text-center text-xs text-content-muted">Upload Movie</p>
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${isDragging ? "border-brand" : "border-transparent hover:border-brand/50"}`}
              >
                <Image src="/background.jpg" alt="" fill sizes="320px" className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/60 to-black/80" />
                <div className="relative flex flex-col items-center px-4 text-center">
                  <Clapperboard className="size-10 text-brand" strokeWidth={1.75} />
                  <p className="mt-3 text-xl font-bold">{trailer ? "Replace Trailer" : "Upload Trailer"}</p>
                  <p className="mt-1 text-xs font-medium text-content-muted">MP4, MOV (max. 2GB)</p>
                  {trailer && <p className="mt-2 max-w-full truncate text-xs text-brand">{trailer.name}</p>}
                </div>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  className="sr-only"
                  onChange={(e) => { selectTrailer(e.target.files?.[0]); e.target.value = ""; }}
                />
              </label>
              <div className="mx-auto mt-3 h-1.5 w-1/3 rounded-full bg-hairline" />
            </div>

            <div className="rounded-xl border border-hairline bg-surface-raised p-4">
              <p className={labelClass}>Thumbnail Preview</p>
              <button
                type="button"
                onClick={() => openThumbnailPicker(activeThumbnail)}
                className="relative grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-md bg-surface-inset text-content-subtle transition-colors hover:text-content-muted"
              >
                {activePreview ? (
                  <Image src={activePreview} alt="Selected thumbnail" fill unoptimized className="object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <ImagePlus className="size-6" />
                    Add a thumbnail
                  </span>
                )}
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {thumbnails.map((url, slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-label={url ? `Use thumbnail ${slot + 1}` : `Add thumbnail ${slot + 1}`}
                    onClick={() => (url ? setActiveThumbnail(slot) : openThumbnailPicker(slot))}
                    className={`relative grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-md border bg-surface-inset text-content-subtle transition-colors ${activeThumbnail === slot ? "border-brand" : "border-transparent hover:border-hairline"}`}
                  >
                    {url ? (
                      <Image src={url} alt="" fill unoptimized className="object-cover" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                  </button>
                ))}
              </div>
              <input ref={thumbnailInput} type="file" accept="image/*" className="sr-only" onChange={handleThumbnail} />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 cursor-pointer rounded-lg border border-hairline bg-surface-inset py-3 text-sm font-semibold transition-colors hover:border-content-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="flex-1 cursor-pointer rounded-lg bg-linear-to-b from-brand-hover to-brand py-3 text-sm font-semibold text-brand-foreground shadow-[0_8px_24px_-8px] shadow-brand/60 transition-[filter] hover:brightness-110"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default UploadPage;
