/*
 * 프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면,
 * 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가한다.
 * 리팩터링을 실행하기 전에 제대로 된 테스트부터 마련한다. jest...*/

/*origin*/
function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;
  invoice.performance.forEach((perf) => {
    const play = plays[perf.playID];

    //origin
    //let thisAmount = 0;

    // switch (play.type) {
    //   case "tragedy": //비극
    //     thisAmount = 40000;
    //     if (perf.audience > 30) {
    //       thisAmount += 1000 * (perf.audience - 30);
    //     }
    //     break;
    //   case "comedy": //희극
    //     thisAmount = 30000;
    //     if (perf.audience > 20) {
    //       thisAmount += 10000 + 500 * (perf.audience - 20);
    //     }
    //     thisAmount += 300 * perf.audience;
    //     break;
    //   default:
    //     throw new Error(`알 수 없는 장르: ${play.type}`);
    // }
    //Extract Function 호출
    let thisAmount = amountFor(perf, play);

    //포인트 적립
    volumeCredits += Math.max(perf.audience - 30, 0);
    //희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === play.type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    //청구 내역을 출력한다.
    result += `${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  });

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}

/*첫 번째
 * statement() 처럼 긴 함수를 리팩터링할 때는
 * 먼저 전체 동작을 각각의 부분으로 나눌 수 있는 지점을 찾는다.
 * switch 문 리팩터링 (Extract Function)
 * 함수를 추출할 때 유효범위를 벗어나는 변수 즉, 추출한 함수에서 곧바로 사용할 수 없는 변수가 있는지 확인
 * statement() 에서는 perf, play, thisAmount 가 유효 범위에서 벗어남
 * perf와 play는 값을 변경 시키지 않으므로 매개변수로 전달
 * thisAmount의 경우 값을 변경하므로 마지막에 변경된 thisAmount를 반환하도록 작성*/

function amountFor(perf, play) {
  let thisAmount = 0; //변수를 초기화하는 코드

  switch (play.type) {
    case "tragedy": //비극
      thisAmount = 40000;
      if (perf.audience > 30) {
        thisAmount += 1000 * (perf.audience - 30);
      }
      break;
    case "comedy": //희극
      thisAmount = 30000;
      if (perf.audience > 20) {
        thisAmount += 10000 + 500 * (perf.audience - 20);
      }
      thisAmount += 300 * perf.audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${play.type}`);
  }

  return thisAmount; //함수 안에서 값이 바뀌는 변수 반환.
}

export default statement;
