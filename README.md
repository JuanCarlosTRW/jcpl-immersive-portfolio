# THE ASCENT

Juan-Carlos's immersive portfolio. A world in progression, built with procedural architecture, restrained light and an editorial HTML interface.

**First vertical slice:** initialization → obsidian portal → camera traversal → identity reveal → scroll journey → Projects destination and archive placeholder.

The supplied GitHub repository was empty when development began. This project is isolated from all other repositories.

## Run

Use **Node 24** (or Node 22.18+). The test runner uses Node's native TypeScript type stripping.

```bash
git clone https://github.com/JuanCarlosTRW/jcpl-immersive-portfolio.git
cd jcpl-immersive-portfolio
npm ci
npm run dev
```

Open `http://localhost:4173`. No API keys, environment secrets, paid services or external model downloads are required.

| Command             | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Vite with hot reload on port 4173                 |
| `npm run typecheck` | Strict TypeScript validation                      |
| `npm test`          | Geometry and camera continuity regression tests   |
| `npm run build`     | Type-check and build the static `dist/` directory |
| `npm run preview`   | Serve the production build locally                |

Use the lockfile. Three.js is held at 0.185.x because the installed postprocessing release requires `<0.186.0`. Do not force incompatible peer dependencies.

## Controls

- **Enter:** move through the portal. A reduced-motion preference skips the camera flight.
- **Scroll / touch scroll / Page Down:** progress through the world after entry.
- **Index → Projects:** approach the first destination directly.
- **Explore Projects:** open the archive placeholder. No fabricated clients, metrics or case studies are presented.
- **JC/PL:** return to the entrance and reset the journey.
- **Motion:** switch between full and reduced motion. Operating-system changes are also respected.
- **Tab:** navigate semantic controls. **Escape:** close a dialog. The first keyboard link skips to Projects.

## Architecture

