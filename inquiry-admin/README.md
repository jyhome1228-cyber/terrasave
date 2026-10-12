# TerraSAVE Inquiry Admin

Separate Vercel server application for the public "포장 상담하기" form.
This folder is **not** included in the GitHub Pages public site build.

## Endpoints

- `GET /admin` — password-protected administrator dashboard
- `POST /api/session` — sign in
- `GET /api/session` — session state
- `DELETE /api/session` — sign out
- `POST /api/inquiries` — public consultation intake (strict Origin allowlist, consent, basic anti-bot check)
- `GET /api/inquiries` — authorized listing
- `PATCH /api/inquiries` — authorized status and memo changes

## Required Vercel environment settings

- `BLOB_READ_WRITE_TOKEN` — connect a **private** Vercel Blob store to the admin project.
- `ADMIN_USERNAME` — optional (defaults to `admin`).
- `ADMIN_PASSWORD_SALT` — random hex/string of at least 16 bytes.
- `ADMIN_PASSWORD_HASH` — Node.js scrypt(password, salt, 64) rendered in hex.
- `ADMIN_SESSION_SECRET` — random string of at least 32 characters.
- Optional: `VERCEL_OIDC_TOKEN` (managed by Vercel) can replace the Blob token when Blob OIDC is configured.

To generate the administrator password hash locally, without storing the raw password in Git:
```bash
node -e "const c=require('node:crypto');const salt=c.randomBytes(24).toString('hex');const password=process.argv[1];console.log('ADMIN_PASSWORD_SALT='+salt);console.log('ADMIN_PASSWORD_HASH='+c.scryptSync(password,salt,64).toString('hex'))" 'YOUR-STRONG-PASSWORD'
```

Do not add raw passwords or Blob access tokens to the repository.
Only after the private Blob store, administrator credentials, CORS and API smoke tests are verified should the public contact form switch from mailto to the intake API.

## Privacy and operational safeguards

- Consultations contain personal information; private Blob storage and authorized admin routes are mandatory.
- Public read requests are not supported. The administrative session is HttpOnly, Secure and SameSite=Strict.
- Consultation records and status changes are stored separately under `inquiries/` and `states/`.
- The list view reads the most recent 200 records. Export all records before the limit is reached or extend pagination.
- Access control, automated deletion policy, rate limiting and production privacy notice must be approved before launch.
- Do not put real submitted contact information in GitHub commits, public Blob stores, example fixtures or test logs.
- Restrict `/admin` and API traffic appropriately, use a strong password and rotate credentials if exposed.
