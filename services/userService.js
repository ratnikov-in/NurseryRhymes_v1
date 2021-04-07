const userModel = require('../models/userModel')
/**
 * Добавление пользователя
 * @param {OBJECT} user 
 * @returns true or false
 */
async function addUser(user) {
    //Проверка что объект пришел
    if (!user) return false
    //Проверка на наличие пользователя в БД
    let result = await userModel.find({telegramId : user.telegramId})
    if (result.length > 0) return false
    //Добавление пользователя
    await userModel.create(user)
    return true
}
/**
 * Получение пользователя по id телеграм
 * @param {STRING} telegramId 
 * @returns {OBJECT} OR false
 */
async function getUser(telegramId) {
    //Проверка что объект пришел
    if (!telegramId) return false
    //Получение пользователя
    let result = await userModel.findOne({telegramId : telegramId})
    if (!result) return false
    else return result
}
/**
 * Выбор всех пользователей
 */
async function listUsers() {
    let result = await userModel.find({})
    if (!result) return false
    else return result
}
/**
 * Обновление заявки
 * @param {OBJECT} user 
 * @returns true or false
 */
async function updateUser(user) {
    //Проверка что объект пришел
    if (!user) return false
    //Получение пользователя
    let result = await userModel.findOne({_id : user._id})
    if (!result) return false
    //Обновление
    await userModel.updateOne({_id : user._id}, user)
    return true
}
module.exports = {
    addUser,
    updateUser,
    listUsers,
    getUser
}