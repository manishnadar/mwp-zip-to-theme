(function() {
    if (!window.wp || !wp.plugins || !wp.editPost || !wp.element) return;

    const { registerPlugin } = wp.plugins;
    const { PluginMoreMenuItem } = wp.editPost;
    const { createElement, useEffect } = wp.element;

    const VisualEditorGutenberg = () => {
        useEffect(() => {
            const addToolbarButton = () => {
                const toolbar = document.querySelector('.edit-post-header__toolbar');
                if (toolbar && !document.getElementById('ztt-gutenberg-button')) {
                    const btn = document.createElement('a');
                    btn.id = 'ztt-gutenberg-button';
                    btn.href = zttGutenbergData.editorUrl;
                    btn.className = 'components-button is-primary ztt-gutenberg-btn';
                    btn.innerHTML = `
                        <span class="dashicons dashicons-layout" style="margin-right:8px; font-size:18px; width:18px; height:18px; line-height:1;"></span>
                        Edit with Visual Editor
                    `;
                    
                    // Styles to match the 'Premium' aesthetic and Elementor position
                    Object.assign(btn.style, {
                        backgroundColor: '#7c3aed',
                        borderColor: '#7c3aed',
                        color: '#fff',
                        marginLeft: '12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0 14px',
                        height: '32px',
                        fontSize: '13px',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    });

                    btn.onmouseover = () => {
                        btn.style.backgroundColor = '#6d28d9';
                        btn.style.boxShadow = '0 4px 12px rgba(124,58,237,0.4)';
                        btn.style.transform = 'translateY(-1px)';
                    };
                    btn.onmouseout = () => {
                        btn.style.backgroundColor = '#7c3aed';
                        btn.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)';
                        btn.style.transform = 'translateY(0)';
                    };
                    
                    toolbar.appendChild(btn);
                }
            };

            // Observer to handle Gutenberg's dynamic UI renders
            const observer = new MutationObserver(addToolbarButton);
            observer.observe(document.body, { childList: true, subtree: true });
            
            addToolbarButton();
            return () => observer.disconnect();
        }, []);

        // Also add to the "More" menu as a fallback for accessibility
        return createElement(PluginMoreMenuItem, {
            icon: 'layout',
            onClick: () => { window.location.href = zttGutenbergData.editorUrl; }
        }, 'Edit with Visual Editor');
    };

    registerPlugin('ztt-visual-editor-plugin', {
        render: VisualEditorGutenberg,
    });
})();
