<?php
if (!defined('ABSPATH')) exit;

class ZTT_API {
    /** SEO meta keys managed by this plugin (plain-text sanitised) */
    const SEO_KEYS = [
        'title', 'description', 'focus_keyword',
        'canonical', 'robots_noindex', 'robots_nofollow',
        'schema_type',   // e.g. "Article", "FAQPage", "LocalBusiness" …
    ];

    /** JSON-blob meta keys (stored raw, not sanitize_text_field) */
    const JSON_KEYS = ['schema_json', 'social_cards'];

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('wp_head',       [$this, 'output_seo_meta'], 1);
    }

    public function register_routes() {
        register_rest_route('ztt/v1', '/claude', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_claude_request'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);

        // GET  /ztt/v1/seo/{id}  — fetch SEO meta for a post
        // POST /ztt/v1/seo/{id}  — update SEO meta for a post
        register_rest_route('ztt/v1', '/seo/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_seo_meta'],
                'permission_callback' => function() { return current_user_can('manage_options'); },
                'args'                => ['id' => ['validate_callback' => 'is_numeric']],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'save_seo_meta'],
                'permission_callback' => function() { return current_user_can('manage_options'); },
                'args'                => ['id' => ['validate_callback' => 'is_numeric']],
            ],
        ]);
    }

    /** Return all ZTT SEO meta fields for a post. */
    public function get_seo_meta(WP_REST_Request $request) {
        $post_id = (int) $request['id'];
        if (!get_post($post_id)) {
            return new WP_Error('not_found', 'Post not found', ['status' => 404]);
        }
        $data = [];
        foreach (self::SEO_KEYS as $key) {
            $data[$key] = get_post_meta($post_id, '_ztt_seo_' . $key, true) ?: '';
        }
        // JSON blob fields — stored as raw JSON strings, returned as decoded objects/arrays.
        foreach (self::JSON_KEYS as $jkey) {
            $raw     = get_post_meta($post_id, '_ztt_' . $jkey, true) ?: ($jkey === 'social_cards' ? '[]' : '{}');
            $decoded = json_decode($raw, true);
            $data[$jkey] = ($decoded !== null) ? $decoded : ($jkey === 'social_cards' ? [] : (object)[]);
        }
        return rest_ensure_response($data);
    }

    /** Save ZTT SEO meta fields for a post. */
    public function save_seo_meta(WP_REST_Request $request) {
        $post_id = (int) $request['id'];
        if (!get_post($post_id)) {
            return new WP_Error('not_found', 'Post not found', ['status' => 404]);
        }
        $params = $request->get_json_params() ?: [];

        // Plain-text fields
        foreach (self::SEO_KEYS as $key) {
            if (array_key_exists($key, $params)) {
                $value = sanitize_text_field(wp_unslash((string) $params[$key]));
                update_post_meta($post_id, '_ztt_seo_' . $key, $value);
            }
        }

        // JSON blob fields — accept array/object from parsed JSON body, store as JSON string.
        foreach (self::JSON_KEYS as $jkey) {
            if (!array_key_exists($jkey, $params)) continue;
            $raw = $params[$jkey];
            if (is_array($raw) || is_object($raw)) {
                $encoded = wp_json_encode($raw);
            } else {
                $decoded = json_decode(wp_unslash((string) $raw), true);
                $empty   = $jkey === 'social_cards' ? '[]' : '{}';
                $encoded = ($decoded !== null) ? wp_json_encode($decoded) : $empty;
            }
            update_post_meta($post_id, '_ztt_' . $jkey, $encoded);
        }

        return rest_ensure_response(['success' => true]);
    }

    /** Inject SEO meta tags into the page <head> on the frontend. */
    public function output_seo_meta() {
        if (is_admin()) return;
        $post_id = get_queried_object_id();
        if (!$post_id) return;

        $gmeta = function($key) use ($post_id) {
            return get_post_meta($post_id, '_ztt_seo_' . $key, true) ?: '';
        };

        $title    = $gmeta('title');
        $desc     = $gmeta('description');
        $canonical = $gmeta('canonical');
        $noindex  = $gmeta('robots_noindex');
        $nofollow = $gmeta('robots_nofollow');

        // social_cards — array of { platform, title, description, image }
        $cards_raw    = get_post_meta($post_id, '_ztt_social_cards', true) ?: '[]';
        $social_cards = json_decode($cards_raw, true) ?: [];

        // Pick the first OG card and first Twitter card (fallback to meta title/desc)
        $og_card = null;
        $tw_card = null;
        foreach ($social_cards as $card) {
            $p = strtolower($card['platform'] ?? '');
            if (!$og_card && $p === 'og')      $og_card = $card;
            if (!$tw_card && $p === 'twitter') $tw_card = $card;
        }

        $og_t = esc_attr($og_card['title']       ?? $title);
        $og_d = esc_attr($og_card['description']  ?? $desc);
        $og_i = esc_url($og_card['image']         ?? '');
        $tw_t = esc_attr($tw_card['title']        ?? $og_t);
        $tw_d = esc_attr($tw_card['description']  ?? $og_d);
        $tw_i = esc_url($tw_card['image']         ?? $og_i);

        // Only output if at least one field is set
        if (!$title && !$desc && !$canonical && !$og_t && !$og_i && !$social_cards) return;

        echo "\n<!-- ZTT SEO Meta -->\n";

        if ($title) {
            echo '<title>' . esc_html($title) . '</title>' . "\n";
        }
        if ($desc) {
            echo '<meta name="description" content="' . esc_attr($desc) . '">' . "\n";
        }

        $robots_parts = [($noindex === '1' ? 'noindex' : 'index'), ($nofollow === '1' ? 'nofollow' : 'follow')];
        echo '<meta name="robots" content="' . implode(', ', $robots_parts) . '">' . "\n";

        if ($canonical) {
            echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";
        }

        // Open Graph
        if ($og_t) echo '<meta property="og:title" content="'       . $og_t . '">' . "\n";
        if ($og_d) echo '<meta property="og:description" content="' . $og_d . '">' . "\n";
        if ($og_i) echo '<meta property="og:image" content="'       . $og_i . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:url" content="' . esc_url(get_permalink($post_id)) . '">' . "\n";

        // Twitter Card
        echo '<meta name="twitter:card" content="' . ($tw_i ? 'summary_large_image' : 'summary') . '">' . "\n";
        if ($tw_t) echo '<meta name="twitter:title" content="'       . $tw_t . '">' . "\n";
        if ($tw_d) echo '<meta name="twitter:description" content="' . $tw_d . '">' . "\n";
        if ($tw_i) echo '<meta name="twitter:image" content="'       . $tw_i . '">' . "\n";

        echo "<!-- /ZTT SEO Meta -->\n";

        // ── Structured Data (JSON-LD) ──────────────────────────────────────
        $schema_type = get_post_meta($post_id, '_ztt_seo_schema_type', true) ?: '';
        if (!$schema_type) return;

        $raw_json = get_post_meta($post_id, '_ztt_schema_json', true) ?: '{}';
        $d        = json_decode($raw_json, true) ?: [];
        $url      = get_permalink($post_id);

        $ld = ['@context' => 'https://schema.org', '@type' => $schema_type];

        switch ($schema_type) {

            case 'Article':
            case 'NewsArticle':
            case 'BlogPosting':
                $ld['headline']         = $d['headline']         ?? ($title ?: '');
                $ld['description']      = $d['description']      ?? ($desc  ?: '');
                $ld['url']              = $url;
                if (!empty($d['image']))           $ld['image']          = $d['image'];
                if (!empty($d['date_published']))  $ld['datePublished']  = $d['date_published'];
                if (!empty($d['date_modified']))   $ld['dateModified']   = $d['date_modified'];
                if (!empty($d['author_name'])) {
                    $ld['author'] = ['@type' => 'Person', 'name' => $d['author_name']];
                    if (!empty($d['author_url'])) $ld['author']['url'] = $d['author_url'];
                }
                if (!empty($d['publisher_name'])) {
                    $ld['publisher'] = ['@type' => 'Organization', 'name' => $d['publisher_name']];
                    if (!empty($d['publisher_logo'])) {
                        $ld['publisher']['logo'] = ['@type' => 'ImageObject', 'url' => $d['publisher_logo']];
                    }
                }
                break;

            case 'WebSite':
                $ld['name'] = $d['name'] ?? get_bloginfo('name');
                $ld['url']  = $d['url']  ?? home_url('/');
                if (!empty($d['description'])) $ld['description'] = $d['description'];
                if (!empty($d['search_url'])) {
                    $ld['potentialAction'] = [
                        '@type'       => 'SearchAction',
                        'target'      => ['@type' => 'EntryPoint', 'urlTemplate' => $d['search_url']],
                        'query-input' => 'required name=search_term_string',
                    ];
                }
                break;

            case 'WebPage':
                $ld['name']        = $d['name']        ?? ($title ?: '');
                $ld['description'] = $d['description'] ?? ($desc  ?: '');
                $ld['url']         = $d['url']         ?? $url;
                break;

            case 'LocalBusiness':
                $biz_type        = !empty($d['type']) ? $d['type'] : 'LocalBusiness';
                $ld['@type']     = $biz_type;
                $ld['name']      = $d['name']        ?? '';
                $ld['url']       = $d['url']         ?? $url;
                if (!empty($d['description']))  $ld['description']  = $d['description'];
                if (!empty($d['image']))        $ld['image']        = $d['image'];
                if (!empty($d['telephone']))    $ld['telephone']    = $d['telephone'];
                if (!empty($d['email']))        $ld['email']        = $d['email'];
                if (!empty($d['price_range']))  $ld['priceRange']   = $d['price_range'];
                if (!empty($d['opening_hours'])) $ld['openingHours'] = $d['opening_hours'];
                $addr = array_filter([
                    '@type'           => 'PostalAddress',
                    'streetAddress'   => $d['street']      ?? '',
                    'addressLocality' => $d['city']        ?? '',
                    'addressRegion'   => $d['state']       ?? '',
                    'postalCode'      => $d['postal_code'] ?? '',
                    'addressCountry'  => $d['country']     ?? '',
                ], fn($v) => $v !== '');
                if (count($addr) > 1) $ld['address'] = $addr;
                break;

            case 'Organization':
                $ld['name']  = $d['name'] ?? '';
                $ld['url']   = $d['url']  ?? $url;
                if (!empty($d['logo']))        $ld['logo']        = ['@type' => 'ImageObject', 'url' => $d['logo']];
                if (!empty($d['description'])) $ld['description'] = $d['description'];
                if (!empty($d['email']))       $ld['email']       = $d['email'];
                if (!empty($d['telephone']))   $ld['telephone']   = $d['telephone'];
                $socials = array_filter([
                    $d['social_facebook']  ?? '',
                    $d['social_twitter']   ?? '',
                    $d['social_linkedin']  ?? '',
                    $d['social_instagram'] ?? '',
                ]);
                if ($socials) $ld['sameAs'] = array_values($socials);
                break;

            case 'Person':
                $ld['name'] = $d['name'] ?? '';
                if (!empty($d['job_title']))   $ld['jobTitle']    = $d['job_title'];
                if (!empty($d['description'])) $ld['description'] = $d['description'];
                if (!empty($d['image']))       $ld['image']       = $d['image'];
                if (!empty($d['email']))       $ld['email']       = $d['email'];
                if (!empty($d['url']))         $ld['url']         = $d['url'];
                $socials = array_filter([
                    $d['social_facebook'] ?? '',
                    $d['social_twitter']  ?? '',
                    $d['social_linkedin'] ?? '',
                ]);
                if ($socials) $ld['sameAs'] = array_values($socials);
                break;

            case 'Product':
                $ld['name'] = $d['name'] ?? '';
                if (!empty($d['description'])) $ld['description'] = $d['description'];
                if (!empty($d['image']))       $ld['image']       = $d['image'];
                if (!empty($d['brand']))       $ld['brand']       = ['@type' => 'Brand', 'name' => $d['brand']];
                if (!empty($d['sku']))         $ld['sku']         = $d['sku'];
                if (!empty($d['price']) || !empty($d['currency'])) {
                    $ld['offers'] = [
                        '@type'         => 'Offer',
                        'price'         => $d['price']        ?? '',
                        'priceCurrency' => $d['currency']     ?? 'USD',
                        'availability'  => 'https://schema.org/' . ($d['availability'] ?? 'InStock'),
                    ];
                }
                if (!empty($d['rating_value'])) {
                    $ld['aggregateRating'] = [
                        '@type'       => 'AggregateRating',
                        'ratingValue' => $d['rating_value'],
                        'reviewCount' => $d['rating_count'] ?? '1',
                    ];
                }
                break;

            case 'FAQPage':
                $pairs = $d['faq_pairs'] ?? [];
                if (is_array($pairs) && $pairs) {
                    $ld['mainEntity'] = array_values(array_map(function($p) {
                        return [
                            '@type'          => 'Question',
                            'name'           => $p['question'] ?? '',
                            'acceptedAnswer' => ['@type' => 'Answer', 'text' => $p['answer'] ?? ''],
                        ];
                    }, array_filter($pairs, fn($p) => !empty($p['question']))));
                }
                break;

            case 'BreadcrumbList':
                $items = $d['breadcrumb_items'] ?? [];
                if (is_array($items) && $items) {
                    $ld['itemListElement'] = array_values(array_map(function($item, $pos) {
                        return [
                            '@type'    => 'ListItem',
                            'position' => $pos + 1,
                            'name'     => $item['name'] ?? '',
                            'item'     => $item['url']  ?? '',
                        ];
                    }, $items, array_keys($items)));
                }
                break;

            case 'Service':
                $ld['name'] = $d['name'] ?? '';
                if (!empty($d['service_type']))  $ld['serviceType']  = $d['service_type'];
                if (!empty($d['description']))   $ld['description']  = $d['description'];
                if (!empty($d['image']))         $ld['image']        = $d['image'];
                if (!empty($d['url']))           $ld['url']          = $d['url'];
                if (!empty($d['area_served']))   $ld['areaServed']   = $d['area_served'];
                if (!empty($d['price_range']))   $ld['offers']       = ['@type' => 'Offer', 'priceSpecification' => $d['price_range']];
                if (!empty($d['provider_name'])) {
                    $ld['provider'] = ['@type' => 'Organization', 'name' => $d['provider_name']];
                    if (!empty($d['provider_url'])) $ld['provider']['url'] = $d['provider_url'];
                }
                break;

            case 'Event':
                $ld['name'] = $d['name'] ?? '';
                if (!empty($d['description']))     $ld['description'] = $d['description'];
                if (!empty($d['image']))           $ld['image']       = $d['image'];
                if (!empty($d['url']))             $ld['url']         = $d['url'];
                if (!empty($d['start_date']))      $ld['startDate']   = $d['start_date'];
                if (!empty($d['end_date']))        $ld['endDate']     = $d['end_date'];
                if (!empty($d['event_status']))    $ld['eventStatus'] = 'https://schema.org/' . $d['event_status'];
                if (!empty($d['event_attendance'])) $ld['eventAttendanceMode'] = 'https://schema.org/' . $d['event_attendance'];
                if (!empty($d['location_name']) || !empty($d['location_address'])) {
                    $ld['location'] = ['@type' => 'Place', 'name' => $d['location_name'] ?? ''];
                    $ev_addr = array_filter([
                        '@type'           => 'PostalAddress',
                        'streetAddress'   => $d['location_address'] ?? '',
                        'addressLocality' => $d['location_city']    ?? '',
                        'addressCountry'  => $d['location_country'] ?? '',
                    ], fn($v) => $v !== '');
                    if (count($ev_addr) > 1) $ld['location']['address'] = $ev_addr;
                }
                if (!empty($d['organizer_name'])) {
                    $ld['organizer'] = ['@type' => 'Organization', 'name' => $d['organizer_name']];
                    if (!empty($d['organizer_url'])) $ld['organizer']['url'] = $d['organizer_url'];
                }
                if (!empty($d['offers_price'])) {
                    $ld['offers'] = [
                        '@type'         => 'Offer',
                        'price'         => $d['offers_price'],
                        'priceCurrency' => $d['offers_currency'] ?? 'USD',
                        'availability'  => 'https://schema.org/InStock',
                    ];
                }
                break;

            default:
                return; // Unknown type — skip output
        }

        echo "\n<!-- ZTT Schema JSON-LD -->\n";
        echo '<script type="application/ld+json">' . wp_json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
        echo "<!-- /ZTT Schema JSON-LD -->\n";
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
