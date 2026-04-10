<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Analyzer
{

    public function analyze($path)
    {

        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));

        $html = [];
        $assets = [];
        $images = [];
        
        $allowed_assets = ['css', 'js', 'woff', 'woff2', 'ttf', 'eot', 'mp4', 'webm', 'mp3', 'json', 'xml', 'txt', 'csv', 'pdf'];
        $allowed_images = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];

        foreach ($files as $file) {

            if ($file->isDir())
                continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if ($ext === 'html') {
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