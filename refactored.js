const invoices = [
  {
    "customer": "MDT",
    "performances": [
      {
      "playId": "Гамлет",
      "audience": 55,
      "type": "tragedy"
      },
      {
      "playId": "Ромео и Джульетта",
      "audience": 35,
      "type": "tragedy"
      },
      {
      "playId": "Отелло",
      "audience": 40,
      "type": "comedy"
      }
    ]
  }
];

function statement(invoices, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;

  const format = new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB", minimumFractionDigits: 2
  }).format;

  for (let perf of invoices) {
    const play = perf.performances[0];
    let result = `Счет для ${perf.customer}\n`;
    let thisAmount = 0;
    switch (play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (play.audience > 30) {
          thisAmount += 1000 * (play.audience - 30);
        }
        break;
      case "comedy":
        thisAmount = 30000;
        if (play.audience > 20) {
          thisAmount += 10000 + 500 * (play.audience - 20);
        }
        thisAmount += 300 * play.audience;
        break;
      default:
        throw new Error('неизвестный тип: ${play.type}');
      }

    // Добавление бонусов
    volumeCredits += Math.max(play.audience - 30);

    // Дополнительный бонус за каждые 10 комедий
    if ("comedy" === play.type) volumeCredits += Math.floor(play.audience / 5);

    // Вывод строки счета
    result += `${play.playId}: ${format(thisAmount / 100)}\n`;
    result += `${play.audience} мест\n`;
    totalAmount += thisAmount;
    result += `Итого с вас ${(format(totalAmount/100))}\n`;
    result += `Вы заработали ${volumeCredits} бонусов\n`;
    // return result;
    console.log(result);
  }
}

statement(invoices);