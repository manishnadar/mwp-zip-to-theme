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
        add_action('wp_ajax_ztt_convert', [$this, 'ajax_convert']);
        add_action('wp_ajax_ztt_convert_progress', [$this, 'ajax_progress']);
        
        // Add row actions
        add_filter('page_row_actions', [$this, 'add_visual_editor_link'], 10, 2);
        add_filter('post_row_actions', [$this, 'add_visual_editor_link'], 10, 2);

        // Add button to single edit screen
        add_action('edit_form_after_title', [$this, 'display_visual_editor_button']);

        // Gutenberg integration
        add_action('enqueue_block_editor_assets', [$this, 'gutenberg_assets']);
    }

    public function add_visual_editor_link($actions, $post) {
        $url = admin_url('admin.php?page=ztt-visual-editor&post_id=' . $post->ID);
        $actions['ztt_editor'] = '<a href="' . esc_url($url) . '" style="color:#7c3aed;font-weight:bold;">Visual Editor</a>';
        return $actions;
    }

    public function display_visual_editor_button($post) {
        $url = admin_url('admin.php?page=ztt-visual-editor&post_id=' . $post->ID);
        ?>
        <div id="ztt-visual-editor-button-wrap" style="margin: 20px 0 10px;">
            <a href="<?php echo esc_url($url); ?>" class="button button-primary button-large" style="background: #7c3aed !important; border-color: #6d28d9 !important; font-weight: 600; height: auto; padding: 10px 24px; text-shadow: none; box-shadow: 0 4px 14px rgba(124,58,237,0.3); transition: all .2s; display: inline-flex; align-items: center; gap: 8px;">
                <span class="dashicons dashicons-layout" style="margin: 0; line-height: 1;"></span>
                Edit with Visual Editor
            </a>
            <style>
                #ztt-visual-editor-button-wrap a:hover { background: #6d28d9 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.4); }
                #ztt-visual-editor-button-wrap a:active { transform: translateY(0); }
            </style>
        </div>
        <?php
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
            wp_localize_script('ztt-admin', 'zttAdminData', [
                'ajaxUrl'    => admin_url('admin-ajax.php'),
                'nonce'      => wp_create_nonce('ztt_nonce'),
                'successUrl' => admin_url('admin.php?page=ztt-dashboard&success=1'),
            ]);
        }
        
        if ($hook === 'admin_page_ztt-visual-editor') {
            $js_path = ZTT_PLUGIN_PATH . 'react-editor/dist/assets/index.js';
            $css_path = ZTT_PLUGIN_PATH . 'react-editor/dist/assets/index.css';

            if (file_exists($js_path)) {
                $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
                $post_type = get_post_type($post_id);
                $api_base = ($post_type === 'page') ? 'pages' : 'posts';

                wp_enqueue_script('ztt-react-app', ZTT_PLUGIN_URL . 'react-editor/dist/assets/index.js', ['wp-element'], filemtime($js_path), true);
                
                wp_localize_script('ztt-react-app', 'zttData', [
                    'apiUrl' => rest_url("wp/v2/{$api_base}/"),
                    'proxyUrl' => rest_url('ztt/v1/claude'),
                    'nonce'  => wp_create_nonce('wp_rest'),
                    'frontendUrl' => $post_id ? get_permalink($post_id) : ''
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

    public function gutenberg_assets() {
        $post_id = get_the_ID();
        if (!$post_id) return;

        $js_url = ZTT_PLUGIN_URL . 'assets/gutenberg.js';
        wp_enqueue_script(
            'ztt-gutenberg-editor',
            $js_url,
            ['jquery', 'wp-data'],
            filemtime(ZTT_PLUGIN_PATH . 'assets/gutenberg.js'),
            true
        );

        wp_localize_script('ztt-gutenberg-editor', 'zttGutenbergData', [
            'editorUrl' => admin_url('admin.php?page=ztt-visual-editor&post_id=' . $post_id),
            'postId'    => $post_id
        ]);
    }

    public function render()
    {
        include ZTT_PLUGIN_PATH . 'templates/admin-page.php';
    }

    public function handle_conversion()
    {
        ZTT_Security::check_nonce();
        $this->run_conversion($_FILES, $_POST);
        wp_redirect(admin_url('admin.php?page=ztt-dashboard&success=1'));
        exit;
    }

    public function ajax_convert()
    {
        ZTT_Security::check_nonce();

        try {
            $this->run_conversion($_FILES, $_POST);
            $this->set_progress(100, 'done', 'Theme converted successfully.', 'done');
            wp_send_json_success([
                'redirect' => admin_url('admin.php?page=ztt-dashboard&success=1'),
            ]);
        } catch (Throwable $e) {
            $this->set_progress(100, 'error', $e->getMessage(), 'error');
            wp_send_json_error([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function ajax_progress()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        if (!isset($_REQUEST['_wpnonce']) || !wp_verify_nonce($_REQUEST['_wpnonce'], 'ztt_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce'], 403);
        }

        $progress = get_transient($this->progress_key());
        if (!$progress) {
            $progress = [
                'percent' => 0,
                'stage'   => 'idle',
                'message' => 'Waiting to start conversion.',
                'status'  => 'idle',
            ];
        }

        wp_send_json_success($progress);
    }

    private function run_conversion($files, $post)
    {
        $this->set_progress(5, 'prepare', 'Validating ZIP and settings...');

        $upload = new ZTT_Uploader();
        $this->set_progress(18, 'upload', 'Uploading ZIP file...');
        $file = $upload->upload($files['zip_file']);

        $extractor = new ZTT_Extractor();
        $this->set_progress(34, 'extract', 'Extracting archive...');
        $path = $extractor->extract($file);

        $analyzer = new ZTT_Analyzer();
        $this->set_progress(50, 'analyze', 'Analyzing HTML, assets and pages...');
        $data = $analyzer->analyze($path);

        $generator = new ZTT_Theme_Generator();
        $this->set_progress(70, 'generate', 'Generating WordPress theme and pages...');
        $generator->generate($data, $post);

        if (isset($post['activate']) && $post['activate']) {
            $this->set_progress(90, 'activate', 'Activating generated theme...');
            switch_theme(sanitize_title($post['theme_slug']));
        }
    }

    private function progress_key()
    {
        return 'ztt_convert_progress_' . get_current_user_id();
    }

    private function set_progress($percent, $stage, $message, $status = 'running')
    {
        set_transient($this->progress_key(), [
            'percent' => max(0, min(100, (int) $percent)),
            'stage'   => (string) $stage,
            'message' => (string) $message,
            'status'  => (string) $status,
        ], 30 * MINUTE_IN_SECONDS);
    }
}