"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

const OUTPUT_SIZE = 512;

type AvatarCropperProps = {
  src: string;
  onCropped: (blob: Blob) => void;
};

export function AvatarCropper({ src, onCropped }: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
      width,
      height,
    );
    setCrop(initial);
  }, []);

  const exportCrop = useCallback(async () => {
    const image = imgRef.current;
    if (!image || !completed) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      completed.x * scaleX,
      completed.y * scaleY,
      completed.width * scaleX,
      completed.height * scaleY,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) onCropped(blob);
      },
      "image/jpeg",
      0.9,
    );
  }, [completed, onCropped]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center rounded-[14px] bg-bg p-3">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompleted(c)}
          aspect={1}
          circularCrop
          keepSelection
          minWidth={48}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="Imagem a recortar"
            onLoad={onImageLoad}
            className="max-h-80 w-auto"
          />
        </ReactCrop>
      </div>
      <p className="text-xs text-muted-foreground">
        Ajuste a área circular. A imagem será salva em {OUTPUT_SIZE}×{OUTPUT_SIZE}px.
      </p>
      <button
        type="button"
        onClick={exportCrop}
        disabled={!completed}
        className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-4 text-sm font-medium text-surface transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Aplicar recorte
      </button>
    </div>
  );
}
