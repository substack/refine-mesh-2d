var refine = require('../')
var mesh = {
  positions: [ -3,-4, -2,+3, +5,+4, +4,-1 ],
  cells: [0,1,2, 0,2,3],
}
refine(mesh, { maxEdgeLength: 1 })
var lines = []
for (var i = 0; i < mesh.cells.length; i++) {
  var c0 = mesh.cells[i*3+0]
  var c1 = mesh.cells[i*3+1]
  var c2 = mesh.cells[i*3+2]
  lines.push(
    mesh.positions[c0*2+0], mesh.positions[c0*2+1],
    mesh.positions[c1*2+0], mesh.positions[c1*2+1],

    mesh.positions[c1*2+0], mesh.positions[c1*2+1],
    mesh.positions[c2*2+0], mesh.positions[c2*2+1],

    mesh.positions[c2*2+0], mesh.positions[c2*2+1],
    mesh.positions[c0*2+0], mesh.positions[c0*2+1]
  )
}

var regl = require('regl')()
var draw = regl({
  frag: `
    precision highp float;
    void main() {
      gl_FragColor = vec4(0.2,0.1,0.2,1);
    }
  `,
  vert: `
    precision highp float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4((position/6.0),0,1);
    }
  `,
  attributes: {
    position: regl.prop('positions'),
  },
  elements: regl.prop('cells')
})
var drawLines = regl({
  frag: `
    precision highp float;
    void main() {
      gl_FragColor = vec4(1,0,1,1);
    }
  `,
  vert: `
    precision highp float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4((position/6.0),0,1);
    }
  `,
  attributes: {
    position: regl.prop('positions'),
  },
  count: (context, props) => props.positions.length/2,
  primitive: 'lines',
})

window.addEventListener('resize', frame)
frame()
function frame() {
  regl.poll()
  regl.clear({ color: [0,0,0,1], depth: true })
  drawLines({ positions: lines })
  draw(mesh)
}
