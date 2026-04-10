<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Admin
{

    public function __construct()
    {
        add_action('admin_menu', [$this, 'menu']);
        add_action('admin_enqueue_scripts', [$this, 'assets']);
        add_action('admin_post_ztt_convert', [$this, 'handle_conversion']);
        
        // Add row actions
        add_filter('page_row_actions', [$this, 'add_visual_editor_link'], 10, 2);
    }

    public function add_visual_editor_link($actions, $post) {
        $url = admin_url('admin.php?page=ztt-visual-editor&post_id=' . $post->ID);
        $actions['ztt_editor'] = '<a href="' . esc_url($url) . '" style="color:#0071a1;font-weight:bold;">Visual Editor</a>';
        return $actions;
    }

    public function menu()
    {
        add_menu_page(
            'ZIP to Theme Converter',
            'ZIP to Theme',
            'manage_options',
            'ztt-dashboard',
            [$this, 'render'],
            'dashicons-archive'
        );
        
        add_submenu_page(
            null, 
            'Visual Layout Editor',
            'Visual Editor',
            'manage_options',
            'ztt-visual-editor',
            [$this, 'render_react_editor']
        );
    }

    public function render_react_editor() {
        if (!isset($_GET['post_id'])) {
            echo "<h2>Error</h2><p>No Post ID provided.</p>";
            return;
        }
        $post_id = intval($_GET['post_id']);
        echo '<div id="ztt-react-root" data-post-id="'.$post_id.'"></div>';
    }

    public function assets($hook)
    {
        if ($hook === 'toplevel_page_ztt-dashboard') {
            wp_enqueue_style('ztt-admin', ZTT_PLUGIN_URL . 'assets/admin.css');
            wp_enqueue_script('ztt-admin', ZTT_PLUGIN_URL . 'assets/admin.js', ['jquery'], false, true);
        }
        
        if ($hook === 'admin_page_ztt-visual-editor') {
            $js_path = ZTT_PLUGIN_PATH . 'react-editor/dist/assets/index.js';
            $css_path = ZTT_PLUGIN_PATH . 'react-editor/dist/assets/index.css';

            if (file_exists($js_path)) {
                wp_enqueue_script('ztt-react-app', ZTT_PLUGIN_URL . 'react-editor/dist/assets/index.js', ['wp-element'], filemtime($js_path), true);
                
                wp_localize_script('ztt-react-app', 'zttData', [
                    'apiUrl' => rest_url('wp/v2/pages/'),
                    'proxyUrl' => rest_url('ztt/v1/claude'),
                    'nonce'  => wp_create_nonce('wp_rest'),
                    'frontendUrl' => isset($_GET['post_id']) ? get_permalink(intval($_GET['post_id'])) : ''
                ]);
            }
            if (file_exists($css_path)) {
                wp_enqueue_style('ztt-react-app-style', ZTT_PLUGIN_URL . 'react-editor/dist/assets/index.css', [], filemtime($css_path));
            }
            
            // Full screen admin layout — dark host shell for the visual editor
            $custom_css = "
                html, body { background: #0c0c10 !important; color: #f0f0f8 !important; margin:0; padding:0; }
                #wpcontent { margin-left: 0 !important; padding: 0 !important; background: #0c0c10 !important; }
                #wpbody   { padding-top: 0 !important; }
                #wpbody-content { padding-bottom: 0 !important; }
                #wpadminbar { background: #0c0c10 !important; border-bottom: 1px solid rgba(255,255,255,.06) !important; }
                #wpadminbar * { color: rgba(255,255,255,.55) !important; }
                #wpadminbar .ab-item:hover,
                #wpadminbar a:hover { color: #fff !important; background: rgba(255,255,255,.07) !important; }
                #adminmenumain { display:none; }
                #wpfooter { display:none; }
                .update-nag, .notice, .is-dismissible { display:none !important; }
                #ztt-react-root { display:block !important; }
            ";
            wp_add_inline_style('ztt-react-app-style', $custom_css);
        }
    }

    public function render()
    {
        include ZTT_PLUGIN_PATH . 'templates/admin-page.php';
    }

    public function handle_conversion()
    {

        ZTT_Security::check_nonce();

        $upload = new ZTT_Uploader();
        $file = $upload->upload($_FILES['zip_file']);

        $extractor = new ZTT_Extractor();
        $path = $extractor->extract($file);

        $analyzer = new ZTT_Analyzer();
        $data = $analyzer->analyze($path);

        $generator = new ZTT_Theme_Generator();
        $generator->generate($data, $_POST);

        if (isset($_POST['activate']) && $_POST['activate']) {
            switch_theme(sanitize_title($_POST['theme_slug']));
        }

        wp_redirect(admin_url('admin.php?page=ztt-dashboard&success=1'));
        exit;
    }
}