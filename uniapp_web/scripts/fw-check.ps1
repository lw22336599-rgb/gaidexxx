$ErrorActionPreference = 'SilentlyContinue'
$rules = Get-NetFirewallRule -Direction Inbound -Enabled True
$has3000 = $false
$has5173 = $false
foreach ($r in $rules) {
  $pf = $r | Get-NetFirewallPortFilter
  if ($null -eq $pf) { continue }
  if ($pf.Protocol -ne 'TCP') { continue }
  if ($r.Action -ne 'Allow') { continue }
  $lp = [string]$pf.LocalPort
  if ($lp -match '(^|,|\s)3000($|,|\s)') { $has3000 = $true }
  if ($lp -match '(^|,|\s)5173($|,|\s)') { $has5173 = $true }
}
"INBOUND_3000=$has3000"
"INBOUND_5173=$has5173"
