const fs = require('fs');

let htmlContent = fs.readFileSync('index.html', 'utf8');

// 1. Fix Crafting button
htmlContent = htmlContent.replace(
    /<button id="shop-crafting-btn" class="rank-btn" style="(padding:10px 20px;[^"]+)">/g,
    '<button id="shop-crafting-btn" class="rank-btn" style="width: auto; height: auto; ">'
);

// 2. Fix Home buttons
const oldHomeBtn = /<button class="nav-link hub-back-btn" data-target="hub-content" style="padding: 10px 20px; font-size: 1.2rem; font-weight: bold; margin-right: 20px; background: rgba\(0,0,0,0\.5\); border: 2px solid #3b82f6; border-radius: 6px; color: #3b82f6; cursor: pointer; transition: all 0\.2s;" onmouseover="this\.style\.backgroundColor='rgba\(59, 130, 246, 0\.2\)'; this\.style\.boxShadow='0 0 10px rgba\(59, 130, 246, 0\.5\)';" onmouseout="this\.style\.backgroundColor='rgba\(0,0,0,0\.5\)'; this\.style\.boxShadow='none';">/g;

const newHomeBtn = '<button class="nav-link hub-back-btn rank-btn" data-target="hub-content" style="width: auto; height: auto; padding: 10px 20px; font-size: 1.2rem; font-weight: bold; margin-right: 20px; background: rgba(0,0,0,0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">';

htmlContent = htmlContent.replace(oldHomeBtn, newHomeBtn);

fs.writeFileSync('index.html', htmlContent, 'utf8');
console.log('HTML fixes applied.');
