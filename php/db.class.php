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

    public function editKeyboard() {
      return null;
    }

    public function addKeyboard($_version, $_name) {
      $id = $this->db->insert("wp_scfr_keyboards",
      array(
        "version_id" => $_version,
        "name" => $_name,
        "author" => $this->userId,
        "date_created" => current_time('mysql', 1),
        "date_last_modified" => current_time('mysql', 1),
        "keyboard_keys" => "{}",
      ),
      array(
        "%s", "%s", "%d", "%s", "%s", "%s"
      ));

      return $id;
    }


  }

?>
