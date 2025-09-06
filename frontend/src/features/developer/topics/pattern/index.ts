(function Square() {
  const number = 5;
  let ans = '';

  for (let i = 0; i < number; i++) {
    for (let j = 0; j < number; j++) {
      ans += '* ';
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function RightTriangle() {
  const number = 5;
  let ans = '';

  for (let i = 0; i < number; i++) {
    for (let j = 0; j < number; j++) {
      if (j <= i) {
        ans += '* ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function RightTriangleRevert() {
  const number = 5;
  let ans = '';
  let counter = number;

  for (let i = 0; i < number; i++) {
    for (let j = counter; j > 0; j--) {
      ans += '* ';
    }
    counter--;
    ans += '\n';
  }

  console.log(ans);
})();

(function RightTriangleRight() {
  const number = 5;
  let ans = '';

  for (let i = number; i > 0; i--) {
    for (let j = 1; j <= number; j++) {
      if (j < i) {
        ans += '  ';
      }
      if (j >= i) {
        ans += '* ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function RightTriangleRightInverted() {
  const number = 5;
  let ans = '';

  for (let i = 0; i < number; i++) {
    for (let j = 0; j < number; j++) {
      if (j >= i) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function CenteredPyramid() {
  const number = 5;
  let ans = '';
  let counter = number - 1;

  for (let i = 0; i < number; i++) {
    for (let j = 1; j <= number + i; j++) {
      if (j > counter) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
    counter--;
  }

  console.log(ans);
})();

(function CenteredPyramidInvert() {
  const number = 5;
  let ans = '';
  let counter = 0;

  for (let i = 1; i <= number; i++) {
    for (let j = 1; j <= 2 * number - i; j++) {
      if (j > counter) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
    counter++;
  }

  console.log(ans);
})();

(function HollowSquare() {
  const number = 5;
  let ans = '';

  for (let i = 1; i <= number; i++) {
    for (let j = 1; j <= number; j++) {
      if (i === 1 || i === number || j === 1 || j === number) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function X() {
  const number = 5;
  let ans = '';

  for (let i = 1; i <= 2 * number - 1; i++) {
    for (let j = 1; j <= 2 * number - 1; j++) {
      if (i === 1 || i === 2 * number - 1 || i === j || j + i === 2 * number) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function Cross() {
  const number = 5;
  let ans = '';

  for (let i = 1; i <= number; i++) {
    for (let j = 1; j <= number; j++) {
      if (j === Math.round(number / 2) || i === Math.round(number / 2)) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function X() {
  const number = 5;
  let ans = '';

  for (let i = 1; i <= 2 * number - 1; i++) {
    for (let j = 1; j <= 2 * number - 1; j++) {
      if (i === j || j + i === 2 * number) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function SandGlass() {
  const number = 5;
  let ans = '';
  let space = 0;

  for (let i = 1; i <= 2 * number - 1; i++) {
    for (let j = 1; j <= number; j++) {
      if (j > space) {
        ans += '* ';
      } else {
        ans += '  ';
      }
    }
    if (i < number) {
      space++;
    } else {
      space--;
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function HalfDiamond() {
  const number = 5;
  let ans = '';
  let space = 0;

  for (let i = 1; i <= 2 * number - 1; i++) {
    for (let j = 1; j <= number; j++) {
      if (j > space) {
        ans += '  ';
      } else {
        ans += '* ';
      }
    }
    if (i < number) {
      space++;
    } else {
      space--;
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function HallowPyramid() {
  const number = 5;
  let ans = '';
  const obj = {
    lastSum: 0,
    lastSumIndex: 0,
  };

  for (let i = 1; i <= number; i++) {
    for (let j = 1; j <= 2 * number - 2; j++) {
      if (i !== 1) {
        const sum = i + j;
        if (
          i + j === 2 * number - 3 ||
          (i === number && j !== 1) ||
          (obj['lastSum'] + 2 === sum && obj['lastSumIndex'] + 1 === j)
        ) {
          ans += '* ';
          if (j >= number) {
            obj['lastSum'] = sum;
            obj['lastSumIndex'] = j;
          }
        } else {
          ans += '  ';
        }
      }
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function Butterfly() {
  const number = 5;
  let ans = '';
  let minSpaceIndex = 2;
  let maxSpaceIndex = 2 * number - 3;

  for (let i = 1; i <= 2 * number - 3; i++) {
    for (let j = 1; j <= 2 * number - 2; j++) {
      if (j >= minSpaceIndex && j <= maxSpaceIndex) {
        ans += '  ';
      } else {
        ans += '* ';
      }
    }
    ans += '\n';
    if (i < number - 1) {
      minSpaceIndex++;
      maxSpaceIndex--;
    } else {
      minSpaceIndex--;
      maxSpaceIndex++;
    }
  }

  console.log(ans);
})();

(function Diamond() {
  const number = 5;
  let ans = '';
  let space = Math.round(number / 2) - 1;
  let JValue = Math.round(number / 2);

  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= JValue; j++) {
      if (j <= space) {
        ans += '  ';
      } else {
        ans += '* ';
      }
    }
    if (i < Math.round(number / 2)) {
      JValue++;
      space--;
    } else {
      JValue--;
      space++;
    }
    ans += '\n';
  }

  console.log(ans);
})();

(function Concurrancy() {
  const string = 'aabbccc';
  const ans: Record<string, number> = {};
  for (let i = 0; i < string.length; i++) {
    if (string[i] in ans) {
      ans[string[i]] = ans[string[i]] + 1;
    } else {
      ans[string[i]] = 1;
    }
  }
  console.log(ans);
})();
