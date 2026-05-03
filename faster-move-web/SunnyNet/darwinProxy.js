const { execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

function setWebProxy(server, port) {
  try {
    const device = getNetworkInterfaces()
    console.log('device', device)

    // 设置 HTTP 代理
    execSync(`networksetup -setwebproxy ${device.Port} ${server} ${port}`)
    // 设置 HTTPS 代理
    execSync(`networksetup -setsecurewebproxy ${device.Port} ${server} ${port}`)
    console.log(`HTTP 和 HTTPS 代理设置为 ${server}:${port}`)
    return `HTTP 和 HTTPS 代理设置为 ${server}:${port}`
  } catch (error) {
    console.error('设置代理时出错:', error.message)
    return false
  }
}

function disableWebProxy() {
  try {
    const device = getNetworkInterfaces()
    console.log('networkInterface', device)

    // 禁用 HTTP 代理
    execSync(`networksetup -setwebproxystate ${device.Port} off`)
    // 禁用 HTTPS 代理
    execSync(`networksetup -setsecurewebproxystate ${device.Port} off`)
    console.log('HTTP 和 HTTPS 代理已禁用')
    return 'HTTP 和 HTTPS 代理已禁用'
  } catch (error) {
    console.error('禁用代理时出错:', error.message)
    return false
  }
}
function fetchCertificatesInMacOS() {
  try {
    // 执行命令并获取输出
    const output = execSync('security find-certificate -a').toString()
    const lines = output.split(os.EOL)
    const certificates = []

    for (let i = 0; i < lines.length - 1; i += 13) {
      if (lines[i] === '') {
        continue
      }

      const cenc = lines[i + 5]
      const ctyp = lines[i + 6]
      const hpky = lines[i + 7]
      const labl = lines[i + 9]
      const subj = lines[i + 12]

      const re = /="([^"]{1,})"/
      const matches = labl.match(re)
      if (!matches || matches.length < 2) {
        continue
      }

      const label = matches[1]
      certificates.push({
        Thumbprint: '',
        Subject: {
          CN: label,
          OU: cenc,
          O: ctyp,
          L: hpky,
          S: subj,
          C: cenc
        }
      })
    }

    return certificates
  } catch (err) {
    throw new Error(`获取证书时发生错误，${err.message}`)
  }
}

