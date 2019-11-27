/*
{
    "next_token": 20,
    "articles": [
      {
        "id": 104470953,
        "organization_id": 17195,
        "organization_name": "선린인터넷고등학교",
        "organization_logo": "https://iam-organization-r.akamaized.net/logo-image/17195/qa8AluKbzFCNKhOV.png",
        "group_id": 2071367,
        "group_name": "오늘의 급식",
        "title": "11월 29일 [중식]",
        "content": "크림소스스파게티\n닭강정\n양배추샐러드1.5.12.13.\n부쉬맨브레드1.2.5.6.13.\n버터 (1회용)2.5.13.\n피클&amp;단무지\n(음료) 과일맛음료 2",
        "author": "중식",
        "pub_date": "2019-11-29 00:00:00",
        "reg_date": "2019-10-28 22:44:16",
        "like_count": 0,
        "share_count": 0,
        "scrap_count": 0,
        "comment_count": 0,
        "images": null,
        "video": null,
        "files": null,
        "created_at": "2019-10-28 22:44:16",
        "updated_at": "2019-10-28 22:44:17",
        "deleted_at": null,
        "version": "2.0.0",
        "article_status": 1,
        "article_type": "article",
        "view_link": "http://l.iamschool.net/articles/view/104470953",
        "local_date_of_pub_date": "2019.11.29",
        "day_of_week_of_pub_date": "금"
      },
      {
        "id": 103645901,
        "organization_id": 17195,
        "organization_name": "선린인터넷고등학교",
        "organization_logo": "https://iam-organization-r.akamaized.net/logo-image/17195/qa8AluKbzFCNKhOV.png",
        "group_id": 2071367,
        "group_name": "오늘의 급식",
        "title": "11월 27일 [중식]",
        "content": "칼슘쌀밥\n미니짬뽕9.13.\n훈제오리겨자무침1.\n알감자조림\n포기김치\n황도",
        "author": "중식",
        "pub_date": "2019-11-27 00:00:00",
        "reg_date": "2019-10-24 01:31:29",
        "like_count": 0,
        "share_count": 0,
        "scrap_count": 0,
        "comment_count": 0,
        "images": null,
        "video": null,
        "files": null,
        "created_at": "2019-10-24 01:31:30",
        "updated_at": "2019-10-24 01:31:32",
        "deleted_at": null,
        "version": "2.0.0",
        "article_status": 1,
        "article_type": "article",
        "view_link": "http://l.iamschool.net/articles/view/103645901",
        "local_date_of_pub_date": "2019.11.27",
        "day_of_week_of_pub_date": "수"
      }
    ]
};
*/
import axios from "axios";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

async function getTodayMeal() {
  let returnData = [];
  try {
    let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/3318247?next_token=0`);
    let items = data.data.articles;
    Object.keys(items).forEach(key => {
      let item = items[key];
      if (moment(new Date()).format("YYYY.MM.DD") == item.local_date_of_pub_date) {
        returnData.push({
          date: item.local_date_of_pub_date,
          meal: item.content,
          img: item.images[0]
        });
      } else if (moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY.MM.DD") == item.local_date_of_pub_date) {
        returnData.push({
          date: item.local_date_of_pub_date,
          meal: item.content,
          img: item.images[0]
        });
      }
    });
    return returnData;
  } catch (err) {
    throw err;
  }
}

async function getAllMeal(maxToken: number) {
  let returnData = [];
  try {
    for (let currentToken = 0; currentToken <= maxToken; currentToken += 20) {
      let data = await axios.get(`https://school.iamservice.net/api/article/organization/17195/group/2071367?next_token=${currentToken}`);
      let items = data.data.articles;
      Object.keys(items).forEach(key => {
        let item = items[key];
        let allergy = item.content.match(/\d/g);
        allergy = allergy.join(", ");
        console.log(allergy);
        returnData[item.local_date_of_pub_date] = {
          date: item.local_date_of_pub_date,
          meal: item.content,
          allergy: allergy
        };
      });
      return returnData;
    }
  } catch (err) {
    throw err;
  }
  return returnData;
}
async function getMeal(method: string) {
  if (method === "/") {
    try {
      return await getTodayMeal();
    } catch (err) {
      throw err;
    }
  } else if (method === "monthly") {
    try {
      return await getAllMeal(40);
    } catch (err) {
      throw err;
    }
  }
}
export default getMeal;
