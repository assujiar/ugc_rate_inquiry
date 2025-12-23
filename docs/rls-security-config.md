# Row‑Level Security (RLS) Configuration

> **Note:** The official RLS security configuration was not provided. The policies described below represent a reasonable approach to ensuring that users can only access data they are authorized to view or modify based on their role and ownership of the data. Supabase enforces RLS on PostgreSQL tables when enabled and allows custom policies to be defined per table.

## Enabling RLS

By default, all tables created in Supabase have RLS disabled. The migration script `1001_rls_enable_all_tables.sql` enables RLS on every domain table. This script is idempotent and can be applied safely whenever new tables are added.

```sql
-- Example: enabling RLS on a table
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leads FORCE ROW LEVEL SECURITY;
```

`FORCE ROW LEVEL SECURITY` ensures that even owners or superusers are subject to policies when accessing the table. Supabase’s service role (used by API route handlers) can bypass RLS, but the application will explicitly enforce RBAC checks in server code.

## Helper Functions

### `fn_current_user_id()`

A helper function that returns the UUID of the authenticated user by extracting the `sub` claim from the JWT. It is defined in `1002_rls_functions.sql`:

```sql
CREATE OR REPLACE FUNCTION public.fn_current_user_id()
RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;
```

### `fn_has_permission(permission_name text)`

Checks whether the current user’s role has a specified permission by querying the `role_permissions` table. Defined in `1100_rls_rbac.sql`:

```sql
CREATE OR REPLACE FUNCTION public.fn_has_permission(permission_name text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM roles r
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    JOIN profiles pr ON pr.role_id = r.id
    WHERE pr.id = fn_current_user_id() AND p.name = permission_name
  );
$$ LANGUAGE sql STABLE;
```

### `fn_is_manager()`

Determines whether the current user is in a managerial role (e.g., director or admin). This function can be referenced in policies to grant broader access. The actual logic looks up roles with a `is_manager` flag (not shown here).

## Policy Examples

### Sales Leads

Only the owner of a lead or users with the `read_sales_leads_any` permission may view a row. Users with the `update_sales_leads_any` permission may update any lead; otherwise they can only update leads they own.

```sql
-- SELECT
CREATE POLICY "Select own or any leads"
  ON public.sales_leads
  FOR SELECT
  USING (
    owner_id = fn_current_user_id()
    OR fn_has_permission('read_sales_leads_any')
  );

-- UPDATE
CREATE POLICY "Update own leads or any if permitted"
  ON public.sales_leads
  FOR UPDATE
  USING (
    owner_id = fn_current_user_id()
    OR fn_has_permission('update_sales_leads_any')
  );
```

### Marketing Content Pieces

Marketing content is generally visible to marketing users and above. Only users with `manage_content_pieces` can insert/update/delete. Rows include a `created_by` field to track ownership.

```sql
CREATE POLICY "Select marketing content"
  ON public.content_pieces
  FOR SELECT
  USING (
    fn_has_permission('read_marketing_content')
  );

CREATE POLICY "Modify own marketing content or any if permitted"
  ON public.content_pieces
  FOR ALL
  USING (
    created_by = fn_current_user_id()
    OR fn_has_permission('manage_content_pieces')
  )
  WITH CHECK (
    created_by = fn_current_user_id()
    OR fn_has_permission('manage_content_pieces')
  );
```

### Operations Tickets

Operations tickets are visible to their reporter, assignee, and users with the `read_ops_tickets_any` permission. Only users with `update_ops_tickets_any` can update tickets they do not own.

```sql
CREATE POLICY "Select own or assigned tickets or any if permitted"
  ON public.ops_tickets
  FOR SELECT
  USING (
    reporter_id = fn_current_user_id()
    OR assignee_id = fn_current_user_id()
    OR fn_has_permission('read_ops_tickets_any')
  );

CREATE POLICY "Update own tickets or any if permitted"
  ON public.ops_tickets
  FOR UPDATE
  USING (
    reporter_id = fn_current_user_id()
    OR assignee_id = fn_current_user_id()
    OR fn_has_permission('update_ops_tickets_any')
  );
```

### Finance Transactions

Only users with finance roles may view or modify finance tables. Policies refer to `fn_has_permission('read_finance_transactions')` or `fn_has_permission('manage_finance_transactions')` accordingly.

## Enforcement Strategy

* All tables have RLS enforced via `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` statements.
* Policies always reference helper functions so that logic resides in a central place.
* Supabase service role credentials (used by server API routes) bypass RLS; therefore, API handlers implement explicit RBAC checks to ensure only authorized users call them.

---

This configuration will evolve once the official RLS specification is available. When updated, ensure all policies align with business requirements and that tests cover both allowed and prohibited access scenarios.