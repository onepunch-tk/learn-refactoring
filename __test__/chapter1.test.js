import expect from "expect";
import statement from "../chapters/1";
//datas
import { invoices, plays } from "../datas/chapter1";

test("test", () => {
  expect(1).toBe(1);
  console.log(statement(invoices, plays));
});
