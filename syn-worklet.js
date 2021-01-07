// SPDX-License-Identifier: zlib-acknowledgement
function angular_frequency(hertz) {
  return hertz * 2 * Math.PI;
}

let OSC_TYPES = {"sine": 0, "square": 1, "triangle": 2, "sawtooth": 3, "random": 4};
function oscillator(hertz, osc_type, time_elapsed) {
  switch (osc_type) {
    case OSC_TYPES.sine: {
      return Math.sin(angular_frequency(hertz) * time_elapsed);
    } break;
    case OSC_TYPES.square: {
      return Math.sin(angular_frequency(hertz) * time_elapsed) > 0.0 ? 1.0 : -1.0;
    } break;
    case OSC_TYPES.triangle: {
      return Math.asin(Math.sin(angular_frequency(hertz) * time_elapsed)) * (2.0 / Math.PI);
    } break;
    case OSC_TYPES.sawtooth: {
      return (2.0 / Math.PI) * (hertz * Math.PI * (time_elapsed % (1.0 / hertz)) - (Math.PI / 2.0));
    } break;
    case OSC_TYPES.random: {
      return 2.0 * Math.random() - 1.0;
    } break;
    default: {
      return 0.0;
    }
  }
}

class Synthesiser extends AudioWorkletProcessor {
  constructor() {
    super();

    this.hertz = 0.0;

    this.port.onmessage = (evt) => {
      this.hertz = evt.data;
    };
  }

  process(inputs, outputs) {
    let channels = outputs[0];
    let num_samples_per_channel = channels[0].length;

    for (let pcm_i = 0; pcm_i < num_samples_per_channel; ++pcm_i) {
      let time_elapsed = (currentFrame + pcm_i) / sampleRate;
      let volume = 0.5;
      let pcm_value = volume * oscillator(this.hertz, OSC_TYPES.triangle, time_elapsed);
      for (let channel_i = 0; channel_i < channels.length; ++channel_i) {
        channels[channel_i][pcm_i] = pcm_value;
      }
    }

    return true;
  }
}

registerProcessor("synthesiser", Synthesiser);
