<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Asset_Manager
{

    public function copy_assets($assets, $theme_path, $base_path, $image_map = [])
    {

        foreach ($assets as $file) {

            // Get original deep path
            $rel_path = str_replace(untrailingslashit($base_path) . '/', '', $file);
            $dest = untrailingslashit($theme_path) . '/assets/' . ltrim($rel_path, '/');
            
            $dest_dir = dirname($dest);
            if (!file_exists($dest_dir)) {
                wp_mkdir_p($dest_dir);
            }

            copy($file, $dest);

            // Post-process CSS: fix opacity:0 patterns that leave content invisible.
            if (strtolower(pathinfo($dest, PATHINFO_EXTENSION)) === 'css') {
                $this->fix_animation_css($dest);
                if (!empty($image_map)) {
                    $this->rewrite_css_images($dest, $image_map, $base_path, $file);
                }
            }
        }
    }

    /**
     * Fix two patterns that leave content invisible after import:
     *
     * 1. animation fill-mode: both
     *    `animation: fade-up .9s ease BOTH` — the 'both' fill-mode freezes the
     *    element at the @keyframes `from` state (opacity:0, translateY) BEFORE
     *    the animation fires. If the animation never plays (editor iframe, timing
     *    issue, prefers-reduced-motion), content stays invisible permanently.
     *    Fix: replace 'both' with 'forwards' — element is visible at natural
     *    opacity until animation fires, then stays at the `to` (visible) state.
     *
     * 2. JS-triggered .reveal { opacity:0 }
     *    These require JS to add .visible. We inject a CSS @keyframes fallback
     *    so they self-reveal without any JavaScript.
     */
    private function fix_animation_css($css_file)
    {
        $css = file_get_contents($css_file);
        if ($css === false) return;
        $changed = false;

        // ── Fix 1: animation fill-mode 'both' → 'forwards' ─────────────────
        // Targets the `animation` shorthand where 'both' is the fill-mode value.
        // We match the full animation declaration value (up to ; or }) and
        // replace only the standalone word 'both'.
        $patched = preg_replace_callback(
            '/(animation\s*:[^;}]+)\bboth\b/i',
            function ($m) {
                return preg_replace('/\bboth\b/', 'forwards', $m[0]);
            },
            $css
        );
        if ($patched !== $css) {
            $css = $patched;
            $changed = true;
        }

        // Also fix standalone animation-fill-mode property
        $patched = preg_replace(
            '/animation-fill-mode\s*:\s*both\b/i',
            'animation-fill-mode: forwards',
            $css
        );
        if ($patched !== $css) {
            $css = $patched;
            $changed = true;
        }

        // ── Fix 2: JS-revealed classes { opacity:0 } → self-revealing via CSS keyframe ──
        // Many themes use classes like .reveal, .fade-up, [data-aos], .aos-init to hide
        // elements initially (`opacity: 0`) and rely on JS to add .visible or .aos-animate.
        // We match any selector containing 'reveal', 'fade', or 'aos' that has `opacity: 0`.
        if (preg_match('/(?:reveal|fade|aos)[^\{]*\{[^}]*opacity\s*:\s*0/i', $css)) {
            $css = preg_replace_callback(
                '/([^{}]*(?:reveal|fade|aos)[^{]*)\{([^}]+)\}/i',
                function ($m) {
                    $selector = trim($m[1]);
                    $inner = $m[2];
                    
                    // Only process true initial-state hiding rules
                    if (posix_isatty(0)) {} // just a no-op to allow comments inside regex blocks
                    if (!preg_match('/opacity\s*:\s*0/i', $inner)) return $m[0];
                    if (preg_match('/@keyframes/i', $selector)) return $m[0]; // don't touch keyframes wrappers

                    if (strpos($inner, 'ztt-reveal-in') !== false) return $m[0];
                    if (strpos($inner, 'animation:') !== false && preg_match('/both/i', $inner) === 0) return $m[0]; // If it already has an animation without both, it might be something else

                    // Note: If the element is animated via JS, injecting a CSS animation is safe 
                    // as a fallback. It uses forwards to stay visible.
                    $inner = rtrim($inner, '; ') . ';animation:ztt-reveal-in .9s ease .1s forwards';
                    return $selector . '{' . $inner . '}';
                },
                $css
            );
            $css .= "\n\n"
                . "/* ── ZTT: auto-reveal keyframe (no JS required fallback) */\n"
                . "@keyframes ztt-reveal-in {\n"
                . "    to { opacity: 1; transform: translate(0, 0) scale(1); }\n"
                . "}\n"
                . "[class*='reveal'].visible, [class*='fade'].visible, [class*='fade'].aos-animate, [data-aos].aos-animate { opacity: 1 !important; transform: none !important; }\n";
            $changed = true;
        }

        // ── Fix 3: Global wrapper overflow:hidden clipping issues ──
        // Themes often put `overflow: hidden;` on `#full-container`, `.wrapper`, `body`, etc.
        // to prevent horizontal scrollbars, but this clips section boundaries in the visual
        // editor and cuts off fade-up animations. We convert these to `overflow-x: clip; overflow-y: visible;`
        if (preg_match('/overflow\s*:\s*hidden/i', $css)) {
            $patched = preg_replace_callback(
                '/([^{}]*)\{([^}]+)\}/i',
                function ($m) {
                    $selector = trim($m[1]);
                    $inner = $m[2];
                    // If it's a global wrapper or a section container
                    if (preg_match('/body|html|#full-container|\.wrapper|\#wrapper|\.main|\#main|section/i', $selector)) {
                        if (preg_match('/overflow\s*:\s*hidden/i', $inner)) {
                            // Safe replacement: only mask X axis, let Y axis breathe
                            $inner = preg_replace('/overflow\s*:\s*hidden\s*;/i', 'overflow-x: clip; overflow-y: visible;', $inner);
                            return $selector . '{' . $inner . '}';
                        }
                    }
                    return $m[0];
                },
                $css
            );
            if ($patched !== $css) {
                $css = $patched;
                $changed = true;
            }
        }

        if ($changed) {
            file_put_contents($css_file, $css);
        }
    }

    private function rewrite_css_images($css_file, $image_map, $base_path, $original_css_path)
    {
        $css = file_get_contents($css_file);
        if ($css === false) return;
        
        $original_css_dir = dirname($original_css_path);

        $new_css = preg_replace_callback(
            '/url\s*\(\s*([\'"]?)(.*?)\1\s*\)/i',
            function ($matches) use ($image_map, $base_path, $original_css_dir) {
                $quote = $matches[1];
                $url = $matches[2];

                if (preg_match('/^(http|https|data|ftp|mailto|tel):/i', $url) || strpos($url, '//') === 0 || strpos($url, '#') === 0 || empty($url)) {
                    return $matches[0];
                }

                $absolute_target = $this->normalize_path($original_css_dir . DIRECTORY_SEPARATOR . $url);
                $rel_to_base = str_replace(untrailingslashit($base_path) . DIRECTORY_SEPARATOR, '', $absolute_target);
                
                // Also try with forward slashes just in case
                $rel_to_base_fwd = str_replace('\\', '/', $rel_to_base);

                if (isset($image_map[$rel_to_base]) || isset($image_map[$rel_to_base_fwd])) {
                    $final_url = isset($image_map[$rel_to_base]) ? $image_map[$rel_to_base] : $image_map[$rel_to_base_fwd];
                    return 'url(' . $quote . $final_url . $quote . ')';
                }
                
                return $matches[0];
            },
            $css
        );

        if ($new_css !== $css) {
            file_put_contents($css_file, $new_css);
        }
    }

    private function normalize_path($path) {
        $path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
        
        // Handle root
        $is_absolute = strpos($path, DIRECTORY_SEPARATOR) === 0;
        
        $parts = array_filter(explode(DIRECTORY_SEPARATOR, $path), 'strlen');
        $absolutes = [];
        foreach ($parts as $part) {
            if ('.' == $part) continue;
            if ('..' == $part) {
                array_pop($absolutes);
            } else {
                $absolutes[] = $part;
            }
        }
        $prefix = $is_absolute ? DIRECTORY_SEPARATOR : '';
        return $prefix . implode(DIRECTORY_SEPARATOR, $absolutes);
    }
}