import path from 'node:path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export const createSvgIcons = () => {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/icon')],
    symbolId: 'vab-icon-[name]',
    svgoOptions: false, // 禁用svgo优化，保留所有SVG内容包括image标签
  })
}
