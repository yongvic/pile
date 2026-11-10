import type { Metadata } from "next";
import { getProfile, isDemo } from "@/lib/repo";

export async function adminMetadata(title: string): Promise<Metadata> {
  if (!isDemo()) {
    const profile = await getProfile();
    if (!profile || profile.role !== "operateur") return { title: "Page introuvable" };
  }
  return { title };
}
