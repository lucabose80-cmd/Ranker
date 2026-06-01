$js = Get-Content 'community.js' -Raw

# 1. Remove early return in initCommunity
$js = $js -replace 'export function initCommunity\(\) \{
    const user = getCurrentUser\(\);
    if \(\!user\) return;
    
    if\(onlineInterval\) \{', 'export function initCommunity() {
    if(onlineInterval) {'

# 2. Add early return in updateOnlineTracker
$js = $js -replace '    const updateOnlineTracker = async \(forceFullRefresh = false\) => \{
        const user = getCurrentUser\(\); // Neu laden, damit Titeländerungen wirken
        const onlineList = document\.getElementById\(''online-users-list''\);
        if\(\!onlineList\) return;', '    const updateOnlineTracker = async (forceFullRefresh = false) => {
        const user = getCurrentUser();
        const onlineList = document.getElementById(''online-users-list'');
        if(!onlineList || !user) return;'

Set-Content -Path 'community.js' -Value $js
Write-Output "Fixed community.js"
