# Backend + Database Migration Plan

## Completed in this phase
- Added new backend service in `backend/` using Express + TypeScript.
- Added PostgreSQL schema in Prisma mirroring existing product entities.
- Implemented JWT auth and role-based middleware.
- Implemented owner and service-center core APIs.
- Added frontend API integration stubs in `frontend/src/integrations/backend/`.
- Added missing CRUD endpoints for owner/service-center resources to support full end-to-end frontend flows.
- Removed backend coupling to frontend package dependency.

## Next migration steps
1. Add refresh tokens and secure cookie strategy.
2. Add request-level rate limiting and structured audit logs.
3. Add automated data migration script from Supabase export to PostgreSQL.
4. Add backend integration tests for auth, owner, and service-center modules.
5. Add OpenAPI/Swagger contract and frontend API client generation.

## Cutover checklist
1. Run backend in staging PostgreSQL.
2. Backfill data and validate counts/table parity.
3. Switch frontend auth and owner flows.
4. Switch service-center flows.
5. Disable Supabase data writes.
6. Remove Supabase client from frontend after final validation.
