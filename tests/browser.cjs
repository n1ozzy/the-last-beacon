// Actual Chrome interactions; no mutation of game state. Optional Playwright is test tooling only.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:false});
 const context=await browser.newContext({viewport:{width:1280,height:800},offline:true});
 const page=await context.newPage(),errors=[],network=[],checks=[];
 // Observe actual Canvas draw coordinates, without modifying game state or renderer output.
 await page.addInitScript(()=>{const original=CanvasRenderingContext2D.prototype.translate;
 CanvasRenderingContext2D.prototype.translate=function(x,y){if(this.canvas.id==='sea')window.lastCanvasTranslation=[x,y];return original.call(this,x,y)};});
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
 const check=(name)=>{checks.push(name);console.log('PASS',name)};
 const shot=async name=>page.screenshot({path:path.resolve('screenshots',name),type:'jpeg',quality:88});
 await page.goto('file://'+path.resolve('game/index.html'));
 await page.getByRole('button',{name:'Zapal latarnię'}).waitFor();await shot('1-start.jpg');check('Offline file:// startup and rules');
 await page.getByRole('button',{name:'Zapal latarnię'}).click();
 assert.match(await page.locator('#feedback').innerText(),/Skała/);
 const a=page.locator('[data-mirror="0"]');await a.focus();await page.keyboard.press('ArrowRight');assert.match(await a.getAttribute('aria-label'),/A, ukośnik/);await page.keyboard.press('ArrowLeft');assert.match(await a.getAttribute('aria-label'),/odwrotny/);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.mirror),'1');await page.keyboard.press('Enter');assert.match(await page.locator('[data-mirror="1"]').getAttribute('aria-label'),/B, ukośnik/);check('Keyboard selection, arrows and Enter rotate mirrors');
 await page.keyboard.press('r');assert.match(await a.getAttribute('aria-label'),/odwrotny/);assert.equal(await page.locator('#timer').innerText(),'01:20');check('Keyboard restart restores level and clock');
 const anchored=await page.evaluate(()=>window.lastCanvasTranslation);await a.click();await page.locator('[data-mirror="1"]').click();assert.deepEqual(await page.evaluate(()=>window.lastCanvasTranslation),anchored);check('Canvas vessel stays anchored while mirrors rotate');assert.equal(await page.locator('#count').innerText(),'3 / 4');await shot('2-play.jpg');
 const clockBefore=await page.locator('#timer').innerText();await page.getByRole('button',{name:'Zasady'}).click();await page.waitForTimeout(1300);assert.equal(await page.locator('#timer').innerText(),clockBefore);await page.keyboard.press('Escape');await page.locator('#overlay').waitFor({state:'hidden'});check('Help opens, pauses clock and closes with Escape');
 await page.getByRole('button',{name:'Start rejsu'}).click();assert.equal(await a.isDisabled(),true);await page.waitForFunction(()=>window.lastCanvasTranslation[0]>100);const moving=await page.evaluate(()=>window.lastCanvasTranslation);assert.notDeepEqual(moving,anchored);await page.getByRole('button',{name:'Spróbuj ponownie'}).waitFor();assert.match(await page.locator('#dialog-copy').innerText(),/Skała/);await page.waitForFunction(()=>window.lastCanvasTranslation[0]===738&&window.lastCanvasTranslation[1]===60);await page.screenshot({path:'../evidence/loss.jpg',type:'jpeg'});check('Invalid voyage animates to obstruction, locks mirrors and explains loss');
 await page.getByRole('button',{name:'Spróbuj ponownie'}).click();
 for(let level=0;level<3;level++){
  const n=[4,5,6][level];for(let i=0;i<n;i++)await page.locator(`[data-mirror="${i}"]`).click();
  assert.match(await page.locator('#feedback').innerText(),/Trasa gotowa/);assert.match(await page.locator('#phase').innerText(),/STATEK CZEKA/);
  if(level===2)await shot('3-solved.jpg');
  const timer=await page.locator('#timer').innerText();await page.getByRole('button',{name:'Start rejsu'}).click();
  await page.getByRole('button',{name:level===2?'Zagraj od początku':'Następny rejs'}).waitFor();assert.equal(await page.locator('#timer').innerText(),timer);check(`Level ${level+1}: mouse solution, explicit launch, frozen sailing timer and victory`);
  if(level===2){await shot('4-result.jpg');await page.getByRole('button',{name:'Zagraj od początku'}).click()}else await page.getByRole('button',{name:'Następny rejs'}).click();
 }
 assert.equal(await page.locator('#level-title').innerText(),'Cicha zatoka');check('Campaign restart returns to level 1');
 // Accelerate browser clock, not application state, to exercise real timeout code.
 const timeoutPage=await context.newPage();await timeoutPage.clock.install();await timeoutPage.goto('file://'+path.resolve('game/index.html'));await timeoutPage.getByRole('button',{name:'Zapal latarnię'}).click();await timeoutPage.clock.fastForward(81000);
 await timeoutPage.getByRole('button',{name:'Spróbuj ponownie'}).waitFor();assert.match(await timeoutPage.locator('#dialog-copy').innerText(),/Mgła/);assert.equal(await timeoutPage.locator('#timer').innerText(),'00:00');await timeoutPage.close();check('Planning timeout produces loss (browser clock advanced 81 seconds)');
 await page.keyboard.press('r');assert.equal(await page.locator('#timer').innerText(),'01:20');
 await page.getByRole('button',{name:'Start rejsu'}).click();await page.getByRole('button',{name:'Zacznij od nowa'}).click();assert.match(await page.locator('#phase').innerText(),/UKŁADANIE/);check('Mouse restart interrupts voyage safely');
 const mobile=await context.newPage();await mobile.setViewportSize({width:390,height:844});await mobile.goto('file://'+path.resolve('game/index.html'));await mobile.getByRole('button',{name:'Zapal latarnię'}).click();assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.screenshot({path:'../evidence/mobile.jpg',type:'jpeg',fullPage:true});check('390px layout has no horizontal overflow');
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);check('No page errors and zero HTTP(S) requests throughout offline desktop run');
 fs.writeFileSync('../evidence/browser-results.json',JSON.stringify({browser:await browser.version(),viewport:'1280x800',offline:true,checks,errors,network},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
