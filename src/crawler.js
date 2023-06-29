import * as Spider from "node-spider";
import * as TurndownService from "turndown";
import * as cheerio from "cheerio";
import parse from "url-parse";
const turndownService = new TurndownService();

class Crawler {
  pages;
  limit;
  urls;
  spider;
  count;
  textLengthMinimum;

  constructor(urls, limit, textLengthMinimum) {
    this.urls = urls;
    this.limit = limit;
    this.textLengthMinimum = textLengthMinimum;

    this.count = 0;
    this.pages = [];
    this.spider = {};
  }

  handleRequest = (doc) => {
    const $ = cheerio.load(doc.res.body);
    $("script").remove();
    $("#hub-sidebar").remove();
    $("header").remove();
    $("nav").remove();
    $("img").remove();
    const title = $("title").text() || $(".article-title").text();
    const html = $("body").html();
    const text = turndownService.turndown(html);
    const page = {
      url: doc.url,
      text,
      title,
    };
    if (text.length > this.textLengthMinimum) {
      this.pages.push(page);
    }

    doc.$("a").each((i, elem) => {
      var href = doc.$(elem).attr("href")?.split("#")[0];
      var targetUrl = href && doc.resolve(href);
      // crawl more
      if (
        targetUrl &&
        this.urls.some((u) => {
          const targetUrlParts = parse(targetUrl);
          const uParts = parse(u);
          return targetUrlParts.hostname === uParts.hostname;
        }) &&
        this.count < this.limit
      ) {
        this.spider.queue(targetUrl, this.handleRequest);
        this.count = this.count + 1;
      }
    });
  };

  start = async () => {
    this.pages = [];
    return new Promise((resolve, reject) => {
      this.spider = new Spider({
        concurrent: 5,
        delay: 0,
        allowDuplicates: false,
        catchErrors: true,
        addReferrer: false,
        xhr: false,
        keepAlive: false,
        error: (err, url) => {
          reject(err);
        },
        // Called when there are no more requests
        done: () => {
          resolve(this.pages);
        },
        headers: { "user-agent": "node-spider" },
        encoding: "utf8",
      });
      this.urls.forEach((url) => {
        this.spider.queue(url, this.handleRequest);
      });
    });
  };
}

export { Crawler };
