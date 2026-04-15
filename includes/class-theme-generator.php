<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Theme_Generator
{

    public function generate($data, $options)
    {

        $slug = sanitize_title($options['theme_slug']);
        $theme_name = ZTT_Security::sanitize(isset($options['theme_name']) ? $options['theme_name'] : '');
        $author = ZTT_Security::sanitize(isset($options['author']) ? $options['author'] : '');

        $theme_path = get_theme_root() . '/' . $slug;

        if (file_exists($theme_path)) {
            $extractor = new ZTT_Extractor();
            $extractor->cleanup($data['base_path']);
            wp_die('Theme already exists');
        }

        wp_mkdir_p($theme_path . '/assets');

        $parser = new ZTT_Template_Parser();

        if (isset($data['images']) && !empty($data['images'])) {
            $media = new ZTT_Media_Importer();
            $image_map = $media->import_images($data['images'], $data['base_path']);
            $parser->set_image_map($image_map);
        }

        $master_html = '';
        foreach ($data['html'] as $file) {
            if (basename($file) === 'index.html') {
                $master_html = $file;
                break;
            }
        }
        if (!$master_html) $master_html = $data['html'][0];

        $main = $parser->parse($master_html);

        $opt = [
            'theme_name' => $theme_name,
            'author' => $author
        ];

        file_put_contents($theme_path . '/style.css', $this->style($opt));
        $body_scripts = isset($main['body_scripts']) ? $main['body_scripts'] : [];
        file_put_contents($theme_path . '/functions.php', $this->functions($body_scripts));
        
        $head = isset($main['head']) ? $main['head'] : '';
        $header_str = isset($main['header']) ? $main['header'] : '';
        $footer_str = isset($main['footer']) ? $main['footer'] : '';

        $php_theme_uri = "<?php echo get_template_directory_uri(); ?>";
        $head = str_replace("ZTT_THEME_URI_PLACEHOLDER", $php_theme_uri, $head);
        $header_str = str_replace("ZTT_THEME_URI_PLACEHOLDER", $php_theme_uri, $header_str);
        $footer_str = str_replace("ZTT_THEME_URI_PLACEHOLDER", $php_theme_uri, $footer_str);
        
        $php_home_url = "<?php echo home_url(); ?>";
        $head = str_replace("ZTT_HOME_URL_PLACEHOLDER", $php_home_url, $head);
        $header_str = str_replace("ZTT_HOME_URL_PLACEHOLDER", $php_home_url, $header_str);
        $footer_str = str_replace("ZTT_HOME_URL_PLACEHOLDER", $php_home_url, $footer_str);

        $header_php = $this->header($head, $header_str);
        file_put_contents($theme_path . '/header.php', $header_php);
        
        $footer_php = $this->footer($footer_str);
        file_put_contents($theme_path . '/footer.php', $footer_php);
        
        $index_php = $this->index();
        file_put_contents($theme_path . '/index.php', $index_php);

        $asset = new ZTT_Asset_Manager();
        $image_map = isset($image_map) ? $image_map : [];
        $asset->copy_assets($data['assets'], $theme_path, $data['base_path'], $image_map);

        $abs_theme_uri = get_theme_root_uri() . '/' . $slug;
        $abs_home_url = untrailingslashit(home_url());

        $abs_theme_uri = get_theme_root_uri() . '/' . $slug;
        $abs_home_url = untrailingslashit(home_url());

        foreach ($data['html'] as $file) {
            $parsed = $parser->parse($file);
            $file_slug = pathinfo($file, PATHINFO_FILENAME);
            $page_title = $parsed['title'];
            $body = isset($parsed['body']) ? $parsed['body'] : '';

            $body = str_replace("ZTT_THEME_URI_PLACEHOLDER", $abs_theme_uri, $body);
            $body = str_replace("ZTT_HOME_URL_PLACEHOLDER", $abs_home_url, $body);

            $existing_page = get_page_by_path($file_slug);
            
            if ($existing_page) {
                $page_id = $existing_page->ID;
                wp_update_post([
                    'ID'           => $page_id,
                    'post_title'   => $page_title,
                    'post_content' => $body
                ]);
            } else {
                $page_id = wp_insert_post([
                    'post_name'    => $file_slug,
                    'post_title'   => $page_title,
                    'post_content' => $body,
                    'post_status'  => 'publish',
                    'post_type'    => 'page'
                ]);
            }

            if ($file_slug === 'index' && !is_wp_error($page_id)) {
                update_option('show_on_front', 'page');
                update_option('page_on_front', $page_id);
            }
        }

        $extractor = new ZTT_Extractor();
        $extractor->cleanup($data['base_path']);

        ZTT_Logger::save();
    }

    private function style($opt)
    {
        return "/*\nTheme Name: {$opt['theme_name']}\nAuthor: {$opt['author']}\n*/";
    }

    private function functions($body_scripts = [])
    {
        // Build wp_enqueue_script calls from scripts collected in <body>
        $enqueue_js = '';
        $prev_handle = '';
        foreach ($body_scripts as $i => $src) {
            // Only enqueue local scripts (ZTT_THEME_URI_PLACEHOLDER paths)
            if (strpos($src, 'ZTT_THEME_URI_PLACEHOLDER') === false) continue;

            // Derive a safe handle from the filename
            $filename = pathinfo(parse_url($src, PHP_URL_PATH), PATHINFO_FILENAME);
            $handle   = 'ztt-' . preg_replace('/[^a-z0-9]/', '-', strtolower($filename));

            // Convert placeholder to PHP expression
            $php_src = str_replace('ZTT_THEME_URI_PLACEHOLDER', "' . get_template_directory_uri() . '", $src);

            $deps = $prev_handle ? "['{$prev_handle}']" : '[]';
            $enqueue_js .= "    wp_enqueue_script('{$handle}', '{$php_src}', {$deps}, false, true);\n";
            $prev_handle = $handle;
        }

        return "<?php
add_action('after_setup_theme', function() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('align-wide');
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
});

add_action('wp_enqueue_scripts', function(){
    wp_enqueue_style('main', get_stylesheet_uri());
{$enqueue_js}});

// ZTT: Scroll-reveal engine.
// The imported HTML uses .reveal or .fade-* elements that start at opacity:0 and
// become visible when JS adds .visible via IntersectionObserver.
// This replaces any missing scroll-reveal library from the original HTML.
add_action('wp_footer', function(){
    echo '<script>
(function(){
    var els = document.querySelectorAll(\".reveal, [class*=\'fade-\']\");
    if (!els.length) return;

    if (\"IntersectionObserver\" in window) {
        var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if (e.isIntersecting) {
                    e.target.classList.add(\"visible\");
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(function(el){ io.observe(el); });
    } else {
        // Fallback: show all immediately for old browsers
        els.forEach(function(el){ el.classList.add(\"visible\"); });
    }
})();
</script>';
}, 20);
";
    }


    private function header($head, $header)
    {
        return "<!DOCTYPE html>\n<html <?php language_attributes(); ?>>\n<head>\n<meta charset=\"<?php bloginfo( 'charset' ); ?>\">\n" . $head . "\n<?php wp_head(); ?>\n</head>\n<body <?php body_class(); ?>>\n<?php wp_body_open(); ?>\n" . $header;
    }

    private function footer($footer)
    {
        return $footer . "\n<?php wp_footer(); ?>\n</body>\n</html>";
    }

    private function index()
    {
        return "<?php get_header(); ?>\n<main id=\"main\" class=\"site-main\">\n<?php while(have_posts()): the_post(); the_content(); endwhile; ?>\n</main>\n<?php get_footer(); ?>";
    }
}