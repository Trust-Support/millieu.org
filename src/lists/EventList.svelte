<script>
  // # # # # # # # # # # # # #
  //
  //  EVENT LIST
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import get from "lodash/get"

  // *** GLOBAL
  import { formattedDate } from "../global.js"

  // COMPONENTS
  import ParticipantsList from "./ParticipantsList.svelte"
  import { window } from "lodash/_freeGlobal"

  // *** PROPS
  export let events = []
  export let exhibitions = []
  export let related = false
  export let showArchived = false

  // *** VARIABLES
  let containerWidth = "100%"

  const now = Date.now()
  // __ HACK: Show all events if related
  const upcomingEvents = related
    ? events
    : events.filter(e => Date.parse(e.endDate ? e.endDate : e.startDate) > now)
  const archivedEvents = events.filter(
    e => Date.parse(e.endDate ? e.endDate : e.startDate) < now
  )

  onMount(async () => {
    // __ Enabled horizontal scroll layout on mobile
    if (window.matchMedia("(max-width: 800px)").matches && !related) {
      containerWidth = window.innerWidth * 0.8 * events.length + "px"
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  .eventlist-container {
    height: 100%;
    color: $COLOR_DARK;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @include screen-size("small") {
      // display: none;
      padding-top: 0;
    }

    .inner-container {
      height: 100%;
      overflow-y: auto;
      @include hide-scroll;

      @include screen-size("small") {
        height: 100%;
      }
    }

    .event {
      padding: $SPACE_S;
      // padding-top: $SPACE_S;
      width: 100%;
      min-height: $ITEM_HEIGHT;
      background: $COLOR_LIGHT;
      color: $COLOR_DARK;
      display: block;
      text-decoration: none;
      user-select: none;
      overflow: hidden;

      @include screen-size("small") {
        width: 80vw;
        display: inline-flex;
        padding-top: $SPACE_S;
        height: 80px;
        border-right: 1px solid $COLOR_MID_1;
      }

      &.related {
        padding-left: 0;
        padding-right: 0;

        @include screen-size("small") {
          display: block;
          width: 100%;
          // height: $ITEM_HEIGHT;
          border-right: unset;
        }
      }

      .inner {
        width: 100%;

        .row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: baseline;

          .title {
            font-size: $FONT_SIZE_MEDIUM;
            font-family: $SANS_STACK;
            font-weight: bold;
            max-width: 70%;
            margin-bottom: $SPACE_XS / 2;
          }

          .elips {
            margin-left: $SPACE_XS;
            margin-right: $SPACE_XS;
            width: 30%;
            white-space: nowrap;
            overflow: hidden;
            flex-shrink: 4;
            color: $COLOR_MID_2;
          }

          .date {
            font-family: $HERSHEY_SIMPLEX;
            font-weight: normal;
            font-size: 90%;
            // width: 11ch;
            white-space: nowrap;
            text-align:right;
            color: $COLOR_MID_3;
          }

          .participants {
            font-family: $HERSHEY_SIMPLEX;
            font-weight: normal;
            pointer-events: none;
            color: $COLOR_MID_3;
            font-size: $FONT_SIZE_SMALL;
          }
        }
      }

      transition: background 0.5s $transition;

      &:hover {
        background: $COLOR_MID_1;
      }

      &.header {
        height: 45px;
        border-bottom: 1px solid $COLOR_MID_1;
        padding-bottom: $SPACE_S;
        min-height: unset;
        font-weight: bold;

        a{
          text-decoration: none;
          &:hover{
            text-decoration: underline;
          }
        }
        
        .archive-link {
          cursor: pointer;
          font-size: 90%;
          // word-spacing: -0.3em;
          color: $COLOR_MID_2;
          text-decoration: underline;
          transition: color 250ms $transition;
          &:hover {
            // color: $COLOR_DARK;
            text-decoration: none;
          }
        }

        @include screen-size("small") {
          display: none;
        }

        &.related {
          border-bottom: 1px dotted $COLOR_MID_1;
          @include screen-size("small") {
            display: block;
            position: static;
          }
        }

        &:hover {
          background: unset;
        }
      }
    }

    .footer {
      height: $SPACE_S * 6;
      border-top: 1px solid $COLOR_MID_1;
      padding-bottom: $SPACE_S;
      &:hover {
        background: unset;
      }

      @include screen-size("small") {
        display: none;
      }

      .exhibition {
        padding: 0px $SPACE_S;
        padding-top: $SPACE_S / 2;
        width: 100%;
        height: $SPACE_S * 3;
        background: $COLOR_LIGHT;
        color: $COLOR_DARK;
        display: block;
        text-decoration: none;
        user-select: none;
        overflow: hidden;

        @include screen-size("small") {
          width: 80vw;
          display: inline-flex;
          padding-top: $SPACE_S;
          height: 80px;
          border-right: 1px solid $COLOR_MID_1;
        }

        .inner {
          width: 100%;

          .row {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: baseline;

            .title {
              font-size: $FONT_SIZE_MEDIUM;
              font-family: $SANS_STACK;
              font-weight: 500;
              white-space: nowrap;
              max-width: 70%;
              text-overflow: ellipsis;
              overflow: hidden;
              margin-bottom: $SPACE_XS / 2;
            }

            .elips {
              margin-left: $SPACE_XS;
              margin-right: $SPACE_XS;
              width: 80%;
              white-space: nowrap;
              overflow: hidden;
              flex-shrink: 999999;
              color: $COLOR_MID_2;
            }

            .date {
              font-family: $HERSHEY_SIMPLEX;
            font-weight: normal;
              font-size: 90%; 
              white-space: nowrap;
              color: $COLOR_MID_3;
              // word-spacing: -0.3em;
            }

            .participants {
              font-family: $HERSHEY_SIMPLEX;
            font-weight: normal;
              pointer-events: none;
              color: $COLOR_MID_3;
              font-size: $FONT_SIZE_SMALL;
            }
          }
        }

        transition: background 0.5s $transition;

        &:hover {
          background: $COLOR_MID_1;
        }
      }
    }
  }
</style>

<div class="eventlist-container" style={'width:' + containerWidth + ';'}>
  <!-- HEADER -->
  <div class="event header" class:related>
    <div class="inner">
      <div class="row">
        {#if related}
          <div>Related Events</div>
          <a href="/events" class="archive-link">Archived streams</a>
        {:else}
          <a href="/events">EVENTS</a>
          <a href="/events" class="archive-link">Archived streams</a>
          <!-- <div on:click={e => {showArchive = !showArchive}} class="archive-link">{showArchive ? 'Upcoming Events' : 'Event Archive'}</div> -->
        {/if}
      </div>
    </div>
  </div>

  <!-- EVENTS -->
  <div class="inner-container">
    {#each showArchived ? archivedEvents : upcomingEvents as event, index (event._id)}
      <a
        class="event"
        class:related
        in:fade={{ delay: 100 * index }}
        href={'/events/' + get(event, 'slug.current', '')}>
        <div class="inner">
          <div class="row">
            <div class="title">{event.title}</div>
            <!-- <div class="elips">
              .........................................................
            </div> -->
            <div class="date">{formattedDate(event.startDate)}</div>
          </div>
          <div class="row">
            <div class="participants">
              {#if get(event, 'moderators', false) && Array.isArray(event.moderators)}
                <ParticipantsList
                  participants={event.moderators}
                  isModerators />
              {/if}
              {#if get(event, 'participants', false) && Array.isArray(event.participants)}
                <ParticipantsList participants={event.participants} />
              {/if}
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>

  <!-- FOOTER -->
  <!-- {#if !related && exhibitions && exhibitions.length > 0}
    <div class="footer">
      {#each exhibitions.reverse() as exhibition, index (exhibition._id)}
        <a
          href={'/area/' + get(exhibition, 'area.slug.current', '')}
          class="exhibition">
          <div class="inner">
            <div class="row">
              <div class="title">{exhibition.title}</div>
              <div class="elips">
                .........................................................
              </div>
              <div class="date">{exhibition.period}</div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if} -->
</div>
