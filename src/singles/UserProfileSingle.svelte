<script>
  // # # # # # # # # # # # # #
  //
  //  Single User Profile
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText, loadData } from "../sanity.js"
  import { links } from "svelte-routing"

  // *** GLOBALS
  import { QUERY } from "../global.js"

  // COMPONENTS
  import EventList from "../lists/EventList.svelte"
  import CaseStudyList from "../lists/CaseStudyList.svelte"
  import MetaData from "../MetaData.svelte"

  // *** STORES
  // import { localUserAuthenticated } from "../stores"

  // *** PROPS
  export let user = {}

  // *** VARIABLES
  let relatedCaseStudies = false
  let relatedEvents = false

  const relatedContent = loadData(QUERY.CONNECTED_TO_USER, {
    id: user._id,
  }).catch(err => {
    console.log(err)
  })

  relatedContent.then(relatedContent => {
    // __ Filter related content by type
    if (relatedContent && Array.isArray(relatedContent)) {
      relatedEvents = relatedContent.filter(c => c._type == "event")
      relatedCaseStudies = relatedContent.filter(
        c => c._type == "caseStudyExhibition"
      )
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  .user-profile-single {
    .go-back {
      padding-top: $SPACE_S;
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

    .user-profile-message {
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

    .connected-case-studies {
      padding: $SPACE_M;
      padding-top: 0;
    }
  }
</style>

<!-- METADATA -->
<!-- <MetaData post={user} /> -->

<div class="user-profile-single" in:fade use:links>
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
    <div class="title">
      {user.name}
      <!-- {#if $localUserAuthenticated && user.username}
        <a
          href={'https://work.anthropocene-curriculum.org/new-message?username=' + user.username}
          target="_blanks"
          class="user-profile-message">
          <svg
            width="13"
            height="9"
            viewBox="0 0 13 9"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.4576 0.300293H1.37064C1.17551 0.300293 1.00664 0.371591 0.864044 0.514191C0.721445 0.65679 0.650146 0.825654 0.650146 1.02079V2.23663L6.41412 4.53321L12.1781 2.23663V1.02079C12.1781 0.825654 12.1068 0.65679 11.9642 0.514191C11.8216 0.371591 11.6527 0.300293 11.4576 0.300293ZM0.650146 3.40744V8.22576C0.650146 8.42089 0.721445 8.58976 0.864044 8.73236C1.00664 8.87496 1.17551 8.94626 1.37064 8.94626H11.4576C11.6527 8.94626 11.8216 8.87496 11.9642 8.73236C12.1068 8.58976 12.1781 8.42089 12.1781 8.22576V3.40744L6.41412 5.70402L0.650146 3.40744Z" />
          </svg>
        </a>
      {/if} -->
    </div>
  </div>
  <div class="divider" />

  <!-- BIOGRAPHY -->
  {#if Array.isArray(get(user, 'biography.content', false))}
    <div class="text">
      {@html renderBlockText(user.biography.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- RELATED EVENTS -->
  <div class="related-events">
    {#if relatedEvents && Array.isArray(relatedEvents) && relatedEvents.length > 0}
      <EventList events={relatedEvents} related={true} />
    {/if}
  </div>

  <!-- CONNECTED CASE STUDIES -->
  <div class="connected-case-studies">
    {#if relatedCaseStudies && Array.isArray(relatedCaseStudies) && relatedCaseStudies.length > 0}
      <CaseStudyList caseStudies={relatedCaseStudies} related={true} />
    {/if}
  </div>
</div>
