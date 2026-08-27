import assert from "node:assert/strict";
import {seedDesignSpec,validateDesignSpec} from "../core/design-spec.mjs";
import {renderDesignSpec} from "../core/render-spec.mjs";
import {lintText} from "../hooks/design-lint.mjs";

const categories=["datagrid","dashboard","form","marketing","record","lex","voice"];
for(const category of categories){
 const brief={id:`${category}-case`,category,lane:category==="marketing"?"marketing":"saas",brief:`${category} insurance decision workspace`};
 const spec=seedDesignSpec({brief,packet:{selected:{id:category==="datagrid"?"carbon-datatable":"magicui-hero"}}});
 assert.deepEqual(validateDesignSpec(spec,{brief}),[],category);
 const html=renderDesignSpec(spec);
 assert.equal(lintText(`${category}.html`,html).hard.length,0,`${category}: renderer violates design-lint`);
 for(const marker of ["data-cite=","data-task-control","data-task-result","data-region="])assert.ok(html.includes(marker),`${category}: ${marker}`);
 if(category==="datagrid")for(const marker of ["data-sort","data-column-visibility","data-pagination","data-row-action","data-column-resize","data-state=\"loading\"","data-state=\"empty\"","data-state=\"error\""])assert.ok(html.includes(marker),`datagrid: ${marker}`);
 const broken=structuredClone(spec);broken.copy.title="";assert.match(validateDesignSpec(broken,{brief}).join(" "),/copy.title/);
}
console.log("design spec PASS: 7 categories render lint-clean; dashboard structure and full DataGrid contract bite");
