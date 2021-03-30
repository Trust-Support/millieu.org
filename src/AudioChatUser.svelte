<script>
  // # # # # # # # # # # # # #
  //
  //  AUDIO CHAT USER
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"

  // *** PROPS
  export let user = {}

  // *** STORES
  import { globalUserList } from "./stores"
  
  const userIndex = $globalUserList.findIndex(u => u.name == user.display)
</script>

<style lang="scss">
  @import "./variables.scss";

  .user {
    margin-bottom: $SPACE_S;
    font-size: $FONT_SIZE_SMALL;
    width: 100%;
    line-height: 3em;
    height: 3em;

    .icon {
      float: left;
      height: 3em;
      width: 3em;
      border-radius: $border_radius;
      margin-right: 1em;
      background: $COLOR_MID_1;
      border: 3px solid transparent;
      transition: border 0.3s ease-out;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
      }
    }

    &.talking {
      .icon {
        border: 3px solid rgb(113, 238, 113);
      }
    }

    .name {
      float: left;
    }

    .speaking {
      float: right;
      display: flex;
      align-items: center;
      height: 3em;
      padding-right: $SPACE_M;

      svg {
        opacity: 0.5;
      }
    }
  }
</style>

<div class="user {user.id}" class:talking={user.talking} transition:fade>
  <div class="icon">
    {#if userIndex > -1}
      <img src={get($globalUserList[userIndex], 'avatarLink.iconUrl', '')} />
    {/if}
  </div>
  <div class="name">
    {user.display}
    {#if userIndex > -1}
      <a
        href={'https://work.anthropocene-curriculum.org/new-message?username=' + get($globalUserList[userIndex], 'username', '')}
        target="_blanks">
        <svg
          width="13"
          height="9"
          viewBox="0 0 13 9"
          fill="black"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.4576 0.300293H1.37064C1.17551 0.300293 1.00664 0.371591 0.864044 0.514191C0.721445 0.65679 0.650146 0.825654 0.650146 1.02079V2.23663L6.41412 4.53321L12.1781 2.23663V1.02079C12.1781 0.825654 12.1068 0.65679 11.9642 0.514191C11.8216 0.371591 11.6527 0.300293 11.4576 0.300293ZM0.650146 3.40744V8.22576C0.650146 8.42089 0.721445 8.58976 0.864044 8.73236C1.00664 8.87496 1.17551 8.94626 1.37064 8.94626H11.4576C11.6527 8.94626 11.8216 8.87496 11.9642 8.73236C12.1068 8.58976 12.1781 8.42089 12.1781 8.22576V3.40744L6.41412 5.70402L0.650146 3.40744Z" />
        </svg>
      </a>
    {/if}
  </div>
</div>
