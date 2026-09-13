import {createRoot} from "react-dom/client";
import {Catalog,Showcase} from "./showcase";
import {OriginalLibrary} from "../../verify/fixtures/blocks/library";
import {SystemLibrary} from "../../verify/fixtures/blocks/system";
function Library(){const p=new URLSearchParams(location.search),mode=p.get("view")||"catalog";if(p.has("lab"))return ["system","remote","dashboard"].includes(mode)?<SystemLibrary mode={mode}/>:<OriginalLibrary/>;if(["catalog","components"].includes(mode))return <Catalog/>;return <Showcase mode={mode} legacy={mode==='remote'?<SystemLibrary mode={mode} embedded/>:<OriginalLibrary embedded/>}/>;}
const root=document.documentElement;
root.dataset.cite=['catalog','components'].includes(new URLSearchParams(location.search).get('view')||'catalog')?'shadcn-sidebar-07':'shadcn-dashboard-01';
root.dataset.shineVoice='adapted';
root.dataset.shineAdaptation='Preserves the reference sidebar and content shell; the library presents searchable page previews and the application composes registry workflows in a Northstar consumer theme.';
createRoot(document.getElementById("root")!).render(<Library/>);
