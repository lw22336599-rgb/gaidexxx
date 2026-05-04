<template>
  <div class="md-editor-container no-background-container">
    <v-md-editor v-model="markdownContent" />
  </div>
</template>

<script lang="ts" setup>
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github'
import '@kangc/v-md-editor/lib/theme/style/github.css'

defineOptions({
  name: 'MdEditor'
})

const markdownContent = ref<any>(`<div align="center">
  <img width="200" src="https://gcore.jsdelivr.net/gh/zxwk1998/image/logo/vab.png"/>
  <h1> vue-admin-better
    <img width="100" src="https://img.shields.io/github/stars/zxwk1998/vue-admin-better?style=flat-square&logo=GitHub"/>
  </h1>
</div>

## 🌐 地址

- [🎉 vue2.x + element-ui（免费商用，支持 PC、平板、手机）](https://vuejs-core.cn/vue-admin-better/)

- [🚀 Vue Admin Pro 演示地址（vue2.x + element-ui 2.x 付费版本，支持 PC、平板、手机）](https://vuejs-core.cn/admin-pro/)

- [🚀 Vue Admin Plus 演示地址（vue3.x + element-plus 2.x 付费版本，支持 PC、平板、手机）](https://vuejs-core.cn/admin-plus/)

- [📌 Vue Admin Pro 及 Vue Admin Plus 购买地址](https://vuejs-core.cn/authorization/)

- [🚀 Vue Shop Vite 演示地址（vue3.x + vite 4.x + element-plus 2.x 付费版本，支持 PC、平板、手机）](https://vuejs-core.cn/shop-vite/)

- [📌 Vue Shop Vite 购买地址](https://vuejs-core.cn/authorization/shop-vite.html)

- [🌐 github 仓库地址](//github.com/zxwk1998/vue-admin-better)

- [🌐 码云仓库地址](//gitee.com/chu1204505056/vue-admin-better)

`)

VMdEditor.use(githubTheme)
</script>

<style lang="scss" scoped>
.md-editor-container {
  :deep() {
    .v-md-editor {
      min-height: calc(var(--el-container-height));
      background: var(--el-color-white);
      border: 1px solid var(--el-border-color);
      border-radius: var(--el-border-radius-base);
      box-shadow: none;
      transition: var(--el-transition);

      &__left-area {
        min-height: calc(var(--el-container-height));
      }

      &--fullscreen {
        z-index: 9999;
        border-radius: 0;
      }

      &__toolbar {
        border-bottom: 1px solid var(--el-border-color);

        &-divider:before {
          border-left: 1px solid var(--el-border-color);
        }

        &-item {
          color: var(--el-color-grey);

          &--active,
          &:hover {
            color: var(--el-color-primary);
            background: var(--el-color-primary-light-9);
          }
        }
      }

      &__editor-wrapper {
        border-right: 1px solid var(--el-border-color);
      }

      .v-md-textarea-editor pre,
      .v-md-textarea-editor textarea {
        color: var(--el-color-grey);
        background-color: var(--el-color-white);
      }

      .github-markdown-body h1,
      .github-markdown-body h2 {
        border-bottom: 1px solid var(--el-border-color);
      }
    }

    @media (max-width: 768px) {
      .v-md-editor {
        &__toolbar-right,
        &__toolbar-divider {
          display: none;
        }

        &__main {
          flex-direction: column !important;
          overflow-y: auto;
        }

        &__preview-wrapper {
          border-top: 1px solid var(--el-border-color);
        }

        &__editor-wrapper,
        &__preview-wrapper {
          display: flex;
          flex-direction: column;
          height: auto;
          min-height: calc(var(--vh, 1vh) * 100);
          overflow: hidden;
        }
      }
    }
  }
}
</style>
