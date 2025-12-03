result: https://github.com/andrew-pokynboroda/idea_radar/commit/f5456068fa289273b21fdd0fc88848ca9a3714be

```markdown
Refactor the project. Changes:
- remove comments unless they needed forunderstanding and I would not be able to figure out it myself
- make method small with explicit naming and reusable espasialy in orchestrator
- create error capture method in utils and use it everywhere where potential error might be
- use fail fast approach
- clients must encapsulate logic specific to platform that intagrated and only expose simple generic methods

```