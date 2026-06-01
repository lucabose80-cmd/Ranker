$html = Get-Content 'index.html' -Raw

# 1. Dock button for shop
$html = $html -replace '<button class="dock-btn nav-link" data-target="shop-content" title="Shop"', '<button class="dock-btn" onclick="document.getElementById(''shop-modal'').classList.remove(''hidden'')" title="Shop"'

# 2. Shop content structure
$html = $html -replace '<div id="shop-content" class="tab-content app-container hidden">
                <div class="panel history-panel">
                    <div class="section-header" style="display:flex; align-items:center; margin-bottom: 20px;">
                        <button class="nav-link rank-btn" data-target="hub-content" style="padding: 10px 20px; font-size: 1rem; margin-right: 20px; background: rgba\(0,0,0,0\.5\);">. Home</button>
                        <h1 style="margin: 0; color: #fff; font-size: 1\.5rem;">SHOP & KARTEN</h1>
                    </div>', '<div id="shop-modal" class="profile-overlay hidden">
                <div class="panel history-panel profile-panel" style="max-height: 90vh; overflow-y: auto;">
                    <button type="button" class="close-overlay-btn" onclick="document.getElementById(''shop-modal'').classList.add(''hidden'')">?</button>
                    <h2 class="theme-heading">SHOP & KARTEN</h2>'

# 3. Tutorial close button
$html = $html -replace '<button id="close-tutorial-btn" type="button" class="close-overlay-btn">.?</button>', '<button id="close-tutorial-btn" type="button" class="close-overlay-btn" onclick="document.getElementById(''tutorial-modal'').classList.add(''hidden'')">?</button>'

# 4. Profile buttons CSS class - they need styling. Let's add them back some styling if needed.
# Since they had changelog-tab which has: background: #1a1e29; border: 1px solid #2a3142; color: #888; padding: 8px 20px; border-radius: 6px;
# I can just add inline styles or I can add a new class in style.css, but easiest is to add .changelog-tab back to them? No, changelog.js uses .cl-tab, but wait, if I add .changelog-tab to them, lexikon.js looks for .changelog-tab.lexikon-tab-btn, so it won't break lexikon!
# And changelog.js looks for .cl-tab.
# So I CAN just add 'changelog-tab ' to them!
$html = $html -replace 'class="profile-tab-btn', 'class="changelog-tab profile-tab-btn'

Set-Content -Path 'index.html' -Value $html
Write-Output "Shop and Tutorial and Profile styling fixed"
