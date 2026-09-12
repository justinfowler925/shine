import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { DataGrid } from "@/components/shine/data-grid";
import { RecordEditor } from "@/components/shine/record-editor";
import { DetailSheet } from "@/components/shine/detail-sheet";
import { WorkspaceTabs } from "@/components/shine/workspace-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ColumnDef } from "@tanstack/react-table";

type Row = { id: string; name: string; owner: string; amount: number };
const seed: Row[] = Array.from({length: 12}, (_, i) => ({id:String(i+1),name:`Account ${String(i+1).padStart(2,"0")}`,owner:i%2?"Riley":"Sam",amount:(i+1)*100}));
const columns: ColumnDef<Row>[] = [{accessorKey:"name",header:"Account"},{accessorKey:"owner",header:"Owner",filterFn:"equalsString"},{accessorKey:"amount",header:"Amount"}];
function Notes(){return <label className="flex flex-col gap-2">Workspace notes<Input aria-label="Workspace notes" /></label>;}
function App(){
 const [rows,setRows]=useState(seed),[state,setState]=useState<"ready"|"loading"|"error">("ready"),[active,setActive]=useState<Row|null>(null),[editing,setEditing]=useState<Row|null>(null);
 const [fail,setFail]=useState(true),[writes,setWrites]=useState(0),[bulkFail,setBulkFail]=useState(true),[bulkResult,setBulkResult]=useState("");
 return <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
  <header className="space-y-2"><h1 className="text-2xl font-semibold">Account workspace</h1><p className="text-muted-foreground">Review ownership and update account records.</p></header>
  <nav aria-label="Fixture scenarios" className="flex flex-wrap gap-2"><Button onClick={()=>setState("loading")}>Load scenario</Button><Button onClick={()=>setState("error")}>Error scenario</Button><Button onClick={()=>{setRows([]);setState("ready");}}>Empty scenario</Button><Button onClick={()=>{setRows(seed.slice(0,10));setState("ready");}}>Ten records</Button><Button onClick={()=>{setRows(seed);setState("ready");}}>Reset records</Button><Button onClick={()=>setFail(false)}>Allow save</Button><Button onClick={()=>setBulkFail(false)}>Allow bulk</Button></nav>
  <p role="status" data-testid="writes">Saved records: {writes}</p><p data-testid="bulk-result">{bulkResult}</p>
  <WorkspaceTabs label="Account views" tabs={[
    {value:"accounts",label:"Accounts",content:<DataGrid title="Accounts" rows={rows} columns={columns} getRowId={row=>row.id} rowLabel={row=>row.name} onOpen={setActive} columnLabels={{name:"Account",owner:"Owner",amount:"Amount"}} filters={[{column:"owner",label:"Owner",options:[{value:"Sam",label:"Sam"},{value:"Riley",label:"Riley"}]}]} state={state} onRetry={()=>{setRows(seed);setState("ready");}} emptyMessage="Add an account to begin." bulkAction={{label:"Assign selected",run:async selected=>{if(bulkFail)throw new Error("Assignment failed. Selection retained.");setBulkResult(selected.map(row=>row.name).join(", "));}}} />},
    {value:"notes",label:"Notes",content:<Notes/>},
    {value:"disabled",label:"Unavailable",disabled:true,content:"Unavailable"},
    {value:"history",label:"History",content:<p>Account changes appear here.</p>}
  ]}/>
  <DetailSheet open={Boolean(active)} onOpenChange={open=>{if(!open)setActive(null);}} title={active?.name||"Account"} description="Account ownership and value" actions={<Button onClick={()=>{setEditing(active);setActive(null);}}>Edit account</Button>}><dl className="space-y-3"><dt>Owner</dt><dd>{active?.owner}</dd><dt>Amount</dt><dd>{active?.amount}</dd></dl><Button onClick={()=>{setEditing(active);setActive(null);}}>Update details</Button></DetailSheet>
  {editing&&<RecordEditor key={editing.id} returnFocus={() => document.querySelector<HTMLButtonElement>('[aria-label="Open Account 01"]') || document.querySelector<HTMLButtonElement>('[aria-label="Account views"] [role="tab"]')} title="Edit account" description="Save account ownership changes" initialValues={{name:editing.name,owner:editing.owner,email:"owner@example.com"}} fields={[{name:"name",label:"Account name",required:true},{name:"owner",label:"Owner",required:true},{name:"email",label:"Email",type:"email",required:true}]} onClose={()=>setEditing(null)} onSave={async values=>{await new Promise(resolve=>setTimeout(resolve,200));if(fail)throw new Error("Save failed. Your draft is still here.");setRows(current=>current.map(row=>row.id===editing.id?{...row,name:values.name,owner:values.owner}:row));setWrites(count=>count+1);}}/>}
 </main>;
}
createRoot(document.getElementById("root")!).render(<App/>);
