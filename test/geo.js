var test = require('tape')
var refine = require('../')
var checkEdgeLength = require('./lib/check-edge-length.js')
var haversineDistance = require('haversine-distance')
var geolerp = require('geolerp')

test('geo', function (t) {
  var mesh = {
    positions: [
      -80.19366, +25.77427,
      -66.10572, +18.46633,
      -64.77797, +32.29149,
    ],
    cells: [0,1,2],
  }
  var opts = {
    maxEdgeLength: 80_000,
    distance: haversineDistance,
    lerp: geolerp,
  }
  refine(mesh, opts)
  checkEdgeLength(t, mesh, opts)
  t.end()
})
