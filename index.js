var v0 = [0,0]
var v1 = [0,0]

module.exports = function refine2d(mesh, opts) {
  var r = new Refine(mesh, opts)
  r.refine(4)
  return r.mesh
}

function Refine(mesh, opts) {
  if (!(this instanceof Refine)) return new Refine(mesh, opts)
  if (opts === undefined) opts = {}
  if (typeof opts === 'number') {
    opts = { maxEdgeLength: opts }
  }
  this.mesh = mesh
  this._maxL = opts.maxEdgeLength
  this._distance = opts.distance || cartesianDistance
  this._lerp = opts.lerp || cartesianLerp
  this._edgeToCells = {}
  this._buildEdgeTable()
  this._cellQueue = []
}

Refine.prototype._buildEdgeTable = function () {
  for (var i = 0; i < this.mesh.cells.length/3; i++) {
    this.addCellEdges(i)
  }
}

Refine.prototype.refine = function (n) {
  var updates = 0
  for (var j = 0; j < n; j++) {
    updates = 0
    var clen = this.mesh.cells.length/3
    for (var i = 0; i < clen; i++) {
      if (this._checkDivide(i)) updates++
    }
    var cqlen = this._cellQueue.length
    for (var i = 0; i < cqlen; i++) {
      if (this._checkDivide(this._cellQueue[i])) updates++
    }
    if (updates === 0) break
  }
}

Refine.prototype._checkDivide = function (i) {
  var cells = this.mesh.cells, positions = this.mesh.positions
  var c0 = cells[i*3+0]
  var c1 = cells[i*3+1]
  var c2 = cells[i*3+2]
  var x0 = positions[c0*2+0]
  var y0 = positions[c0*2+1]
  var x1 = positions[c1*2+0]
  var y1 = positions[c1*2+1]
  var x2 = positions[c2*2+0]
  var y2 = positions[c2*2+1]
  var updated = false
  var d01 = this._distance(set2(v0,x0,y0), set2(v1,x1,y1))
  var d12 = this._distance(set2(v0,x1,y1), set2(v1,x2,y2))
  var d20 = this._distance(set2(v0,x2,y2), set2(v1,x0,y0))
  if (d01 >= d12 && d01 >= d20 && d01 > this._maxL) {
    this._divideEdge(c0,c1)
    updated = true
  } else if (d12 >= d01 && d12 >= d20 && d12 > this._maxL) {
    this._divideEdge(c1,c2)
    updated = true
  } else if (d20 >= d01 && d20 >= d12 && d20 > this._maxL) {
    this._divideEdge(c2,c0)
    updated = true
  }
  return updated
}

Refine.prototype._divideEdge = function (e0,e1) {
  var cells = this.mesh.cells, positions = this.mesh.positions
  set2(v0, positions[e0*2+0], positions[e0*2+1])
  set2(v1, positions[e1*2+0], positions[e1*2+1])
  var k = positions.length/2
  this._lerp(v0, v0, v1, 0.5)
  positions.push(v0[0], v0[1])

  var ek = e0 < e1 ? e0+','+e1 : e1+','+e0
  var cs = this._edgeToCells[ek]
  for (var c of cs) {
    var c0 = cells[c*3+0]
    var c1 = cells[c*3+1]
    var c2 = cells[c*3+2]
    var opposite = -1
    if (c0 !== e0 && c0 !== e1) { opposite = c0 }
    if (c1 !== e0 && c1 !== e1) { opposite = c1 }
    if (c2 !== e0 && c2 !== e1) { opposite = c2 }
    // new cell:
    cells.push(k, opposite, e0)
    this.addCellEdges(cells.length/3-1)
    // update previous cell and add to cellQueue:
    this.removeCellEdges(c)
    cells[c*3+0] = k
    cells[c*3+1] = e1
    cells[c*3+2] = opposite
    this.addCellEdges(c)
    this._cellQueue.push(c, cells.length/3-1)
  }
  delete this._edgeToCells[ek]
}

Refine.prototype.addCellEdges = function (i) {
  var c0 = this.mesh.cells[i*3+0]
  var c1 = this.mesh.cells[i*3+1]
  var c2 = this.mesh.cells[i*3+2]
  var ek01 = c0<c1 ? c0+','+c1 : c1+','+c0
  var ek12 = c1<c2 ? c1+','+c2 : c2+','+c1
  var ek20 = c2<c0 ? c2+','+c0 : c0+','+c2
  if (!this._edgeToCells[ek01]) this._edgeToCells[ek01] = new Set
  this._edgeToCells[ek01].add(i)
  if (!this._edgeToCells[ek12]) this._edgeToCells[ek12] = new Set
  this._edgeToCells[ek12].add(i)
  if (!this._edgeToCells[ek20]) this._edgeToCells[ek20] = new Set
  this._edgeToCells[ek20].add(i)
}

Refine.prototype.removeCellEdges = function (i) {
  var c0 = this.mesh.cells[i*3+0]
  var c1 = this.mesh.cells[i*3+1]
  var c2 = this.mesh.cells[i*3+2]
  var ek01 = c0<c1 ? c0+','+c1 : c1+','+c0
  var ek12 = c1<c2 ? c1+','+c2 : c2+','+c1
  var ek20 = c2<c0 ? c2+','+c0 : c0+','+c2
  if (this._edgeToCells[ek01]) {
    this._edgeToCells[ek01].delete(i)
  }
  if (this._edgeToCells[ek12]) {
    this._edgeToCells[ek12].delete(i)
  }
  if (this._edgeToCells[ek20]) {
    this._edgeToCells[ek20].delete(i)
  }
}

function cartesianDistance(a, b) {
  var dx = a[0]-b[0]
  var dy = a[1]-b[1]
  return Math.sqrt(dx*dx+dy*dy)
}

function cartesianLerp(out, a, b, t) {
  t = Math.min(1, Math.max(0, t))
  var x = a[0]*(1-t) + b[0]*t
  var y = a[1]*(1-t) + b[1]*t
  return set2(out, x, y)
}

function set2(out, x, y) {
  out[0] = x
  out[1] = y
  return out
}
