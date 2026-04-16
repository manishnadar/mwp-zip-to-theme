<?php
/**
 * Plugin Name: ZIP to Theme Converter
 * Description: Convert static HTML ZIP into WordPress Theme.
 * Version: 1.0
 * Author: Manish Nadar
 */

if (!defined('ABSPATH'))
    exit;

define('ZTT_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('ZTT_PLUGIN_URL', plugin_dir_url(__FILE__));

// Comma-separated list of allowed site URLs (no trailing slash).
// Add as many domains as needed, e.g.: 'http://localhost,https://staging.example.com'
define('ZTT_ALLOWED_DOMAINS', 'http://localhost/Wordpress_editor');

require_once ZTT_PLUGIN_PATH . 'includes/class-logger.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-security.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-uploader.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-extractor.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-analyzer.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-media-importer.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-template-parser.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-asset-manager.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-theme-generator.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-api.php';
require_once ZTT_PLUGIN_PATH . 'includes/class-admin.php';

function ztt_is_domain_allowed()
{
    $allowed = array_map('trim', explode(',', ZTT_ALLOWED_DOMAINS));
    $current = untrailingslashit(home_url());
    foreach ($allowed as $domain) {
        if (untrailingslashit($domain) === $current) {
            return true;
        }
    }
    return false;
}

class ZTT_Main
{

    public function __construct()
    {
        if (!ztt_is_domain_allowed()) {
            return; // Plugin disabled on this domain
        }
        new ZTT_API();
        new ZTT_Admin();
    }
}

new ZTT_Main();