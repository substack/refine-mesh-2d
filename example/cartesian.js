var refine = require('../')
var mesh = {
  positions: [ -3,-4, -2,+3, +5,+4, +4,-1 ],
  cells: [0,1,2, 0,2,3],
}
refine(mesh, { maxEdgeLength: 3 })
console.log(mesh)
