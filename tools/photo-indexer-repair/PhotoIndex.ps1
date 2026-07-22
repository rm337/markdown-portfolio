[CmdletBinding()]
param(
    [string[]]$Roots,
    [string]$OutputDirectory,
    [int]$StatusIntervalSeconds = 5,
    [switch]$SkipGallery
)

$ErrorActionPreference = 'Stop'

$BaseDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $BaseDirectory 'PHOTO_INDEX_OUTPUT'
}
$OutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
$RunId = Get-Date -Format 'yyyyMMdd_HHmmss'
$RunDirectory = Join-Path $OutputDirectory ('RUN_' + $RunId)

$IndexPath = Join-Path $RunDirectory '01_COMPLETE_PHOTO_AND_LIGHTROOM_INDEX.csv'
$PhotoPath = Join-Path $RunDirectory '02_ALL_PHOTOS.csv'
$LightroomPath = Join-Path $RunDirectory '03_LIGHTROOM_CATALOGS_AND_METADATA.csv'
$AiPath = Join-Path $RunDirectory '04_POSSIBLE_AI_REVIEW_ONLY.csv'
$ErrorPath = Join-Path $RunDirectory '05_SCAN_NOTES.csv'
$DriveSummaryPath = Join-Path $RunDirectory '06_DRIVE_SUMMARY.csv'
$ExtensionSummaryPath = Join-Path $RunDirectory '07_EXTENSION_SUMMARY.csv'
$StatusPath = Join-Path $RunDirectory 'SCAN_STATUS.log'
$SummaryPath = Join-Path $RunDirectory '00_READ_ME_FIRST.txt'
$GalleryPath = Join-Path $RunDirectory 'PHOTO_GALLERY.html'
$GalleryDataPath = Join-Path $RunDirectory 'GALLERY_DATA.js'
$LatestRunPath = Join-Path $OutputDirectory 'LATEST_RUN.txt'

$photoExtensions = @(
    '.jpg', '.jpeg', '.jpe', '.png', '.tif', '.tiff', '.bmp', '.gif', '.webp', '.heic', '.heif', '.avif',
    '.dng', '.nef', '.nrw', '.cr2', '.cr3', '.arw', '.srf', '.sr2', '.raf', '.rw2', '.orf', '.pef',
    '.x3f', '.3fr', '.fff', '.iiq', '.rwl', '.mos', '.mrw', '.kdc', '.dcr', '.erf', '.mef', '.raw', '.srw',
    '.psd', '.psb', '.ai', '.eps', '.svg', '.indd', '.afphoto', '.afdesign', '.procreate'
)
$lightroomExtensions = @('.lrcat', '.lrcat-data', '.lrdb', '.lrprev', '.lrtemplate', '.xmp', '.lrlibrary')
$rawExtensions = @(
    '.dng', '.nef', '.nrw', '.cr2', '.cr3', '.arw', '.srf', '.sr2', '.raf', '.rw2', '.orf', '.pef',
    '.x3f', '.3fr', '.fff', '.iiq', '.rwl', '.mos', '.mrw', '.kdc', '.dcr', '.erf', '.mef', '.raw', '.srw'
)
$editableArtworkExtensions = @('.psd', '.psb', '.ai', '.eps', '.indd', '.afphoto', '.afdesign', '.procreate')
$galleryDisplayExtensions = @('.jpg', '.jpeg', '.jpe', '.png', '.gif', '.bmp', '.webp', '.svg')
$possibleAiPattern = '(?i)(^|[\\_\- ])(ai[ _-]?generated|chatgpt|dall[ -]?e|midjourney|firefly|stable[ _-]?diffusion)([\\\._\- ]|$)'
$header = 'RunId,ItemType,FileName,Extension,Category,Drive,FullPath,ParentFolder,SizeBytes,SizeMB,CreatedUtc,ModifiedUtc,PossibleAIMaterial,RobertApproved,SourceProtection,GalleryDisplayable'
$utf8 = New-Object System.Text.UTF8Encoding($true)

