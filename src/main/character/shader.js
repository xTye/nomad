import twgl from "twgl.js"

export const characterShader = {
  vs: `#version 300 es
    precision mediump float;

    in vec3 position;
    in vec3 normal;
    in vec2 uv;
    
    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    
    out vec3 fragNormal;
    out vec3 fragPosition;
    out vec2 fragUV;
    
    void main () {
      fragUV = uv;
      gl_PointSize = 2.0;
      vec4 newPosition = modelMatrix * vec4(position, 1); 
      
      mat4 normalMatrix = transpose(inverse(modelMatrix));
      fragNormal = normalize((normalMatrix*vec4(normal,0)).xyz);

      fragPosition = newPosition.xyz;

      gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1);
    }`,
      
  fs: `#version 300 es
    precision mediump float;

    uniform int n2c;
    uniform sampler2D tex;
    uniform float shininess;
    uniform float k_s;
    uniform float ambient;
    uniform float roughness;

    uniform vec4 light;
    uniform vec3 eyePosition;

    uniform samplerCube cubemap;

    in vec3 fragNormal;
    in vec3 fragPosition;
    in vec2 fragUV;

    out vec4 outColor;

    vec3 computeColor(vec3 materialColor) {
      // Color of iron
      vec3 specularColor = vec3(0.56, 0.57, 0.58);
      vec3 N = normalize(fragNormal);
      vec3 V = normalize(eyePosition - fragPosition);
      vec3 L;

      if (light.w > 0.)
        L = normalize(light.xyz - fragPosition);
      else
        L = normalize(light.xyz);

      vec3 R = reflect(-V, N);

      // Render environment
      if (n2c == 1)
        return texture(cubemap, R).rgb;

      // Render environment color as specular
      if (n2c == 2)
        specularColor = texture(cubemap, R).rgb;

      vec3 diffuse = materialColor * clamp(dot(L, N), 0., 1.);

      vec3 H = normalize(L + V);
      vec3 amb = ambient * materialColor;

      vec3 F = specularColor + (1.-specularColor) * pow(1.-clamp(dot(N, L), 0., 1.), shininess);

      float r = pow(roughness, 2.);
      
      float Gv = clamp(dot(N,V), 0., 1.) / (clamp(dot(N,V), 0., 1.)*(1.-r*0.5)+r);
      float Gl = clamp(dot(N,L), 0., 1.) / (clamp(dot(N,L), 0., 1.)*(1.-r*0.5)+r);
      float G = Gv * Gl;

      float D = r / (3.141592653 * pow(pow(clamp(dot(N,H), 0., 1.), 2.) * (r-1.) + 1., 2.));

      vec3 microfacet = F * G * D;
      
      return amb + ((1. - k_s) * diffuse) + (k_s * microfacet);
    }
    
    void main () {
      vec3 materialColor = texture(tex, fragUV).rgb;
      vec3 color = computeColor(materialColor);
      outColor = vec4(color, 1);
    }`,
};

return twgl.createProgramInfo(gl, [shaders.vs, shaders.fs], (message) => {
  console.log("Program Shader compilation error\n" + message);
  //errorBlock.style.height = "400px";
  //errorBlock.innerHTML = "Program Shader compilation error\n" + message;
});