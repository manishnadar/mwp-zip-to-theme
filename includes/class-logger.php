<?php
if (!defined('ABSPATH'))
    exit;

class ZTT_Logger
{

    private static $log = [];

    public static function log($msg)
    {
        $upload_dir = wp_upload_dir();
        $file = $upload_dir['basedir'] . '/ztt-log.txt';
        $timestamp = date('[Y-m-d H:i:s] ');
        file_put_contents($file, $timestamp . $msg . PHP_EOL, FILE_APPEND);
        self::$log[] = $msg;
    }

    public static function save()
    {
        $upload_dir = wp_upload_dir();
        $file = $upload_dir['basedir'] . '/ztt-log.txt';
        file_put_contents($file, implode(PHP_EOL, self::$log));
    }
}