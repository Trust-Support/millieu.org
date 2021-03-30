<script>
  // # # # # # # # # # # # # #
  //
  //  ERROR SCREEN
  //
  // # # # # # # # # # # # # #

  // *** PROPS
  export let message = ""
</script>

<style lang="scss">
  @import "../variables.scss";

  .error-screen {
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
      font-size: $FONT_SIZE_LARGE;
      text-align: center;
      user-select: none;
    }
  }
</style>

<div class="error-screen">
  <div class="box">
    <div class="header">ERROR: {message}</div>
  </div>
</div>
