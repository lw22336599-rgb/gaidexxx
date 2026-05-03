const { generateBuildConfig } = require('./index');
const path = require('path');

const buildCmd = generateBuildConfig({
	domain: 'https://api.example.com',
  productName: 'MyApp',
  logoPng: path.join(__dirname, './example/public/logo.png'),
  logoIco: path.join(__dirname, './example/public/logo.ico')
})

console.log('根目录执行构建指令：', buildCmd);