window.PORTFOLIO_PROJECTS = window.PORTFOLIO_PROJECTS || [];
window.PORTFOLIO_PROJECTS.push({
  id: "god-of-war-secret-daughter",
  title: "The God of War’s Secret Daughter",
  year: "2026",
  category: "ai",
  categories: ["ai", "directing", "editing"],
  categoryLabel: "AI Filmmaking · Cinematic Storytelling",
  roles: ["AI Filmmaker · Director · Editor"],
  status: "published",
  accent: "#8e95a3",
  cover: "https://drive.google.com/thumbnail?id=12r5CZ8yxEEsBmOWgpOS1b_y8P9NrATc5&sz=w1800",
  video: "https://drive.google.com/file/d/100NtZB3b1OM6ui7S9AVSYllezpl1GulC/preview",
  summary: "Episode 1 of a vertical cinematic sequence created through an AI-first filmmaking workflow, focused on character consistency, performance, continuity and shot-to-shot visual storytelling.",
  tools: "Seedance · Kling · AI Image Generation · Adobe Premiere Pro · Prompt Design · Keyframe Workflows",
  client: "",
  featured: false,
  blocks: [
    {
      id: "gow-overview",
      type: "overview",
      level: "primary",
      parentId: "",
      visible: true,
      kicker: "AI Filmmaking",
      title: "Overview",
      body: "The God of War’s Secret Daughter is a cinematic AI filmmaking project developed as a vertical 9:16 narrative sequence. The challenge was not simply generating individual shots, but directing a continuous scene in which characters, performances, locations, props and screen direction remain believable across an extended sequence.\n\nFor Episode 1, I built the scene shot by shot, treating generative tools as part of a traditional filmmaking pipeline: breaking the sequence into beats, designing approved keyframes, directing character performance through prompts, maintaining continuity between shots, and shaping the final rhythm in the edit.",
      layout: "wide",
      accent: "#8e95a3",
      role: "AI Filmmaker · Director",
      navTitle: "Overview",
      showInToc: true,
      alwaysVisible: true,
      disciplines: ["ai", "directing"],
      links: [],
      media: [
        {
          id: "gow-final-film",
          url: "https://drive.google.com/file/d/100NtZB3b1OM6ui7S9AVSYllezpl1GulC/preview",
          type: "video",
          title: "Episode 1 · Final Version",
          caption: "Final vertical edit"
        }
      ],
      items: [
        { id: "gow-item-1", title: "Format", text: "Vertical cinematic sequence · 9:16" },
        { id: "gow-item-2", title: "Focus", text: "Character consistency · continuity · cinematic performance" },
        { id: "gow-item-3", title: "Approach", text: "Shot-by-shot AI production built around approved keyframes" }
      ],
      quote: "",
      author: "",
      takeaway: ""
    },
    {
      id: "gow-workflow",
      type: "story",
      level: "primary",
      parentId: "",
      visible: true,
      kicker: "From Shot List to Final Cut",
      title: "AI Production Workflow",
      body: "The sequence was planned as a real cinematic scene before generation began. I created a detailed shot breakdown and defined what each shot needed to accomplish dramatically, visually and spatially.\n\nA visual continuity bible locked recurring descriptors and approved references for Ari, Blair, the Boss and guards, the welding workshop, the vintage car and trunk, and Ari’s office. For shots with complex blocking or camera geography, approved 9:16 start and end frames were created before animation.\n\nModel choice was made shot by shot. Seedance was used primarily for dialogue, lip-sync, performance and identity-sensitive acting, while Kling was used mainly for start/end-frame interpolation, camera blocking, physical movement and object physics. Generated material was then consolidated and edited in Adobe Premiere Pro with dialogue, ambience, Foley and music.",
      layout: "wide",
      accent: "#8e95a3",
      role: "AI Filmmaker · Director · Editor",
      navTitle: "Workflow",
      showInToc: true,
      alwaysVisible: false,
      disciplines: ["ai", "directing", "editing"],
      links: [
        { id: "gow-link-shotlist", label: "View Live Shotlist", url: "https://docs.google.com/spreadsheets/d/1PWLRiWzMT6uxsKrSt-iQpJ26mYnNAjg3eB9h44QNBdE/edit", style: "primary" },
        { id: "gow-link-workflow", label: "Workflow & Prompts", url: "https://docs.google.com/document/d/1PmeLY034MNRtFECdA5Gl-wLb0cVxtXnMmHc9IXkRmL4/edit", style: "secondary" }
      ],
      media: [
        {
          id: "gow-kf-ari-boss",
          url: "https://drive.google.com/thumbnail?id=1M09MfJAmeTWPzPyKEjWs5PF6SHhTkpw1&sz=w1600",
          type: "image",
          title: "Approved Keyframe · Ari Answers the Boss",
          caption: "Identity-sensitive dialogue setup"
        },
        {
          id: "gow-kf-blair-trunk",
          url: "https://drive.google.com/thumbnail?id=1UOW68xs8wVfSXV9CB3cGO1kInj7tly4w&sz=w1600",
          type: "image",
          title: "Approved Keyframe · Blair in the Trunk",
          caption: "Insert shot used to maintain geography and tension"
        },
        {
          id: "gow-kf-face",
          url: "https://drive.google.com/thumbnail?id=12r5CZ8yxEEsBmOWgpOS1b_y8P9NrATc5&sz=w1600",
          type: "image",
          title: "Approved Keyframe · Ari and Blair",
          caption: "Character continuity and performance reference"
        },
        {
          id: "gow-kf-kiss",
          url: "https://drive.google.com/thumbnail?id=1ukiMQ3Ncx5LczGWBxATvCT6xvZsiwhaq&sz=w1600",
          type: "image",
          title: "Approved Keyframe · Blair Kisses Ari",
          caption: "Late-sequence emotional continuity"
        }
      ],
      items: [
        { id: "gow-flow-1", title: "01 · Source Analysis", text: "Story beats, dialogue, characters, props, locations, audio requirements and delivery constraints were extracted before visual generation." },
        { id: "gow-flow-2", title: "02 · Continuity Bible", text: "Approved references locked identity, wardrobe, environment, props, lighting and screen direction." },
        { id: "gow-flow-3", title: "03 · Keyframe-First Design", text: "Complex blocking and camera geography were established through approved start and end frames before animation." },
        { id: "gow-flow-4", title: "04 · Performance Prompting", text: "Prompts controlled movement, blocking, eyelines, dialogue tone, lip-sync and physical behavior." },
        { id: "gow-flow-5", title: "05 · Model Selection", text: "Seedance for performance-sensitive shots; Kling for interpolation, blocking, motion and object physics." },
        { id: "gow-flow-6", title: "06 · Edit & Sound", text: "Selected takes were assembled in Premiere Pro with dialogue, workshop ambience, Foley and music." }
      ],
      quote: "",
      author: "",
      takeaway: ""
    },
    {
      id: "gow-scene",
      type: "story",
      level: "primary",
      parentId: "",
      visible: true,
      kicker: "Episode 1",
      title: "Directing a Continuous AI Scene",
      body: "The episode follows Ari as he hides Blair inside his welding workshop while a Boss and four armed men arrive searching for her. The scene escalates from concealment to confrontation, requiring the generated performances to remain grounded while the spatial relationship between Ari, Blair, the workshop, the car and the arriving group stays readable from shot to shot.\n\nThis made the project a useful test of where AI filmmaking becomes actual directing: the difficulty was not creating a striking single image, but sustaining tension, geography, character behavior and visual continuity over an entire dramatic sequence.",
      layout: "wide",
      accent: "#8e95a3",
      role: "Director",
      navTitle: "Episode 1",
      showInToc: true,
      alwaysVisible: false,
      disciplines: ["ai", "directing"],
      links: [],
      media: [
        {
          id: "gow-kf-please-dont-go",
          url: "https://drive.google.com/thumbnail?id=1oeDORkuxGQHjArcmE-O64nYb1-TiIJpT&sz=w1600",
          type: "image",
          title: "Blair · Close-Up",
          caption: "Performance-focused keyframe"
        },
        {
          id: "gow-kf-water",
          url: "https://drive.google.com/thumbnail?id=1u4e9WdM_YTnKxWua5EAudde67U0yR1qd&sz=w1600",
          type: "image",
          title: "Ari Returns with Water",
          caption: "Maintaining character, wardrobe and room continuity"
        },
        {
          id: "gow-kf-apron",
          url: "https://drive.google.com/thumbnail?id=1EZgW27EnhuS_4dt435U3MX87vY7wDBvU&sz=w1600",
          type: "image",
          title: "Blair Removes Ari’s Apron",
          caption: "Physical interaction and blocking reference"
        }
      ],
      items: [],
      quote: "",
      author: "",
      takeaway: ""
    }
  ],
  role: "AI Filmmaker · Director · Editor",
  publicVisible: true
});
