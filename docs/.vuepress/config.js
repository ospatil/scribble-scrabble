module.exports = {
  title: 'Tech Doodles',
  description: 'Doodling about technology',
  markdown: {
    // options for markdown-it-anchor
    // anchor: { permalink: false },
    // options for markdown-it-toc
    // toc: { includeLevel: [1, 2] },
    extendMarkdown: md => {
      // use more markdown-it plugins!
      md.use(require('@iktakahiro/markdown-it-katex'));
    }
  },
  themeConfig: {
    nav: [
      { text: 'About', link: '/about' },
    ]
  }
};
