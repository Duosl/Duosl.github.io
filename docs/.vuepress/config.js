const VuepressEs = require('./vuepressEs/index.js')

// 初始化定义 & 启动报警提示
let vuepressEs = new VuepressEs({
  // 1.导航栏文案（因为导航栏文件夹不能是中文的）
  navDataConfig: [
    {
      name: "0. blog",
      title: "我的博客"
    },
    {
      name: "1. readNotes",
      title: "读书笔记"
    },
    {
      name: "2. other",
      title: "其他"
    }
  ]
})

module.exports = {
  title: "Duosl Blog",
  description: 'Duosl\'s Blog.',
  // base: "/blog/",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.ico"
      }
    ]
  ],
  themeConfig: {
    repo: "https://github.com/zhukunpenglinyutong/notes",
    nav: vuepressEs.getNavData(),
    sidebar: vuepressEs.getSidebarData()
  },
  markdown: {
    lineNumbers: false
  },
  plugins: [
    [
      "vuepress-plugin-zooming",
      {
        selector: ".theme-default-content img",
        delay: 500,
        options: {
          bgColor: "black",
          zIndex: 10000
        }
      }
    ],
    [
      "@vuepress/pwa",
      {
        serviceWorker: true,
        updatePopup: {
          "/": {
            message: "发现新内容可用",
            buttonText: "刷新"
          }
        }
      }
    ]
  ]
}
