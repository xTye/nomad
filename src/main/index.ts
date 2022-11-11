import twgl from "twgl.js";
import toast from "solid-toast";

// load 3d model from .obj file
async function loadObjModel(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  const lines = text.split(/\r?\n/);
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const indexMap = new Map();
  let index = 0;
  for (const line of lines) {
    const parts = line.split(" ");
    const prefix = parts.shift();
    if (prefix === "v") {
      positions.push(...parts.map((p) => parseFloat(p)));
    } else if (prefix === "vn") {
      normals.push(...parts.map((p) => parseFloat(p)));
    } else if (prefix === "vt") {
      uvs.push(...parts.map((p) => parseFloat(p)));
    } else if (prefix === "f") {
      for (let i = 0; i < 3; ++i) {
        const indexParts = parts[i].split("/");
        const positionIndex = parseInt(indexParts[0]) - 1;
        const normalIndex = parseInt(indexParts[2]) - 1;
        const uvIndex = parseInt(indexParts[1]) - 1;
        const key = `${positionIndex}/${normalIndex}/${uvIndex}`;
        if (indexMap.has(key)) {
          indices.push(indexMap.get(key));
        } else {
          indices.push(index);
          indexMap.set(key, index);
          index++;
        }
      }
    }
  }
  return {
    position: positions,
    normal: normals,
    uv: uvs,
    indices,
  };
}

export const render = async (canvas: HTMLCanvasElement) => {
  //const canvas = document.getElementById("c") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    toast.error("WebGL2 not supported");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.lineWidth(2);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.31, 0.31, 0.31, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const obj = await loadObjModel("./main/character/raymanModel.obj");
  //const buf = twgl.createBufferInfoFromArrays(gl, obj);
  //console.log(buf);
};
