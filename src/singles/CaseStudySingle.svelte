<script>
  // # # # # # # # # # # # # #
  //
  //  Single Case Study
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText } from "../sanity.js"
  import { links } from "svelte-routing"

  // *** COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"
  import EventList from "../lists/EventList.svelte"
  import MaterialItem from "./MaterialItem.svelte"
  import MetaData from "../MetaData.svelte"

  // *** PROPS
  export let caseStudy = {}
</script>

<style lang="scss">
  @import "../variables.scss";

  .case-study-single {
    .go-back {
      padding-top: $SPACE_XS;
      padding-left: $SPACE_S;
      cursor: pointer;
      svg {
        path {
          fill: $COLOR_MID_2;
          transition: fill 0.3s $transition;
        }
      }
      &:hover {
        svg {
          path {
            fill: $COLOR_MID_3;
          }
        }
      }
    }

    .main-header {
      padding: $SPACE_M;
      padding-top: $SPACE_XS;

      .color-icon {
        display: none;
        height: 20px;
        width: 20px;
        margin-right: $SPACE_M;
        float: left;
        background: $COLOR_EXHIBITION;

        &.communication {
          background: $COLOR_COMMUNICATION;
        }
        &.consensus-building {
          background: $COLOR_CONSENSUS_BUILDING;
        }
        &.sensing {
          background: $COLOR_SENSING;
        }
        &.archiving {
          background: $COLOR_ARCHIVING;
        }
      }

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: bold;
      }

      .participants {
        margin-top: $SPACE_XS;
        color: $COLOR_MID_3;
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_SMALL;
        display: inline-block;
      }
    }

    .divider {
      border-bottom: 1px dotted $COLOR_MID_1;
      width: 100%;
    }

    .material {
      padding: $SPACE_M;
    }

    @include text;

    .related-events {
      padding: $SPACE_M;
    }
  }

  .material-item {
    width: 100%;
    // height: $ITEM_HEIGHT;
    background: $COLOR_LIGHT;
    color: $COLOR_DARK;
    display: block;
    text-decoration: none;
    user-select: none;
    padding-top: $SPACE_XS;
    padding-bottom: $SPACE_XS;

    .row {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .title {
        font-family: $SANS_STACK;
        font-weight: bold;
        white-space: nowrap;
      }

      .elips {
        margin-left: $SPACE_XS;
        margin-right: $SPACE_XS;
        width: 90%;
        white-space: nowrap;
        overflow: hidden;
        flex-shrink: 4;
        color: $COLOR_MID_2;
      }

      .format {
        white-space: nowrap;
        color: $COLOR_MID_2;
      }
    }

    cursor: pointer;

    // transition: background 0.5s $transition;

    &:hover {
      background: $COLOR_MID_1;
    }

    &.header {
      padding-top: 0px;
      border-bottom: 1px dotted $COLOR_MID_1;
      cursor: default;

      .archive-link {
        color: $COLOR_MID_2;
        text-decoration: underline;
      }

      &:hover {
        background: unset;
      }
    }
  }
</style>

<!-- METADATA -->
<!-- <MetaData post={caseStudy} /> -->

<div class="case-study-single" in:fade use:links>
  <!-- HEADER -->

  {#if caseStudy.title}
    <!-- BACK LINK -->
    <div
      class="go-back"
      on:click={e => {
        window.history.back()
      }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"><path
          d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z" /></svg>
    </div>
    <div class="main-header">
      <!-- COLOR CODE  -->
      <div class="color-icon {caseStudy.category}" />
      <!-- TITLE -->
      <div class="title">{caseStudy.title}</div>
      <!-- PARTICIPANTS -->
      {#if get(caseStudy, 'participants', false) && Array.isArray(caseStudy.participants)}
        <div class="participants">
          <ParticipantsList
            participants={caseStudy.participants}
            messaging={true} />
        </div>
      {/if}
    </div>
    <div class="divider" />
  {/if}

  <!-- TEXT -->
  {#if Array.isArray(get(caseStudy, 'content.content', false))}
    <div class="text">
      {@html renderBlockText(caseStudy.content.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- MATERIAL -->
  {#if Array.isArray(caseStudy.material)}
    <div class="material">
      <div class="material-item header">
        <div class="row">
          <div class="title">Material</div>
          <div class="format">Type</div>
        </div>
      </div>
      {#each caseStudy.material as item (item._key)}
        <MaterialItem {item} />
      {/each}
    </div>
    <div class="divider" />
  {/if}

  <!-- RELATED EVENTS -->
  {#if Array.isArray(get(caseStudy, 'connectedEvents', false))}
    <div class="related-events">
      <EventList events={caseStudy.connectedEvents} related={true} />
    </div>
  {/if}
</div>
