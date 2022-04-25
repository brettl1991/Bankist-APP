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

//we will sorting the movements as well in this function, and adding a sort parameter to the func and by default set it to false
const displayMovements = function (movements, sort = false) {
  //Empty the container
  containerMovements.innerHTML = '';
  //create new var where we define conditionally to be able to sort
  //so if sort is true we want to sort the movements, but not the original underlaying data just a current one, so we are creating a copy with a slice method
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  //Adding the new elements to the page
  movs.forEach(function (mov, i) {
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

//Request a loan from a bank, only will get if the movement >= than 10% of the amount
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //add positive movement to the account
    currentAccount.movements.push(amount);

    //Update UI
    updateUI(currentAccount);
  }

  //clear input field
  inputLoanAmount.value = '';
});

//Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23) similar like findIndex but with indexOf you can only search for a value that in the array, butwith findIndex we can create a complex condition, and can be anything that returns true or false, so both returns an index number

    //Delete account
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

//sort eventhandler
// but when we click again not going back to normal, nothing happening, to solve this: using a state variable that monitor if we are sorting the array or not

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted; //that is how we change from true to false to false to true and backwards
});

//if we need to get elements from the ui as an array, we assume here we dont have movements array
//we want to select the current movements so we need to add an eventlistener which we can add to any object, does not have to be just a button
//like when we click on balance label
labelBalance.addEventListener('click', function () {
  const moveUI = Array.from(
    document.querySelectorAll('.movements__value'), //movements__value this the place in html where the value stored, so we are selecting all of the elements that has this class, this is an array like structure, so not an array but we can easily convert it with Array.from()
    el => Number(el.textContent.replace('€', '')) //if we want to get back just the number values without EUR sign, we just pass a mapping function as a 2nd argument in the Array.from() function; mapping function that transforms the initial array to an array exactly that we wanted
  );
  // console.log(moveUI); //so we are getting back the current 8 movemments
  //if we want to get back just the number values without EUR sign, we just pass a mapping function as a 2nd argument in the Array.from() function
  console.log(moveUI); //['1300', '70', '-130', '-650', '3000', '-400', '450', '200']
  //another way of converting to an array
  const moveUI2 = [...document.querySelectorAll('.movements__value')]; //but we need to do the mapping in this situation separately
});

// Calculate how much has been deposited to the bank
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);
console.log(bankDepositSum); //25180

//Count how many deposit in the bank with at least $1000
// const numDeposit1000 = accounts.flatMap(acc => acc.movements).filter(mov => mov >= 1000).length;;
// console.log(numDeposit1000)//6

//an other way using reduce
const numDeposit1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
console.log(numDeposit1000);

//Prefixed ++ operator
let a = 10;
console.log(a++); //10  why is that? Because the ++ operator does increment the value but still returns the previous value
console.log(a); //11
//but if we write the ++ before than it is working
console.log(++a);
