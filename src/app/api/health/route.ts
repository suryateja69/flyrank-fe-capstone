export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({
    status: "ok",
    service: "LeadDesk",
    aiConfigured: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
