import axios from "axios";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");
const allergyDict = require("./allergy.json");

async function getTodayMeal() {
  // 오늘, 어제 급식 가져오기
  let returnData = []; // 배열
  let imgURLs = [];
  try {
    let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=0`);
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

    let items = data.data.articles;
    Object.keys(items).forEach(key => {
      let item = items[key];
      // 식단 형식화
      let meal = item.content.replace(/\n/g, "<br>");
      // 알레르기 정보
      let allergy = item.content.match(/\d+\./g);
      let allergyList = [];
      allergy = [...new Set(allergy)]; // 중복 제거
      allergy.sort((a, b) => a - b);
      for (let i in allergy) {
        allergy[i] = allergy[i].replace(/\./g, "");
        allergyList.push(allergyDict[allergy[i]]);
      }
      allergy = allergy.join(" / "); // 배열을 문자열로 나열
      //
      let date = item.local_date_of_pub_date.replace(/\./g, "-");
      if (moment(new Date()).format("YYYY-MM-DD") == date) {
        // 오늘 급식
        returnData[0] = {
          date: date, // 날짜
          meal: item.content, // 식단
          img: imgURLs[0], // 급식 이미지
          allergy: allergyList
        };
      } else if (moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY-MM-DD") == date) {
        // 어제 급식
        returnData[1] = {
          date: date, // 날짜
          meal: item.content, // 식단
          img: imgURLs[1], // 급식 이미지
          allergy: allergyList
        };
      }
    });
    return returnData;
  } catch (err) {
    throw err;
  }
}

async function getAllMeal(maxToken: number) {
  // 전체 급식 메뉴 가져오기
  let returnData = {}; // JSON
  try {
    for (let currentToken = 0; currentToken <= maxToken; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=${currentToken}`);
      let items = data.data.articles;
      Object.keys(items).forEach(key => {
        let item = items[key];
        // 식단 형식화
        let meal = item.content.replace(/\n/g, "<br>");
        // 알레르기 정보
        let allergy = item.content.match(/\d+\./g);
        let allergyList = [];
        allergy = [...new Set(allergy)]; // 중복 제거
        allergy.sort((a, b) => a - b);
        for (let i in allergy) {
          allergy[i] = allergy[i].replace(/\./g, "");
          allergyList.push(allergyDict[allergy[i]]);
        }
        allergy = allergy.join(" / "); // 배열을 문자열로 나열
        //
        let date = item.local_date_of_pub_date.replace(/\./g, "-");
        returnData[date] = {
          // date: date,
          meal: meal,
          allergy: allergy,
          allergyList: allergyList
        };
      });
    }
    return returnData;
  } catch (err) {
    throw err;
  }
}
async function getMeal(method: any) {
  if (method === "/") {
    // 오늘, 어제 급식 가져오기
    try {
      return await getTodayMeal();
    } catch (err) {
      throw err;
    }
  } else if (method === "monthly" || parseInt(method)) {
    // 전체 급식 가져오기
    try {
      return await getAllMeal(parseInt(method) ? parseInt(method) : 0);
    } catch (err) {
      throw err;
    }
  }
}
export default getMeal;
