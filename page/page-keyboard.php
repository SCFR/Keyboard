<?php
$selector = new SCFRKeyboard\Selector();
if(get_query_var( 'callback', false ) == "json") {
  header('Content-Type: application/json');
  print_r(json_encode($selector));
}
else {
  get_header();
  ?>
  <script>
    // To prevent double call, give JSON directly.
    var CURRENT_PAGE = {model: <?php print_r(json_encode($selector)); ?>};
  </script>

  <main class="row-fluid" id="content" role="main" ng-controller="Keyboard.main">

    <keyboard-header></keyboard-header>

    <a-keyboard></a-keyboard>

  </main>


  <?php get_footer(); } ?>
<script src="<?php echo plugins_url( "SCFR-Keyboard" ); ?>/js/keyboard.app.js"></script>
<link href="<?php echo plugins_url( "SCFR-Keyboard" ); ?>/css/keyboard.css" rel="stylesheet" />
