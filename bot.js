// Основные библиотеки
const  {Telegraf}  = require('telegraf')
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')

const token = '1737945044:AAEcLweBalvnVJX-FNRRNmEO_qJbLOYXWHI'
const bot = new Telegraf(token)
// Сервисы взаимодействия с данными из БД
const textService = require('./services/textService')
const userService = require('./services/userService')
const categoryService = require('./services/categoryService')
// Служебные функции
const utils = require('./utils');


const mainMenuTextDenied = (ctx) => `Dear ${ctx.from.username} you don't access from bot.\n`
const mainMenuTextAccess = (ctx) => `Dear ${ctx.from.username} search for nursery rhymes.\n`
//Основное меню
const mainMenuButtons = [[]]
mainMenuButtons.push([{text:'⭐️ Random', callback_data:'random'}])
mainMenuButtons.push([{text:'🔍 Search', callback_data:'search'}])
mainMenuButtons.push([{text: '📄 Category', callback_data: 'category'}])

bot.use(Telegraf.log())

bot.command('start', async (ctx) => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
      } else{
            await ctx.replyWithHTML(mainMenuTextAccess(ctx),{
                reply_markup:{
                    inline_keyboard:mainMenuButtons
                }
            })
    }
})

bot.action('random', async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        const randomText = await textService.randomText()
        const text = utils.createTextMsg(randomText)
        const textMakdown = utils.createTextMsgMarkdown(randomText)
        if (!ctx.callbackQuery) return ctx.replyWithHTML(text,{reply_markup:{inline_keyboard:mainMenuButtons}})
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMakdown,
            {reply_markup:
                {inline_keyboard:mainMenuButtons},
                parse_mode: "markdown"
            })
        ctx.answerCbQuery()
    }
})
bot.action('search', async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        const text = `Dear <strong>${ctx.from.username}</strong> for search please enter ?your word\n<b>Example</b>: <i>?Daddy</i> or <i>?Bee</i>`
        const textMakdown = `Dear *${ctx.from.username}* for search please enter ?your word\n*Example*: _?Daddy_ or _?Bee_`
        if (!ctx.callbackQuery) return ctx.replyWithHTML(text,{reply_markup:{inline_keyboard:mainMenuButtons}})
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMakdown,
            {reply_markup:
                {inline_keyboard:mainMenuButtons},
                parse_mode: "markdown"
            })
        ctx.answerCbQuery()
    }
})
bot.action('category', async ctx => {
    await categoryService.showPage(ctx)
    return true
})
bot.action(/^listCategory(\d+)$/, async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        await categoryService.showPage(ctx,+ctx.match[1])
    }
})
bot.action(/^categoryText/, async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        await textService.showPage(ctx)
    }
})
bot.action(/^textList/, async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        await textService.showPage(ctx,+ctx.match[1])
    }
})
bot.action(/^rhyme/, async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        await textService.showText(ctx)
    }
})
bot.action(/^textSearchList/, async ctx => {
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
        await ctx.replyWithHTML(mainMenuTextDenied(ctx))
    } else {
        await textService.showSearchPage(ctx,+ctx.match[1])
    }
})
bot.on('text', async ctx => {
    if (ctx.message.text.includes('?')) {
        await textService.showSearchPage(ctx)
    }
})
bot.action('home', async (ctx) => {
    let fUser = await userService.getUser(ctx.from.username)
    console.log(fUser);
    if (!ctx.callbackQuery) {
        if (!fUser) {
            await ctx.replyWithHTML(mainMenuTextDenied(ctx))
          } else{
                await ctx.replyWithHTML(mainMenuTextAccess(ctx),{
                    reply_markup:{
                        inline_keyboard:mainMenuButtons
                    }
                })
        }
    } else {
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,mainMenuTextAccess(ctx),
            {reply_markup:
                {inline_keyboard:mainMenuButtons},
                parse_mode: "markdown"
            })
    }
    await ctx.answerCbQuery()
})
bot.on("inline_query", async ctx => {
    let results = []
    let fUser = await userService.getUser(ctx.from.username)
    if (!fUser) {
       results = {title : 'Not autorized'}
    } else{
        const searchResults = await textService.searchText(ctx.inlineQuery.query);
        results =
          searchResults && searchResults.length
            ? searchResults.map((text, id) => ({
              id,
              type: "article",
              title: text.title,
              description: text.text,
              video_url: text.youtube,
              input_message_content: {
                message_text: utils.createTextMsg(text),
                parse_mode: "HTML"
              }
            }))
            : [];
      }
      await ctx.answerInlineQuery(results);
    });
bot.launch()
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  })
