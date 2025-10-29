# PrepMint MVP Roadmap - Quick Reference

**Status**: 🟡 In Progress | **Completion**: 42% | **Target Launch**: 8-10 weeks

---

## 📊 Executive Dashboard

### Current State Snapshot

```
Frontend:        ████████████████░░░░ 75% ✅ (Production-ready UI)
Backend:         ███░░░░░░░░░░░░░░░░░ 15% ⚠️ (Critical gap)
Database Schema: ██████░░░░░░░░░░░░░░ 30% ⚠️ (Firestore rules missing)
Security:        ████░░░░░░░░░░░░░░░░ 20% 🔴 (Major vulnerability)
AI Evaluation:   ░░░░░░░░░░░░░░░░░░░░  0% 🔴 (Not started)

OVERALL MVP:     ████████░░░░░░░░░░░░ 42%
```

---

## 🎯 The Big Picture

### What's Working ✅
- Clean, production-ready Next.js frontend (zero TypeScript errors)
- Complete authentication flow (email + Google OAuth)
- Beautiful UI for all four user roles (Student, Teacher, Admin, Institution)
- Gamification system (XP, levels, badges) with formulas implemented
- Responsive design with Tailwind CSS
- Professional dashboard layouts with mock data

### Critical Gaps 🔴
1. **No Backend API** - AI evaluation system doesn't exist
2. **No Firestore Security Rules** - Database is wide open (CRITICAL SECURITY RISK)
3. **No Email Verification** - Anyone can create account and access data
4. **No File Upload Security** - Malware/abuse vulnerability
5. **Mock Data Everywhere** - Dashboards show fake data, no real integration

---

## 🚀 10-Week Launch Timeline

```
Week 1-2:  🔐 Foundation & Security
           └─ Firestore schema + security rules + email verification

Week 3-4:  🔧 Backend API Infrastructure
           └─ File upload API + authentication + job polling

Week 5-6:  🤖 AI Evaluation Integration
           └─ OCR pipeline + grading logic + job queue

Week 7:    🔌 Frontend-Backend Integration
           └─ Connect all UI to real APIs

Week 8:    🛡️ Security Hardening & Testing
           └─ Rate limiting + penetration testing + E2E tests

Week 9:    👥 Admin & Institution Features
           └─ User management + analytics + documentation

Week 10:   🚢 Production Launch
           └─ Final testing + deployment + go live
```

---

## 📋 Sprint Breakdown

### Sprint 1: Foundation (Week 1-2) - IMMEDIATE PRIORITY

**Must Complete**:
- [ ] Design complete Firestore schema (users, evaluations, subjects, badges, tests)
- [ ] Write and deploy comprehensive security rules
- [ ] Implement email verification on signup
- [ ] Add password reset flow
- [ ] Validate file uploads (type, size, malware check)

**Outcome**: Secure database foundation, no more critical security gaps

---

### Sprint 2: Backend Infrastructure (Week 3-4)

**Must Complete**:
- [ ] Choose backend platform (Cloud Run / Lambda / Vercel Functions)
- [ ] Build authentication middleware with rate limiting
- [ ] Implement `/api/upload` endpoint (save to Firebase Storage)
- [ ] Implement `/api/evaluate/{jobId}/status` polling endpoint
- [ ] Deploy backend to staging environment

**Outcome**: Backend API running and accessible

---

### Sprint 3: AI Evaluation (Week 5-6)

**Must Complete**:
- [ ] **DECISION**: Choose AI provider (OpenAI vs Gemini vs Custom)
- [ ] Build OCR pipeline (extract text from images)
- [ ] Implement answer evaluation algorithm
- [ ] Set up job queue system (Cloud Tasks or Bull)
- [ ] Test end-to-end evaluation flow

**Outcome**: Students can upload answer sheets and receive AI scores

---

### Sprint 4: Integration (Week 7)

**Must Complete**:
- [ ] Connect upload form to real `/api/upload`
- [ ] Connect polling hook to real API
- [ ] Add logout button to dashboard
- [ ] Integrate teacher dashboard with real data
- [ ] Polish error handling and loading states

**Outcome**: Frontend fully connected to backend

