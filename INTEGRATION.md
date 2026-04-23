# AIRECRUIT - Frontend Integration Guide

## Overview
This document maps all frontend services to backend endpoints for integration.

---

## Quick Start

1. **Start Backend:**
```bash
cd backend && npm run dev
```

2. **Start Frontend:**
```bash
cd frontend-next && npm run dev
```

---

## Service Mapping

### 1. Auth Service → `/api/auth`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `authService.register()` | `POST /api/auth/register` | ✅ Ready |
| `authService.login()` | `POST /api/auth/login` | ✅ Ready |
| `authService.refresh()` | `POST /api/auth/refresh` | ✅ Ready |
| `authService.getMe()` | `GET /api/auth/me` | ✅ Ready |
| `authService.updateProfile()` | `PATCH /api/auth/me` | ✅ Ready |
| `authService.sendOTP()` | `POST /api/auth/send-otp` | ✅ Ready |
| `authService.verifyOTP()` | `POST /api/auth/verify-otp` | ✅ Ready |

### 2. Jobs Service → `/api/jobs`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `jobsService.create()` | `POST /api/jobs` | ✅ Ready |
| `jobsService.getAll()` | `GET /api/jobs` | ✅ Ready |
| `jobsService.getOne()` | `GET /api/jobs/:id` | ✅ Ready |
| `jobsService.update()` | `PATCH /api/jobs/:id` | ✅ Ready |
| `jobsService.remove()` | `DELETE /api/jobs/:id` | ✅ Ready |
| `jobsService.updateStatus()` | `PATCH /api/jobs/:id/status` | ✅ Ready |

### 3. Candidates Service → `/api/jobs/:jobId/candidates`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `candidatesService.bulkInsert()` | `POST /api/jobs/:jobId/candidates/bulk` | ✅ Ready |
| `candidatesService.uploadCsv()` | `POST /api/jobs/:jobId/candidates/upload-csv` | ✅ Ready |
| `candidatesService.uploadPdf()` | `POST /api/jobs/:jobId/candidates/upload-pdf` | ✅ Ready |
| `candidatesService.getByJob()` | `GET /api/jobs/:jobId/candidates` | ✅ Ready |
| `candidatesService.getOne()` | `GET /api/jobs/:jobId/candidates/:id` | ✅ Ready |
| `candidatesService.remove()` | `DELETE /api/jobs/:jobId/candidates/:id` | ✅ Ready |

### 4. Screening Service → `/api/jobs/:jobId/screening`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `screeningService.run()` | `POST /api/jobs/:jobId/screening/run` | ✅ Ready |
| `screeningService.getResults()` | `GET /api/jobs/:jobId/screening/results` | ✅ Ready |
| `screeningService.getStatus()` | `GET /api/screening/:id/status` | ✅ Added |
| `screeningService.exportResults()` | `GET /api/screenings/:id/export` | ✅ Added |

### 5. AI Service (NEW) → `/api/ai`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `aiService.chat()` | `POST /api/ai/chat` | ✅ Ready |
| `aiService.getChatHistory()` | `GET /api/ai/chat/:jobId` | ✅ Ready |
| `aiService.parseFilter()` | `POST /api/ai/parse-filter` | ✅ Ready |

### 6. Notifications Service (NEW) → `/api/notifications`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `notificationsService.getAll()` | `GET /api/notifications` | ✅ Ready |
| `notificationsService.markAsRead()` | `PATCH /api/notifications/:id/read` | ✅ Ready |
| `notificationsService.markAllAsRead()` | `PATCH /api/notifications/read-all` | ✅ Ready |

### 7. Activity Service (NEW) → `/api/activity`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `activityService.getMyActivity()` | `GET /api/activity` | ✅ Ready |
| `activityService.getAllActivity()` | `GET /api/activity/all` | ✅ Ready |

### 8. Team Service (NEW) → `/api/team`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `teamService.getTeam()` | `GET /api/team` | ✅ Ready |
| `teamService.invite()` | `POST /api/team/invite` | ✅ Ready |
| `teamService.updateRole()` | `PATCH /api/team/:userId/role` | ✅ Ready |
| `teamService.remove()` | `DELETE /api/team/:userId` | ✅ Ready |

### 9. Billing Service (NEW) → `/api/billing`

| Frontend Method | Backend Endpoint | Status |
|-----------------|------------------|--------|
| `billingService.getBilling()` | `GET /api/billing` | ✅ Ready |
| `billingService.upgrade()` | `POST /api/billing/upgrade` | ✅ Ready |

---

## Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  language?: string;    // 'en', 'fr', 'rw', 'sw'
  theme?: string;        // 'dark', 'light'
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  plan?: string;        // 'free', 'pro', 'enterprise'
  usageCount?: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;  // 'screening_complete', 'candidate_uploaded', 'team_invite'
  read: boolean;
  createdAt: string;
}
```

### Activity Log
```typescript
interface ActivityLog {
  id: string;
  userId: string;
  action: string;  // 'screening_run', 'candidate_uploaded', 'job_created'
  target: string;
  details?: any;
  createdAt: string;
}
```

### Billing
```typescript
interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  planName: string;
  screeningsUsed: number;
  screeningsLimit: number;
  renewalDate: string;
  canUpgrade: boolean;
}
```

---

## Testing Checklist

After starting both servers, verify:

- [ ] Login works and stores tokens
- [ ] Jobs can be created, listed, viewed
- [ ] Candidates can be added (CSV/PDF/JSON)
- [ ] Screening can be run and results displayed
- [ ] Notifications appear after actions
- [ ] Profile updates (language, theme) persist
- [ ] AI chat responds with job context

---

## Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token is stored and sent correctly |
| CORS error | Ensure backend allows frontend origin |
| DB connection error | Check Neon DATABASE_URL |
| API 404 | Check proxy in next.config.ts |

---

## Next.js Proxy Configuration

The frontend uses Next.js rewrites to proxy `/api/*` to backend:

```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:5000/api/:path*',
    },
  ];
},
```

Ensure `NEXT_PUBLIC_API_URL=http://localhost:5000` is set in `.env.local`.