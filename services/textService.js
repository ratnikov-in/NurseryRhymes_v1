const textModel = require('../models/textModel')
const categoryModel = require('../models/categoryModel')
const utils = require('../utils')
const categoryService = require('./categoryService')
/**
 * Добавление текста
 * @param {OBJECT} text 
 * @returns true or false
 */
async function addText(text) {
    //Проверка что объект пришел
    if (!text) return false
    //Проверка на наличие текста в БД
    let result = await textModel.find({title : text.title})
    if (result.length > 0) return false
    //Добавление текста
    await textModel.create(text)
    return true
}
/**
 * Получение текста по залоголовку
 * @param {STRING} title 
 * @returns {OBJECT} OR false
 */
async function getText(title) {
    //Проверка что объект пришел
    if (!title) return false
    //Получение пользователя
    let result = await textModel.findOne({title : title}).populate('Category')
    if (!result) return false
    else return result
}
/**
 * Получение текста по залоголовку
 * @param {NUMBER} id 
 * @returns {OBJECT} OR false
 */
 async function getTextById(id) {
    //Проверка что объект пришел
    if (!id) return false
    //Получение пользователя
    let resText = await textModel.findOne({_id : id}).populate('Category')
    if (!resText) return false
    else {
        // console.log(resText);
        let categoryTags = []
        if (resText.categories.length > 0) {
            await utils.asyncForEach(resText.categories, async categoryId => {
                // console.log(categoryId);
                let category = await categoryModel.findOne({_id : categoryId})
                categoryTags.push(category.tag)
            })
        }
        let result = {
            _id: resText._id,
            url: resText.url,
            youtube: resText.youtube,
            title: resText.title,
            text: resText.text,
            tags: categoryTags,
            created: resText.created,
            categories: resText.categories
        }
        return result
    }
}
/**
 * Выбор всех текстов
 */
async function listTexts() {
    try{
        let result = await textModel.find({}).populate('Category')
        if (!result) return []
        else return result
    }catch(error){
        return []
    }
}
/**
 * Обновление текста
 * @param {OBJECT} text 
 * @returns true or false
 */
async function updateText(text) {
    //Проверка что объект пришел
    if (!text) return false
    //Получение текста
    let result = await textModel.findOne({_id : text._id})
    if (!result) return false
    //Обновление
    await textModel.updateOne({_id : text._id}, text).populate('Category')
    return true
}/**
 * Получение рандомного текста
 * @returns {OBJECT}
 */
async function randomText() {
    try{
        let resText = await textModel.aggregate(
            [ { $sample: { size: 1 } } ]
        )
        resText = resText[0]
        let categoryTags = []

        if (resText.categories && resText.categories.length > 0) {
            await utils.asyncForEach(resText.categories, async categoryId => {
                let category = await categoryModel.findOne({_id : categoryId})
                categoryTags.push(category.tag)
            })
        }
        let result = {
            _id: resText._id,
            url: resText.url,
            youtube: resText.youtube,
            title: resText.title,
            text: resText.text,
            tags: categoryTags,
            created: resText.created,
            categories: resText.categories
        }
        return result
    }catch(error) {
        console.log(error);
        return []
    }
}
/**
 * Поиск по слову
 * @param {STRING} text 
 * @returns {OBJECT} 
 */
