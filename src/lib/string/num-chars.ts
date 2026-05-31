export function numChars(s: string) {
  return [...s].length;
}

if (import.meta.vitest) {
  const cases = [
    { s: "", num: 0 },
    { s: "abc", num: 3 },
    { s: "リポD", num: 3 },
    { s: "𠮷野屋", num: 3 }, // サロゲートペアを含む
    { s: "👨‍👩‍👧‍👦", num: 7 }, // 4文字を3つのZWJにより結合したもの
    { s: "a👨‍👩‍👧‍👦c", num: 9 },
  ];

  test.each(cases)("%o", ({ s, num }) => {
    expect(numChars(s)).toBe(num);
  });
}
