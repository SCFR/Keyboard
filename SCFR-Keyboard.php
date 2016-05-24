<?php
/*
Plugin Name: SCFR Keymapping
Author URI: http://www.starcitizen.fr
Description: KeyMapping Star Citizen
Version: 1.0
Author: SCFR Team
Author URI: http://www.starcitizen.fr
License: Private
*/
namespace SCFRKeyboard;
error_reporting(-1);

  require_once("php/db.class.php");
  require_once("php/api.class.php");
  require_once("php/selector.class.php");
  require_once("php/Keyboard.class.php");

    global $KEYBOARD;
    $KEYBOARD = new Keyboard();


    register_activation_hook(__FILE__, array($KEYBOARD,'plugin_init'));
?>
