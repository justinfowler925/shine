const mount=document.querySelector('main');
mount.innerHTML=`<h1>Deal support</h1><div id="toolbar" role="search"><button id="review" class="primary">Review next request</button><input type="search" aria-label="Search requests"><button id="clear">Clear</button><select id="owner" aria-label="Owner"><option value="">All owners</option><option>Unassigned</option></select><button id="columns" aria-pressed="false">Owner column</button></div><div id="loading" hidden>Loading requests…</div><div id="empty" hidden>No requests yet</div><div id="filtered" hidden>No matching requests</div><div id="error" role="alert" hidden>Could not load requests <button id="retry">Retry</button></div><div class="scroll"><table id="queue"><thead><tr><th aria-sort="none"><button id="sort">Account</button></th><th class="owner">Owner</th><th>Actions</th></tr></thead><tbody></tbody></table></div><nav aria-label="Pagination"><button id="previous">Previous</button><span id="range"></span><button id="next">Next</button></nav><p id="detail" role="status"></p>`;
const $=s=>document.querySelector(s);
let records=[],query='',owner='',direction=0,page=0,showOwner=true;
function render(){
 let rows=records.filter(r=>r.account.toLowerCase().includes(query.toLowerCase())&&(!owner||r.owner===owner));
 if(direction)rows.sort((a,b)=>direction*a.account.localeCompare(b.account));
 const count=rows.length;page=Math.min(page,Math.max(0,Math.ceil(count/2)-1));rows=rows.slice(page*2,page*2+2);
 $('tbody').replaceChildren(...rows.map(r=>{const tr=document.createElement('tr');for(const value of [r.account,r.owner]){const td=document.createElement('td');td.textContent=value;tr.append(td)}tr.children[0].className='account';tr.children[1].className='owner';const td=document.createElement('td'),button=document.createElement('button');button.textContent='Open '+r.account;button.onclick=()=>{$('#detail').textContent='Request for '+r.account+' — owner: '+r.owner};td.append(button);tr.append(td);return tr}));
 for(const el of document.querySelectorAll('.owner'))el.hidden=!showOwner;
 $('#previous').disabled=page===0;$('#next').disabled=(page+1)*2>=count;
 $('#range').textContent=count?`${page*2+1}–${Math.min(count,(page+1)*2)} of ${count}`:'0 of 0';
 $('#empty').hidden=records.length!==0;$('#filtered').hidden=records.length===0||count!==0;
}
async function fetchRecords(){
 $('#loading').hidden=false;$('#error').hidden=true;$('#empty').hidden=true;$('#filtered').hidden=true;
 try{const response=await fetch('./data.json');if(!response.ok)throw new Error('request');records=await response.json();render()}
 catch{records=[];$('tbody').replaceChildren();$('#error').hidden=false}
 finally{$('#loading').hidden=true}
}
$('#sort').onclick=()=>{direction=direction===1?-1:1;page=0;$('#sort').parentElement.setAttribute('aria-sort',direction===1?'ascending':'descending');render()};
$('input').oninput=e=>{query=e.target.value;page=0;render()};
$('#clear').onclick=()=>{query='';owner='';$('input').value='';$('#owner').value='';page=0;render()};
$('#owner').onchange=e=>{owner=e.target.value;page=0;render()};
$('#columns').onclick=()=>{showOwner=!showOwner;$('#columns').setAttribute('aria-pressed',String(!showOwner));render()};
$('#next').onclick=()=>{page++;render()};$('#previous').onclick=()=>{page--;render()};$('#retry').onclick=fetchRecords;
fetchRecords();

$('#review').onclick=()=>{const request=records.find(r=>r.owner==='Unassigned');$('#detail').textContent=request?'Request for '+request.account+' — owner: '+request.owner:'No unassigned requests'};
