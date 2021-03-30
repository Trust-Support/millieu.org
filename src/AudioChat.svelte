<script>
  // # # # # # # # # # # # # #
  //
  //  AUDIO CHAT
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import { createEventDispatcher } from "svelte"
  import { onMount, onDestroy } from "svelte"

  // *** COMPONENTS
  import AudioChatUser from "./AudioChatUser.svelte"

  // *** PROPS
  export let user = {}
  export let userName = ""
  export let roomName = ""
  export let roomId = 4

  // console.log("____ USERNAME", userName)
  // console.log("____ ROOM NAME", roomName)
  // console.log("____ ROOM ID", roomId)

  // *** CONSTANTS
  const dispatch = createEventDispatcher()
  const server = "https://janus.post-rational.org"
  const opaqueId = "audiobridgetest-" + Janus.randomString(12)

  // *** VARIABLES
  let janus = {}
  let mixertest = null
  let webrtcUp = false
  let audioenabled = false
  let volumeOn = true
  let myId = ""
  let audioEl = {}
  let userList = []
  let minimized = true
  let toggleaudio = () => {}
  let togglevolume = () => {}

  const startAudioChat = () => {
    Janus.init({
      debug: false,
      callback: () => {
        if (!Janus.isWebrtcSupported()) {
          bootbox.alert("No WebRTC support... ")
          return
        }
        // console.dir(Janus)
        janus = new Janus({
          server: server,
          success: function () {
            // console.dir(janus)
            janus.attach({
              plugin: "janus.plugin.audiobridge",
              opaqueId: opaqueId,
              success: pluginHandle => {
                // console.dir(pluginHandle)
                mixertest = pluginHandle
                Janus.log(
                  "Plugin attached! (" +
                    mixertest.getPlugin() +
                    ", id=" +
                    mixertest.getId() +
                    ")"
                )
                registerUsername()
              },
              error: error => {
                console.error("-- Error attaching plugin...", error)
              },
              onmessage: (msg, jsep) => {
                // console.log(" ::: Got a message :::", msg)
                const event = msg["audiobridge"]
                // console.log("Event: " + event)
                if (event) {
                  if (event === "joined") {
                    if (msg["id"]) {
                      console.dir(msg)
                      myId = msg["id"]
                      userList = [
                        ...userList,
                        {
                          display: userName,
                          id: myId,
                          setup: true,
                          muted: false,
                          talking: false,
                          isSelf: true,
                        },
                      ]
                      // console.log("Successfully joined room " + msg["room"] + " with ID " + myId);
                      if (!webrtcUp) {
                        webrtcUp = true
                        // Publish our stream
                        mixertest.createOffer({
                          media: { video: false },
                          success: jsep => {
                            // console.log("Got SDP!", jsep);
                            var publish = {
                              request: "configure",
                              muted: false,
                            }
                            mixertest.send({ message: publish, jsep: jsep })
                          },
                          error: error => {
                            // console.error("WebRTC error:", error);
                          },
                        })
                      }
                    }
                    if (msg["participants"]) {
                      userList = [...userList, ...msg["participants"]]
                    }
                  } else if (event === "talking") {
                    // console.log("TALKING")
                    let index = userList.findIndex(u => u.id === msg["id"])
                    // console.log(index)
                    userList[index].talking = true
                  } else if (event === "stopped-talking") {
                    // console.log("STOPPED TALKING")
                    let index = userList.findIndex(u => u.id === msg["id"])
                    // console.log(index)
                    userList[index].talking = false
                  } else if (event === "event") {
                    if (msg["error"]) {
                      console.error(msg["error"])
                    }
                    if (msg["leaving"]) {
                      // Janus.log("Participant left: " + msg["leaving"] + ")")
                      const index = userList.findIndex(
                        u => u.id === msg["leaving"]
                      )
                      // console.log(index)
                      userList.splice(index, 1)
                      userList = userList
                    }
                  }
                }
                if (jsep) {
                  // Janus.debug("Handling SDP as well...", jsep)
                  mixertest.handleRemoteJsep({ jsep: jsep })
                }
              },
              onremotestream: stream => {
                Janus.attachMediaStream(
                  document.querySelector("#roomaudio"),
                  stream
                )

                // Mute button
                audioenabled = false
                toggleaudio = () => {
                  audioenabled = !audioenabled
                  mixertest.send({
                    message: { request: "configure", muted: !audioenabled },
                  })
                }
                // Mute button
                togglevolume = () => {
                  volumeOn = !volumeOn
                  if (audioEl) {
                    audioEl.volume = volumeOn ? 1 : 0
                  }
                }
              },
              oncleanup: () => {
                webrtcUp = false
              },
            })
          },
        })
      },
    })
  }

  const registerUsername = () => {
    let register = { request: "join", room: roomId, display: userName }
    mixertest.send({ message: register })
  }

  onMount(async () => {
    startAudioChat()
  })

  onDestroy(async () => {
    // console.log("--- Revoke microphone permissions")
    // const microphone = navigator.permissions.query({ name: 'microphone' })
    // navigator.permissions.revoke(microphone)
    janus.destroy()
  })
