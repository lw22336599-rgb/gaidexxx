using Furion.FriendlyException;
using Newtonsoft.Json.Linq;
using StackExchange.Profiling.Internal;
using WaiMaiTongV3.Entity.Function.CHATPUSH;
using WaiMaiTongV3.Entity.Tables.function.chat_push;
using WaiMaiTongV3.Entity.Tables.shop;

namespace ChatPushService
{
    public class ServiceHttp
    {
        public string ServiceHost { get; }
        public HttpHelper Http { get; }

        public ServiceHttp()
        {
            //向后端更新此app状态
            ServiceHost = "http://120.24.48.102:5265";
#if DEBUG
            ServiceHost = "http://localhost:5265";
#endif
            this.Http = new HttpHelper();
            this.Http.OnSetRequestAsync = OnSetRequestAsync;
        }

        private async Task OnSetRequestAsync(HttpItem item)
        {
            item.Header.Add("Authorization", $"Bearer {ChatPushApp.Token}");
        }

        public async Task<t_chat_push_list> UpdateChatInfo(t_chat_push_list dbChat)
        {
            var json = await Http.PostJsonAsync(
                $"{ServiceHost}/chatmg/updatechatinfo",
                dbChat.ToJson(),
                json => this.CheckErr(json),
                "向后台服务器更新状态"
            );
            return json.obj.SelectToken("$.data").ToObject<t_chat_push_list>();
        }

        public async Task<ChatPushConf> GetFuncConf(string shopId)
        {
            var json = await Http.PostJsonAsync(
                $"{ServiceHost}/functionuser/getconf_func",
                new { code = "CHATPUSH", shop = shopId }.ToJson(),
                this.CheckErr,
                "获取功能配置"
            );
            return json.obj.SelectToken("$.data.conf_json").ToObject<ChatPushConf>();
        }

        public async Task SaveFuncConf(string shopId, ChatPushConf conf)
        {
            var json = await Http.PostJsonAsync(
                $"{ServiceHost}/functionuser/setconf_func",
                new
                {
                    shop = shopId,
                    code = "CHATPUSH",
                    ConfObj = conf,
                }.ToJson(),
                this.CheckErr,
                "获取功能配置"
            );
            // return json.obj.SelectToken("$.data.conf_json") ;
        }

        public async Task<t_wmt_shop_list> GetShop(string shopOffId)
        {
            var json = await Http.GetJsonObjectAsync(
                $"{ServiceHost}/chatmg/GetShop?shopOffId={shopOffId}",
                json => this.CheckErr(json),
                "向后台服务器更新状态"
            );
            return json.obj.SelectToken("$.data").ToObject<t_wmt_shop_list>();
        }

        public async Task<t_wmt_shop_list> BindShop(string shopOffId, string memberOffId, bool isGroup)
        {
            var shopDb = await this.GetShop(shopOffId);
            var funcConf = await this.GetFuncConf(shopDb.id);
            if (isGroup)
            {
                if (funcConf.PushGroupOffIds.Any(a => a.MemberOffid == memberOffId))
                {
                    throw Oops.Oh("该店铺已经被绑定了");
                }
                funcConf.PushGroupOffIds.Add(new ChatItem() { MemberOffid = memberOffId, ChatOffId = ChatPushApp.ChatHttp.MyInfo.OffId });
            }
            else
            {
                if (funcConf.PushFriendOffids.Any(a => a.MemberOffid == memberOffId))
                {
                    throw Oops.Oh("该店铺已经被绑定了");
                }
                funcConf.PushFriendOffids.Add(new ChatItem() { MemberOffid = memberOffId, ChatOffId = ChatPushApp.ChatHttp.MyInfo.OffId });
            }
            await SaveFuncConf(shopDb.id, funcConf);
            return shopDb;
        }

        private bool CheckErr(JObject json)
        {
            if (json["code"].Value<int>() != 200)
            {
                throw Oops.Oh(json["message"].ToString());
            }
            return false;
        }

        public async Task UpdateChatInfo()
        {
            var myInfo = await ChatPushApp.ChatHttp.GetMyInfo();

            var dbChat = new t_chat_push_list()
            {
                on_line = await ChatPushApp.ChatHttp.CheckOnLine(),
                head_img = myInfo.HeadImg,
                chat_type = ChatPushApp.ChatHttp.ChatType,
                host = ChatPushApp.MyHost,
                key = ChatPushApp.Key.Value,
                name = myInfo.Name,
                offid = myInfo.OffId,
                MannagerOffIds = ChatPushApp.MannagerOffIds.ToList(),
            };

            var chatDb = await this.UpdateChatInfo(dbChat);
            if (chatDb.MannagerOffIds?.Any() is true)
            {
                chatDb.MannagerOffIds.ForEach(f => ChatPushApp.MannagerOffIds.Add(f));
            }
        }
    }
}
