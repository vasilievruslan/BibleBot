const Telegraf = require('telegraf');
const axios = require('axios');
const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken)
const url = 'https://api.bibleonline.ru/bible';
const bible = require('./ru_synodal.json');
const verses = require('./verses.json');
const hashCode = (s) => {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};

const search = async (query = 'Ин 3.16') => {
  let res;
  let data = await axios.get(url, {
    params: {
      callback: "bible",
      trans: "rus",
      max: "5",
      q: query
    }
  });
  data = JSON.parse(data.data.split('(')[1].split(')')[0]);
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


bot.on('inline_query', async ({update, inlineQuery, answerInlineQuery }) => {
  console.log(update.inline_query.from)
  let results;
  let versesRes = await search(inlineQuery.query)
  // console.log(versesRes);
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


// bot.on('text', async (ctx) => {
//   const query = ctx.message.text
//   const verses = await search(query);
//
//   return ctx.reply(`${verses[1].v.t}, (${verses[0].h2})`)
// })

// console.log(search('бт 1 1'))
bot.launch()
console.log('bot started')
