/**
 * API 管理器
 * 统一管理所有 API 实例，支持全局 axios 拦截器
 * 自动生成后的基础上可按需扩展
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type CreateAxiosDefaults } from 'axios'
import router from '/@/router'
import { useUserStore } from '/@/store/modules/user'
import { gp } from '/@vab/plugins/vab'
import { version } from '~/package.json'

import { AdminGroupApi } from './Alien/Controller/AdminGroupApi'
import { ApiFileApi } from './Alien/Controllers/ApiFileApi'
import { DatabaseApi } from './Alien/Controllers/Sys/DatabaseApi'
import { DebugApi } from './Alien/Controllers/Sys/DebugApi'
import { GroupApi } from './Alien/Controllers/Sys/GroupApi'
import { ShopMgCallBackApi } from './Alien/Controllers/Shop/ShopMgCallBackApi'
import { ShopMgApi } from './Alien/Controllers/Shop/ShopMgApi'
import { ShopUserGroupApi } from './Alien/Controllers/Shop/ShopUserGroupApi'
import { LogControlllerApi } from './Alien/Controllers/Log/LogControlllerApi'
import { FoodGifApi } from './Alien/Controllers/Function/FoodGifApi'
import { FunctionAppApi } from './Alien/Controllers/Function/FunctionAppApi'
import { FunctionPriceApi } from './Alien/Controllers/Function/FunctionPriceApi'
import { SystemConfigApi } from './Alien/Controllers/Function/SystemConfigApi'
import { ToolApi } from './Alien/Controllers/Function/ToolApi'
import { FunctionUserApi } from './Alien/Controllers/Function/FunctionUserApi'
import { CalendarApi } from './Alien/Controllers/Business/CalendarApi'
import { HomeDataApi } from './Alien/Controllers/AppData/HomeDataApi'
import { AdminApi } from './Alien/Controllers/Admin/AdminApi'
import { BossMsgApi } from './Alien/Controllers/Admin/BossMsgApi'
import { CourseApi } from './Alien/Controllers/Admin/CourseApi'
import { FeedbackApi } from './Alien/Controllers/Admin/FeedbackApi'
import { TeamInfoApi } from './Alien/Controllers/Admin/TeamInfoApi'
import { WebhookConfigApi } from './Alien/Controllers/Admin/WebhookConfigApi'
import { BrowserServiceGrainTestApi } from './Alien/Faster/Controllers/Test/BrowserServiceGrainTestApi'
import { ServiceApi } from './Alien/Faster/Controllers/Sys/ServiceApi'
import { TypescriptGeneratorApi } from './Alien/Faster/Controllers/Sys/TypescriptGeneratorApi'
import { FdmvManagerApi } from './Alien/Faster/Controllers/FoodMove/FdmvManagerApi'
import { FdmvRuleApi } from './Alien/Faster/Controllers/FoodMove/FdmvRuleApi'
import { FoodDataParseApi } from './Alien/Faster/Controllers/FoodMove/FoodDataParseApi'
import { FoodManageApi } from './Alien/Faster/Controllers/FoodMove/FoodManageApi'
import { FoodMoveApi } from './Alien/Faster/Controllers/FoodMove/FoodMoveApi'
import { ImSessionApi } from './Alien/Faster/Controllers/IM/ImSessionApi'
import { ImAdminApi } from './Alien/Faster/Controllers/IM/ImAdminApi'
import { ImManageApi } from './Alien/Faster/Controllers/IM/ImManageApi'
import { ImQuickReplyApi } from './Alien/Faster/Controllers/IM/ImQuickReplyApi'
import { ChatMgApi } from './Alien/Faster/Controllers/ChatPush/ChatMgApi'
import { ChatPushDataApi } from './Alien/Faster/Controllers/ChatPush/ChatPushDataApi'
import { JdApisApi } from './SiteType/Jd/LS/Controllers/JdApisApi'
import { FuncRunTaskApi } from './Alien/Controllers/Function/FuncRunTaskApi'
import { RemoteBrowserApi } from './Alien/Faster/Controllers/RemoteBrowser/RemoteBrowserApi'

export class ApiManager {
  private axiosInstance: AxiosInstance
  private baseUrl: string

  public readonly adminApi: AdminApi
  public readonly adminGroupApi: AdminGroupApi
  public readonly apifileApi: ApiFileApi
  public readonly bossmsgApi: BossMsgApi
  public readonly browserservicegraintestApi: BrowserServiceGrainTestApi
  public readonly calendarApi: CalendarApi
  public readonly courseApi: CourseApi
  public readonly databaseApi: DatabaseApi
  public readonly debugApi: DebugApi
  public readonly fdmvmanagerApi: FdmvManagerApi
  public readonly fdmvruleApi: FdmvRuleApi
  public readonly feedbackApi: FeedbackApi
  public readonly fooddataparseApi: FoodDataParseApi
  public readonly foodgifApi: FoodGifApi
  public readonly foodmanageApi: FoodManageApi
  public readonly foodmoveApi: FoodMoveApi
  public readonly functionappApi: FunctionAppApi
  public readonly functionpriceApi: FunctionPriceApi
  public readonly systemconfigApi: SystemConfigApi
  public readonly functionuserApi: FunctionUserApi
  public readonly toolApi: ToolApi
  public readonly groupApi: GroupApi
  public readonly homedataApi: HomeDataApi
  public readonly logcontrolllerApi: LogControlllerApi
  public readonly serviceApi: ServiceApi
  public readonly shopmgApi: ShopMgApi
  public readonly shopmgcallbackApi: ShopMgCallBackApi
  public readonly shopusergroupApi: ShopUserGroupApi
  public readonly teaminfoApi: TeamInfoApi
  public readonly typescriptgeneratorApi: TypescriptGeneratorApi
  public readonly imSessionApi: ImSessionApi
  public readonly imAdminApi: ImAdminApi
  public readonly imManageApi: ImManageApi
  public readonly imQuickReplyApi: ImQuickReplyApi
  public readonly webhookConfigApi: WebhookConfigApi
  public readonly chatMgApi: ChatMgApi
  public readonly chatPushDataApi: ChatPushDataApi
  public readonly jdApisApi: JdApisApi
  public readonly funcRunTaskApi: FuncRunTaskApi
  public readonly remoteBrowserApi: RemoteBrowserApi

  constructor(config?: Partial<CreateAxiosDefaults>, baseUrl: string = '') {
    // 优先使用登录页写入 localStorage 的 baseUrl 配置
    const localBaseUrl = localStorage.getItem('baseUrl')
    let initialBaseUrl = baseUrl

    if (localBaseUrl) {
      try {
        const localBaseUrlObj = JSON.parse(localBaseUrl)
        // 登录页通常写入 { default: 'http://xxx' }
        if (localBaseUrlObj && localBaseUrlObj.default) initialBaseUrl = localBaseUrlObj.default
      } catch (error) {
        console.warn('解析 localStorage.baseUrl 失败:', error)
      }
    }

    this.baseUrl = initialBaseUrl

    // 创建 axios 实例时设置默认 baseURL，保持与登录页线路一致
    const defaultConfig: CreateAxiosDefaults = {
      baseURL: initialBaseUrl
    }

    this.axiosInstance = axios.create({ ...defaultConfig, ...(config || {}) })

    // 启用统一授权与错误处理拦截器
    this.setupInterceptors()

    // 获取 move 线路的 baseUrl
    let moveBaseUrl = initialBaseUrl
    if (localBaseUrl) {
      try {
        const localBaseUrlObj = JSON.parse(localBaseUrl)
        if (localBaseUrlObj && localBaseUrlObj.move) {
          moveBaseUrl = localBaseUrlObj.move
        }
      } catch (error) {
        console.warn('解析 localStorage.baseUrl 失败:', error)
      }
    }

    this.adminApi = new AdminApi(this.axiosInstance, this.baseUrl)
    this.adminGroupApi = new AdminGroupApi(this.axiosInstance, this.baseUrl)
    this.apifileApi = new ApiFileApi(this.axiosInstance, this.baseUrl)
    this.bossmsgApi = new BossMsgApi(this.axiosInstance, this.baseUrl)
    this.browserservicegraintestApi = new BrowserServiceGrainTestApi(this.axiosInstance, this.baseUrl)
    this.calendarApi = new CalendarApi(this.axiosInstance, this.baseUrl)
    this.courseApi = new CourseApi(this.axiosInstance, this.baseUrl)
    this.databaseApi = new DatabaseApi(this.axiosInstance, this.baseUrl)
    this.debugApi = new DebugApi(this.axiosInstance, this.baseUrl)
    this.fdmvmanagerApi = new FdmvManagerApi(this.axiosInstance, moveBaseUrl)
    this.fdmvruleApi = new FdmvRuleApi(this.axiosInstance, this.baseUrl)
    this.feedbackApi = new FeedbackApi(this.axiosInstance, this.baseUrl)
    this.fooddataparseApi = new FoodDataParseApi(this.axiosInstance, moveBaseUrl)
    this.foodgifApi = new FoodGifApi(this.axiosInstance, this.baseUrl)
    this.foodmanageApi = new FoodManageApi(this.axiosInstance, this.baseUrl)
    this.foodmoveApi = new FoodMoveApi(this.axiosInstance, moveBaseUrl)
    this.functionappApi = new FunctionAppApi(this.axiosInstance, this.baseUrl)
    this.functionpriceApi = new FunctionPriceApi(this.axiosInstance, this.baseUrl)
    this.systemconfigApi = new SystemConfigApi(this.axiosInstance, this.baseUrl)
    this.functionuserApi = new FunctionUserApi(this.axiosInstance, this.baseUrl)
    this.toolApi = new ToolApi(this.axiosInstance, this.baseUrl)
    this.groupApi = new GroupApi(this.axiosInstance, this.baseUrl)
    this.homedataApi = new HomeDataApi(this.axiosInstance, this.baseUrl)
    this.logcontrolllerApi = new LogControlllerApi(this.axiosInstance, this.baseUrl)
    this.serviceApi = new ServiceApi(this.axiosInstance, this.baseUrl)
    this.shopmgApi = new ShopMgApi(this.axiosInstance, this.baseUrl)
    this.shopmgcallbackApi = new ShopMgCallBackApi(this.axiosInstance, this.baseUrl)
    this.shopusergroupApi = new ShopUserGroupApi(this.axiosInstance, this.baseUrl)
    this.teaminfoApi = new TeamInfoApi(this.axiosInstance, this.baseUrl)
    this.typescriptgeneratorApi = new TypescriptGeneratorApi(this.axiosInstance, this.baseUrl)
    this.imSessionApi = new ImSessionApi(this.axiosInstance, this.baseUrl)
    this.imAdminApi = new ImAdminApi(this.axiosInstance, this.baseUrl)
    this.imManageApi = new ImManageApi(this.axiosInstance, this.baseUrl)
    this.imQuickReplyApi = new ImQuickReplyApi(this.axiosInstance, this.baseUrl)
    this.webhookConfigApi = new WebhookConfigApi(this.axiosInstance, this.baseUrl)
    this.chatMgApi = new ChatMgApi(this.axiosInstance, this.baseUrl)
    this.chatPushDataApi = new ChatPushDataApi(this.axiosInstance, this.baseUrl)
    this.jdApisApi = new JdApisApi(this.axiosInstance, this.baseUrl)
    this.funcRunTaskApi = new FuncRunTaskApi(this.axiosInstance, this.baseUrl)
    this.remoteBrowserApi = new RemoteBrowserApi(this.axiosInstance, this.baseUrl)
  }

  /**
   * 设置请求和响应拦截器
   * 授权逻辑与 utils/request.ts 保持一致：带上 token，处理 401/403 及错误提示
   */
  public setupInterceptors() {
    // 请求拦截器：追加 baseUrl 与 Authorization 头
    this.axiosInstance.interceptors.request.use(
      config => {
        const userStore = useUserStore()
        const { token } = userStore

        // 每次请求重新读取 baseUrl，支持登录后切换线路
        const localBaseUrl = localStorage.getItem('baseUrl')
        if (localBaseUrl) {
          try {
            const localBaseUrlObj = JSON.parse(localBaseUrl)
            ;(config as AxiosRequestConfig).baseURL = localBaseUrlObj.default || this.baseUrl
          } catch (error) {
            console.warn('解析 localStorage.baseUrl 失败:', error)
          }
        }

        // 附加 Authorization
        if (token) {
          if (config.headers && typeof (config.headers as any).set === 'function') {
            ;(config.headers as any).set('Authorization', `Bearer ${token}`)
          } else {
            ;(config.headers as any) = {
              ...(config.headers || {}),
              Authorization: `Bearer ${token}`
            }
          }
        }

        // 添加客户端版本号到请求头
        if (config.headers && typeof (config.headers as any).set === 'function') {
          ;(config.headers as any).set('client-version', version)
        } else {
          ;(config.headers as any) = {
            ...(config.headers || {}),
            'client-version': version
          }
        }

        return config
      },
      error => Promise.reject(error)
    )

    // 响应拦截器：统一处理 401/403 与错误消息以及业务失败(Success=false 等)
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data, status, statusText } = response

        // 仅在返回体为对象时做业务状态判断，其余情况直接透传
        if (data && typeof data === 'object') {
          const body: any = data

          /**
           * 统一处理后端约定格式:
           * 例如 { Success:false, code:500, message:'错误信息', data:null, ... }
           * 当 Success === false 时，直接提示错误并抛出异常，行为与 src/utils/request.ts 保持一致的“业务错误即抛异常”风格
           */
          if (Object.prototype.hasOwnProperty.call(body, 'Success')) {
            if (body.Success === false) {
              const errMsg: string =
                typeof body.message === 'string' && body.message.trim().length > 0
                  ? body.message
                  : typeof body.msg === 'string' && body.msg.trim().length > 0
                    ? body.msg
                    : statusText || '请求失败'

              gp.$baseMessage(errMsg, 'error', 'hey')

              // 按项目规范，业务失败直接抛异常，不返回布尔值
              throw body
            }

            // Success === true 时，自动提取 data 字段，将 response.data 替换为 body.data
            // 这样所有 API 方法都可以直接返回 response.data，无需手动提取
            if (Object.prototype.hasOwnProperty.call(body, 'data')) {
              response.data = body.data
            }
            return response
          }
        }

        // 非约定格式或未包含业务状态标记时，直接透传响应
        return response
      },
      error => {
        const { response } = error

        if (!response) {
          gp.$baseMessage(
            '连接后台接口失败，可能由以下原因造成：后端不支持跨域CORS、接口地址不存在、请求超时等，请联系管理员排查后端接口问题',
            'error',
            'hey'
          )
          return Promise.reject(error)
        }

        const status = response.status

        if (status === 401) {
          const { resetAll } = useUserStore()
          resetAll().then(() => {
            router.push({ path: '/login', replace: true }).then(() => {})
          })
        } else if (status === 403) {
          router.push({ path: '/403' }).then(() => {})
        } else if (response.data && response.data.message) {
          gp.$baseMessage(response.data.message, 'error', 'hey')
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * 获取 axios 实例，用于自定义请求
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }

  /**
   * 获取复制线路（move）的 baseUrl，用于搬菜、商品搬家等接口
   */
  public getMoveBaseUrl(): string {
    const localBaseUrl = localStorage.getItem('baseUrl')
    if (localBaseUrl) {
      try {
        const localBaseUrlObj = JSON.parse(localBaseUrl)
        if (localBaseUrlObj?.move) return localBaseUrlObj.move
      } catch (e) {
        console.warn('解析 localStorage.baseUrl 失败:', e)
      }
    }
    return this.baseUrl
  }

  /**
   * 更新基础 URL
   * 注意：需要重新初始化所有 API 实例，因为每个 API 类都有自己的 baseUrl 属性
   */
  public updateBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl
    this.axiosInstance.defaults.baseURL = baseUrl

    // 获取 move 线路的 baseUrl
    let moveBaseUrl = baseUrl
    const localBaseUrl = localStorage.getItem('baseUrl')
    if (localBaseUrl) {
      try {
        const localBaseUrlObj = JSON.parse(localBaseUrl)
        if (localBaseUrlObj && localBaseUrlObj.move) {
          moveBaseUrl = localBaseUrlObj.move
        }
      } catch (error) {
        console.warn('解析 localStorage.baseUrl 失败:', error)
      }
    }

    // 重新初始化所有 API 实例，使用新的 baseUrl
    ;(this as any).adminApi = new AdminApi(this.axiosInstance, this.baseUrl)
    ;(this as any).adminGroupApi = new AdminGroupApi(this.axiosInstance, this.baseUrl)
    ;(this as any).apifileApi = new ApiFileApi(this.axiosInstance, this.baseUrl)
    ;(this as any).bossmsgApi = new BossMsgApi(this.axiosInstance, this.baseUrl)
    ;(this as any).browserservicegraintestApi = new BrowserServiceGrainTestApi(this.axiosInstance, this.baseUrl)
    ;(this as any).calendarApi = new CalendarApi(this.axiosInstance, this.baseUrl)
    ;(this as any).courseApi = new CourseApi(this.axiosInstance, this.baseUrl)
    ;(this as any).databaseApi = new DatabaseApi(this.axiosInstance, this.baseUrl)
    ;(this as any).debugApi = new DebugApi(this.axiosInstance, this.baseUrl)
    ;(this as any).fdmvmanagerApi = new FdmvManagerApi(this.axiosInstance, this.baseUrl)
    ;(this as any).fdmvruleApi = new FdmvRuleApi(this.axiosInstance, this.baseUrl)
    ;(this as any).feedbackApi = new FeedbackApi(this.axiosInstance, this.baseUrl)
    ;(this as any).fooddataparseApi = new FoodDataParseApi(this.axiosInstance, moveBaseUrl)
    ;(this as any).foodgifApi = new FoodGifApi(this.axiosInstance, this.baseUrl)
    ;(this as any).foodmanageApi = new FoodManageApi(this.axiosInstance, moveBaseUrl)
    ;(this as any).foodmoveApi = new FoodMoveApi(this.axiosInstance, moveBaseUrl)
    ;(this as any).functionappApi = new FunctionAppApi(this.axiosInstance, this.baseUrl)
    ;(this as any).functionpriceApi = new FunctionPriceApi(this.axiosInstance, this.baseUrl)
    ;(this as any).systemconfigApi = new SystemConfigApi(this.axiosInstance, this.baseUrl)
    ;(this as any).functionuserApi = new FunctionUserApi(this.axiosInstance, this.baseUrl)
    ;(this as any).toolApi = new ToolApi(this.axiosInstance, this.baseUrl)
    ;(this as any).groupApi = new GroupApi(this.axiosInstance, this.baseUrl)
    ;(this as any).homedataApi = new HomeDataApi(this.axiosInstance, this.baseUrl)
    ;(this as any).logcontrolllerApi = new LogControlllerApi(this.axiosInstance, this.baseUrl)
    ;(this as any).serviceApi = new ServiceApi(this.axiosInstance, this.baseUrl)
    ;(this as any).shopmgApi = new ShopMgApi(this.axiosInstance, this.baseUrl)
    ;(this as any).shopmgcallbackApi = new ShopMgCallBackApi(this.axiosInstance, this.baseUrl)
    ;(this as any).shopusergroupApi = new ShopUserGroupApi(this.axiosInstance, this.baseUrl)
    ;(this as any).teaminfoApi = new TeamInfoApi(this.axiosInstance, this.baseUrl)
    ;(this as any).typescriptgeneratorApi = new TypescriptGeneratorApi(this.axiosInstance, this.baseUrl)
    ;(this as any).imSessionApi = new ImSessionApi(this.axiosInstance, this.baseUrl)
    ;(this as any).imAdminApi = new ImAdminApi(this.axiosInstance, this.baseUrl)
    ;(this as any).imManageApi = new ImManageApi(this.axiosInstance, this.baseUrl)
    ;(this as any).imQuickReplyApi = new ImQuickReplyApi(this.axiosInstance, this.baseUrl)
    ;(this as any).webhookConfigApi = new WebhookConfigApi(this.axiosInstance, this.baseUrl)
    ;(this as any).chatMgApi = new ChatMgApi(this.axiosInstance, this.baseUrl)
    ;(this as any).chatPushDataApi = new ChatPushDataApi(this.axiosInstance, this.baseUrl)
    ;(this as any).jdApisApi = new JdApisApi(this.axiosInstance, this.baseUrl)
    ;(this as any).funcRunTaskApi = new FuncRunTaskApi(this.axiosInstance, this.baseUrl)
    ;(this as any).remoteBrowserApi = new RemoteBrowserApi(this.axiosInstance, this.baseUrl)
  }
}

// 默认 API 管理器实例
export const apiManager = new ApiManager()

// 设置拦截器（可选）
// apiManager.setupInterceptors();
