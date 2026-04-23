import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Partner",
    short_name: "Habit Partner",
    description: "Accountability de hábitos entre parceiros",
    start_url: "/hoje",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafaf7",
    theme_color: "#ff5300",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
