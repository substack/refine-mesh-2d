var refine = require('../')
var mesh = {
  positions: [
    -80.19366, +25.77427,
    -66.10572, +18.46633,
    -64.77797, +32.29149,
  ],
  cells: [0,1,2],
}
refine(mesh, {
  maxEdgeLength: 800_000,
  distance: require('haversine-distance'),
  lerp: require('geolerp'),
})
console.log(mesh)
