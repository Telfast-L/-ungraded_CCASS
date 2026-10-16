import {holdingChanges,isIntermediary} from './core.js';
const seed=text=>[...String(text)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,2166136261);
export function demoInsight(id){const n=seed(id),count=2+n%3;const subs=Array.from({length:count},(_,i)=>({name:'sub '+String.fromCharCode(65+i),days:5+seed(id+':'+i)%26}));return {days:Math.max(...subs.map(s=>s.days)),subs};}
export function demoVendorIds(snapshot){return new Set(snapshot.participants.slice().sort((a,b)=>b.holding-a.holding).slice(0,20).filter(isIntermediary).sort((a,b)=>seed(snapshot.stock+':'+snapshot.date+':'+a.id)-seed(snapshot.stock+':'+snapshot.date+':'+b.id)).slice(0,10).map(p=>String(p.id)));}
export function intelCandidates(start,end){return holdingChanges(start,end).filter(p=>isIntermediary(p)&&Math.abs(p.stakeChange)>0.1).sort((a,b)=>Math.abs(b.stakeChange)-Math.abs(a.stakeChange));}
