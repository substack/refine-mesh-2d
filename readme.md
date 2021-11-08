# refine-mesh-2d

refine a 2d mesh by splitting edges longer than a maximum length

related package for 3d: [refine-mesh](https://www.npmjs.com/package/refine-mesh)

# example

``` js
var refine = require('refine-mesh-2d')
var mesh = {
  positions: [
    -80.19366, +25.77427,
    -66.10572, +18.46633,
    -64.77797, +32.29149,
  ],
  cells: [0,1,2],
}
refine(mesh, {
  maxEdgeLength: 800_000,
  distance: require('haversine-distance'),
  lerp: require('geolerp'),
})
console.log(mesh)
```

output:

```
{
  positions: [
             -80.19366,           25.77427,
             -66.10572,           18.46633,
             -64.77797,           32.29149,
    -72.96592081973775,  22.27203392308802,
    -65.48002777787686,  25.38039449783979,
    -72.73087883443198, 29.253847718108116,
     -69.2678845526746, 23.871450837157884,
    -69.04204667239594, 27.363932781261877,
    -76.53048073723048,  24.06557948588831,
    -76.52138873117336, 27.563893877216923,
     -69.4934585565809, 20.402722522436974,
    -68.81730867434572, 30.833396125558536
  ],
  cells: [
    6, 4,  7, 0, 8,  9,  3, 10, 6,
    5, 7, 11, 6, 7,  5,  3,  6, 5,
    8, 3,  9, 9, 3,  5, 10,  1, 6,
    6, 1,  4, 7, 2, 11,  7,  4, 2
  ]
}
```

