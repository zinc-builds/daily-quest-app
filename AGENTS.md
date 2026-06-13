# Architectural Standards

## Principles
1. Deep modules over shallow modules.
2. High locality. Changes concentrate in one place.
3. High leverage. Simple interfaces hide complex work.
4. Explicit seams for every external dependency.

## Module Rules
- Every module must have a clear caller.
- Interfaces are smaller than implementations.
- No module exists to call just one other module.
- Shared logic lives in one place, not copied.

## Domain Terms
See `CONTEXT.md` for the shared glossary.

## Testing Rules
- Tests live at seams.
- Adapters are swappable at seams.
- No tests that know implementation details.

## Core Rules
1. Start with AGENTS.md and CONTEXT.md.
2. Prefer deep modules.
3. Deep modules can be folders; callers import only the index.
4. Split files when concerns are genuinely unrelated.
5. Define seams explicitly (storage, clock, etc.).
6. No code without a caller.
7. Auto-test and auto-build after any structural change.
8. Commit incrementally.
