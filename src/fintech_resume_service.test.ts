import assert from "node:assert/strict";
import { decideRisk, requestSchema } from "./fintech_resume_service.ts";

const input = requestSchema.parse({ pdf: "base64-pdf", candidateId: "cand_42", paymentEvents: [{ amount: 125, currency: "USD", status: "flagged" }] });
assert.equal(decideRisk(input.paymentEvents), "review");
assert.equal(decideRisk([]), "approve");
console.log("risk decision test passed");
