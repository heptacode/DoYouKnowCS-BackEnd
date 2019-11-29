import axios from "axios";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const allergyDict = require("./allergy.json");

const formatMeal = (meal: string) => {
  return meal.replace(/\n/g, "<br>");
};

const formatAllergyCodes = (_allergyCodes: string) => {
  let allergyCodes = _allergyCodes.match(/\d+\./g);
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

export async function getTodayMeal() {
  // 오늘, 어제 급식 가져오기
  let returnData = []; // 배열
  let imgURLs = [];
  try {
    let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=0`);
    let items = data.data.articles;

    let imgData = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/3318247?next_token=0`);
    let imgItems = imgData.data.articles;

    Object.keys(imgItems).forEach(key => {
      let imgItem = imgItems[key];
      let date = imgItem.local_date_of_pub_date.replace(/\./g, "-");
      if (moment(new Date()).format("YYYY-MM-DD") == date) {
        imgURLs[0] = imgItem.images[0];
      } else if (moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY-MM-DD") == date) {
        imgURLs[1] = imgItem.images[0];
      }
    });

    Object.keys(items).forEach(key => {
      let item = items[key];
      let date = item.local_date_of_pub_date.replace(/\./g, "-");
      let allergyCodes = formatAllergyCodes(item.content);
      if (moment(new Date()).format("YYYY-MM-DD") == date) {
        // 오늘 급식
        returnData[0] = {
          date: date, // 날짜
          meal: formatMeal(item.content), // 식단
          img: imgURLs[0], // 급식 이미지
          allergyCodes: allergyCodes,
          allergicFoods: extractAllergicFoods(allergyCodes)
        };
      } else if (moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY-MM-DD") == date) {
        // 어제 급식
        returnData[1] = {
          date: date, // 날짜
          meal: formatMeal(item.content), // 식단
          img: imgURLs[1], // 급식 이미지
          allergyCodes: allergyCodes,
          allergicFoods: extractAllergicFoods(allergyCodes)
        };
      }
    });
    return returnData;
  } catch (err) {
    throw err;
  }
}

export async function getMonthlyMeal(_month: string) {
  // 월간 급식 메뉴 가져오기
  let returnData = {}; // JSON
  let ifLastMealFound = false; // 해당 월의 마지막 급식 정보를 찾았는지의 여부
  let ifFirstMealFound = false; // 해당 월의 처음 급식 정보를 찾았는지의 여부
  try {
    for (let currentToken = 0; !(ifFirstMealFound && ifLastMealFound) && currentToken <= 200; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=${currentToken}`);
      let items = data.data.articles;

      Object.keys(items).forEach(key => {
        let item = items[key];
        let date = item.local_date_of_pub_date.replace(/\./g, "-");
        let month = date.slice(0, 7);

        if (_month === month) {
          console.log(_month, month, date);
          console.log("일치합니다");
          if ([`${month}-01`, `${month}-02`, `${month}-03`, `${month}-04`, `${month}-05`, `${month}-06`].indexOf(date) >= 0) {
            ifFirstMealFound = true;
          } else if ([`${month}-26`, `${month}-27`, `${month}-28`, `${month}-29`, `${month}-30`, `${month}-31`].indexOf(date) >= 0) {
            ifLastMealFound = true;
          }

          let allergyCodes = formatAllergyCodes(item.content);

          returnData[date] = {
            meal: formatMeal(item.content),
            allergyCodes: allergyCodes,
            allergicFoods: extractAllergicFoods(allergyCodes)
          };
        }
      });
    }
    return [returnData];
  } catch (err) {
    throw err;
  }
}

export async function getAllMeal(maxToken: number) {
  // 전체 급식 메뉴 가져오기
  let returnData = {}; // JSON
  try {
    for (let currentToken = 0; currentToken <= maxToken; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=${currentToken}`);
      let items = data.data.articles;

      Object.keys(items).forEach(key => {
        let item = items[key];
        let date = item.local_date_of_pub_date.replace(/\./g, "-");
        let allergyCodes = formatAllergyCodes(item.content);

        returnData[date] = {
          meal: formatMeal(item.content),
          allergyCodes: allergyCodes,
          allergicFoods: extractAllergicFoods(allergyCodes)
        };
      });
    }
    return [returnData];
  } catch (err) {
    throw err;
  }
}

export default { getTodayMeal, getMonthlyMeal, getAllMeal };
