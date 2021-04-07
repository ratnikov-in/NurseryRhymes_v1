const categoryModel = require('../models/categoryModel')
const utils = require('../utils');
/**
 * Добавление категории
 * @param {OBJECT} category 
 * @returns true or false
 */
async function addCategory(category) {
    //Проверка что объект пришел
    if (!Category) return false
    //Проверка на наличие категории в БД
    let result = await categoryModel.find({name : category.name})
    if (result.length > 0) return false
    //Добавление категории
    await categoryModel.create(category)
    return true
}
/**
 * Получение категории по наименованию
 * @param {STRING} name 
 * @returns {OBJECT} OR false
 */
async function getCategory(name) {
    //Проверка что объект пришел
    if (!NamedNodeMap) return false
    //Получение категории
    let result = await categoryModel.findOne({name : name})
    if (!result) return false
    else return result
}
/**
 * 
 * @param {NUMBER} id 
 * @returns {OBJECT} Категория
 */
async function getCategoryById(id) {
    //Проверка что объект пришел
    if (!id) return false
    //Получение категории
    let result = await categoryModel.findOne({_id : id})
    if (!result) return false
    else return result
}
/**
 * Выбор всех категорий
 */
async function listCategories() {
    let result = await categoryModel.find({})
    if (!result) return false
    else return result
}
/**
 * Обновление категории
 * @param {OBJECT} Category 
 * @returns true or false
 */
async function updateCategory(category) {
    //Проверка что объект пришел
    if (!Category) return false
    //Получение категории
    let result = await categoryModel.findOne({_id : category._id})
    if (!result) return false
    //Обновление
    await categoryModel.updateOne({_id : category._id}, Category)
    return true
}
async function showPage(ctx,page=1){
    const fCategory = await listCategories()
    const psize = 5
    const pages = Math.ceil(fCategory.length/psize)
    const ptr   = page>pages?pages:(page<1?1:page)
    const kb = [[]]
    if (ptr>1) kb[0].unshift({text:'👈 Prev', callback_data:'listCategory'+(ptr-1)})
    if (ptr<pages) kb[0].push({text:'Next 👉', callback_data:'listCategory'+(ptr+1)})
    kb[0].push({text:'🏫 Home', callback_data:'home'})
    let list = fCategory.slice((ptr-1)*psize,ptr*psize)
    list = list.reverse()
    await utils.asyncForEach(list, async el => {
        kb.unshift([{text:el.name, callback_data:`categoryText${el._id}`}])
    })
    const textHTML = `Dear <strong>${ctx.from.username}</strong> please select category`
    const texMarkdown = `Dear *${ctx.from.username}* please select category`
    if (!ctx.callbackQuery) return ctx.replyWithHTML(textHTML,{reply_markup:{inline_keyboard:kb}})
	await ctx.telegram.editMessageText(ctx.from.id,ctx.callbackQuery.message.message_id,null,texMarkdown,{
        reply_markup:{
            inline_keyboard:kb},
            parse_mode: 'markdown'
        })
	await ctx.answerCbQuery()
}
module.exports = {
    addCategory,
    updateCategory,
    listCategories,
    getCategory,
    getCategoryById,
    showPage
}