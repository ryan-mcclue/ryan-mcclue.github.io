// SPDX-License-Identifier: zlib-acknowledgement
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
      if (!evt.repeat && evt.code == "Key" + "QWERTYUIOPAS"[key]) {
        envelope.note_on(current_time);
        audio_worklet.port.postMessage(base_hertz * Math.pow(twelfth_root_of_two, key));
      }
    }
  });
  
  document.addEventListener("keyup", (evt) => {
    // audio_worklet.port.postMessage(0.0);
    envelope.note_off(current_time);
  });
})();
