$js = Get-Content 'profile.js' -Raw

$js = $js -replace 'export function initProfile\(\) \{
    const user = getCurrentUser\(\);
    if \(\!user\) return;
    document\.getElementById\(''profile-displayname''\)\.value = user\.displayName;', 'export function initProfile() {
    const user = getCurrentUser();
    
    // Bind listeners early to avoid null user crash
    document.querySelectorAll(''.profile-tab-btn'').forEach(btn => {
        btn.addEventListener(''click'', () => {
            document.querySelectorAll(''.profile-tab-btn'').forEach(b => b.classList.remove(''active''));
            btn.classList.add(''active'');
            const target = btn.dataset.tab;
            document.getElementById(''profile-avatar-panel'')?.classList.toggle(''hidden'', target !== ''avatar'');
            document.getElementById(''profile-title-panel'')?.classList.toggle(''hidden'', target !== ''title'');
            document.getElementById(''profile-theme-panel'')?.classList.toggle(''hidden'', target !== ''theme'');
            document.getElementById(''profile-stats-panel'')?.classList.toggle(''hidden'', target !== ''stats'');
            document.getElementById(''profile-album-panel'')?.classList.toggle(''hidden'', target !== ''album'');
            document.getElementById(''profile-custom-panel'')?.classList.toggle(''hidden'', target !== ''custom'');
            document.getElementById(''profile-trades-panel'')?.classList.toggle(''hidden'', target !== ''trades'');
            if (target === ''trades'') {
                if (typeof renderTradesPanel === ''function'') renderTradesPanel();
            }
        });
    });

    if (!user) return;
    document.getElementById(''profile-displayname'').value = user.displayName;'

# Remove the old listener binding loop
$js = $js -replace '    // Setup Tabs \(nur einmal binden\)
    document\.querySelectorAll\(''\.profile-tab-btn''\)\.forEach\(btn => \{
        btn\.addEventListener\(''click'', \(\) => \{
            document\.querySelectorAll\(''\.profile-tab-btn''\)\.forEach\(b => b\.classList\.remove\(''active''\)\);
            btn\.classList\.add\(''active''\);
            const target = btn\.dataset\.tab;
            document\.getElementById\(''profile-avatar-panel''\)\.classList\.toggle\(''hidden'', target !== ''avatar''\);
            document\.getElementById\(''profile-title-panel''\)\.classList\.toggle\(''hidden'', target !== ''title''\);
            document\.getElementById\(''profile-theme-panel''\)\.classList\.toggle\(''hidden'', target !== ''theme''\);
            document\.getElementById\(''profile-stats-panel''\)\.classList\.toggle\(''hidden'', target !== ''stats''\);
            document\.getElementById\(''profile-album-panel''\)\.classList\.toggle\(''hidden'', target !== ''album''\);
            document\.getElementById\(''profile-custom-panel''\)\.classList\.toggle\(''hidden'', target !== ''custom''\);
            document\.getElementById\(''profile-trades-panel''\)\.classList\.toggle\(''hidden'', target !== ''trades''\);
            if \(target === ''trades''\) \{
                renderTradesPanel\(\);
            \}
        \}\);
    \}\);', ''

Set-Content -Path 'profile.js' -Value $js
Write-Output "Profile fixed"
