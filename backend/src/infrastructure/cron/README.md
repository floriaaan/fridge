# Cron Jobs for Achievements System

This directory contains cron job handlers for the achievements system.

## Challenge Scheduler

The `challenge-scheduler.ts` file provides functions for automated challenge management.

### Monthly Challenge Initialization

Automatically creates new challenges at the start of each month.

**Cron Expression:** `0 0 1 * *` (At 00:00 on day 1 of every month)

**Function:** `initializeMonthlyChallenge()`

### Implementation Examples

#### Using node-cron

```typescript
import cron from 'node-cron';
import { initializeMonthlyChallenge } from '@/infrastructure/cron/challenge-scheduler';

// Run at midnight on the 1st day of every month
cron.schedule('0 0 1 * *', async () => {
  await initializeMonthlyChallenge();
});
```

#### Using Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/challenges",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

Then create an API endpoint:

```typescript
// api/cron/challenges.ts
import { initializeMonthlyChallenge } from '@/infrastructure/cron/challenge-scheduler';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const result = await initializeMonthlyChallenge();
  return Response.json(result);
}
```

#### Using Bull/BullMQ

```typescript
import { Queue } from 'bullmq';
import { initializeMonthlyChallenge } from '@/infrastructure/cron/challenge-scheduler';

const challengeQueue = new Queue('challenges');

// Schedule monthly job
await challengeQueue.add(
  'initializeChallenge',
  {},
  {
    repeat: {
      pattern: '0 0 1 * *'
    }
  }
);

// Process jobs
const worker = new Worker('challenges', async (job) => {
  if (job.name === 'initializeChallenge') {
    return await initializeMonthlyChallenge();
  }
});
```

## Optional Jobs

### Challenge Expiration (Daily Cleanup)

**Cron Expression:** `0 2 * * *` (At 02:00 every day)

**Function:** `expireOldChallenges()`

This optional job marks challenges as expired when they pass their end date. Implementation can be added if needed for cleanup.

## Testing Cron Jobs

To test manually:

```typescript
import { initializeMonthlyChallenge } from '@/infrastructure/cron/challenge-scheduler';

// Run directly
await initializeMonthlyChallenge();
```

## Notes

- The challenge initialization function is idempotent - it won't create duplicate challenges for the same month
- Challenges are created from templates defined in `config/achievements/challenge-definitions.ts`
- User progress for new challenges starts at 0
- Make sure to protect cron endpoints with authentication/authorization
