# KAIRO Security Specification (Phase 0)

## 1. Data Invariants
1. **Inventory Integrity**: Vehicles (`/vehicles/{vehicleId}`), Brands (`/brands/{brandId}`), Showrooms (`/showrooms/{showroomId}`), Inspection Reports (`/inspection_reports/{reportId}`), and Site Content (`/site_content/{docId}`) can only be created, updated, or deleted by verified administrators (`isAdmin()`). Public visitors may read inventory and showroom data.
2. **PII Isolation**: Customer profiles (`/customers/{userId}`) contain email, phone, and city PII. Reads and writes are strictly restricted to the authenticated owner (`request.auth.uid == userId && email_verified`) or verified administrators (`isAdmin()`). Blanket listing of `/customers` is restricted exclusively to `isAdmin()`.
3. **Privilege Escalation Prevention**: Customers creating or updating `/customers/{userId}` can never set or elevate `role` to `'admin'`. Only `'customer'` is valid for self-registration, and `role` is immutable by non-admins.
4. **Wishlist Relational Integrity**: Wishlist documents (`/customers/{userId}/wishlists/{vehicleId}`) require `userId == request.auth.uid`, `vehicleId == vehicleId`, and `exists(/databases/$(database)/documents/vehicles/$(vehicleId))` on create.
5. **Enquiry & Request Scoping**: `enquiries`, `sell_car_requests`, `test_drive_requests`, and `service_requests` require valid field types, strict size bounds, initial `status == 'Pending'` on create, and `userId` matching `request.auth.uid` (when signed in) or `'guest'` (when submitted anonymously). List and read access are restricted strictly to `resource.data.userId == request.auth.uid` or `isAdmin()`. Status updates and deletions are restricted to `isAdmin()` (or terminal-state locked).
6. **Temporal & ID Hardening**: All single-document operations validate `isValidId()` (`^[a-zA-Z0-9_\\-]+$`, max 128 chars) and server-side timestamp constraints (`request.time`) where timestamps are written.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Vehicle Creation**: Anonymous write to `/vehicles/fake-car` -> Denied (`!isAdmin()`).
2. **Self-Admin Escalation**: Authenticated customer writing `{ uid: auth.uid, email: auth.email, role: 'admin' }` to `/customers/{uid}` -> Denied.
3. **Shadow Field Injection on Customer Profile**: Updating `/customers/{uid}` with `{ displayName: 'Test', isVerifiedVip: true }` -> Denied by `affectedKeys().hasOnly(...)`.
4. **Cross-User PII Read**: Authenticated user A calling `get` on `/customers/{userB}` -> Denied.
5. **Unauthenticated Customer List Scrape**: Calling `list` on `/customers` as non-admin -> Denied.
6. **Orphaned Wishlist Item**: Creating `/customers/{uid}/wishlists/nonexistent-car-999` -> Denied by `exists(/vehicles/nonexistent-car-999)`.
7. **Status Shortcutting on Enquiry Create**: Submitting `/enquiries/e1` with `status: 'Completed'` -> Denied (must be `'Pending'`).
8. **Cross-User Enquiry Read**: Authenticated user A listing `/enquiries` without `where('userId', '==', uid)` -> Denied by `resource.data.userId == request.auth.uid`.
9. **Resource Poisoning via Oversized ID**: Creating `/enquiries/` with 200-char ID or invalid characters (`../bad`) -> Denied by `isValidId()`.
10. **Payload Size Exhaustion**: Submitting `description` > 2000 chars in `sell_car_requests` -> Denied by `.size()` check.
11. **Non-Admin Showroom Tampering**: Updating `/showrooms/delhi` phone number as customer -> Denied (`!isAdmin()`).
12. **Email Spoofing Without Verification**: Token with `email: 'abhiramkalakota06@gmail.com'` and `email_verified: false` -> Denied by `request.auth.token.email_verified == true`.
