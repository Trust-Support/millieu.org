<script>
  // # # # # # # # # # # # # #
  //
  //  Material Item
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { urlFor } from "../sanity.js"

  // *** GLOBAL
  import { FORMATMAP } from "../global.js"

  // *** PROPS
  export let item = {}

  // *** VARIABLES
  let url = ""

  const makeUrl = ref =>
    "https://shape.anthropocene-curriculum.org/material/files/bu5rnal5/production/" +
    ref.substring(5).replace("-", ".")

  switch (item._type) {
    case "imageBlock":
      url = urlFor(get(item, "image.asset", {})).url()
      break
    case "audioBlock":
      url = makeUrl(get(item, "audioFile.asset._ref", ""))
      break
    case "fileBlock":
      url = makeUrl(get(item, "file.asset._ref", ""))
      break
    case "pdfBlock":
      url = makeUrl(get(item, "pdfFile.asset._ref", ""))
      break
    case "videoBlock":
      url = makeUrl(get(item, "videoFile.asset._ref", ""))
      break
    case "linkBlock":
      url = get(item, "url", "")
      break
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  

  .material-item {
    width: 100%;
    background: $COLOR_LIGHT;
    color: $COLOR_DARK;
    display: block;
    text-decoration: none;
    user-select: none;
    padding-top: $SPACE_XS;
    padding-bottom: $SPACE_XS;
    font-size:$FONT_SIZE_SMALL;
    
    &:first-of-type{
      margin-top: $SPACE_XS;
    }

    .row {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .title {
        font-family: $SANS_STACK;
        font-weight: bold;
        white-space: nowrap;
        max-width: 80%;
        overflow:hidden;
        text-overflow: ellipsis;
      }

      .elips {
        margin-left: $SPACE_XS;
        margin-right: $SPACE_XS;
        width: 90%;
        white-space: nowrap;
        overflow: hidden;
        flex-shrink: 99999;
        color: $COLOR_MID_2;
      }

      .format {
        white-space: nowrap;
        color: $COLOR_MID_2;
      }
    }

    cursor: pointer;

    // transition: background 0.5s $transition;

    &:hover {
      background: $COLOR_MID_1;
    }

    &.header {
      border-bottom: 1px dotted $COLOR_MID_1;
      cursor: default;

      .archive-link {
        color: $COLOR_MID_2;
        text-decoration: underline;
      }

      &:hover {
        background: unset;
      }
    }
  }
</style>

<a href={url} target="_blank" class="material-item">
  <div class="row">
    <div class="title">{item.title}</div>
    <div class="elips">
      ....................................................................
    </div>
    <div class="format">
      {item._type === 'fileBlock' || item._type === 'linkBlock' ? item.fileType : FORMATMAP[item._type]}
    </div>
  </div>
</a>
