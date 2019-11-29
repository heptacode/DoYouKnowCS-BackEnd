import axios from "axios";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

import Log from "../util/logger";

const allergyDict = require("./allergy.json");

let cache = {};

const formatMeal = (_meal: string) => {
  return _meal
    .replace(/\d\./g, "")
    .replace(/\d/g, "")
    .replace(/\n/g, "<br>");
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

  let mealDatas = {}; // 급식 객체
  let imgURLs = {}; // 이미지 객체
  let latestDate = ""; // 가장 마지막 급식 날짜

  try {
    for (let currentToken = 0; ["2019-07-03", "2018-12-27"].indexOf(latestDate) === -1 && currentToken <= 1200; currentToken += 20) {
      let imgData = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/3318247?next_token=${currentToken}`);
      let imgItems = imgData.data.articles;

      Object.keys(imgItems).forEach(key => {
        let imgItem = imgItems[key];
        let date = imgItem.local_date_of_pub_date.replace(/\./g, "-");
        if (imgItem.images !== null) {
          imgURLs[date] = imgItem.images[0];
        } else {
          imgURLs[date] = `https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/SunrinInternetHighSchool.png/900px-SunrinInternetHighSchool.png`;
        }

        latestDate = date;
      });
    }
    latestDate = "";
  } catch (err) {
    throw err;
  }

  try {
    for (let currentToken = 0; latestDate !== "2015-03-03" && currentToken <= 2000; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=${currentToken}`);
      let items = data.data.articles;

      Object.keys(items).forEach(key => {
        let item = items[key];
        let date = item.local_date_of_pub_date.replace(/\./g, "-");
        let allergyCodes = formatAllergyCodes(item.content);

        mealDatas[date] = {
          meal: formatMeal(item.content),
          allergyCodes: allergyCodes,
          allergicFoods: extractAllergicFoods(allergyCodes),
          img: imgURLs[date]
        };

        latestDate = date;
      });
    }
    cache = mealDatas;
    Log.s("Finished Fetching");
    return mealDatas;
  } catch (err) {
    throw err;
  }
}

export function getRawMeal() {
  // ShortCuts용 급식 정보 반환
  return `${cache[moment(new Date()).format("YYYY-MM-DD")]["meal"]}<br>${cache[moment(new Date()).format("YYYY-MM-DD")]["allergicFoods"]}`;
}

export function getTodayMeal() {
  // 오늘, 어제 급식
  let todayMeal = cache[moment(new Date()).format("YYYY-MM-DD")];
  let yesterdayMeal = cache[moment(new Date()).format("YYYY-MM-DD")];
  return [todayMeal === null ? "급식 없음" : todayMeal, yesterdayMeal === null ? "급식 없음" : yesterdayMeal];
}
export function JgetTodayMeal() {
  return [
    {
      data: getTodayMeal()
    }
  ];
}

export function getMonthlyMeal(_month: string) {
  // 월간 급식
  let mealDatas = {};
  Object.keys(cache).forEach(key => {
    if (key.slice(0, 7) === _month) {
      let item = cache[key];
      mealDatas[key] = {
        meal: item["meal"],
        allergyCodes: item["allergyCodes"],
        allergicFoods: item["allergicFoods"],
        img: item["img"]
      };
    }
  });
  return mealDatas;
}
export function JgetMonthlyMeal(_month: string) {
  return [
    {
      data: getMonthlyMeal(_month)
    }
  ];
}

export function returnCache() {
  return cache;
}

export default { fetchMeal, getRawMeal, getTodayMeal, JgetTodayMeal, getMonthlyMeal, JgetMonthlyMeal, returnCache };
