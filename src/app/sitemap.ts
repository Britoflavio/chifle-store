import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://chifle.store", lastModified: new Date() }, { url: "https://chifle.store/checkout", lastModified: new Date() }];
}
