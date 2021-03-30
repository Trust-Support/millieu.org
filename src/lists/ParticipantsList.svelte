<script>
  // # # # # # # # # # # # # #
  //
  //  Participants
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import get from "lodash/get"

  // *** STORES
  // import { localUserAuthenticated } from "../stores"

  // *** PROPS
  export let participants = {}
  export let messaging = false
  export let isModerators = false
  export let isSeminar = false
</script>

<style lang="scss">
  @import "../variables.scss";

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: $COLOR_DARK;
    }

    svg {
      margin-left: $SPACE_XS;
      margin-right: 2px;
      path {
        fill: $COLOR_MID_2;
      }
      &:hover {
        path {
          fill: $COLOR_DARK;
        }
      }
    }
  }

  .seminar {
    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: $COLOR_LIGHT;
      }

      svg {
        margin-left: $SPACE_XS;
        margin-right: 2px;
        path {
          fill: $COLOR_MID_2;
        }
        &:hover {
          path {
            fill: $COLOR_LIGHT;
          }
        }
      }
    }
  }

  .participant{

    // word-spacing: -0.2em;

    &::after {
      content: ", ";
    }

    &:last-of-type {
      &::after {
        content: "";
      }
    }
  }
</style>

{#if participants && Array.isArray(participants)}
  {#each participants as participant, index}
    <span class="participant" class:seminar={isSeminar}><a
        href={'/profiles/' + get(participant, 'slug.current', '')}>{participant.name}{#if isModerators}
          &nbsp;(moderator)
        {/if}</a>
      <!-- {#if $localUserAuthenticated && messaging && participant.username}
        <a
          class="message-icon"
          href={'https://work.anthropocene-curriculum.org/new-message?username=' + participant.username}
          target="_blanks">
          <svg
            width="13"
            height="9"
            viewBox="0 0 13 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.4576 0.300293H1.37064C1.17551 0.300293 1.00664 0.371591 0.864044 0.514191C0.721445 0.65679 0.650146 0.825654 0.650146 1.02079V2.23663L6.41412 4.53321L12.1781 2.23663V1.02079C12.1781 0.825654 12.1068 0.65679 11.9642 0.514191C11.8216 0.371591 11.6527 0.300293 11.4576 0.300293ZM0.650146 3.40744V8.22576C0.650146 8.42089 0.721445 8.58976 0.864044 8.73236C1.00664 8.87496 1.17551 8.94626 1.37064 8.94626H11.4576C11.6527 8.94626 11.8216 8.87496 11.9642 8.73236C12.1068 8.58976 12.1781 8.42089 12.1781 8.22576V3.40744L6.41412 5.70402L0.650146 3.40744Z" />
          </svg></a>
      {/if} -->
    </span>
  {/each}
{/if}
