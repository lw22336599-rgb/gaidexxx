$ErrorActionPreference = 'Stop'
function Ensure-Rule($name, $port) {
  $existing = Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Output "[OK] 已存在: $name"
  } else {
    New-NetFirewallRule -DisplayName $name -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -Profile Domain,Private | Out-Null
    Write-Output "[ADD] 新增: $name (TCP $port)"
  }
}
Ensure-Rule -name 'uniapp-dev 3000 (api-bridge)' -port 3000
Ensure-Rule -name 'uniapp-dev 5173 (vite)'      -port 5173
Write-Output 'DONE'
