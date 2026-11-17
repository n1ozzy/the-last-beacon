/* Pure cardinal-ray simulation, shared by the browser and offline verification. */
(function (root) {
  const levels = [{
    name: 'Cicha zatoka', subtitle: 'Pierwsze światło', seconds: 80, maxBounces: 6,
    source: [0,5], port: [8,5],
    mirrors: [[3,5,1],[3,2,1],[7,2,0],[7,5,0]],
    buoys: [[2,5],[3,3],[5,2],[7,4]],
    rocks: [[3,6],[1,2],[5,5],[7,0],[5,0],[0,0]],
    hint: 'Zacznij od lustra A. Poprowadź światło w górę, potem na wschód.'
  }, {
    name: 'Przesmyk wraków', subtitle: 'Droga na północ', seconds: 90, maxBounces: 7,
    source: [0,6], port: [4,0],
    mirrors: [[2,6,1],[2,1,1],[6,1,0],[6,4,1],[4,4,0],[8,5,0]],
    buoys: [[1,6],[2,3],[3,1],[6,3],[5,4],[4,2]],
    rocks: [[2,0],[0,2],[3,5],[6,6],[8,1],[0,0]],
    hint: 'Port leży na północy. Nie każde lustro jest potrzebne do rejsu.'
  }, {
    name: 'Ostatnia straż', subtitle: 'Powrót do domu', seconds: 100, maxBounces: 7,
    source: [0,5], port: [8,3],
    mirrors: [[1,5,1],[1,1,1],[7,1,0],[7,5,1],[4,5,0],[4,3,1],[5,0,0]],
    buoys: [[1,3],[3,1],[7,2],[6,5],[4,4],[6,3]],
    rocks: [[1,6],[1,0],[8,1],[7,6],[3,3],[5,6],[0,0]],
    hint: 'Sześć boi. Zawróć światło w głąb zatoki, aby ominąć skały.'
  }];
  function trace(level, mirrors) {
    let [x,y] = level.source, dx = 1, dy = 0, bounces = 0;
    const path = [[x,y]], lit = [], seen = new Set();
    const finish = (reason, detail) => ({path, lit, bounces, reason, detail, valid: reason === 'safe'});
    for (let step = 0; step < 300; step++) {
      x += dx; y += dy;
      path.push([x,y]);
      if (x < 0 || x > 8 || y < 0 || y > 6) return finish('edge','Promień opuszcza mapę. Zmień kierunek na ostatnim lustrze.');
      const key = `${x},${y},${dx},${dy}`;
      if (seen.has(key)) return finish('loop','Promień wraca do tej samej drogi — powstała pętla.');
      seen.add(key);
      if (level.rocks.some(p => p[0] === x && p[1] === y)) return finish('rock','Skała blokuje promień. Obróć lustro przed skałą.');
      const buoy = level.buoys.findIndex(p => p[0] === x && p[1] === y);
      if (buoy !== -1) {
        if (buoy !== lit.length) return finish('order',`Boja ${buoy + 1} jest za wcześnie. Najpierw oświetl boję ${lit.length + 1}.`);
        lit.push(buoy);
      }
      if (x === level.port[0] && y === level.port[1]) {
        return lit.length === level.buoys.length ? finish('safe','Trasa gotowa. Wszystkie boje po kolei prowadzą do portu.') : finish('missing',`Brakuje boi ${lit.length + 1}. Port musi być na końcu trasy.`);
      }
      const mirror = mirrors.find(p => p[0] === x && p[1] === y);
      if (mirror) {
        if (++bounces > level.maxBounces) return finish('limit',`Przekroczono limit ${level.maxBounces} odbić. Skróć drogę światła.`);
        [dx,dy] = mirror[2] === 0 ? [-dy,-dx] : [dy,dx];
      }
    }
    return finish('limit','Promień przekroczył limit drogi.');
  }
  root.BeaconLogic = {levels, trace};
})(globalThis);
