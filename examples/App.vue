<template>
  <div id="app">
    <v-header></v-header>
    <el-scrollbar class="page-component__scroll" ref="componentScrollBar">
    <div class="page-container page-component">
      <el-scrollbar class="page-component__nav">
        <v-slide :data='navData'></v-slide>
      </el-scrollbar>
      <div class="page-component__content">
        <router-view class="content"></router-view>
      </div>
      <transition name="back-top-fade">
        <div class="page-component-up"
             :class="{ 'hover': hover }"
             v-show="showBackToTop"
             @mouseenter="hover = true"
             @mouseleave="hover = false"
             @click="toTop">
          <i class="el-icon-caret-top"></i>
        </div>
      </transition>
    </div>
  </el-scrollbar>
  </div>
</template>

<script>
import VHeader from './components/Header'
import VSlide from './components/Slide'
import navData from './nav.config.json'
export default {
  name: 'app',
  components: { VHeader, VSlide },
  data () {
    return {
      hover: false,
      navData,
      showBackToTop: false,
      scrollTop: 0,
      showHeader: true,
      componentScrollBar: null,
      componentScrollBoxElement: null
    }
  },
  watch: {
    '$route.path' () {
      // 触发伪滚动条更新
      this.componentScrollBox.scrollTop = 0
      this.$nextTick(() => {
        this.componentScrollBar.update()
      })
    }
  },
  methods: {
    renderAnchorHref () {
      if (/changelog/g.test(location.href)) return
      const anchors = document.querySelectorAll('h2 a,h3 a')
      const basePath = location.href.split('#').splice(0, 2).join('#');

      [].slice.call(anchors).forEach(a => {
        const href = a.getAttribute('href')
        a.href = basePath + href
      })
    },

    goAnchor () {
      if (location.href.match(/#/g).length > 1) {
        const anchor = location.href.match(/#[^#]+$/g)
        if (!anchor) return
        const elm = document.querySelector(anchor[0])
        if (!elm) return

        setTimeout(() => {
          this.componentScrollBox.scrollTop = elm.offsetTop
        }, 50)
      }
    },
    toTop () {
      this.hover = false
      this.showBackToTop = false
      this.componentScrollBox.scrollTop = 0
    },

    handleScroll () {
      const scrollTop = this.componentScrollBox.scrollTop
      this.showBackToTop = scrollTop >= 0.5 * document.body.clientHeight
      if (this.showHeader !== this.scrollTop > scrollTop) {
        this.showHeader = this.scrollTop > scrollTop
      }
      if (scrollTop === 0) {
        this.showHeader = true
      }
      this.scrollTop = scrollTop
    }
  },
  created () {
    window.addEventListener('hashchange', () => {
      if (location.href.match(/#/g).length < 2) {
        document.documentElement.scrollTop = document.body.scrollTop = 0
        this.renderAnchorHref()
      } else {
        this.goAnchor()
      }
    })
  },
  mounted () {
    this.componentScrollBar = this.$refs.componentScrollBar
    this.componentScrollBox = this.componentScrollBar.$el.querySelector('.el-scrollbar__wrap')
    this.componentScrollBox.addEventListener('scroll', this.throttledScrollHandler)
    this.renderAnchorHref()
    this.goAnchor()
    document.body.classList.add('is-component')
  },
  destroyed () {
    document.body.classList.remove('is-component')
  },
  beforeDestroy () {
    this.componentScrollBox.removeEventListener('scroll', this.throttledScrollHandler)
  }
}
</script>
<style>
html,body{
  height: 100%;
}
</style>

<style lang="less" scoped>
#app{
  height: 100%;
}
.page-component__scroll {
  height: calc(100% - 90px);
  background-color: #fff;
  .el-scrollbar__wrap {
    overflow-x: auto;
  }
  .el-scrollbar__view{
    height: 100%;
  }
}

.page-component {
  box-sizing: border-box;
  height: 100%;

  &.page-container {
    padding: 0;
    // width: 1440px;
    margin: 0 auto;
  }

  .page-component__nav {
    width: 180px;
    position: fixed;
    top: 50px;
    bottom: 0;
    margin-top: 80px;
    transition: padding-top 0.3s;

    .el-scrollbar__wrap {
      height: 100%;
    }

    &.is-extended {
      padding-top: 0;
    }
  }

  .side-nav {
    height: 100%;
    padding-top: 50px;
    padding-bottom: 50px;
    padding-right: 0;

    & > ul {
      padding-bottom: 50px;
    }
  }

  .page-component__content {
    padding-left: 210px;
    padding-bottom: 100px;
    box-sizing: border-box;
  }

  .content {
    padding-top: 17px;

      h3 {
        margin: 55px 0 20px;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        background-color: #fff;
        font-size: 14px;
        margin-bottom: 45px;
        line-height: 1.5em;

        strong {
          font-weight: normal;
        }

        td,
        th {
          border-bottom: 1px solid #d8d8d8;
          padding: 15px;
          max-width: 250px;
        }

        th {
          text-align: left;
          white-space: nowrap;
          color: #666;
          font-weight: normal;
        }

        td {
          color: #333;
        }

        th:first-child,
        td:first-child {
          padding-left: 10px;
        }
      }

      ul:not(.timeline) {
        margin: 10px 0;
        padding: 0 0 0 20px;
        font-size: 14px;
        color: #5e6d82;
        line-height: 2em;
      }
  }

  .page-component-up {
    background-color: #fff;
    position: fixed;
    right: 100px;
    bottom: 150px;
    size: 40px;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    z-index: 5;

    i {
      color: #409eff;
      display: block;
      line-height: 40px;
      text-align: center;
      font-size: 18px;
    }

    &.hover {
      opacity: 1;
    }
  }
  .back-top-fade-enter,
  .back-top-fade-leave-active {
    transform: translateY(-30px);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .page-component {
    .page-component__nav {
      width: 100%;
      position: static;
      margin-top: 0;
    }
    .side-nav {
      padding-top: 0;
      padding-left: 50px;
    }
    .page-component__content {
      padding-left: 10px;
      padding-right: 10px;
    }
    .content {
      padding-top: 0;
    }
    .content > table {
      overflow: auto;
      display: block;
    }
    .page-component-up {
      display: none;
    }
  }
}
</style>
