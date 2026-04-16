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

class ZTT_Main
{

    public function __construct()
    {
        new ZTT_API();
        new ZTT_Admin();
        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), [ $this, 'remove_deactivate_link' ] );
    }

    public function remove_deactivate_link( $actions ) {
        unset( $actions['deactivate'] );
        return $actions;
    }
}

new ZTT_Main();