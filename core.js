export const connectCodes = ['A00003','A00004'];
export const isIntermediary = p => /^[ABC]/.test(p.code);
export const totalConnect = s => connectCodes.reduce((sum,code)=>sum+s.connect[code],0);
export const stake = (holding,s) => s.issued>0?holding / s.issued * 100:null;
export function holdingChanges(start,end) {
  const a=new Map(start.participants.map(p=>[p.id,p])),b=new Map(end.participants.map(p=>[p.id,p]));
  return [...new Set([...a.keys(),...b.keys()])].map(id=>{
    const previous=a.get(id),current=b.get(id),before=previous?.holding??0,after=current?.holding??0;
    return {id,code:current?.code||previous?.code||'',name:current?.name||previous.name,before,after,delta:after-before,stakeChange:start.issued>0&&end.issued>0?stake(after,end)-stake(before,start):null};
  }).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||a.name.localeCompare(b.name));
}
export function movements(start,end) {
  const grouped = s => {
    const map=new Map();
    for (const p of s.participants.filter(isIntermediary)) {
      const connected=connectCodes.includes(p.code), key=connected?'connect':p.id;
      const item=map.get(key)||{id:key,name:connected?'CHINA SECURITIES DEPOSITORY AND CLEARING':p.name,holding:0};
      item.holding+=p.holding; map.set(key,item);
    }
    return map;
  };
  const a=grouped(start), b=grouped(end);
  return [...new Set([...a.keys(),...b.keys()])].map(id=>({id,name:b.get(id)?.name||a.get(id).name,before:a.get(id)?.holding||0,after:b.get(id)?.holding||0,delta:(b.get(id)?.holding||0)-(a.get(id)?.holding||0),investor:''})).filter(p=>p.delta!==0).sort((a,b)=>b.delta-a.delta||a.name.localeCompare(b.name));
}
export function feeFor(p,fees,fx,overrides={}) {
  if (Object.hasOwn(overrides,p.id)) return {hkd:overrides[p.id],rule:'Analyst override · HKD',status:'override'};
  const matches=fees.filter(f=>f.code===p.code && p.code);
  if(!matches.length)return {hkd:0,rule:'No matching fee · treated as HKD 0',status:'missing'};
  const unique=[...new Set(matches.map(f=>`${f.currency}:${f.amount}`))];
  if(unique.length>1)return {hkd:null,rule:'Conflicting fee rows',status:'conflict'};
  const f=matches[0];
  if(f.amount===null)return {hkd:0,rule:'Blank fee in workbook · treated as HKD 0',status:'missing'};
  const rate=f.currency==='HKD'?1:f.currency==='USD'?fx.usd:fx.eur;
  if(!Number.isFinite(rate)||rate<=0)return {hkd:null,rule:`${f.currency} ${f.amount} · exchange rate required`,status:'fx'};
  return {hkd:f.amount*rate,rule:`${f.currency} ${f.amount.toLocaleString('en')} fixed fee${matches.length>1?' · duplicate rows deduplicated':''}`,status:'matched'};
}
export const rankedLabels=['Top 10 CCASS','Top 20 CCASS','Top 30 CCASS','Top 40 CCASS','Top 50 CCASS','100K above','500K above','1M above','ALL'];
export const thresholdLabels=['100K above','50K above','10K above','ALL'];
export function costGroup(s,label,fees,fx,{commands=[],overrides={},nonCcassFee=null,unnamedFee=null}={}) {
  const pool=s.participants.slice().sort((a,b)=>b.holding-a.holding||a.id.localeCompare(b.id));
  let selected;
  if(label.startsWith('Top ')) selected=pool.slice(0,Number(label.match(/\d+/)[0]));
  else if(label==='ALL') selected=pool;
  else {const amount=label.startsWith('1M')?1000000:Number(label.match(/\d+/)[0])*1000;selected=pool.filter(p=>p.holding>=amount);}
  let map=new Map(selected.map(p=>[p.id,{...p,adjustment:''}]));
  for(const c of commands) {
    if(c.type==='ADD'&&label!=='ALL'&&!map.has(c.id)){const p=pool.find(p=>p.id===c.id);if(p)map.set(c.id,{...p,adjustment:'Added'});}
    if(c.type==='DROP')map.delete(c.id);
  }
  const members=[...map.values()].sort((a,b)=>b.holding-a.holding).map(p=>({...p,rank:pool.findIndex(q=>q.id===p.id)+1,fee:feeFor(p,fees,fx,overrides)}));
  // Aggregate holdings without a matching fee carry zero cost under the user-selected rule.
  // Unnamed investor holdings cannot be selected by a per-participant holding cutoff. Only ALL includes the aggregate.
  const unnamedIncluded=label==='ALL';
  const namedAggregateIncluded=label==='ALL'&&(s.namedAggregate??0)!==0;
  const shares=(namedAggregateIncluded?s.namedAggregate:0)+members.reduce((n,p)=>n+p.holding,0)+(unnamedIncluded?s.unnamed:0)+s.nonCcass;
  let known=members.reduce((n,p)=>n+(p.fee.hkd??0),0), unresolved=members.filter(p=>p.fee.hkd===null).length;
  let count=members.filter(p=>p.fee.hkd!==null&&p.fee.hkd>=2500).length;
  if(s.nonCcass>0)known+=nonCcassFee??0;
  if(unnamedIncluded&&s.unnamed>0)known+=unnamedFee??0;
  const zeroFees=members.filter(p=>p.fee.status==='missing').length;
  const excluded=pool.filter(p=>!map.has(p.id)&&commands.some(c=>c.type==='DROP'&&c.id===p.id));
  return {label,members,excluded,shares,coverage:stake(shares,s),known,unresolved,zeroFees,count,complete:unresolved===0,unnamedIncluded,namedAggregateIncluded,nonCcass:s.nonCcass};
}
export function commentary(rows,n) {
  const cn=['','一','二','三','四','五','六','七','八','九','十'][n]||n;
  const inflows=rows.filter(p=>p.delta>0).slice(0,n), outflows=rows.filter(p=>p.delta<0).sort((a,b)=>a.delta-b.delta).slice(0,n);
  const line=p=>`${p.name} (${p.delta>0?'+':''}${(p.delta/10000).toFixed(2)}万股) - ${p.investor}`;
  return `券商数据方面，以下是结算数据中前${cn}大净流入及流出托管行：\n\n净流入\n${inflows.map(line).join('\n')}\n\n净流出\n${outflows.map(line).join('\n')}`;
}
