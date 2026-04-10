<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Logger
{

    private static $log = [];

    public static function log($msg)
    {
        self::$log[] = $msg;
    }

    public static function save()
    {
        $upload_dir = wp_upload_dir();
        $file = $upload_dir['basedir'] . '/ztt-log.txt';
        file_put_contents($file, implode(PHP_EOL, self::$log));
    }
}