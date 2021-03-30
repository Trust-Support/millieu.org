<script>
  // # # # # # # # # # # # # #
  //
  //  New Private Message
  //
  // # # # # # # # # # # # # #

  // *** PROPS
  export let threadId = 0
  export let url = "https://work.anthropocene-curriculum.org/new-message"
  export let text = "+ New message"
</script>

<style lang="scss">
  @import "../variables.scss";

  .new-message {
    margin-bottom: $SPACE_XS;
    padding-bottom: $SPACE_XS;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;

    .header {
      cursor: pointer;
      border: 1px solid $COLOR_MID_2;
      padding: $SPACE_XS;
      padding-right: $SPACE_S;
      padding-left: $SPACE_S;
      border-radius: $border_radius;
      width: auto;
      display: inline-block;
      color: $COLOR_LIGHT;
      text-decoration: none;

      &:hover {
        border: 1px solid $COLOR_LIGHT;
      }
    }

    .inner {
      padding-bottom: $SPACE_S;
      margin-top: $SPACE_S;
      border-bottom: 1px solid $COLOR_MID_2;

      .row {
        display: inline-block;
        width: 100%;
        margin-bottom: $SPACE_XS;
      }

      .label {
        float: left;
        line-height: 30px;
        width: 30px;
      }

      input {
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_SMALL;
        float: left;
        width: 100%;
        background: $COLOR_DARK;
        border: 1px solid $COLOR_MID_2;
        color: $COLOR_LIGHT;
        border-radius: $border_radius;
        padding: $SPACE_S;
        outline: none;
        height: 30px;
        margin-right: $SPACE_S;

        &:focus {
          border: 1px solid $COLOR_LIGHT;
        }

        input[type="text"] {
          -webkit-appearance: none;
        }

        select {
          -webkit-appearance: none;
        }
      }

      textarea {
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_BASE;
        float: left;
        width: 100%;
        display: block;
        background: $COLOR_DARK;
        border: 1px solid $COLOR_MID_2;
        color: $COLOR_LIGHT;
        border-radius: $border_radius;
        padding: $SPACE_S;
        outline: none;
        resize: none;
        height: 6em;

        &:focus {
          border: 1px solid $COLOR_LIGHT;
        }
      }

      button {
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_BASE;
        width: 60px;
        display: block;
        background: $COLOR_DARK;
        border: 1px solid $COLOR_MID_2;
        color: $COLOR_LIGHT;
        border-radius: $border_radius;
        outline: none;
        cursor: pointer;
        height: 30px;
        line-height: 20px;

        &:hover {
          border: 1px solid $COLOR_LIGHT;
        }

        &.close-chat {
          width: 40px;
          margin-left: $SPACE_S;
        }
      }
    }
  }
</style>

<div class="new-message">
  <a href={url} target="_blank" class="header">{text}</a>
</div>
