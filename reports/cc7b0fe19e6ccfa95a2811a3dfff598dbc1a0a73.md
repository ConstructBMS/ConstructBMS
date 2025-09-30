## Build summary — cc7b0fe19e6ccfa95a2811a3dfff598dbc1a0a73

**Branch:** main **Author:** Napwood Construction Ltd <napwoodconstruction@users.noreply.github.com>
**Commit message:** fix: correct contacts data structure to show content on all pages

- Fix mock data structure: move company-type contacts to companies array
- Ensure contacts array only contains type: 'person' items
- Add proper client, contractor, and consultant data for all categories
- Fixes empty content issue on Clients, Contractors, and Consultants pages
- Now displays proper contact and company data in all contact category pages

### Changed files

- M frontend/src/modules/contacts/store.ts

### Shortstat

1 file changed, 43 insertions(+), 22 deletions(-)

### By top-level directory

-       1 frontend
