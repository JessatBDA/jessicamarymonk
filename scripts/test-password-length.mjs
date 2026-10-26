import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID,randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';
import { cli,projectRef } from './supabase-cli.mjs';
process.loadEnvFile('.env.local');
const require=createRequire(import.meta.url);let updates=0;
const auth={signInWithPassword:async()=>({error:null}),updateUser:async()=>{updates++;return {error:null};},signOut:async()=>({error:null})};
const dependencies={'next/navigation':{redirect:()=>{throw new Error('PASSWORD_SAVED_REDIRECT');}},zod:require('zod'),'@/lib/supabase/server':{},'@/lib/auth':{requireAdmin:async()=>({client:{auth},user:{email:'test@example.invalid'}})},'@/lib/auth-origin':{}};
const output=ts.transpileModule(readFileSync('src/app/admin/auth-actions.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const actions={};vm.runInNewContext(output,{exports:actions,require:name=>dependencies[name],FormData,URL});
function form(password){const form=new FormData();form.set('password',password);form.set('confirmation',password);form.set('current','current-test-password');return form;}
assert.ok((await actions.changePassword({error:''},form('A1b2C3d4!'))).error);
assert.ok((await actions.resetPassword({error:''},form('A1b2C3d4!'))).error);assert.equal(updates,0);
assert.equal((await actions.changePassword({error:''},form('A1b2C3d4!x'))).success,true);
await assert.rejects(()=>actions.resetPassword({error:''},form('A1b2C3d4!x')),/PASSWORD_SAVED_REDIRECT/);assert.equal(updates,2);
assert.equal((readFileSync('src/components/admin/auth-forms.tsx','utf8').match(/minLength=\{10\}/g)||[]).length,4);
const keys=cli(['projects','api-keys','--project-ref',projectRef,'--reveal','--output','json']);
const secret=keys.find(key=>key.type==='secret'&&key.api_key?.startsWith('sb_secret_'))||keys.find(key=>key.name==='service_role');
const options={auth:{persistSession:false,autoRefreshToken:false}};
const operator=createClient(`https://${projectRef}.supabase.co`,secret.api_key,options);
const userClient=createClient(`https://${projectRef}.supabase.co`,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
let userId;
try {
 const email=`password-boundary-${randomUUID()}@example.invalid`;const initial=randomBytes(24).toString('base64url');
 const created=await operator.auth.admin.createUser({email,password:initial,email_confirm:true});assert.ifError(created.error);userId=created.data.user.id;
 assert.ifError((await userClient.auth.signInWithPassword({email,password:initial})).error);
 const nine=randomBytes(9).toString('base64url').slice(0,9);const ten=randomBytes(12).toString('base64url').slice(0,10);
 assert.ok((await userClient.auth.updateUser({password:nine})).error,'Supabase must reject nine characters');
 assert.ifError((await userClient.auth.updateUser({password:ten})).error);
 assert.ifError((await userClient.auth.signInWithPassword({email,password:ten})).error);
 console.log('Passed: password change and reset reject 9 and accept 10; all four form limits are 10; live Supabase rejects 9, accepts 10, and permits login.');
} finally {if(userId)await operator.auth.admin.deleteUser(userId);console.log('Temporary password-test account removed.');}
