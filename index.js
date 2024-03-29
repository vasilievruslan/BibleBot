const Telegraf = require('telegraf');
const axios = require('axios');
const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken)
const url = 'https://api.bibleonline.ru/bible';
const bible = require('./ru_synodal.json');
const verses = require('./verses.json');
const reg = /(\d*)\s*([а-я]+)\s*(\d+)(?:.(\d+))?(\s*-\s*(\d+)(?:\s*([а-я]+)\s*(\d+))?(?::(\d+))?)?/i;
const hashCode = (s) => {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};

const search = (query) => {
  var res = [];
  var count = 10;
  bible.forEach(el => {
    el.chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((verse, verseIndex) => {
        if(verse.toLowerCase().includes(query.toLowerCase())) {
          res.push({
            title: `${el.abbrev} ${chapterIndex + 1}:${verseIndex + 1}`,
            body: verse
          })
        }
      })
    })
  });
  return res.slice(0, 10);
}

const searchLink = async (query = 'Ин 3.16') => {
  let res;
  let { data } = await axios.get(url, {
    params: {
      callback: "bible",
      trans: "rus",
      max: "5",
      q: query
    }
  });
  data = JSON.parse(data.split('(')[1].split(')')[0]);
  if (data.length !== 0) {

    var title = data[0].h2
    res = data.slice(1).map(item => {
      return {
        title,
        body: item.v.t
      }
    })
  }else {
    res = verses;
  }
  return res;
};
bot.start((ctx) => ctx.reply('Привет, друг! Я бот, который поможет тебе быстро искать и делиться со своими друзьями любимыми стихами из библии!'))
bot.help((ctx) => ctx.reply('Просто напиши в поле сообщения @findversebot и дальше начни вводить свой запрос.\n Например: \"@findversebot Ибо так возлюбил\" или если ты знаешь ссылку на стих который хочешь отправить тогда \"@findversebot Ин 3.16\"'))

bot.on('inline_query', async ({update, inlineQuery, answerInlineQuery }) => {
  // console.log(update.inline_query.from)
  let results;
  let versesRes;
  if (reg.test(inlineQuery.query)) {
    versesRes = await searchLink(inlineQuery.query);
  } else {
    versesRes = search(inlineQuery.query);
  }
  console.log(inlineQuery.from.username + ': ' + inlineQuery.query);
  results = versesRes.map((verse, i) => ({
    type: 'article',
    id: hashCode(verse.title + i +  Math.random()),
    title: verse.title,
    description: verse.body,
    input_message_content: {
      message_text: `${verse.body} (${verse.title})`,
    }
  }))

  return answerInlineQuery(results)
})

bot.launch()
