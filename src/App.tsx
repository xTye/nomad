import { Component, onMount, onCleanup, createSignal } from "solid-js";
import toast, { Toaster } from "solid-toast";
import { render } from "./main/index";
import { load } from "./main/load";

const App: Component = () => {
  const [models, setModels] = createSignal({});
  let canvas: any;
  let gl: WebGL2RenderingContext;
  window.addEventListener("resize", () => {
    if (gl) {
      gl.canvas.width = window.innerWidth;
      gl.canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      render(gl, models());
    }
  });

  onMount(async () => {
    gl = canvas.getContext("webgl2");
    if (!gl) return toast.error("WebGL2 not supported");
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.enable(gl.DEPTH_TEST);
    gl.lineWidth(2);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    const models = await load(gl);
    setModels(models);
    render(gl, models);

    //? Main game loop
    // let frame = requestAnimationFrame(loop);
    // function loop(time: any) {
    //   const error = render(gl, models);
    //   if (!error) frame = requestAnimationFrame(loop);
    // }

    // onCleanup(() => cancelAnimationFrame(frame));
  });

  return (
    <div>
      <canvas ref={canvas}></canvas>
      <Toaster
        toastOptions={{
          duration: 3000,
          position: "bottom-left",
          style: {
            "background-color": "#f00",
          },
        }}
      />
    </div>
  );
};

export default App;
