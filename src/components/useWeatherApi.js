import { useState, useEffect, useCallback } from 'react';

//讓 useWeatherApi 可以接收參數
const useWeatherApi = (currentLocation) => {
  //將傳入的 currentLocation 透過解構賦值取出 locationName 和 cityName sunriseCityName
  const { locationName, cityName, sunriseCityName } = currentLocation;
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: '',
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: '',
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
    sunrise: '',
    sunset: '',
    isLoading: true,
  });

  //讓 fetchCurrentWeather 可以接收 locationName 作為參數
  const fetchCurrentWeather = (locationName) => {
    // 加上 return 直接把 fetch API 回傳的 Promise 回傳出去
    //在 API 的網址中可以帶入 locationName 去撈取特定地區的天氣資料
    return fetch(
      `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWA-12808D45-FD59-4025-BF5E-E5D8F486A890&StationName=${locationName}`
    )
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.Station[0];
        // 將風速（WDSD）、氣溫（TEMP）和濕度（HUMD）的資料取出
        const weatherElements = {
          TEMP: locationData.WeatherElement.AirTemperature,
          WDSD: locationData.WeatherElement.WindSpeed,
          HUMD: locationData.WeatherElement.RelativeHumidity,
        };

        //要使用到 React 組件中的資料
        setWeatherElement((prevState) => ({
          ...prevState,
          observationTime: locationData.ObsTime.DateTime,
          locationName: locationData.StationName,
          description: '多雲時晴',
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        }));
        return {
          observationTime: locationData.ObsTime.DateTime,
          locationName: locationData.StationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        };
      });
  };

  //讓 fetchWeatherForecast 可以接收 cityName 作為參數
  const fetchWeatherForecast = (cityName) => {
    return fetch(
      `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-12808D45-FD59-4025-BF5E-E5D8F486A890&locationName=${cityName}`
    )
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {}
        );

        setWeatherElement((prevState) => ({
          ...prevState,
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        }));
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
  };

  const fetchSunriseSunset = (sunriseCityName) => {
    // 取得當前時間
    const now = new Date();
    // 將當前時間以 "西元年-月-日" 的時間格式呈現
    const nowDate = Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(now)
      .replace(/\//g, '-');
    return fetch(
      `https://opendata.cwa.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWA-12808D45-FD59-4025-BF5E-E5D8F486A890&limit=1&CountyName=${sunriseCityName}&Date=${nowDate}`
    )
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.locations.location[0].time[0];
        setWeatherElement((prevState) => ({
          ...prevState,
          sunrise: `${nowDate} ${locationData.SunRiseTime}`,
          sunset: `${nowDate} ${locationData.SunSetTime}`,
        }));
        return {
          sunrise: `${nowDate} ${locationData.SunRiseTime}`,
          sunset: `${nowDate} ${locationData.SunSetTime}`,
        };
      });
  };

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast, sunData] = await Promise.all([
        //locationName 是給「觀測」天氣資料拉取 API 用的地區名稱
        fetchCurrentWeather(locationName),
        //cityName 是給「預測」天氣資料拉取 API 用的地區名稱
        fetchWeatherForecast(cityName),
        //sunriseCityName 是給「日出日落」天氣資料拉取 API 用的地區名稱
        fetchSunriseSunset(sunriseCityName),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        ...sunData,
        isLoading: false,
      });
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetchingData();

    //將 locationName 和 cityName 帶入 useCallback 的 dependencies 中
  }, [locationName, cityName, sunriseCityName]);
  // 說明：一旦 locationName sunriseCityName 或 cityName 改變時，fetchData 就會改變，此時 useEffect 內的函式就會再次執行，拉取最新的天氣資料
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherApi;
