import { createBufferInfoFromArrays } from "twgl.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { m4, v3 } from "twgl.js";

const mat4 = {
  ...m4,
  create: () =>
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  fromQuat: (q: any) => {
    let x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;
    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
    let out = [];
    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = out[13] = out[14] = 0;
    out[15] = 1;
    return out;
  },
  fromRotationTranslationScale: (q: any, v: any, s: any) => {
    // Quaternion math
    let x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;
    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
    let sx = s[0];
    let sy = s[1];
    let sz = s[2];
    let out = [];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  },
};

export const modelsLink = {
  character: "./src/main/character/raymanModel.obj",
};

const createSCs = (obj: any) => {
  const sceneGraph = {};
  let scs: any[] = [];
  if (obj.scene) getNode(obj.scene, mat4.create());
  else getNode(obj, mat4.create());

  function getNode(node: any, M: any) {
    const sc: any = {};
    sc.name = node.name;

    const translation = node.position
      ? [node.position.x, node.position.y, node.position.z]
      : [0, 0, 0];
    const quaternion = node.quaternion
      ? [
          node.quaternion.x,
          node.quaternion.y,
          node.quaternion.z,
          node.quaternion.w,
        ]
      : [0, 0, 0, 1];
    //const rotation = node.rotation?[node.rotation.x,node.rotation.y,node.rotation.z]:[0,0,0];// XYZ order
    const scale =
      node.scale && node.scale.x
        ? [node.scale.x, node.scale.y, node.scale.z]
        : [1, 1, 1];

    sc.modelMatrix = m4.multiply(
      M,
      mat4.fromRotationTranslationScale(quaternion, translation, scale)
    );

    if (node.geometry || node.attributes) {
      const attributes = node.geometry
        ? node.geometry.attributes
        : node.attributes;
      if (
        node.geometry &&
        node.geometry.groups &&
        node.geometry.groups.length > 0
      ) {
        const groups = node.geometry.groups;
        const localScs = groups.map((key: any, i: any) => {
          return createSC(attributes, {
            start: groups[i].start,
            count: groups[i].count,
          });
        });
        //return scs
        localScs.forEach((d: any, i: any) => {
          //d.cells = d3.range(0,d.positions.length/3,1).map(i=>[i*3+0,i*3+1,i*3+2]);
          scs.push({ name: sc.name, sc: d, modelMatrix: sc.modelMatrix });
        });
      } else {
        sc.sc = createSC(attributes);
        scs.push(sc);
      }
    }
    if (node.children)
      node.children.forEach((d: any) => getNode(d, sc.modelMatrix));
  }
  return scs;
};

const createSC = (attributes: any, offset?: any) => {
  let positions = offset
    ? attributes.position.array.slice(
        offset.start * 3,
        (offset.start + offset.count) * 3
      )
    : attributes.position.array.slice();
  let normals = undefined,
    uvs = undefined;
  if (attributes.normal)
    normals = offset
      ? attributes.normal.array.slice(
          offset.start * 3,
          (offset.start + offset.count) * 3
        )
      : attributes.normal.array.slice();
  else {
    let count = positions.length / 3;
    let Ns = [];
    for (let i = 0; i < offset.count; i += 3) {
      const k = offset.start + i;
      const v0 = positions.slice(k * 9, k * 9 + 3),
        v1 = positions.slice(k * 9 + 3, k * 9 + 6),
        v2 = positions.slice(k * 9 + 6, k * 9 + 9);
      const N = Array.from(
        v3.normalize(v3.cross(v3.subtract(v1, v0), v3.subtract(v2, v0)))
      );
      Ns.push(N, N, N);
    }
    normals = Ns.flat();
  }
  if (attributes.uv)
    uvs = offset
      ? attributes.uv.array.slice(
          offset.start * 2,
          (offset.start + offset.count) * 2
        )
      : attributes.uv.array.slice();
  return {
    positions,
    normals,
    uvs,
  };
};

