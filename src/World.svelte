<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP World View
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { onMount } from "svelte";
  import * as Colyseus from "colyseus.js";
  import * as PIXI from "pixi.js";
  import { Viewport } from "pixi-viewport";
  import get from "lodash/get";
  import sample from "lodash/sample";
  import { fly, scale, fade } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { urlFor, loadData, client } from "./sanity.js";
  import { links, navigate } from "svelte-routing";
  import { Howl } from "howler";
  import MediaQuery from "svelte-media-query";
  import Tweener from "tweener";
  import Cookies from "js-cookie";

  // *** COMPONENTS
  // sidebar
  import Chat from "./sidebar/Chat.svelte";
  import MiniMap from "./sidebar/MiniMap.svelte";
  import Menu from "./sidebar/Menu.svelte";
  import ToolBar from "./sidebar/ToolBar.svelte";
  // import Seminar from "./sidebar/Seminar.svelte"
  // import Messaging from "./sidebar/Messaging.svelte"
  import Clock from "./sidebar/Clock.svelte";
  // lists
  import EventList from "./lists/EventList.svelte";
  import EventListFull from "./lists/EventListFull.svelte";
  import CaseStudyList from "./lists/CaseStudyList.svelte";
  import EventListSliderMobile from "./lists/EventListSliderMobile.svelte";
  // singles
  import CaseStudySingle from "./singles/CaseStudySingle.svelte";
  import PageSingle from "./singles/PageSingle.svelte";
  import UserProfileSingle from "./singles/UserProfileSingle.svelte";
  import EventSingle from "./singles/event/EventSingle.svelte";
  import LiveSingle from "./singles/event/LiveSingle.svelte";
  import AudioInstallationSingle from "./singles/AudioInstallationSingle.svelte";
  // overlays
  import LoadingScreen from "./overlays/LoadingScreen.svelte";
  import Error from "./overlays/Error.svelte";
  import Reconnection from "./overlays/Reconnection.svelte";
  import Tutorial from "./overlays/Tutorial.svelte";
  import UsernameDialog from "./overlays/UsernameDialog.svelte";
  // ...
  import AudioChat from "./AudioChat.svelte";
  // import InventoryMessage from "./InventoryMessage.svelte"
  import MetaData from "./MetaData.svelte";
  import Card from "./Card.svelte";

  // *** GLOBAL
  import {
    nanoid,
    MAP,
    // TINTMAP,
    REVERSE_HEX_MAP,
    QUERY,
    TEXT_ROOMS,
    TEXT_STYLE_AVATAR,
    TEXT_STYLE_AVATAR_AUTHENTICATED,
    TEXT_STYLE_CASE_STUDY,
    GAME_SERVER_URL,
  } from "./global.js";

  // *** STORES
  import {
    localUserUUID,
    localUserSessionID,
    localUserName,
    // localUserAuthenticated,
    // authenticatedUserInformation,
    globalSettings,
    areaList,
    currentArea,
    currentAreaObject,
    currentTextRoom,
    currentAudioRoom,
    currentVideoRoom,
    globalUserList,
  } from "./stores.js";
  import { window } from "lodash/_freeGlobal";

  // *** PROPS
  export let params = false;

  // *** DOM REFERENCES
  let gameContainer = {};

  // *** VARIABLES
  let activeContentClosed = false;
  // let supportStreamClosed = false
  let audioChatActive = false;
  let sidebarHidden = false;
  // let intentToPickUp = false
  let inAudioZone = false;
  let mobileExpanded = false;
  let miniImage = false;
  let showWelcomeCard = false;
  let localPlayers = {};
  let chatMessages = [];
  let moveQ = [];
  let reconnectionAttempts = 0;
  let disconnectionCode = 0;
  let currentStreamEvent = false;
  let currentStreamUrl = false;
  // let supportStreamUrl = false
  let closedAreaCards = [];

  // ___ Routing
  let section = false;
  let slug = false;
  // let sso = false
  // let sig = false
  // let returnSection = false
  // let returnSlug = false

  /// *** CONSTANTS
  // const loadingTimestamp = Date.now()

  $: {
    // ___ Split the url parameter into variables
    const args = get(params, "[*]", "").split("/");
    section = args[0] && args[0].length > 0 ? args[0] : "seed";
    // if (section === "authenticate") {
    //   sso = args[1] && args[1].length > 0 ? args[1] : false
    //   sig = args[2] && args[2].length > 0 ? args[2] : false
    //   returnSection = args[3] && args[3].length > 0 ? args[3] : false
    //   returnSlug = args[4] && args[4].length > 0 ? args[4] : false
    // } else {
    slug = args[1] && args[1].length > 0 ? args[1] : false;
    // }
    console.log("SECTION:", section);
    console.log("SLUG:", slug);
  }

  $: {
    if (section === "area" && slug) {
      if ($areaList && Array.isArray($areaList)) {
        const targetArea = $areaList.find((a) => a.slug.current === slug);
        if (targetArea) {
          // __ Clear section and slug
          navigate("/");
          // __ Teleport
          if (REVERSE_HEX_MAP[targetArea.color]) {
            teleportTo(REVERSE_HEX_MAP[targetArea.color]);
          }
        }
      }
    }
  }
  // ___ Listen for changes to page visibility (ie. tab being out of focus etc..)
  // ___ Fastforward animations when window is refocused
  let deltaJump = 0;
  let hiddenTime = 0;
  let hidden, visibilityChange;

  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  const handleVisibilityChange = () => {
    if (document[hidden]) {
      hiddenTime = Date.now();
    } else {
      // Number of frames missed (1000ms / 60frames ≈ 16.6666)
      deltaJump = Math.round((Date.now() - hiddenTime) / 16.6666);
    }
  };

  document.addEventListener(visibilityChange, handleVisibilityChange, false);

  // ___ Get data from Sanity CMS
  const graphicsSettings = loadData(QUERY.GRAPHICS_SETTINGS).catch((err) => {
    console.log(err);
  });
  const events = loadData(QUERY.EVENTS).catch((err) => {
    console.log(err);
  });
  const exhibitions = loadData(QUERY.EXHIBITIONS).catch((err) => {
    console.log(err);
  });
  const caseStudies = loadData(QUERY.CASE_STUDIES).catch((err) => {
    console.log(err);
  });
  const audioInstallations = loadData(QUERY.AUDIO_INSTALLATIONS).catch(
    (err) => {
      console.log(err);
    }
  );
  const landMarks = loadData(QUERY.LAND_MARKS).catch((err) => {
    console.log(err);
  });
  const users = loadData(QUERY.USERS).catch((err) => {
    console.log(err);
  });
  const pages = loadData(QUERY.PAGES).catch((err) => {
    console.log(err);
  });
  const audioRoomNames = loadData(QUERY.AUDIOROOM_NAMES).catch((err) => {
    console.log(err);
  });
  const tutorialCard = loadData(QUERY.TUTORIAL_CARD).catch((err) => {
    console.log(err);
  });

  // __ Set global user list
  users.then((users) => {
    globalUserList.set(users);
    return users;
  });

  loadData(QUERY.GLOBAL_SETTINGS)
    .then((gS) => {
      globalSettings.set(gS);
    })
    .catch((err) => {
      console.log(err);
    });

  loadData(QUERY.AREAS)
    .then((areas) => {
      areaList.set(areas);
    })
    .catch((err) => {
      console.log(err);
    });

  let activeStreams = loadData(QUERY.ACTIVE_STREAMS)
    .catch((err) => {
      console.log(err);
    })
    .then((activeStreams) => {
      currentStreamEvent = activeStreams.mainStreamEvent;
      currentStreamUrl = activeStreams.mainStream;
      // supportStreamUrl = activeStreams.supportStream
    });

  // __ Listen for changes to the active streams post
  client.listen(QUERY.ACTIVE_STREAMS).subscribe((update) => {
    currentStreamUrl = false;
    currentStreamEvent = false;
    // supportStreamUrl = false
    setTimeout(() => {
      activeStreams = loadData(QUERY.ACTIVE_STREAMS)
        .then((aS) => {
          if (aS.mainStream) {
            currentStreamEvent = aS.mainStreamEvent;
            currentStreamUrl = aS.mainStream;
            // supportStreamUrl = activeStreams.supportStream
            activeContentClosed = false;
            // supportStreamClosed = false
          } else {
            currentStreamUrl = false;
            currentStreamEvent = false;
            // supportStreamUrl = false
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }, 1000);
  });

  // ___ Set overarching state of the UI
  const STATE = {
    ERROR: 0,
    READY: 1,
    LOADING: 2,
    DISCONNECTED: 3,
    SETUSERNAME: 4,
  };

  const UI = { state: STATE.LOADING, errorMessage: false };

  const setUIState = (newState, errorMessage = false) => {
    console.log("NEW STATE", newState);
    switch (newState) {
      case STATE.READY:
        UI.state = STATE.READY;
        break;
      case STATE.LOADING:
        UI.state = STATE.LOADING;
        break;
      case STATE.DISCONNECTED:
        UI.state = STATE.DISCONNECTED;
        break;
      case STATE.SETUSERNAME:
        UI.state = STATE.SETUSERNAME;
        break;
      default:
        UI.state = STATE.ERROR;
        UI.errorMessage = errorMessage;
    }
  };

  // __ Connect to Colyseus gameserver
  const gameClient = new Colyseus.Client(GAME_SERVER_URL);

  // ___ For animations
  const tweener = new Tweener(1 / 60);

  // PIXI
  let app = {};
  let viewport = {};
  let ticker = {};
  let avatarSpritesheets = {};
  // layers
  let mapLayer = {};
  // let emergentLayer = {}
  let exhibitionLayer = {};
  let audioInstallationLayer = {};
  let playerLayer = {};
  let landMarkLayer = {};
  // misc
  let targetGraphics = {};
  // let cull = {}
  // const cull = new Cull.Simple();

  const checkAudioProximity = () => {
    audioInstallationLayer.children.forEach((a) => {
      // Get distance between user and audio installation
      const dist = Math.sqrt(
        Math.pow(a.x - localPlayers[$localUserSessionID].avatar.x, 2) +
          Math.pow(a.y - localPlayers[$localUserSessionID].avatar.y, 2)
      );
      // Check if user is within range of audio installation
      if (dist < a.radius) {
        inAudioZone = a.slug;
        if (!a.audio.playing() && !a.noAutoplay) {
          a.audio.play();
        }
        // Set volume proportionally to distance
        // Formula to translate ranges:
        // NewValue = ((OldValue - OldMin) * NewRange) / OldRange + NewMin;
        a.audio.volume(1 - dist / a.radius);
      }
      if (dist > a.radius) {
        if (inAudioZone == a.slug) {
          inAudioZone = false;
        }
        if (a.audio.playing()) {
          a.audio.pause();
          a.audio.volume(0);
        }
      }
    });
  };

  // __ Game loop
  // __ Called at approximately 60fps by pixi.ticker
  const updatePositions = (delta) => {
    // Combine delta (lag) and potential time passed since window was in focus
    let deltaRounded = Math.round(delta) + deltaJump;
    deltaJump = 0;
    // Iterate over all users currently in move queue
    for (let key in moveQ) {
      if (localPlayers[key]) {
        if (moveQ[key].length > 0) {
          if (moveQ[key].length - deltaRounded < 0) {
            // User reached destination while the window was out of focus
            // Move to final step and clear users's move queue
            let step = moveQ[key][moveQ[key].length - 1];
            localPlayers[key].avatar.setAnimation(step.direction);
            localPlayers[key].avatar.x = step.x;
            localPlayers[key].avatar.y = step.y;
            localPlayers[key].area = step.area;
            moveQ[key] = [];
            if (key === $localUserSessionID) {
              checkAudioProximity();
            }
          } else {
            // Get next step, adjusting for delta
            moveQ[key].splice(0, deltaRounded - 1);
            let step = moveQ[key].shift();
            localPlayers[key].avatar.setAnimation(step.direction);
            localPlayers[key].avatar.x = step.x;
            localPlayers[key].avatar.y = step.y;
            localPlayers[key].area = step.area;
            if (key === $localUserSessionID && moveQ[key].length % 30 === 0) {
              // Set current area for users
              currentArea.set(localPlayers[$localUserSessionID].area);
              // Check proximity to audio installations every 30th step
              checkAudioProximity();
            }
          }
        } else {
          // Destination reached
          if (key === $localUserSessionID) {
            hideTarget();
            checkAudioProximity();
            // User was walking towards a case study
            // if (intentToPickUp) {
            //   pickUpCaseStudy(intentToPickUp)
            // }
          }
          localPlayers[key].avatar.setAnimation("rest");
          delete moveQ[key];
        }
      } else {
        delete moveQ[key];
      }
    }
  };

  // __ Mark path destination
  const showTarget = (x, y) => {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xffffff);
    graphics.alpha = 0.5;
    graphics.drawCircle(x, y, 10);
    graphics.endFill();
    mapLayer.addChild(graphics);
    targetGraphics = graphics;
  };

  const hideTarget = () => {
    mapLayer.removeChild(targetGraphics);
    targetGraphics = {};
  };

  // *** GLOBAL FUNCTIONS
  let teleportTo = () => {};
  let submitChat = () => {};
  // let dropCaseStudy = () => {}
  // let pickUpCaseStudy = () => {}

  const initializeGameWorld = () => {
    // __ Load assets
    graphicsSettings.then((graphicsSettings) => {
      // __ Load map
      const mapAsset = get(graphicsSettings, "mapLink.mainImage.asset", false);
      if (mapAsset) {
        // __ Get minimap URL
        miniImage = urlFor(graphicsSettings.mapLink.miniImage.asset)
          .width(400)
          .height(400)
          .quality(100)
          .auto("format")
          .url();
        // __ Load main map
        const mapLoader = new PIXI.Loader();
        const mapUrl = urlFor(mapAsset).url();
        mapLoader.add("map", mapUrl);
        mapLoader.load((loader, resources) => {
          const map = new PIXI.Sprite(resources.map.texture);
          map.width = MAP.WIDTH;
          map.height = MAP.HEIGHT;
          mapLayer.addChild(map);
        });
      } else {
        setUIState(STATE.ERROR, "Unable to load map");
        throw "Unable to load map";
      }

      // __ Load avatars
      const activeAvatars = get(graphicsSettings, "activeAvatars", false);
      const avatarLoader = new PIXI.Loader();
      if (activeAvatars && activeAvatars.length > 0) {
        activeAvatars.forEach((avatar, index) => {
          const spriteUrl = get(avatar, "spriteJsonURL", false);
          if (spriteUrl) {
            avatarLoader.add(avatar._id, spriteUrl);
          }
        });
      } else {
        setUIState(STATE.ERROR, "Unable to load avatars");
        throw "Unable to load avatars";
      }

      avatarLoader.load((loader, resources) => {
        for (let key of Object.keys(resources)) {
          if (resources[key].extension === "json") {
            avatarSpritesheets[key] = resources[key].spritesheet;
          }
        }

        // __ Create player
        const createPlayer = (playerOptions, sessionId) => {
          // __ Create sprites for all motion states
          const sprites = ["rest", "front", "back", "left", "right"].map(
            (ms) => {
              const sprite = new PIXI.AnimatedSprite(
                avatarSpritesheets[playerOptions.avatar].animations[ms]
              );
              sprite.name = ms;
              sprite.visible = ms === "rest" ? true : false;
              sprite.height = 80;
              sprite.width = 80;
              sprite.animationSpeed = ms === "rest" ? 0.02 : 0.1;
              sprite.play();
              return sprite;
            }
          );

          // __ Name graphics (shown on hover)
          const textSprite = new PIXI.Text(
            playerOptions.name,
            playerOptions.authenticated
              ? TEXT_STYLE_AVATAR_AUTHENTICATED
              : TEXT_STYLE_AVATAR
          );
          const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE);
          txtBG.width = textSprite.width + 10;
          txtBG.height = textSprite.height + 10;
          textSprite.x = 5;
          textSprite.y = 5;
          const textContainer = new PIXI.Container();
          textContainer.addChild(txtBG, textSprite);
          textContainer.name = "text";

          // __ Add sprites and initial position to container
          const avatar = new PIXI.Container();
          avatar.addChild(...sprites);
          avatar.motionState = "rest";
          avatar.x = playerOptions.x;
          avatar.y = playerOptions.y;
          avatar.pivot.x = avatar.width / 2;
          avatar.pivot.y = avatar.height / 2;
          avatar.interactive = true;
          avatar.setAnimation = (direction) => {
            avatar.motionState = direction;
            avatar.children.forEach((c) => {
              c.visible =
                c.name == direction || c.name == "text" ? true : false;
            });
          };

          const player = {
            avatar: avatar,
            waypoints: [],
            area: playerOptions.area,
            name: playerOptions.name,
            discourseName: playerOptions.discourseName,
            uuid: playerOptions.uuid,
            ip: playerOptions.ip,
            tint: playerOptions.tint,
            connected: playerOptions.connected,
            authenticated: playerOptions.authenticated,
            id: sessionId,
            isSelf: playerOptions.uuid === $localUserUUID,
          };

          const onDown = (e) => {
            // __ Open profile if accredited user
            if (player.authenticated) {
              // __ Get user from userlist
              const targetUser = $globalUserList.find(
                (u) => u.username === player.discourseName
              );
              if (targetUser && get(targetUser, "slug.current", false)) {
                navigate("/profiles/" + targetUser.slug.current);
              }
            }
            if (player.uuid != $localUserUUID) {
              e.stopPropagation();
            }
          };

          const onEnter = () => {
            if (player.authenticated) {
              gameContainer.style.cursor = "pointer";
            }
            textContainer.y = 30 - textContainer.height / 2;
            textContainer.x = -(textContainer.width / 2) + 30;
            avatar.addChild(textContainer);
          };

          const onLeave = () => {
            gameContainer.style.cursor = "crosshair";
            avatar.removeChild(textContainer);
          };

          player.avatar.on("mousedown", onDown);
          player.avatar.on("touchstart", onDown);
          player.avatar.on("mouseover", onEnter);
          player.avatar.on("mouseout", onLeave);

          playerLayer.addChild(player.avatar);

          if (player.isSelf) {
            // __ Follow own avatar in viewport
            viewport.follow(player.avatar, {
              radius: 20,
              acceleration: 400,
            });
            localUserSessionID.set(player.id);
            // __ Uncomment this line to show the accredited user toolkit while developing...
            // localUserAuthenticated.set(true)

            // __ Set cookie if user is successfully authenticated
            // if (player.authenticated) {
            //   Cookies.set("postrational-username", "TEST NAME", { expires: 7 })
            //   localUserName.set("TEST NAME")
            //   // localUserAuthenticated.set(true)
            //   loadData(QUERY.AUTH_USER_INFO, {
            //     username: player.discourseName,
            //   })
            //     .then(info => {
            //       authenticatedUserInformation.set(info)
            //     })
            //     .catch(err => {
            //       console.log(err)
            //     })
            //   // __ Navigate based on URL paramters passed
            //   // __ before going through authenticateion
            //   let returnPath = "/"
            //   returnPath += returnSection ? returnSection : ""
            //   returnPath += returnSlug ? "/" + returnSlug : ""
            //   navigate(returnPath)
            // }
            // __ Loading is done
            setUIState(STATE.READY);
          }

          return player;
        };

        // __ Get a random avatar
        // console.log('!!!!!! activeAvatars', activeAvatars)
        // console.log('===> filtered', activeAvatars.filter(a => !a.notRandom))
        const randomAvatar = sample(activeAvatars.filter((a) => !a.notRandom));

        let playerObject = {};

        // if (section === "authenticate" && sso && sig) {
        //   playerObject = {
        //     sso: sso,
        //     sig: sig,
        //     uuid: $localUserUUID,
        //     tint: "0xffff00",
        //   }
        // } else {
        playerObject = {
          uuid: $localUserUUID,
          name: $localUserName,
          avatar: randomAvatar._id,
          tint: "0xff0000",
        };
        // }

        // __ Join game room
        gameClient
          .joinOrCreate("game", playerObject)
          .then((gameRoom) => {
            // ******
            // PLAYER
            // ******

            // PLAYER => REMOVE
            gameRoom.state.players.onRemove = (player, sessionId) => {
              try {
                if (get(localPlayers[sessionId], "avatar", false)) {
                  // Remove player graphics
                  playerLayer.removeChild(localPlayers[sessionId].avatar);
                  // !!! HACK
                  setTimeout(() => {
                    // Delete player object
                    // console.log('deleting player')
                    delete localPlayers[sessionId];
                    localPlayers = localPlayers;
                  }, 500);
                }
              } catch (err) {
                setUIState(STATE.ERROR, err);
                console.dir(err);
              }
            };

            // PLAYER => ADD
            gameRoom.state.players.onAdd = (player, sessionId) => {
              localPlayers[sessionId] = createPlayer(player, sessionId);
              // cull.add(localPlayers[sessionId].avatar);
              // console.dir(cull)
              // PLAYER => CHANGE
              player.onChange = (changes) => {
                // if ($localUserSessionID === sessionId) {
                // localPlayers[sessionId].carrying = player.carrying
                // __ Carrying ?
                // if (localPlayers[sessionId].carrying && intentToPickUp) {
                //   let g = emergentLayer.children.find(
                //     cs => cs.uuid === player.carrying
                //   )
                //   navigate("/projects/" + g.slug)
                //   intentToPickUp = false
                // }
                // }
                if (player.path.waypoints.length > 0) {
                  // __ Normal movement
                  moveQ[sessionId] = player.path.waypoints;
                } else {
                  // __ Teleport
                  localPlayers[sessionId].area = player.area;
                  localPlayers[sessionId].avatar.x = player.x;
                  localPlayers[sessionId].avatar.y = player.y;
                  localPlayers[sessionId].avatar.setAnimation("rest");
                  if ($localUserSessionID === sessionId) {
                    currentArea.set(localPlayers[sessionId].area);
                  }
                }
              };
            };

            // PLAYER => BANNED
            gameRoom.onMessage("banned", (message) => {
              setUIState(STATE.ERROR, "You have been banned");
            });

            // PLAYER => ILLEGAL MOVE
            gameRoom.onMessage("illegalMove", (message) => {
              const initialX = localPlayers[$localUserSessionID].avatar.x;
              // __ Vibrate avatar
              tweener
                .add(localPlayers[$localUserSessionID].avatar)
                .to(
                  {
                    x: initialX + 10,
                  },
                  0.05
                )
                .to(
                  {
                    x: initialX - 10,
                  },
                  0.1
                )
                .to(
                  {
                    x: initialX,
                  },
                  0.05
                );
              hideTarget();
            });

            // PLAYER => CLICK / TAP
            viewport.on("clicked", (e) => {
              // __ Cancel current movement
              delete moveQ[$localUserSessionID];
              hideTarget();
              // __ Start new movement
              const targetX = Math.round(e.world.x);
              const targetY = Math.round(e.world.y);
              showTarget(targetX, targetY);
              gameRoom.send("go", {
                x: targetX,
                y: targetY,
                originX: localPlayers[$localUserSessionID].avatar.x,
                originY: localPlayers[$localUserSessionID].avatar.y,
              });
            });

            // PLAYER => TOUCH END
            viewport.on("touchend", (e) => {
              // __ Convert screen coordinates to world coordinates
              const world = viewport.toWorld(e.data.global.x, e.data.global.y);
              // __ Cancel current movement
              delete moveQ[$localUserSessionID];
              hideTarget();
              // // __ Start new movement
              const targetX = Math.round(world.x);
              const targetY = Math.round(world.y);
              showTarget(targetX, targetY);
              gameRoom.send("go", {
                x: targetX,
                y: targetY,
                originX: localPlayers[$localUserSessionID].avatar.x,
                originY: localPlayers[$localUserSessionID].avatar.y,
              });
            });

            // PLAYER => TELEPORT
            teleportTo = (area) => {
              // __ Cancel current movement
              delete moveQ[$localUserSessionID];
              hideTarget();
              gameRoom.send("teleport", {
                area: area,
              });
            };

            // *******
            // MESSAGE
            // *******

            // MESSAGE => ADD
            gameRoom.state.messages.onAdd = (message) => {
              chatMessages = [...chatMessages, message];
              if ($localUserUUID == message.uuid) {
                const messageContainerEl = document.querySelector(
                  "#message-container"
                );
                if (messageContainerEl) {
                  setTimeout(() => {
                    messageContainerEl.scrollTo({
                      top: messageContainerEl.scrollHeight,
                      left: 0,
                      behavious: "smooth",
                    });
                  }, 200);
                }
              }
            };

            // MESSAGE => REMOVE
            gameRoom.onMessage("nukeMessage", (msgIdToRemove) => {
              const itemIndex = chatMessages.findIndex(
                (m) => m.msgId === msgIdToRemove
              );
              chatMessages.splice(itemIndex, 1);
              chatMessages = chatMessages;
            });

            // MESSAGE => SUBMIT
            submitChat = (event) => {
              try {
                gameRoom.send("submitChatMessage", {
                  msgId: nanoid(),
                  uuid: $localUserUUID,
                  name: localPlayers[$localUserSessionID].name,
                  username: localPlayers[$localUserSessionID].discourseName,
                  authenticated:
                    localPlayers[$localUserSessionID].authenticated,
                  text: event.detail.text,
                  room: $currentTextRoom,
                  tint: localPlayers[$localUserSessionID].tint,
                });
              } catch (err) {
                setUIState(STATE.ERROR, err);
                console.dir(err);
              }
            };

            // ************************
            // CASE STUDIES => DISABLED!
            // ************************

            // dropCaseStudy = () => {
            //   gameRoom.send("dropCaseStudy", {
            //     uuid: localPlayers[$localUserSessionID].carrying,
            //   })
            // }

            // pickUpCaseStudy = uuid => {
            //   gameRoom.send("pickUpCaseStudy", {
            //     uuid: uuid,
            //   })
            // }

            // __ Create Case Study
            // const createCaseStudy = (caseStudy, animate) => {
            //   const container = new PIXI.Container()
            //   // __ Hide if currently in a user's inventory
            //   container.visible = caseStudy.carriedBy === "" ? true : false
            //   container.uuid = caseStudy.uuid
            //   container.caseStudyId = caseStudy.caseStudyId
            //   container.name = caseStudy.name
            //   container.category = caseStudy.category || "none"
            //   container.slug = caseStudy.slug
            //   container.interactive = true
            //   container.tint = caseStudy.tint

            //   const graphics = new PIXI.Graphics()
            //   graphics.beginFill(caseStudy.tint)
            //   graphics.drawRect(0, 0, 15, 15)
            //   graphics.endFill()

            //   // __ Name graphics (shown on hover)
            //   const textSprite = new PIXI.Text(
            //     caseStudy.name,
            //     TEXT_STYLE_CASE_STUDY
            //   )
            //   const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE)
            //   txtBG.tint = 0x000000
            //   txtBG.width = textSprite.width + 10
            //   txtBG.height = textSprite.height + 10
            //   textSprite.x = 5
            //   textSprite.y = 5
            //   const textContainer = new PIXI.Container()
            //   textContainer.addChild(txtBG, textSprite)
            //   textContainer.name = "text"

            //   container.x = caseStudy.x
            //   container.y = animate ? 0 : caseStudy.y

            //   container.addChild(graphics)

            //   // __ Animate in with bounce
            //   if (animate) {
            //     tweener
            //       .add(container)
            //       .to({ y: caseStudy.y }, 3, Tweener.ease.bounceOut)
            //   }

            //   const onDown = e => {
            //     // __ Make user drop case study if carrying, to allow picking up new one
            //     if (
            //       localPlayers[$localUserSessionID].carrying &&
            //       localPlayers[$localUserSessionID].carrying.length > 0
            //     ) {
            //       gameRoom.send("dropCaseStudy", {
            //         uuid: localPlayers[$localUserSessionID].carrying,
            //       })
            //     }

            //     // __ Move towards clicked case study
            //     // __ and indicate that it should be picked up once reached
            //     const g = emergentLayer.children.find(
            //       cs => cs.uuid === caseStudy.uuid
            //     )
            //     if (g) {
            //       intentToPickUp = caseStudy.uuid
            //       gameRoom.send("go", {
            //         x: g.x,
            //         y: g.y,
            //         originX: localPlayers[$localUserSessionID].avatar.x,
            //         originY: localPlayers[$localUserSessionID].avatar.y,
            //       })
            //     }
            //     e.stopPropagation()
            //   }

            //   const onEnter = () => {
            //     gameContainer.style.cursor = "pointer"
            //     textContainer.y =
            //       container.y + container.height / 2 - textContainer.height / 2
            //     textContainer.x =
            //       container.x - textContainer.width / 2 + container.width / 2
            //     playerLayer.addChild(textContainer)
            //   }

            //   const onLeave = e => {
            //     gameContainer.style.cursor = "crosshair"
            //     playerLayer.removeChild(textContainer)
            //   }

            //   container.on("mousedown", onDown)
            //   container.on("touchstart", onDown)
            //   container.on("mouseover", onEnter)
            //   container.on("mouseout", onLeave)

            //   emergentLayer.addChild(container)
            // }

            // CASE STUDY => ADD
            // gameRoom.state.caseStudies.onAdd = (caseStudy, sessionId) => {
            //   // console.log('loadingTimestamp', loadingTimestamp)
            //   // console.log('caseStudy.timestamp', caseStudy.timestamp)
            //   if (get(caseStudy, "timestamp", Date.now()) > loadingTimestamp) {
            //     createCaseStudy(caseStudy, true)
            //   } else {
            //     createCaseStudy(caseStudy, false)
            //   }
            //   // CASE STUDY => CHANGE
            //   caseStudy.onChange = changes => {
            //     const g = emergentLayer.children.find(
            //       cs => cs.uuid === caseStudy.uuid
            //     )
            //     if (g) {
            //       // __ Darken color one step
            //       g.children[0].tint = TINTMAP[caseStudy.age - 1]
            //       // __ Update position if not currently in a user's inventory
            //       if (caseStudy.carriedBy === "") {
            //         g.x = caseStudy.x
            //         g.y = caseStudy.y
            //         g.visible = true
            //       } else {
            //         g.visible = false
            //       }
            //     }
            //   }
            // }

            // CASE STUDY => REMOVE
            // gameRoom.state.caseStudies.onRemove = (caseStudy, sessionId) => {
            //   // !! TODO: PROPERLY REMOVE CASE STUDY
            // }

            // ******************************
            // CLIENT LEFT / WAS DISCONNECTED
            // ******************************
            gameRoom.onLeave((code) => {
              const exitMsg = "Disconnected from server. Code: " + code;
              // console.log(exitMsg);
              // __ Show notification of disconnection
              setUIState(STATE.DISCONNECTED);
              disconnectionCode = code;
              reconnectionAttempts = 1;
              // TODO: Try to reconnect
              const reconnect = (i) => {
                console.log(
                  "Trying to reconnect user:",
                  $localUserSessionID,
                  "....",
                  i
                );
                gameClient
                  .reconnect("game", $localUserSessionID)
                  .then((room) => {
                    // __ Successfully reconnected
                    setUIState(STATE.READY);
                  })
                  .catch((e) => {
                    console.error("join error", e);
                  });
                //   setInterval(() => {
                //   reconnectionAttempts++
                // }, 5000)
              };
              reconnect(1);
            });

            // ************************
            // GENERAL ERROR HANDLING
            // ************************
            gameRoom.onError((code, message) => {
              setUIState(STATE.ERROR, message);
              console.error("Gameserver error:", message);
            });
          })
          .catch((e) => {
            console.dir(e);
            if (e.code == 4215) {
              setUIState(STATE.ERROR, "You have been banned");
            } else {
              setUIState(STATE.ERROR, "FAILED TO CONNECT TO GAMESERVER");
            }
          });
      });

      // __ Add exhibition (static) case studies
      caseStudies.then((caseStudies) => {
        caseStudies
          .filter((cs) => cs._type === "caseStudyExhibition")
          .forEach((cs, i) => {
            const spriteUrl = get(cs, "spriteLink.spriteJsonURL", "");
            const spriteId = "caseStudy-" + cs._id;
            const csLoader = new PIXI.Loader();
            csLoader.add(spriteId, spriteUrl).load((loader, resources) => {
              const frames = new PIXI.AnimatedSprite(
                resources[spriteId].spritesheet.animations["frames"]
              );
              frames.animationSpeed = 0.02;
              frames.play();

              // __ Name graphics (shown on hover)
              const textSprite = new PIXI.Text(cs.title, TEXT_STYLE_CASE_STUDY);
              const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE);
              txtBG.tint = 0x000000;
              txtBG.width = textSprite.width + 10;
              txtBG.height = textSprite.height + 10;
              textSprite.x = 5;
              textSprite.y = 5;
              const textContainer = new PIXI.Container();
              textContainer.addChild(txtBG, textSprite);
              textContainer.name = "text";

              const caseStudyLocation = new PIXI.Container();
              caseStudyLocation.addChild(frames);
              caseStudyLocation.x = cs.x;
              caseStudyLocation.y = cs.y;
              caseStudyLocation.pivot.x = caseStudyLocation.width / 2;
              caseStudyLocation.pivot.y = caseStudyLocation.height / 2;
              caseStudyLocation.title = cs.title;
              caseStudyLocation.interactive = true;

              const onDown = (e) => {
                navigate("/projects/" + get(cs, "slug.current", false));
                e.stopPropagation();
              };

              const onEnter = (e) => {
                gameContainer.style.cursor = "pointer";
                textContainer.y =
                  caseStudyLocation.height / 2 - textContainer.height / 2;
                textContainer.x =
                  -(textContainer.width / 2) + caseStudyLocation.width / 2;
                caseStudyLocation.addChild(textContainer);
              };

              const onLeave = (e) => {
                gameContainer.style.cursor = "crosshair";
                caseStudyLocation.removeChild(textContainer);
              };

              caseStudyLocation.on("mousedown", onDown);
              caseStudyLocation.on("touchstart", onDown);
              caseStudyLocation.on("mouseover", onEnter);
              caseStudyLocation.on("mouseout", onLeave);

              exhibitionLayer.addChild(caseStudyLocation);
            });
          });
      });

      // __ Add audio installations
      audioInstallations.then((audioInstallations) => {
        audioInstallations.forEach((ai, i) => {
          const effectiveRadius = ai.radius || 400;
          const audioInstallationLocation = new PIXI.Container();
          // const aIgfx = new PIXI.Graphics()
          // aIgfx.beginFill(0xff0000)
          // aIgfx.alpha = 0.4
          // aIgfx.drawCircle(effectiveRadius, effectiveRadius, effectiveRadius)
          // aIgfx.endFill()
          // audioInstallationLocation.addChild(aIgfx)

          // __ Either load stream URL or audio file
          if (ai.streamURL) {
            audioInstallationLocation.audio = new Howl({
              src: ai.streamURL,
              html5: true,
              format: ["mp3", "aac"],
            });
          } else {
            audioInstallationLocation.audio = new Howl({
              src: [ai.audioURL],
              loop: true,
            });
          }

          audioInstallationLocation.x = ai.x;
          audioInstallationLocation.y = ai.y;
          audioInstallationLocation.pivot.x =
            audioInstallationLocation.width / 2;
          audioInstallationLocation.pivot.y =
            audioInstallationLocation.height / 2;
          audioInstallationLocation.title = ai.title;
          audioInstallationLocation.noAutoplay = ai.noAutoplay;
          audioInstallationLocation.slug = get(ai, "slug.current");
          audioInstallationLocation.radius = effectiveRadius;
          audioInstallationLocation.interactive = false;

          audioInstallationLayer.addChild(audioInstallationLocation);
        });
      });

      // __ Add landmarks
      landMarks.then((landMarks) => {
        landMarks.forEach((lm, i) => {
          const spriteUrl = get(lm, "spriteJsonURL", "");
          const spriteId = "landMark-" + lm._id;
          const lmLoader = new PIXI.Loader();

          lmLoader.add(spriteId, spriteUrl).load((loader, resources) => {
            const frames = new PIXI.AnimatedSprite(
              resources[spriteId].spritesheet.animations["frames"]
            );
            // frames.visible = true
            frames.animationSpeed = 0.02;
            frames.play();

            const landMarkLocation = new PIXI.Container();
            landMarkLocation.addChild(frames);
            landMarkLocation.x = lm.x;
            landMarkLocation.y = lm.y;
            landMarkLocation.pivot.x = landMarkLocation.width / 2;
            landMarkLocation.pivot.y = landMarkLocation.height / 2;
            landMarkLayer.addChild(landMarkLocation);
          });
        });
      });
    });
  };

  const getResponsiveWidth = () =>
    window.matchMedia("(max-width: 800px)").matches || sidebarHidden
      ? window.innerWidth
      : window.innerWidth - 400;

  onMount(async () => {
    // ___ Set Global scale mode to hard edges
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // ___ Create Pixi App
    app = new PIXI.Application({
      width: MAP.WIDTH,
      height: MAP.HEIGHT,
      resolution: 1,
    });

    // __ Create Pixi Viewport
    viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: MAP.WIDTH,
      worldHeight: MAP.HEIGHT,
      interaction: app.renderer.plugins.interaction,
    });
    app.stage.addChild(viewport);

    // ___ Create and add layers
    // (1) => Map
    // (2) => Audio Installations
    // (3) => Exhibition/static case studies
    // (4) => Emergent/mobil case studies
    // (5) => Players
    // (6) => Landmarks
    mapLayer = new PIXI.Container();
    // emergentLayer = new PIXI.Container()
    exhibitionLayer = new PIXI.Container();
    audioInstallationLayer = new PIXI.Container();
    playerLayer = new PIXI.Container();
    landMarkLayer = new PIXI.Container();
    viewport.addChild(mapLayer);
    viewport.addChild(audioInstallationLayer);
    viewport.addChild(exhibitionLayer);
    // viewport.addChild(emergentLayer)
    viewport.addChild(playerLayer);
    viewport.addChild(landMarkLayer);
    // viewport.drag()

    // ___ Start Pixi ticker
    ticker = PIXI.Ticker.shared;
    ticker.start();
    ticker.add(updatePositions);

    // __ Add pixi view to DOM
    gameContainer.appendChild(app.view);

    window.onresize = () => {
      const responsiveWidth = getResponsiveWidth();
      viewport.resize(responsiveWidth, window.innerHeight);
      app.renderer.resize(responsiveWidth, window.innerHeight);
    };
    window.dispatchEvent(new Event("resize"));

    // ___ Give the local user a UUID
    localUserUUID.set(nanoid());

    // __ Redirect to authentication if user is marked as logged in
    const usernameCookie = Cookies.get("postrational-username");
    console.log("usernameCookie", usernameCookie);
    if (!usernameCookie) {
      // ___ Prompt user to enter name
      setUIState(STATE.SETUSERNAME);
    } else {
      // ___ Set username from cookie
      localUserName.set(usernameCookie);
      // ___ Show welcome card if user has not visited in last 7 days
      // showWelcomeCard = Cookies.get("postrational-visitor") ? false : true;
      showWelcomeCard = false
      Cookies.set("postrational-visitor", "true", { expires: 7 });
      // __ Start the game...
      initializeGameWorld();
    }
  });
