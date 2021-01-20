// SPDX-License-Identifier: zlib-acknowledgement

class Synthesiser extends AudioWorkletProcessor {
  constructor() {
    super();
    this.hertz = 0.0;

    this.attack_time_s = attack_time_s;
    this.attack_amplitude = attack_amplitude;
    this.decay_time_s = decay_time_s;
    this.sustain_amplitude = sustain_amplitude; 
    this.release_time = release_time_s;

    this.trigger_on_time = 0.0;
    this.trigger_off_time = 0.0;

    this.note_on = false;

    // IMPORTANT(Ryan): This runs on every non-repeated keypress/keyrelease
    this.port.onmessage = (evt) => {
      this.hertz = evt.data;
      if (this.hertz == 0.0) {
        this.note_on = false;
        this.trigger_end_time = currentTime;
      } else {
        this.note_on = true;
        this.trigger_start_time = currentTime;
      }
    };

    static OSC_TYPES = {"sine": 0, "square": 1, "triangle": 2, "sawtooth": 3};
  }

  static angular_frequency(hertz) {
    return hertz * 2 * Math.PI;
  }

  get_amplitude(current_time) {
    let amplitude = 0.0;
    let envelope_life_time_index = current_time - this.trigger_on_time;

    if (this.note_on) {
      if (envelope_life_time <= this.attack_time) {
        // as <=, will work way up to 100% of start_amplitude
        // the start_amplitude can be thought of as the gradient
        // i.e. index * gradient
        // i.e. index of how far we are in this state from 0 to 1 (also called normalising) * what we are approaching
        amplitude = (envelope_life_time / this.attack_time) * this.start_amplitude;
      }
      if (envelope_life_time > this.attack_time && envelope_life_time <= this.attack_time + this.decay_time) {
        // NOTE(Ryan): The last '+' is needed when working downwards 
        amplitude = ((envelope_life_time - this.attack_time) / this.decay_time) * (this.sustain_amplitude - this.start_amplitude) + this.start_amplitude;
      }
      if (envelope_life_time > this.attack_time + this.decay_time) {
        amplitude = this.sustain_amplitude;
      }
    } else {
      amplitude = ((current_time - this.trigger_off_time) / this.release_time) * (0.0 - this.sustain_amplitude) + this.sustain_amplitude;
    }

    if (amplitude <= 0.0001) {
      amplitude = 0.0;
    }

    return amplitude;
  } 

  oscillator(hertz, osc_type, time_elapsed) {
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
      default: {
        return 0.0;
      }
    }
  }

  // IMPORTANT(Ryan): 'currentXXX' global variables aren't updated through this invocation.
  process(inputs, outputs) {
    let channels = outputs[0];
    let num_samples_per_channel = channels[0].length;

    for (let pcm_i = 0; pcm_i < num_samples_per_channel; ++pcm_i) {
      let time_elapsed = (currentFrame + pcm_i) / sampleRate;
      let volume = 0.5;
      let pcm_value = volume * this.get_amplitude(time_elapsed) * oscillator(this.hertz, OSC_TYPES.triangle, time_elapsed);
      for (let channel_i = 0; channel_i < channels.length; ++channel_i) {
        channels[channel_i][pcm_i] = pcm_value;
      }
    }

    return this.want_to_run ? true : false;
  }
}

registerProcessor("synthesiser", Synthesiser);
