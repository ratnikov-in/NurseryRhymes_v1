//Получение информации о пользователе
function getClientInfo(message) {
	return {
		firstName: message.from.first_name,
		lastName: message.from.last_name,
		telegramId: message.hasOwnProperty('chat') ? message.chat.id : message.from.id
	};
}
//Асинхронный цикл
 async function asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}
// Формирование текста сообщения HTML
function createTextMsg (text) {
    if (!text) return false
    if (text.youtube != 'null'){
        return `<strong>${text.title}</strong>\n${text.text}\nTags : ${text.tags.toString()}\nYOUTUBE : ${text.youtube}`
    } else {
        return `<strong>${text.title}</strong>\n${text.text}\nTags : ${text.tags.toString()}`
    }
}
// Формирование текста сообщения HTML
function createTextMsgMarkdown (text) {
    if (!text) return false
    if (text.youtube != 'null'){
        return `*${text.title}*\n ${replaceText(text.text)}\n Tags: ${text.tags.toString()}\nYOUTUBE : ${text.youtube}`
    } else {
        return `*${text.title}*\n${text.text}\nTags : ${text.tags.toString()}`
    }
}
function replaceText (text) {
    return text
        .replace(/\</g, "\\<")
        .replace(/\>/g, "\\>")
        .replace(/_/gi, "\\_")
        .replace(/-/gi, "\\-")
        .replace("~", "\\~")
        .replace(/`/gi, "\\`")
        .replace(/\./g, "\\.");

}
function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}
module.exports = {
    getClientInfo,
    asyncForEach,
    createTextMsg,
    createTextMsgMarkdown,
    paginate
}