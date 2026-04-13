<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Template_Parser
{
    private $image_map = [];

    public function set_image_map($map)
    {
        $this->image_map = $map;
    }

    public function parse($html_file)
    {
        $html = file_get_contents($html_file);

        $doc = new DOMDocument();
        libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html);
        libxml_clear_errors();

        // Remove the xml encoding node
        foreach ($doc->childNodes as $node) {
            if ($node->nodeType == XML_PI_NODE) {
                $doc->removeChild($node);
                break;
            }
        }

        // Extract Title
        $title = '';
        $title_nodes = $doc->getElementsByTagName('title');
        if ($title_nodes->length > 0) {
            $title = $title_nodes->item(0)->textContent;
        } else {
            $filename = pathinfo($html_file, PATHINFO_FILENAME);
            $title = ucfirst(str_replace(['-', '_'], ' ', $filename));
        }

        $this->rewrite_paths($doc, 'link', 'href');
        $this->rewrite_paths($doc, 'script', 'src');
        $this->rewrite_paths($doc, 'img', 'src');
        $this->rewrite_paths($doc, 'source', 'src');
        $this->rewrite_paths($doc, 'source', 'srcset');
        $this->rewrite_paths($doc, 'object', 'data');
        
        $this->rewrite_links($doc);

        $head_inner = '';
        $body_inner = '';
        $header_html = '';
        $footer_html = '';
        $body_scripts = []; // <script src> tags found in <body>

        $heads = $doc->getElementsByTagName('head');
        if ($heads->length > 0) {
            foreach ($heads->item(0)->childNodes as $child) {
                $head_inner .= $doc->saveHTML($child);
            }
        }

        $bodies = $doc->getElementsByTagName('body');
        $body_node = $bodies->length > 0 ? $bodies->item(0) : null;

        if ($body_node) {
            // ── Strip preloader elements before saving any page content ──────
            // Preloaders are full-screen overlays (position:fixed, z-index:9999)
            // that rely on JS to remove them. In a static WordPress context they
            // would permanently block the page. Remove any matching element now.
            $preloader_selectors = [
                '#preloader', '#pre-loader', '#preloader-it', '#page-preloader',
                '#site-preloader', '#loader', '#loading', '#page-loader',
                '.preloader', '.pre-loader', '.preloader-wrapper', '.preloader-container',
                '.loader', '.loading', '.site-loader', '.page-loader',
                '.preload', '.preload-wrapper', '.preloading',
            ];
            foreach ($preloader_selectors as $sel) {
                $is_id    = $sel[0] === '#';
                $is_class = $sel[0] === '.';
                $name     = substr($sel, 1);
                $nodes_to_remove = [];

                if ($is_id) {
                    $el = $doc->getElementById($name);
                    if ($el) $nodes_to_remove[] = $el;
                } elseif ($is_class) {
                    foreach ($doc->getElementsByTagName('*') as $el) {
                        $classes = preg_split('/\s+/', trim($el->getAttribute('class')));
                        if (in_array($name, $classes, true)) {
                            $nodes_to_remove[] = $el;
                        }
                    }
                }

                foreach ($nodes_to_remove as $el) {
                    if ($el->parentNode) {
                        $el->parentNode->removeChild($el);
                    }
                }
            }
            // ── End preloader strip ──────────────────────────────────────────

            $headers = $body_node->getElementsByTagName('header');
            if ($headers->length > 0) {
                $header_node = $headers->item(0);
                $header_html = $doc->saveHTML($header_node);
                $header_node->parentNode->removeChild($header_node);
            }

            $footers = $body_node->getElementsByTagName('footer');
            if ($footers->length > 0) {
                $footer_node = $footers->item($footers->length - 1);
                $footer_html = $doc->saveHTML($footer_node);
                $footer_node->parentNode->removeChild($footer_node);
            }

            foreach ($body_node->childNodes as $child) {
                if ($child->nodeName === 'script') {
                    // Collect external script src paths for wp_enqueue_script generation
                    if ($child->hasAttribute('src')) {
                        $body_scripts[] = $child->getAttribute('src');
                    }
                    continue;
                }
                
                $html = $doc->saveHTML($child);
                $tag = strtolower($child->nodeName);
                
                // Skip empty text nodes between tags
                if ($child->nodeType === XML_TEXT_NODE && trim($child->textContent) === '') {
                    continue;
                }

                if ($tag === 'p') {
                    $body_inner .= "<!-- wp:paragraph -->\n" . $html . "\n<!-- /wp:paragraph -->\n";
                } elseif (in_array($tag, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) {
                    $level = substr($tag, 1);
                    $body_inner .= "<!-- wp:heading {\"level\":$level} -->\n" . $html . "\n<!-- /wp:heading -->\n";
                } elseif ($tag === 'img') {
                    $body_inner .= "<!-- wp:image -->\n<figure class=\"wp-block-image\">" . $html . "</figure>\n<!-- /wp:image -->\n";
                } elseif (in_array($tag, ['ul', 'ol'])) {
                    $body_inner .= "<!-- wp:list -->\n" . $html . "\n<!-- /wp:list -->\n";
                } elseif ($tag === 'blockquote') {
                    $body_inner .= "<!-- wp:quote -->\n" . $html . "\n<!-- /wp:quote -->\n";
                } elseif ($child->nodeType === XML_ELEMENT_NODE) {
                    // Wrap complex containers directly into Custom HTML block safe zones
                    $body_inner .= "<!-- wp:html -->\n" . $html . "\n<!-- /wp:html -->\n";
                } else {
                    // Wrap bare root text safely
                    if ($child->nodeType === XML_TEXT_NODE) {
                        $body_inner .= "<!-- wp:paragraph -->\n<p>" . trim($html) . "</p>\n<!-- /wp:paragraph -->\n";
                    } else {
                        $body_inner .= $html;
                    }
                }
            }
        }

        return [
            'title'        => $title,
            'head'         => $head_inner,
            'header'       => $header_html,
            'footer'       => $footer_html,
            'body'         => $body_inner,
            'body_scripts' => $body_scripts,
        ];
    }

    private function rewrite_paths($doc, $tag, $attribute)
    {
        $elements = $doc->getElementsByTagName($tag);
        foreach ($elements as $el) {
            if ($el->hasAttribute($attribute)) {
                $val = $el->getAttribute($attribute);
                if (preg_match('/^(http|https|data|ftp|mailto|tel):/i', $val) || strpos($val, '//') === 0 || strpos($val, '#') === 0 || empty($val)) {
                    continue;
                }
                
                $decoded_val = urldecode(ltrim($val, '/'));
                
                if (isset($this->image_map[$decoded_val])) {
                    // Inject WordPress Absolute Media URL directly
                    $el->setAttribute($attribute, $this->image_map[$decoded_val]);
                } else {
                    // Fallback to static theme assets directory
                    $val = ltrim($val, '/');
                    $el->setAttribute($attribute, "ZTT_THEME_URI_PLACEHOLDER/assets/" . $val);
                }
            }
        }
    }

    private function rewrite_links($doc)
    {
        $elements = $doc->getElementsByTagName('a');
        foreach ($elements as $el) {
            if ($el->hasAttribute('href')) {
                $val = $el->getAttribute('href');
                if (preg_match('/^(http|https|data|ftp|mailto|tel|#):/i', $val) || strpos($val, '//') === 0 || empty($val)) {
                    continue;
                }
                
                $path = parse_url($val, PHP_URL_PATH);
                if ($path && preg_match('/\.html$/i', $path)) {
                    $slug = pathinfo($path, PATHINFO_FILENAME);
                    if ($slug === 'index') {
                        $el->setAttribute('href', "ZTT_HOME_URL_PLACEHOLDER/");
                    } else {
                        $el->setAttribute('href', "ZTT_HOME_URL_PLACEHOLDER/" . $slug . "/");
                    }
                }
            }
        }
    }
}