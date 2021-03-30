<script>
  // # # # # # # # # # # # # #
  //
  //  SCROLL-LIST
  //
  // # # # # # # # # # # # # #
  // *** IMPORTS
  import { onMount } from "svelte";
  import { tick } from "svelte/internal";
  import Flickity from "flickity";
  import { navigate } from "svelte-routing";
  import get from "lodash/get"
  import { fade } from "svelte/transition";


  // *** GLOBAL
  import { formattedDate } from "../global.js"

  // COMPONENTS
  import ParticipantsList from "./ParticipantsList.svelte"
  import { window } from "lodash/_freeGlobal"

  // *** PROPS
  export let events = []
  export let exhibitions = []
  export let related = false
  
  // *** VARIABLES
  let showArchive = false
  let maxEvents = 5
  
  const now = Date.now()
  // __ HACK: Show all events if related 
  const upcomingEvents = related ? events : events.filter(e => Date.parse(e.endDate ? e.endDate : e.startDate) > now)
  const upcomingEventsSlice =  upcomingEvents.slice(0, maxEvents);
  const archivedEvents = events.filter(e => Date.parse(e.endDate ? e.endDate : e.startDate) < now)

  // *** PROPS
  const tagArray = ["test 1", "test 2", "test 3"];
  // *** DOM REFERENCES
  let scrollListEl;
  let loaded = false;
  // TODO: change speed for mobile
  const startTicker = function() {
    // Play with this value to change the speed
    let tickerSpeed = 0.3;
    let flickity = null;
    let isPaused = true;
    const update = () => {
      if (isPaused) return;
      if (flickity.slides) {
        flickity.x = (flickity.x - tickerSpeed) % flickity.slideableWidth;
        // flickity.selectedIndex = flickity.dragEndRestingSelect();
        // flickity.updateSelectedSlide();
        flickity.settle(flickity.x);
      }
      window.requestAnimationFrame(update);
    };
    const pause = () => {
      isPaused = true;
    };
    const play = () => {
      if (isPaused) {
        isPaused = false;
        window.requestAnimationFrame(update);
      }
    };
    let options = {
      wrapAround: true,
      autoPlay: false,
      draggable: true,
      prevNextButtons: false,
      pageDots: false,
      cellAlign: 'left',
      // selectedAttraction: 0.025,
      freeScrollFriction: 0.03
      // friction: 0.85
    };
    try {
      flickity = new Flickity(scrollListEl, options);
    } catch (err) {
      Sentry.captureException(err);
    }
    flickity.x = 0;
    scrollListEl.addEventListener("mouseenter", pause, false);
    scrollListEl.addEventListener("focusin", pause, false);
    scrollListEl.addEventListener("mouseleave", play, false);
    scrollListEl.addEventListener("focusout", play, false);
    flickity.on("dragStart", () => {
      isPaused = true;
    });
    flickity.on("staticClick", function(
      event,
      pointer,
      cellElement,
      cellIndex
    ) {
      flickity.select(cellIndex);
      // navigate("/" + $activeCategory + "/category/" + cellElement.dataset.tag);
    });
    play();
    setTimeout(() => {
      loaded = true;
    }, 500);
  };
  // *** ON MOUNT
  onMount(async () => {
    await tick();
    startTicker();
  });
</script>

<style lang="scss">
  @import "../variables.scss";
  .event-scroller {
    height: 80px;
    border-bottom: 1px solid $COLOR_MID_1;
    position: fixed;
    top: 0px;
    width: 100%;
    left: 0;
    overflow: hidden;
    z-index: 99;

    width: 100%;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;
    opacity: 1;
    transition: opacity 0.3s ease-out, transform 0.3s ease-out, left 0.3s ease-out;
    &__slide {
      display: inline-block;
      margin-right: 30px;
      white-space: nowrap;
      height: 80px;
      overflow: visible;
      // padding-top: 3px;

    }
    &__slideshow {
      height: 80px;
      width: 100%;
    }

    .event{
      display: block;
      text-decoration: none;
      user-select: none;
      overflow: hidden;
      width: 80vw;
      display: inline-flex;
      padding: $SPACE_S;
      height: 80px;
      border-right: 1px solid $COLOR_MID_1;
    }
    
    .fade{
      background:linear-gradient(0deg, $COLOR_LIGHT 0%, rgba(240, 240, 240, 0) 100%);
      width: 100%;
      height: 35%;
      display: block;
      pointer-events: none;
      position:absolute;
      bottom:0;
      left:0;

    }

    .inner {
        width: 100%;

        .row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: baseline;

          .title {
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
            width: 30%;
            white-space: nowrap;
            overflow: hidden;
            flex-shrink: 4;
            color: $COLOR_MID_2;
          }

          .date {
            font-size: 90%;
            white-space: nowrap;
            color: $COLOR_MID_2;
            // word-spacing: -0.3em;
          }

          .participants {
            pointer-events: none;
            color: $COLOR_MID_2;
            font-size: $FONT_SIZE_SMALL;
          }
        }
      }
  }
</style>

<div class="event-scroller">
  <div
    class:loaded
    class="main-carousel event-scroller__slideshow
    event-scroller__slideshow--large"
    bind:this={scrollListEl}>
    <!-- {#each tagArray as t}
      <div class="carousel-cell event-scroller__slide">
        <span
          class="taxonomy__item event-scroller__link">
          {t}
        </span>
      </div>
    {/each} -->

    {#each (showArchive ? archivedEvents : upcomingEventsSlice) as event, index (event._id)}
      <a
        class="event"
        class:related
        in:fade={{ delay: 100 * index }}
        href={'/events/' + get(event, 'slug.current', '')}>
        <div class="fade"></div>
        <div class="inner">
          <div class="row">
            <div class="title">{event.title}</div>
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
    <a class="event" href="/events">View all events</a> 
  </div>
</div>