<script>
  // # # # # # # # # # # # # #
  //
  //  FULL EVENT LIST
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"
  import { renderBlockText } from "../sanity.js"

  // *** GLOBAL
  import { formattedDate } from "../global.js"

  // COMPONENTS
  import ParticipantsList from "./ParticipantsList.svelte"

  // *** STORES
  import { globalSettings } from "../stores.js"

  // *** PROPS
  export let events = []
  export let exhibitions = []

  // *** VARIABLES
  let containerWidth = "100%"

  const now = Date.now()
  const upcomingEvents = events.filter(
    e => Date.parse(e.endDate ? e.endDate : e.startDate) > now
  )
  const archivedEvents = events.filter(
    e => Date.parse(e.endDate ? e.endDate : e.startDate) < now
  )
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
      padding-top: 0;
    }

    .inner-container {
      height: calc(100% - 80px);
      overflow-y: auto;
      @include hide-scroll;

      @include screen-size("small") {
        height: 100%;
      }
    }

    .description {
      padding: $SPACE_S;
    }

    .event {
      padding: $SPACE_S;
      // padding-top: $SPACE_S;
      width: 100%;
      // height: $ITEM_HEIGHT;
      background: $COLOR_LIGHT;
      color: $COLOR_DARK;
      display: block;
      text-decoration: none;
      user-select: none;

      @include screen-size("small") {
        // width: 80vw;
        display: inline-flex;
        padding-top: $SPACE_S;
        // height: 80px;
        // border-right: 1px solid $COLOR_MID_1;
      }

      .inner {
        width: 100%;

        .row {
          width: 100%;
          display: flex;
          justify-content: space-between;

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
            width: 60%;
            white-space: nowrap;
            overflow: hidden;
            flex-shrink: 4;
            color: $COLOR_MID_3;
          }

          .date {
            color: $COLOR_MID_2;
            font-family: $HERSHEY_SIMPLEX;
            font-weight: normal;
            font-size: 90%;
            // width: 11ch;
            white-space: nowrap;
            text-align:right;
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

      &.footer {
        height: $SPACE_S * 4;
        border-top: 1px solid $COLOR_MID_1;
        padding-bottom: $SPACE_S;
        &:hover {
          background: unset;
        }

        @include screen-size("small") {
          display: none;
        }
      }

      &.header {
        height: 45px;
        border-bottom: 1px solid $COLOR_MID_1;
        padding-bottom: $SPACE_S;
        background-color: white;
        // word-spacing: -0.3em;
        &:hover {
          background: white !important;
        }
        .archive-link {
          color: $COLOR_MID_2;
          text-decoration: underline;
        }

        @include screen-size("small") {
          // display: none;
        }

        &:hover {
          background: unset;
        }
      }
    }
  }

  .exhibition {
    padding: 0px $SPACE_S;
    padding-top: $SPACE_S;
    padding-bottom: $SPACE_S;
    width: 100%;
    background: $COLOR_LIGHT;
    color: $COLOR_DARK;
    display: block;
    text-decoration: none;
    user-select: none;
    overflow: hidden;

    @include screen-size("small") {
      // width: 80vw;
      display: inline-flex;
      padding-top: $SPACE_S;
      // height: 80px;
      // border-right: 1px solid $COLOR_MID_1;
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
            width: 80%;
            white-space: nowrap;
            overflow: hidden;
            flex-shrink: 999999;
            color: $COLOR_MID_3;
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
          font-size: 90%;
          color: $COLOR_MID_2;
          // width: 11ch;
          white-space: nowrap;
          text-align:right;
        }

        .participants {
          pointer-events: none;
          color: $COLOR_MID_2;
          font-size: $FONT_SIZE_SMALL;
        }
      
    }

    transition: background 0.5s $transition;

    &:hover {
      background: $COLOR_MID_1;
    }
  }
  
</style>

<div class="eventlist-container" style={'width:' + containerWidth + ';'}>
  <!-- HEADER -->
  <div class="event header">
    <div class="inner">
      <div class="row">
        <div>Events</div>
      </div>
    </div>
  </div>

  <!-- TEXT -->
  {#if Array.isArray(get($globalSettings, 'eventOverview.content', false))}
    <div class="description">
      {@html renderBlockText($globalSettings.eventOverview.content)}
    </div>
  {/if}

  <!-- EVENTS -->
  <div class="inner-container">
    <!-- ARCHIVED EVENTS -->
    {#if archivedEvents.length}
      <div class="section">
        <!-- SUBHEADER -->
        <div class="event header">
          <div class="inner">
            <div class="row">
              <div>Archived Events</div>
            </div>
          </div>
        </div>
        {#each archivedEvents as event, index (event._id)}
          <a
            class="event"
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
    {/if}

    <!-- UPCOMING EVENTS -->
    <div class="section">
      <!-- SUBHEADER -->
      <div class="event header">
        <div class="inner">
          <div class="row">
            <div>Upcoming Events</div>
          </div>
        </div>
      </div>
      {#each upcomingEvents as event, index (event._id)}
        <a
          class="event"
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

    <!-- EXHIBITIONS -->
    <!-- <div class="section"> -->
    <!-- SUBHEADER -->
    <!-- <div class="event header">
        <div class="inner">
          <div class="row">
            <div>Ongoing</div>
          </div>
        </div>
      </div> -->
    <!-- {#each exhibitions.reverse() as exhibition, index (exhibition._id)}
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
      {/each} -->
    <!-- </div> -->
  </div>
</div>
