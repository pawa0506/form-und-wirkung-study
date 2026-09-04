# Study asset layout

Each sculpture has one shared reference image and three variant folders. The
filenames expected by `src/config/stimuli.ts` are:

- `sculpture-01/reference.svg`
- `sculpture-01/variant-a/model.ply`
- `sculpture-01/variant-b/model.glb`
- `sculpture-01/variant-c/model.obj` plus `model.mtl` and textures
- `sculpture-02/reference.svg`
- `sculpture-02/variant-a/model.glb`
- `sculpture-02/variant-b/model.obj` plus `model.mtl` and textures
- `sculpture-02/variant-c/model.ply`
- `sculpture-03/reference.svg`
- `sculpture-03/variant-a/model.obj` plus `model.mtl` and textures
- `sculpture-03/variant-b/model.ply`
- `sculpture-03/variant-c/model.glb`

The included references and procedural models are placeholders. Replace them
before data collection and remove `isPlaceholder` from every configured entry.
