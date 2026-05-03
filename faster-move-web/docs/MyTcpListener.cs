using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Newtonsoft.Json.Linq;
using StackExchange.Profiling.Internal;

namespace ChatPushService
{
    public class MyTcpListener
    {
        // 创建TCP监听器
        TcpListener server = null;

        public MyTcpListener() { }

        public void Start()
        {
            // 设置服务器端口号
            int port = 19099;

            // 创建TCP监听器
            server = new TcpListener(IPAddress.Any, port);

            // 启动服务器
            server.Start();
            Console.WriteLine($"TCP服务器已启动，监听端口：{port}");
            new Thread(() =>
            {
                try
                {
                    while (true)
                    {
                        // 等待客户端连接
                        TcpClient client = server.AcceptTcpClient();
                        Console.WriteLine("客户端已连接");

                        // 为每个客户端创建一个线程
                        //Thread clientThread = new Thread(new ParameterizedThreadStart(HandleClient));
                        //clientThread.Start(client);
                        Task.Run(async () =>
                        {
                            try
                            {
                                await HandleClient(client);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"回调消息调用出现异常:{ex.Message}\r\n{ex.StackTrace}");
                            }
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"服务器异常：{ex.Message}");
                }
                finally
                {
                    // 关闭服务器
                    server.Stop();
                    Console.WriteLine("TCP服务器已关闭");
                }
            }).Start();
        }

        public void DisposeTcp()
        {
            this.server.Stop();

            this.server.Dispose();
        }

        // 处理客户端连接的线程方法
        private static async Task HandleClient(object obj)
        {
            TcpClient client = (TcpClient)obj;
            NetworkStream stream = client.GetStream();

            try
            {
                byte[] buffer = new byte[1024];
                int bytesRead;

                while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
                {
                    // 将接收到的字节转换为字符串
                    string message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    Console.WriteLine($"客户端消息：{message}");
                    var json = message.FromJson<JObject>();
                    var fromGroup = json["fromGroup"].Value<string>();
                    var content = json["content"].Value<string>();
                    var fromUser = json["fromUser"].Value<string>();

                    if (fromUser != fromGroup && ChatPushApp.MannagerOffIds.Contains(fromUser) is not true)
                    {
                        Console.WriteLine("非机器人或管理员命令");
                        return;
                    }

                    if (fromGroup.Contains("@chatroom"))
                    {
                        if (content.StartsWith("@"))
                        {
                            var atUser = Regex.Match(message, "<atuserlist>(.*?)<\\/atuserlist>").Groups[1].Value;
                            if (content.EndsWith("设置管理员"))
                            {
                                ChatPushApp.MannagerOffIds.Add(atUser);
                                await ChatPushApp.SerHttp.UpdateChatInfo();
                                await ChatPushApp.ChatHttp.SendMsg(fromGroup, "设置管理员成功！");
                            }
                            else if (content.EndsWith("取消管理员"))
                            {
                                if (ChatPushApp.MannagerOffIds.Contains(atUser) is false)
                                {
                                    await ChatPushApp.ChatHttp.SendMsg(fromGroup, "该用户不是管理员！");
                                }
                                else
                                {
                                    ChatPushApp.MannagerOffIds.Remove(atUser);
                                    await ChatPushApp.SerHttp.UpdateChatInfo();
                                    await ChatPushApp.ChatHttp.SendMsg(fromGroup, "取消管理员成功！");
                                }
                            }
                        }
                        if (content.StartsWith("绑定"))
                        {
                            var shopOffId = Regex.Match(content.Trim(), "(\\d)+$").Groups[0].Value;
                            //这里要向服务端执行...
                            try
                            {
                                var shopDb = await ChatPushApp.SerHttp.BindShop(shopOffId, fromGroup, true);
                                await ChatPushApp.ChatHttp.SendMsg(fromGroup, $"绑定成功！（{shopDb.shop_type.ToString()}-{shopDb.name}门店）");
                            }
                            catch (Exception ex)
                            {
                                await ChatPushApp.ChatHttp.SendMsg(fromGroup, $"绑定失败！{ex.Message}）");
                            }
                        }
                    }
                    else if (content.EndsWith("设置管理员"))
                    {
                        ChatPushApp.MannagerOffIds.Add(fromUser);
                        await ChatPushApp.SerHttp.UpdateChatInfo();
                        await ChatPushApp.ChatHttp.SendMsg(fromGroup, "设置管理员成功！");
                    }
                    else if (content.EndsWith("取消管理员"))
                    {
                        ChatPushApp.MannagerOffIds.Remove(fromUser);
                        await ChatPushApp.SerHttp.UpdateChatInfo();
                        await ChatPushApp.ChatHttp.SendMsg(fromGroup, "取消管理员成功！");
                    }
                    else if (content == "查看管理员列表" || content == "查看管理员")
                    {
                        StringBuilder sendMsg = new StringBuilder();

                        if (ChatPushApp.MannagerOffIds?.Any() is not true)
                        {
                            sendMsg.AppendLine("您没有设置任何管理员");
                        }
                        else
                        {
                            sendMsg.AppendLine($"当前已设置管理员数量：{ChatPushApp.MannagerOffIds.Count}");

                            var chatMembers = await ChatPushApp.ChatHttp.GetMemberList(ChatPushApp.MannagerOffIds.ToList());
                            foreach (var item in chatMembers)
                            {
                                sendMsg.AppendLine($"微信名称:{item.Name}");
                            }
                        }
                        await ChatPushApp.ChatHttp.SendMsg(fromUser, sendMsg.ToString().Replace("\r\n", "\n"));
                    }
                    else if (content.StartsWith("绑定"))
                    {
                        var shopOffId = Regex.Match(content.Trim(), "(\\d)+$").Groups[0].Value;
                        //这里要向服务端执行...
                        try
                        {
                            var shopDb = await ChatPushApp.SerHttp.BindShop(shopOffId, fromUser, false);
                            await ChatPushApp.ChatHttp.SendMsg(fromGroup, $"绑定成功！（{shopDb.shop_type.ToString()}-{shopDb.name}门店）");
                        }
                        catch (Exception ex)
                        {
                            await ChatPushApp.ChatHttp.SendMsg(fromGroup, $"绑定失败！{ex.Message}）");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"客户端连接异常：{ex.Message}");
            }
            finally
            {
                // 关闭客户端连接
                client.Close();
                Console.WriteLine("客户端已断开连接");
            }
        }
    }
}
