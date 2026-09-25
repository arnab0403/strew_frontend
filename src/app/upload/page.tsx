"use client";

import Image from "next/image";
import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Clapperboard, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ENDPOINT, uploadApi } from "@/lib/endpoint";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadedVideo {
  assetId: string;
  publicId: string;
  version: number;
  format: string;
  resourceType: string;
  deliveryType: string;
  url?: string;
  thumbnailPublicId?: string;
  thumbnailUrl?: string;
  contentType: string;
  size: number;
}

interface UploadVideoResponse {
  message: string;
  status: string;
  upload: UploadedVideo;
}

interface StrewPayload {
  name: string;
  description: string;
  genre: string;
  tags: string[];
  thumbnail: string[];
  assetId: string;
  publicId: string;
  version: number;
  format: string;
  resourceType: string;
  deliveryType: string;
}

const STATUS_TEXT: Record<UploadStatus, string> = {
  idle: "",
  uploading: "Uploading high definition asset...",
  success: "Upload complete",
  error: "Upload failed",
};

const MAX_TRAILER_BYTES = 50 * 1024 * 1024; // 50MB
const TRAILER_TYPES = ["video/mp4", "video/quicktime"];
const THUMBNAIL_SLOTS = 3;

function formatSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

const labelClass = "mb-2 block text-xs font-semibold text-brand";
const lightInputClass =
  "w-full rounded-md bg-content px-3 py-2.5 text-sm text-surface placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-brand/60";

