(function(){
 const $=id=>document.getElementById(id),{levels,trace}=BeaconLogic;
 const state={index:0,phase:'intro',level:levels[0],mirrors:[],result:null,remaining:80,travel:0,moves:0,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
 const ctx=$('sea').getContext('2d');let last=performance.now(),dialogMode='intro',previousFocus=null;
 function reset(index=state.index,begin=true){
  state.index=index;state.level=levels[index];state.mirrors=state.level.mirrors.map(m=>[...m]);state.remaining=state.level.seconds;state.phase=begin?'planning':'intro';state.travel=0;state.moves=0;
  $('level-title').textContent=state.level.name;$('subtitle').textContent=state.level.hint;$('chapter').textContent=`0${index+1} / 03`;$('sector').textContent=`0${index+1}`;$('level-footer').textContent=`REJS 0${index+1} / 03`;
  $('mirror-controls').replaceChildren();state.mirrors.forEach((m,i)=>{const b=document.createElement('button');b.className='mirror-button';b.style.left=`${BeaconRender.px(m[0])/9}%`;b.style.top=`${BeaconRender.py(m[1])/6.5}%`;b.dataset.mirror=i;b.addEventListener('click',()=>rotate(i));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();rotate(i)}});$('mirror-controls').append(b)});
  $('buoy-list').replaceChildren();state.level.buoys.forEach((_,i)=>{const b=document.createElement('span');b.className='buoy-token';b.textContent=i+1;$('buoy-list').append(b)});
  update();if(begin)closeDialog();last=performance.now();
 }
 function rotate(i){if(state.phase!=='planning')return;state.mirrors[i][2]^=1;state.moves++;update()}
 function update(){state.result=trace(state.level,state.mirrors);const r=state.result;
  $('feedback').textContent=r.detail;$('signal-title').textContent=r.valid?'KORYTARZ OTWARTY':'RAPORT LATARNI';document.querySelector('.signal').classList.toggle('safe',r.valid);
  $('count').textContent=`${r.lit.length} / ${state.level.buoys.length}`;$('bounces').textContent=`${r.bounces} / ${state.level.maxBounces}`;$('port-state').textContent=r.valid?'GOTOWY DO REJSU':'CZEKA NA ŚWIATŁO';
  [...$('buoy-list').children].forEach((b,i)=>{b.classList.toggle('lit',r.lit.includes(i));b.title=`Boja ${i+1}: ${r.lit.includes(i)?'oświetlona':'ciemna'}`});
  [...$('mirror-controls').children].forEach((b,i)=>{b.disabled=state.phase!=='planning';b.setAttribute('aria-label',`Lustro ${String.fromCharCode(65+i)}, ${state.mirrors[i][2]===0?'ukośnik':'odwrotny ukośnik'}. Obróć.`)});
  $('sail').disabled=state.phase!=='planning';$('phase').textContent=state.phase==='sailing'?'STATEK W DRODZE':state.phase==='planning'?'UKŁADANIE TRASY · STATEK CZEKA':state.phase==='won'?'STATEK W PORCIE':'LATARNIA W GOTOWOŚCI';updateClock();
 }
 function updateClock(){const n=Math.ceil(state.remaining);$('timer').textContent=`${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;$('time-fill').style.width=`${100*state.remaining/state.level.seconds}%`;document.querySelector('.timer-panel').classList.toggle('urgent',n<16);$('timer-state').textContent=state.phase==='planning'?'ODLICZANIE':state.phase==='sailing'?'REJS':'ZATRZYMANY'}
 function closeDialog(){$('overlay').hidden=true;document.querySelector('.shell').inert=false;const target=previousFocus&&document.contains(previousFocus)?previousFocus:$('mirror-controls').firstElementChild;target?.focus();previousFocus=null;last=performance.now()}
 function showDialog(mode,reason=''){
  dialogMode=mode;previousFocus=document.activeElement;document.querySelector('.shell').inert=true;$('overlay').hidden=false;$('instructions').hidden=mode!=='intro'&&mode!=='help';$('result-stats').replaceChildren();
  const data={intro:['ZOSTAŃ LATARNIKIEM','The Last<br><em>Beacon.</em>','Ostatni statek czeka na światło. Otwórz mu drogę, zanim morze zniknie we mgle.','Zapal latarnię'],help:['INSTRUKCJA NAWIGACJI','Prowadź<br><em>światłem.</em>','Czas jest wstrzymany podczas czytania zasad.','Wróć do gry'],lost:['SYGNAŁ UTRACONY','Morze<br><em>nie wybacza.</em>',reason,'Spróbuj ponownie'],won:['REJS ZAKOŃCZONY',state.index===levels.length-1?'Wszyscy<br><em>są w domu.</em>':'Bezpiecznie<br><em>w porcie.</em>',state.index===levels.length-1?'Trzy rejsy. Trzy drogi przez ciemność. Twoje światło przeprowadziło ostatni statek przez archipelag.':'Statek dotarł do portu. Kolejna zatoka czeka na swojego latarnika.',state.index===levels.length-1?'Zagraj od początku':'Następny rejs']}[mode];
  $('dialog-eyebrow').textContent=data[0];$('dialog-title').innerHTML=data[1];$('dialog-copy').textContent=data[2];$('dialog-action').textContent=data[3]+' →';$('dialog-foot').textContent=mode==='lost'?'R — nowa próba · Lustra i zegar zostaną zresetowane.':'Tab — wybór lustra · ← / → / Enter — obrót · R — restart';
  if(mode==='won')for(const [value,label] of [[`${state.index+1} / 3`,'UKOŃCZONE REJSY'],[`${Math.ceil(state.remaining)} s`,'ZAPAS CZASU'],[state.moves,'OBROTY LUSTER']]){const d=document.createElement('div');d.textContent=value;const s=document.createElement('small');s.textContent=label;d.append(s);$('result-stats').append(d)}
  $('dialog-action').focus();
 }
 function sail(){if(state.phase!=='planning')return;state.phase='sailing';state.travel=0;update()}
 $('sail').onclick=sail;$('restart').onclick=()=>reset();$('help').onclick=()=>showDialog(state.phase==='intro'?'intro':'help');
 $('dialog-action').onclick=()=>{if(dialogMode==='help')closeDialog();else if(dialogMode==='won')reset((state.index+1)%levels.length);else reset()};
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'){e.preventDefault();reset();return}if(e.key==='?'&&$('overlay').hidden)showDialog('help');if(e.key==='Escape'&&dialogMode==='help'&&!$('overlay').hidden)closeDialog();if(e.key==='Tab'&&!$('overlay').hidden){e.preventDefault();$('dialog-action').focus()}});
 function frame(now){const dt=Math.max(0,(now-last)/1000);last=now;
  if($('overlay').hidden){if(state.phase==='planning'){state.remaining=Math.max(0,state.remaining-dt);updateClock();if(state.remaining===0){state.phase='lost';update();showDialog('lost','Mgła zasłoniła boje, zanim rozpoczął się rejs. Spróbuj ponownie — zacznij od lustra najbliżej latarni.')}}
   else if(state.phase==='sailing'){state.travel=Math.min(state.result.path.length-1,state.travel+Math.min(dt,.1)*5);if(state.travel>=state.result.path.length-1){state.phase=state.result.valid?'won':'lost';update();showDialog(state.phase,state.result.detail)}}
  }
  BeaconRender.render(ctx,state,now);requestAnimationFrame(frame);
 }
 reset(0,false);showDialog('intro');requestAnimationFrame(frame);
})();