async function searchText(text) {
    try{
        let resTexts  = await textModel.find({$text: {$search: text}}).populate('Category')
        
        if (!resTexts) return []
        else {
            let result = []
            await utils.asyncForEach(resTexts, async resText => {
                let categoryTags = []
                if (resText.categories.length > 0) {
                    await utils.asyncForEach(resText.categories, async categoryId => {
                        let category = await categoryModel.findOne({_id : categoryId})
                        categoryTags.push(category.tag)
                    })
                }
                let res = {
                    _id: resText._id,
                    url: resText.url,
                    youtube: resText.youtube,
                    title: resText.title,
                    text: resText.text,
                    tags: categoryTags,
                    created: resText.created,
                    categories: resText.categories
                }
                result.push(res)
            })
            return result
        }
    }catch(error){ 
        console.log(error);
        return []
    }
}
async function searchByCategory(categoryId) {
    try{
        let resTexts  = await textModel.find({categories : categoryId})
        if (!resTexts || resTexts.length == 0) return []
        if (resTexts.length > 0){
            let result = []
            await utils.asyncForEach(resTexts, async resText => {
                let categoryTags = []
                if (resText.categories.length > 0) {
                    await utils.asyncForEach(resText.categories, async categoryId => {
                        console.log(categoryId);
                        let category = await categoryModel.findOne({_id : categoryId})
                        categoryTags.push(category.tag)
                    })
                }
                let res = {
                    _id: resText._id,
                    url: resText.url,
                    youtube: resText.youtube,
                    title: resText.title,
                    text: resText.text,
                    tags: categoryTags,
                    created: resText.created,
                    categories: resText.categories
                }
                result.push(res)
            })
            return result
    }
    }catch(error){ 
        console.log(error);
        return []
    }
}
async function showPage(ctx,page=1){
    let fCat = ctx.callbackQuery.data
    const validateMode = fCat.split('_')
    if (validateMode.length == 2){
       fCat = validateMode[1]
       page = validateMode[0].substring(8)
    }
    else {
        fCat = ctx.callbackQuery.data.substring(12)
    }
    const fTexts = await searchByCategory(fCat)
    let CategoryText = await categoryService.getCategoryById(fCat)
    const kb = [[]]
    if (fTexts.length === 0 || !fTexts) {
        let textMarkdown = `Sorry in category ${CategoryText.name} I don't find rhymes :(`
        kb.push([{text:'⭐️ Random', callback_data:'random'}])
        kb.push([{text:'🔍 Search', callback_data:'search'}])
        kb.push([{text:'🏫 Home', callback_data:'home'}])
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMarkdown,{
            reply_markup:{
                inline_keyboard:kb},
                parse_mode: 'markdown'
            })
    } else
    {
        const psize = 5
        console.log('fTexts length ' + fTexts.length);
        const pages = Math.ceil(fTexts.length/psize)
        console.log('pages ' + pages);
    
        const ptr = page>pages?pages:(page<1?1:page)
        console.log(ptr);
        if (ptr>1) kb[0].unshift({text:'👈 Prev', callback_data:`textList${(ptr-1)}_${fCat}`})
        if (ptr<pages) kb[0].push({text:'Next 👉', callback_data:`textList${(ptr+1)}_${fCat}`})
        kb[0].push({text:'🏫 Home', callback_data:'home'})
        let list = fTexts.slice((ptr-1)*psize,ptr*psize)
        console.log(list)
        list = list.reverse()
        console.log(list);
        console.log('list');
        await utils.asyncForEach(list, async el => {
            kb.unshift([{text:el.title, callback_data:`rhyme${el._id}`}])
        })
        console.log(kb);
        const textHTML = `Dear <strong>${ctx.from.username}</strong> please select rhymes in category: <strong>${CategoryText.name}</strong>`
        const textMarkdown = `Dear *${ctx.from.username}* please select rhymes in category: *${CategoryText.name}*`
        if (!ctx.callbackQuery) return ctx.replyWithHTML(textHTML,{reply_markup:{inline_keyboard:kb}})
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMarkdown,{
            reply_markup:{
                inline_keyboard:kb},
                parse_mode: 'markdown'
            })
    }
    await ctx.answerCbQuery()
}
async function showText(ctx){
    let textId = ctx.callbackQuery.data.substring(5)
    const kb = [[]]
    const fText = await getTextById(textId)
    if (!fText) {
        let textMarkdown = `Sorry text by id ${textId} I don't find in rhymes :(`
        kb.push([{text:'⭐️ Random', callback_data:'random'}])
        kb.push([{text:'🔍 Search', callback_data:'search'}])
        kb.push([{text: '📄 Category', callback_data: 'category'}])
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMarkdown,{
            reply_markup:{
                inline_keyboard:kb}            })
    } else{
        let textMarkdown = utils.createTextMsgMarkdown(fText)
        console.log(textMarkdown);
        kb.push([{text:'⭐️ Random', callback_data:'random'}])
        kb.push([{text:'🔍 Search', callback_data:'search'}])
        kb.push([{text: '📄 Category', callback_data: 'category'}])
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMarkdown,{
            reply_markup:{
                inline_keyboard:kb}            })
    }
    await ctx.answerCbQuery()
}
async function showSearchPage(ctx,page=1){
    let fText
    if (ctx.callbackQuery) fText = ctx.callbackQuery.data
    else fText = ctx.message.text
    const validateMode = fText.split('_')
    if (validateMode.length == 2){
        fText = validateMode[1]
        page = validateMode[0].substring(14)
    }
    const fTexts = await searchText(fText)
    const kb = [[]]
    if (fTexts.length === 0 || !fTexts) {
        let textMarkdown = `Sorry but ${fText.substring(1)} I don't find rhymes :(`
        kb.push([{text:'⭐️ Random', callback_data:'random'}])
        kb.push([{text:'🔍 Search', callback_data:'search'}])
        kb.push([{text:'🏫 Home', callback_data:'home'}])
        if (!ctx.callbackQuery) return ctx.replyWithHTML(textMarkdown,{reply_markup:{inline_keyboard:kb}})
        else await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMarkdown,{
            reply_markup:{
                inline_keyboard:kb},
                parse_mode: 'markdown'
            })
    } else
    {
        const psize = 5
        console.log('fTexts length ' + fTexts.length);
        const pages = Math.ceil(fTexts.length/psize)
        console.log('pages ' + pages);
    
        const ptr = page>pages?pages:(page<1?1:page)
        console.log(ptr);
        if (ptr>1) kb[0].unshift({text:'👈 Prev', callback_data:`textSearchList${(ptr-1)}_${fText}`})
        if (ptr<pages) kb[0].push({text:'Next 👉', callback_data:`textSearchList${(ptr+1)}_${fText}`})
        kb[0].push({text:'🏫 Home', callback_data:'home'})
        let list = fTexts.slice((ptr-1)*psize,ptr*psize)
        console.log(list)
        list = list.reverse()
        console.log(list);
        console.log('list');
        await utils.asyncForEach(list, async el => {
            kb.unshift([{text:el.title, callback_data:`rhyme${el._id}`}])
        })
        console.log(kb);
        const textHTML = `Dear <strong>${ctx.from.username}</strong> please select rhymes by word: <strong>${fText.substring(1)}</strong>`
        const textMarkdown = `Dear *${ctx.from.username}* please select rhymes by word: *${fText.substring(1)}*`
        if (!ctx.callbackQuery) return ctx.replyWithHTML(textHTML,{reply_markup:{inline_keyboard:kb}})
        await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,textMarkdown,{
            reply_markup:{
                inline_keyboard:kb},
                parse_mode: 'markdown'
            })
    }
    await ctx.answerCbQuery()
}
module.exports = {
    addText,
    updateText,
    listTexts,
    getText,
    searchText,
    randomText,
    getTextById,
    searchByCategory,
    showPage,
    showText,
    showSearchPage
}
