const invoices = [
  {
    "customer": "MDT",
    "performance": [
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
      },
    ]
  },
  {
    "customer": "BDT",
    "performance": [
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
      "audience": 80,
      "type": "comedy"
      },
    ]
  },
  {
    "customer": "MDT",
    "performance": [
      {
      "playId": "Отелло",
      "audience": 40,
      "type": "comedy"
      },
    ]
  },
];

 /** Формат вывода денежных значений */
 const format = new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", minimumFractionDigits: 2
}).format;

/** Константа для рассчета бонусов */
const BONUS_GAP = 30;

/** Хранилище данных о стоимости спектаклей */
const AMOUNT = {
  TRAGEDY: 40000,
  COMEDY: 30000,
};


/** Мапа-архив с краткой информацией о всех поступивших заказах */
const archive = new Map();

/**
 * Добавляет новый элемент в архив, если заказчик обращается впервые
 * @param {Map} archive
 * @param {Object} account
 */
function addPosition (archive, account) {
  if (!archive.has(account.customer)) {
    archive.set(account.customer, {
      totalCredits: 0,
      comedyCount: 0,
      totalAmount: 0,
    });
  }
};


/**
 * Обновляет архив при повторном обращении
 * @param {Map} archive
 * @param {Object} account
 */
function updatePosition (archive, account) {
    archive.set(account.customer, {
      totalCredits: archive.get(account.customer).totalCredits + account.totalCredits,
      comedyCount: archive.get(account.customer).comedyCount + account.comedyCount,
      totalAmount : archive.get(account.customer).totalAmount + account.totalAmount,
    });
};



function statement(invoices) {
  let result = ``;
  for (let invoice of invoices) {
    /** объект счета по конкретному заказу */
    const account = {
      customer: invoice.customer,
      totalAmount: 0,
      comedyCount : 0,
      totalCredits: 0,
      totalComedies: 0,
    };

    addPosition(archive, account);

    // Устанавливает количество бонусов за все историю (необходимо для ведения общей статистики)
    if (archive.get(account.customer).comedyCount !== 0) {
      account.totalComedies = archive.get(account.customer).comedyCount;
    }
    // Заготовка для вывода в чеке
    result = `
      Счет для ${account.customer}
    `;

    for (let play of invoice.performance) {
      // Обнуляет локальный счетчик бонусов для отдельной пьесы
      let volumeCredits = 0;
      // Рассчитывает стоимость в зависимости от жанра
      switch (play.type) {
        case "tragedy":
          thisAmount = AMOUNT.TRAGEDY;
          if (play.audience > 30) {
            thisAmount += 1000 * (play.audience - 30);
          }
          break;
        case "comedy":
          thisAmount = AMOUNT.COMEDY;
          // Увеличивает счетчик для отправки данных в архив
          account.comedyCount += 1;
          // Увеличивает локальный счетчик для вывода в чеке
          account.totalComedies += 1;
          if (play.audience > 20) {
            thisAmount += 10000 + 500 * (play.audience - 20);
          }
          thisAmount += 300 * play.audience;
          break;
        default:
          throw new Error('неизвестный тип: ${play.type}');
      }

      // Добавляет бонусы
      volumeCredits += (play.audience > BONUS_GAP) ? play.audience - BONUS_GAP : 0;

      // Добавляет бонус за каждые 10 комедий
      if (account.totalComedies % 10 === 0 && account.totalComedies!==0) {
        volumeCredits += Math.floor(play.audience / 5);
      }

      // Добавляет бонусы в общие по счету
      account.totalCredits += volumeCredits;

      // Суммирует стоимость билета к общей по счету
      account.totalAmount += thisAmount/100;

      // Добавляет в чек блок по отдельной позиции
      result += `
        ${play.playId}: ${format(thisAmount / 100)}
        ${play.audience} мест
        За эту пьесу вы получаете ${volumeCredits} бонусов

      ********************************************
      `;
    }
    updatePosition(archive, account);

      result += `
        Счет за заказ: ${format(account.totalAmount)}
      ----------------------------------

        Комедий ВСЕГО: ${archive.get(account.customer).comedyCount}
        На вашем счету бонусов ВСЕГО: ${archive.get(account.customer).totalCredits}

      ===================================
        `
  }
  return result;
}

statement(invoices);