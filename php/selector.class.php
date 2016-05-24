<?php namespace SCFRKeyboard;
class Selector {
  protected $db;

  function __construct() {
    global $KEYBOARD;
    $this->db = &$KEYBOARD->db;
    $this->getBase();
    $this->canAdmin();
  }

  private function getBase() {
    $keyboards = $this->db->getAllKeyboards();
      foreach($keyboards as &$keyboard) {
        $keyboard->keyboard_keys = json_decode($keyboard->keyboard_keys);
        $this->keyboards[$keyboard->version_id][$keyboard->name] = $keyboard;
      }
  }

  private function canAdmin() {
    $this->isAdmin = $this->db->userCanEdit();
  }


}

?>
