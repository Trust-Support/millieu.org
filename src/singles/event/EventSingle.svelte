<script>
  // # # # # # # # # # # # # #
  //
  //  Single Event
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText } from "../../sanity.js"
  import { links } from "svelte-routing"

  // *** COMPONENTS
  import ParticipantsList from "../../lists/ParticipantsList.svelte"
  import CaseStudyList from "../../lists/CaseStudyList.svelte"
  import MetaData from "../../MetaData.svelte"

  // *** GLOBAL
  import { formattedDate } from "../../global.js"

  // *** PROPS
  export let event = {}
</script>

<style lang="scss">
  @import "../../variables.scss";

  .event-single {
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
<!-- <MetaData post={event} /> -->

<div class="event-single" in:fade use:links>
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
  <!-- HEADER -->
  <div class="main-header">
    <!-- TITLE -->
    <div class="title">{event.title}</div>

    <!-- PARTICIPANTS -->
    <div class="participants">
      {#if get(event, 'moderators', false) && Array.isArray(event.moderators)}
        <ParticipantsList
          participants={event.moderators}
          isModerators
          messaging={true} />
      {/if}
      {#if get(event, 'participants', false) && Array.isArray(event.participants)}
        <ParticipantsList participants={event.participants} messaging={true} />
      {/if}
    </div>
  </div>
  <div class="divider" />

  <!-- DATE -->
  <div class="date">{formattedDate(event.startDate)}</div>
  <div class="divider" />

  <!-- TEXT -->
  {#if Array.isArray(get(event, 'content.content', false)) && event.content.content.length > 0}
    <div class="text">
      {@html renderBlockText(event.content.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- CONNECTED CASE STUDIES -->
  <div class="connected-case-studies">
    {#if Array.isArray(get(event, 'connectedCaseStudies')) && event.connectedCaseStudies.length > 0}
      <CaseStudyList caseStudies={event.connectedCaseStudies} related={true} />
    {/if}
  </div>
</div>
