var v0 = [0,0], v1 = [0,0]

module.exports = function (t, mesh, opts) {
  var distance = opts.distance || cartesianDistance
  for (var i = 0; i < mesh.cells.length; i+=3) {
    for (var j = 0; j < 3; j++) {
      var e0 = mesh.cells[i+j]
      var e1 = mesh.cells[i+(j+1)%3]
      var d = cartesianDistance(
        set(v0, mesh.positions[e0*2+0], mesh.positions[e0*2+1]),
        set(v1, mesh.positions[e1*2+0], mesh.positions[e1*2+1])
      )
      if (d > opts.maxEdgeLength) {
        t.fail(`edge length ${d} > max length ${opts.maxEdgeLength} for edge ${e0},${e1} `)
        return
      }
    }
  }
  t.ok(true)
}

function cartesianDistance(a, b) {
  var dx = a[0]-b[0], dy = a[1]-b[1]
  return Math.sqrt(dx*dx+dy*dy)
}

function set(out, x, y) {
  out[0] = x
  out[1] = y
  return out
}
