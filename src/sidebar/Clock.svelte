<script>
  // # # # # # # # # # # # # #
  //
  //  CLOCK
  //
  // # # # # # # # # # # # # #

  function berlinTime(){
    var d = new Date();
    var cet = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'CET',
      hour: 'numeric',
      minute: 'numeric'
    }).format(d)
    time = cet;
    return cet;
  }

  var time = berlinTime();
  window.setInterval(berlinTime, 10000);
  berlinTime();

</script>

<style lang="scss"> 

  @import "../variables.scss";

  .clock-berlin{
    font-family: $MONO_STACK;
    font-size:$FONT_SIZE_SMALL;
    background:$COLOR_DARK_OPACITY;
    color:$COLOR_LIGHT;
    z-index:1001;
    position:absolute;
    top:0;
    right:0;
    padding: $SPACE_XS;
    word-spacing: -0.3em;

    a {
      color:white;
      text-decoration: none;
    }

    @include screen-size("small"){
      top:80px;
      z-index:1;
    }
  }
</style>

<div class="clock-berlin">
    {time}&nbsp;CET
</div>