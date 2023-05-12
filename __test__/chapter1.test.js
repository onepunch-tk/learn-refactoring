import expect from "expect";
import statement from "../chapters/1";
import { invoices, plays } from "../datas/chapter1";
//datas

test("bill printing", () => {
  expect(statement(invoices, plays)).toBe(
    "청구 내역 (고객명: BigCo)\n" +
      "Hamlet: $650.00 (55석)\n" +
      "As You Like It: $580.00 (35석)\n" +
      "Othello: $500.00 (40석)\n" +
      "총액: $1,730.00\n" +
      "적립 포인트: 47점\n"
  );
  console.log(statement(invoices, plays));
});
