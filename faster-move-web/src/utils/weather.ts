const weatherContrastTable = [
  {
    id: 1,
    name: ['晴'],
    img: '/@/assets/weather_images/weather_006.png'
  },
  {
    id: 2,
    name: ['多云'],
    img: '/@/assets/weather_images/weather_001.png'
  },
  {
    id: 3,
    name: ['阴'],
    img: '/@/assets/weather_images/weather_010.png'
  },
  {
    id: 4,
    name: ['阵雨'],
    img: '/@/assets/weather_images/weather_012.png'
  },
  {
    id: 5,
    name: ['雷阵雨'],
    img: '/@/assets/weather_images/weather_002.png'
  },
  {
    id: 6,
    name: ['龙卷风'],
    img: '/@/assets/weather_images/weather_003.png'
  },
  {
    id: 7,
    name: ['雨夹雪'],
    img: '/@/assets/weather_images/weather_011.png'
  },
  {
    id: 8,
    name: [
      '雷阵雨伴有冰雹',
      '小雨',
      '中雨',
      '大雨',
      '暴雨',
      '大暴雨',
      '特大暴雨',
      '冻雨',
      '小到中雨',
      '中到大雨',
      '大到暴雨',
      '暴雨到大暴雨',
      '大暴雨到特大暴雨',
      '小到中雪',
      '中到大雪',
      '大到暴雪',
      '雨'
    ],
    img: '/@/assets/weather_images/weather_009.png'
  },
  {
    id: 9,
    name: ['阵雪', '小雪', '中雪', '大雪', '暴雪', '雪'],
    img: '/@/assets/weather_images/weather_008.png'
  },
  {
    id: 10,
    name: [
      '轻雾',
      '轻雾',
      '强浓雾',
      '大雾',
      '特强浓雾',
      '浮尘',
      '扬沙',
      '强沙尘暴',
      '浓雾',
      '雾',
      '沙尘暴',
      '弱高吹雪'
    ],
    img: '/@/assets/weather_images/weather_007.png'
  },
  {
    id: 11,
    name: ['霾', '中度霾', '严重霾', '重度霾'],
    img: '/@/assets/weather_images/weather_004.png'
  }
]

export default function matchingWeatherImg(str: string) {
  let src: string = '/@/assets/weather_images/tianqi.png'
  weatherContrastTable.some(item => {
    if (item.name.includes(str)) {
      src = item.img
      return true
    }
  })
  return src
}
