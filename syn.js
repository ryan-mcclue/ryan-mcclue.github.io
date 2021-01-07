// GAMES TO INSPECT: Unto The End

// TODO(Ryan): Ensure canvas dimensions match the width
// and height of the browser on resize.

// IMPORTANT(Ryan): Not concerned with the limitations of various platforms such as mobile devices
// that cannot perform certain tasks without explicit user approval. 

// NOTE(Ryan): Samples is per channel, frames is all samples across used channels
(async() => {
  let base_hertz = 220.0;
  let twelfth_root_of_two = Math.pow(2.0, 1.0 / 12.0);
  
  let audio_cxt = new AudioContext();
  await audio_cxt.audioWorklet.addModule("syn-worklet.js", {credentials: "omit"});
 
  let audio_worklet_options = {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [audio_cxt.destination.channelCount]
  };
  let audio_worklet = new AudioWorkletNode(audio_cxt, "synthesiser", audio_worklet_options);
  audio_worklet.connect(audio_cxt.destination);
  
  // TODO(Ryan): Handle multiple key presses
  document.addEventListener("keydown", (evt) => {
    for (let key = 0; key < 12; ++key) {
      if (evt.code == "Key" + "QWERTYUIOPAS"[key]) {
        audio_worklet.port.postMessage(base_hertz * Math.pow(twelfth_root_of_two, key));
      }
    }
  });
  
  document.addEventListener("keyup", (evt) => {
    audio_worklet.port.postMessage(0.0);
  });
})();

// Number is double (15 decimal places), float (7 decimal places)
// the 32bits really represents the accuracy of the amplitude
// sample rate is accuracy of frequency. nyquist we need sample rate double highest freq we want to record
// human hearing is 20hz - 20000hz, essentially band-limited

// angular frequency = w
