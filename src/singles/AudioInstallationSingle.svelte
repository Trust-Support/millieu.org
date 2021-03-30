<script>
  // # # # # # # # # # # # # #
  //
  //  Single Audio Installation
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText } from "../sanity.js"
  import { links } from "svelte-routing"

  // *** COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"
  import MetaData from "../MetaData.svelte"

  // *** PROPS
  export let audioInstallation = {}
  export let audioInstallationLayer = {}

  // *** VARIABLES
  let expanded = false
  let playing = audioInstallation.noAutoplay ? false : true


  const installationsInstance = get(audioInstallationLayer, 'children', []).find(a => a.slug == get(audioInstallation, 'slug.current',''))  
  const audioPlayer = installationsInstance.audio

  const togglePlay = () => {
    if(audioPlayer.playing()) {
      audioPlayer.pause()
      playing = false
    } else {
      audioPlayer.play()
      playing = true
    }
  }

</script>

<style lang="scss">
  @import "../variables.scss";

  .audio-single {
    .main-header {
      padding: $SPACE_M;
      position: relative;
      user-select: none;
      display: flex;

      .controls {
        margin-right: $SPACE_S;
        cursor: pointer;
      }

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: bold;
      }

      .expand {
        position: absolute;
        top: $SPACE_S;
        right: $SPACE_S;
        color: $COLOR_MID_2;
        opacity: 0.4;
        cursor: pointer;
        transition: opacity 0.3s $transition;

        // svg {
        //   color: $COLOR_MID_2;
        //   path {
        //     stroke: $COLOR_MID_2;
        //   }
        // }

        &:hover {
          opacity: 0.7;
        }
      }

      .participants {
        margin-top: $SPACE_XS;
        color: $COLOR_MID_2;
        font-family: $HERSHEY_SIMPLEX;
        font-weight: normal;
        font-size: $FONT_SIZE_SMALL;
        display: inline-block;
      }
    }

    .divider {
      border-bottom: 1px dotted $COLOR_MID_1;
      width: 100%;
    }

    .date {
      padding: $SPACE_M;
      text-align: center;
      font-weight: 500;
      font-family: $SANS_STACK;
    }

    .image {
      width: 100%;
      padding-top: $SPACE_M;
      padding-bottom: $SPACE_M;

      img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
      }
    }

    @include text;

    .connected-case-studies {
      padding: $SPACE_M;
    }
  }
</style>

<!-- METADATA -->
<MetaData post={audioInstallation} />

<div class="audio-single" in:fade use:links>
  {#if audioInstallation.title}
    <!-- HEADER -->
    <div class="main-header">
      <!-- CONTROLS -->
      <div
        class="controls"
        on:click={togglePlay}>
        {#if playing}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"><path d="M0 0h24v24H0z" fill="none" />
            <path d="M8 5v14l11-7z" /></svg>
        {/if}
      </div>

      <div class="mid-section">
        <!-- TITLE -->
        <div class="title">{audioInstallation.title}</div>
        <!-- PARTICIPANTS -->
        {#if get(audioInstallation, 'participants', false) && Array.isArray(audioInstallation.participants)}
          <div class="participants">
            <ParticipantsList
              participants={audioInstallation.participants}
              messaging={true} />
          </div>
        {/if}
      </div>

      <!-- ARROW DOWN -->
      <div
        class="expand"
        on:click={() => {
          expanded = !expanded
        }}>
        {#if expanded}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="40"
            width="40"
            viewBox="0 0 24 24"
            ><path d="M0 0h24v24H0z" fill="none" />
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" /></svg>
        {:else}
        <svg height="40"
        width="40" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20,26.9a.71.71,0,0,0,.51-.23l11.2-10.08a.84.84,0,0,0-1.07-1.29l0,0L20,24.91,9.37,15.33a.83.83,0,1,0-1.15,1.21l0,0,11.2,10.08A.67.67,0,0,0,20,26.9Z"/></svg>
        {/if}
      </div>
    </div>

    <div class="divider" />

    {#if expanded}
      <!-- TEXT -->
      {#if Array.isArray(get(audioInstallation, 'content.content', false)) && audioInstallation.content.content.length > 0}
        <div class="text">
          {@html renderBlockText(audioInstallation.content.content)}
        </div>
        <div class="divider" />
      {/if}
    {/if}
  {/if}
</div>
