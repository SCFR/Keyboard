<?php  namespace SCFRKeyboard;
class Keyboard {
  public $db;

  function __construct() {
    $this->addFiltersAndActions();
    $this->db = new db();
    $this->API = new API($this->db);
  }

  // Called on plugin init.
  public function plugin_init() {
    $this->createPage();
    $this->db->init();
  }

  private function addFiltersAndActions() {
    add_filter( 'page_template', array(&$this,'keyboard_page_template') );
  }

  public function keyboard_page_template() {
    if ( is_page( 'guide-des-touches-du-clavier' ) ) {
        $page_template = plugin_dir_path( __FILE__ ) . '../page/page-keyboard.php';
    }
    return $page_template;
  }

  // Creates the actual wordpress page.
  private function createPage() {
      global $wpdb;

      $title = "Guide des touches du clavier";
      $slug = "guide-des-touches-du-clavier";

      $the_page = get_page_by_title( $title );
      if(!$the_page) {
        $_p = array(
          'post_title' => $title,
          'post_content' => "",
          'post_status' => "publish",
          'post_type' => "page",
          'comment_status' => "closed",
          'ping_status' => "closed",
          'post_slug' => $slug,
        );

        $id = wp_insert_post( $_p );
      }
  }
}
?>
