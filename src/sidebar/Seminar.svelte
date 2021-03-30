<script>
  // # # # # # # # # # # # # #
  //
  //  Seminar
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { loadData, renderBlockText } from "../sanity.js"

  // *** COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"

  // *** GLOBAL
  import { QUERY } from "../global.js"

  // *** STORES
  import { authenticatedUserInformation } from "../stores"

  // *** PROPS
  export let slug = "test-seminar-1"
  export let mobile = false
  export let mobileExpanded = false

  // __ If there is no slug, show user's own seminar
  if (!slug || slug.length == 0) {
    slug = get(
      $authenticatedUserInformation,
      "seminarLink.slug.current",
      "test-seminar-4"
    )
  }

  let seminar = loadData(QUERY.SEMINAR, { slug: slug })
    .catch(err => {
      console.dir(err)
    })
    .catch(err => {
      console.log(err)
    })
  let loadedParticipants = []

  seminar.then(seminar => {
    if (seminar && seminar._id) {
      // Get participants of seminar
      loadData(QUERY.SEMINAR_PARTICIPANTS, {
        id: seminar._id,
      })
        .then(connectedParticipants => {
          loadedParticipants = connectedParticipants
        })
        .catch(err => {
          console.log(err)
        })
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  .seminar-container {
    position: relative;
    height: 100%;
    font-size: $FONT_SIZE_SMALL;

    @include screen-size("small") {
      height: calc(100% - 40px);
    }

    .header {
      font-size: $FONT_SIZE_SMALL;
      padding-left: $SPACE_S;
      padding-right: $SPACE_S;
      padding-top: 7px;
      padding-bottom: 7px;
      width: 100%;
      background: transparent;
      color: $COLOR_LIGHT;
      border-bottom: 1px solid $COLOR_LIGHT;
      text-align: left;
    }

    .body-container {
      width: 100%;
      height: calc(100% - 30px);
      overflow-y: auto;
      padding: $SPACE_S;
      color: $COLOR_MID_2;
      @include hide-scroll;

      @include screen-size("small") {
        height: 100%;
        padding-bottom: 0;
        padding-top: 0;
        &.expanded {
          padding-bottom: $SPACE_S;
          padding-top: $SPACE_S;
          height: calc(100% - 20px);
        }
      }
    }

    .link {
      margin-top: 20px;
      margin-bottom: 20px;
      user-select: none;
      display: inline-block;

      a {
        color: $COLOR_LIGHT;
        border: 1px solid $COLOR_MID_2;
        border-radius: $border_radius;
        padding: $SPACE_S;
        text-decoration: none;
        float: left;
        margin-right: $SPACE_S;

        &:hover {
          border: 1px solid $COLOR_LIGHT;
        }
      }
    }
  }
</style>

<div class="seminar-container">
  {#await seminar then seminar}
    {#if seminar}
      <div class="header">{seminar.title}</div>
      <div class="body-container" class:expanded={mobileExpanded}>
        <!-- TEXT BLOCK #1 -->
        {#if Array.isArray(get(seminar, 'firstTextBlock.content', false)) && seminar.firstTextBlock.content.length > 0}
        <div class="text-block">
          {@html renderBlockText(seminar.firstTextBlock.content)}
        </div>
      {/if}
        <div class="link">
          <!-- LINK: MORE INFORMATION -->
          <a href={seminar.moreInformationLink} target="_blank">More information</a>
          <!-- LINK: BIG BLUE BUTTON -->
          <a href={seminar.bbbLink} target="_blank">Join on BigBlueButton</a>
        </div>
        <!-- PARTICIPANTS LIST -->
        <div class="participants-list">
          <div>Participants in seminar:</div>
          <ParticipantsList participants={loadedParticipants} messaging={true} isSeminar={true}/>
        </div>
      </div>
    {/if}
  {/await}
</div>
