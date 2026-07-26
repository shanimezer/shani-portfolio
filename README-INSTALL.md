# Shani Portfolio CMS Builder

This package contains only the CMS files. It is designed to be copied into the existing static portfolio repository.

## Files to replace

Replace these three existing files/folders:

1. `admin/index.html`
2. `admin/admin.css`
3. `admin/admin.js`
4. `assets/cms.js`

Keep your existing public website files, CSS, homepage, work pages and project pages unchanged for now.

## File to keep

Keep your existing:

`data/projects.js`

The new CMS reads it automatically and migrates old projects into the block structure. A sample copy is included only so this package can be tested by itself.

## Recommended copy process with GitHub Desktop

1. Open the local repository folder from GitHub Desktop using **Repository > Show in Finder**.
2. Copy the `admin` folder from this package into the repository and approve replacing the old files.
3. Copy `assets/cms.js` into the repository's `assets` folder and replace the old file.
4. Do not replace the rest of the public website yet.
5. Open `admin/index.html` in the browser to test.
6. In GitHub Desktop, review the four changed files.
7. Commit with a message such as `Add Making Of CMS builder`.
8. Click **Push origin**.

## How the static GitHub workflow works

The editor saves drafts to `localStorage`, so editing is immediate and safe in your browser.

To publish data to the website:

1. Open the CMS.
2. Edit projects and blocks.
3. Click **Save**.
4. Click **Export for GitHub**.
5. A new file named `projects.js` downloads.
6. Replace the repository file at `data/projects.js` with the downloaded file.
7. Commit and Push through GitHub Desktop.

This is necessary because a static GitHub Pages site cannot write directly back into the repository.

## Current block types

- Overview
- Roles
- Story Step
- Large Image
- Two Images
- Video
- Before / After
- Gallery
- Timeline
- Quote
- Results
- Credits

Each block can contain a title, body, related role, layout, media, list items, takeaway, accent and visibility setting.

## Media line syntax

In a block's Media field, use one media item per line:

`path-or-url | Optional title | Optional caption`

Example:

`../assets/projects/divine-chaos/storyboard-01.webp | Opening storyboard | First version of Eve's entrance`

For a Before / After block, enter the before image first and the after image second.

## Timeline, credits and results syntax

Use one item per line:

`Title | Description`

Example:

`Pre-production | Visual development, casting and scheduling`

## Important limitation

The public project page in the old website does not yet render the new `blocks` array. The CMS and its internal Live Preview do work now. The next integration step is replacing the public project renderer in `assets/cms.js` or adding a separate `project-renderer.js` that translates the blocks into the final case-study design.
