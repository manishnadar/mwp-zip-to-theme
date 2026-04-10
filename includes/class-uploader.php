<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Uploader
{

    /**
     * WordPress-format allowed MIME map: [ 'extension' => 'mime/type' ]
     * Also covers all browser-reported variants for ZIP files.
     */
    private $wp_mimes = [
        'zip'  => 'application/zip',
        'zip2' => 'application/x-zip',
        'zip3' => 'application/x-zip-compressed',
        'zip4' => 'application/x-compressed',
        'zip5' => 'multipart/x-zip',
    ];

    /**
     * Flat list of allowed MIME type strings for quick in_array() checks.
     */
    private $allowed_mime_types = [
        'application/zip',
        'application/x-zip',
        'application/x-zip-compressed',
        'application/octet-stream',
        'application/x-compressed',
        'multipart/x-zip',
    ];

    public function upload($file)
    {
        require_once ABSPATH . 'wp-admin/includes/file.php';

        // 1. Basic extension check — bail early if it isn't even a .zip file.
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($ext !== 'zip') {
            wp_die('Only ZIP files are allowed.');
        }

        // 2. Hook into WordPress's allowed MIME list so wp_handle_upload
        //    doesn't reject the extension outright.
        add_filter('upload_mimes', [$this, 'allow_zip_mimes']);

        // 3. Hook into wp_check_filetype_and_ext to bypass WordPress's
        //    server-side finfo/mime_content_type sniffing.
        //    This is what produces "Sorry, you are not allowed to upload this file type."
        //    when the detected MIME doesn't match the whitelist.
        add_filter('wp_check_filetype_and_ext', [$this, 'override_filetype_check'], 10, 5);

        $upload = wp_handle_upload($file, [
            'test_form' => false,
            'mimes'     => $this->wp_mimes,   // correct format: ext => mime
        ]);

        // Clean up our temporary filters immediately.
        remove_filter('upload_mimes', [$this, 'allow_zip_mimes']);
        remove_filter('wp_check_filetype_and_ext', [$this, 'override_filetype_check'], 10);

        if (isset($upload['error'])) {
            wp_die('Upload error: ' . esc_html($upload['error']));
        }

        ZTT_Logger::log('ZIP Uploaded: ' . $upload['file']);

        return $upload['file'];
    }

    /**
     * Add all ZIP MIME types to WordPress's allowed upload list.
     */
    public function allow_zip_mimes($mimes)
    {
        return array_merge($mimes, $this->wp_mimes);
    }

    /**
     * Override WordPress's filetype check for ZIP files.
     *
     * WordPress calls wp_check_filetype_and_ext() which uses finfo or
     * mime_content_type() to detect the real MIME type server-side.
     * If the detected type isn't in its internal list it sets 'ext' and
     * 'type' to false — which triggers the "not allowed" error.
     *
     * We intercept this for .zip files and force the correct values.
     *
     * @param array       $data     { ext, type, proper_filename }
     * @param string      $file     Full path to the uploaded temp file
     * @param string      $filename Original filename
     * @param array|null  $mimes    Allowed MIME types
     * @param string|bool $real_mime Server-detected MIME type (WP 5.1+)
     */
    public function override_filetype_check($data, $file, $filename, $mimes, $real_mime = false)
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if ($ext === 'zip') {
            // Confirm it is actually a ZIP by checking the file magic bytes.
            $fh = @fopen($file, 'rb');
            if ($fh) {
                $magic = fread($fh, 4);
                fclose($fh);
                // ZIP magic: PK\x03\x04
                if (substr($magic, 0, 2) === 'PK') {
                    $data['ext']  = 'zip';
                    $data['type'] = 'application/zip';
                }
            }
        }

        return $data;
    }
}