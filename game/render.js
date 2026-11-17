(function(root){
 const px = x => 66+x*96, py = y => 60+y*82;
 function render(ctx, state, time) {
  const {level,mirrors,result}=state, t=state.reducedMotion?0:time/1000;
  const w=900,h=650;ctx.clearRect(0,0,w,h);
  const sea=ctx.createLinearGradient(0,0,w,h);sea.addColorStop(0,'#132f40');sea.addColorStop(.55,'#0c2537');sea.addColorStop(1,'#081b2e');ctx.fillStyle=sea;ctx.fillRect(0,0,w,h);
  // All coastline, waves, objects and light are drawn here; no downloaded assets.
  for(let i=0;i<92;i++){
   const x=(i*137.3)%930-15,y=(i*79.7)%650,drift=Math.sin(t*.7+i)*5;
   ctx.strokeStyle=`rgba(114,167,183,${.035+(i%4)*.012})`;ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(x+drift,y);ctx.quadraticCurveTo(x+14+drift,y+5,x+29+drift,y);ctx.stroke();
  }
  ctx.strokeStyle='#7aabb512';ctx.lineWidth=1;
  for(let x=0;x<9;x++){ctx.beginPath();ctx.moveTo(px(x),28);ctx.lineTo(px(x),589);ctx.stroke()}
  for(let y=0;y<7;y++){ctx.beginPath();ctx.moveTo(32,py(y));ctx.lineTo(866,py(y));ctx.stroke()}
  ctx.font='9px monospace';ctx.fillStyle='#7297a8';ctx.textAlign='center';
  for(let x=0;x<9;x++)ctx.fillText(String(x+1).padStart(2,'0'),px(x),24);
  for(let y=0;y<7;y++)ctx.fillText('ABCDEFG'[y],19,py(y)+3);
  function island(x,y,r,seed){ctx.save();ctx.translate(x,y);ctx.fillStyle='#071824';ctx.strokeStyle='#46708465';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=r*(.7+.23*Math.sin(seed+i*7)**2);const xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*.7;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.closePath();ctx.stroke();ctx.fill();ctx.translate(-3,-7);ctx.fillStyle='#324653';ctx.strokeStyle='#63808b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r*.5,10);ctx.lineTo(-r*.28,-r*.45);ctx.lineTo(r*.12,-r*.6);ctx.lineTo(r*.5,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(r*.12,-r*.6);ctx.lineTo(0,7);ctx.stroke();ctx.restore()}
  for(const [x,y] of level.rocks)island(px(x),py(y),35,x*3+y);
  // Port's timber piers and shore lights.
  const [hx,hy]=level.port;ctx.fillStyle='#233e49';ctx.fillRect(px(hx)-24,py(hy)-30,51,60);ctx.strokeStyle='#aab9af';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px(hx)+19,py(hy)-25);ctx.lineTo(px(hx)-16,py(hy)-25);ctx.moveTo(px(hx)+19,py(hy)+25);ctx.lineTo(px(hx)-16,py(hy)+25);ctx.stroke();ctx.fillStyle='#edce91';ctx.font='10px monospace';ctx.fillText('PORT',px(hx),py(hy)-40);
  // Soft beam bloom plus crisp center remains readable through motion.
  const route=result.path;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  for(const [width,alpha] of [[23,.025],[12,.055],[5,.18],[2.2,.9]]){ctx.strokeStyle=`rgba(255,219,151,${alpha})`;ctx.lineWidth=width;ctx.beginPath();route.forEach(([x,y],i)=>i?ctx.lineTo(px(x),py(y)):ctx.moveTo(px(x),py(y)));ctx.stroke()}
  ctx.restore();
  for(let i=0;i<level.buoys.length;i++){
   const [x,y]=level.buoys[i],lit=result.lit.includes(i),xx=px(x),yy=py(y)+Math.sin(t*1.4+i)*2;
   if(lit){const halo=ctx.createRadialGradient(xx,yy,1,xx,yy,36);halo.addColorStop(0,'#ffe4a54a');halo.addColorStop(1,'#ffe4a500');ctx.fillStyle=halo;ctx.fillRect(xx-36,yy-36,72,72)}
   ctx.strokeStyle=lit?'#ffe2a5':'#668998';ctx.fillStyle=lit?'#edcf91':'#122f3d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xx,yy,12,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=lit?'#12232b':'#c7d9df';ctx.font='bold 12px Arial';ctx.fillText(i+1,xx,yy+4);ctx.strokeStyle='#688f9b65';ctx.beginPath();ctx.ellipse(xx,yy+16,20,4,0,0,Math.PI*2);ctx.stroke();
  }
  mirrors.forEach(([x,y,orientation],i)=>{
   const xx=px(x),yy=py(y);ctx.fillStyle='#102532';ctx.strokeStyle='#527b89';ctx.lineWidth=1;ctx.beginPath();ctx.arc(xx,yy,22,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.save();ctx.translate(xx,yy);ctx.rotate(orientation===0?-Math.PI/4:Math.PI/4);ctx.shadowColor='#91e7df';ctx.shadowBlur=12;ctx.strokeStyle='#b9eeea';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(17,0);ctx.stroke();ctx.restore();ctx.fillStyle='#a2bac4';ctx.font='10px monospace';ctx.fillText(String.fromCharCode(65+i),xx,yy+36)
  });
  const [sx,sy]=level.source;const xx=px(sx),yy=py(sy);
  island(xx,yy,43,6);ctx.fillStyle='#a5b9ba';ctx.beginPath();ctx.moveTo(xx-12,yy+8);ctx.lineTo(xx-8,yy-36);ctx.lineTo(xx+8,yy-36);ctx.lineTo(xx+12,yy+8);ctx.closePath();ctx.fill();ctx.fillStyle='#455c66';ctx.fillRect(xx-10,yy-11,20,7);ctx.fillStyle='#f6d79b';ctx.shadowColor='#ffdc91';ctx.shadowBlur=23;ctx.fillRect(xx-9,yy-36,18,12);ctx.shadowBlur=0;ctx.fillStyle='#c8d2c9';ctx.beginPath();ctx.moveTo(xx-14,yy-38);ctx.lineTo(xx,yy-48);ctx.lineTo(xx+14,yy-38);ctx.fill();ctx.fillStyle='#b2c4c9';ctx.font='9px monospace';ctx.fillText('LATARNIA',xx,yy+48);
  // Vessel stays at anchor while planning; it sails only after explicit launch.
  let shipX=xx+10,shipY=yy+30,angle=0;
  if(state.phase==='sailing'||state.phase==='won'||(state.phase==='lost'&&state.travel>0)){
   const p=Math.min(state.travel,route.length-1),i=Math.min(Math.floor(p),route.length-2),f=p-i;
   shipX=px(route[i][0]+(route[i+1][0]-route[i][0])*f);shipY=py(route[i][1]+(route[i+1][1]-route[i][1])*f);angle=Math.atan2((route[i+1][1]-route[i][1])*82,(route[i+1][0]-route[i][0])*96);
  }
  ctx.save();ctx.translate(shipX,shipY);ctx.rotate(angle);ctx.strokeStyle='#b4d9de66';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-20-i*7,-9-i*3);ctx.lineTo(-32-i*7,0);ctx.lineTo(-20-i*7,9+i*3);ctx.stroke()}ctx.fillStyle='#e2e8dc';ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(7,-9);ctx.lineTo(-15,-9);ctx.lineTo(-15,9);ctx.lineTo(7,9);ctx.closePath();ctx.fill();ctx.fillStyle='#577f86';ctx.fillRect(-8,-5,13,10);ctx.fillStyle='#eec77e';ctx.fillRect(7,-2,5,4);ctx.restore();
  if(state.phase==='planning'){ctx.fillStyle='#aac6cc';ctx.textAlign='left';ctx.font='9px monospace';ctx.fillText('NA KOTWICY',xx+35,yy+38)}
 }
 root.BeaconRender={render,px,py};
})(globalThis);
