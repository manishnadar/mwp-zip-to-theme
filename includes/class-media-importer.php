<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Media_Importer
{
    public function import_images($images, $base_path)
    {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        $map = [];

        foreach ($images as $file) {
            $rel_path = str_replace(untrailingslashit($base_path) . '/', '', $file);

            // Create a safe temporary copy for media_handle_sideload, 
            // since it unlinks the uploaded tmp_name file.
            $tmp = wp_tempnam($file);
            copy($file, $tmp);

            $file_array = [
                'name'     => basename($file),
                'tmp_name' => $tmp
            ];

            // 0 means it isn't attached to a specific post by default
            $id = media_handle_sideload($file_array, 0);

            if (is_wp_error($id)) {
                @unlink($tmp);
                ZTT_Logger::log("Failed sideloading image: " . $file . " - Error: " . $id->get_error_message());
            } else {
                $url = wp_get_attachment_url($id);
                if ($url) {
                    $map[$rel_path] = $url;
                }
            }
        }

        return $map;
    }
}
