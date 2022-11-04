const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl2");

gl.enable(gl.DEPTH_TEST);
gl.lineWidth(2);


gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);