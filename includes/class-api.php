<?php
if (!defined('ABSPATH')) exit;

class ZTT_API {
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('ztt/v1', '/claude', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_claude_request'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
    }

    public function handle_claude_request(WP_REST_Request $request) {
        $params = $request->get_json_params();
        $api_key = isset($params['api_key']) ? sanitize_text_field($params['api_key']) : '';
        // sanitize_textarea_field strips all tags via wp_strip_all_tags — do NOT use it here.
        // The system prompt and user prompt contain HTML/XML tags that must reach the Anthropic API intact.
        // This endpoint is already protected by manage_options permission_callback.
        $prompt = isset($params['prompt']) ? wp_unslash( (string) $params['prompt'] ) : '';
        $system = isset($params['system']) ? wp_unslash( (string) $params['system'] ) : '';

        if (empty($api_key)) {
            return new WP_Error('no_key', 'Claude API Key required', ['status' => 400]);
        }

        $response = wp_remote_post('https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key' => $api_key,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json'
            ],
            'body' => wp_json_encode([
                'model' => 'claude-sonnet-4-6',
                'max_tokens' => 4000,
                'system' => $system,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]),
            'timeout' => 60,
            'sslverify' => false
        ]);

        if (is_wp_error($response)) {
            error_log('ZTT API Error: ' . $response->get_error_message());
            return new WP_Error('api_error', $response->get_error_message(), ['status' => 500]);
        }

        $body = wp_remote_retrieve_body($response);
        return rest_ensure_response(json_decode($body, true));
    }
}
