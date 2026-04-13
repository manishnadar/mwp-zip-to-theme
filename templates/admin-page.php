<?php if (isset($_GET['success'])): ?>
    <div class="ztt-notice ztt-notice--success">
        <span class="dashicons dashicons-yes-alt"></span>
        <div>
            <strong>Theme Converted &amp; Deployed!</strong>
            <p>Your WordPress theme is now live. Images were automatically imported to your Media Library. <a
                    href="<?php echo esc_url(admin_url('themes.php')); ?>">Manage Themes &rarr;</a></p>
        </div>
    </div>
<?php endif; ?>

<div class="ztt-page">

    <!-- ── Hero Header ───────────────────────────────────────────────────── -->
    <div class="ztt-header">
        <div class="ztt-header__icon">
            <span class="dashicons dashicons-archive"></span>
        </div>
        <div class="ztt-header__text">
            <h1>HTML → WordPress Theme</h1>
            <p>Drop any static HTML/ZIP archive and watch it transform into a fully native WordPress theme — with Media
                Library imports, pages, and AI-assisted layout editing.</p>
        </div>
        <div class="ztt-header__badge">
            <span class="dashicons dashicons-star-filled"></span>
            AI-Powered
        </div>
    </div>

    <!-- ── Progress Steps ────────────────────────────────────────────────── -->
    <div class="ztt-progress">
        <div class="ztt-progress__step is-active">
            <div class="ztt-progress__dot">1</div>
            <div class="ztt-progress__info">
                <div class="ztt-progress__label">Upload</div>
                <div class="ztt-progress__sub">Select ZIP archive</div>
            </div>
        </div>
        <div class="ztt-progress__line"></div>
        <div class="ztt-progress__step">
            <div class="ztt-progress__dot">2</div>
            <div class="ztt-progress__info">
                <div class="ztt-progress__label">Configure</div>
                <div class="ztt-progress__sub">Theme settings</div>
            </div>
        </div>
        <div class="ztt-progress__line"></div>
        <div class="ztt-progress__step">
            <div class="ztt-progress__dot">3</div>
            <div class="ztt-progress__info">
                <div class="ztt-progress__label">Convert</div>
                <div class="ztt-progress__sub">AI generates theme</div>
            </div>
        </div>
        <div class="ztt-progress__line"></div>
        <div class="ztt-progress__step">
            <div class="ztt-progress__dot">
                <span class="dashicons dashicons-yes" style="font-size:13px;width:13px;height:13px;"></span>
            </div>
            <div class="ztt-progress__info">
                <div class="ztt-progress__label">Live</div>
                <div class="ztt-progress__sub">Activate &amp; edit</div>
            </div>
        </div>
    </div>

    <!-- ── Main Layout ───────────────────────────────────────────────────── -->
    <div class="ztt-layout">

        <!-- ── Primary Form Card ─────────────────────────────────────────── -->
        <div class="ztt-card ztt-card--main">
            <form method="post" enctype="multipart/form-data"
                action="<?php echo esc_url(admin_url('admin-post.php')); ?>" id="ztt-convert-form">

                <?php wp_nonce_field('ztt_nonce'); ?>
                <input type="hidden" name="action" value="ztt_convert">

                <!-- ── Drop Zone ────────────────────────────────────────── -->
                <div class="ztt-dropzone" id="ztt-dropzone">
                    <div class="ztt-dropzone__border"></div>
                    <div class="ztt-dropzone__inner">
                        <input type="file" name="zip_file" id="ztt-file-input" accept=".zip" required>

                        <!-- Idle state -->
                        <div class="ztt-dropzone__content" id="ztt-dropzone-content">
                            <div class="ztt-dropzone__icon-wrap">
                                <div class="ztt-dropzone__icon-ring"></div>
                                <div class="ztt-dropzone__icon-bg">
                                    <span class="dashicons dashicons-upload"></span>
                                </div>
                            </div>
                            <p class="ztt-dropzone__title">Drop your ZIP archive here</p>
                            <p class="ztt-dropzone__sub">
                                Drag &amp; drop your <strong>.zip</strong> file, or <span
                                    class="ztt-dropzone__browse">browse to upload</span>
                            </p>
                            <div class="ztt-dropzone__pill">
                                <span class="dashicons dashicons-media-archive"></span>
                                Supports ZIP archives up to 64&thinsp;MB
                            </div>
                        </div>

                        <!-- File selected state -->
                        <div class="ztt-dropzone__selected" id="ztt-file-selected" style="display:none;">
                            <div class="ztt-dropzone__file-visual">
                                <span class="dashicons dashicons-media-archive"></span>
                            </div>
                            <div class="ztt-dropzone__file-info">
                                <span id="ztt-file-name" class="ztt-dropzone__file-name"></span>
                                <span id="ztt-file-size" class="ztt-dropzone__file-size"></span>
                                <span class="ztt-dropzone__file-badge">
                                    <span class="dashicons dashicons-yes"
                                        style="font-size:11px;width:11px;height:11px;"></span>
                                    Ready
                                </span>
                            </div>
                            <button type="button" class="ztt-dropzone__clear" id="ztt-file-clear" title="Remove file">
                                <span class="dashicons dashicons-no-alt"></span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ── Theme Configuration ───────────────────────────────── -->
                <div class="ztt-divider">Theme Configuration</div>

                <div class="ztt-fields">
                    <div class="ztt-field">
                        <label class="ztt-label" for="ztt-theme-name">
                            Theme Name <span class="ztt-required">*</span>
                            <span class="ztt-label-hint">Shown in WP Themes panel</span>
                        </label>
                        <div class="ztt-input-wrap">
                            <input type="text" name="theme_name" id="ztt-theme-name" class="ztt-input"
                                placeholder="e.g. My Modern Site" required autocomplete="off">
                        </div>
                    </div>

                    <div class="ztt-field">
                        <label class="ztt-label" for="ztt-theme-slug">
                            Unique Slug <span class="ztt-required">*</span>
                            <span class="ztt-label-hint">Auto-generated</span>
                        </label>
                        <div class="ztt-input-wrap">
                            <input type="text" name="theme_slug" id="ztt-theme-slug" class="ztt-input"
                                placeholder="e.g. my-modern-site" required autocomplete="off">
                        </div>
                        <div class="ztt-slug-preview" id="ztt-slug-preview">
                            <span class="dashicons dashicons-admin-links"
                                style="font-size:11px;width:11px;height:11px;"></span>
                            <span id="ztt-slug-preview-val"></span>
                        </div>
                    </div>

                    <div class="ztt-field ztt-field--full">
                        <label class="ztt-label" for="ztt-author">
                            Author Name
                        </label>
                        <div class="ztt-input-wrap">
                            <input type="text" name="author" id="ztt-author" class="ztt-input"
                                placeholder="Your name or company" autocomplete="off">
                        </div>
                    </div>
                </div>

                <!-- ── Deploy Options ────────────────────────────────────── -->
                <div class="ztt-divider">Deploy Options</div>

                <div class="ztt-toggle-row">
                    <label class="ztt-toggle" for="ztt-activate">
                        <input type="checkbox" name="activate" id="ztt-activate" value="1" checked>
                        <span class="ztt-toggle__switch"></span>
                        <div class="ztt-toggle__content">
                            <span class="ztt-toggle__label">Activate Theme Immediately</span>
                            <p class="ztt-toggle__hint">Switches the live theme right after conversion. Always
                                adjustable later via Appearance &rarr; Themes.</p>
                        </div>
                    </label>
                </div>

                <!-- ── Submit ─────────────────────────────────────────────── -->
                <div class="ztt-actions">
                    <button type="submit" class="ztt-btn ztt-btn--primary" id="ztt-submit-btn">
                        <span class="dashicons dashicons-update-alt ztt-btn__icon"></span>
                        <span class="ztt-btn__label">Convert to WordPress Theme</span>
                    </button>
                    <a href="#" class="ztt-btn ztt-btn--ghost"
                        onclick="document.getElementById('ztt-convert-form').reset(); return false;">
                        Reset
                    </a>
                </div>

            </form>
        </div>

        <!-- ── Sidebar ──────────────────────────────────────────────────── -->
        <aside class="ztt-sidebar">

            <!-- Stat row -->
            <div class="ztt-card" style="padding:0;overflow:hidden;">
                <div class="ztt-stat-row">
                    <div class="ztt-stat">
                        <span class="ztt-stat__val">100%</span>
                        <span class="ztt-stat__lbl">Native WP</span>
                    </div>
                    <div class="ztt-stat">
                        <span class="ztt-stat__val">Auto</span>
                        <span class="ztt-stat__lbl">Images</span>
                    </div>
                    <div class="ztt-stat">
                        <span class="ztt-stat__val">AI</span>
                        <span class="ztt-stat__lbl">Powered</span>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="ztt-card">
                <div class="ztt-card__header">
                    <span class="dashicons dashicons-lightbulb"></span>
                    How It Works
                </div>
                <ol class="ztt-steps">
                    <li>
                        <span class="ztt-steps__num">1</span>
                        <span>Upload your <strong>static HTML ZIP</strong> archive</span>
                    </li>
                    <li>
                        <span class="ztt-steps__num">2</span>
                        <span>Name your theme and configure <strong>deploy settings</strong></span>
                    </li>
                    <li>
                        <span class="ztt-steps__num">3</span>
                        <span>Engine <strong>converts HTML, imports images</strong> &amp; creates Pages</span>
                    </li>
                    <li>
                        <span class="ztt-steps__num">4</span>
                        <span>Polish in the <strong>Visual AI Editor</strong></span>
                    </li>
                </ol>
            </div>

            <!-- Best Results -->
            <div class="ztt-card">
                <div class="ztt-card__header">
                    <span class="dashicons dashicons-yes-alt"></span>
                    Best Results
                </div>
                <ul class="ztt-checklist">
                    <li><span class="dashicons dashicons-yes"></span> <code>index.html</code> at root</li>
                    <li><span class="dashicons dashicons-yes"></span> Standard folder structure (css/, js/, img/)</li>
                    <li><span class="dashicons dashicons-yes"></span> Clean, semantic HTML5 markup</li>
                    <li><span class="dashicons dashicons-yes"></span> Relative asset paths</li>
                    <li><span class="dashicons dashicons-yes"></span> Images inside ZIP for auto-import</li>
                </ul>
            </div>

            <!-- Visual AI Editor CTA -->
            <div class="ztt-card">
                <div class="ztt-card__header">
                    <span class="dashicons dashicons-editor-kitchensink"></span>
                    Visual AI Editor
                </div>
                <div class="ztt-feature-card">
                    <p>After conversion, refine your layout with the drag-and-drop GrapesJS editor — powered by an AI
                        assistant for instant changes.</p>
                    <a href="<?php echo esc_url(admin_url('edit.php?post_type=page')); ?>" class="ztt-link-btn">
                        <span class="dashicons dashicons-admin-page"></span>
                        Open Pages &amp; Edit
                    </a>
                </div>
            </div>

        </aside>

    </div>
</div>