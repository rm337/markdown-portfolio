# Inkspirations Studios Client Support Desk Agent

**Owner:** Robert Marleton  
**Studio:** Inkspirations Studios  
**Purpose:** Give clients a simple way to request help, notify Robert immediately, and receive a fast, professional response without losing Robert's oversight.

## Core Experience

A client sees a support form labeled:

> Contact the Inkspirations Studios Support Desk

They enter:

- Name
- Email
- Company or project
- Subject
- What happened
- What they were trying to do
- Urgency
- Optional screenshot or file

When submitted, the system should:

1. Create a support ticket number.
2. Email Robert the full request.
3. Send the client an immediate acknowledgment.
4. Classify the request.
5. Draft a helpful reply.
6. Either send an approved automatic reply or hold the draft for Robert's approval, depending on the risk level.
7. Record the ticket and all responses.

## Two Response Levels

### Level 1: Safe Automatic Response
The agent may automatically send only low-risk replies such as:

- Confirmation that the request was received
- Request for a missing screenshot or error message
- Basic navigation instructions already approved by Robert
- Publicly documented troubleshooting steps
- Notice of expected response time
- Confirmation that Robert has been notified

### Level 2: Robert Approval Required
The agent must draft but not send replies involving:

- Prices or refunds
- Deadlines or delivery promises
- Contract terms
- Project scope changes
- Design decisions
- Account credentials
- File deletion or replacement
- Publishing or website changes
- Legal, copyright, licensing, or privacy matters
- Angry, threatening, or highly dissatisfied clients
- Anything the agent is uncertain about

## Automatic Client Acknowledgment

Subject:

> Inkspirations Studios Support Request Received

Body:

> Hello [Client Name],
>
> Thank you for contacting the Inkspirations Studios Support Desk. Your request has been received and assigned ticket #[TICKET NUMBER].
>
> We are reviewing the information you provided. Robert has been notified, and you will receive either a follow-up question or a recommended next step as soon as possible.
>
> Please reply to this email if you need to add a screenshot, file, or additional detail.
>
> Inkspirations Studios Support Desk

## Email to Robert

Subject:

> New Client Support Ticket #[TICKET NUMBER]: [SUBJECT]

Body:

```text
CLIENT SUPPORT REQUEST

Ticket:
[TICKET NUMBER]

Client:
[NAME]

Email:
[EMAIL]

Project:
[PROJECT]

Urgency:
[LOW / NORMAL / HIGH]

Problem:
[PLAIN-LANGUAGE SUMMARY]

What the client was trying to do:
[GOAL]

What happened instead:
[RESULT]

Files or screenshots:
[ATTACHMENTS]

AI classification:
[CATEGORY]

Risk level:
[SAFE AUTO-REPLY / ROBERT APPROVAL REQUIRED]

Recommended response:
[DRAFT]
```

## Response Style

Every client reply should be:

- Warm
- Calm
- Clear
- Brief
- Non-defensive
- Free of unexplained technical language
- Honest about uncertainty

The agent must never blame the client.

## Suggested Categories

- Website problem
- File problem
- Login or access
- Download problem
- Print or production question
- Artwork or image question
- Project status
- Billing question
- Revision request
- General question
- Urgent issue

## Escalation Rules

Immediately alert Robert when:

- The client says the issue is urgent
- Money is involved
- A deadline may be missed
- A live website or public page is broken
- A client cannot access paid work
- A file may have been lost
- The client expresses strong dissatisfaction
- The agent cannot confidently classify the issue

## Suggested Dashboard

The Command Center should include:

- New tickets
- Waiting for Robert
- Waiting for client
- Safe auto-replies sent
- Resolved
- Urgent
- Search by client or project

## Important Technical Note

This system requires:

- A website support form
- An email service or connected mailbox
- A ticket database or structured log
- An AI model for classification and drafting
- Approval controls

If AI credits are unavailable, the form should still:

1. Save the ticket.
2. Email Robert.
3. Send the approved acknowledgment.
4. Mark the ticket for manual review.

## Authority Rule

The agent may acknowledge, organize, classify, and draft. Robert retains final authority over commitments, creative decisions, prices, deadlines, publication, legal matters, and sensitive client communication.

**AI assists. Robert decides.**
