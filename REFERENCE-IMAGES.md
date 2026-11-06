# Reference image selection

The two paths are maintained once per sculpture in
`src/config/stimuli.ts` (`sculptureReferences`). Every variant shares that
pair. `referenceImagePath` remains its first entry for existing database and
CSV compatibility; no migration is needed.

Additional photographs (all present locally on 2026-10-30):

- `public/assets/sculptures/sculpture-01/reference-2.jpeg`
- `public/assets/sculptures/sculpture-02/reference-2.jpeg`
- `public/assets/sculptures/sculpture-03/reference-2.jpeg`

Include these currently untracked files when committing/deploying.
Existing primary photographs are not modified.

The reference component keeps the selected view in its own local state.
Its React key is the stimulus ID, so every new trial starts at View 1,
including consecutive variants of the same sculpture. Switching views
does not update the viewer or questionnaire. Practice keeps its single
image and has no selection buttons. Buttons support native keyboard,
touch and aria-pressed state, with German and English labels.
Failed images show the existing retry state; both view buttons stay available.
The fixed-size frame retains object-fit: contain.

Manual release check: select ratings and enter text, rotate/zoom the model,
switch both images, and confirm all previous state remains. Submit a trial
and confirm View 1 is selected again. Check on desktop and a real smartphone,
including image failures, keyboard navigation, and language switching.
