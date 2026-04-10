<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Security
{

    public static function check_nonce()
    {
        if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'ztt_nonce')) {
            wp_die('Security check failed');
        }

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
    }

    public static function sanitize($data)
    {
        return sanitize_text_field($data);
    }
}