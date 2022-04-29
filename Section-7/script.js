'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); //we want to round any value down and floor does type coerson

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
////numbers always stored in binary format, represented internally as 64 bits
console.log(23 === 23.0);

//Base 10         0 to 9
//Binary 2        0 to 1
console.log(0.1 + 0.2); //0.30000000000000004
console.log(0.1 + 0.2 === 0.3); //should be true but false because of decimals
console.log(Number('23')); //23
//or with plus operator which will do type conversion
console.log(+'23'); //23

//Parsing(felbont) functions, these are global functions
console.log(Number.parseInt('30px', 10)); //30, needs to start with a number, as js try to figure out the number from a string
console.log(Number.parseInt('e23')); //Nan

// parseInt accepts a second parameter, called radix, which is the base of the numeral system, that we are using by first above we are using number 10, so 0 to 9, but if we are working with binary we write 2 as a 2nd parameter and the result will be different

//when need to read a number out of the string
console.log(Number.parseFloat('2.5rem')); //2.5
console.log(Number.parseInt('2.5rem')); //2

//check if a value is a not a number
console.log(Number.isNaN(20)); //false
console.log(Number.isNaN('20')); //false
console.log(Number.isNaN(+'20X')); //true
console.log(Number.isNaN(23 / 0)); //in mathematics this not possible, false

//best way to check if a value is a number
console.log(Number.isFinite(20)); //true, isFinite() function determines whether the passed value is a finite (veges)number
console.log(Number.isFinite('20')); //false
console.log(Number.isFinite(+'20X')); //false
console.log(Number.isFinite(20 / 0)); //false

console.log(Number.isInteger(23)); //true
console.log(Number.isInteger(23.0)); //true
console.log(Number.isInteger(23 / 0)); //false

//Math and rounding
console.log(Math.sqrt(25)); //5,  returns the square root of a number
console.log(25 ** (1 / 2)); //5

console.log(Math.max(5, 18, '23', 11, 2)); //23, max value get return to us, does type coersion
console.log(Math.max(5, 18, '23X', 11, 2)); //NaN
console.log(Math.min(5, 18, 23, 11, 2)); //2

//calc radius of a circle
console.log(Math.PI); //3.141592653589793
//circle radius 10px
console.log(Math.PI * Number.parseFloat('10px') ** 2); //314.1592653589793

console.log(Math.trunc(Math.random() * 6) + 1);

//gives us a number between 0 and 1 => than we multiply with max -min than we get a number between 0 and max - min => min to max-min + min
const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
//so random number between 10 and 20
console.log(randomInt(10, 20));

//Rounding integers, does type coerson
console.log(Math.trunc(23.3)); //23
console.log(Math.round(23.9)); //24, as round always to the nearest integer
console.log(Math.ceil(23.3)); //24 , round up always
console.log(Math.ceil(23.9)); //24
console.log(Math.floor(23.3)); //23, round down always, cut off the decimal part for positive numbers just
console.log(Math.floor(23.9)); //23
console.log(Math.trunc(-23.3)); //-23
console.log(Math.floor(-23.3)); //-24

//Rounding decimals
console.log((2.7).toFixed(0)); //3, and toFixed always returns back a string
console.log((2.7).toFixed(3)); //2.700
console.log((2.345).toFixed(2)); //2.35
//if we want to convert them to a number add + sign in front of them
console.log(+(2.7).toFixed(3)); //2.700

//ROUND THE REQUESTED LOAN AMOUNT, which inside loan eventhandler above
//USE TOFIXED TO MAKE OUR NUMBERS NICER, SHOULD LOOK LIKE ALL THE SAME WITH DECIMALS, above by displaymovements, displaybalance and displaysummary when we need to use

//REMINDER OPERATOR
//simple returns a reminder of a devision, the operator is the % sign
console.log(5 % 2); //1 because 5/2 = 2 and remain 1
console.log(8 % 3); //2
console.log(6 % 2); //0

//check if any number devisible by any number and if it is 0 than the first number devisible
const isEven = n => n % 2 === 0;
console.log(isEven(8)); //true
console.log(isEven(23)); //false
console.log(isEven(514)); //true

