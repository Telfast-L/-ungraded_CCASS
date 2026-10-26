let active=null,month='';
const dialog=document.createElement('dialog');dialog.className='date-calendar';dialog.setAttribute('aria-label','Choose source date');document.body.append(dialog);
const iso=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
function draw(){
 const available=new Set([...active.options].map(o=>o.value));const dates=[...available].sort(),months=[...new Set(dates.map(d=>d.slice(0,7)))];
 const [y,m]=month.split('-').map(Number),first=new Date(y,m-1,1),days=new Date(y,m,0).getDate(),index=months.indexOf(month);
 dialog.innerHTML=`<header><button type="button" data-step="-1" aria-label="Previous available month" ${index<=0?'disabled':''}>‹</button><strong>${first.toLocaleDateString('en',{month:'long',year:'numeric'})}</strong><button type="button" data-step="1" aria-label="Next available month" ${index>=months.length-1?'disabled':''}>›</button><button type="button" data-close aria-label="Close calendar">×</button></header><div class="calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}${'<span></span>'.repeat(first.getDay())}${Array.from({length:days},(_,i)=>{const d=iso(y,m-1,i+1);return `<button type="button" data-date="${d}" aria-label="${d}" ${available.has(d)?'':'disabled'} aria-pressed="${d===active.value}">${i+1}</button>`;}).join('')}</div><p>Only available source dates can be selected.</p>`;
 dialog.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{month=months[index+Number(b.dataset.step)];draw();});
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.querySelectorAll('[data-date]:not(:disabled)').forEach(b=>b.onclick=()=>{const selected=active;selected.value=b.dataset.date;dialog.close();selected.dispatchEvent(new Event('change',{bubbles:true}));selected.dispatchEvent(new Event('calendar-change'));});
 (dialog.querySelector('[aria-pressed="true"]')||dialog.querySelector('[data-date]:not(:disabled)'))?.focus();
}
export function enhanceDatePickers(){
 document.querySelectorAll('#from[type="date"],#to[type="date"]').forEach(input=>{const select=document.createElement('select');select.id=input.id;select.innerHTML=document.querySelector('#date').innerHTML;select.value=input.value;input.replaceWith(select);});
 document.querySelectorAll('select').forEach(select=>{
  if(!select.options.length||![...select.options].every(o=>/^\d{4}-\d{2}-\d{2}$/.test(o.value)))return;
  let button=select.nextElementSibling;
  if(!button?.classList.contains('calendar-trigger')){button=document.createElement('button');button.type='button';button.className='calendar-trigger';select.after(button);select.hidden=true;select.setAttribute('aria-hidden','true');select.tabIndex=-1;select.addEventListener('calendar-change',()=>{button.textContent=select.value+'  ▦';});}
  button.textContent=select.value+'  ▦';button.setAttribute('aria-label',(select.getAttribute('aria-label')||select.parentElement.childNodes[0]?.textContent.trim()||'Source date')+': '+select.value);button.setAttribute('aria-haspopup','dialog');
  button.onclick=e=>{e.preventDefault();active=select;month=select.value.slice(0,7);draw();dialog.showModal();};
 });
}