| Area                            | Responsibility                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/app`                       | Application lifecycle, loading deadline, renderer boundary, development viewport harness    |
| `src/components/ui`             | Semantic interface, native accessible dialogs, index and archive                            |
| `src/experience/config.ts`      | Timing, camera positions, quality, palette and future destinations                          |
| `src/experience/cameraPaths.ts` | Testable entry and world camera paths                                                       |
| `src/experience/runtime.ts`     | Mutable frame-level animation values shared by GSAP and Three.js                            |
| `src/experience/Journey.tsx`    | Semantic story beats and scoped GSAP ScrollTrigger                                          |
| `src/stores`                    | Zustand phase, quality, accessibility and dialog state                                      |
| `src/scene/World.tsx`           | Lazily loaded WebGL composition                                                             |
| `src/scene/Portal`              | Extruded open arch geometry, layered frame and aperture shader                              |
| `src/scene/environment`         | Instanced architecture, stone material, reflection, atmosphere and lazy project destination |
| `src/scene/particles`           | One seeded point cloud, animated on the GPU                                                 |
| `src/scene/shaders`             | GLSL noise and optical depth effects                                                        |
| `src/styles`                    | Interface styles and responsive rules                                                       |
| `tests`                         | Opening clearance and camera continuity tests                                               |

The phase machine is `initializing → portal → entering → world`. GSAP controls one continuous entry parameter; Three.js evaluates the spatial path and lens. ScrollTrigger scrubs the subsequent camera path. React is not used as a per-frame animation bus.

The 3D world is decorative. H1, identity, narrative, navigation and buttons remain HTML. Native dialogs handle focus trapping and Escape. About, Expertise, Experiments and Contact are future destinations represented by noninteractive labels, not fake links.

## Art direction

The threshold is an architectural arch with four recessed layers, asymmetric buttresses and low, restrained white illumination. Its opening uses procedural distortion, a faint crescent and sparse dust. The camera moves through the physical opening, then follows the ascending path to a monolithic project screen.

The first environment intentionally stops at the Projects destination. Custom assets, complete case studies and sound belong to later milestones. No autoplay audio or inactive sound control is included. Future audio should attach to the existing entry event and phase changes, creating its AudioContext only after explicit user activation.

The supplied concept frame informs scale, materials and light. It is not distributed with the project. The no-WebGL fallback uses a restrained CSS atmosphere and the same semantic content.

## Performance

| Quality      | DPR cap | Dust points | Planar reflection | Bloom      |
| ------------ | ------- | ----------- | ----------------- | ---------- |
| Desktop      | 1.5     | 1,100       | 512px, blurred    | Restrained |
| Mobile / low | 1.0     | 380         | Off               | Off        |

- Coarse-pointer, narrow-screen and low-core-count devices start in low quality.
- After warmup, three sustained samples below 32 FPS reduce quality once. The quality does not oscillate upward and downward.
- Geometry and materials are memoized and disposed; the 74 environmental blocks are instanced.
- The environment reflection is rendered once; no HDR download is required.
- Rendering switches to demand mode when hidden, when a dialog is open or when reduced motion is selected.
- Camera and shader values update outside React. Pointer handlers, media-query listeners, timers and ScrollTriggers are cleaned up.
- The WebGL scene and Projects environment are separate lazy chunks.
- Manrope is self-hosted as one 25 KB WOFF2 subset with `font-display: swap`.
- WebGL preflight, context-loss handling, an error boundary and an 18-second initialization deadline preserve access to the content.

Development-only controls:

| URL query           | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `?debug`            | FPS, draw calls across render passes, triangles and current quality |
| `?qa=390`           | A real 390 × 844 iframe viewport for responsive inspection          |
| `?qa=1024`          | A real 1024 × 768 iframe viewport                                   |
| `?renderer-failure` | Exercise the no-WebGL fallback                                      |

These controls are removed by the production build. Target 60 FPS on a desktop GPU and at least 30 FPS on the mobile tier; these are targets, not measured results. See [QA status](docs/QA.md) for the current verification limits.

Implementation follows the [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) and [GSAP ScrollTrigger lifecycle API](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Future asset pipeline

1. Keep the portal, paths, particles and environmental effects procedural.
2. Introduce a Blender/GLB asset only where it materially improves the scene. Apply transforms, use consistent meter scale and remove hidden geometry.
3. Export one environment per GLB. Reuse materials, instance repeated geometry and provide lower-detail variants.
4. Optimize with Meshopt or Draco, then inspect the decoded result. Add and self-host the matching decoder only when a compressed asset is introduced.
5. Bake detail into textures. Use KTX2/Basis for GPU textures when needed; limit mobile textures to 1K and use 2K only for close-up hero surfaces.
6. Load future destinations with separate React lazy/Suspense boundaries; keep loading and error handling local to the destination so a failed asset cannot reset the whole journey.
7. Record asset ownership, license and source. Keep Blender source separately from production assets. Do not commit uncompressed multi-megabyte texture variants.

## Static deployment

`npm run build` emits a standalone static frontend. There is no server, database, runtime API or provider-specific application dependency.

For **Cloudflare Pages**:

1. Connect this GitHub repository to a Pages project.
2. Choose branch `main`, root directory `/`, build command `npm run build`, output directory `dist`.
3. Use Node 24 (`.nvmrc` is included; `NODE_VERSION=24` can also be set in the build settings).
4. Deploy. Serve hashed assets with long-lived caching and allow `index.html` to revalidate.

See Cloudflare's [Vite deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) and [build image configuration](https://developers.cloudflare.com/pages/configuration/build-image/). The same `dist/` directory works with another static host at a domain root.

`.openai/hosting.json` identifies the optional private review deployment in ChatGPT Sites. It is not needed for Cloudflare Pages and contains no credentials.

## Milestone boundary

Implemented: technical foundation, portal vertical slice, first environment, camera choreography, placeholder Projects destination and initial performance safeguards.

Next: validate and tune the actual WebGL composition on a GPU-enabled browser, then custom assets and the first real case study. Sound, wider-device profiling and final public launch follow those milestones. The project is not presented as visually signed off until the GPU review passes.

## Credits

- Art direction reference: concept frame supplied by Juan-Carlos; not redistributed.
- Manrope: SIL Open Font License; included at `public/fonts/OFL.txt`.
- Three.js, React Three Fiber, Drei, React, Vite, Zustand, GSAP and postprocessing: their respective upstream licenses apply.
