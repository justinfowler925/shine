# Records / worklist Operate table-quality fixture

Executable `kind: "worklist"` contract for Operate **list → open → edit** jobs (records pilot deepen). Not a full DataGrid ladder (`kind: "records"` still owns sort/pagination/columns/shared source).

## Files

| File | Role |
|---|---|
| `worklist.html` | Served surface |
| `shared.js` / `shared.css` / `data.json` | Filter + row open + loading/empty/filtered-empty |
| `shine-tables.json` | Worklist table-quality contract |

## Replay

```sh
# from repo root — doctor bite covers this
node verify/records-pilot-table-quality-bite.mjs

# or manually
python3 -m http.server -d verify/fixtures/records-worklist 8765
node verify/table-quality.mjs http://127.0.0.1:8765/worklist.html \
  --contract verify/fixtures/records-worklist/shine-tables.json
```

Denoise recommend for records/worklist jobs emits this fixture path on `recommendation.tableQuality.fixture`.
