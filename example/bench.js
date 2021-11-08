var test = require('tape')
var refine = require('../')
var now = require('performance-now')

var mesh = {
  positions: [ 0,0, 0,500, 500,0 ],
  cells: [ 0,1,2 ],
}
var start = now()
refine(mesh, { maxEdgeLength: 1 })
console.log(now()-start, mesh.positions.length)
