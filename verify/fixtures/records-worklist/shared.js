const mount = document.querySelector("main");
mount.innerHTML = `
  <h1>Records inspect → edit → persist</h1>
  <p class="lede">Operate worklist fixture for table-quality <code>kind: worklist</code> (list→detail). Not a full DataGrid ladder.</p>
  <section class="panel" data-region="focal" aria-labelledby="list-heading">
    <h2 id="list-heading">Records</h2>
    <div id="toolbar" role="search">
      <label for="filter">Filter</label>
      <input id="filter" type="search" placeholder="Filter by title or owner" autocomplete="off" />
      <button type="button" class="secondary" id="clear-filter">Clear filter</button>
    </div>
    <p id="loading" hidden>Loading records…</p>
    <p id="empty" hidden>No records yet.</p>
    <p id="filtered" hidden>No matching records.</p>
    <div class="scroll">
      <table id="records">
        <thead>
          <tr><th scope="col">Title</th><th scope="col">Owner</th><th scope="col">Status</th></tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    <p id="detail" role="status"></p>
  </section>
`;

const $ = (s) => document.querySelector(s);
let records = [];
let query = "";
let selectedId = null;

function render() {
  const needle = query.trim().toLowerCase();
  const rows = needle
    ? records.filter((r) => `${r.title} ${r.owner} ${r.status}`.toLowerCase().includes(needle))
    : records.slice();
  $("tbody").replaceChildren(
    ...rows.map((r) => {
      const tr = document.createElement("tr");
      tr.tabIndex = 0;
      tr.dataset.id = r.id;
      tr.setAttribute("aria-selected", r.id === selectedId ? "true" : "false");
      tr.innerHTML = `<td class="title">${r.title}</td><td>${r.owner}</td><td>${r.status}</td>`;
      const open = () => {
        selectedId = r.id;
        $("#detail").textContent = `Editing ${r.title}`;
        render();
      };
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
      return tr;
    }),
  );
  $("#empty").hidden = records.length !== 0;
  $("#filtered").hidden = records.length === 0 || rows.length !== 0;
}

async function fetchRecords() {
  $("#loading").hidden = false;
  $("#empty").hidden = true;
  $("#filtered").hidden = true;
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("request");
    const body = await response.json();
    records = body.map((row, i) => ({ id: `r${i + 1}`, ...row }));
    render();
  } catch {
    records = [];
    $("tbody").replaceChildren();
  } finally {
    $("#loading").hidden = true;
  }
}

$("#filter").oninput = (e) => {
  query = e.target.value;
  render();
};
$("#clear-filter").onclick = () => {
  query = "";
  $("#filter").value = "";
  render();
};
fetchRecords();
