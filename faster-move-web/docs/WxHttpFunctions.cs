using System.Data;
using System.Drawing.Printing;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Reflection;
using System.Runtime.CompilerServices;
using Furion.FriendlyException;
using Furion.RemoteRequest;
using Newtonsoft.Json.Linq;
using StackExchange.Profiling.Internal;
using WaiMaiTongV3.Entity.Client;
using WaiMaiTongV3.Entity.Function.CHATPUSH;

namespace ChatPushService.WxHelper
{
    public class HttpFunctions
    {
        public HttpFunctions(string host)
        {
            Host = host;
        }

        public ChatType ChatType = ChatType.Wx;
        private HttpClient client = new HttpClient(
            new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate }
        );
        public string Host { get; }
        public ChatInfo MyInfo { get; private set; }
        public bool HasBegin { get; private set; }

        public async Task<bool> StartChat()
        {
            var postObj = new
            {
                port = "19099",
                ip = "127.0.0.1",
                url = "http://localhost:7014",
                timeout = "/Chat/OnNewMsg",
                enableHttp = 0,
            };

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("http://127.0.0.1:19088/api/?type=9"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
                Content = new StringContent(postObj.ToJson()) { Headers = { ContentType = new MediaTypeHeaderValue("application/json") } },
            };
            var json = await this.GetHttpJson(request);
            /*
             {
    "code": 1,
    "result": "OK"
}
             */
            var result = json.SelectToken("$.result").Value<string>();
            var res = json.SelectToken("$.code").Value<int>() == 1 || result.ToLower() == "ok";

            if (!res)
            {
                throw Oops.Oh(result);
            }
            this.HasBegin = true;
            return res;
        }

        /// <summary>
        /// 获取微信成员的备注
        /// </summary>
        /// <param name="memberOffids"></param>
        /// <returns></returns>
        public async Task<List<ChatMemberItem>> GetMemberRemark(params ChatMemberItem[] memberOffids)
        {
            var res = new List<ChatMemberItem>();
            var queryList = await this.QuerySql("MicroMsg.db", "select UserName,Remark,NickName from Contact");
            foreach (var item in memberOffids)
            {
                var fistRow = queryList.AsEnumerable().FirstOrDefault(f => f.Field<string>("UserName") == item.Offid);

                res.Add(
                    new ChatMemberItem()
                    {
                        ChatType = ChatType.Wx,
                        HeadImg = null,
                        MemType = item.Offid.Contains("@chatroo") ? MemberType.群 : MemberType.好友,
                        Name = item.Name,
                        Offid = item.Offid,
                        Remark = fistRow?.Field<string>("Remark") ?? "",
                    }
                );
            }
            return res;
        }

        /// <summary>
        ///查询数据库
        /// </summary>
        /// <param name="dbName">数据库名称 如 MicroMsg.db</param>
        /// <param name="sql"></param>
        /// <returns></returns>
        private async Task<DataTable> QuerySql(string dbName, string sql)
        {
            var dbHandle = await this.QueryDbHandle(dbName);

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("http://127.0.0.1:19088/api/?type=34"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
                Content = new StringContent(new { dbHandle = dbHandle, sql = sql }.ToJson())
                {
                    Headers = { ContentType = new MediaTypeHeaderValue("application/json") },
                },
            };

            var json = await this.GetHttpJson(request);
            var rows = json.SelectToken("$.data").ToObject<string[][]>();
            var des = new DataTable();
            foreach (var item in rows[0])
            {
                des.Columns.Add(item);
            }
            for (int i = 1; i < rows.Length; i++)
            {
                des.Rows.Add(rows[i]);
            }
            return des;
        }

