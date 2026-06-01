$js = Get-Content 'community.js' -Raw

$js = $js -replace '            // Online zuerst, dann alphabetisch
            allUsers.sort\(\(a, b\) => \{
                if \(a._isOnline && !b._isOnline\) return -1;
                if \(!a._isOnline && b._isOnline\) return 1;
                return \(a.displayName \|\| a.username\).localeCompare\(b.displayName \|\| b.username\);
            \}\);', '            // Sort by lastActive (newest first)
            allUsers.sort((a, b) => {
                if (a._isOnline && !b._isOnline) return -1;
                if (!a._isOnline && b._isOnline) return 1;
                const timeA = a.lastActive ? (a.lastActive.seconds || a.lastActive) : 0;
                const timeB = b.lastActive ? (b.lastActive.seconds || b.lastActive) : 0;
                if (timeB !== timeA) return timeB - timeA;
                return (a.displayName || a.username).localeCompare(b.displayName || b.username);
            });'

# Also the text needs to be left aligned. In community.js render, it says:
# flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;
# Which already aligns it left actually, because justify-content: center on column centers vertically, but align-items defaults to stretch or flex-start.
# Let's ensure text-align: left is there.
$js = $js -replace 'justify-content: center;">', 'justify-content: center; text-align: left;">'

Set-Content -Path 'community.js' -Value $js
Write-Output "Fixed community.js sort"
