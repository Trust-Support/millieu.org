<script>
  // # # # # # # # # # # # # #
  //
  //  Inventory Message
  //
  // # # # # # # # # # # # # #

  // *** PROPS
  export let caseStudy = ""
</script>

<style lang="scss">
  @import "./variables.scss";

  .inventory-message {
    display: flex;
    align-items: center;

    .inventory-message-inner{
      margin-right: $SPACE_S;
    }

    @include screen-size("small") {
      font-size:$FONT_SIZE_SMALL;
      align-items: baseline;
      justify-content: space-between;

      .inventory-message-inner{
        display: inline-block;
        white-space: nowrap;
        max-width: 55vw;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 0;
      }

      
    }

    .color-icon {
      height: 10px;
      width: 10px;
      margin-right: $SPACE_S;

      @include screen-size("small") {
        margin-right: 0;
      }

      &.communication {
        background: $COLOR_COMMUNICATION;
      }
      &.consensus-building {
        background: $COLOR_CONSENSUS_BUILDING;
      }
      &.sensing {
        background: $COLOR_SENSING;
      }
      &.archiving {
        background: $COLOR_ARCHIVING;
      }
    }

    .button {
      padding-left: $SPACE_M;
      padding-right: $SPACE_M;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_MID_2;
      border-radius: $border_radius;
      text-align: center;

      &:hover {
        border: 1px solid $COLOR_DARK;
        color: $COLOR_DARK;
        cursor: pointer;
      }
    }
  }
</style>

<div class="inventory-message">
  <div class="color-icon {caseStudy.category}" />
  <div class="inventory-message-inner">
    You are holding: <strong>{caseStudy.name}</strong>
  </div>
  <span class="button">DROP</span>
</div>
