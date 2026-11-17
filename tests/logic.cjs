const assert=require('node:assert/strict');require('../game/logic.js');
const {levels,trace}=global.BeaconLogic;
const solutions=[[0,0,1,1],[0,0,1,0,1,0],[0,0,1,0,1,0,0]];
for(const [i,level] of levels.entries()){
 const solved=level.mirrors.map((m,j)=>[m[0],m[1],solutions[i][j]]);
 const r=trace(level,solved);assert.equal(r.valid,true,JSON.stringify(r));assert.equal(r.lit.length,level.buoys.length);assert.equal(trace(level,level.mirrors).valid,false);
 console.log(`Level ${i+1}: verified solution ${solutions[i]}, ${r.bounces} bounces, ${r.path.length} cells`);
}
const basic={source:[0,3],port:[8,3],rocks:[],buoys:[],maxBounces:8};
assert.equal(trace({...basic,rocks:[[2,3]]},[]).reason,'rock');
assert.equal(trace({...basic,buoys:[[6,3],[2,3]]},[]).reason,'order');
assert.equal(trace({...basic,buoys:[[2,2]]},[]).reason,'missing');
assert.equal(trace(basic,[[2,3,0]]).reason,'edge');
assert.equal(trace({...basic,maxBounces:0},[[2,3,0]]).reason,'limit');
assert.equal(trace({...basic,source:[3,3]},[[5,3,0],[5,1,1],[2,1,0],[2,3,1]]).reason,'loop');
console.log('Rock, order, missing buoy, map edge, bounce limit and loop verified.');
