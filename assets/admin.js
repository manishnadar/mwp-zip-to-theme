jQuery(function () {

    const dropzone  = document.getElementById('ztt-dropzone');
    const fileInput = document.getElementById('ztt-file-input');
    const content   = document.getElementById('ztt-dropzone-content');
    const selected  = document.getElementById('ztt-file-selected');
    const fileName  = document.getElementById('ztt-file-name');
    const fileSize  = document.getElementById('ztt-file-size');
    const clearBtn  = document.getElementById('ztt-file-clear');
    const form      = document.getElementById('ztt-convert-form');
    const submitBtn = document.getElementById('ztt-submit-btn');
    const themeSlug = document.getElementById('ztt-theme-slug');
    const themeName = document.getElementById('ztt-theme-name');
    const slugPreview    = document.getElementById('ztt-slug-preview');
    const slugPreviewVal = document.getElementById('ztt-slug-preview-val');
    const runtimeProgress = document.getElementById('ztt-runtime-progress');
    const runtimeFill = document.getElementById('ztt-runtime-progress-fill');
    const runtimePercent = document.getElementById('ztt-runtime-progress-percent');
    const runtimeMsg = document.getElementById('ztt-runtime-progress-msg');

    if (!dropzone) return;

    // ── Drag and drop ──────────────────────────────────────────────────────
    ['dragenter', 'dragover'].forEach(ev =>
        dropzone.addEventListener(ev, function (e) {
            e.preventDefault();
            dropzone.classList.add('is-over');
        })
    );
    ['dragleave', 'drop'].forEach(ev =>
        dropzone.addEventListener(ev, function (e) {
            // Only remove when leaving the entire dropzone, not a child
            if (ev === 'dragleave' && dropzone.contains(e.relatedTarget)) return;
            e.preventDefault();
            dropzone.classList.remove('is-over');
        })
    );
    dropzone.addEventListener('drop', function (e) {
        const files = e.dataTransfer.files;
        if (files.length) {
            const file = files[0];
            if (!file.name.toLowerCase().endsWith('.zip')) {
                alert('Only ZIP files are allowed.');
                fileInput.value = '';
                return;
            }
            fileInput.files = files;
            showFile(file);
        }
    });

    // Click anywhere on the dropzone opens the file picker.
    // The file input is pointer-events:none in CSS, so this is the ONLY path.
    dropzone.addEventListener('click', function (e) {
        if (e.target.closest('#ztt-file-clear')) return;
        if (selected.style.display !== 'none') return; // file already chosen
        fileInput.click();
    });

    // ── File input change ─────────────────────────────────────────────────
    fileInput.addEventListener('change', function () {
        if (this.files.length) {
            const file = this.files[0];
            if (!file.name.toLowerCase().endsWith('.zip')) {
                alert('Only ZIP files are allowed.');
                this.value = '';
                return;
            }
            showFile(file);
        }
    });

    // ── Clear button ──────────────────────────────────────────────────────
    clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fileInput.value = '';
        content.style.display  = '';
        selected.style.display = 'none';
        dropzone.classList.remove('is-over');
    });

    function formatBytes(bytes) {
        if (bytes < 1024)    return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function showFile(file) {
        fileName.textContent   = file.name;
        fileSize.textContent   = formatBytes(file.size);
        content.style.display  = 'none';
        selected.style.display = '';
    }

    // ── Auto-slug from theme name ─────────────────────────────────────────
    function slugify(val) {
        return val.toLowerCase().trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    if (themeName && themeSlug) {
        themeName.addEventListener('input', function () {
            if (!themeSlug.dataset.touched) {
                const s = slugify(this.value);
                themeSlug.value = s;
                if (s) {
                    slugPreview.classList.add('is-visible');
                    slugPreviewVal.textContent = '/' + s + '/';
                } else {
                    slugPreview.classList.remove('is-visible');
                }
            }
        });
        themeSlug.addEventListener('input', function () {
            this.dataset.touched = '1';
            const s = slugify(this.value);
            if (s) {
                slugPreview.classList.add('is-visible');
                slugPreviewVal.textContent = '/' + s + '/';
            } else {
                slugPreview.classList.remove('is-visible');
            }
        });
    }

    // ── Step progress indicator ───────────────────────────────────────────
    function updateProgress() {
        const steps = document.querySelectorAll('.ztt-progress__step');
        const hasFile  = fileInput.files && fileInput.files.length > 0;
        const hasName  = themeName && themeName.value.trim() !== '';
        const hasSlug  = themeSlug && themeSlug.value.trim() !== '';
        const isConfig = hasName && hasSlug;

        steps.forEach((s, i) => s.classList.remove('is-done', 'is-active'));

        if (!hasFile) {
            steps[0].classList.add('is-active');
        } else if (!isConfig) {
            steps[0].classList.add('is-done');
            steps[1].classList.add('is-active');
        } else {
            steps[0].classList.add('is-done');
            steps[1].classList.add('is-done');
            steps[2].classList.add('is-active');
        }
    }

    fileInput.addEventListener('change', updateProgress);
    if (themeName) themeName.addEventListener('input', updateProgress);
    if (themeSlug) themeSlug.addEventListener('input', updateProgress);
    updateProgress();

    let progressPoll = null;

    function setRuntimeProgress(percent, message) {
        if (!runtimeProgress) return;
        runtimeProgress.style.display = '';
        const p = Math.max(0, Math.min(100, Number(percent) || 0));
        if (runtimeFill) runtimeFill.style.width = p + '%';
        if (runtimePercent) runtimePercent.textContent = p + '%';
        if (runtimeMsg && message) runtimeMsg.textContent = message;
    }

    function startProgressPolling() {
        if (!window.zttAdminData?.ajaxUrl || !window.zttAdminData?.nonce) return;
        if (progressPoll) clearInterval(progressPoll);
        progressPoll = setInterval(() => {
            jQuery.post(window.zttAdminData.ajaxUrl, {
                action: 'ztt_convert_progress',
                _wpnonce: window.zttAdminData.nonce
            }).done((res) => {
                if (!res || !res.success || !res.data) return;
                setRuntimeProgress(res.data.percent, res.data.message);
                if (res.data.status === 'done' || res.data.status === 'error') {
                    clearInterval(progressPoll);
                    progressPoll = null;
                }
            });
        }, 700);
    }

    // ── Submit loading state + async conversion with live progress ───────
    if (form && submitBtn) {
        form.addEventListener('submit', function (e) {
            if (!fileInput.files || !fileInput.files.length) {
                e.preventDefault();
                dropzone.classList.add('is-over');
                setTimeout(() => dropzone.classList.remove('is-over'), 1200);
                return;
            }
            e.preventDefault();
            submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;
            submitBtn.querySelector('.ztt-btn__label').textContent = 'Converting…';

            // Update progress to step 3
            const steps = document.querySelectorAll('.ztt-progress__step');
            steps.forEach(s => s.classList.remove('is-done', 'is-active'));
            steps[0].classList.add('is-done');
            steps[1].classList.add('is-done');
            steps[2].classList.add('is-done');
            steps[3].classList.add('is-active');

            setRuntimeProgress(2, 'Starting conversion…');
            startProgressPolling();

            const fd = new FormData(form);
            fd.append('action', 'ztt_convert');
            if (!fd.get('_wpnonce') && window.zttAdminData?.nonce) {
                fd.append('_wpnonce', window.zttAdminData.nonce);
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', window.zttAdminData?.ajaxUrl || window.ajaxurl, true);

            xhr.upload.onprogress = function (evt) {
                if (!evt.lengthComputable) return;
                // Reserve 0-20% for upload, server stages fill remaining range.
                const uploadPercent = Math.min(20, Math.round((evt.loaded / evt.total) * 20));
                setRuntimeProgress(uploadPercent, 'Uploading ZIP archive…');
            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (progressPoll) {
                    clearInterval(progressPoll);
                    progressPoll = null;
                }

                try {
                    const resp = JSON.parse(xhr.responseText || '{}');
                    if (xhr.status >= 200 && xhr.status < 300 && resp.success) {
                        setRuntimeProgress(100, 'Conversion completed. Redirecting…');
                        const redirectUrl = resp.data?.redirect || window.zttAdminData?.successUrl;
                        setTimeout(() => {
                            if (redirectUrl) window.location.href = redirectUrl;
                            else window.location.reload();
                        }, 650);
                        return;
                    }
                    throw new Error(resp.data?.message || 'Conversion failed');
                } catch (err) {
                    setRuntimeProgress(100, err.message || 'Conversion failed.');
                    submitBtn.classList.remove('is-loading');
                    submitBtn.disabled = false;
                    submitBtn.querySelector('.ztt-btn__label').textContent = 'Convert to WordPress Theme';
                    alert(err.message || 'Conversion failed.');
                }
            };

            xhr.send(fd);
        });
    }
});