</script>

<style lang="scss">
  @import "./variables.scss";

  * {
    box-sizing: border-box;
    font-family: $MONO_STACK;
  }

  .inventory {
    position: fixed;
    width: auto;
    max-width: 50vw;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 1.4em;
    text-align: center;
    bottom: $SPACE_S;
    left: $SPACE_S;
    padding: $SPACE_S;
    border-radius: $border_radius;
    font-size: $FONT_SIZE_BASE;
    cursor: pointer;
    padding-left: $SPACE_M;
    padding-right: $SPACE_M;
    user-select: none;

    @include screen-size("small") {
      bottom: 60px;
      left: $SPACE_S;
      width: calc(100vw - #{$SPACE_L});
      max-width: calc(100vw - #{$SPACE_L});
      z-index: 10;
    }
  }

  .audiochat-box {
    position: fixed;
    width: auto;
    background: $COLOR_LIGHT;
    height: 41px;
    text-align: center;
    top: $SPACE_S;
    left: $SPACE_S;
    padding: $SPACE_S;
    border-radius: $border_radius;
    font-size: $FONT_SIZE_BASE;
    display: flex;

    padding-left: $SPACE_M;
    padding-right: $SPACE_M;

    user-select: none;

    @include screen-size("small") {
      top: unset;
      bottom: calc(25vh + 60px);
      left: unset;
      right: $SPACE_S;
      max-width: calc(100vw - 20px);
    }

    .message {
      margin-right: $SPACE_S;
      @include screen-size("small") {
        display: none;
      }
    }

    .mob-message {
      display: none;
      font-size: $FONT_SIZE_SMALL;
      align-items: center;
      // color: $COLOR_MID_2;
      svg {
        margin-left: $SPACE_S;
        fill: $COLOR_DARK;
      }
      @include screen-size("small") {
        display: flex;
      }
    }

    .button {
      text-transform: uppercase;
      font-weight: bold;
      // letter-spacing: 0.05em;
      padding: 4px $SPACE_M 2px $SPACE_M;
      display: inline-table;
      position: relative;
      top: -3px;

      border: 1px solid $COLOR_MID_2;
      color: $COLOR_MID_2;
      font-size: $FONT_SIZE_SMALL;
      // transform: translate(4px, -4px);

      border-radius: $border_radius;
      text-align: center;

      &:hover {
        border: 1px solid $COLOR_DARK;
        color: $COLOR_DARK;
        cursor: pointer;
      }

      @include screen-size("small") {
        display: none;
      }
    }
  }

  .game {
    width: calc(100vw - 400px);
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    opacity: 1;
    transition: opacity 1s ease-out;

    @include screen-size("small") {
      width: 100vw;
      right: 0;
    }

    &.expanded {
      width: 100vw;
    }

    &.disabled {
      opacity: 0.3;
      pointer-events: none;
    }
  }

  .hide-button {
    font-family: "IBM Plex Sans", sans-serif;
    position: fixed;
    top: $SPACE_S;
    right: 350px;
    width: 40px;
    height: 40px;
    line-height: 36px;
    font-size: 22px;
    text-align: center;
    border-radius: $border_radius;
    color: $COLOR_MID_2;
    background: $COLOR_LIGHT;
    user-select: none;
    cursor: pointer;
    transition: background 0.3s $transition;
    z-index: 1000;

    &:hover {
      background: $COLOR_MID_1;
    }
    @include screen-size("small") {
      display: none;
    }
  }

  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: $SIDEBAR_WIDTH;
    height: 100vh;
    padding: 0;
    overflow: hidden;
    z-index: 100;
    transform: translateX(0);
    transition: transform 0.5s $transition;

    @include screen-size("small") {
      width: 100vw;
    }

    .minimap {
      background: black;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;

      @include screen-size("small") {
        display: none;
      }
    }

    .middle-section {
      height: calc(100% - 240px);

      .top-area {
        position: relative;
        height: 50%;
        width: 100%;
        overflow: hidden;
      }

      .bottom-area {
        background: $COLOR_DARK;
        height: calc(50% - 50px);
        @include hide-scroll;
      }

      .toolbar {
        width: 100%;
        height: 50px;
        z-index: 1000;
        background: $COLOR_DARK;
      }

      @include screen-size("small") {
        display: none;
      }
    }

    .menu {
      height: 40px;
    }

    &.hidden {
      transform: translateX(360px);
      cursor: pointer;
    }
  }

  .main-content-slot {
    position: absolute;
    top: 0;
    right: calc(#{$SIDEBAR_WIDTH} + #{$SPACE_S});
    width: 500px;
    max-width: calc(100vw - (#{$SIDEBAR_WIDTH} + #{$SPACE_L}));
    max-height: 100vh;
    z-index: 100;
    overflow-y: auto;
    font-size: $FONT_SIZE_BASE;
    color: $COLOR_DARK;
    transition: transform 0.5s $transition;

    &.pushed {
      transform: translatex(360px);
    }

    @include hide-scroll;

    @include screen-size("small") {
      position: fixed;
      bottom: unset;
      top: 80px;
      right: unset;
      left: 0;
      max-width: unset;
      width: 100vw;
      max-height: calc(100% - 130px);
    }

    transition: transform 0.3s ease-out;

    .content-item {
      width: 100%;
      background: $COLOR_LIGHT;
      z-index: 100;
      font-size: $FONT_SIZE_BASE;
      color: $COLOR_DARK;
      position: relative;
      margin-bottom: $SPACE_S;
      margin-top: $SPACE_S;

      @include hide-scroll;

      @include screen-size("small") {
        margin-bottom: 0;
        margin-top: 0;

        &.passive {
          min-height: 100vh;
        }
      }

      .close {
        margin-bottom: 20px;
        position: absolute;
        top: 2px;
        right: $SPACE_XS;
        // font-size: 38px;
        fill: $COLOR_MID_2;
        cursor: pointer;
        text-decoration: none;
        transition: color 0.3s $transition;
        z-index: 5;

        &:hover {
          // transform: scale(1.1);
          color: $COLOR_MID_3;
        }
      }

      transition: transform 0.3s ease-out;
    }
  }

  .mobile-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    z-index: 1000;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  }

  .mobile-toolkit {
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.6054796918767507) 0%,
      rgba(0, 0, 0, 0) 100%
    );
    position: fixed;
    bottom: 50px;
    left: 0;
    width: 100%;
    height: 25vh;
    z-index: 10;
    pointer-events: none;

    transition: height 250ms $transition;

    .toolbar {
      height: 40px;
      padding-bottom: $SPACE_XS;
      pointer-events: all;
    }

    &.expanded {
      transition: height 250ms $transition;
      pointer-events: all;
      background: $COLOR_DARK_OPACITY;
      height: 50%;
      box-shadow: 0 0 15px 15px $COLOR_DARK_OPACITY;
      .toolbar {
        background: transparent;
      }
    }

    .close {
      position: fixed;
      bottom: calc(50% + 15px);
      right: $SPACE_S;
      font-size: 38px;
      fill: $COLOR_MID_2;
      color: $COLOR_MID_2;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s $transition;
      z-index: 10000;

      &:hover {
        fill: $COLOR_MID_3;
      }
    }
  }

  .mobile-calendar {
    position: fixed;
    background: $COLOR_LIGHT;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    z-index: 1000;
    overflow-x: auto;
    @include hide-scroll;
    border-bottom: 1px solid $COLOR_MID_1;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  }

  .tutorial-wrap-outer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    // backdrop-filter:blur(2px);
    z-index: 100000;

    .background-hittable {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      cursor: pointer;
      z-index: -99;
    }
  }

  // .debug {
  //   position: fixed;
  //   bottom: $SPACE_S;
  //   right: 420px;
  //   padding: $SPACE_S;
  //   font-size: 8px;
  // }

  .link-to-ac {
    font-family: $MONO_STACK;
    font-size: $FONT_SIZE_SMALL;
    background: $COLOR_DARK_OPACITY;
    color: $COLOR_MID_1;
    z-index: 1001;
    position: absolute;
    top: 170px;
    right: 0;
    padding: $SPACE_XS;
    // word-spacing: -0.3em;

    a {
      color: white;
      &:hover {
        text-decoration: none;
      }
    }

    @include screen-size("small") {
      background: transparent;
      top: 80px;
      right: unset;
      left: 0;
      z-index: 1;
    }
  }
