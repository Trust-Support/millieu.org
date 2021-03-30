<script>
  // # # # # # # # # # # # # #
  //
  //  CARD
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { urlFor, renderBlockText } from "../sanity.js"
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { links } from "svelte-routing"

  // *** PROPS
  export let card = {}
  export let showWelcomeCard = false;

  // *** VARIABLES
  let currentIndex = 0
</script>

<style lang="scss">
  @import "../variables.scss";

  .tutorial-wrap-inner{
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    height:100%;
    pointer-events: none;
  }
  .tutorial {
    font-size: $FONT_SIZE_MEDIUM;
    font-family: $HERSHEY_DASHED;
    padding: $SPACE_L $SPACE_L $SPACE_L*3 $SPACE_L;
    margin: 0 auto;
    background: $COLOR_LIGHTBLUE;
    color: $COLOR_DARK;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 50vw;
    max-width: 900px;
    min-height: 60%;
    pointer-events: all;
    position:relative;

    @include screen-size("small"){
      font-size: $FONT_SIZE_SMALL;
      width: calc(100vw - #{$SPACE_M}*2);
      height: calc(100% - #{$SPACE_M}*2);
    }

    .tutorial-slide :global(figure) { 
      display:block;
      margin:$SPACE_L 0;
      @include screen-size("small"){
        margin:$SPACE_S 0;
      }
    };

    .tutorial-slide :global(img) { 
      max-width: 50%;
      margin: unset;
      object-fit: cover;
      margin: 0 auto;
      display:block;
      @include screen-size("small"){
        max-width: 100%;
      }
    };

    .tutorial-slide :global(ol) { 
      list-style-type: none;
      padding:0;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      @include screen-size("small"){
        justify-content: center;
      }
    };

    .tutorial-slide :global(li) { 
      white-space: nowrap;
      margin-bottom: $SPACE_BASE;
      @include screen-size("small"){
        margin-right:$SPACE_BASE;
      }
    };

    .tutorial-slide :global(a) { 
      text-decoration: none;
      &:hover{
        opacity: 0.4;
      }
    };

    .tutorial-slide :global(li::before) { 
      content:(' ');
      width: $SPACE_L;
      height: $SPACE_L;
      margin-bottom: $SPACE_XS * -1;
      margin-right:$SPACE_S;
      display: inline-block;
      @include screen-size("small"){
        margin-right:$SPACE_XS;
      }
    };

    .tutorial-slide :global(li:nth-of-type(1)::before) { 
      background:$COLOR_COMMUNICATION;
    };
    .tutorial-slide :global(li:nth-of-type(2)::before) { 
      background:$COLOR_SENSING;
    };
    .tutorial-slide :global(li:nth-of-type(3)::before) { 
      background:$COLOR_ARCHIVING;
    };
    .tutorial-slide :global(li:nth-of-type(4)::before) { 
      background:$COLOR_CONSENSUS_BUILDING;
    };


    .tutorial-slide{
      font-family: $HERSHEY_DASHED;
      width: 90%;
      min-height: 30%;
      text-align: left;

      @include screen-size("small"){
        width: 100%;
      }
      

    }

    .navigation {
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: $SPACE_L;

      .nav-button {
        font-size: $FONT_SIZE_SMALL;
        padding: $SPACE_S $SPACE_M;
        background: $COLOR_LIGHT;
        font-family: $MONO_STACK;
        transition:background 150ms $transition;
        border-radius: $border_radius;
        cursor: pointer;
        user-select: none;
        border: 1px solid $COLOR_DARK;
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 0.05em;

        &:hover {
          background: $COLOR_MID_15;
        }

        &.back {
          margin-right: 10px;
        }

        &.enter{
          background-color: $COLOR_DARK;
          color: $COLOR_LIGHT;
        }

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }
    }

    .close {
        margin-bottom: 20px;
        position: absolute;
        top: 2px;
        right: $SPACE_XS;
        fill: $COLOR_MID_2;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.3s $transition;
        z-index: 10000;

        @include screen-size("small") {
          margin-bottom: 0;
          margin-top: 0;

          &.passive {
            min-height: 100vh;
          }
        }

        &:hover {
          fill: $COLOR_MID_3;
        }
      }

      @include screen-size("small") {
        margin-top: 0;
        margin-bottom: 0;

        &.passive {
          min-height: 100vh;
        }
      }
  }
</style>
<div class='tutorial-wrap-inner'>
<div class="tutorial" use:links>
  <div
    class="close"
    on:click={e => {
      showWelcomeCard = false
    }}>
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.9 11.1C28.6 10.8 28.2 10.8 27.9 11.1L20 19L12.1 11.1C11.8 10.8 11.4 10.8 11.1 11.1C10.8 11.4 10.8 11.8 11.1 12.1L19 20L11.1 27.9C10.8 28.2 10.8 28.6 11.1 28.9C11.4 29.2 11.8 29.2 12.1 28.9L20 21L27.9 28.9C28.2 29.2 28.6 29.2 28.9 28.9C29.2 28.6 29.2 28.2 28.9 27.9L21 20L28.9 12.1C29.2 11.8 29.2 11.4 28.9 11.1Z" />
      </svg>
      
  </div>
  {#each card.slides as slide, index (slide._key)}
    {#if Array.isArray(get(slide, 'content.content', false)) && currentIndex === index}
      <div class="tutorial-slide" in:fade|local>
        <img height="300" src={urlFor(get(slide, 'topImage', "")).url()} alt='The Shape of a Practice'/>
        {@html renderBlockText(get(slide, 'content.content', []))}
      </div>
    {/if}
  {/each}
  {#if card.slides && card.slides.length > 0}
    <div class="navigation">
      <div
        class="nav-button back"
        class:disabled={currentIndex === 0}
        on:click={e => {
          currentIndex -= 1
        }}>
        Back
      </div>
      {#if currentIndex != card.slides.length - 1}
      <div
        class="nav-button next"
        class:disabled={currentIndex === card.slides.length - 1}
        on:click={e => {
          currentIndex += 1
        }}>
        Next
      </div>
      {:else}
      <div
        class="nav-button enter"
        on:click={e => {
          showWelcomeCard = false;
        }}>
        Enter
      </div>
      {/if}
    </div>
  {/if}
</div>
</div>