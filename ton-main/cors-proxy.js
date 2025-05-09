// Этот файл нужно разместить на сервере Node.js, который поддерживает выполнение серверного кода
// Например, на Heroku, Vercel, Netlify Functions или других платформах

const express = require("express")
const cors = require("cors")
const axios = require("axios")
const app = express()
const PORT = process.env.PORT || 3000

// Разрешаем CORS для вашего домена
app.use(
  cors({
    origin: "https://heronwaterwow.github.io",
  }),
)

app.use(express.json())

// Эндпоинт для пересылки сообщений в Telegram
app.post("/send-to-telegram", async (req, res) => {
  try {
    const { botToken, chatId, message } = req.body

    if (!botToken || !chatId || !message) {
      return res.status(400).json({ success: false, error: "Отсутствуют необходимые параметры" })
    }

    // Отправка сообщения в Telegram
    const telegramResponse = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    })

    return res.json({ success: true, data: telegramResponse.data })
  } catch (error) {
    console.error("Ошибка при отправке в Telegram:", error)
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response ? error.response.data : null,
    })
  }
})

app.listen(PORT, () => {
  console.log(`CORS прокси сервер запущен на порту ${PORT}`)
})
