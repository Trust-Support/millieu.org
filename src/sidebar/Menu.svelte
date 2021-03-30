<script>
  // # # # # # # # # # # # # #
  //
  //  Menu
  //
  // # # # # # # # # # # # # #
  // *** IMPORTS
  import { createEventDispatcher } from "svelte"

  // *** CONSTANTS
  const dispatch = createEventDispatcher()
</script>

<style lang="scss">
  @import "../variables.scss";

  .menu-container {
    height: 100%;
    color: $COLOR_DARK;
    font-size: $FONT_SIZE_SMALL;
    background: $COLOR_LIGHT;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    padding-left: $SPACE_S;
    padding-right: $SPACE_S;

    .menu-item {
      font-weight: bold;
      padding-right: $SPACE_L;
      float: left;
      cursor: pointer;
      color: $COLOR_DARK;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .login {
      padding-right: 0px;
      justify-self: end;
    }
  }
</style>

<div class="menu-container">
  <div>
    <a href="/projects" class="menu-item">Projects</a>
    <a href="/pages/guide" class="menu-item">Guide</a>
    <a href="/pages/about" class="menu-item">About</a>
  </div>

  <span
    on:click={e => {
      dispatch('username')
    }}
    class="menu-item login">Change name</span>
</div>
