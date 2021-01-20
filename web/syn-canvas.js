// SPDX-License-Identifier: zlib-acknowledgement

// gl was first for silicon graphics workstations which had dedicated hardware for graphics. 
// these workstations have now become cards or essentially just some hardware dedicated for it (in the case of cpu/gpu built-ins)
// later standardised to opengl
// opengl was platform independent and dependent part (setting up opengl)
// although conceivable that cpu/gpu share memory we cater for when gpu is separate memory connected to system ram via pci-e (high latency, high bandwidth)

// each thread has it's own implicit opengl rendering context

// to best utilise gpu, code must enforce paralleism and wide instructions. 
// in wide instructions, an if statement will run all times for the 16 different items in shader code

// push buffer/command buffer contain instructions for gpu, e.g. where to take bitmap memory




let canvas = document.querySelector(".canvas");
let offscreen_canvas = canvas.transferControlToOffscreen();

// can use threads for webgl (generic worker) and audio
let worker = new Worker("syn-canvas-worklet.js");

worker.postMessage({canvas: offscreen_canvas}, [offscreen_canvas, state]);
function loop(time) {
// update
// wait till worker finished

// will need to calculate fps
  worker.requestAnimationFrame(loop);
}
worker.requestAnimationFrame(loop);

// worker
onmessage = (evt) => {
  let canvas = evt.data[0];
  let state = evt.data[1];

  let gl = canvas.getContext("webgl");

  // opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};