        private async Task<string> QueryDbHandle(string dbName)
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("http://127.0.0.1:19088/api/?type=32"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
            };
            var json = await this.GetHttpJson(request);
            return json.SelectToken("$.data").First(f => f["databaseName"].Value<string>() == dbName)["handle"].Value<string>();
        }

        public async Task<bool> CheckOnLine()
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(this.Host + "/api/?type=0"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
            };
            try
            {
                using (var response = await client.SendAsync(request))
                {
                    response.EnsureSuccessStatusCode();
                    var body = await response.Content.ReadAsStringAsync();
                    return body.FromJson<JObject>()["result"].Value<string>().ToLower() == "ok";
                }
            }
            catch (Exception ex) { }
            return false;
        }

        public async Task<ChatInfo> GetMyInfo()
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(this.Host + "/api/?type=1"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
            };
            var res = await GetHttpJson(request);
            this.MyInfo = new ChatInfo()
            {
                Name = res.SelectToken("$.data.name").Value<string>(),
                HeadImg = res.SelectToken("$.data.headImage").Value<string>(),
                ChatType = ChatType.Wx,
                OffId = res.SelectToken("$.data.wxid").Value<string>(),
                OtherValues = new Dictionary<string, string>() { { "mobile", res.SelectToken("$.data.mobile").Value<string>() } },
            };
            return this.MyInfo;
        }

        /// <summary>
        /// 通过指定chatmemberids 获取成员对像
        /// </summary>
        /// <param name="memberOffIds"></param>
        /// <returns></returns>
        public async Task<List<ChatMemberItem>> GetMemberList(List<string> memberOffIds)
        {
            var allMembers = await ChatPushApp.ChatHttp.GetMemberList();
            return memberOffIds.Select(s => allMembers.FirstOrDefault(f => f.Offid == s) ?? new ChatMemberItem() { Name = s, Offid = s }).ToList();
        }

        public async Task<List<ChatMemberItem>> GetMemberList()
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("http://127.0.0.1:19088/api/?type=46"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
                Content = new StringContent("{\n\t\"wxids\": \"notify@all\",\n\t\"chatRoomId\": \"123@chatroom\",\n\t\"msg\": \"你好啊\"\n}")
                {
                    Headers = { ContentType = new MediaTypeHeaderValue("application/json") },
                },
            };
            var jsonObj = await this.GetHttpJson(request);

            var res = jsonObj
                .SelectToken("$.data")
                .Select(s =>
                {
                    string? wxId = s["wxid"].Value<string>();

                    return new ChatMemberItem()
                    {
                        /*
                            {
                                "customAccount": "",
                                "delFlag": 0,
                                "type": 1,
                                "userName": "朋友推荐消息",
                                "verifyFlag": 0,
                                "wxid": "fmessage"
                            }
                         */

                        Name = s["userName"].Value<string>(),
                        ChatType = ChatType.Wx,
                        HeadImg = null,
                        Offid = wxId,
                        OtherValues = new Dictionary<string, string>() { { "custom_account", s["customAccount"].Value<string>() } },

                        MemType = wxId.Contains("@chatroom") ? MemberType.群 : MemberType.好友,
                    };
                })
                .ToList();

            var remarkLiat = await GetMemberRemark(res.ToArray());
            foreach (var item in res)
            {
                item.Remark = remarkLiat.FirstOrDefault(f => f.Offid == item.Offid)?.Remark ?? item.Remark;
            }
            return remarkLiat;
        }

        public async Task<bool> SendMsg(string wxId, string msgContent)
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("http://127.0.0.1:19088/api/?type=2"),
                Headers =
                {
                    { "Accept", "*/*" },
                    { "User-Agent", "PostmanRuntime-ApipostRuntime/1.1.0" },
                    { "Connection", "keep-alive" },
                },
                Content = new StringContent(new { wxid = wxId, msg = msgContent }.ToJson())
                {
                    Headers = { ContentType = new MediaTypeHeaderValue("application/json") },
                },
            };
            var json = await this.GetHttpJson(request);
            return json["result"].Value<string>().ToLower() == "ok";
        }

        private async Task<JObject> GetHttpJson(HttpRequestMessage request)
        {
            using (var response = await client.SendAsync(request))
            {
                response.EnsureSuccessStatusCode();
                var body = await response.Content.ReadAsStringAsync();
                return body.FromJson<JObject>();
            }
        }
    }
}
