# Operations Runbook

This runbook provides procedures for common operational tasks, troubleshooting, and incident response related to the `ugc_dashboard` application. It is intended for DevOps engineers, site reliability engineers (SREs), and system administrators.

> **Disclaimer:** The original operations runbook was not available. The content herein is based on typical practices for running a Next.js application backed by Supabase.

## Table of Contents

1. [Monitoring](#monitoring)
2. [Backup & Restore](#backup--restore)
3. [Scaling](#scaling)
4. [Common Issues](#common-issues)
5. [Incident Response](#incident-response)
6. [Disaster Recovery](#disaster-recovery)

## Monitoring

1. **Application Logs**
   * **Vercel Logs:** Access via the Vercel dashboard. Filter by deployment and time range.
   * **Supabase Logs:** Use the Supabase dashboard to view SQL query logs, Auth logs, and function logs. Enable log retention policies per your organization’s requirements.
2. **Metrics**
   * **Performance Metrics:** Enable Vercel analytics to monitor response times, cache hit ratios, and traffic patterns.
   * **Database Metrics:** Monitor CPU, memory, and disk usage of the Supabase Postgres instance via the Supabase dashboard.
3. **Alerting**
   * Integrate a third‑party alerting tool (e.g., PagerDuty, Opsgenie) with log streams to notify on errors, high latency, or resource exhaustion.

## Backup & Restore

1. **Database Backups**
   * Supabase automatically performs daily backups for managed projects. Verify the backup schedule and retention policy via the Supabase dashboard.
   * For additional redundancy, perform manual dumps:
     ```sh
     pg_dump --clean --no-owner --no-acl -h <db-host> -U <db-user> -d <db-name> -f backup.sql
     ```
   * Store backups in a secure location (e.g., encrypted cloud storage).
2. **Restore Procedure**
   * To restore a backup, create a new Supabase project or local Postgres instance and run:
     ```sh
     psql -h <db-host> -U <db-user> -d <db-name> -f backup.sql
     ```
   * Apply any migration scripts that were added after the backup date.

## Scaling

1. **Frontend**
   * Vercel automatically scales serverless functions and edge functions based on demand. There is no need to manually scale Next.js infrastructure.
2. **Database**
   * Supabase plans include scalability options. Upgrade your plan or contact Supabase support to increase compute and storage resources.
   * Optimize queries by adding indexes (already defined in migration scripts) and reviewing slow queries in the Supabase dashboard.

## Common Issues

1. **Slow Queries or Timeouts**
   * Check the Supabase query logs for slow statements. Ensure proper indexes exist on filter columns.
   * Review the RLS policies; overly complex policies can degrade performance.
2. **Unauthorized Errors**
   * Verify that the client is sending a valid JWT. Check cookie settings and expiry dates.
   * Confirm the user’s role and permissions in the database.
3. **Authentication Failures**
   * Ensure the `SUPABASE_URL` and keys in environment variables are correct.
   * Check Supabase Auth settings for provider configuration (e.g., email templates, redirect URLs).
4. **Failed Deployments**
   * Review Vercel build logs. Common causes include TypeScript errors, missing environment variables, or failing migrations.
   * Run `npm run build` locally to reproduce and fix build issues before re‑deploying.

## Incident Response

1. **Identify & Triage**
   * Quickly determine the scope (single user vs. widespread) and severity (minor vs. critical) of the incident.
   * Check application and database logs for error messages and stack traces.
2. **Communicate**
   * Notify stakeholders about the incident status, impact, and expected resolution time. Use your organization’s incident management tooling.
3. **Mitigate**
   * Apply a temporary fix to reduce user impact. For example, roll back to a previous deployment, disable a problematic feature, or scale up resources.
4. **Resolve**
   * Implement a permanent fix. This may involve code changes, configuration updates, or data corrections. Test thoroughly before deploying to production.
5. **Post‑Mortem**
   * Document the root cause, timeline, and remediation steps. Identify action items to prevent recurrence (e.g., improved testing, monitoring, or documentation).

## Disaster Recovery

1. **Multiple Regions**
   * Vercel allows deploying to multiple regions; however, for database resilience, Supabase currently runs in a single region. Consider read replicas or multi‑region support when available.
2. **Recovery Testing**
   * Regularly test your backup and restore procedures on a staging environment.
   * Simulate various failure scenarios (e.g., database corruption, accidental deletion) and measure recovery time.

---

Keep this runbook up to date as the application evolves and new operational insights are gained. Incorporate lessons learned from incidents to improve reliability and resilience.