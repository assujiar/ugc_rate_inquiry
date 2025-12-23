# Marketing v2 Implementation Notes

These notes capture additional considerations, caveats, and design decisions encountered during the implementation of the marketing v2 module. They serve as a reference for future maintainers and should be updated as the codebase evolves.

## Design Decisions

1. **Modular Structure:** Each marketing sub‑module (offline events, SEO/SEM, website analytics, digital channels, content pieces, attribution, KPI) lives in its own React component and API route. This approach improves maintainability and allows independent evolution of each component.
2. **Tab Navigation:** The marketing dashboard uses tabs (with an accordion fallback on mobile) to organize sub‑modules. This pattern was chosen over nested routes to provide a cohesive user experience and reduce page reloads.
3. **Supabase Views:** Rather than writing complex aggregation logic in application code, we created database views (e.g., `v_marketing_overview`, `v_offline_event_stats`) that encapsulate business logic. This reduces API complexity and leverages Postgres’s performance.
4. **Filter Persistence:** Filters use URL query parameters to maintain state across page navigations and refreshes. Presets stored in localStorage allow users to quickly reapply common configurations.
5. **Server‑Side RBAC Checks:** Even though Supabase’s service role bypasses RLS, we enforce RBAC in API handlers using helper functions. This double‑layer ensures that no sensitive data is accidentally exposed.
6. **Forms & Validation:** Form components use React state and simple validation logic. For complex forms, consider using a form library like React Hook Form and a validation library like Zod.

## Caveats & Limitations

1. **Simplified Attribution Models:** The current implementation includes only first‑touch, last‑touch, and assisted attribution. More advanced models (e.g., multi‑touch, time decay) require additional data capture and weighting algorithms.
2. **External Integrations:** Data ingestion from advertising platforms (e.g., Google Ads, Facebook Ads) is not implemented. Manual imports or custom ETL pipelines are required to populate some tables.
3. **Scalability of Views:** Views aggregating large datasets may become slow as data grows. Monitor performance and consider materialized views or caching strategies if necessary.
4. **KPI Calculation Flexibility:** KPIs are stored with a SQL string for calculations. Care must be taken to sanitize input and avoid SQL injection. Consider using predefined functions instead of raw SQL input.

## Future Enhancements

1. **Advanced Reporting:** Implement interactive dashboards with drill‑down capabilities and pivot tables to allow deeper exploration of data.
2. **Predictive Analytics:** Use machine learning to forecast campaign performance and suggest budget allocations.
3. **User Customization:** Allow users to create custom dashboards with rearrangeable widgets and saved layouts.
4. **Internationalization:** Add support for multiple languages and date/time formats to accommodate global teams.

---

These notes provide context for decisions and highlight areas for potential improvement. Keep them updated as you add features or optimize existing ones.