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
            -72.485815, 29.032880000000002,
    -73.14968999999999,            22.1203,
            -65.441845,           25.37891,
    -69.29576750000001, 23.749605000000003,
    -68.63189249999999,          30.662185,
           -76.3397375, 27.403575000000004,
             -68.96383,          27.205895,
            -76.671675,          23.947285,
    -69.62770499999999,          20.293315
  ],
  cells: [
    6, 3, 4,  9, 5, 7, 10, 4, 8,
    9, 5, 6, 11, 1, 6,  6, 5, 1,
    7, 5, 2,  8, 4, 3,  9, 6, 3,
    9, 7, 3, 10, 8, 0, 11, 6, 4
  ]
}
```

