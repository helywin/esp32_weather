const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const font1Path = path.join(__dirname, '/fonts/HarmonyOS_Sans_SC_Medium.ttf');
const font2Path = path.join(__dirname, '/fonts/InconsolataNerdFontPropo-Regular.ttf');
const outputFontPath = path.join(__dirname, '/main/HarmonyMedium.c');

// ASCII 字符范围
const asciiRange = '--range 0x20-0x7F';

// 中文字符列表
const chineseChars = '--symbols 列表地图编号名称序列号位置类型设备';

// Nerd Font 图标列表
const nerdFontIcons = '--symbols \uf03a\uf279\uf05a';

// 合并字体的命令
const command = `npx lv_font_conv --font ${font1Path} ${asciiRange} ${chineseChars} --font ${font2Path} ${nerdFontIcons} --size 16 --format lvgl --bpp 4 --output ${outputFontPath}`;

try {
    execSync(command, { stdio: 'inherit' });
    console.log('字体合并成功');

    // 读取生成的 .c 文件内容
    let fontFileContent = fs.readFileSync(outputFontPath, 'utf8');

    // 在 #ifdef LV_LVGL_H_INCLUDE_SIMPLE 上添加 #define LV_LVGL_H_INCLUDE_SIMPLE
    const defineStatement = '#define LV_LVGL_H_INCLUDE_SIMPLE\n';
    const ifdefStatement = '#ifdef LV_LVGL_H_INCLUDE_SIMPLE';
    if (!fontFileContent.includes(defineStatement)) {
        fontFileContent = fontFileContent.replace(ifdefStatement, `${defineStatement}${ifdefStatement}`);
        fs.writeFileSync(outputFontPath, fontFileContent, 'utf8');
        console.log('添加 #define LV_LVGL_H_INCLUDE_SIMPLE 成功');
    } else {
        console.log('#define LV_LVGL_H_INCLUDE_SIMPLE 已存在');
    }
} catch (error) {
    console.error('字体合并失败', error);
}
