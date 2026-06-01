$lines = Get-Content 'index.html'

# Extract blocks
$liveBlock = $lines[305..335]
$versusBlock = $lines[710..736]

# Remove them from old positions, AND remove lines 303, 304
$linesWithout = $lines[0..302] + $lines[336..709] + $lines[737..($lines.Length-1)]

# Now we need to insert liveBlock, versusBlock, and then lines 303, 304 right after line 302
$newHtml = $linesWithout[0..302] + $liveBlock + $versusBlock + $lines[303..304] + $linesWithout[303..($linesWithout.Length-1)]

$newHtml = $newHtml -join "
"

# Also fix the subnav buttons
$newHtml = $newHtml -replace '<button id="subnav-versus-btn" class="mode-toggle-btn nav-link" data-target="versus-content">', '<button id="subnav-versus-btn" class="mode-toggle-btn" data-sub="versus-content">'
$newHtml = $newHtml -replace '<button id="subnav-live-btn" class="mode-toggle-btn nav-link" data-target="live-content">', '<button id="subnav-live-btn" class="mode-toggle-btn" data-sub="live-content">'

Set-Content -Path 'index.html' -Value $newHtml
Write-Output "Fixed Hub Structure!"
