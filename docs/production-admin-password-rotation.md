# Production administrator password rotation

`server/productionAdminPasswordRotation.mjs` is a manual, one-time operator
command. It is not attached to application startup, deployment, or migrations.
It does not load `.env` files and requires the production `DATABASE_URL` to be
provided by the approved Render production shell.

## Preconditions

1. Use the Render production service shell or another approved production
   operations runtime that supplies `RENDER` or `RENDER_SERVICE_ID` and
   `NODE_ENV=production`. The script intentionally refuses to run locally.
2. Set `ZIYOTECH_ALLOW_PRODUCTION_ADMIN_ROTATION=YES` for that shell session.
   This is an explicit authorization switch, not a credential.
3. If the administrator uses Firebase sign-in (`password` or `google.com`),
   revoke that account's Firebase refresh tokens through the authorized Firebase
   Admin SDK process before running this command. This repository does not
   include Firebase Admin SDK and the script will ask for typed confirmation.
   The application rejects Firebase ID tokens authenticated before the
   administrator credential's rotation timestamp. If the Firebase credential
   itself may be compromised, rotate or disable that Firebase sign-in method
   separately; this command changes only the ZiyoTech Admin ID password.

## Manual invocation

From the Render production service shell, run the command directly (never add it
to a Render build or start command):

```sh
ZIYOTECH_ALLOW_PRODUCTION_ADMIN_ROTATION=YES NODE_ENV=production \
  node server/productionAdminPasswordRotation.mjs \
  --expected-project-ref=REPLACE_WITH_CONFIRMED_PRODUCTION_REF
```

The script requires a protected production project reference and checks it
against the connection identity. It asks for exact typed confirmations of the
production project and connected database, then the existing Admin ID and
account ID. It verifies the account is already active, verified, and assigned
the admin role. It will not create accounts or change roles.

The new password is entered twice through a hidden terminal prompt, must be at
least 14 characters, and is never accepted in arguments or environment
variables. The script uses the existing scrypt parameters and a random salt.
One transaction updates only the existing credential verifier and deletes the
account's `admin_sessions` and `user_sessions`. It reports row counts only.

If the target, account, confirmation, connection, or transaction check fails,
the operation stops; transactional changes are rolled back. Do not retry until
the target and cause have been reviewed. Afterward, verify one login manually
and confirm old browser sessions are rejected.
