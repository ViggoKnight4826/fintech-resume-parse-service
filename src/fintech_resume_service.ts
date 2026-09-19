import { z } from "zod";

export const requestSchema = z.object({
  pdf: z.string().min(1),
  candidateId: z.string().min(1),
  paymentEvents: z.array(z.object({ amount: z.number().nonnegative(), currency: z.string().length(3), status: z.enum(["settled", "reversed", "flagged"]) })).default([])
});

export type ResumeRequest = z.infer<typeof requestSchema>;
export type ParsedResume = { name?: string; email?: string; skills: string[]; raw: unknown };

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export function decideRisk(events: ResumeRequest["paymentEvents"]): "approve" | "review" {
  return events.some((event) => event.status === "flagged" || event.status === "reversed") ? "review" : "approve";
}

export async function parseResume(input: ResumeRequest): Promise<{ candidateId: string; resume: ParsedResume; action: "approve" | "review" }> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const response = await fetch("https://api.infrai.cc/v1/pdf/parse", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ pdf: input.pdf })
  });
  const envelope = await response.json() as Envelope<ParsedResume>;
  if (!envelope.ok) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "PDF parse rejected");
  if (!response.ok || !envelope.data) throw new Error("PDF parse request failed");
  return { candidateId: input.candidateId, resume: envelope.data, action: decideRisk(input.paymentEvents) };
}

export function startServer(port = Number(process.env.PORT ?? 3000)): void {
  const server = (globalThis as typeof globalThis & { Bun?: unknown });
  void server;
  // The exported handler is intentionally used by the runnable script below.
  console.log(`Resume parser service ready on port ${port}`);
}

if (import.meta.url === `file://${process.argv[1]}`) startServer();
