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

      register_rest_route( $namespace, '/Add/', array(
          'methods' => 'POST',
          'callback' => array( &$this, 'addKeyboard' ),
      ) );

      register_rest_route( $namespace, '/Edit/', array(
          'methods' => 'POST',
          'callback' => array( &$this, 'editKeyboard' ),
      ) );



    }

    public function addKeyboard( $args ) {
      if(isset($args["name"]) && isset($args["version"]) && $this->loggedIn) {
        $r = $this->db->addKeyboard($args["version"], $args["name"]);
        return $r;
      }
      else return null;
    }

    public function editKeyboard( $args ) {
      if(isset($args["id"]) && $this->loggedIn) {
        $r = $this->db->editKeyboard($args);
      }
    }

    public function setCurrentUser() {
        global $current_user;
        $this->USER = $current_user;
        $this->loggedIn = $this->USER->data->ID > 0 ? true : false;
        $this->db->userId = $this->USER->data->ID;
    }

  }
?>