async function loadObjModel(url: string) {
  // instantiate a loader
  const loader = new OBJLoader();

  const threeObj = await new Promise((resolve, reject) => {
    loader.load(url, (object) => resolve(object));
  });

  const scObj = createSCs(threeObj);

  const attributes = scObj.map((obj) => ({
    position: {
      numComponents: 3,
      data: obj.sc.positions,
    },
    normal: {
      numComponents: 3,
      data: obj.sc.normals,
    },
    uv: {
      numComponents: 2,
      data: obj.sc.uvs,
    },
  }));

  return attributes;
}

// load 3d model from .obj file
// async function loadObjModel(url: string) {
//   const response = await fetch(url);
//   const text = await response.text();
//   const lines = text.split(/\r?\n/);
//   const positions = [];
//   const normals = [];
//   const uvs = [];
//   const indices = [];
//   const indexMap = new Map();
//   let index = 0;
//   for (const line of lines) {
//     const parts = line.split(" ");
//     const prefix = parts.shift();
//     if (prefix === "v") {
//       positions.push(...parts.map((p: string) => parseFloat(p)));
//     } else if (prefix === "vn") {
//       normals.push(...parts.map((p: string) => parseFloat(p)));
//     } else if (prefix === "vt") {
//       uvs.push(...parts.map((p: string) => parseFloat(p)));
//     } else if (prefix === "f") {
//       for (let i = 0; i < 3; ++i) {
//         const indexParts = parts[i].split("/");
//         const positionIndex = parseInt(indexParts[0]) - 1;
//         const normalIndex = parseInt(indexParts[2]) - 1;
//         const uvIndex = parseInt(indexParts[1]) - 1;
//         const key = `${positionIndex}/${normalIndex}/${uvIndex}`;
//         if (indexMap.has(key)) {
//           indices.push(indexMap.get(key));
//         } else {
//           indices.push(index);
//           indexMap.set(key, index);
//           index++;
//         }
//       }
//     }
//   }
//   return {
//     position: {
//       numComponents: 3,
//       data: positions,
//     },
//     normal: {
//       numComponents: 3,
//       data: normals,
//     },
//     uv: {
//       numComponents: 2,
//       data: uvs,
//     },
//     indices,
//   };
// }

// compute the model extents
function computeModelExtents(model: any) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const obj of model) {
    for (let i = 0; i < obj.position.data.length; i += 3) {
      const x = obj.position.data[i + 0];
      const y = obj.position.data[i + 1];
      const z = obj.position.data[i + 2];
      min[0] = Math.min(min[0], x);
      min[1] = Math.min(min[1], y);
      min[2] = Math.min(min[2], z);
      max[0] = Math.max(max[0], x);
      max[1] = Math.max(max[1], y);
      max[2] = Math.max(max[2], z);
    }
  }
  return {
    min,
    max,
  };
}

// get the model extents
function getModelExtents(model: any) {
  const extents = computeModelExtents(model);
  const min = extents.min;
  const max = extents.max;
  const cx = (min[0] + max[0]) / 2;
  const cy = (min[1] + max[1]) / 2;
  const cz = (min[2] + max[2]) / 2;
  const width = Math.abs(max[0] - min[0]);
  const height = Math.abs(max[1] - min[1]);
  const depth = Math.abs(max[2] - min[2]);
  const radius = Math.sqrt(width * width + height * height + depth * depth) / 2;
  return {
    min,
    max,
    center: [cx, cy, cz],
    radius,
  };
}

export async function load(gl: WebGL2RenderingContext) {
  const models: any = {};

  for (const [key, value] of Object.entries(modelsLink)) {
    const attributes = await loadObjModel(value);
    const extents = getModelExtents(attributes);
    const buffer = attributes.map((obj) => createBufferInfoFromArrays(gl, obj));
    models[key] = {
      attributes,
      extents,
      buffer,
    };
  }

  return models;
}
