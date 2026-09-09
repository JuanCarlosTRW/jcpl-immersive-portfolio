# Vertical slice QA

Date: 2026-09-09.

## Verified

- Strict TypeScript and Vite production build pass.
- Dependency tree resolves without invalid peers.
- Four geometry/path regression tests pass: the aperture is covered; the frame leaves the center clear; both camera paths cross the opening, remain above the floor and meet the world path without a positional jump.
- Browser inspection at 1363 × 936 desktop, 1024 × 768 laptop and 390 × 844 mobile iframe viewports.
- No-WebGL fallback, identity reveal, semantic scroll progression, Index → Projects navigation, archive open/close and Escape dismissal.
- Motion toggle sets its accessible pressed state and allows immediate entry.
- No remote textures, HDRs or models are required for the initial scene. Font rendering has a system-font fallback.
- The three cinematic chapters ship as responsive local WebP assets; the largest desktop plate is under 400 KB and every mobile plate is 100 KB or less.
- Social preview metadata references a dedicated 1200 × 630 image with project-specific title treatment.

## Environment limitation

The provided cloud browser reports `GL_VENDOR = Disabled` and cannot create a WebGL context. Browser security policy also blocks its graphics settings page. The restriction was not bypassed.

Consequently, the inspected screenshots are the **no-WebGL fallback and HTML interface**. They are not proof of the procedural scene's appearance. Actual shader compilation, bloom/reflection quality, frame rate, adaptive-quality behavior and the camera flight's visual timing still require a GPU-enabled browser. Native mobile GPU testing and network throttling have not been performed. No invented FPS result or Awwwards-level visual sign-off is claimed.

## GPU acceptance pass before further art expansion

1. Open `npm run dev` in a GPU-enabled Chrome, Edge or Safari browser. Use `?debug` for the development performance readout.
2. Confirm the arch is solid at the sides and crown with an unobstructed dark opening. Check the material for shader errors, excessive grain or blown highlights.
3. Press Enter once and repeatedly. One spatial traversal should occur, without clipping through a column or a second timeline.
4. Confirm a continuous transition from the portal to the world. Inspect the screen at the Projects destination for legibility and sufficient separation from the HTML title.
5. Scroll both directions, change viewport size, open/close the index and restart. Watch for residual timelines or position jumps.
6. Run a desktop and real-phone performance sample after warmup. Verify the displayed draw-call count includes the reflection and postprocessing passes.
7. Enable OS reduced motion before refreshing. Camera flight, dust drift, parallax and decorative CSS animations should stop. Semantic navigation should remain available.
8. Switch tabs or open a modal and confirm continuous rendering pauses. Restore focus and confirm normal rendering resumes.
9. Throttle the network and block the scene chunk. Confirm the initialization deadline or error boundary exposes the fallback and content.
10. Test keyboard navigation and 200% text zoom. Check no controls or content become unreachable.

Retain any visual issue found in this pass as a concrete follow-up before adding custom assets or claiming production visual approval.
