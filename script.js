"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2021-01-12T10:51:36.790Z",
    "2021-02-11T23:36:17.929Z",
    "2021-02-27T17:01:17.194Z",
    "2021-03-08T14:11:59.604Z",
    "2021-04-01T10:17:24.185Z",
    "2021-06-23T07:42:02.383Z",
    "2021-06-28T09:15:04.904Z",
    "2021-07-13T21:31:17.178Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2021-01-12T10:51:36.790Z",
    "2021-02-11T23:36:17.929Z",
    "2021-02-27T17:01:17.194Z",
    "2021-03-08T14:11:59.604Z",
    "2021-04-01T10:17:24.185Z",
    "2021-06-23T07:42:02.383Z",
    "2021-06-28T09:15:04.904Z",
    "2021-07-13T21:31:17.178Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
};

const calcDayPassed = (date) => {
  return Math.round(
    Math.abs((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  );
};

const formatMovementsDate = (date, locale) => {
  const dayPassed = calcDayPassed(date);

  if (dayPassed === 0) return "Today";
  if (dayPassed === 1) return "Yesterday";
  if (dayPassed <= 7) return `${dayPassed} days ago`;

  const d = new Date(date);
  const intlDate = new Intl.DateTimeFormat(locale).format(d);

  return intlDate;
};

const formatNumber = (acc, number) => {
  return new Intl.NumberFormat(acc.locale, {
    style: "currency",
    currency: acc.currency,
  }).format(number.toFixed(2));
};

const startLogoutTimer = () => {
  let time = 300;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;
    time--;

    if (time === 0) {
      clearInterval(logoutTimer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
  };

  tick();
  const logoutTimer = setInterval(tick, 1000);

  return logoutTimer;
};

const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((mov, index) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type.toUpperCase()}</div>
      <div class="movements__date">${formatMovementsDate(
        acc.movementsDates[index],
        acc.locale
      )}</div>
      <div class="movements__value">${new Intl.NumberFormat(acc.locale, {
        style: "currency",
        currency: acc.currency,
      }).format(mov.toFixed(2))}</div>
    </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = formatNumber(acc, acc.balance);
};

const calcDisplaySummary = (acc) => {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const outcomes = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => mov * (acc.interestRate / 100))
    .filter((int) => int >= 1)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formatNumber(acc, incomes);
  labelSumOut.textContent = formatNumber(acc, Math.abs(outcomes));
  labelSumInterest.textContent = formatNumber(acc, interest);
};

const updateUI = (acc) => {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const createLogin = (accounts) => {
  accounts.forEach(
    (account) =>
      (account.userName = account.owner
        .toLowerCase()
        .split(" ")
        .map((n) => n[0])
        .join(""))
  );
};

createLogin(accounts);

let currentAccount, logoutTimer;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) =>
      acc.userName === inputLoginUsername.value &&
      acc.pin === +inputLoginPin.value
  );
  containerApp.style.opacity = currentAccount ? "1" : "0";
  if (currentAccount)
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

  const now = new Date();
  const intlDate = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);
  labelDate.textContent = `${intlDate}`;

  inputLoginUsername.value = inputLoginPin.value = "";

  inputLoginPin.blur();

  if(logoutTimer) clearInterval(logoutTimer)
  logoutTimer = startLogoutTimer();

  updateUI(currentAccount);
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.userName === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiverAcc?.userName !== currentAccount.userNames
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputLoanAmount.value;

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date());
      updateUI(currentAccount);
    }, 3000);

    inputLoanAmount.value = "";
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  const userName = inputCloseUsername.value;
  const pin = +inputClosePin.value;

  if (userName === currentAccount.userName && pin === currentAccount.pin) {
    const index = accounts.findIndex((acc) => acc.userName === userName);
    accounts.splice(index, 1);

    inputCloseUsername.value = inputClosePin.value = "";

    containerApp.style.opacity = "0";
  }

  // accounts.splice(accounts.indexOf(currentAccount))
});

let sorted = false;

btnSort.addEventListener("click", function () {
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);
