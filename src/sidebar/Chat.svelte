<script>
  // # # # # # # # # # # # # #
  //
  //  Chat
  //
  // # # # # # # # # # # # # #

  // *** COMPONENTS
  import { afterUpdate, onMount } from "svelte"
  import { fade } from "svelte/transition"
  import ChatMessage from "./ChatMessage.svelte"
  import { renderBlockText, loadData, client } from "../sanity"
  import get from "lodash/get"

  // *** DOM REFERENCES
  let messageContainerEl = {}

  // *** GLOBAL
  import { QUERY } from "../global.js"

  // *** PROPS
  export let chatMessages = []
  export let currentRoom = 2
  export let mobile = false
  export let mobileExpanded = false
  
  // *** VARIABLES
  let pinnedText = false
  let pinnedMessageClosed = false

  loadData(QUERY.PINNED_MESSAGE)
    .then(pM => {
      if (
        pM.showPinnedMessage &&
        Array.isArray(get(pM, "content.content", false))
      ) {
        pinnedText = pM.content.content
        pinnedMessageClosed = false
      } else {
        pinnedText = false
      }
    })
    .catch(err => {
      console.log(err)
    })

  // __ Listen for changes to the pinned message
  client.listen(QUERY.PINNED_MESSAGE).subscribe(update => {
    pinnedText = false
    setTimeout(() => {
      loadData(QUERY.PINNED_MESSAGE)
        .then(pM => {
          if (
            pM.showPinnedMessage &&
            Array.isArray(get(pM, "content.content", false))
          ) {
            pinnedText = pM.content.content
            pinnedMessageClosed = false
          } else {
            pinnedText = false
          }
        })
        .catch(err => {
          console.log(err)
        })
    }, 500)
  })

	afterUpdate(() => {
    if (messageContainerEl) {
      // if(messageContainerEl.scrollHeight - messageContainerEl.scrollTop < 300) {
      messageContainerEl.scrollTo({
        top: messageContainerEl.scrollHeight,
        left: 0
      })
      // }
    }
	});

  onMount(async () => {
    if (messageContainerEl) {
        setTimeout(() => {
          messageContainerEl.scrollTo({
          top: messageContainerEl.scrollHeight,
          left: 0
        })
      }, 2000)
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  .chat-container {
    position: relative;
    height: 100%;

    @include screen-size("small") {
      height: calc(100% - 40px);
    }
  }

  .header {
    font-size: $FONT_SIZE_SMALL;
    padding-left: $SPACE_S;
    padding-right: $SPACE_S;
    padding-top: 7px;
    padding-bottom: 7px;
    width: 100%;
    color: $COLOR_LIGHT;
    border-bottom: 1px solid $COLOR_LIGHT;
    text-align: left;
  }

  .message-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    // padding-bottom: $SPACE_S;
    padding-top: $SPACE_S;
    @include hide-scroll;

    .pinned-message {
      background: $COLOR_DARK;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding-top: $SPACE_XS;
      padding-bottom: $SPACE_XS;
      padding-left: $SPACE_S;
      padding-right: $SPACE_S;
      margin-bottom: $SPACE_XS;
      color: $COLOR_LIGHT;
      font-size: $FONT_SIZE_SMALL;
      user-select: none;
      border-bottom: 1px solid $COLOR_MID_2;
      pointer-events: all;

      @include screen-size("small"){
        position: fixed;
        top: 80px;
      }
    }

    @include screen-size("small") {
      height: 100%;
      padding-bottom: 0;
      padding-top: 0;
      &.expanded {
        padding-bottom: $SPACE_S;
        padding-top: $SPACE_S;
        height: calc(100% - 28px);
      }
    }
  }

  .close-pinned-message {
    position: absolute;
    top: -2px;
    right: 10px;
    font-size: 22px;
    cursor: pointer;
  }
</style>

<div class="chat-container">
  {#if mobile && mobileExpanded}
    <div class="header">You are in: {currentRoom}</div>
  {/if}
  <div
    id="message-container"
    class="message-container"
    class:expanded={mobileExpanded}
    bind:this={messageContainerEl}>
    {#if pinnedText && !pinnedMessageClosed}
      <div class="pinned-message" transition:fade|local>
        {@html renderBlockText(pinnedText)}
        <div
          class="close-pinned-message"
          on:click={e => {
            pinnedMessageClosed = true
          }}>
          ×
        </div>
      </div>
    {/if}
    {#each chatMessages as message (message.msgId)}
      <ChatMessage {message} />
    {/each}
  </div>
</div>
