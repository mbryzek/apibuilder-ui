// Reviewable review completion condition — https://docs.reviewable.io/admincenter.html
//
// MIKE REVIEWS THIS REPO. Completion therefore falls back to Reviewable's
// default condition (all files reviewed + discussions resolved) — the script
// never marks the review complete on its own.
//
// The label is the REVIEW POLICY, not the stack: this is a SvelteKit frontend
// and so are several repos that DO auto-complete. `~/code/CLAUDE.md` names the
// auto-completing set; anything not in it is reviewed here.
//
// This script only:
//   - groups files in the matrix (specs first, tests last, generated last), and
//   - marks generated code reviewed + vendored so it's collapsed and never
//     needs to be looked at.
// Groups sort alphabetically; the digit prefixes force the order.

function isGenerated(path) {
  return /(^|\/)generated\//i.test(path);
}

function groupOf(path) {
  if (isGenerated(path)) return '4. Generated';
  if (/\.json$/.test(path)) return '1. Specs & JSON';
  if (/(^|\/)(tests?|playwright)\//i.test(path) || /\.(test|spec)\.[jt]s$/.test(path)) return '3. Tests';
  return '2. Source';
}

var files = review.files.map(function (f) {
  var gen = isGenerated(f.path);
  var out = { path: f.path, group: groupOf(f.path) };
  if (gen) {
    out.vendored = true;
    // Mark generated files reviewed automatically — no clicks needed.
    out.revisions = (f.revisions || []).map(function (r) {
      return { key: r.key, reviewed: true };
    });
  }
  return out;
});

// Only override file grouping; top-level completion uses Reviewable's default.
return { files: files };
