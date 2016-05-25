<?php  namespace SCFRKeyboard;
class Keyboard {
  public $db;

  function __construct() {
    $this->addFiltersAndActions();
    $this->db = new db();
    $this->API = new API($this->db);

    $this->_UserOptions =  array(
      'keyboards_can_manage' => array(
        'label'       => 'Staff: peux modifier les claviers ?',
        'input'       => 'checkbox',
        'adminOnly'   => true,
      )
    );
  }

  // Called on plugin init.
  public function plugin_init() {
    $this->createPage();
    $this->db->init();
  }

  private function addFiltersAndActions() {
    add_filter( 'page_template', array(&$this,'keyboard_page_template') );
    add_action( 'show_user_profile', array($this,'user_fields_to_edit') );
    add_action( 'edit_user_profile', array($this,'user_fields_to_edit') );
    add_action( 'personal_options_update',  array($this,'user_fields_to_save') );
    add_action( 'edit_user_profile_update',  array($this,'user_fields_to_save') );
    add_action( 'init', array(&$this->db,"setCurrentUser"));
  }

  public function keyboard_page_template( $page_template ) {
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

  function user_fields_to_save( $user_id ) {
    if ( !current_user_can( 'edit_user', $user_id ) )
    return false;

    foreach($this->_UserOptions as $field => $val) {
      if(!$val["adminOnly"] || current_user_can('administrator') ) update_usermeta( $user_id, $field, $_POST[$field] );
    }
  }

  function user_fields_to_edit( $user ) {
    if( current_user_can('editor') || current_user_can('administrator') ) {

      foreach ( $this->_UserOptions as $field => $values ) {
        // If the field matches the current attachment mime type
        // and is not one of the exclusions
        if ( preg_match( "/" . $values['application'] . "/", $post->post_mime_type) && ! in_array( $post->post_mime_type, $values['exclusions'] ) ) {
          // We get the already saved field meta value
          $meta = get_the_author_meta( $field, $user->ID );

          // Define the input type to 'text' by default
          switch ( $values['input'] ) {
            default:
            case 'text':
            $values['input'] = 'text';
            $html = "<input type='text' name='{$field}' value='{$meta}' />";
            $values['html'] = $html;
            break;

            case 'textarea':
            $values['input'] = 'textarea';
            break;

            case 'select':

            // Select type doesn't exist, so we will create the html manually
            // For this, we have to set the input type to 'html'
            $values['input'] = 'html';

            // Create the select element with the right name (matches the one that wordpress creates for custom fields)
            $html = '<select name="' . $field . '">';

            // If options array is passed
            if ( isset( $values['options'] ) ) {
              // Browse and add the options
              foreach ( $values['options'] as $k => $v ) {
                // Set the option selected or not
                if ( $meta == $k )
                $selected = ' selected="selected"';
                else
                $selected = '';

                $html .= '<option' . $selected . ' value="' . $k . '">' . $v . '</option>';
              }
            }

            $html .= '</select>';

            // Set the html content
            $values['html'] = $html;

            break;

            case 'checkbox':

            // Checkbox type doesn't exist either
            $values['input'] = 'html';

            // Set the checkbox checked or not
            if ( $meta == 'on' )
            $checked = ' checked="checked"';
            else
            $checked = '';

            $html = '<input' . $checked . ' type="checkbox" name="' . $field . '" id="' . $field . '" />';

            $values['html'] = $html;

            break;

            case 'radio':

            // radio type doesn't exist either
            $values['input'] = 'html';

            $html = '';

            if ( ! empty( $values['options'] ) ) {
              $i = 0;

              foreach ( $values['options'] as $k => $v ) {
                if ( $meta == $k )
                $checked = ' checked="checked"';
                else
                $checked = '';

                $html .= '<input' . $checked . ' value="' . $k . '" type="radio" name="' . $field . '" id="' . sanitize_key( $field . '_' . $user->ID . '_' . $i ) . '" /> <label for="' . sanitize_key( $field . '_' . $user->ID . '_' . $i ) . '">' . $v . '</label><br />';
                $i++;
              }
            }

            $values['html'] = $html;

            break;
          }

          // And set it to the field before building it
          $values['value'] = $meta;

          // We add our field into the $form_fields array
          $form_fields[$field] = $values;
        }
      }

      // We return the completed $form_fields array
      echo "<h2>SC.FR Keyboards </h2>
      <table class='form-table'>
      <tbody>";
      foreach($form_fields as $field => $val) {
        echo '<tr id="'.$field.'">
        <th><label for="'.$field.'">'.$val['label'].'</label></th>
        <td>';
        echo $val['html'];
        echo '</td></tr>';
      }
      echo "</tbody></table>";
    }
  }
}
?>
