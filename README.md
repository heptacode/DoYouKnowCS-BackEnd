# MealAPI
> IamSchool API Parser for Android & Django Project at Sunrin Internet High School

## Yarn Scripts
**Install dependencies** :
```bash
yarn
```

Serve with Hot Reload :
```bash
yarn serve
```

Bundle for Production via Webpack :
```bash
yarn build
```

Run Deployment Automation :
```bash
yarn deploy
```

Stop Deployment :
```bash
yarn stop
```

## Environment Setup (.env)
```
HTTP_HOST=(localhost for default)
HTTP_PORT=(80 for default)
HTTPS_HOST=(localhost for default)
HTTPS_PORT=(443 for default)
```

## Express Routes
- **/**
  - Executes *getTodayMeal()*
  - Returns Today & Yesterday Meal
  - Also returns "급식 없음" if meal not served

- **/raw**
  - Executes *getRawMeal()*
  - Returns raw HTML meal data for <a href="https://apps.apple.com/us/app/shortcuts/id1462947752" target="_blank">*Apple Shortcuts*</a>
  - Includes allergic food Info

- **/monthly**
  - Executes *getMonthlyMeal()*
  - Returns Meal of the Month

- **/monthly/YYYY-DD**
  - Executes *getMonthlyMeal()* with client parameters
  - Returns Meal Object Corresponding to client parameters

- **/fetch**
  - Executes async function *fetchMeal()*
  - Manually fetches meal
  - Returns All of the meals so far (including images)

- **/cache**
  - Executes *returnCache()*
  - Returns cache

- **/allergy**
  - Returns Allergic Food Info

## Express Routes (Android Java Support)
- **/J**
  - Executes *JgetTodayMeal()*
  - Returns Today & Yesterday Meal
  - Also returns "급식 없음" if meal not provided

- **/Jmonthly**
  - Executes *JgetMonthlyMeal()*
  - Returns Meal of the Month

- **/Jmonthly/YYYY-DD**
  - Executes *JgetMonthlyMeal()* with client parameters
  - Returns Meal Object Corresponding to client parameters