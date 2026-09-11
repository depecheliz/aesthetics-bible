# Android UI audit — 2026-09-11

Source audit and focused UI fixes completed. Physical-device validation is still required: adb devices -l returned no attached devices. No emulator or browser rendering is claimed as native verification.

## Architecture inspected before editing

Expo Router root Stack has hidden headers, one SafeAreaProvider, and a light StatusBar on the dark background. Shared Screen owns top/bottom insets. The five tab screens request top only; their standard, non-absolute tab bar reserves its own bottom inset and stays outside scroll content. Current tab height is 64 + insets.bottom with matching bottom padding. That existing tab fix belongs to prior work and was preserved without editing it. An integrator must retain it.

Main content routes use flexible vertical ScrollViews with bottom padding; quiz uses a scrolling question area and a sibling footer inside Screen. No blanket extra tab-height padding or fixed status-bar spacer was needed. Images largely use aspect ratios rather than device-height constants. The sole React Native Modal is the diagram viewer. Auth and treatment logging had KeyboardAvoidingViews with Android behavior unset. No screen redesign or brand/token change was necessary.

## Every changed source/test file

| File | Change and reason |
| --- | --- |
| components/layout/Screen.tsx | Protect left/right insets even for top-only tab screens, while preserving bottom ownership. Avoid side cutouts/system UI overlapping content. |
| components/layout/ScreenHeader.tsx | Allow title wrapping without squeezing the back button. |
| components/ui/Button.tsx | Bound icon/label rows; allow centered multiline labels and maintain a 48dp minimum hit area. In particular, half-width treatment/Passport actions previously allowed long labels to extend outside buttons. |
| components/media/ZoomableImageModal.tsx | Give the modal its own safe-area provider/view and place the image/close control within a clipped safe viewport. Fixed close offsets are now relative to the safe content, not the modal window. Android hardware Back handling remains intact. |
| app/auth/sign-in.tsx | Enable Android height avoidance, use measured top inset as keyboard coordinate offset, dismiss keyboard on drag. |
| app/auth/sign-up.tsx | Same keyboard handling for account creation and its lower actions. |
| app/passport/add.tsx | Same keyboard handling for the long form; replace arbitrary 16px offset with measured top inset. |
| app/(tabs)/passport.tsx | Wrap secondary stats and progress thumbnails; allow sample banner text to shrink/wrap. |
| app/(tabs)/preview.tsx | Presentation only: preset widths use 30% plus flexible growth. Previous 3 × 31% + two 12dp gaps exceeded the 312dp content width of a 360dp phone (314.16dp), unexpectedly wrapping the third tile. |
| jest.setup.js | Install the library-provided safe-area Jest mock so inset hooks and modal content run without native inset events. This does not validate native geometry. |

Additional deliverables: this report and android-ui-only.patch (source/test changes only).

## Validation

- npm run typecheck: passed.
- npm test -- --runInBand --silent: 21 suites, 116 tests passed.
- ESLint on all ten changed source/test files: passed.
- No package, native/release configuration, payment logic, AI backend, or provider-search file changed by this audit. Shared UI improvements naturally also apply where those screens reuse Button/Screen.

## Remaining visual risks and device acceptance checks

Test portrait logical viewports around 320×568, 360×640, 393×873, and 412×915 dp; these are layout targets, not physical pixel resolutions. Use default and enlarged system font/display sizes. Test Android 15/16 edge-to-edge behavior and at least one older supported Android device, with gesture and three-button navigation.

1. Visit every tab, scroll to the final control, and switch tabs. Confirm labels/icons stay above the system navigation area, there is no duplicated bottom gap, and content ends above the tab bar. Existing inset-aware tab layout must be included in the integrated build. Large accessibility fonts can still crowd the fixed 64dp tab content height.
2. Sign in/up and log a treatment with the keyboard open. Focus the bottom Notes field, scroll to Save, submit, then dismiss/reopen the keyboard. Confirm no overlap, persistent blank gap, or stuck compressed form. Height avoidance is enabled following React Native guidance, but OEM keyboards and the existing window resize behavior need native verification.
3. Open a Bible diagram, pinch/pan, close using the visible control, and reopen/close with Android Back. Confirm image boundaries and close control remain inside cutout/system-bar areas. This checks the native modal's independent inset measurements.
4. Check half-width actions, long treatment/provider names, currency values, Home stats, Passport stats, and image-overlay labels with enlarged fonts. Wrapping shared buttons removes the obvious escape, but exceptionally long user-entered values and image-overlay text can still look crowded; a full typography redesign is outside this pass.
5. Finish the quiz on a short phone: all choices must scroll and Continue must remain reachable. At extreme text scaling or very short multi-window heights, the non-scrolling header/progress/footer can leave little question space. Empty/error fallback screens that lack ScrollViews also deserve a short-height check.
6. Confirm the keyboard on Bible search leaves usable results and tab navigation. Its existing native resize behavior was retained; no new keyboard framework or native configuration was introduced.

## Isolated integration

Base HEAD inspected: 9b9de7e0db0726a1b96440b503fefd993887d902

All ten patched files were clean at the start. The workspace already contained unrelated release edits/untracked files, which were neither staged nor reverted. No commit/branch operation was performed against that mixed working tree.

From a target checkout, review android-ui-only.patch, run git apply --check android-ui-only.patch, then git apply android-ui-only.patch. The patch deliberately excludes every pre-existing edit, including app/(tabs)/_layout.tsx. Keep the existing bottom-inset tab calculation when assembling the closed-test build. Re-run TypeScript/tests after integration. The separate report is a handoff artifact, not included in the patch.

References: [React Native keyboard avoidance](https://reactnative.dev/docs/next/keyboardavoidingview), [safe-area provider guidance for modals](https://appandflow.github.io/react-native-safe-area-context/category/api-reference/).
