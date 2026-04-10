<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Extractor
{

    public function extract($zip_file)
    {

        $upload_dir = wp_upload_dir();
        $target = $upload_dir['basedir'] . '/ztt-temp/' . time();

        wp_mkdir_p($target);

        $zip = new ZipArchive;

        if ($zip->open($zip_file) === TRUE) {
            $zip->extractTo($target);
            $zip->close();
        } else {
            wp_die('Extraction failed');
        }

        ZTT_Logger::log('Extracted to: ' . $target);

        return $target;
    }

    public function cleanup($target)
    {
        if (!empty($target) && is_dir($target)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($target, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );

            foreach ($files as $fileinfo) {
                if ($fileinfo->isDir()) {
                    rmdir($fileinfo->getRealPath());
                } else {
                    unlink($fileinfo->getRealPath());
                }
            }
            rmdir($target);
        }
    }
}