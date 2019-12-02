import axios from "axios";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");
import "moment/locale/ko";
moment.updateLocale("ko", {
  weekdaysShort: ["일", "월", "화", "수", "목", "금", "토"]
});

import Log from "../util/logger";

const allergyDict = require("./allergy.json");

let cache = {};

const formatMeal = (_meal: string) => {
  return _meal.replace(/\d+\./g, "").replace(/\n/g, "<br>");
};

const formatAllergyCodes = (_meal: string) => {
  let allergyCodes = _meal.match(/\d+\./g);
  allergyCodes = [...new Set(allergyCodes)]; // 중복 제거
  for (let i in allergyCodes) {
    allergyCodes[i] = allergyCodes[i].replace(/\./g, "");
  }
  allergyCodes.sort((a: any, b: any) => a - b);
  // allergyCodes = allergyCodes.join(" / "); // 배열을 문자열로 나열
  return allergyCodes;
};

const extractAllergicFoods = (_allergyCodes: any) => {
  let allergicFoods = [];
  for (let i in _allergyCodes) {
    allergicFoods.push(allergyDict[_allergyCodes[i]]);
  }
  return allergicFoods;
};

export async function fetchMeal() {
  Log.v("Started Fetching");

  let firstData = {}; // 결합될 첫 번째 데이터
  let secondData = {}; // 결합될 두 번째 데이터
  let mealData = {}; // 최종 데이터
  let latestDate = ""; // 가장 마지막 급식 날짜

  try {
    for (let currentToken = 0; latestDate !== "2015-03-03" && currentToken <= 2000; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=${currentToken}`);
      let items = data.data.articles;

      Object.keys(items).forEach(key => {
        let item = items[key];
        let date = item.local_date_of_pub_date.replace(/\./g, "-");
        let allergyCodes = formatAllergyCodes(item.content);

        firstData[date] = {
          meal: formatMeal(item.content),
          allergyCodes: allergyCodes,
          allergicFoods: extractAllergicFoods(allergyCodes)
        };

        latestDate = date;
      });
    }

    latestDate = "";
  } catch (err) {
    throw err;
  }

  try {
    for (let currentToken = 0; ["2019-07-03", "2018-12-27"].indexOf(latestDate) === -1 && currentToken <= 1200; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/3318247?next_token=${currentToken}`);
      let items = data.data.articles;

      Object.keys(items).forEach(key => {
        let item = items[key];
        let date = item.local_date_of_pub_date.replace(/\./g, "-");

        let allergyCodes = null;
        let allergicFoods = null;
        let img = `https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/SunrinInternetHighSchool.png/900px-SunrinInternetHighSchool.png`;

        if (!!firstData[date]) allergyCodes = firstData[date]["allergyCodes"];
        if (!!firstData[date]) allergicFoods = firstData[date]["allergicFoods"];
        if (item.images !== null) img = item.images[0];

        secondData[date] = {
          meal: formatMeal(item.content),
          allergyCodes: allergyCodes,
          allergicFoods: allergicFoods,
          img: img
        };

        latestDate = date;
      });
    }

    mealData = Object.assign({}, firstData, secondData);
    cache = mealData;
    Log.s("Finished Fetching");
    return mealData;
  } catch (err) {
    throw err;
  }
}

export function getRawMeal() {
  // ShortCuts용 급식 정보 반환
  return `「 ${moment(new Date()).format("MM.DD(ddd)")} 급식 」<br>
  &middot; ${cache[moment(new Date()).format("YYYY-MM-DD")]["meal"].replace(/\<br>/g, "<br>&middot; ")}<br><br>
  &ast;(${cache[moment(new Date()).format("YYYY-MM-DD")]["allergicFoods"]})`;
}

export function getRecentMeal() {
  // 최근(어제, 오늘, 내일) 급식
  let yesterdayMeal = cache[moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY-MM-DD")];
  let todayMeal = cache[moment(new Date()).format("YYYY-MM-DD")];
  let tomorrowMeal = cache[moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")];
  return [!!yesterdayMeal ? yesterdayMeal : "급식 없음", !!todayMeal ? todayMeal : "급식 없음", !!tomorrowMeal ? tomorrowMeal : "급식 없음"];
}

export function JgetRecentMeal() {
  // 최근(어제, 오늘, 내일) 급식 - Java
  let yesterdayMeal = cache[moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY-MM-DD")].replace(/\,/g, "\n").replace(/\<br>/g, "\n");
  let todayMeal = cache[moment(new Date()).format("YYYY-MM-DD")].replace(/\,/g, "\n").replace(/\<br>/g, "\n");
  let tomorrowMeal = cache[moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")].replace(/\,/g, "\n").replace(/\<br>/g, "\n");
  return {
    data: [!!yesterdayMeal ? yesterdayMeal : "급식 없음", !!todayMeal ? todayMeal : "급식 없음", !!tomorrowMeal ? tomorrowMeal : "급식 없음"]
  };
}

export function getMonthlyMeal(_month: string) {
  // 월간 급식
  let mealData = {};
  Object.keys(cache).forEach(key => {
    if (key.slice(0, 7) === _month) {
      let item = cache[key];
      mealData[key] = {
        meal: item["meal"],
        allergyCodes: item["allergyCodes"],
        allergicFoods: item["allergicFoods"],
        img: !!item["img"] ? item["img"] : null
      };
    }
  });
  return mealData;
}

export function JgetMonthlyMeal(_month: string) {
  // 월간 급식 - Java
  let mealData = [];
  Object.keys(cache).forEach(key => {
    if (key.slice(0, 7) === _month) {
      let item = cache[key];

      mealData.push({
        date: key,
        meal: `${item["meal"].replace(/\,/g, "\n").replace(/\<br>/g, "\n")}\n\n*(${item["allergicFoods"]})`,
        allergyCodes: item["allergyCodes"],
        allergicFoods: item["allergicFoods"],
        img: !!item["img"] ? item["img"] : null
      });
    }
  });
  return {
    data: mealData
  };
}

export function returnCache() {
  return cache;
}

export default { fetchMeal, getRawMeal, getRecentMeal, JgetRecentMeal, getMonthlyMeal, JgetMonthlyMeal, returnCache };
