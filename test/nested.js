var test = require('tape')
var refine = require('../')
var checkEdgeLength = require('./lib/check-edge-length.js')

test('nested cartesian triangle', function (t) {
  var mesh = {
    positions: [ [0,0], [0,5], [5,0] ],
    cells: [ [0,1,2] ],
  }
  var opts = { maxEdgeLength: 2 }
  refine(mesh, opts)
  checkEdgeLength(t, mesh, opts)
  t.end()
})

test('nested big cartesian triangle', function (t) {
  var mesh = {
    positions: [ [0,0], [0,50], [50,0] ],
    cells: [ [0,1,2] ],
  }
  var opts = { maxEdgeLength: 2 }
  refine(mesh, opts)
  checkEdgeLength(t, mesh, opts)
  t.end()
})

test('multiple triangles', function (t) {
  var mesh = {
    positions: [ [0,0], [0,10], [10,0], [10,15], [15,7] ],
    cells: [ [0,1,2], [1,2,3], [2,3,4] ],
  }
  var opts = { maxEdgeLength: 1 }
  refine(mesh, opts)
  checkEdgeLength(t, mesh, opts)
  t.end()
})
