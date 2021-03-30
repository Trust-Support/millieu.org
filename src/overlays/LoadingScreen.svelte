<script>
  // # # # # # # # # # # # # #
  //
  //  LOADING SCREEN
  //
  // # # # # # # # # # # # # #
</script>

<style lang="scss">
  @import "../variables.scss";

  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;

    .box {
      font-family: $MONO_STACK;
      padding: 20px;
      font-size: 18px;
      text-align: center;
      user-select: none;

      @include screen-size("small") {
        font-size: 12px;
      }
    }
  }
</style>

<div class="loading-screen">
  <div class="box"><img src="/1.gif" /></div>
</div>
