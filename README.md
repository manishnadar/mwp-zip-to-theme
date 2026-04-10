# MWP ZIP to Theme Converter

A powerful WordPress plugin designed to seamlessly convert static HTML website templates (ZIP files) into fully functional, block-editor-friendly WordPress themes. It bridges the gap between static templates and dynamic WordPress structures by auto-generating the theme structure, converting content into pages, and embedding a premium React-based Visual Editor for post-import customizations.

## 🚀 Key Features

### 1. Automated Theme Generation
Instantly scaffolds a complete WordPress theme from static assets.
* Creates `style.css`, `functions.php`, `header.php`, `footer.php`, and `index.php` dynamically using your template's markup.
* Automatically enqueues stylesheet paths and activates required WordPress core features.

### 2. Intelligent Page Parsing
Converts standalone HTML files into WordPress Pages.
* `index.html` is automatically assigned as the Front Page.
* Maps `href` and `src` paths from relative template locations to WordPress-native absolute URIs seamlessly.
* Intelligently wraps legacy HTML into block-friendly wrappers (e.g., `<!-- wp:paragraph -->`, `<!-- wp:html -->`) so elements co-exist harmoniously with the native WordPress block system.

### 3. Bullet-Proof CSS & Asset Processing
Pre-built HTML templates notoriously lack optimization for visual builders. The Asset Manager analyzes and fixes problematic CSS behaviors during the conversion layer:
* **Animation Visibility Fixes**: Replaces `animation-fill-mode: both` with `forwards` to prevent elements from permanently freezing at `opacity: 0` if animations fail to execute.
* **Auto-Reveal Fallbacks**: Native scroll-reveal libraries (AOS, ScrollReveal) are automatically mapped. The plugin detects classes like `.fade-up`, `.reveal`, `[data-aos]` and rewrites them into pure-CSS auto-resolving animations, guaranteeing elements do not disappear permanently inside visual builder contexts where JS may be delayed.
* **Aggressive Layout Un-Clipping**: Automatically neutralizes overly aggressive `overflow: hidden` declarations on master wrappers (`#full-container`, `body`, `wrapper`) converting them to `overflow-x: clip`, preserving horizontal locks but unlocking vertical limits so Visual Editor borders aren't disrupted.

### 4. Integrated World-Class Visual Editor
Ships with a native React-based visual builder interface constructed with **GrapesJS** under the hood.
* Replaces the fragmented WP backend viewing experience with a sleek, dark-glassmorphic, modern workspace interface.
* Direct element-level customization, layout restructuring, drag-and-drop operations, and component saving with deep integration into your newly created theme pages.

## 📦 Installation

1. Upload the `mwp-zip-to-theme` folder to your `/wp-content/plugins/` directory.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Once activated, dependencies (such as the React editor) should be installed via `npm run build` inside the `react-editor` folder if making development changes.

## 📝 Usage Guide

1. Navigate to the **"ZIP to Theme Converter"** tab in your WordPress admin dashboard.
2. Provide a Theme Name and ZIP file containing your static HTML template (Ensure `index.html`, and `assets/` directories exist at the root).
3. The plugin will run its processing layer (extracting, transforming CSS, pulling assets to WP Media, and rewriting routing).
4. Navigate to **Pages** — your HTML files will be mapped here.
5. Click **"Visual Editor"** on any page to open the React visual playground and begin modifying the underlying structure.

---

*Note: Developed and customized for cohesive AI and modern web workflow integration.*
