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
      <button>Make Video</button>
    </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  onMounted,
  onUnmounted,
  getCurrentInstance,
  reactive,
} from '@vue/composition-api';
/* eslint-disable class-methods-use-this */

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
    });
    onUnmounted(() => {
      window.backend.off('onSelectImages');
    });
    return {
      files: reactive([]),
    };
  },
})
export default class Main extends Vue {
  selectImages(): void {
    console.log('clicked');
    window.backend.send('selectImages');
  }
}
</script>
