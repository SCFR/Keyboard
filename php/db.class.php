<?php  namespace SCFRKeyboard;

class db {
  protected $db;
  public $userId;

  function __construct() {
    global $wpdb;

    $this->db = &$wpdb;
    $this->userId = 0;
  }

  public function init() {
    $this->createTable();
  }

  public function setCurrentUser() {
    global $current_user;
    $this->loggedIn = $current_user->data->ID > 0 ? true : false;
    $this->userId = $current_user->data->ID;
  }

  private function createTable() {
    $charset_collate = $this->db->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS wp_scfr_keyboards (
      id mediumint(9) NOT NULL AUTO_INCREMENT,
      date_created datetime NOT NULL,
      date_last_modified datetime NOT NULL,
      keyboard_keys longtext NOT NULL,
      author mediumint(9) NOT NULL,
      version_id varchar(50) NOT NULL,
      name varchar(120) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY (version_id,name)
    ) $charset_collate;";

    if($this->db->query($sql) === false) die($this->db->print_error());
  }

  public function getAllKeyboards() {
    $sql = "SELECT * FROM wp_scfr_keyboards ORDER BY version_id DESC";

    return $this->db->get_results($sql);
  }

  public function userCanEdit() {
    $meta = get_user_meta($this->userId, "keyboards_can_manage", true);
    if($meta === "on" || current_user_can('editor') || current_user_can('administrator'))
      return true;
    else
      return false;
  }

  public function editKeyboard($_keyboard) {
    $arr = array(
      "version_id" => $_keyboard["version_id"],
      "name" => $_keyboard["name"],
      "date_last_modified" => current_time('mysql', 1),
      "keyboard_keys" => json_encode($_keyboard["keyboard_keys"]),
    );
    $vals = array(
      "%s", "%s", "%s", "%s"
    );

    return $this->db->update("wp_scfr_keyboards",$arr, array("id" => $_keyboard["id"]), $vals);
  }

  public function deleteKeyboard($_id) {
    return $this->db->delete("wp_scfr_keyboards",array("id" => $_id), array("%d"));
  }

  public function addKeyboard($_keyboard) {
    $arr = array(
      "version_id" => $_keyboard["version_id"],
      "name" => $_keyboard["name"],
      "author" => $this->userId,
      "date_created" => current_time('mysql', 1),
      "date_last_modified" => current_time('mysql', 1),
      "keyboard_keys" => json_encode($_keyboard["keyboard_keys"]),
    );
    $vals = array(
      "%s", "%s", "%d", "%s", "%s", "%s"
    );

    $id = $this->db->insert("wp_scfr_keyboards",$arr,$vals);

    return $id;
  }


}

?>
