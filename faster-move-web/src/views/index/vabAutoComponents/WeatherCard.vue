<template>
  <vab-card class="top-card weather-top-card">
    <div class="top-card-main">
      <img alt="" :src="matchingWeatherImg(weather.describe)" style="width: 30%;height: auto">
      <div style="width: calc(70% - 30px);box-sizing: border-box;">
        <div class="flexbox">
          <div>{{ weather.describe }}</div>
          <div class="supssd">{{ weather.temperature }}℃</div>
        </div>
        <div class="flexbox1">
          <img alt="" src="/@/assets/weather_images/dwicon.png" />
          {{ weather.city }}
        </div>
        <div>
          {{ weather.date }}
        </div>
      </div>
    </div>
  </vab-card>
</template>

<script lang="ts" setup>
import matchingWeatherImg from '/@/utils/weather.js'
defineOptions({
  name: 'WeatherCard',
})
const props = defineProps({
  config: {
    type: Object,
    default: () => {},
  },
})
const weather = props.config
</script>

<style lang="scss" scoped>
.top-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 128px !important;
}
.top-card {
  position: relative;
  height: 168px !important;
}
.flexbox1 {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333333;
  margin: 15px 0;

  img {
    width: 14px;
    //height: 18px;
    margin-right: 5px;
    margin-left: 0;
  }
}
.flexbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  color: #999999;

  .supnum {
    font-size: 28px;
    color: #333333;
  }

  .supdiv {
    color: #2CCA87;
  }
}
</style>
