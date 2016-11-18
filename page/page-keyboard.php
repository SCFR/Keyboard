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
    var CURRENT_PAGE = {
      model: <?php print_r(json_encode($selector)); ?>
    };
    jQuery(function($) {
      $(document).tooltip({
        selector: '[data-toggle="tooltip"]'
      });
    });
  </script>

  <main class="row-fluid" id="content" role="main" ng-controller="Keyboard.main">

    <keyboard-header></keyboard-header>

    <a-keyboard></a-keyboard>

    <a-keyboard-list></a-keyboard-list>

  </main>


  <?php get_footer(); } ?>
    <script src="<?php echo plugins_url('SCFR-Keyboard'); ?>/js/vendor/ng-sortable.min.js"></script>
    <link href="<?php echo plugins_url('SCFR-Keyboard'); ?>/css/ng-sortable.min.css" rel="stylesheet" />
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular-animate.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular-aria.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular-messages.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.js"></script>
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.css">
    <link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <script src="<?php echo plugins_url('SCFR-Keyboard'); ?>/js/keyboard.app.js"></script>
    <link href="<?php echo plugins_url('SCFR-Keyboard'); ?>/css/keyboard.css" rel="stylesheet" />