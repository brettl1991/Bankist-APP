'use strict';

//BANKIST APP

//Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

//Elements
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

//instead of working with global variables start passing the data into a function
//first we need to uncomment in css the main app opacity to see the container
const displayMovements = function (movements) {
  //Empty the container
  containerMovements.innerHTML = '';
  //Adding the new elements to the page
  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html); //method accept 2 strings:1st the position in which we want to attach the HTML, 2nd is  a string containing the HTML that we want to insert, just we wrote above in const html
  });
};
// displayMovements(account1.movements);
// console.log(containerMovements.innerHTML); //with this we can see the whole html elements that we passed in above in the console: all the 8 movements from account1

//Compute usernames for each account

const createUserNames = function (accounts) {
  accounts.forEach(function (acc) {
    //we just cerated a side effect without returning anything, looped over accounts array and each iteration we manipulated the current account obj and added a username to it based on the account owner plus all of the transformation:
    acc.username = acc.owner
      .toLowerCase()
      .split(' ') //['steven', 'thomas', 'williams']
      .map(name => name[0])
      .join(''); //stw
  });
};

//'Steven Thomas Williams'; // stw going to be the new username that we will create above:
// console.log(createUserNames('Steven Thomas Williams')); //stw
createUserNames(accounts);
console.log(accounts); //from console we can see results

//Calculate the balance of the movements and print that to the application userface
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => (acc += mov), 0);
  //adding to the balance value html element:
  labelBalance.textContent = `${account.balance} €`;
};

// calcDisplayBalance(account1.movements);

//calc income, outcome and interest summary
const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    //if the intrest below one, not going to be added to the intrest sum so:
    .filter((mov, i, arr) => {
      // console.log(arr);
      return mov >= 1;
    })
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = `${interest}€`;
};

// calcDisplaySummary(account1.movements);

//Implementing Login
const updateUI = function (account) {
  //Display movements
  displayMovements(account.movements);
  //Display balance
  calcDisplayBalance(account);
  //Display summary
  calcDisplaySummary(account);
};

//Event Handler
let currentAccount;
btnLogin.addEventListener('click', function (e) {
  //Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  //check if pin is correct
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //?. optional chaining so instead of error we get back undefined if the login username not correct
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Update UI
    updateUI(currentAccount);
  }
});

//Implementing transfers
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); //because this is a form and without it it will reload the page
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  console.log(amount, receiverAcc);
  //Clear input fields
  inputTransferAmount.value = inputTransferTo.value = '';
  //check if the transfered money is > 0 and the curr acc balance needs to be > or = to the transferred amount
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Update UI
    updateUI(currentAccount);
  }
});
