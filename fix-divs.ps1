$html = Get-Content 'index.html' -Raw

# 1. Insert 3 missing </div> before <div id="starwarsdle-content"
$html = $html -replace '<div id="starwarsdle-content" class="tab-content app-container hidden">', '</div></div></div><div id="starwarsdle-content" class="tab-content app-container hidden">'

# 2. Fix Home buttons
$html = $html -replace 'padding: 10px 20px; font-size: 1rem; margin-right: 20px; background: rgba\(0,0,0,0\.5\);">.? Home', 'padding: 12px 25px; font-size: 1.2rem; margin-right: 20px; background: rgba(0,0,0,0.5); display: flex; align-items: center; gap: 8px; justify-content: center;">&#10094; Home'

# 3. Shop Modal
# Replace the dock button
$html = $html -replace '<button class="dock-btn nav-link" data-target="shop-content" title="Shop"', '<button class="dock-btn" onclick="document.getElementById(''shop-modal'').classList.remove(''hidden'')" title="Shop"'

# Replace shop-content with shop-modal
$html = $html -replace '<div id="shop-content" class="tab-content app-container hidden">
                <div class="panel history-panel">
                    <div class="section-header" style="display:flex; align-items:center; margin-bottom: 20px;">
                        <button class="nav-link rank-btn" data-target="hub-content" style="padding: 12px 25px; font-size: 1.2rem; margin-right: 20px; background: rgba\(0,0,0,0\.5\); display: flex; align-items: center; gap: 8px; justify-content: center;">&#10094; Home</button>
                        <h1 style="margin: 0; color: #fff; font-size: 1.5rem;">SHOP & KARTEN</h1>
                    </div>', '<div id="shop-modal" class="profile-overlay hidden">
                <div class="panel history-panel profile-panel" style="max-height: 90vh; overflow-y: auto;">
                    <button type="button" class="close-overlay-btn" onclick="document.getElementById(''shop-modal'').classList.add(''hidden'')">?</button>
                    <h2 class="theme-heading">SHOP & KARTEN</h2>'

Set-Content -Path 'index.html' -Value $html
Write-Output "HTML fixed"
