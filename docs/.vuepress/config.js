module.exports = {
  title: 'Tech Doodles',
  description: 'Thoughts, observations, notes, experiments etc.',
  markdown: {
    lineNumbers: true,
    // options for markdown-it-anchor
    // anchor: { permalink: false },
    // options for markdown-it-toc
    // toc: { includeLevel: [1, 2] },
    extendMarkdown: md => {
      // use more markdown-it plugins!
      md.use(require('@iktakahiro/markdown-it-katex'));
      md.use(require('@ospatil/markdown-it-nomnoml'));
    }
  },
  themeConfig: {
    nav: [
      { text: 'Tags', link: '/tags' },
      { text: 'About', link: '/about' },
    ]
  },
  plugins: [
    '@vuepress/back-to-top'
  ]
};
