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
        
        $this->rewrite_inline_styles($doc);
        
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
            // Strip static and custom preloaders before saving page content.
            $this->strip_preloaders($doc, $body_node);

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
                    if ($child instanceof DOMElement && $child->hasAttribute('src')) {
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

    private function rewrite_inline_styles($doc)
    {
        $elements = $doc->getElementsByTagName('*');
        foreach ($elements as $el) {
            if ($el->hasAttribute('style')) {
                $style = $el->getAttribute('style');
                // Regex to find url(...)
                $new_style = preg_replace_callback(
                    '/url\s*\(\s*([\'"]?)(.*?)\1\s*\)/i',
                    function ($matches) {
                        $quote = $matches[1];
                        $url = $matches[2];

                        // Skip absolute URLs, data URIs, etc.
                        if (preg_match('/^(http|https|data|ftp|mailto|tel):/i', $url) || strpos($url, '//') === 0 || strpos($url, '#') === 0 || empty($url)) {
                            return $matches[0];
                        }

                        $decoded_url = urldecode(ltrim($url, '/'));

                        if (isset($this->image_map[$decoded_url])) {
                            return 'url(' . $quote . $this->image_map[$decoded_url] . $quote . ')';
                        } else {
                            // Fallback to static theme assets directory
                            $url = ltrim($url, '/');
                            return 'url(' . $quote . 'ZTT_THEME_URI_PLACEHOLDER/assets/' . $url . $quote . ')';
                        }
                    },
                    $style
                );
                
                if ($new_style !== $style) {
                    $el->setAttribute('style', $new_style);
                }
            }
        }
    }

    private function strip_preloaders($doc, $body_node)
    {
        $preloader_keywords = ['preload', 'loader', 'loading', 'spinner', 'pace'];
        $preloader_selectors = [
            '#preloader', '#pre-loader', '#preloader-it', '#page-preloader',
            '#site-preloader', '#loader', '#loading', '#page-loader',
            '.preloader', '.pre-loader', '.preloader-wrapper', '.preloader-container',
            '.loader', '.loading', '.site-loader', '.page-loader',
            '.preload', '.preload-wrapper', '.preloading',
        ];

        $nodes_to_remove = [];

        foreach ($preloader_selectors as $sel) {
            $is_id = $sel[0] === '#';
            $is_class = $sel[0] === '.';
            $name = substr($sel, 1);

            if ($is_id) {
                $el = $doc->getElementById($name);
                if ($el) {
                    $nodes_to_remove[spl_object_hash($el)] = $el;
                }
                continue;
            }

            if ($is_class) {
                foreach ($doc->getElementsByTagName('*') as $el) {
                    $classes = preg_split('/\s+/', trim($el->getAttribute('class')));
                    if (in_array($name, $classes, true)) {
                        $nodes_to_remove[spl_object_hash($el)] = $el;
                    }
                }
            }
        }

        foreach ($doc->getElementsByTagName('*') as $el) {
            $attrs = strtolower(implode(' ', [
                (string) $el->getAttribute('id'),
                (string) $el->getAttribute('class'),
                (string) $el->getAttribute('data-role'),
                (string) $el->getAttribute('data-testid'),
                (string) $el->getAttribute('aria-label'),
            ]));
            $style = strtolower((string) $el->getAttribute('style'));

            $keyword_hit = false;
            foreach ($preloader_keywords as $keyword) {
                if (strpos($attrs, $keyword) !== false) {
                    $keyword_hit = true;
                    break;
                }
            }
            if (!$keyword_hit) {
                continue;
            }

            $has_position = strpos($style, 'position:fixed') !== false
                || strpos($style, 'position: fixed') !== false
                || strpos($style, 'position:absolute') !== false
                || strpos($style, 'position: absolute') !== false;
            $has_viewport_size = strpos($style, '100vh') !== false
                || strpos($style, '100vw') !== false
                || strpos($style, 'top:0') !== false
                || strpos($style, 'left:0') !== false
                || strpos($style, 'right:0') !== false
                || strpos($style, 'bottom:0') !== false;
            $has_high_z = preg_match('/z-index\s*:\s*(\d+)/i', $style, $match) && intval($match[1]) >= 90;
            $is_root_like = $el->parentNode === $body_node || strtolower($el->nodeName) === 'div';

            if (($has_position && ($has_viewport_size || $has_high_z)) || ($has_high_z && $is_root_like)) {
                $nodes_to_remove[spl_object_hash($el)] = $el;
            }
        }

        foreach ($nodes_to_remove as $el) {
            if ($el->parentNode) {
                $el->parentNode->removeChild($el);
            }
        }

        $script_nodes = [];
        foreach ($body_node->getElementsByTagName('script') as $script) {
            if ($script->hasAttribute('src')) {
                continue;
            }
            $script_text = strtolower($script->textContent);
            if (
                preg_match('/preload|loader|loading|spinner|pace/i', $script_text)
                && preg_match('/window\.onload|domcontentloaded|addeventlistener\s*\(\s*[\'"]load|classlist\.add|style\.display|remove\s*\(/i', $script_text)
            ) {
                $script_nodes[] = $script;
            }
        }
        foreach ($script_nodes as $script) {
            if ($script->parentNode) {
                $script->parentNode->removeChild($script);
            }
        }
    }
}