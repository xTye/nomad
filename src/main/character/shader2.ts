import { createProgramInfo } from "twgl.js";

const shaders = {
  vs: `#version 300 es
  precision highp float;
  in vec3 position;
  in vec3 normal;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  
  out vec3 fragNormal;
  
  void main () {
    vec4 newPosition = modelMatrix * vec4(position, 1); 
    gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1);
    mat4 normalMatrix = transpose(inverse(modelMatrix));
    fragNormal = normalize((normalMatrix*vec4(normal,0)).xyz);
  }`,

  fs: `#version 300 es
  precision highp float;
  out vec4 outColor;
  in vec3 fragNormal;
  uniform int n2c;
  
  void main () {
    vec3 N = normalize(fragNormal);
    vec3 color = (n2c==0)?abs(N):(N+1.)/2.;
    outColor = vec4(color, 1);
  }`,
};

export const characterShader = (gl: WebGL2RenderingContext) => {
  return createProgramInfo(gl, [shaders.vs, shaders.fs], (message) => {
    console.log("Program Shader compilation error\n" + message);
    //errorBlock.style.height = "400px";
    //errorBlock.innerHTML = "Program Shader compilation error\n" + message;
  });
};