$script:photoCount = 0L
$script:lightroomCount = 0L
$script:aiCount = 0L
$script:totalCount = 0L
$script:filesExamined = 0L
$script:directoriesExamined = 0L
$script:noteCount = 0L
$script:reparsePointsSkipped = 0L
$script:galleryCount = 0L
$script:galleryFirst = $true
$script:lastStatus = Get-Date
$script:fatalMessage = $null
$script:runFinished = $null
$script:driveStats = @{}
$script:extensionCounts = @{}
$script:indexWriter = $null
$script:photoWriter = $null
$script:lightroomWriter = $null
$script:aiWriter = $null
$script:errorWriter = $null
$script:galleryWriter = $null

function CsvValue([object]$Value) {
    if ($null -eq $Value) { return '""' }
    return '"' + ([string]$Value).Replace('"', '""') + '"'
}

function JsValue([object]$Value) {
    if ($null -eq $Value) { return 'null' }
    $text = [string]$Value
    $text = $text.Replace('\', '\\').Replace('"', '\"').Replace("`r", '\r').Replace("`n", '\n').Replace("`t", '\t')
    return '"' + $text + '"'
}

function Get-DriveName([string]$PathValue) {
    if ($PathValue -match '^([A-Za-z]):') { return $Matches[1].ToUpperInvariant() }
    return [System.IO.Path]::GetPathRoot($PathValue)
}

function Add-Count([hashtable]$Table, [string]$Key, [long]$Amount) {
    if ([string]::IsNullOrWhiteSpace($Key)) { $Key = '(none)' }
    if ($Table.ContainsKey($Key)) { $Table[$Key] += $Amount } else { $Table[$Key] = $Amount }
}

function Write-Status([string]$Message, [ConsoleColor]$Color = [ConsoleColor]::Gray) {
    $line = ('{0:yyyy-MM-dd HH:mm:ss}  {1}' -f (Get-Date), $Message)
    Write-Host $line -ForegroundColor $Color
    Add-Content -LiteralPath $StatusPath -Value $line -Encoding UTF8
}

function Write-Note([string]$Drive, [string]$PathValue, [string]$Message, [string]$NoteType = 'Read warning') {
    $line = ((@($RunId, $Drive, $NoteType, $PathValue, $Message) | ForEach-Object { CsvValue $_ }) -join ',')
    $script:errorWriter.WriteLine($line)
    $script:errorWriter.Flush()
    $script:noteCount++
    if ($script:driveStats.ContainsKey($Drive)) { $script:driveStats[$Drive].Notes++ }
}

function Test-IsOutputPath([string]$PathValue) {
    try {
        $full = [System.IO.Path]::GetFullPath($PathValue).TrimEnd('\\') + '\\'
        $output = $OutputDirectory.TrimEnd('\\') + '\\'
        return $full.StartsWith($output, [System.StringComparison]::OrdinalIgnoreCase)
    } catch {
        return $false
    }
}

function Get-Category([string]$Extension, [bool]$IsDirectory) {
    if ($IsDirectory -and $Extension -eq '.lrdata') { return 'Lightroom Preview or Support Bundle' }
    if ($Extension -eq '.lrcat') { return 'Lightroom Catalog' }
    if ($lightroomExtensions -contains $Extension) { return 'Lightroom Metadata or Support' }
    if ($rawExtensions -contains $Extension) { return 'Camera RAW Original' }
    if ($editableArtworkExtensions -contains $Extension) { return 'Editable Artwork Master' }
    return 'Image'
}

function Write-GalleryRecord([object]$Item, [string]$Category, [string]$Drive, [string]$Extension, [bool]$IsAi, [bool]$Displayable) {
    if ($SkipGallery -or $Item.PSIsContainer) { return }
    $sourceUri = $null
    try { $sourceUri = ([System.Uri]$Item.FullName).AbsoluteUri } catch { $sourceUri = $Item.FullName }
    $json = '{' +
        '"name":' + (JsValue $Item.Name) + ',' +
        '"extension":' + (JsValue $Extension) + ',' +
        '"category":' + (JsValue $Category) + ',' +
        '"drive":' + (JsValue $Drive) + ',' +
        '"path":' + (JsValue $Item.FullName) + ',' +
        '"sourceUri":' + (JsValue $sourceUri) + ',' +
        '"sizeBytes":' + ([string]$Item.Length) + ',' +
        '"modifiedUtc":' + (JsValue $Item.LastWriteTimeUtc.ToString('o')) + ',' +
        '"possibleAi":' + ($(if ($IsAi) { 'true' } else { 'false' })) + ',' +
        '"displayable":' + ($(if ($Displayable) { 'true' } else { 'false' })) +
        '}'
    if (-not $script:galleryFirst) { $script:galleryWriter.WriteLine(',') }
    $script:galleryWriter.Write($json)
    $script:galleryFirst = $false
    $script:galleryCount++
}

function Write-IndexedItem([object]$Item, [string]$Extension, [string]$Category, [bool]$IsDirectory) {
    $drive = Get-DriveName $Item.FullName
    $isAi = [bool]($Item.FullName -match $possibleAiPattern)
    $displayable = (-not $IsDirectory) -and ($galleryDisplayExtensions -contains $Extension)
    $length = if ($IsDirectory) { 0L } else { [long]$Item.Length }
    $parent = if ($IsDirectory) { $Item.Parent.FullName } else { $Item.DirectoryName }
    $values = @(
        $RunId, $(if ($IsDirectory) { 'Directory' } else { 'File' }), $Item.Name, $Extension, $Category, $drive,
        $Item.FullName, $parent, $length, ([math]::Round($length / 1MB, 3)),
        $Item.CreationTimeUtc.ToString('o'), $Item.LastWriteTimeUtc.ToString('o'),
        $isAi, 'No', 'READ ONLY - do not alter source', $displayable
    )
    $line = (($values | ForEach-Object { CsvValue $_ }) -join ',')
    $script:indexWriter.WriteLine($line)

    if ($Category -like 'Lightroom*') {
        $script:lightroomWriter.WriteLine($line)
        $script:lightroomCount++
        if ($script:driveStats.ContainsKey($drive)) { $script:driveStats[$drive].Lightroom++ }
    } else {
        $script:photoWriter.WriteLine($line)
        $script:photoCount++
        if ($script:driveStats.ContainsKey($drive)) { $script:driveStats[$drive].Photos++ }
        Write-GalleryRecord $Item $Category $drive $Extension $isAi $displayable
    }
    if ($isAi) {
        $script:aiWriter.WriteLine($line)
        $script:aiCount++
    }
    $script:totalCount++
    if ($script:driveStats.ContainsKey($drive)) { $script:driveStats[$drive].Matches++ }
    Add-Count $script:extensionCounts $Extension 1

    if (($script:totalCount % 250) -eq 0) {
        $script:indexWriter.Flush(); $script:photoWriter.Flush(); $script:lightroomWriter.Flush(); $script:aiWriter.Flush()
        if ($script:galleryWriter) { $script:galleryWriter.Flush() }
    }
}

function Write-LiveProgress([int]$DriveNumber, [int]$DriveTotal, [string]$Drive, [string]$CurrentPath, [bool]$Force) {
    $now = Get-Date
    if (-not $Force -and (($now - $script:lastStatus).TotalSeconds -lt $StatusIntervalSeconds)) { return }
    $script:lastStatus = $now
    $percent = [math]::Min(99, [math]::Floor((($DriveNumber - 1) / [math]::Max(1, $DriveTotal)) * 100))
    $status = ('Drive {0} of {1} ({2}:) | examined {3:N0} files / {4:N0} folders | indexed {5:N0}' -f $DriveNumber, $DriveTotal, $Drive, $script:filesExamined, $script:directoriesExamined, $script:totalCount)
    Write-Progress -Activity 'Inkspirations Studios read-only photo index' -Status $status -CurrentOperation $CurrentPath -PercentComplete $percent
    Write-Status ($status + ' | current: ' + $CurrentPath) DarkCyan
}

function Write-GalleryShell {
    $html = @'
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inkspirations Studios - Private Photo Index</title>
<style>
:root{color-scheme:dark;font-family:Segoe UI,system-ui,sans-serif;background:#111;color:#eee}*{box-sizing:border-box}body{margin:0}header,main{width:min(1500px,calc(100% - 2rem));margin:auto}header{padding:2rem 0 1rem}h1{margin:.2rem 0;font:500 clamp(2rem,5vw,4rem) Georgia,serif}.notice{color:#e7b07a}.controls{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:2fr repeat(4,1fr);gap:.7rem;padding:1rem;background:#171513f2;border:1px solid #51463c;border-radius:1rem}label{display:grid;gap:.3rem;color:#baa894;font-size:.75rem;text-transform:uppercase}input,select{padding:.65rem;border:1px solid #5b4c40;border-radius:.5rem;background:#26211d;color:#fff}.summary{padding:1rem 0}.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;padding-bottom:4rem}.card{overflow:hidden;background:#1b1816;border:1px solid #443a32;border-radius:.8rem}.frame{aspect-ratio:4/3;display:grid;place-items:center;background:#090909;color:#756a60;position:relative}.frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.body{padding:.9rem}h2{font:500 1.1rem Georgia,serif;margin:.4rem 0}.path{overflow-wrap:anywhere;color:#9d9084;font-size:.72rem}.chips{display:flex;gap:.3rem;flex-wrap:wrap}.chip{padding:.2rem .45rem;border-radius:999px;background:#382e27;color:#e4c79f;font-size:.65rem;text-transform:uppercase}.danger{background:#582925;color:#ffd4cf}.approval{color:#e2a476;font-size:.7rem;border-top:1px solid #3d352e;padding-top:.6rem}@media(max-width:850px){.controls{position:static;grid-template-columns:1fr 1fr}}@media(max-width:520px){.controls{grid-template-columns:1fr}}
</style></head><body><header><p>Inkspirations Intelligence Vault - Private read-only index</p><h1>Complete Photo &amp; Lightroom Gallery</h1><p class="notice">No file shown here is approved for publication, Pixels/Fine Art America, or sale. AI flags require human review. Robert makes every final decision.</p></header><main><section class="controls"><label>Search<input id="q" type="search" placeholder="Filename, path, category..."></label><label>Drive<select id="drive"><option value="">All drives</option></select></label><label>Category<select id="category"><option value="">All categories</option></select></label><label>Extension<select id="extension"><option value="">All extensions</option></select></label><label>Status<select id="status"><option value="">All records</option><option value="displayable">Visual preview available</option><option value="ai">Possible AI review</option></select></label></section><div class="summary"><strong id="count">Loading index...</strong> <span id="note"></span></div><section id="gallery" class="gallery"></section></main><script src="GALLERY_DATA.js"></script><script>
const rows=window.PHOTO_INDEX_DATA||[],max=500,$=id=>document.getElementById(id),controls=['q','drive','category','extension','status'].map($);function options(id,values){for(const value of [...new Set(values)].sort())$(id).add(new Option(value,value))}options('drive',rows.map(x=>x.drive));options('category',rows.map(x=>x.category));options('extension',rows.map(x=>x.extension));function matches(x){const q=$('q').value.trim().toLowerCase();if(q&&![x.name,x.path,x.category,x.extension].join(' ').toLowerCase().includes(q))return false;if($('drive').value&&x.drive!==$('drive').value)return false;if($('category').value&&x.category!==$('category').value)return false;if($('extension').value&&x.extension!==$('extension').value)return false;if($('status').value==='displayable'&&!x.displayable)return false;if($('status').value==='ai'&&!x.possibleAi)return false;return true}function render(){const found=rows.filter(matches);$('count').textContent=found.length.toLocaleString()+' matching records';$('note').textContent=found.length>max?'Showing first '+max+' for browser performance.':'';$('gallery').replaceChildren(...found.slice(0,max).map(x=>{const card=document.createElement('article');card.className='card';const visual=x.displayable?`<img loading="lazy" src="${x.sourceUri}" alt="">`:'Preview unavailable';card.innerHTML=`<div class="frame">${visual}</div><div class="body"><div class="chips"><span class="chip">${x.category}</span>${x.possibleAi?'<span class="chip danger">Possible AI</span>':''}</div><h2></h2><p class="path"></p><p>${x.extension} - ${Number(x.sizeBytes).toLocaleString()} bytes - ${x.modifiedUtc}</p><p class="approval">Private - Not approved for publication or sale</p></div>`;card.querySelector('h2').textContent=x.name;card.querySelector('.path').textContent=x.path;return card}))}for(const c of controls)c.addEventListener(c.id==='q'?'input':'change',render);render();
</script></body></html>
'@
    Set-Content -LiteralPath $GalleryPath -Value $html -Encoding UTF8
}

function Count-Lines([string]$PathValue) {
    $count = 0L
    foreach ($line in [System.IO.File]::ReadLines($PathValue)) { $count++ }
    return $count
}

function Write-FinalReports([datetime]$Started, [string[]]$ScanRoots, [bool]$Succeeded) {
    $script:runFinished = Get-Date
    $driveHeader = 'Drive,Root,FilesExamined,DirectoriesExamined,Matches,Photos,LightroomAssets,Notes,ElapsedSeconds'
    $driveWriter = New-Object System.IO.StreamWriter($DriveSummaryPath, $false, $utf8)
    try {
        $driveWriter.WriteLine($driveHeader)
        foreach ($key in @($script:driveStats.Keys | Sort-Object)) {
            $item = $script:driveStats[$key]
            $values = @($key, $item.Root, $item.FilesExamined, $item.DirectoriesExamined, $item.Matches, $item.Photos, $item.Lightroom, $item.Notes, [math]::Round($item.ElapsedSeconds, 2))
            $driveWriter.WriteLine((($values | ForEach-Object { CsvValue $_ }) -join ','))
        }
    } finally { $driveWriter.Dispose() }

    $extensionWriter = New-Object System.IO.StreamWriter($ExtensionSummaryPath, $false, $utf8)
    try {
        $extensionWriter.WriteLine('Extension,Count')
        foreach ($item in @($script:extensionCounts.GetEnumerator() | Sort-Object Value -Descending)) {
            $extensionWriter.WriteLine((CsvValue $item.Key) + ',' + (CsvValue $item.Value))
        }
    } finally { $extensionWriter.Dispose() }

    $expected = @{
        $IndexPath = $script:totalCount + 1
        $PhotoPath = $script:photoCount + 1
        $LightroomPath = $script:lightroomCount + 1
        $AiPath = $script:aiCount + 1
        $ErrorPath = $script:noteCount + 1
    }
    $verification = New-Object System.Collections.Generic.List[string]
    $verified = $true
    foreach ($entry in $expected.GetEnumerator()) {
        $actual = Count-Lines $entry.Key
        $ok = ($actual -eq $entry.Value)
        if (-not $ok) { $verified = $false }
        $verification.Add(('{0}: expected {1:N0} lines, found {2:N0} - {3}' -f [System.IO.Path]::GetFileName($entry.Key), $entry.Value, $actual, $(if ($ok) { 'PASS' } else { 'FAIL' })))
    }

    $resultText = if ($Succeeded -and $verified) { 'COMPLETE AND VERIFIED' } elseif ($Succeeded) { 'COMPLETE WITH VERIFICATION FAILURE' } else { 'INTERRUPTED OR FAILED - PARTIAL RESULTS PRESERVED' }
    $summary = @"
INKSPIRATIONS STUDIOS - COMPLETE PHOTO INDEX
Owner: Robert Marleton
Run ID: $RunId
Result: $resultText
Started: $Started
Finished: $script:runFinished
Elapsed: $([math]::Round(($script:runFinished - $Started).TotalMinutes, 2)) minutes
Mounted roots scanned: $($ScanRoots -join ', ')

FILES AND FOLDERS EXAMINED
Files examined: $script:filesExamined
Directories examined: $script:directoriesExamined
Reparse points skipped safely: $script:reparsePointsSkipped
Read notes/warnings: $script:noteCount

MATCHING EVIDENCE
Photo and artwork files indexed: $script:photoCount
Lightroom catalogs/support assets indexed: $script:lightroomCount
Total matching records: $script:totalCount
Possible AI-material flags for review: $script:aiCount
Gallery records: $script:galleryCount

CSV VERIFICATION
$($verification -join "`r`n")

SAFETY
- Source drives were scanned read-only.
- No source photograph, artwork, catalog, sidecar, or metadata file was changed.
- The output directory was excluded from the scan.
- Reparse points were skipped to prevent loops.
- AI flags are conservative review flags, not conclusions.
- No record is approved for publication, upload, Pixels/Fine Art America, or sale.
- Robert makes every final creative and commercial decision.

INTERRUPTION RECOVERY
- CSV and gallery-data writers were flushed every 250 matches.
- Status and current paths were logged throughout the scan.
- If interrupted, completed rows remain in this run directory.

OUTPUT LOCATION
$RunDirectory

Fatal message: $script:fatalMessage
"@
    Set-Content -LiteralPath $SummaryPath -Value $summary -Encoding UTF8
    return $verified
}

$runStarted = Get-Date
$succeeded = $false
$verified = $false

try {
    # Windows PowerShell 5.1 supports -Path here; New-Item does not expose -LiteralPath.
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
    New-Item -ItemType Directory -Path $RunDirectory -Force | Out-Null
    if (-not (Test-Path -LiteralPath $RunDirectory -PathType Container)) { throw "Could not create output directory: $RunDirectory" }
    Set-Content -LiteralPath $LatestRunPath -Value $RunDirectory -Encoding UTF8
    Set-Content -LiteralPath $StatusPath -Value 'Inkspirations Studios photo index status' -Encoding UTF8
    Write-GalleryShell

    $script:indexWriter = New-Object System.IO.StreamWriter($IndexPath, $false, $utf8)
    $script:photoWriter = New-Object System.IO.StreamWriter($PhotoPath, $false, $utf8)
    $script:lightroomWriter = New-Object System.IO.StreamWriter($LightroomPath, $false, $utf8)
    $script:aiWriter = New-Object System.IO.StreamWriter($AiPath, $false, $utf8)
    $script:errorWriter = New-Object System.IO.StreamWriter($ErrorPath, $false, $utf8)
    if (-not $SkipGallery) {
        $script:galleryWriter = New-Object System.IO.StreamWriter($GalleryDataPath, $false, $utf8)
        $script:galleryWriter.WriteLine('window.PHOTO_INDEX_DATA = [')
    }
    $script:indexWriter.WriteLine($header)
    $script:photoWriter.WriteLine($header)
    $script:lightroomWriter.WriteLine($header)
    $script:aiWriter.WriteLine($header)
    $script:errorWriter.WriteLine('RunId,Drive,NoteType,Path,Message')

    if (-not $Roots -or $Roots.Count -eq 0) {
        $Roots = @(Get-PSDrive -PSProvider FileSystem |
            Where-Object { $_.Root -and (Test-Path -LiteralPath $_.Root -PathType Container) } |
            Select-Object -ExpandProperty Root -Unique)
    } else {
        # Windows PowerShell 5.1 can bind multiple -File arguments to a string[]
        # parameter as one comma-delimited value. Normalize both invocation forms.
        $Roots = @($Roots |
            ForEach-Object { @([string]$_ -split ',') } |
            ForEach-Object { $_.Trim().Trim('"').Trim("'") } |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            ForEach-Object { [System.IO.Path]::GetFullPath($_) } |
            Select-Object -Unique)
    }
    if ($Roots.Count -eq 0) { throw 'Windows did not report any mounted file-system drives.' }

    Write-Status ('STARTED run ' + $RunId + '. Mounted roots: ' + ($Roots -join ', ')) Green
    Write-Status 'READ-ONLY SCAN. Source files and Lightroom catalogs will not be modified.' Yellow
    Write-Status ('Continuous output: ' + $RunDirectory) Cyan

    $driveNumber = 0
    foreach ($root in $Roots) {
        $driveNumber++
        $drive = Get-DriveName $root
        $driveStarted = Get-Date
        $script:driveStats[$drive] = [ordered]@{ Root = $root; FilesExamined = 0L; DirectoriesExamined = 0L; Matches = 0L; Photos = 0L; Lightroom = 0L; Notes = 0L; ElapsedSeconds = 0.0 }
        Write-Status ("Scanning root {0} (drive {1} of {2})" -f $root, $driveNumber, $Roots.Count) Green

        $pending = New-Object 'System.Collections.Generic.Stack[string]'
        $pending.Push($root)
        while ($pending.Count -gt 0) {
            $currentDirectory = $pending.Pop()
            if (Test-IsOutputPath $currentDirectory) { continue }
            $script:directoriesExamined++
            $script:driveStats[$drive].DirectoriesExamined++

            try {
                $childDirectories = [System.IO.Directory]::GetDirectories($currentDirectory)
            } catch {
                Write-Note $drive $currentDirectory $_.Exception.Message 'Directory enumeration warning'
                Write-LiveProgress $driveNumber $Roots.Count $drive $currentDirectory $false
                continue
            }

            foreach ($childDirectory in $childDirectories) {
                if (Test-IsOutputPath $childDirectory) { continue }
                try {
                    $attributes = [System.IO.File]::GetAttributes($childDirectory)
                    if (($attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                        $script:reparsePointsSkipped++
                        Write-Note $drive $childDirectory 'Skipped filesystem reparse point to prevent traversal loops.' 'Reparse point skipped'
                        continue
                    }
                    $directoryInfo = New-Object System.IO.DirectoryInfo($childDirectory)
                    if ($directoryInfo.Extension.ToLowerInvariant() -eq '.lrdata') {
                        Write-IndexedItem $directoryInfo '.lrdata' 'Lightroom Preview or Support Bundle' $true
                    }
                    $pending.Push($childDirectory)
                } catch {
                    Write-Note $drive $childDirectory $_.Exception.Message 'Directory metadata warning'
                }
            }

            try {
                $childFiles = [System.IO.Directory]::GetFiles($currentDirectory)
            } catch {
                Write-Note $drive $currentDirectory $_.Exception.Message 'File enumeration warning'
                Write-LiveProgress $driveNumber $Roots.Count $drive $currentDirectory $false
                continue
            }

            foreach ($filePath in $childFiles) {
                $script:filesExamined++
                $script:driveStats[$drive].FilesExamined++
                $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                if (($photoExtensions -notcontains $extension) -and ($lightroomExtensions -notcontains $extension)) { continue }
                try {
                    $file = New-Object System.IO.FileInfo($filePath)
                    $category = Get-Category $extension $false
                    Write-IndexedItem $file $extension $category $false
                } catch {
                    Write-Note $drive $filePath $_.Exception.Message 'File metadata warning'
                }
            }
            Write-LiveProgress $driveNumber $Roots.Count $drive $currentDirectory $false
        }

        $script:driveStats[$drive].ElapsedSeconds = (Get-Date).Subtract($driveStarted).TotalSeconds
        Write-Status ("Finished root {0}; indexed {1:N0} matching records so far." -f $root, $script:totalCount) Green
    }
    $succeeded = $true
} catch {
    $script:fatalMessage = $_.Exception.Message
    try { Write-Status ('FATAL ERROR: ' + $script:fatalMessage) Red } catch { Write-Host ('FATAL ERROR: ' + $script:fatalMessage) -ForegroundColor Red }
} finally {
    foreach ($writerName in @('indexWriter', 'photoWriter', 'lightroomWriter', 'aiWriter', 'errorWriter')) {
        $writer = Get-Variable -Name $writerName -Scope Script -ValueOnly -ErrorAction SilentlyContinue
        if ($writer) { try { $writer.Flush(); $writer.Dispose() } catch {} }
    }
    if ($script:galleryWriter) {
        try { $script:galleryWriter.WriteLine(); $script:galleryWriter.WriteLine('];'); $script:galleryWriter.Flush(); $script:galleryWriter.Dispose() } catch {}
    } elseif ($SkipGallery -and -not (Test-Path -LiteralPath $GalleryDataPath)) {
        Set-Content -LiteralPath $GalleryDataPath -Value 'window.PHOTO_INDEX_DATA = [];' -Encoding UTF8
    }
    Write-Progress -Activity 'Inkspirations Studios read-only photo index' -Completed
    if (Test-Path -LiteralPath $RunDirectory) {
        try { $verified = Write-FinalReports $runStarted $Roots $succeeded } catch {
            $script:fatalMessage = ('Final report error: ' + $_.Exception.Message)
            $verified = $false
        }
    }
}

if ($succeeded -and $verified) {
    Write-Status ("COMPLETE AND VERIFIED. Photos/artwork: {0:N0}; Lightroom: {1:N0}; AI review: {2:N0}" -f $script:photoCount, $script:lightroomCount, $script:aiCount) Green
    Write-Host ('Exact output location: ' + $RunDirectory) -ForegroundColor Cyan
} else {
    try { Write-Status ('SCAN DID NOT VERIFY. Partial results remain at: ' + $RunDirectory) Red } catch {}
    throw ('Photo index did not complete and verify. See ' + $StatusPath)
}
