# Form & Wirkung — 3D reconstruction study

Production-oriented static React application for a within-subject bachelor
thesis study on the perceived visual fidelity of 3D reconstructions of public
sculptures. A non-persisted practice round is followed by exactly nine real
trials. In every trial, the interactive model, shared sculpture reference, six
mandatory seven-point Likert items, and one optional text response remain on
the same screen.

The repository ships with procedural 3D placeholders and placeholder reference
illustrations so the complete flow can be exercised without the large research
assets. Replace every placeholder before collecting data.

## Technology and library choices

- **React 19 + TypeScript + Vite 8:** compact static frontend with no server
  runtime, suitable for GitHub Pages.
- **Three.js 0.180:** one shared scene/camera/control layer for mesh assets.
- **Three.js GLTFLoader:** `.glb` scenes and embedded/external textures.
- **Three.js OBJLoader + MTLLoader:** textured `.obj` assets with `.mtl` files.
- **Spark 2.1 (`@sparkjsdev/spark`):** Three.js-integrated Gaussian splat
  rendering. Its official documentation lists original Gaussian-splat PLY,
  compressed PLY, SPZ, SPLAT, KSPLAT, and other formats, and its project states
  support for WebGL2 mobile devices. See the
  [Spark repository](https://github.com/sparkjsdev/spark) and
  [PLY loading documentation](https://github.com/sparkjsdev/spark/blob/main/docs/docs/loading-splats.md).
- **Supabase JS:** anonymous Auth identities, Postgres persistence, row-level
  security, and email/password admin authentication.
- **Lucide React:** a small, consistent icon set. No UI framework or router is
  required; the only secondary route uses `#/admin`, which is safe on static
  hosting.

The lockfile fixes the resolved dependency versions. Node.js 20.19 or newer is
required.

## Project structure

```text
src/
  admin/AdminApp.tsx       protected dashboard, filters, statistics, export
  app/App.tsx              study state machine and resume reconciliation
  components/              shared participant controls and rating form
  config/copy.ts           exact study items and bilingual participant copy
  config/stimuli.ts        internal stimulus manifest (the only method mapping)
  lib/                     Supabase, data access, statistics, CSV, paths, device
  study/                   local session and two-level randomization
  viewer/                  unified viewer plus mesh/splat adapters
public/assets/
  practice/                practice reference and expected practice model
  sculptures/              one reference plus three variant folders per object
supabase/migrations/       database schema, constraints, RLS policies
.github/workflows/         GitHub Pages build and deployment
```

## Local installation

Using npm:

```bash
npm install
cp .env.example .env
npm run dev
```

Using the repository's preferred package manager:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Create a production build with either `npm run build` or `pnpm build`. Run the
automated checks with `npm test` or `pnpm test`. The static output is `dist/`.

Without Supabase values, the participant flow runs as a local demonstration and
does not persist records. The protected dashboard intentionally remains
unavailable until Supabase is configured.

## Environment variables

Copy `.env.example` to `.env` and set:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
VITE_BASE_PATH=/
VITE_SITE_URL=http://localhost:5173
```

Only the public publishable/anon key belongs in the frontend. Never add a
service-role key. `VITE_BASE_PATH` must end with `/`; the Pages workflow sets it
automatically to `/<repository-name>/`.

## Stimulus manifest and asset replacement

`src/config/stimuli.ts` is the central manifest. Every real entry has:

```ts
{
  id,
  sculptureId,
  sculptureNameInternal,
  hiddenVariantId,
  hiddenVariantLabel,
  assetType,
  assetPath,
  mtlPath,             // optional, OBJ only
  referenceImagePath,
  rendererType,
  initialRotation,     // optional [x, y, z] radians
}
```

`sculptureNameInternal` and `hiddenVariantLabel` are internal metadata. They are
used only by configuration and the protected dashboard; participant components
never render them. The sample manifest maps the three internal methods to opaque
variant IDs and exercises every supported asset type.

### Add or replace a model

1. Put the final file in its existing folder below
   `public/assets/sculptures/<sculpture>/variant-*/`.
2. For GLB, set `assetType: "glb"` and `rendererType: "mesh"`.
3. For OBJ, keep `model.obj`, `model.mtl`, and its textures together. Texture
   paths inside the MTL should be relative. Set `mtlPath`, `assetType: "obj"`,
   and `rendererType: "mesh"`.
4. For a Gaussian-splat PLY, set `assetType: "splat-ply"` and
   `rendererType: "splat"`. Do not use an ordinary mesh/point-cloud PLY.
5. Set `initialRotation` only if the export coordinate system needs correction.
6. Remove `isPlaceholder: true` and `placeholderShape` from that entry.
7. Run `npm test` and `npm run build`, then inspect every final asset on the
   actual desktop, iOS/iPadOS, and Android devices included in the study scope.

Only the current model is loaded. On trial change, geometries, materials,
textures, splat resources, controls, and the WebGL renderer are disposed before
the next asset is created.

### Add or replace reference images

Each sculpture folder contains exactly one reference file. Update the three
entries in that sculpture block to the exact same `referenceImagePath`. The
manifest validator and tests reject inconsistent paths. Images use `contain`,
not crop, so the complete photograph stays visible. Replace the practice image
independently; practice responses are never sent to Supabase.

## Randomization logic

After active consent, `createTrialOrder` performs two Fisher–Yates shuffles:

1. group the manifest into the three sculpture blocks and shuffle those blocks;
2. independently shuffle the three hidden variants inside each block;
3. flatten the blocks into nine trials.

The order is created once. The browser stores only the anonymous participant
UUID, opaque ordered stimulus IDs, current stage/index, and trial start time.
The participant row stores the randomized sequence as JSONB with opaque
stimulus, sculpture, and variant IDs. A reload reconciles local progress with
already submitted Supabase rows, so a response saved immediately before an
interruption is not shown again. Submitted trials have no back-navigation and
cannot be updated through the participant database role.

Questionnaire answers are intentionally not persisted in local storage. If a
save fails, the current React state retains the six selections and open text,
shows an error, and offers another save attempt without advancing.

## Anonymous participant identity and stored data

Only after consent, Supabase `signInAnonymously()` creates an Auth user. Its UUID
is also the `participants.id`; no name, email, phone, address, exact age, gender,
account profile, or raw user-agent string is requested or stored by the app.
The stored participant fields are consent, device category, timestamps,
completion state, and randomized sequence. Trial rows contain stimulus metadata,
six scores, optional text, and timing.

Supabase Auth keeps its anonymous session tokens in browser storage so the same
UUID can survive a reload. Application-owned local storage remains limited to
the session identifier, progress, and randomized order; the temporary language
choice uses session storage. Clearing browser data or opening another device
makes anonymous recovery impossible.

The app does not intentionally write IP addresses to Postgres. Supabase, GitHub,
and network infrastructure can still process connection metadata in their own
logs. Address this in the study privacy notice, institutional review, retention
policy, and data-processing documentation.

## Supabase setup

1. Create a Supabase project.
2. Under **Authentication → Providers**, enable Anonymous Sign-Ins and
   Email/Password.
3. Apply `supabase/migrations/202608100001_initial_study_schema.sql` in the SQL
   editor, or run `supabase db push` from a linked Supabase CLI project.
4. Copy the project URL and publishable/anon key into `.env` and GitHub secrets.
5. Enable CAPTCHA/Turnstile and review anonymous sign-in rate limits before a
   public launch.

The migration enforces score ranges, nine valid trial indices, asset/renderer
compatibility, maximum text length, valid timestamps, one row per participant
and trial index, and one row per participant/model. Row-level security allows an
anonymous participant to create/read only their own participant and response
rows. A trial insert must match the stored randomized sequence. The completion
flag can be set only after nine response rows exist. Participant responses are
immutable through the frontend role.

### Create an admin account

Create an email/password user in **Authentication → Users**, then run this in
the Supabase SQL editor with the real address:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'admin@example.org';
```

Sign out and back in after changing metadata so the new JWT contains the role.
Do not place an administrator in the public frontend configuration.

## Admin dashboard and CSV export

Open `https://your-site.example/#/admin` and sign in with the marked Supabase
account. Non-admin sessions see only the login screen, and database RLS rejects
admin queries without the signed `app_metadata.role = "admin"` claim.

The dashboard provides:

- started, completed, incomplete, and submitted-trial totals;
- sculpture, hidden-variant, device, and completion filters;
- `n`, mean, and median for each of the six Likert items;
- mean and median of the overall item for every sculpture/variant model;
- filtered open responses and a full raw response table;
- participant and trial-response CSV downloads.

The response CSV includes participant UUID, zero-based trial index plus
human-readable trial number, sculpture/variant IDs, internal method, device,
all six scores, open response, start/submit timestamps, and duration. Exported
participant text that starts like a spreadsheet formula is prefixed safely to
prevent CSV formula execution.

## Viewer architecture

`StudyViewer` owns the participant-facing shell, neutral background, 42° camera,
pixel-ratio cap, OrbitControls, loading/error states, and reset button. Panning
is disabled. Desktop uses left-drag rotation and wheel zoom; touch uses
one-finger rotation and two-finger pinch zoom. The controls never depend on form
focus, so model interaction remains active while radio buttons or the textarea
are used.

`loaders.ts` selects one of two internal adapters:

- `MeshRenderer`: GLTFLoader for GLB or OBJLoader/MTLLoader for textured OBJ.
- `SplatRenderer`: Spark `SplatMesh` for Gaussian-splat PLY plus the shared
  Three.js renderer.

Both return the same object/bounds/disposal contract. Every object is centered
from its bounding box and uniformly scaled so its longest dimension matches the
same target. Camera position, field of view, zoom limits, controls, viewer size,
background, and general environment are constant across models.

## Responsive behavior

On wide screens, the media column remains sticky while the questionnaire scrolls
beside it. The model receives most of the media height, with the full reference
image directly below. On tablets, model and reference sit side by side in a
sticky media strip. On narrow phones, they stack in a sticky strip: the model
retains the larger area and the reference remains directly visible. The media
strip stays interactive while all six items and the optional textarea scroll
beneath it. Likert targets are at least 42–44 px and the layout has no intended
horizontal overflow.

## Gaussian-splat limitations

- Spark requires WebGL2. Its project targets broad mobile WebGL2 coverage, but
  the final device population still needs hardware testing.
- The PLY must use a Gaussian-splat property layout supported by Spark. A normal
  mesh PLY or arbitrary point-cloud PLY is not a substitute.
- Very large uncompressed PLY files can exceed mobile GPU memory or make initial
  loading impractical. Clean outliers and test file size before launch. Spark's
  SPZ format is smaller, but this study manifest intentionally retains raw PLY
  support because it is a stated methodological requirement.
- Splats encode appearance and do not react to mesh lighting like GLB/OBJ
  materials. Camera, framing, background, controls, and shell are standardized;
  identical photometric rendering between fundamentally different formats is
  not technically possible.
- Bounding boxes include outliers. Stray splats can shrink the visible subject;
  crop the final reconstruction before deployment.
- Export coordinate systems vary. Use per-stimulus `initialRotation` and verify
  that all models begin from a methodologically comparable front orientation.

## GitHub Pages deployment

1. Use this folder as the repository root and push it to GitHub.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Add repository secrets `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
4. Push `main` or run **Deploy study to GitHub Pages** manually.

The workflow installs the locked pnpm dependencies, builds with
`VITE_BASE_PATH=/<repository>/`, uploads `dist/`, and deploys it. For a user page
such as `username.github.io` or a custom domain, change `VITE_BASE_PATH` to `/`
and set `VITE_SITE_URL` to that public origin. Hash routing keeps `#/admin`
refresh-safe without server rewrites.

## Pre-study release checklist

- Replace all nine placeholder models and all four placeholder references.
- Remove every `isPlaceholder` flag and confirm all asset URLs return 200.
- Pilot all nine trials plus practice on target desktop and mobile hardware.
- Verify starting orientation, centering, scale, texture paths, splat framing,
  touch gestures, reset, and reference visibility for every model.
- Verify Anonymous Sign-Ins, CAPTCHA, RLS, admin role, CSV columns, retention,
  deletion, privacy notice, and institutional requirements.
- Use a fresh participant to confirm exactly nine immutable rows and the final
  completion timestamp in Supabase.
- Run `npm test` and `npm run build` from a clean checkout.
