import { useState, useEffect, useCallback } from 'react';

//讓 useWeatherApi 可以接收參數
const useWeatherApi = (currentLocation) => {
  //將傳入的 currentLocation 透過解構賦值取出 locationName 和 cityName
  const { locationName, cityName } = currentLocation;
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
    isLoading: true,
  });

  //讓 fetchCurrentWeather 可以接收 locationName 作為參數
  const fetchCurrentWeather = (locationName) => {
    // 加上 return 直接把 fetch API 回傳的 Promise 回傳出去
    //在 API 的網址中可以帶入 locationName 去撈取特定地區的天氣資料
    return fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-643031C1-D55B-4B98-9024-F3CA69E95F77&locationName=${locationName}`
    )
      .then((response) => response.json())
      .then((data) => {
        // 定義 `locationData` 把回傳的資料中會用到的部分取出來
        const locationData = data.records.location[0];

        // 將風速（WDSD）、氣溫（TEMP）和濕度（HUMD）的資料取出
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );

        //要使用到 React 組件中的資料
        setWeatherElement((prevState) => ({
          ...prevState,
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          description: '多雲時晴',
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        }));
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        };
      });
  };

  //讓 fetchWeatherForecast 可以接收 cityName 作為參數
  const fetchWeatherForecast = (cityName) => {
    return fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-643031C1-D55B-4B98-9024-F3CA69E95F77&locationName=${cityName}`
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

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        //locationName 是給「觀測」天氣資料拉取 API 用的地區名稱
        fetchCurrentWeather(locationName),
        //cityName 是給「預測」天氣資料拉取 API 用的地區名稱
        fetchWeatherForecast(cityName),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      });
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetchingData();

    //將 locationName 和 cityName 帶入 useCallback 的 dependencies 中
  }, [locationName, cityName]);
  // 說明：一旦 locationName 或 cityName 改變時，fetchData 就會改變，此時 useEffect 內的函式就會再次執行，拉取最新的天氣資料
  useEffect(() => {
    console.log('execute function in useEffect');
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherApi;
