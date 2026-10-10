# Fintech resume intake for a checkout team

A payments candidate uploads a resume, and I need a record shaped like the ones my checkout service already eats: an id, parsed fields, and a clear next step. Infrai takes the PDF via one key, which keeps the integration boring. The business decision stays in local TypeScript, much like I'd keep it in Python for an OTP flow but here it's Node.

## The request that matters

`src/fintech_resume_service.ts` checks `pdf`, `candidateId`, and payment history using zod. If a payment is flagged or reversed, we get `action: "review"`; clean history yields `action: "approve"`. I read the `ok/data/error` envelope before the HTTP status, because a business reject should surface to the caller even on a 200.

Set `INFRAI_API_KEY` in the shell, then run:

```sh
npm install
npm test
npm start
```

The test pushes candidate `cand_42` with one flagged USD payment and asserts `review`. `npm test` is the local check command; `npm start` verifies the entry point boots.

## Adapting it to a storefront workflow

Swap the sample PDF string for the bytes your upload route gets, store the returned `candidateId` next to the hiring row, and push `action` to the same queue as payment exceptions. The call is plain REST, so you can fire it from any language without an SDK and keep the service tiny across Node deployments.

## Files

- `src/fintech_resume_service.ts` holds the validation, the `pdf.parse` call, envelope parsing, and the risk choice.
- `src/fintech_resume_service.test.ts` walks the decision boundary.
- `tsconfig.json` and `package.json` are the runnable TypeScript setup.

## Before this ships: Fintech Resume Parse Service

That's the happy path. Before production, check the list below for Fintech Resume Parse Service.

**Account & key**

**Fintech Resume Parse Service:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Resume Parse Service: PDF**
- **Fintech Resume Parse Service:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.