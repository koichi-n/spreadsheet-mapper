import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/app-config";
import { MapApp } from "@/client";
import { getAreaData } from "@/server";

export const runtime = "nodejs";
export const revalidate = 300;

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
};

export default async function Page() {
  const data = await getAreaData();
  return (
    <MapApp
      prefectures={data.prefectures}
      source={data.source}
      fetchedAt={data.fetchedAt}
      error={data.error}
      warnings={data.warnings}
    />
  );
}
