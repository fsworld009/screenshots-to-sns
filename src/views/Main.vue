<!-- Write everything here for now ? -->
<template>
  <div class="main">
    <div>
      <label>ffmpeg path</label>
      <input type="text" />
    </div>
    <div>
      <label>Images</label>
      <textarea readonly v-model="files" style="width: 600px;height: 300px;"></textarea>
      <!-- <span class="helper-text">Helper text</span> -->
      <!-- <span class="error">There is an error</span> -->
      <br/>
      <button v-on:click="selectImages">Select Images</button>
    </div>
    <div>
      <label>Output path</label>
      <input type="text" />
    </div>
    <div>
      <button v-on:click="makeVideo">Make Video</button>
    </div>
    {{ progress }}
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  onMounted,
  onUnmounted,
  getCurrentInstance,
  reactive,
  ref,
} from '@vue/composition-api';
/* eslint-disable class-methods-use-this */

interface MainData {
  files: string[],
  progress: string,
}

@Component({
  setup() {
    // https://github.com/vuejs/composition-api/issues/455#issuecomment-761732262
    const instance = getCurrentInstance();
    onMounted(() => {
      console.log('here');
      window.backend.on('onSelectImages', (data) => {
        // TODO: get rid of type casting
        (instance as any).data.files = (
          data as any).files;
      });
      window.backend.on('onVideoOutput', (data) => {
        (instance as any).data.progress = 'done';
      });
    });
    onUnmounted(() => {
      window.backend.off('onSelectImages');
    });
    return {
      files: reactive([]),
      progress: ref(''),
    };
  },
})
export default class Main extends Vue {
  selectImages(): void {
    console.log('clicked');
    window.backend.send('selectImages');
  }

  makeVideo(): void {
    const data = this.$data as MainData;
    data.progress = 'In Progress';
    window.backend.send('makeVideo', { files: data.files });
  }
}
</script>
