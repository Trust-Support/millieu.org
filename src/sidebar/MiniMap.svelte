<script>
  // # # # # # # # # # # # # #
  //
  //  Minimap
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"

  // *** PROPS
  export let miniImage = false
  export let player = false
</script>

<style lang="scss">
  @import "../variables.scss";

  .map-container {
    height: 200px;
    width: 200px;
    position: relative;
    transform: scale(1.55);
    user-select: none;

    img {
      height: 200px;
      width: 200px;
    }

    .map-marker {
      height: 6px;
      width: 6px;
      border-radius: $border_radius;
      background: white;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
    }
  }
</style>

<div class="map-container">
  {#if miniImage}<img src={miniImage} alt="minimap" />{/if}
  {#if get(player, 'avatar.y', false) && get(player, 'avatar.x', false)}
    <div
      class="map-marker"
      style={'top: ' + Math.round(player.avatar.y / 20 - 3) + 'px; left: ' + Math.round(player.avatar.x / 20 - 3) + 'px;'} />
  {/if}
</div>
