<script>
  // # # # # # # # # # # # # #
  //
  //  Video Player
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import {fade} from 'svelte/transition'
  import { quartOut } from 'svelte/easing'
  import getVideoId from "get-video-id"

  // *** PROPS
  export let streamUrl = ""
</script>

<style lang="scss">
  @import "../../variables.scss";

  .embed {
    width: 100%;
    background: black;
    display: flex;
    justify-content: center;
    align-items: center;

    .vimeo-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      width: 720px;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    }
  }
</style>

<div class="embed" in:fade={{duration: 300, easing: quartOut}}>
  {#if streamUrl.includes('vimeo')}
    <div class="vimeo-container">
      <iframe
        width="720"
        height="480"
        src={'https://player.vimeo.com/video/' + getVideoId(streamUrl).id + '?autoplay=1'}
        frameborder="no"
        scrolling="no"
        byline="false"
        color="#ffffff"
        allow="autoplay; fullscreen"
        allowfullscreen />
    </div>
  {/if}
</div>
