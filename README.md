# Shani Mezer Interactive Portfolio + CMS

## Open the portfolio
Open `index.html`.

## Edit projects
Open `admin/index.html`. You can create, edit, delete, preview, mark projects as featured, select a category and add image/video URLs.

The current CMS is a fully working local prototype. Changes are stored in your browser using localStorage, so the public pages update immediately on the same browser. Use **Export backup** to save your project data as JSON.

## Important before publishing
Local browser storage is not a shared online database. Visitors on other devices will see the default projects in `data/projects.js`. The next deployment step is connecting this exact Admin interface to Supabase or another database, which requires your project URL and public key.

## Pages
- `work/index.html`: all projects
- Category pages under `work/`
- `project/index.html?slug=project-name`: dynamic case study
- `admin/index.html`: project editor

## Media
For this version, use public image URLs and YouTube/Vimeo embed URLs. Cloud file uploading will be added when storage is connected.
