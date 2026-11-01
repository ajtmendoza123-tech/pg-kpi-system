# V76 update launcher. Prompts for the user's existing V75 KPI ZIP and writes a new ZIP.
# The source ZIP is not modified; no internet access or elevated permissions needed.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = 'Select your existing Pace Gaming KPI V75 ZIP'
$dialog.Filter = 'ZIP archives (*.zip)|*.zip'
$dialog.Multiselect = $false
if ($dialog.ShowDialog() -ne 'OK') { exit }
$sourceZip = $dialog.FileName
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$tempDir = Join-Path $env:TEMP ('PaceKpiV76_' + [guid]::NewGuid().ToString('N'))
try {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    Expand-Archive -LiteralPath $sourceZip -DestinationPath $tempDir -Force
    $indexFiles = Get-ChildItem -LiteralPath $tempDir -Recurse -File -Filter 'index.html'
    $indexFile = $indexFiles | Where-Object { Test-Path (Join-Path $_.DirectoryName 'app.js') } | Select-Object -First 1
    if (-not $indexFile) { throw 'Could not locate index.html next to app.js in this ZIP.' }
    $appJs = Get-Content -LiteralPath (Join-Path $indexFile.DirectoryName 'app.js') -Raw
    if (-not $appJs.Contains('paceKpiNewPlayerNamesV1')) {
        throw 'The selected ZIP is not KPI V75 with manual new-player names.'
    }
    $indexText = Get-Content -LiteralPath $indexFile.FullName -Raw -Encoding UTF8
    $cssTag = '<link rel="stylesheet" href="pace_kpi_new_players_page2.css">'
    $jsTag = '<script src="pace_kpi_new_players_page2.js"></script>'
    if (-not $indexText.Contains($cssTag)) {
        if (-not $indexText.Contains('</head>')) { throw 'index.html is missing </head>.' }
        $indexText = $indexText.Replace('</head>', "  $cssTag`r`n</head>")
    }
    if (-not $indexText.Contains($jsTag)) {
        if (-not $indexText.Contains('</body>')) { throw 'index.html is missing </body>.' }
        $indexText = $indexText.Replace('</body>', "  $jsTag`r`n</body>")
    }
    Set-Content -LiteralPath $indexFile.FullName -Value $indexText -Encoding UTF8
    Copy-Item -LiteralPath (Join-Path $baseDir 'pace_kpi_new_players_page2.js') -Destination $indexFile.DirectoryName -Force
    Copy-Item -LiteralPath (Join-Path $baseDir 'pace_kpi_new_players_page2.css') -Destination $indexFile.DirectoryName -Force
    $output = Join-Path (Split-Path -Parent $sourceZip) (([IO.Path]::GetFileNameWithoutExtension($sourceZip)) + '_V76_New_Players_Page_2.zip')
    if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force }
    Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $output -CompressionLevel Optimal
    [System.Windows.Forms.MessageBox]::Show("Update created successfully:`n$output`n`nExtract the new ZIP, then open index.html.", 'Pace Gaming KPI V76', 'OK', 'Information') | Out-Null
} catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'KPI Update Could Not Complete', 'OK', 'Error') | Out-Null
    exit 1
} finally {
    if (Test-Path -LiteralPath $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue }
}
