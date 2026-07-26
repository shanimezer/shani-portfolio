# Install the private CV Generator

Copy these files into the matching locations in the existing repository:

```
admin/index.html       REPLACE
admin/cv-builder.css   ADD
admin/cv-builder.js    ADD
```

Keep the existing files:

```
admin/admin.css
admin/admin.js
assets/cms.js
data/projects.js
```

The CV module stores private career data in the browser's localStorage. It is not shown on the public portfolio pages.

## Workflow

1. Open `admin/`.
2. Open **Database** and add approved Experience, Education, Skills and Awards.
3. Select a portfolio project and open **Project CV Data**.
4. Add only factual, approved bullet points and relevance tags.
5. Open **CV Generator**.
6. Paste a job description and enter the target role.
7. Review the suggested selections, uncheck anything irrelevant, and export or print.

## Important privacy note

GitHub Pages is a public static site. The admin URL is not secure merely because it is not linked publicly. The private data is currently stored only in the browser and is not committed to GitHub, but the admin interface itself is public. Do not hard-code private phone numbers or addresses in repository files. A real login and cloud database should be added before syncing private data across devices.
