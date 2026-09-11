# Android closed-testing audit — 2026-09-11

The repository is ready to request an EAS Android build. A native Gradle build,
installation, physical-phone layout, and Google Play acceptance are not yet verified.
No AAB was requested or submitted during this audit. Existing architecture and
pre-existing package.json/package-lock.json dependency edits were preserved.

## 1. BLOCKS CLOSED TESTING

| Finding | Outcome |
| --- | --- |
| Fixed 64-point tab bar did not add the bottom system inset | Fixed: 64 + bottom inset, with matching bottom padding. Verify gestures and three-button navigation on Android. |
| Unconfigured purchase/restore buttons invoked billing | Fixed: unavailable label, explanatory copy, disabled actions. Closed-testing mode also disables RevenueCat configuration even if an SDK key is supplied. |
| EAS preview environment lacked Supabase configuration | Fixed externally: copied only the verified public Supabase URL and anon key from local configuration. EAS confirms both load. Auth health returned HTTP 200. |
| Local scratch folders/archives eligible for build upload; environment exclusions incomplete | Added .easignore using existing Git exclusions plus local archive/research exclusions; expanded .env.* exclusions. Private benchmark token remains ignored. |
| Native build, signing, installation, startup, system-back and phone layout unverified | Remaining release gate. No adb device was connected. Passing Hermes export and Jest do not establish native success. |
| Authenticated persistence and account deletion not exercised against the deployed backend | Remaining tester-readiness check with a disposable account: sign up/confirm/sign in, save/reopen Plan and Passport, sign out, delete account. Health HTTP 200 is not proof of migrations, RLS, email delivery, or deployed functions. |
| Play Console prerequisites unverified | Confirm application record/package, signing, listing, privacy-policy URL, Data safety, app access, content/age/health declarations as applicable, closed track and Hive tester list/group. Do not assume closed testing exempts the app from disclosures. |

## 2. BLOCKS PUBLIC LAUNCH BUT NOT TESTING

- Production RevenueCat offerings/entitlements, restore behavior, localized store pricing,
  and premium promises are not validated. Testing purchases are disabled.
- Password recovery is absent. Disposable tester accounts can be used for this test.
- AI Preview/Glow, live provider search, and Passport photos remain incomplete.
  Preview generation is explicitly gated off; Glow/photos show Coming Soon;
  Near Me labels its static providers as sample results. No implementation added.

## 3. LATER / POLISH

- Editorial spacing, long text, sample content, and font/image payload refinement.
- Historical audit/build documentation contains stale claims (including SDK,
  RevenueCat installation and project linkage). This report records current checks.
- Analytics integration remains a placeholder; it does not block navigation.
- Image picker added unused audio/camera permissions. Trivially fixed through
  plugin settings; introspection confirms Android manifest removal directives.

## Repository/configuration observations

- Expo SDK 57 (`expo ~57.0.22`), React 19.2.3, React Native 0.86.3;
  Expo Router 57 entry with a root Stack and five Tabs. No architecture migration.
- Managed native generation: no tracked Android project or custom Gradle overrides.
  Installed React Native version catalog defaults: min SDK 24, compile/target 36,
  build tools 36.0.0. Final merged release manifest still requires a native build.
- Android application ID: `com.aestella.app`; app version 1.0.0.
  EAS project: `04e51740-becc-4230-94cd-3469f1db2019`, owner `depecheliz`.
- `closed-testing` inherits production, uses store distribution, app-bundle,
  remote credentials/version source, auto-increment and EAS preview environment.
  `EXPO_PUBLIC_APP_ENV=closed-testing` disables purchases without granting premium.
- Existing preview profile produces an installable APK; an APK is not the Play AAB.
- SafeAreaProvider wraps the app; tab screens generally reserve the top edge and
  stack screens use the shared Screen safe-area wrapper. Tab inset correction is local.
- Auth does not gate anonymous browsing/quiz; Plan/Passport saving requires sign-in.
  Failures are caught; missing configuration previously fell back to a placeholder URL.
- Results redirect to the quiz if state is missing; invalid Bible/Compare/Passport IDs
  have fallback states. Existing smoke tests cover major content screens, but mock
  navigation/native bindings and cannot prove device behavior.
- Account deletion requires explicit UI confirmation and server JWT verification;
  live deletion was not performed. Source migrations use user ownership/RLS;
  deployment state was not verified.
- No private credential pattern found in scanned tracked text files. The local
  Supabase JWT was verified as anon, not service_role. Server secrets are used in
  Supabase functions, not client environment code. This was a current-source scan,
  not a certification of Git history, archives, or dependency security.
- Introspected manifest retains Internet, vibration, overlay, and legacy storage
  entries (storage capped at SDK 32); microphone/camera have removal directives.
  Native library manifest merging must be checked in the produced release artifact.
- Scripts: start/android/ios/web use Expo; typecheck uses strict TypeScript;
  lint uses ESLint; test uses jest-expo. No custom build script is required for EAS.

## Validation

- `npm.cmd run typecheck` — PASS after final changes.
- `npm.cmd run lint` — PASS after final changes.
- `npm.cmd test -- --runInBand` — PASS, 21 suites / 116 tests. Paywall smoke
  coverage now checks that unavailable purchase/restore controls are disabled.
- `npx.cmd expo-doctor` — PASS, 21/21 checks.
- `expo install --check` offline — matched installed SDK; online doctor passed later.
- Manifest and lockfile dependency declarations match.
- `npx.cmd expo config --type introspect --json` — PASS, permission removals verified.
- `npx.cmd eas-cli config --platform android --profile closed-testing --json` — PASS;
  account/project and preview public environment variables resolved.
- Android Hermes export in closed-testing mode — PASS, 1,541 modules, 113 assets,
  5.6 MB bytecode. Output: `dist/android-closed-testing` (ignored).
  Initial sandbox compiler permission failure was resolved by an approved retry.
- `git diff --check` — PASS (only line-ending/environment warnings).
- Supabase auth health — HTTP 200. No user data created, changed or deleted.
- `adb devices` — no connected device; no native runtime verification claimed.

## Next commands and release gates

From this repository in PowerShell:

```powershell
npx.cmd eas-cli build --platform android --profile closed-testing
```

No known repository/configuration blocker remains before requesting that build.
Complete the interactive signing prompt if remote Android credentials do not yet
exist. If Play already has this package, use its existing upload key and ensure the
new remote versionCode exceeds the uploaded version; do not replace signing blindly.

After EAS finishes, upload the AAB manually to the Play Console closed-testing
track. Complete Console prerequisites and use a small first tester group before
inviting the full Hive. Verify the Play-installed build opens without Metro, survives
cold restart, and navigates Home → Quiz → Results → Plan → Bible/detail → Compare →
Passport/detail/add → Near Me → Preview → Paywall and back. Check both Android
gesture and three-button modes, keyboard input, scroll access, auth saves/relaunch,
and that purchases/unfinished actions remain clearly unavailable.

Optional existing APK build for initial phone smoke testing:

```powershell
npx.cmd eas-cli build --platform android --profile preview
```

That profile is not the closed-testing profile; verify the actual Play AAB as well.

## Sources

- [Expo Android build formats](https://docs.expo.dev/build-reference/apk/)
- [EAS environments](https://docs.expo.dev/eas/environment-variables/usage/)
- [Google Play Data safety, including closed testing](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Set up a Google Play test](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)