function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Action");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isPublishing, setIsPublishing] = useState(false);

  const [trailer, setTrailer] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null,
  );
  const uploadController = useRef<AbortController | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [thumbnails, setThumbnails] = useState<(string | null)[]>(
    Array(THUMBNAIL_SLOTS).fill(null),
  );
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const thumbnailInput = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef(0);
  const thumbnailUrls = useRef(thumbnails);
  thumbnailUrls.current = thumbnails;

  // Free object URLs and stop any in-flight upload when leaving the page
  useEffect(
    () => () => {
      thumbnailUrls.current.forEach(
        (url) => url && url.startsWith("blob:") && URL.revokeObjectURL(url),
      );
      uploadController.current?.abort();
    },
    [],
  );

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "strew";
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "strew_uploads";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
      );
      if (response.data.secure_url) {
        return response.data.secure_url;
      } else if (response.data.url) {
        return response.data.url;
      }
      throw new Error("No URL returned from Cloudinary");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "Cloudinary upload failed";
      throw new Error(errorMessage);
    }
  };

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
      const response = await uploadApi.post<UploadVideoResponse>(
        ENDPOINT.uploadVideo,
        formData,
        {
          signal: controller.signal,
          // hold at 99% until the server confirms the file is stored
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.min(99, (e.loaded / e.total) * 100));
          },
        },
      );

      if (response.data.status !== "success")
        throw new Error(response.data.message);

      const uploadedFile = response.data.upload;

      if (
        !uploadedFile?.assetId ||
        !uploadedFile.publicId ||
        uploadedFile.version === undefined ||
        !uploadedFile.format ||
        !uploadedFile.resourceType ||
        !uploadedFile.deliveryType
      ) {
        throw new Error("Upload response did not include Cloudinary asset metadata");
      }

      setProgress(100);
      setUploadStatus("success");
      setUploadedVideo(uploadedFile);
      if (uploadedFile.thumbnailUrl) {
        setThumbnails((previousThumbnails) => {
          const nextThumbnails = [...previousThumbnails];
          const previousThumbnail = nextThumbnails[0];
          if (previousThumbnail?.startsWith("blob:")) {
            URL.revokeObjectURL(previousThumbnail);
          }
          nextThumbnails[0] = uploadedFile.thumbnailUrl!;
          return nextThumbnails;
        });
        setActiveThumbnail(0);
      }
      toast.success(response.data.message || "Video uploaded successfully");
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      setUploadStatus("error");
      toast.error(
        error.response?.data?.message || error.message || "Video upload failed",
      );
    } finally {
      if (uploadController.current === controller)
        uploadController.current = null;
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
    if (!TRAILER_TYPES.includes(file.type))
      return toast.warning("Only MP4 or MOV files are supported");
    if (file.size > MAX_TRAILER_BYTES)
      return toast.warning("Trailer must be 50MB or smaller");
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
      if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
        setTags([...tags, tag]);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const openThumbnailPicker = (slot: number) => {
    if (uploadingSlot !== null) return;
    pendingSlot.current = slot;
    thumbnailInput.current?.click();
  };

  const handleThumbnail = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please select an image file");
      return;
    }

    const slot = pendingSlot.current;
    setUploadingSlot(slot);

    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      setThumbnails((prev) => {
        const next = [...prev];
        if (next[slot] && next[slot]?.startsWith("blob:"))
          URL.revokeObjectURL(next[slot]!);
        next[slot] = cloudinaryUrl;
        return next;
      });
      setActiveThumbnail(slot);
      toast.success("Thumbnail uploaded to Cloudinary!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload thumbnail to Cloudinary");
    } finally {
      setUploadingSlot(null);
    }
  };

  const resetForm = () => {
    thumbnails.forEach(
      (url) => url && url.startsWith("blob:") && URL.revokeObjectURL(url),
    );
    setTitle("");
    setDescription("");
    setGenre("Action");
    setTags([]);
    setTagInput("");
    cancelUpload();
    setThumbnails(Array(THUMBNAIL_SLOTS).fill(null));
    setActiveThumbnail(0);
  };

  const handlePublish = async () => {
    if (uploadStatus === "uploading") {
      return toast.warning("Please wait for video upload to finish");
    }

    if (!uploadedVideo || uploadStatus !== "success") {
      return toast.error("Video metadata is missing. Please upload a video first.");
    }

    if (!title.trim()) {
      return toast.error("Title is required.");
    }

    if (!description.trim()) {
      return toast.error("Description is required.");
    }

    if (!genre.trim()) {
      return toast.error("Genre is required.");
    }

    if (tags.length === 0) {
      return toast.error("At least one tag is required.");
    }

    const validThumbnails = thumbnails.filter((url): url is string =>
      Boolean(url && url.trim().length > 0),
    );
    if (validThumbnails.length === 0) {
      return toast.error("At least one thumbnail is required.");
    }

    const payload: StrewPayload = {
      name: title.trim(),
      description: description.trim(),
      genre: genre.trim(),
      tags: tags,
      thumbnail: validThumbnails,
      assetId: uploadedVideo.assetId,
      publicId: uploadedVideo.publicId,
      version: uploadedVideo.version,
      format: uploadedVideo.format,
      resourceType: uploadedVideo.resourceType,
      deliveryType: uploadedVideo.deliveryType,
    };

    try {
      setIsPublishing(true);
      const response = await uploadApi.post(ENDPOINT.uploadStrew, payload);
      toast.success(response.data?.message || "Strew published successfully!");
      resetForm();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to publish strew",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const roundedProgress = Math.round(progress);
  const ringCircumference = 2 * Math.PI * 22;
  const activePreview = thumbnails[activeThumbnail];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-surface px-4 pb-16 pt-24 text-content md:px-8 lg:px-10 lg:pt-10">
      {/* Page background: poster wall under a deep black overlay that melts into the footer */}
      <Image
        src="/background-upload.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/85 via-black/90 to-surface" />

      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight">Upload Movie</h1>
        <p className="mt-1 text-sm text-content-muted">
          Share your masterpiece with the exclusive Strew community.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left column: upload status + details form */}
          <div className="flex flex-col gap-4">
            {trailer && (
              <div className="flex items-center gap-5 rounded-xl border border-brand/10 bg-brand/10 p-5">
                <div className="relative grid size-14 shrink-0 place-items-center">
                  <svg
                    className="absolute inset-0 -rotate-90"
                    viewBox="0 0 50 50"
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="22"
                      fill="none"
                      strokeWidth="3"
                      className="stroke-hairline"
                    />
                    <circle
                      cx="25"
                      cy="25"
                      r="22"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={`${uploadStatus === "error" ? "stroke-destructive" : "stroke-brand"} transition-[stroke-dashoffset] duration-300`}
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={
                        ringCircumference * (1 - progress / 100)
                      }
                    />
                  </svg>
                  <span className="text-xs font-bold text-brand">
                    {roundedProgress}%
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold">
                    {title || trailer.name}
                  </p>
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
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Interstellar - Director's Cut"
                  className={lightInputClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
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
                <label htmlFor="genre" className={labelClass}>
                  Genre
                </label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {[
                    "Action",
                    "Comedy",
                    "Drama",
                    "Horror",
                    "Romance",
                    "Sci-Fi",
                    "Thriller",
                    "Anime",
                  ].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        genre.toLowerCase() === g.toLowerCase()
                          ? "bg-brand text-brand-foreground font-semibold"
                          : "border border-hairline bg-surface-inset text-content-muted hover:border-brand/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Genre (e.g. Action)"
                  className={lightInputClass}
                />
              </div>

              <div>
                <label htmlFor="tags" className={labelClass}>
                  Tags
                </label>
                {tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand"
                      >
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
              <p className="mb-3 text-center text-xs text-content-muted">
                Upload Movie
              </p>
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${isDragging ? "border-brand" : "border-transparent hover:border-brand/50"}`}
              >
                <Image
                  src="/background-upload.png"
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/60 to-black/80" />
                <div className="relative flex flex-col items-center px-4 text-center">
                  <Clapperboard
                    className="size-10 text-brand"
                    strokeWidth={1.75}
                  />
                  <p className="mt-3 text-xl font-bold">
                    {trailer ? "Replace Movie" : "Upload Movie"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-content-muted">
                    MP4, MOV (max. 50MB)
                  </p>
                  {trailer && (
                    <p className="mt-2 max-w-full truncate text-xs text-brand">
                      {trailer.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  className="sr-only"
                  onChange={(e) => {
                    selectTrailer(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="mx-auto mt-3 h-1.5 w-1/3 rounded-full bg-hairline" />
            </div>

            <div className="rounded-xl border border-hairline bg-surface-raised p-4">
              <p className={labelClass}>Thumbnail Preview</p>
              <button
                type="button"
                onClick={() => openThumbnailPicker(activeThumbnail)}
                disabled={uploadingSlot !== null}
                className="relative grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-md bg-surface-inset text-content-subtle transition-colors hover:text-content-muted disabled:cursor-not-allowed"
              >
                {uploadingSlot === activeThumbnail ? (
                  <span className="flex flex-col items-center gap-2 text-xs text-brand">
                    <Loader2 className="size-6 animate-spin" />
                    Uploading thumbnail to Cloudinary...
                  </span>
                ) : activePreview ? (
                  <Image
                    src={activePreview}
                    alt="Selected thumbnail"
                    fill
                    unoptimized
                    className="object-cover"
                  />
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
                    disabled={uploadingSlot !== null}
                    aria-label={
                      url
                        ? `Use thumbnail ${slot + 1}`
                        : `Add thumbnail ${slot + 1}`
                    }
                    onClick={() =>
                      url ? setActiveThumbnail(slot) : openThumbnailPicker(slot)
                    }
                    className={`relative grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-md border bg-surface-inset text-content-subtle transition-colors disabled:cursor-not-allowed ${activeThumbnail === slot ? "border-brand" : "border-transparent hover:border-hairline"}`}
                  >
                    {uploadingSlot === slot ? (
                      <Loader2 className="size-4 animate-spin text-brand" />
                    ) : url ? (
                      <Image
                        src={url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                  </button>
                ))}
              </div>
              <input
                ref={thumbnailInput}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleThumbnail}
              />
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
                disabled={isPublishing}
                className="flex-1 cursor-pointer rounded-lg bg-linear-to-b from-brand-hover to-brand py-3 text-sm font-semibold text-brand-foreground shadow-[0_8px_24px_-8px] shadow-brand/60 transition-[filter] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default UploadPage;
