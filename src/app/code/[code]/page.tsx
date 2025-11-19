// src/app/code/[code]/page.ts
import StatsPage from "@/components/StatsPage";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <StatsPage code={code} />;
}