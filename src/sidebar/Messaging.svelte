<script>
  // # # # # # # # # # # # # #
  //
  //  Messaging
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"

  // *** COMPONENTS
  import PrivateMessageThread from "./PrivateMessageThread.svelte"
  import NewPrivateMessage from "./NewPrivateMessage.svelte"

  // *** STORES
  import {
    localUserAuthenticated,
    authenticatedUserInformation,
  } from "../stores"

  // *** VARIABLES
  let privateMessages = []

  // PROPS
  export let mobile = false
  export let mobileExpanded = false

  const getPrivateMessages = () => {
    try {
      if (
        $localUserAuthenticated &&
        get($authenticatedUserInformation, "username", false)
      ) {
        let username = $authenticatedUserInformation.username
        fetch("https://sso.post-rational.org/messages?user=" + username)
          .then(response => response.json())
          .then(data => {
            privateMessages = data.messages
          })
          .catch(err => {
            console.error(err)
          })
      }
    } catch (error) {
      console.log(error)
    }
  }

  // setTimeout(() => {
  getPrivateMessages()
  // }, 500)
  // setInterval(getPrivateMessages, 10000)
</script>

<style lang="scss">
  @import "../variables.scss";

  .messaging-container {
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

    .message-container {
      width: 100%;
      height: calc(100% - 30px);
      overflow-y: auto;
      padding-bottom: $SPACE_S;
      padding-top: $SPACE_S;
      padding-left: $SPACE_S;
      padding-right: $SPACE_S;
      color: $COLOR_MID_2;
      @include hide-scroll;

      @include screen-size("small") {
        height: 100%;
        padding-bottom: 0;
        padding-top: 0;
        &.expanded {
          padding-bottom: $SPACE_S;
          padding-top: $SPACE_S;
          height: calc(100% - 30px);
        }
      }
    }
  }
</style>

<div class="messaging-container">
  <div class="header">Messaging</div>
  <div class="message-container" class:expanded={mobileExpanded}>
    <div class="new-message-container">
      <NewPrivateMessage />
    </div>
    {#each privateMessages as message (message.id)}
      <PrivateMessageThread {message} />
    {/each}
  </div>
</div>
