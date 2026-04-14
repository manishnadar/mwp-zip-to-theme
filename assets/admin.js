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

    // ── Submit loading state ──────────────────────────────────────────────
    if (form && submitBtn) {
        form.addEventListener('submit', function (e) {
            if (!fileInput.files || !fileInput.files.length) {
                e.preventDefault();
                dropzone.classList.add('is-over');
                setTimeout(() => dropzone.classList.remove('is-over'), 1200);
                return;
            }
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
        });
    }
});
