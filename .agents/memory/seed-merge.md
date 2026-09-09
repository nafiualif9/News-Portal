---
name: Local seed merge versioning
description: Demo content updates must add new seed records without overwriting localStorage edits.
---

When localStorage-backed demo content gains new seed records, bump a seed-data version marker and merge only missing IDs on first load.

**Why:** Returning users may already have edited or created articles, while a plain fallback to the new seed array would erase those changes and an unversioned merge can leave stale demo data.

**How to apply:** Keep the merge deterministic, preserve stored records, add missing seed IDs once per version, and keep the marker separate from the article payload.