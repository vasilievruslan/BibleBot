const Telegraf = require('telegraf');
const fetch = require('node-fetch');
const request = require("request");
const apiKey = process.env.apiKey;
const botToken = process.env.botToken;


function search(query = '', cb) {
  var options = {
    method: 'GET',
    headers: { 'api-key': apiKey },
    url: 'https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/search',
    qs: { query: query }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    let res = JSON.parse(body)
    cb(res)
  });
}

// bot.on('inline_query', ({ inlineQuery, answerInlineQuery }) => {
//   search(inlineQuery.query, (res) => {
//     const results = res.data.verses.map((verse) => ({
//       type: 'article',
//       id: verse.id,
//       title: verse.reference,
//       input_message_content: verse.text
//     }));
//     answerInlineQuery(results);
//   })
// })

async function omdbSearch (query = '') {
  const apiUrl = `http://www.omdbapi.com/?s=${query}&apikey=9699cca`
  const response = await fetch(apiUrl)
  const json = await response.json()
  const posters = (json.Search && json.Search) || []
  return posters.filter(({ Poster }) => Poster && Poster.startsWith('https://')) || []
}

const bot = new Telegraf(botToken);

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
  console.log(inlineQuery);
  const posters = await omdbSearch(inlineQuery.query)
  const results = posters.map((poster) => ({
    type: 'photo',
    id: poster.imdbID,
    caption: poster.Title,
    description: poster.Title,
    thumb_url: poster.Poster,
    photo_url: poster.Poster
  }))
  return answerInlineQuery(results)
})

bot.launch()
