 uniform sampler2D texSampler;
 precision mediump float;
 uniform bool antialiased;
 void main() {
    float dist = distance( gl_PointCoord, vec2(0.5) );
    if (!antialiased) {
        if (dist > 0.5)
           discard;
     
        gl_FragColor = texture2D(texSampler, gl_PointCoord);
    }
    else {
        float alpha = 1.0 - smoothstep(0.45,0.5,dist);
         if (dist > 0.5)
           discard;
        gl_FragColor = texture2D(texSampler, gl_PointCoord);
        gl_FragColor.a = alpha;
    }
 }