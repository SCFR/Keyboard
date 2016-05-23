<?php namespace SCFRKeyboard;
class Selector {
  protected $db;

  function __construct() {
    global $KEYBOARD;
    $this->db = &$KEYBOARD->db;
    $this->getBase();
  }

  public function getBase() {
    $keyboards = $this->db->getAllKeyboards();
      foreach($keyboards as &$keyboard) {
        $keyboard->keyboard_keys = json_decode($keyboard->keyboard_keys);
        $this->keyboards[$keyboard->version_id][$keyboard->name] = $keyboard;
      }
  }


}

?>