</style>

<!-- <MetaData /> -->
<!-- Show default if not in special section -->
<!-- {#if !['projects', 'profiles', 'profiles', 'events', 'pages'].includes(section) && !inAudioZone}
  <MetaData />
{/if} -->

<!-- SIDEBAR -->
<!-- Show on desktop only -->
<MediaQuery query="(min-width: 800px)" let:matches>
  {#if matches}
    {#if localPlayers[$localUserSessionID]}
      {#if !sidebarHidden}
        <div
          class="hide-button"
          in:scale={{ delay: 500 }}
          on:click={() => {
            sidebarHidden = !sidebarHidden;
            window.dispatchEvent(new Event('resize'));
          }}>
          »
        </div>
      {/if}
      <div
        class="sidebar"
        use:links
        class:hidden={sidebarHidden}
        on:click={() => {
          if (sidebarHidden) {
            sidebarHidden = false;
            window.dispatchEvent(new Event('resize'));
          }
        }}>
        <!-- MINIMAP -->
        <div class="clock">
          <Clock />
        </div>
        <!-- <div class="link-to-ac">
          <a href="http://pohflepp.de/" target="_blank">to Sascha's website</a>
        </div> -->
        <div class="minimap">
          <MiniMap {miniImage} player={localPlayers[$localUserSessionID]} />
        </div>
        <div class="middle-section">
          <div class="top-area">
            <!-- CALENDAR -->
            {#await events then events}
              {#await exhibitions then exhibitions}
                <EventList
                  {events}
                  {exhibitions}
                  showArchived={get($globalSettings, 'showArchived', false)} />
              {/await}
            {/await}
          </div>
          <div class="bottom-area">
            <!-- {#if section == 'seminar'} -->
            <!-- SEMINAR -->
            <!-- <Seminar {slug} /> -->
            <!-- {:else if section == 'messages'} -->
            <!-- MESSAGES -->
            <!-- <Messaging {slug} />
            {:else} -->
            <!-- CHAT -->
            {#each TEXT_ROOMS as TR}
              {#if $currentTextRoom === TR}
                <Chat
                  chatMessages={chatMessages.filter((m) => m.room === TR || m.directed)}
                  currentRoom={TR} />
              {/if}
            {/each}
            <!-- {/if} -->
            <!-- TOOLBAR-->
            <div class="toolbar">
              <ToolBar
                {section}
                on:submit={submitChat}
                on:teleport={(e) => {
                  // __ Cancel current movement
                  delete moveQ[$localUserSessionID];
                  hideTarget();
                  teleportTo($currentArea === 5 ? 'green' : 'blue');
                }} />
            </div>
          </div>
        </div>
        <!-- MENUBAR -->
        <div class="menu">
          <Menu
            on:username={(e) => {
              Cookies.remove('postrational-username');
              window.location = '/';
            }} />
        </div>
      </div>
    {/if}
  {/if}
</MediaQuery>

<!-- GAME WORLD -->
<div
  class="game"
  class:disabled={UI.state == STATE.DISCONNECTED}
  class:expanded={sidebarHidden}
  bind:this={gameContainer} />

<!-- MAIN CONTENT -->
<div class="main-content-slot" class:pushed={sidebarHidden}>
  <!-- INFORMATION BOX -->
  {#if get($currentAreaObject, 'informationCard', false) && !closedAreaCards.includes($currentAreaObject.areaIndex)}
    <div class="content-item active" transition:fly={{ y: -200 }}>
      <div
        class="close"
        on:click={(e) => {
          closedAreaCards.push($currentAreaObject.areaIndex);
          closedAreaCards = closedAreaCards;
        }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M28.9 11.1C28.6 10.8 28.2 10.8 27.9 11.1L20 19L12.1 11.1C11.8 10.8 11.4 10.8 11.1 11.1C10.8 11.4 10.8 11.8 11.1 12.1L19 20L11.1 27.9C10.8 28.2 10.8 28.6 11.1 28.9C11.4 29.2 11.8 29.2 12.1 28.9L20 21L27.9 28.9C28.2 29.2 28.6 29.2 28.9 28.9C29.2 28.6 29.2 28.2 28.9 27.9L21 20L28.9 12.1C29.2 11.8 29.2 11.4 28.9 11.1Z" />
        </svg>
      </div>
      <Card card={$currentAreaObject.informationCard} />
    </div>
  {/if}

  <!-- AUDIOZONE -->
  {#if inAudioZone}
    <div class="content-item active" transition:fly={{ y: -200 }}>
      {#await audioInstallations then audioInstallations}
        <AudioInstallationSingle
          {audioInstallationLayer}
          audioInstallation={audioInstallations.find((aI) => aI.slug.current === inAudioZone)} />
      {/await}
    </div>
  {/if}

  <!-- LIVE -->
  {#await activeStreams then activeStreams}
    <!-- MAIN AREA -->
    {#if $currentVideoRoom == 'main' && currentStreamUrl && !activeContentClosed && $localUserName}
      <div class="content-item active" transition:fly={{ y: -200 }}>
        <LiveSingle event={currentStreamEvent} url={currentStreamUrl} />
      </div>
    {/if}
    <!-- SUPPORT AREA -->
    <!-- {#if $currentVideoRoom == 'support' && supportStreamUrl && !supportStreamClosed}
      <div class="content-item active" transition:fly={{ y: -200 }}>
        <div
          class="close"
          on:click={e => {
            supportStreamClosed = true
          }}>
          <svg width="40" height="40" viewBox="0 0 40 40"  xmlns="http://www.w3.org/2000/svg">
            <path d="M28.9 11.1C28.6 10.8 28.2 10.8 27.9 11.1L20 19L12.1 11.1C11.8 10.8 11.4 10.8 11.1 11.1C10.8 11.4 10.8 11.8 11.1 12.1L19 20L11.1 27.9C10.8 28.2 10.8 28.6 11.1 28.9C11.4 29.2 11.8 29.2 12.1 28.9L20 21L27.9 28.9C28.2 29.2 28.6 29.2 28.9 28.9C29.2 28.6 29.2 28.2 28.9 27.9L21 20L28.9 12.1C29.2 11.8 29.2 11.4 28.9 11.1Z" />
            </svg>
            
        </div>
        <LiveSingle url={supportStreamUrl} />
      </div>
    {/if} -->
  {/await}

  <!-- TEXT CONTENT -->
  {#if ['projects', 'profiles', 'profiles', 'events', 'pages'].includes(section)}
    <div
      class="content-item passive"
      class:pushed={!activeContentClosed}
      use:links
      transition:fly={{ y: 200, duration: 400, easing: quartOut }}>
      <a class="close" href="/">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M28.9 11.1C28.6 10.8 28.2 10.8 27.9 11.1L20 19L12.1 11.1C11.8 10.8 11.4 10.8 11.1 11.1C10.8 11.4 10.8 11.8 11.1 12.1L19 20L11.1 27.9C10.8 28.2 10.8 28.6 11.1 28.9C11.4 29.2 11.8 29.2 12.1 28.9L20 21L27.9 28.9C28.2 29.2 28.6 29.2 28.9 28.9C29.2 28.6 29.2 28.2 28.9 27.9L21 20L28.9 12.1C29.2 11.8 29.2 11.4 28.9 11.1Z" />
        </svg>
      </a>
      <!-- CASE STUDIES -->
      {#await caseStudies then caseStudies}
        {#if section === 'projects'}
          {#if slug}
            <!-- SINGLE CASE STUDY -->
            <CaseStudySingle
              caseStudy={caseStudies.find((cs) => cs.slug.current === slug)} />
          {:else}
            <!-- LIST CASE STUDY -->
            <CaseStudyList {caseStudies} />
          {/if}
        {/if}
      {/await}
      <!-- USERS -->
      {#await users then users}
        {#if section == 'profiles' && slug}
          <!-- SINGLE PROFILE -->
          <UserProfileSingle
            user={users.find((u) => get(u, 'slug.current', '') === slug)} />
        {/if}
      {/await}
      <!-- EVENTS -->
      {#await events then events}
        {#await exhibitions then exhibitions}
          {#if section === 'events'}
            {#if slug}
              <!-- SINGLE EVENT -->
              <EventSingle
                event={events.find((ev) => ev.slug.current === slug)} />
            {:else}
              <!-- LIST EVENTS -->
              <EventListFull {events} {exhibitions} />
            {/if}
          {/if}
        {/await}
      {/await}
      <!-- PAGES -->
      {#await pages then pages}
        {#if section == 'pages' && slug}
          <!-- SINGLE PAGE -->
          <PageSingle
            page={pages.find((p) => get(p, 'slug.current', '') === slug)} />
        {/if}
      {/await}
    </div>
  {/if}
</div>

<!-- MOBILE -->
<MediaQuery query="(max-width: 800px)" let:matches>
  {#if matches}
    <Clock />

    <div class="link-to-ac"></div>

    {#if localPlayers[$localUserSessionID]}
      <!-- MOBILE CALENDAR-->
      <div class="mobile-calendar" use:links>
        {#await events then events}
          <EventListSliderMobile {events} />
        {/await}
      </div>
      <!-- MOBILE TOOLKIT -->
      {#if !audioChatActive}
        <div
          class="mobile-toolkit"
          use:links
          class:expanded={mobileExpanded}
          on:click={(e) => {
            if ((!mobileExpanded && e.target.nodeName == 'INPUT') || e.target.classList.contains('toolbar-item')) {
              mobileExpanded = true;
            }
          }}>
          {#if mobileExpanded}
            <div
              class="close"
              on:click={(e) => {
                mobileExpanded = false;
                e.stopPropagation();
                navigate('/');
              }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M28.9 11.1C28.6 10.8 28.2 10.8 27.9 11.1L20 19L12.1 11.1C11.8 10.8 11.4 10.8 11.1 11.1C10.8 11.4 10.8 11.8 11.1 12.1L19 20L11.1 27.9C10.8 28.2 10.8 28.6 11.1 28.9C11.4 29.2 11.8 29.2 12.1 28.9L20 21L27.9 28.9C28.2 29.2 28.6 29.2 28.9 28.9C29.2 28.6 29.2 28.2 28.9 27.9L21 20L28.9 12.1C29.2 11.8 29.2 11.4 28.9 11.1Z" />
              </svg>
            </div>
          {/if}
          <!-- {#if section == 'seminar'} -->
          <!-- SEMINAR -->
          <!-- <Seminar {slug} mobile={true} {mobileExpanded} /> -->
          <!-- {:else if section == 'messages'} -->
          <!-- MESSAGES -->
          <!-- <Messaging {slug} mobile={true} {mobileExpanded} />
          {:else} -->
          <!-- CHAT -->
          {#each TEXT_ROOMS as TR}
            {#if $currentTextRoom === TR}
              <Chat
                chatMessages={chatMessages.filter((m) => m.room === TR || m.directed)}
                currentRoom={TR}
                mobile={true}
                {mobileExpanded} />
            {/if}
          {/each}
          <!-- {/if} -->
          <!-- TOOLBAR-->
          <div class="toolbar">
            <ToolBar
              {section}
              mobile={true}
              {mobileExpanded}
              on:submit={submitChat}
              on:teleport={(e) => {
                if (localPlayers[$localUserSessionID].area === 5) {
                  teleportTo('green');
                } else {
                  teleportTo('blue');
                }
              }} />
          </div>
        </div>
      {/if}
      <!-- MOBILE MENU-->
      <div class="mobile-menu" use:links>
        <Menu />
      </div>
    {/if}
  {/if}
</MediaQuery>

<!-- INVENTORY => DISABLED!
{#if localPlayers && localPlayers[$localUserSessionID] && localPlayers[$localUserSessionID].carrying}
  <div
    class="inventory"
    transition:fly={{ y: 100, duration: 300 }}
    on:click={e => {
      // if (e.target.nodeName == 'SPAN') {
      //   dropCaseStudy(localPlayers[$localUserSessionID].carrying)
      // }
    }}>
    <div>
      <InventoryMessage
        caseStudy={emergentLayer.children.find(cs => cs.uuid === localPlayers[$localUserSessionID].carrying)} />
    </div>
  </div>
{/if} -->

<!-- AUDIOCHAT BOX  -->
{#await audioRoomNames then audioRoomNames}
  <!-- $localUserAuthenticated &&  -->
  {#if !audioChatActive && $currentAudioRoom && $localUserName}
    <div class="audiochat-box">
      <div class="message">
        <strong>{get(audioRoomNames, 'audioRoom_' + $currentAudioRoom, 'ERROR')}</strong>
      </div>

      <div
        class="mob-message"
        on:click={(e) => {
          audioChatActive = true;
        }}>
        Join Audio
        <svg
          width="23"
          height="20"
          viewBox="0 0 23 20"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7.3672 11.4041C8.52696 11.4041 9.49643 11.019 10.2756 10.2489C11.0549 9.47872 11.4445 8.51378 11.4445 7.35402C11.4445 6.19426 11.0549 5.22932 10.2756 4.45917C9.49643 3.68902 8.52696 3.30395 7.3672 3.30395C6.20745 3.30395 5.24251 3.68902 4.47235 4.45917C3.7022 5.22932 3.31713 6.19426 3.31713 7.35402C3.31713 8.51378 3.7022 9.47872 4.47235 10.2489C5.24251 11.019 6.20745 11.4041 7.3672 11.4041ZM8.53602 12.5185H6.22557C5.42824 12.5185 4.67622 12.6635 3.96949 12.9534C3.26277 13.2615 2.64665 13.6783 2.12114 14.2038C1.59562 14.7293 1.17884 15.3454 0.87078 16.0522C0.56272 16.7589 0.408691 17.5109 0.408691 18.3082V19.4771H14.3257V18.3082C14.3257 17.5109 14.1807 16.7589 13.8908 16.0522C13.5827 15.3454 13.166 14.7293 12.6405 14.2038C12.1149 13.6783 11.4988 13.2615 10.7921 12.9534C10.0854 12.6635 9.33335 12.5185 8.53602 12.5185ZM19.4087 0.477051L17.7506 2.13513C18.5117 2.89622 19.1006 3.77056 19.5174 4.75817C19.9342 5.74577 20.1426 6.7832 20.1426 7.87047C20.1426 8.95774 19.9342 9.99517 19.5174 10.9828C19.1006 11.9704 18.5117 12.8447 17.7506 13.6058L19.4087 15.2639C20.3872 14.2672 21.1393 13.1347 21.6648 11.8662C22.1903 10.5977 22.453 9.2658 22.453 7.87047C22.453 6.47514 22.1903 5.14325 21.6648 3.87476C21.1393 2.60628 20.3872 1.47372 19.4087 0.477051ZM16.1197 3.76603L14.4616 5.42412C14.8059 5.7503 15.0642 6.12178 15.2363 6.53857C15.4085 6.95536 15.4945 7.39932 15.4945 7.87047C15.4945 8.34162 15.4085 8.78558 15.2363 9.20237C15.0642 9.61916 14.8059 9.99064 14.4616 10.3168L16.1197 11.9749C16.6633 11.4313 17.0801 10.8061 17.3701 10.0994C17.66 9.39264 17.805 8.64968 17.805 7.87047C17.805 7.09126 17.66 6.3483 17.3701 5.64157C17.0801 4.93484 16.6633 4.30967 16.1197 3.76603Z" />
        </svg>
        <!-- <svg width="15" height="20" viewBox="0 0 15 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.9383 9.48148H14.716C14.716 11.2593 14.0988 12.8148 12.8642 14.1481C11.6296 15.4815 10.1399 16.2798 8.39506 16.5432V20H6.32099V16.5432C4.57612 16.2798 3.08643 15.4815 1.85185 14.1481C0.617278 12.8148 0 11.2593 0 9.48148H1.77778C1.77778 11.0288 2.32921 12.3128 3.4321 13.3333C4.53498 14.3539 5.84361 14.8642 7.35802 14.8642C8.87244 14.8642 10.1811 14.3539 11.284 13.3333C12.3868 12.3128 12.9383 11.0288 12.9383 9.48148ZM9.58025 11.7037C8.95473 12.3292 8.214 12.642 7.35802 12.642C6.50205 12.642 5.76132 12.3292 5.1358 11.7037C4.51028 11.0782 4.19753 10.3375 4.19753 9.48148V3.16049C4.19753 2.30452 4.51028 1.56379 5.1358 0.938271C5.76132 0.312754 6.50205 0 7.35802 0C8.214 0 8.95473 0.312754 9.58025 0.938271C10.2058 1.56379 10.5185 2.30452 10.5185 3.16049V9.48148C10.5185 10.3375 10.2058 11.0782 9.58025 11.7037Z" />
        </svg>           -->
      </div>

      <div
        class="button"
        on:click={(e) => {
          audioChatActive = true;
        }}>
        Join
      </div>
    </div>
  {/if}

  <!-- AUDIO CHAT -->
  {#if audioChatActive}
    <AudioChat
      user={localPlayers[$localUserSessionID]}
      userName={$localUserName}
      roomName={get(audioRoomNames, 'audioRoom_' + $currentAudioRoom, 'ERROR')}
      roomId={$currentAudioRoom}
      on:close={(e) => {
        audioChatActive = false;
      }} />
  {/if}
{/await}

<!-- LOADING -->
{#if UI.state == STATE.LOADING}
  <LoadingScreen />
{/if}

<!-- WELCOME / TUTORIAL -->
{#if UI.state != STATE.LOADING && showWelcomeCard}
  {#await tutorialCard then tutorialCard}
    <div class="tutorial-wrap-outer" transition:fade>
      <Tutorial card={tutorialCard} bind:showWelcomeCard />
      <div
        class="background-hittable"
        on:click={(e) => {
          showWelcomeCard = false;
        }} />
    </div>
  {/await}
{/if}

<!-- ERROR -->
{#if UI.state == STATE.ERROR}
  <Error message={UI.errorMessage} />
{/if}

<!-- DISCONNECTED -->
{#if UI.state == STATE.DISCONNECTED}
  <Reconnection {reconnectionAttempts} {disconnectionCode} />
{/if}

<!-- USERNAME DIALOG -->
{#if UI.state == STATE.SETUSERNAME}
  <UsernameDialog
    on:username={(e) => {
      Cookies.set('postrational-username', e.detail.username, { expires: 7 });
      window.location = '/';
    }} />
{/if}