---

### Sprint 5: Security & Testing (Week 8)

**Must Complete**:
- [ ] Implement rate limiting (10 uploads/hour per user)
- [ ] Security audit (penetration testing)
- [ ] Write E2E tests with Playwright/Cypress
- [ ] Load test with 100 concurrent users
- [ ] Fix all critical bugs

**Outcome**: System secure and tested under load

---

### Sprint 6: Admin Features (Week 9)

**Must Complete**:
- [ ] Build admin user management UI + API
- [ ] Build institution dashboard with analytics
- [ ] Implement profile editing
- [ ] Create user documentation
- [ ] Deploy admin features to staging

**Outcome**: Admin and institution portals functional

---

### Sprint 7: Launch (Week 10)

**Must Complete**:
- [ ] Set up production Firebase project
- [ ] Deploy to production (frontend + backend)
- [ ] Full regression testing
- [ ] Monitor for 24 hours post-launch
- [ ] Address any critical issues

**Outcome**: PrepMint MVP live in production! 🎉

---

## 🔥 Critical Path Items

These items block all downstream work:

1. **Firestore Security Rules** (Week 1)
   - Everything depends on secure database
   - Without this, cannot launch to production
   - 2-day effort

2. **Backend API Infrastructure** (Week 3)
   - Frontend cannot function without backend
   - File uploads require API
   - 5-day effort

3. **AI Evaluation System** (Week 5-6)
   - Core product value
   - Most complex technical challenge
   - 8-10 day effort

4. **Security Audit** (Week 8)
   - Cannot launch without security validation
   - May uncover issues requiring fixes
   - 2-day effort + fixes

---

## ⚠️ Top Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI costs exceed budget | 🔴 High | Start with Gemini (5x cheaper than OpenAI), monitor daily |
| OCR accuracy below 85% | 🔴 High | Implement teacher review fallback, test extensively |
| Security breach | 💀 Critical | Comprehensive security rules, penetration testing, bug bounty |
| Backend performance issues | 🔴 High | Load testing, caching, CDN optimization |
| Scope creep delays launch | 🔴 High | Strict P0-only enforcement, defer all nice-to-haves |

---

## 📊 Requirements Summary

### By Priority

- **P0 (Critical)**: 45 requirements - Must have for MVP launch
- **P1 (High)**: 38 requirements - Should have, defer if needed
- **P2 (Medium)**: 22 requirements - Nice to have, defer to v2
- **P3 (Low)**: 10 requirements - Future consideration

**Total**: 115 requirements catalogued

### By Feature Area

- **Authentication**: 13 requirements (7 P0)
- **Database Schema**: 18 requirements (12 P0)
- **Security**: 15 requirements (5 P0 critical)
- **Backend API**: 11 requirements (5 P0)
- **AI Evaluation**: 10 requirements (4 P0)
- **Frontend**: 14 requirements (6 P0)
- **Testing**: 9 requirements (3 P0)
- **Deployment**: 11 requirements (5 P0)
- **Admin Features**: 8 requirements (0 P0)
- **Institution Features**: 6 requirements (0 P0)

---

## 💰 Budget Estimate

### Infrastructure Costs (Monthly)

**MVP Scale (100-500 users)**:
- Firebase (Firestore + Storage + Auth): $50-200
- AI API (Gemini Pro Vision): $50-200
- Hosting (Vercel): $0-50 (free tier)
- **Total**: ~$100-450/month

**Growth Scale (1,000-5,000 users)**:
- Firebase: $200-500
- AI API: $200-1000
- Hosting: $50-100
- CDN: $20-50
- **Total**: ~$500-1,650/month

### One-Time Costs
- Security audit: $500-2000 (optional consulting)
- Load testing tools: $0 (open source)
- Domain name: $10-15/year

---

## 📈 Success Metrics

### Launch Criteria (Must Meet All)
- ✅ All P0 requirements completed
- ✅ Zero critical security vulnerabilities
- ✅ System handles 100 concurrent users
- ✅ E2E tests passing for all user roles
- ✅ Production environment configured

