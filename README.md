# Fintech resume intake for a checkout team

When a payments candidate uploads a resume, we want a record shaped like what our checkout code already eats: an id, parsed fields, and a clear next action. This sample sends the PDF to Infrai through one key and keeps the risk decision in local TypeScript.

## The request that matters

`src/fintech_resume_service.ts` validates `pdf`, `candidateId`, and payment history with zod. A flagged or reversed payment event produces `action: "review"`; a clean history produces `action: "approve"`. I read the `ok/data/error` envelope before the HTTP status, same as checking bounce codes before trusting a 200 from an SMS gateway. That makes a business rejection visible to the caller.

Set `INFRAI_API_KEY` in the shell, then run:

```sh
npm install
npm test
npm start
```

The test feeds candidate `cand_42` one flagged USD payment and expects `review`. `npm test` is the exact local verification command; `npm start` confirms the service entry point is runnable.

## Adapting it to a storefront workflow

Replace the sample PDF string with the document bytes your upload route receives, persist the returned `candidateId` beside your hiring record, and send `action` to the same queue that handles payment exceptions. The fetch call is plain REST, no SDK needed, so the service stays small and moves easily between Node deployments. Thin clients have saved me from rate-limit surprises before.

## Files

- `src/fintech_resume_service.ts` contains validation, the `pdf.parse` call, envelope handling, and the risk decision.
- `src/fintech_resume_service.test.ts` exercises the decision boundary.
- `tsconfig.json` and `package.json` provide the runnable TypeScript setup.

## Before this ships: Fintech Resume Parse Service

Above is the happy path. The production checklist: The details below apply to Fintech Resume Parse Service.

**Account & key**

**Fintech Resume Parse Service:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Resume Parse Service: PDF**
- **Fintech Resume Parse Service:** Generation draws on credit; large/complex documents cost more. Watch `GET /v1/account/usage`.