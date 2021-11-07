module.exports = function (t, mesh, maxEdgeLength) {
  for (var i = 0; i < mesh.cells.length; i+=3) {
    for (var j = 0; j < 3; j++) {
      var e0 = mesh.cells[i+j]
      var e1 = mesh.cells[i+(j+1)%3]
      var p0x = mesh.positions[e0*2+0]
      var p0y = mesh.positions[e0*2+1]
      var p1 = mesh.positions[e1*3+0]
      var p1x = mesh.positions[e1*2+0]
      var p1y = mesh.positions[e1*2+1]
      var dx = p0x-p1x, dy = p0y-p1y
      var d = Math.sqrt(dx*dx+dy*dy)
      if (d > maxEdgeLength) {
        t.fail(`edge length ${d} > max length ${maxEdgeLength} for edge ${e0},${e1} `)
        return
      }
    }
  }
  t.ok(true)
}