### Post-Launch KPIs (Month 1)
- 100+ signups
- 60%+ activation rate (complete first evaluation)
- 99.5%+ uptime
- <2 minute average evaluation time
- >85% OCR accuracy
- >4.0/5.0 user satisfaction

---

## 🎓 User Roles & Capabilities

### Student
- Upload answer sheets (PDF/JPG/PNG)
- View AI evaluation results instantly
- Track XP, level, badges
- View performance analytics
- Compare with classmates (leaderboard)

### Teacher
- Review pending evaluations
- Provide manual feedback
- Manage assigned students
- View class analytics
- Create tests/assignments

### Admin
- Manage all users (CRUD)
- View system-wide statistics
- Change user roles
- Monitor system health

### Institution
- View organization-wide analytics
- Bulk student import (CSV)
- Manage institution settings
- Generate reports

---

## 🛠️ Tech Stack

### Frontend (Production-Ready ✅)
- Next.js 15 with App Router
- TypeScript 5+
- Tailwind CSS 4
- Framer Motion (animations)
- React 19

### Backend (To Be Built 🔴)
- **Option A**: Node.js + Express on Cloud Run
- **Option B**: Python + FastAPI on Cloud Run
- **Option C**: Vercel Serverless Functions

### Database & Auth
- Firebase Authentication (email + OAuth)
- Firestore (NoSQL database)
- Firebase Storage (file storage)

### AI Provider (Decision Needed ⚠️)
- **Recommended**: Google Gemini Pro Vision ($0.002/image)
- **Alternative**: OpenAI GPT-4 Vision ($0.01/image)
- **Custom**: Tesseract OCR + custom model

### Hosting
- Vercel (frontend)
- Google Cloud Run / AWS Lambda (backend)

---

## 📞 Key Decisions Needed

1. **AI Provider Selection** (Week 5)
   - OpenAI (best accuracy, expensive)
   - Gemini (good accuracy, 5x cheaper)
   - Custom model (full control, longer dev time)

2. **Backend Platform** (Week 3)
   - Cloud Run (containerized, flexible)
   - AWS Lambda (serverless, complex cold starts)
   - Vercel Functions (integrated, limited runtime)

3. **Job Queue System** (Week 5)
   - Google Cloud Tasks (integrated, simple)
   - Bull + Redis (flexible, requires Redis)
   - AWS SQS (reliable, multi-cloud)

---

## 📚 Reference Documents

- **Full Program Plan**: `/home/teja/prepmint-frontend/prepmint-program.md`
- **Architecture Guide**: `/home/teja/prepmint-frontend/CLAUDE.md`
- **Source Code**: `/home/teja/prepmint-frontend/src/`

---

## 🚦 Status Indicators

- 🟢 GREEN: On track, no issues
- 🟡 YELLOW: Minor issues, requires attention
- 🔴 RED: Critical issues, immediate action needed
- ⚠️ AMBER: Risk identified, mitigation planned
- ✅ DONE: Completed and tested
- 🔥 URGENT: Blocks other work

---

**Last Updated**: 2025-01-29
**Next Review**: Weekly (Every Friday)
**Owner**: Development Team
**Stakeholder**: Product Owner

---

## Quick Start for Developers

### Day 1: Get Started
1. Clone repo: `git clone [repo-url]`
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local`
4. Add Firebase config to `.env.local`
5. Run dev server: `npm run dev`

### Week 1 Priority: Firestore Rules
1. Read: `/home/teja/prepmint-frontend/prepmint-program.md` Section B
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Initialize Firestore: `firebase init firestore`
4. Write security rules in `firestore.rules`
5. Test with Firebase Emulator: `firebase emulators:start`
6. Deploy: `firebase deploy --only firestore:rules`

### Week 3 Priority: Backend Setup
1. Choose platform (Cloud Run recommended)
2. Create new service/function
3. Set up authentication middleware
4. Implement `/api/upload` endpoint
5. Test with Postman/Insomnia
6. Deploy to staging

---

**Need Help?**
- Full details in `prepmint-program.md`
- Code architecture in `CLAUDE.md`
- Questions? Open GitHub issue or contact team lead

---

*This roadmap is a living document. Update weekly as progress is made.*