//select all of the rows in our mvements and convert it to a real array with spread and we want to colour every 2nd row of the movements
labelBalance.addEventListener('click', function () {
  // console.log('Hello', document.querySelectorAll('.movements__row'));
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    //0, 2, 4, 6 and so on
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';

    //paint every 3rd row to an other color so 0, 3, 6 and so on
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

//THE BIGINT: SPECIAL TYPE OF INTIGERS
//the biggest number js can deal:
console.log(Number.MAX_SAFE_INTEGER); //9007199254740991

//sometimes we need to deal with large numbers
//this n transform a regular number into a bigint number
console.log(6328248273927365136789087654567890n); //6328248273927365136789087654567890n
//or we can use the bigint function
console.log(BigInt(63282482739)); //63282482739n

console.log(10000n + 10000n); //20000n
console.log(234567898765432345678987654n * 3456789n); //810851732205460112787322053483006n
// console.log(Math.sqrt(16n));//will throw an error

//not posiible to mix bigint with regular numbers
const huge = 234567890987654456789n;
const num = 23;
// console.log(huge * num); //we get error, so we need to convert 23 to bigint
console.log(huge * BigInt(num)); //5395061492716052506147n

//there are 2 exceptions: the comparison and + operator when working with strings
console.log(20n > 15); //true
console.log(20n === 20); //this operator does not do type coerson so gonna be false
console.log(typeof 20n); //bigint
//but if we use the regular equality (loose) opeartor than js will do type coerson
console.log(20n == '20'); //true

//other exception: string concatinations
console.log(huge + 'is really Big'); //234567890987654456789is really Big - this case the number (bigint) been converted into strings

//Devisions
console.log(10n / 3n); //will return the closest bigint 3n
console.log(11n / 3n); //3n
console.log(12n / 3n); //4n

//CREATING DATES

//4 ways to creating them, they will all use new Date () constraction function
//1; use the new Date () constraction function
const now = new Date();
console.log(now); //Fri Apr 29 2022 15:39:40 GMT+0100 (British Summer Time)

//2;The new Date(datestring) constructor creates a date object from a date string. not good isea as can be unreliable but if the string has been created by js than it is safe to use
console.log(new Date('Apr 29 2022 15:39:40'));

//example for safety in account1 object we have movement dates: parse (felbont) from movementsdate strings
console.log(new Date(account1.movementsDates[0])); //Mon Nov 18 2019 21:31:17 GMT+0000 (Greenwich Mean Time)

//we can also pass in year, month, hour, minute, second into this construction
console.log(new Date(2037, 10, 19, 15, 23, 5)); //Thu Nov 19 2337 15:23:05 GMT+0000 (Greenwich Mean Time)
//also autocorrect to the next date the dates if we put for nov 31 but we know november has just 30 days
console.log(new Date(2037, 10, 31)); //Tue Dec 01 2037 00:00:00 GMT+0000 (Greenwich Mean Time)

//we can pass the amount of milliseconds past since the beginning of the unit time, can be useful
console.log(new Date(0)); //Thu Jan 01 1970 01:00:00 GMT+0100 (Greenwich Mean Time)

//3 days after this above, this is how we convert from days to milliseconds
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //Sun Jan 04 1970 01:00:00 GMT+0100 (Greenwich Mean Time)

//working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future); //Thu Nov 19 2037 15:23:00 GMT+0000 (Greenwich Mean Time)
console.log(future.getFullYear()); //2037
console.log(future.getMonth()); //10
console.log(future.getDate()); //19 day of the month
console.log(future.getDay()); //4 day of the week
console.log(future.getHours()); //15
console.log(future.getMinutes()); //23
console.log(future.getSeconds()); //0
//ISO string, follows some international standard
console.log(future.toISOString()); //2037-11-19T15:23:00.000Z
//timestamp for the date: the milliseconds since has past the january 1st since 1970
console.log(future.getTime()); //2142256980000 and we can use this to cerate the date

console.log(new Date(2142256980000)); //Thu Nov 19 2037 15:23:00 GMT+0000 (Greenwich Mean Time)

//current time stamp
console.log(Date.now()); //1651245139752

//also the set version for all of these methods
future.setFullYear(2040);
console.log(future); //Mon Nov 19 2040 15:23:00 GMT+0000 (Greenwich Mean Time)
