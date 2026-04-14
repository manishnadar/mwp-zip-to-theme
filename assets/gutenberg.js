(function ($) {
    'use strict';

    if (!window.wp || !window.jQuery || !wp.data) return;

    var BTN_ID  = 'ztt-visual-editor-btn-wrap';
    var editorUrl = (window.zttGutenbergData && zttGutenbergData.editorUrl) || '#';

    /* ── Button HTML (mirrors Elementor's switch-mode markup pattern) ─────── */
    var btnHtml =
        '<div id="' + BTN_ID + '" style="display:inline-flex;align-items:center;">' +
            '<a id="ztt-visual-editor-btn" href="' + editorUrl + '" ' +
               'class="components-button is-primary" ' +
               'style="' +
                   'background:#7c3aed !important;' +
                   'border-color:#6d28d9 !important;' +
                   'color:#fff !important;' +
                   'text-decoration:none;' +
                   'display:inline-flex;' +
                   'align-items:center;' +
                   'gap:6px;' +
                   'height:36px;' +
                   'padding:0 12px;' +
                   'font-size:13px;' +
                   'font-weight:600;' +
                   'border-radius:3px;' +
                   'box-shadow:0 2px 8px rgba(124,58,237,.30);' +
                   'transition:background .15s,box-shadow .15s,transform .15s;' +
                   'white-space:nowrap;' +
               '">' +
               '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
                    'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="flex-shrink:0;">' +
                 '<rect x="3"  y="3"  width="8" height="18" rx="1.5" fill="currentColor"/>' +
                 '<rect x="13" y="3"  width="8" height="8"  rx="1.5" fill="currentColor"/>' +
                 '<rect x="13" y="13" width="8" height="8"  rx="1.5" fill="currentColor"/>' +
               '</svg>' +
               'Edit with Visual Editor' +
            '</a>' +
        '</div>';

    /* ── Inject — mirroring Elementor's buildPanel() approach ──────────────── */
    function buildPanel() {
        if ($('#' + BTN_ID).length) return; // already injected

        var $toolbar = $('#editor').find('.edit-post-header-toolbar');
        if (!$toolbar.length) $toolbar = $('.edit-post-header-toolbar');
        if (!$toolbar.length) $toolbar = $('.editor-header__toolbar');
        if (!$toolbar.length) return;

        var $elementorBtn = $toolbar.find('#elementor-switch-mode');

        if ($elementorBtn.length) {
            /* Insert immediately before the Elementor button */
            $elementorBtn.before(btnHtml);
        } else {
            /* Elementor not active / not yet rendered — append to toolbar end */
            $toolbar.append(btnHtml);
        }

        /* Hover effects */
        $('#ztt-visual-editor-btn')
            .on('mouseenter', function () {
                $(this).css({
                    background:  '#6d28d9 !important',
                    boxShadow:   '0 4px 14px rgba(124,58,237,.45)',
                    transform:   'translateY(-1px)',
                });
            })
            .on('mouseleave', function () {
                $(this).css({
                    background:  '#7c3aed',
                    boxShadow:   '0 2px 8px rgba(124,58,237,.30)',
                    transform:   'translateY(0)',
                });
            });
    }

    /* ── Subscribe to wp.data exactly like Elementor does ──────────────────── */
    wp.data.subscribe(function () {
        setTimeout(buildPanel, 1);
    });

    /* Run once immediately in case the editor is already rendered */
    $(document).ready(function () {
        setTimeout(buildPanel, 300);
    });

}(jQuery));