function CheckCertificate(cert_name) {
  try {
    const certificates = fetchCertificatesInMacOS()
    // console.log("查看所有证书", certificates);

    for (const certificate of certificates) {
      if (certificate.Subject.CN === cert_name) {
        return true
      }
    }
    return false
  } catch (error) {
    return false
  }
}
let cerData = `-----BEGIN CERTIFICATE-----
MIIDwjCCAqqgAwIBAgIRAQAAAAAAAAAAAAAAAAAAAAAwDQYJKoZIhvcNAQELBQAw
ajELMAkGA1UEBhMCQ04xEDAOBgNVBAgTB0JlaUppbmcxEDAOBgNVBAcTB0JlaUpp
bmcxETAPBgNVBAoTCFN1bm55TmV0MREwDwYDVQQLEwhTdW5ueU5ldDERMA8GA1UE
AxMIU3VubnlOZXQwIBcNMjIxMTA0MDcwNTM0WhgPMjEyMjEwMTEwNzA1MzRaMGox
CzAJBgNVBAYTAkNOMRAwDgYDVQQIEwdCZWlKaW5nMRAwDgYDVQQHEwdCZWlKaW5n
MREwDwYDVQQKEwhTdW5ueU5ldDERMA8GA1UECxMIU3VubnlOZXQxETAPBgNVBAMT
CFN1bm55TmV0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzU+hPfoE
y+4+VZVUhfb0wKF7YSr79GyxNCo8/l8i1gI3pbaxv4PF/W5xWdE3LHND6b8FVmot
pXqJcalx2FP48JdAKsmlzEZcl3MngHsKH7OPSvz8p76xvlHaFutVQjQFr8R3dX3B
m8yNy6sNcP+3IrxOEUYsMWc5/lVHTyTYkruMAvCZIYzcc5Y2YXzExENbfPxwzNQh
H/XsZlc4FGaZq6DV/0oMOXSSFOXcuJo2ULW/bOQho2jZ2zG1mf+Te3i8Psoanrrf
sMXiOjB6ZH4tKv+O9NjJJi5o64Ulh35lt4qTHwGQD6pMs3yJn/l+N7kv85amLJzi
fBSbJ1eYhjUpPQIDAQABo2EwXzAOBgNVHQ8BAf8EBAMCAoQwHQYDVR0lBBYwFAYI
KwYBBQUHAwIGCCsGAQUFBwMBMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFKC5
TwkvGBAx7xu1CyvX5chP7zOdMA0GCSqGSIb3DQEBCwUAA4IBAQDDAl162QjUsv7H
1+pn7MT/RDcqXNqBAUEc9FF6ozkRnLxdWBMLWxI8KHKm8JoBQB+TLiokSkenfMtA
7eRX7xzCBghuLi2XjMDUlaoVVKp+HNNoPSyn+UE/lUlKoCJCFgyt5p+bp9MP+YDm
pOnNjZTktyvwRj+Bgm1USzVY3IXlV+/H9la3vRi/G5n+yl3ZQMjwh6erbqwUzd6X
8j/L3BdoOkrOHzpodiAmp7Mf105Nh77EoUsh13TJy1CJLrIJzMDO1ryhzuVyxbJA
evcsWTxTr9qR/P09XImwOFmFKNimKC8IGwP/xVxqdH9WapsX6VZV5NbRG8vnqaM5
V6TbUzep
-----END CERTIFICATE-----`
let certData1 = Buffer.from(cerData, 'utf-8')
function installCertificateInMacOS() {
  const certData = certData1
  try {
    // 创建临时文件
    const certFilePath = path.join(os.tmpdir(), 'SunnyRoot.cer')
    fs.writeFileSync(certFilePath, certData)

    try {
      console.log(certFilePath)

      // 构建并执行命令

      const cmd = `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain '${certFilePath}'`
      // const cmd = `security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain '${certFilePath}'`;
      execSync(cmd, { stdio: 'inherit' })
    } catch (err) {
      throw new Error(`安装证书时发生错误，${err.message}`)
    } finally {
      // 删除临时文件
      fs.unlinkSync(certFilePath)
    }
  } catch (error) {
    throw new Error(`处理证书时发生错误，${error}`)
  }
}
function getNetworkInterfaces() {
  try {
    // 执行 networksetup 命令以获取所有硬件端口信息
    const output = execSync('networksetup -listallhardwareports', { encoding: 'utf-8' })

    // 解析硬件端口信息
    const lines = output.split('\n')
    const ports = []
    let curPort = {}

    lines.forEach(line => {
      line = line.trim()
      if (line.startsWith('Hardware Port:')) {
        if (curPort.Port) {
          ports.push(curPort)
        }
        curPort = { Port: line.replace('Hardware Port: ', '') }
      } else if (line.startsWith('Device:')) {
        curPort.Device = line.replace('Device: ', '')
      }
    })

    if (curPort.Port) {
      ports.push(curPort)
    }

    // 执行 scutil 命令以获取网络接口信息
    const scutilOutput = execSync('scutil --nwi', { encoding: 'utf-8' })

    // 使用正则表达式解析接口信息
    const re = /Network interfaces{0,1}: ([0-9a-zA-Z]+)/
    const matches = re.exec(scutilOutput)

    // 将接口信息与硬件端口匹配
    if (matches && matches[1]) {
      for (const port of ports) {
        if (port.Device === matches[1]) {
          return port
        }
      }
    }

    throw new Error('未找到硬件端口信息')
  } catch (error) {
    throw new Error(`获取网络接口信息失败: ${error.message}`)
  }
}
module.exports = {
  setWebProxy,
  disableWebProxy,
  fetchCertificatesInMacOS,
  CheckCertificate,
  installCertificateInMacOS
}
