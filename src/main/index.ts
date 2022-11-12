import {
  m4,
  v3,
  setUniforms,
  setBuffersAndAttributes,
  drawBufferInfo,
} from "twgl.js";
import { characterShader } from "../main/character/shader2";

const getModelMatrix = (models: any) => {
  const scaleMatrix = m4.scaling([
    1 / (models.character.extents.radius * 2),
    1 / (models.character.extents.radius * 2),
    1 / (models.character.extents.radius * 2),
  ]);
  const modelCoordinates = [
    -models.character.extents.center[0],
    -models.character.extents.center[1],
    -models.character.extents.center[2],
  ];
  const translationMatrix = m4.translation(modelCoordinates);
  const rotationXMatrix = m4.rotationX(0 * (Math.PI / 180), m4.identity());
  const rotationYMatrix = m4.rotationY(0 * (Math.PI / 180), m4.identity());
  const rotationZMatrix = m4.rotationZ(0 * (Math.PI / 180), m4.identity());
  const rotationMatrix = m4.multiply(
    m4.multiply(rotationXMatrix, rotationYMatrix),
    rotationZMatrix
  );
  return m4.multiply(
    m4.multiply(scaleMatrix, rotationMatrix),
    translationMatrix
  );
};

const getCameraMatrix = (models: any) => {
  const gaze = m4.transformDirection(
    m4.multiply(
      m4.rotationY(0 * (Math.PI / 180)),
      m4.rotationX(0 * (Math.PI / 180))
    ),
    [0, 0, 1]
  );
  const eye = v3.add(
    models.character.extents.center,
    v3.mulScalar(gaze, 1 * (models.character.extents.radius * 2))
  );
  const cameraMatrix = m4.lookAt(
    eye,
    models.character.extents.center,
    [0, 1, 0]
  );
  return m4.inverse(cameraMatrix);
};

const getProjectionMatrix = (models: any, aspect: number) => {
  return m4.perspective(
    70 * (Math.PI / 180),
    aspect,
    0.1 * (models.character.extents.radius * 2),
    2.5 * (models.character.extents.radius * 2)
  );
};

const renderScene = (
  modelMatrix: any,
  viewMatrix: any,
  projectionMatrix: any,
  models: any,
  gl: WebGL2RenderingContext
) => {
  const info = characterShader(gl);
  gl.useProgram(info.program);
  const uniforms = {
    n2c: 0,
    modelMatrix: m4.identity(),
    viewMatrix,
    projectionMatrix,
  };
  setUniforms(info, uniforms);
  models.character.buffer.map((obj: any) => {
    setBuffersAndAttributes(gl, info, obj);
    drawBufferInfo(gl, obj);
  });
};

export const render = (gl: WebGL2RenderingContext, models: any) => {
  try {
    gl.clearColor(0.31, 0.31, 0.31, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    renderScene(
      getModelMatrix(models),
      getCameraMatrix(models),
      getProjectionMatrix(models, gl.canvas.width / gl.canvas.height),
      models,
      gl
    );
  } catch (error: any) {
    console.error(error);
    return true;
  }

  return false;
};
