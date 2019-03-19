const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
require("css.escape");
const brandList = require("./brand.js");

const getSeriesOrModel = async ({ id, type = "series" }) => {
  const seriesUrl = `https://ssl-meta.che300.com/meta/series/series_brand${id}.json?v=${Date.now()}`;
  const modelUrl = `https://ssl-meta.che300.com/meta/model/model_series${id}.json?v=${Date.now()}`;
  const resp = await fetch(type === "series" ? seriesUrl : modelUrl, {
    method: "get"
  });
  const json = await resp.json();
  return json;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const { key, value } = brandList[
    Math.floor(Math.random() * brandList.length)
  ];
  const seriesList = await getSeriesOrModel({
    type: "series",
    id: key
  });
  const { series_id, series_name } = seriesList[
    Math.floor(Math.random() * seriesList.length)
  ];

  const modelList = await getSeriesOrModel({
    type: "model",
    id: series_id
  });

  const { model_id, model_name, model_year } = modelList[
    Math.floor(Math.random() * modelList.length)
  ];

  const testInfo = {
    brandId: key,
    seriesId: series_id,
    modelId: model_id,
    modelYear: model_year,
    mile: Math.random()*100
  };
  console.log(`${value}  ${series_name} ${model_name}`);
  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800
  });
  try {
    await page.goto(
      `https://www.che300.com/pinggu?from=bd_seo&rt=1552964890138`
    );

    await page.click("#valnone");
    // brand click
    await page.waitForSelector(`#select1_2 #${CSS.escape(testInfo.brandId)}`);
    await page.click(`#select1_2 #${CSS.escape(testInfo.brandId)}`);

    await page.waitForSelector(`#select2_2 #${CSS.escape(testInfo.seriesId)}`);
    await page.click(`#select2_2 #${CSS.escape(testInfo.seriesId)}`);

    await page.waitForSelector(`#select3_2 #${CSS.escape(testInfo.modelId)}`);
    await page.click(`#select3_2 #${CSS.escape(testInfo.modelId)}`);
    

    await page.waitFor(500);
    await page.waitForSelector("#select4");

    await page.evaluate(
      (year, mile) => {
        $("#select4").click();
        $(`#${CSS.escape(year)}`).click();
        $(`#sele2_2 #${CSS.escape(1)}`).click();
        $("#lichengpd").val(mile);
        $("#lichengpd").blur();
      },
      testInfo.modelYear,
      testInfo.mile
    );

    const href = await page.evaluate(() => {
      return $("a.submit").attr("href");
    });
    console.log(href);
    await page.goto(href);
    // await page.waitForNavigation();
    await page.waitFor(3000);
    const { left, top, width, height } = JSON.parse(
      await page.evaluate(() => {
        $(".land").hide();
        return JSON.stringify(
          document.querySelector(".rbox.rb-price").getBoundingClientRect()
        );
      })
    );

    await page.screenshot({
      path: "test.png",
      clip: {
        x: left,
        y: top,
        width,
        height
      }
    });
  } catch (error) {
    throw new Error(error);
  }finally{
      await page.close();
      await browser.close();
  }
})();
