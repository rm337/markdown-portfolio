const resumeTabs = document.querySelectorAll('[data-resume-panel]');
const explorerHeading = document.querySelector('#resume-explorer-heading');
const explorerContent = document.querySelector('#resume-explorer-content');

const resumePanels = {
  profile: {
    heading: 'Professional Profile',
    content: `<p>Creative technologist, digital content manager, and AI workflow builder who builds polished online experiences, organizes large digital collections, and creates structured documentation. Skilled at following complex written guidelines and developing reliable AI-enhanced workflows.</p>
      <p><strong>Contact</strong> — Batesville, Arkansas · <a href="mailto:r.marleton@gmail.com">r.marleton@gmail.com</a> · (870) 713-2296</p>`
  },
  competencies: {
    heading: 'Core Competencies',
    content: `<p>Native US English, excellent grammar, spelling, and punctuation, audio transcription, proofreading, editing, attention to detail, quality assurance, documentation, research, information verification, AI productivity tools, GitHub Pages, Visual Studio Code, and modern web publishing.</p>`
  },
  experience: {
    heading: 'Experience Highlights',
    content: `<p><strong>Inkspirations Studios</strong> — Founder & Creative Director, 2025–Present. Created and maintain a professional online studio, organize artwork and creative assets, develop operating manuals, and manage AI-assisted workflows.</p>
      <p><strong>Walmart</strong> — Online Grocery Associate / Dairy Associate, 2025–Present. Delivered accurate order fulfillment, followed detailed procedures, and maintained quality and inventory standards.</p>`
  },
  projects: {
    heading: 'Selected Projects',
    content: `<p>Built and maintain the Inkspirations Studios website on GitHub Pages, organizing digital content, portfolio presentation, and user experience. Developed AI workflow systems for writing, editing, research, quality control, and content management across ongoing projects.</p>`
  },
  strengths: {
    heading: 'Professional Strengths',
    content: `<p>Exceptional attention to detail, strong written communication, independent problem solving, organization, adaptability, quality assurance mindset, fast learning, dependability, and self-motivation.</p>`
  }
};

function activatePanel(panelKey) {
  const panel = resumePanels[panelKey];
  if (!panel) return;

  explorerHeading.textContent = panel.heading;
  explorerContent.innerHTML = panel.content;

  resumeTabs.forEach(tab => {
    const isActive = tab.dataset.resumePanel === panelKey;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
}

resumeTabs.forEach(tab => {
  tab.addEventListener('click', () => activatePanel(tab.dataset.resumePanel));
  tab.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activatePanel(tab.dataset.resumePanel);
    }
  });
});

window.addEventListener('DOMContentLoaded', () => {
  activatePanel('profile');
});
