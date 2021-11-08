var v0 = [0,0], v1 = [0,0], v2 = [0,0]

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
  this._cflat = !Array.isArray(mesh.cells[0])
  this._pflat = !Array.isArray(mesh.positions[0])
  this.mesh = mesh
  this._maxL = opts.maxEdgeLength
  this._distance = opts.distance || cartesianDistance
  this._lerp = opts.lerp || cartesianLerp
  this._divisions = null
  this._dividedCells = null
}

Refine.prototype.refine = function (n) {
  this._dividedCells = null
  var ci = 0
  for (var j = 0; j < n; j++) {
    this._divisions = {}
    var updated = this._dividedCells
    this._dividedCells = new Set
    if (j === 0) {
      var clen = this._cflat ? this.mesh.cells.length/3 : this.mesh.cells.length
      for (var i = 0; i < clen; i++) {
        this._checkDivide(i)
      }
      ci = this._cflat ? this.mesh.cells.length/3 : this.mesh.cells.length
    } else {
      for (var i of updated) {
        this._checkDivide(i)
      }
      if (this._cflat) {
        for (var i = ci; i < this.mesh.cells.length/3; i++) {
          this._checkDivide(i)
        }
        ci = this.mesh.cells.length/3
      } else {
        for (var i = ci; i < this.mesh.cells.length; i++) {
          this._checkDivide(i)
        }
        ci = this.mesh.cells.length
      }
    }
    if (this._dividedCells.size === 0) return
    this._updatedCells = new Set
    this._applyDivisions()
  }
}

Refine.prototype._checkDivide = function (i) {
  var c0 = this._getCell(i,0)
  var c1 = this._getCell(i,1)
  var c2 = this._getCell(i,2)
  var p0 = this._getPosition(v0,c0)
  var p1 = this._getPosition(v1,c1)
  var p2 = this._getPosition(v2,c2)
  var d01 = this._distance(p0, p1)
  var d12 = this._distance(p1, p2)
  var d20 = this._distance(p2, p0)
  if (d01 > this._maxL) this._divide(c0,c1,i)
  if (d12 > this._maxL) this._divide(c1,c2,i)
  if (d20 > this._maxL) this._divide(c2,c0,i)
}

Refine.prototype._getCell = function (i,j) {
  if (this._cflat) {
    return this.mesh.cells[i*3+j]
  } else {
    return this.mesh.cells[i][j]
  }
}

Refine.prototype._setCell = function (i,c0,c1,c2) {
  if (this._cflat) {
    this.mesh.cells[i*3+0] = c0
    this.mesh.cells[i*3+1] = c1
    this.mesh.cells[i*3+2] = c2
  } else {
    this.mesh.cells[i][0] = c0
    this.mesh.cells[i][1] = c1
    this.mesh.cells[i][2] = c2
  }
}

Refine.prototype._addCell = function (c0,c1,c2) {
  if (this._cflat) {
    this.mesh.cells.push(c0,c1,c2)
  } else {
    this.mesh.cells.push([c0,c1,c2])
  }
}

Refine.prototype._getPosition = function (out, i) {
  if (this._pflat) {
    out[0] = this.mesh.positions[i*2+0]
    out[1] = this.mesh.positions[i*2+1]
  } else {
    out[0] = this.mesh.positions[i][0]
    out[1] = this.mesh.positions[i][1]
  }
  return out
}

Refine.prototype._addPosition = function (x, y) {
  if (this._pflat) {
    this.mesh.positions.push(x,y)
  } else {
    this.mesh.positions.push([x,y])
  }
}

Refine.prototype._divide = function (e0,e1,i) {
  var ek = edgeKey(e0,e1)
  if (this._divisions[ek] !== undefined) {
    this._dividedCells.add(i)
    return
  }
  var p0 = this._getPosition(v0, e0)
  var p1 = this._getPosition(v1, e1)
  this._lerp(v0, p0, p1, 0.5)
  var k = this._pflat ? this.mesh.positions.length/2 : this.mesh.positions.length
  this._addPosition(v0[0], v0[1])
  this._divisions[ek] = k
  this._dividedCells.add(i)
}

Refine.prototype._applyDivisions = function () {
  var cells = this.mesh.cells
  for (var c of this._dividedCells) {
    var c0 = this._getCell(c,0)
    var c1 = this._getCell(c,1)
    var c2 = this._getCell(c,2)
    var ek01 = edgeKey(c0,c1)
    var ek12 = edgeKey(c1,c2)
    var ek20 = edgeKey(c2,c0)
    var k01 = this._divisions[ek01]
    var k12 = this._divisions[ek12]
    var k20 = this._divisions[ek20]
    if (k01 !== undefined && k12 !== undefined && k20 !== undefined) {
      this._setCell(c,k01,k12,k20)
      this._addCell(c0, k01, k20)
      this._addCell(k01, c1, k12)
      this._addCell(k20, k12, c2)
    } else if (k01 !== undefined && k12 !== undefined) {
      this._setCell(c, k01, c1, k12)
      if (this._idist(k01,c2) < this._idist(k12,c0)) {
        this._addCell(k01,k12,c2)
        this._addCell(c0,k01,c2)
      } else {
        this._addCell(c0,k01,k12)
        this._addCell(c0,k12,c2)
      }
    } else if (k12 !== undefined && k20 !== undefined) {
      this._setCell(c, k20, k12, c2)
      if (this._idist(k12,c0) < this._idist(k20,c1)) {
        this._addCell(c0,k12,k20)
        this._addCell(c0,c1,k12)
      } else {
        this._addCell(k20,c1,k12)
        this._addCell(c0,c1,k20)
      }
    } else if (k01 !== undefined && k20 !== undefined) {
      this._setCell(c, c0, k01, k20)
      if (this._idist(k20,c1) < this._idist(k01,c2)) {
        this._addCell(k01,c1,k20)
        this._addCell(k20,c1,c2)
      } else {
        this._addCell(k01,c2,k20)
        this._addCell(k01,c1,c2)
      }
    } else if (k01 !== undefined) {
      this._setCell(c, c0, k01, c2)
      this._addCell(k01,c1,c2)
    } else if (k12 !== undefined) {
      this._setCell(c, c0, k12, c2)
      this._addCell(c0,c1,k12)
    } else if (k20 !== undefined) {
      this._setCell(c, c0, c1, k20)
      this._addCell(k20,c1,c2)
    }
  }
}

Refine.prototype._idist = function (i,j) {
  var p0 = this._getPosition(v0, i)
  var p1 = this._getPosition(v1, j)
  return this._distance(p0, p1)
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
