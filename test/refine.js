var test = require('tape')
var refine = require('../')
var checkEdgeLength = require('./lib/check-edge-length.js')

test('cartesian triangle', function (t) {
  var mesh = {
    positions: [ 0,0, 0,5, 5,0 ],
    cells: [ 0,1,2 ],
  }
  refine(mesh, { maxEdgeLength: 2 })
  checkEdgeLength(t, mesh, 2)
  t.end()
})

test('big cartesian triangle', function (t) {
  var mesh = {
    positions: [ 0,0, 0,500, 500,0 ],
    cells: [ 0,1,2 ],
  }
  refine(mesh, { maxEdgeLength: 2 })
  checkEdgeLength(t, mesh, 2)
  t.end()
})
