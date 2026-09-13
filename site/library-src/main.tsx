import {createRoot} from "react-dom/client";
import {Catalog,Showcase} from "./showcase";
import {OriginalLibrary} from "../../verify/fixtures/blocks/library";
import {SystemLibrary} from "../../verify/fixtures/blocks/system";
function Library(){const p=new URLSearchParams(location.search),mode=p.get("view")||"catalog";if(p.has("lab"))return ["system","remote","dashboard"].includes(mode)?<SystemLibrary mode={mode}/>:<OriginalLibrary/>;if(["catalog","components"].includes(mode))return <Catalog/>;return <Showcase mode={mode} legacy={mode==='remote'?<SystemLibrary mode={mode} embedded/>:<OriginalLibrary embedded/>}/>;}
createRoot(document.getElementById("root")!).render(<Library/>);
