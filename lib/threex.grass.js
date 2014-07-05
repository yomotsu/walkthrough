var THREEx = THREEx || {};

THREEx.createGrassTufts = function( positions, textureUrl, params ){

  // create the initial geometry
  var width  = params && params.width  || 2,
      height = params && params.height || 2,
      geometry = new THREE.PlaneGeometry( width, height );
  geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, height / 2, 0 ) );

  // Tweat the normal for better lighting
  // - normals from http://http.developer.nvidia.com/GPUGems/gpugems_ch07.html
  // - normals inspired from http://simonschreibt.de/gat/airborn-trees/
  geometry.faces.forEach( function( face ) {

    face.vertexNormals.forEach( function( normal ) {

      normal.set( 0.0, 1.0, 0.0 ).normalize();

    } );

  } );
  
  // create each tuft and merge their geometry for performance
  var mergedGeo = new THREE.Geometry(),
      baseAngle = Math.PI * 2 * Math.random(),
      m, c, s, position, angle, nPlanes = 2,
      i, j, l;

  for ( i = 0, l = positions.length; i < l; i ++ ) {

    position = positions[ i ];

    for ( j = 0; j < nPlanes; j++ ) {

      angle = baseAngle + j * Math.PI / nPlanes;

      // First plane
      c = Math.cos( angle + Math.PI );
      s = Math.sin( angle + Math.PI );
      m = new THREE.Matrix4(
         c, 0, s, position.x,
         0, 1, 0, position.y,
        -s, 0, c, position.z,
         0, 0, 0, 1
      );
      mergedGeo.merge( geometry.clone(), m );

      // The other side of the plane
      // - impossible to use ```side : THREE.BothSide``` as 
      //   it would mess up the normals
      c = Math.cos( angle + Math.PI );
      s = Math.sin( angle + Math.PI );
      m = new THREE.Matrix4(
         c, 0, s, position.x,
         0, 1, 0, position.y,
        -s, 0, c, position.z,
         0, 0, 0, 1
      );
      mergedGeo.merge( geometry.clone(), m );
    }
  }

  // load the texture
  var texture  = THREE.ImageUtils.loadTexture( textureUrl )
  // build the material
  var material  = new THREE.MeshPhongMaterial( {
    map       : texture,
    color     : 'grey',
    emissive  : 'darkgreen',
    alphaTest : 0.7,
    side: THREE.DoubleSide
  } );
  // create the mesh
  return new THREE.Mesh( mergedGeo, material );

};
