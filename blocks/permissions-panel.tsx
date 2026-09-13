"use client";
import { FormPanel } from "@/components/shine/form-panel";
export function PermissionsPanel({permissions,granted,onSave}:{permissions:{id:string;label:string;description:string}[];granted:string[];onSave:(granted:string[])=>Promise<void>}) {
 return <div data-product-pattern="permissions-panel"><FormPanel title="Permissions" description="Review access before saving. Changes take effect after the server confirms them." fields={permissions.map(permission=>({name:permission.id,label:permission.label,help:permission.description,type:"checkbox"}))} initialValues={Object.fromEntries(permissions.map(permission=>[permission.id,String(granted.includes(permission.id))]))} onSave={async values=>onSave(permissions.filter(permission=>values[permission.id]==="true").map(permission=>permission.id))}/></div>;
}
