UPDATED ADMIN FOLDER

Replace the complete /admin folder in your repository with this folder.

Keep these existing site files unchanged:
- /data/projects.js
- /assets/cms.js

Expected repository structure:
/admin/index.html
/admin/admin.css
/admin/admin.js
/admin/cv-builder.css
/admin/cv-builder.js
/data/projects.js
/assets/cms.js

What this update fixes:
- Existing projects from /data/projects.js appear again automatically.
- A previously saved empty localStorage database no longer hides those projects.
- Local project edits are preserved and merged with projects added in GitHub.
- The original Project Editor and Making Of Builder remain available.
- Database, Project CV Data and CV Generator remain available.

After replacing the folder:
1. Commit the five changed admin files in GitHub Desktop.
2. Push origin.
3. Hard refresh /admin/ with Cmd+Shift+R on Mac.
4. If needed, click "Reset local changes" once. This reloads the projects from /data/projects.js.
