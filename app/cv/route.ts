import { NextResponse } from "next/server";
import { readCv } from "@/lib/repo";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("profil");
  if (!id) return new NextResponse("CV introuvable.", { status: 404 });
  const file = await readCv(id);
  if (!file) return new NextResponse("CV introuvable.", { status: 404 });
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=cv.pdf",
    },
  });
}
