# RLS Verification Guide

This guide describes how to verify that row‑level security (RLS) policies are correctly enforced in the `ugc_dashboard` database. The purpose of verification is to ensure users can only access data they are authorized to view or modify.

> **Note:** The original verification document was not available. This guide provides a general approach for RLS testing in Supabase/PostgreSQL.

## Prerequisites

* Access to the Supabase project (dashboard or CLI) with sufficient privileges to query system tables and modify policies if necessary.
* Test users representing each role (e.g., director, admin, sales, marketing, ops, finance). Ensure these users exist in the `auth.users` table and have corresponding entries in the `profiles` table.

## Steps to Verify RLS

### 1. Inspect Policies

Use `psql` or Supabase dashboard to list policies on a table. For example, to see policies on `sales_leads`:

```sql
SELECT *
FROM pg_policies
WHERE tablename = 'sales_leads';
```

Verify that policies exist for SELECT, INSERT, UPDATE, and DELETE and that they reference helper functions (e.g., `fn_current_user_id()`, `fn_has_permission()`).

### 2. Test Data Access as Different Users

Use the `postgres` role or Supabase SQL editor to simulate sessions for different users by setting JWT claims manually. For example, to simulate a user with a specific UUID:

```sql
SET LOCAL role = none; -- ensure you're not bypassing RLS
SET LOCAL "request.jwt.claim.sub" = '<user-uuid>';

-- Attempt to select from sales_leads
SELECT id, owner_id, company FROM sales_leads;
```

Confirm that:

* Users can only see rows where they are the owner or have explicit permissions.
* Users without the necessary permission cannot see any rows or receive an empty result set.

Repeat the test for each domain table and user role. Record the expected and actual results.

### 3. Test Mutations

Similarly, test INSERT, UPDATE, and DELETE operations:

```sql
SET LOCAL "request.jwt.claim.sub" = '<user-uuid>';

-- Attempt to update a lead
UPDATE sales_leads
SET company = 'New Company'
WHERE id = '<lead-id>'
RETURNING id;
```

* The operation should succeed only if the user is authorized (e.g., owns the lead or has `update_sales_leads_any` permission).
* Unauthorized attempts should result in zero rows affected or an error message.

### 4. Verify Service Role Behavior

API routes use the Supabase service role, which bypasses RLS. Ensure that the server‑side code performs explicit RBAC checks before returning data to the client. Review code in `/lib/rbac/authorize.ts` and API handlers under `/app/api/*`.

### 5. End‑to‑End Testing

Automate RLS verification by writing integration tests that authenticate as different users and make requests to API endpoints. For example, use a testing framework to:

1. Authenticate using Supabase client and obtain a JWT.
2. Call `/app/api/sales/pipeline` and assert that the response contains only data the user is allowed to see.
3. Repeat for each endpoint and user role.

### 6. Audit Log Validation

Check the `audit_logs` table to ensure that all data access and mutation events are recorded with the correct user ID and action. This helps detect unauthorized access patterns.

---

By following these steps, you can confidently verify that RLS policies are correctly enforced in the database. Update this guide as new tables or policies are added.