</script>

<style lang="scss">
  @import "./variables.scss";

  .audioChatContainer {
    line-height: 1;

    position: fixed;
    width: auto;
    min-width: 460px;
    max-height: calc(
      100vh - 100px
    ); // Arbitrary number to not go over the inventroy box most of the time
    overflow-y: auto;
    background: $COLOR_LIGHT;
    height: auto;
    // line-height: 2em;
    text-align: center;
    top: $SPACE_S;
    left: $SPACE_S;
    padding: $SPACE_S;
    border-radius: $border_radius;
    font-size: $FONT_SIZE_BASE;
    font-family: $MONO_STACK;

    background: $COLOR_DARK;
    color: $COLOR_LIGHT;
    border: 1px solid $COLOR_LIGHT;

    @include hide-scroll;

    padding-left: $SPACE_M;
    padding-right: $SPACE_M;

    user-select: none;

    @include screen-size("small") {
      top: unset;
      bottom: 60px;
      left: unset;
      right: $SPACE_S;
      right: $SPACE_S;
      min-width: unset;
      width: calc(100% - 20px);
    }

    .button {
      text-transform: uppercase;
      font-weight: bold;
      // letter-spacing: 0.05em;
      padding: 4px $SPACE_M 2px $SPACE_M;
      display: inline-table;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_MID_2;
      font-size: $FONT_SIZE_SMALL;
      transform: translate(4px, -4px);

      border-radius: $border_radius;
      text-align: center;

      &:hover {
        border: 1px solid $COLOR_LIGHT;
        color: $COLOR_LIGHT;
        cursor: pointer;
      }
    }

    .header {
      display: inline-flex;
      justify-content: space-between;
      flex-direction: row;
      width: 100%;
      height: 30px;

      .text {
        cursor: pointer;
      }

      .controls {
        position: relative;
        top: 0px;
        display: flex;
        fill: $COLOR_LIGHT;
      }

      .microphone {
        position: relative;
        top: -2px;
        opacity: 0.5;
        margin: 0 $SPACE_S;
        cursor: pointer;
        &:hover {
          opacity: 0.7;
        }
      }

      .volume {
        position: relative;
        top: -2px;
        opacity: 0.5;
        cursor: pointer;
        &:hover {
          opacity: 0.7;
        }
      }
    }

    &.minimized {
      height: 41px;
      transition: all 0.3s ease-out;
    }

    .userlist {
      min-height: 200px;
      margin-top: $SPACE_L;

      @include screen-size("small") {
        min-height: unset;
      }
    }
  }

  .user-number {
    text-decoration: underline;
  }
</style>

<div transition:fade class:minimized class="audioChatContainer">
  <!-- AUDIO ELEMENT -->
  <audio
    id="roomaudio"
    width="100%"
    height="100%"
    autoplay
    bind:this={audioEl} />

  <!-- HEADER -->
  <div class="header">
    <div
      class="text"
      on:click={() => {
        minimized = !minimized
      }}>
      <span class="user-number">{userList.length}</span>
      users in
      <strong>{roomName}</strong>
    </div>
    <div class="controls">
      <div class="volume" on:click={togglevolume}>
        {#if volumeOn}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 0 24 24"
            width="20">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M3 9v6h4l5 5V4L7 9H3zm13.5
        3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14
        3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91
        7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 0 24 24"
            width="20">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45
        2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51
        1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5
        3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25
        4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73
        21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        {/if}
      </div>
      <div class="microphone" on:click={toggleaudio}>
        {#if audioenabled}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 0 24 24"
            width="20"><path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" /></svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            viewBox="0 0 24 24"
            width="20"><path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none" />
            <path
              d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" /></svg>
        {/if}
      </div>
      <div
        class="button leave"
        on:click={e => {
          dispatch('close')
        }}>
        Leave
      </div>
    </div>
  </div>

  <!-- USERLIST -->
  <div class="userlist">
    {#each userList as user (user.id)}
      <AudioChatUser {user} />
    {/each}
  </div>
</div>
