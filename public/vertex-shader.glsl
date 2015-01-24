 attribute vec2 vertexCoords;
 uniform mat3 coordinateTransform;
 uniform float pointSize;
 void main() {
    vec3 transformedCoords = coordinateTransform * vec3(vertexCoords, 1.0);
    gl_Position = vec4(transformedCoords.xy, 0.0, 1.0);
    gl_PointSize = pointSize;
 }
 