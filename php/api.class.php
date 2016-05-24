<?php namespace SCFRKeyboard;
class API {
  private $db;

  function __construct(&$_db) {
    $this->db = $_db;
    add_action( 'rest_api_init', array(&$this, 'registerApiHooks') );
    add_action( 'init' , array(&$this, "setCurrentUser"));
  }

  public function registerApiHooks() {
    $namespace = 'Keyboard';

    register_rest_route( $namespace, '/Edit/', array(
      'methods' => 'POST',
      'callback' => array( &$this, 'editKeyboard' ),
    ) );

    register_rest_route( $namespace, '/Delete/', array(
      'methods' => 'POST',
      'callback' => array( &$this, 'deleteKeyboard' ),
    ) );

  }

  public function editKeyboard($args) {
    if(isset($args["keyboard"]["name"]) && isset($args["keyboard"]["version_id"]) && $this->db->userCanEdit()) {
      if($args["keyboard"]["id"] > 0)
      $r = $this->db->editKeyboard($args["keyboard"]);
      else $r = $this->db->addKeyboard($args["keyboard"]);

      return $r;
    }
    else return null;
  }

  public function deleteKeyboard($args) {
    if($args["keyboard"]["id"] > 0 && $this->db->userCanEdit()) {
      return $this->db->deleteKeyboard($args["keyboard"]["id"]);
    }
    else return null;
  }

}
?>
