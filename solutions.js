// Project Ideas and JavaScript Practice
// Run with: node solutions.js

const assert = require("node:assert/strict");

// 1. groupBy
// Tested with the assignment's users and a second example using roles.
function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupName = String(item[key]);

    if (!Object.prototype.hasOwnProperty.call(groups, groupName)) {
      groups[groupName] = [];
    }

    groups[groupName].push(item);
    return groups;
  }, {});
}

const users = [
  { name: "Ada", city: "Aba" },
  { name: "Obi", city: "Enugu" },
  { name: "Ngozi", city: "Aba" },
];

assert.deepEqual(groupBy(users, "city"), {
  Aba: [
    { name: "Ada", city: "Aba" },
    { name: "Ngozi", city: "Aba" },
  ],
  Enugu: [{ name: "Obi", city: "Enugu" }],
});

assert.deepEqual(
  groupBy([{ name: "Ada", role: "student" }, { name: "Obi", role: "teacher" }], "role"),
  {
    student: [{ name: "Ada", role: "student" }],
    teacher: [{ name: "Obi", role: "teacher" }],
  }
);

// 2. flatten
// Tested with the assignment's nested array and an array containing empty arrays.
function flatten(array) {
  const result = [];

  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }

  return result;
}

assert.deepEqual(flatten([1, [2, [3, [4]]], 5]), [1, 2, 3, 4, 5]);
assert.deepEqual(flatten([[], [1, [2, []]], 3]), [1, 2, 3]);

// 3. groupAnagrams
// Tested with the assignment's words and another group of anagrams.
function groupAnagrams(words) {
  const groups = new Map();

  for (const word of words) {
    const key = word.toLowerCase().split("").sort().join("");

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(word);
  }

  return Array.from(groups.values());
}

assert.deepEqual(
  groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]),
  [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
);

assert.deepEqual(
  groupAnagrams(["listen", "silent", "enlist", "hello"]),
  [["listen", "silent", "enlist"], ["hello"]]
);

// 4. once
// Tested by calling the returned function three times and checking the call count.
function once(fn) {
  let hasRun = false;
  let savedResult;

  return function (...args) {
    if (!hasRun) {
      savedResult = fn.apply(this, args);
      hasRun = true;
    }

    return savedResult;
  };
}

let callCount = 0;
const init = once(() => {
  callCount += 1;
  return 42;
});

assert.equal(init(), 42);
assert.equal(init(), 42);
assert.equal(init(), 42);
assert.equal(callCount, 1);

// A closure makes this work. The returned function remembers hasRun and savedResult
// even after once() has finished running.

// 5. debounce
// Tested by calling the function quickly several times and checking the last value.
function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function testDebounce() {
  const values = [];
  const record = debounce((value) => values.push(value), 30);

  record("first");
  record("second");
  record("last");

  await wait(60);
  assert.deepEqual(values, ["last"]);

  record("another call");
  await wait(60);
  assert.deepEqual(values, ["last", "another call"]);
}

// A real use for debounce is a search box. It can wait until the user stops typing
// before starting a search, instead of searching after every letter.

// 6. Predict the output
// Tested by recording the order of synchronous, promise, and timer callbacks.
async function testOutputOrder() {
  const output = [];

  output.push("A");
  setTimeout(() => output.push("B"), 0);
  Promise.resolve().then(() => output.push("C"));
  output.push("D");

  await wait(10);
  assert.deepEqual(output, ["A", "D", "C", "B"]);
}

// Output:
// A
// D
// C
// B
// A and D run first because they are synchronous. The promise callback runs next,
// before the setTimeout callback, even though its delay is zero.

// 7. retry
// Tested with a function that fails twice then succeeds, and a function that always fails.
async function retry(fn, times) {
  if (!Number.isInteger(times) || times < 1) {
    throw new RangeError("times must be a positive integer");
  }

  let lastError;

  for (let attempt = 1; attempt <= times; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function testRetry() {
  let attempts = 0;

  const fetchData = async () => {
    attempts += 1;

    if (attempts < 3) {
      throw new Error("Temporary error");
    }

    return "Data received";
  };

  assert.equal(await retry(fetchData, 3), "Data received");
  assert.equal(attempts, 3);

  const expectedError = new Error("Request failed");
  let failedAttempts = 0;

  await assert.rejects(
    retry(async () => {
      failedAttempts += 1;
      throw expectedError;
    }, 2),
    (error) => error === expectedError
  );
  assert.equal(failedAttempts, 2);
}

// 8. Sort by age and then name
// Tested with the assignment's people and checked that the original array is unchanged.
function sortPeople(people) {
  return [...people].sort((personA, personB) => {
    if (personA.age !== personB.age) {
      return personB.age - personA.age;
    }

    return personA.name.localeCompare(personB.name);
  });
}

const people = [
  { name: "Chika", age: 25 },
  { name: "Ade", age: 30 },
  { name: "Bola", age: 25 },
];

assert.deepEqual(sortPeople(people), [
  { name: "Ade", age: 30 },
  { name: "Bola", age: 25 },
  { name: "Chika", age: 25 },
]);

assert.deepEqual(people, [
  { name: "Chika", age: 25 },
  { name: "Ade", age: 30 },
  { name: "Bola", age: 25 },
]);

assert.deepEqual(
  sortPeople([
    { name: "Zainab", age: 19 },
    { name: "Amaka", age: 19 },
    { name: "Tunde", age: 40 },
  ]),
  [
    { name: "Tunde", age: 40 },
    { name: "Amaka", age: 19 },
    { name: "Zainab", age: 19 },
  ]
);

async function runTests() {
  await testDebounce();
  await testOutputOrder();
  await testRetry();
  console.log("All tests passed.");
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
