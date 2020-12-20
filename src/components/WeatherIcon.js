import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { ReactComponent as DayThunderstorm } from '../weather-app-images/day-thunderstorm.svg';
import { ReactComponent as DayClear } from '../weather-app-images/day-clear.svg';
import { ReactComponent as DayCloudyFog } from '../weather-app-images/day-cloudy-fog.svg';
import { ReactComponent as CloudyIcon } from '../weather-app-images/day-cloudy.svg';
import { ReactComponent as DayFog } from '../weather-app-images/day-fog.svg';
import { ReactComponent as DayPartiallyClearWithRain } from '../weather-app-images/day-partially-clear-with-rain.svg';
import { ReactComponent as DaySnowing } from '../weather-app-images/day-snowing.svg';
import { ReactComponent as NightThunderstorm } from '../weather-app-images/night-thunderstorm.svg';
import { ReactComponent as NightClear } from '../weather-app-images/night-clear.svg';
import { ReactComponent as NightCloudyFog } from '../weather-app-images/night-cloudy-fog.svg';
import { ReactComponent as NightCloudy } from '../weather-app-images/night-cloudy.svg';
import { ReactComponent as NightFog } from '../weather-app-images/night-fog.svg';
import { ReactComponent as NightPartiallyClearWithRain } from '../weather-app-images/night-partially-clear-with-rain.svg';
import { ReactComponent as NightSnowing } from '../weather-app-images/night-snowing.svg';

// 定義 weatherCodes 轉換成 weatherType 的對應表
const weatherTypes = {
  isThunderstorm: [15, 16, 17, 18, 21, 22, 33, 34, 35, 36, 41],
  isClear: [1],
  isCloudyFog: [25, 26, 27, 28],
  isCloudy: [2, 3, 4, 5, 6, 7],
  isFog: [24],
  isPartiallyClearWithRain: [
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    19,
    20,
    29,
    30,
    31,
    32,
    38,
    39,
  ],
  isSnowing: [23, 37, 42],
};

// 假設從 API 取得的天氣代碼是 1
// const currentWeatherCode = 1;

// 使用迴圈來找出該天氣代碼對應到的天氣型態
const weatherCode2Type = (weatherCode) => {
  const [weatherType] =
    Object.entries(weatherTypes).find(([weatherType, weatherCodes]) =>
      weatherCodes.includes(Number(weatherCode))
    ) || [];

  return weatherType;
};

const WeatherIcon = (props) => {
  // 使用解構賦值將所需的資料從 props 取出
  const { currentWeatherCode, moment } = props;
  //透過 useState 定義當前使用的圖示名稱，預設值設為 `isClear`
  const [currentWeatherIcon, setCurrentWeatherIcon] = useState('isClear');

  const theWeatherIcon = useMemo(() => weatherCode2Type(currentWeatherCode), [
    currentWeatherCode,
  ]);

  useEffect(() => {
    setCurrentWeatherIcon(theWeatherIcon);
  }, [theWeatherIcon]);

  const IconContainer = styled.div`
    flex-basis: 40%;

    svg {
      max-height: 110px;
    }
  `;

  const WeatherIcons = {
    day: {
      isThunderstorm: <DayThunderstorm />,
      isClear: <DayClear />,
      isCloudyFog: <DayCloudyFog />,
      isCloudy: <CloudyIcon />,
      isFog: <DayFog />,
      isPartiallyClearWithRain: <DayPartiallyClearWithRain />,
      isSnowing: <DaySnowing />,
    },
    night: {
      isThunderstorm: <NightThunderstorm />,
      isClear: <NightClear />,
      isCloudyFog: <NightCloudyFog />,
      isCloudy: <NightCloudy />,
      isFog: <NightFog />,
      isPartiallyClearWithRain: <NightPartiallyClearWithRain />,
      isSnowing: <NightSnowing />,
    },
  };
  return (
    <>
      {/* 從 weatherIcons 中找出對應的圖示 */}
      <IconContainer>{WeatherIcons[moment][currentWeatherIcon]}</IconContainer>
    </>
  );
};

export default WeatherIcon;
