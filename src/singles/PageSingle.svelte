<script>
  // # # # # # # # # # # # # #
  //
  //  Single Page
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText } from "../sanity.js"
  import { links } from "svelte-routing"

  // *** COMPONENTS
  import MetaData from "../MetaData.svelte"

  // *** PROPS
  export let page = {}
</script>

<style lang="scss">
  @import "../variables.scss";

  .page-single {
    .main-header {
      padding: $SPACE_M;

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: bold;
      }

      .participants {
        margin-top: $SPACE_XS;
        color: $COLOR_MID_2;
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_SMALL;
        display: inline-block;
      }
    }

    .divider {
      border-bottom: 1px dotted $COLOR_MID_1;
      width: 100%;
    }

    @include text;

    .related-events {
      padding: $SPACE_M;
    }
  }
</style>

<!-- METADATA -->
<!-- <MetaData post={page} /> -->

<div class="page-single" in:fade use:links>
  <!-- HEADER -->
  <div class="main-header">
    <!-- TITLE -->
    <div class="title">{page.title}</div>
  </div>
  <div class="divider" />

  <!-- TEXT -->
  {#if Array.isArray(get(page, 'content.content', false))}
    <div class="text">
      {@html renderBlockText(page.content.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- RELATED pageS -->
  <!-- <div class="related-case-studies"> -->
  <!-- {await relatedpages then relatedpages} -->
  <!-- {#if Array.isArray(get(page, 'connectedpages', false))}
      <Calendar pages={page.connectedpages} related={true} />
    {/if} -->
  <!-- {/await} -->
  <!-- </div> -->
</div>
