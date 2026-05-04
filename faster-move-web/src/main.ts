import { setupVab } from '~/library'
import App from './App.vue'
import { setupI18n } from '/@/i18n'
import { setupRouter } from '/@/router'
import { setupStore } from '/@/store'

import '@pureadmin/table/dist/style.css'
import PureTable from '@pureadmin/table'
import AuthButton from '/@/components/AuthButton/index.vue'

const app = createApp(App)

setupVab(app)
setupI18n(app)
setupStore(app)
setupRouter(app)

app.use(PureTable)

// 注册全局授权组件
app.component('AuthButton', AuthButton)

app.mount('#app')
