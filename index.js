var v0 = [0,0], v1 = [0,0]

module.exports = function refine2d(mesh, opts) {
  var r = new Refine(mesh, opts)
  r.refine(opts.n || Infinity)
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
  this._divisions = null
  this._dividedCells = null
}

Refine.prototype.refine = function (n) {
  this._dividedCells = null
  var ci = this.mesh.cells.length/3
  for (var j = 0; j < n; j++) {
    this._divisions = {}
    var updated = this._dividedCells
    this._dividedCells = new Set
    if (j === 0) {
      var clen = this.mesh.cells.length/3
      for (var i = 0; i < clen; i++) {
        this._checkDivide(i)
      }
    } else {
      for (var i of updated) {
        this._checkDivide(i)
      }
      for (var i = ci; i < this.mesh.cells.length/3; i++) {
        this._checkDivide(i)
      }
    }
    if (this._dividedCells.size === 0) return
    this._updatedCells = new Set
    this._applyDivisions()
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
  var d01 = this._distance(set2(v0,x0,y0), set2(v1,x1,y1))
  var d12 = this._distance(set2(v0,x1,y1), set2(v1,x2,y2))
  var d20 = this._distance(set2(v0,x2,y2), set2(v1,x0,y0))
  if (d01 > this._maxL) this._divide(c0,c1,i)
  if (d12 > this._maxL) this._divide(c1,c2,i)
  if (d20 > this._maxL) this._divide(c2,c0,i)
}

Refine.prototype._divide = function (e0,e1,i) {
  var ek = edgeKey(e0,e1)
  if (this._divisions[ek] !== undefined) {
    this._dividedCells.add(i)
    return
  }
  var cells = this.mesh.cells, positions = this.mesh.positions
  var k = positions.length/2
  set2(v0, positions[e0*2+0], positions[e0*2+1])
  set2(v1, positions[e1*2+0], positions[e1*2+1])
  this._lerp(v0, v0, v1, 0.5)
  positions.push(v0[0], v0[1])
  this._divisions[ek] = k
  this._dividedCells.add(i)
}

Refine.prototype._applyDivisions = function () {
  var cells = this.mesh.cells, positions = this.mesh.positions
  for (var c of this._dividedCells) {
    var c0 = cells[c*3+0]
    var c1 = cells[c*3+1]
    var c2 = cells[c*3+2]
    var ek01 = edgeKey(c0,c1)
    var ek12 = edgeKey(c1,c2)
    var ek20 = edgeKey(c2,c0)
    var k01 = this._divisions[ek01]
    var k12 = this._divisions[ek12]
    var k20 = this._divisions[ek20]
    if (k01 !== undefined && k12 !== undefined && k20 !== undefined) {
      cells[c*3+0] = k01
      cells[c*3+1] = k12
      cells[c*3+2] = k20
      cells.push(c0, k01, k20, k01, c1, k12, k20, k12, c2)
    } else if (k01 !== undefined && k12 !== undefined) {
      cells[c*3+0] = k01
      cells[c*3+1] = c1
      cells[c*3+2] = k12
      if (this._idist(k01,c2) < this._idist(k12,c0)) {
        cells.push(k01,k12,c2,c0,k01,c2)
      } else {
        cells.push(c0,k01,k12,c0,k12,c2)
      }
    } else if (k12 !== undefined && k20 !== undefined) {
      cells[c*3+0] = k20
      cells[c*3+1] = k12
      cells[c*3+2] = kc2
      if (this._idist(k12,c0) < this._idist(k20,c1)) {
        cells.push(c0,k12,k20,c0,c1,k12)
      } else {
        cells.push(k20,c1,k12,c0,c1,k20)
      }
    } else if (k01 !== undefined && k20 !== undefined) {
      cells[c*3+0] = c0
      cells[c*3+1] = k01
      cells[c*3+2] = k20
      if (this._idist(k20,c1) < this._idist(k01,c2)) {
        cells.push(k01,c1,k20,k20,c1,c2)
      } else {
        cells.push(k01,c2,k20,k01,c1,c2)
      }
    } else if (k01 !== undefined) {
      cells[c*3+0] = c0
      cells[c*3+1] = k01
      cells[c*3+2] = c2
      cells.push(k01,c1,c2)
    } else if (k12 !== undefined) {
      cells[c*3+0] = c0
      cells[c*3+1] = k12
      cells[c*3+2] = c2
      cells.push(c0,c1,k12)
    } else if (k20 !== undefined) {
      cells[c*3+0] = c0
      cells[c*3+1] = c1
      cells[c*3+2] = k20
      cells.push(k20,c1,c2)
    }
  }
}

Refine.prototype._idist = function (i,j) {
  var x0 = this.mesh.positions[i*2+0]
  var y0 = this.mesh.positions[i*2+1]
  var x1 = this.mesh.positions[j*2+0]
  var y1 = this.mesh.positions[j*2+1]
  return this._distance(set2(v0,x0,y0), set2(v1,x1,y1))
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

function edgeKey(a,b) {
  return a < b ? a+','+b : b+','+a
}
