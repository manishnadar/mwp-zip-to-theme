<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Analyzer
{

    public function analyze($path)
    {

        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));

        $base_path = rtrim($path, '/\\') . DIRECTORY_SEPARATOR;

        $html = [];
        $assets = [];
        $images = [];
        
        $allowed_assets = ['css', 'js', 'woff', 'woff2', 'ttf', 'eot', 'mp4', 'webm', 'mp3', 'json', 'xml', 'txt', 'csv', 'pdf'];
        $allowed_images = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];

        foreach ($files as $file) {

            if ($file->isDir())
                continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            $rel_path = str_replace($base_path, '', $file->getPathname());
            $rel_path = ltrim(str_replace('\\', '/', $rel_path), '/');

            if ($ext === 'html') {
                $p = strtolower($rel_path);

                // Ignore bundled vendor/library HTML (e.g. assets/lib/...).
                if (preg_match('#^assets/#', $p)) continue;

                // Ignore common bundled/vendor content by path segments.
                if (preg_match('#(^|/)(lib|libs|docs|documentation|demo|demos|test|tests|vendor|node_modules)(/|$)#', $p)) {
                    continue;
                }

                $html[] = $file->getPathname();
            } elseif (in_array($ext, $allowed_assets)) {
                $assets[] = $file->getPathname();
            } elseif (in_array($ext, $allowed_images)) {
                $assets[] = $file->getPathname(); // Keep in assets for CSS / copying to theme
                $images[] = $file->getPathname(); // Dedicated array for media library sideload
            }
        }

        if (empty($html)) {
            wp_die('No HTML found');
        }

        return [
            'html' => $html,
            'assets' => $assets,
            'images' => $images,
            'base_path' => $path
        ];
    }
}