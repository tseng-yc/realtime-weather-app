import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import WeatherCard from './WeatherCard';
import useWeatherApi from './useWeatherApi';
import sunriseAndSunsetData from '../sunrise-sunset.json';

const getMoment = (locationName) => {
  // 從日出日落時間中找出符合的地區
  const location = sunriseAndSunsetData.find(
    (data) => data.locationName === locationName
  );
  // 找不到的話則回傳 null
  if (!location) return null;

  // 取得當前時間
  const now = new Date();

  // 將當前時間以 "2019-10-08" 的時間格式呈現
  const nowDate = Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replace(/\//g, '-');
  // 從該地區中找到對應的日期
  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);

  // 將日出日落以及當前時間轉成時間戳記（TimeStamp）
  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`
  ).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`
  ).getTime();
  const nowTimeStamp = now.getTime();

  // 若當前時間介於日出和日落中間，則表示為白天，否則為晚上
  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? 'day'
    : 'night';
};

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherApp = () => {
  const [weatherElement, fetchData] = useWeatherApi();
  const [currentTheme, setCurrentTheme] = useState('light');
  const { locationName } = weatherElement;

  //現在可以使用 currentLocation 取得地區名稱，因此移除這個多餘的程式碼
  //   const { locationName } = weatherElement;

  //透過 useMemo 避免每次都須重新計算取值，記得帶入 dependencies
  const moment = useMemo(() => getMoment(locationName), [locationName]);

  // 根據 moment 決定要使用亮色或暗色主題
  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark');
    // 記得把 moment 放入 dependencies 中
  }, [moment]);

  //可以試著添加看看一些功能，也許是點擊畫面的時候切換主題色彩

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        <WeatherCard
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
        />
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
