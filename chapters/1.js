/*
 * 프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면,
 * 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가한다.
 * 리팩터링을 실행하기 전에 제대로 된 테스트부터 마련한다. jest...*/

/*origin*/
// function statement(invoice, plays) {
//   let totalAmount = 0;
//   let volumeCredits = 0;
//   let result = `청구 내역 (고객명: ${invoice.customer})\n`;
//   const format = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//   }).format;
//
//   invoice.performance.forEach((perf) => {
//     let thisAmount = 0;
//     const play = plays[perf.playID];
//
//     switch (play.type) {
//       case "tragedy": //비극
//         thisAmount = 40000;
//         if (perf.audience > 30) {
//           thisAmount += 1000 * (perf.audience - 30);
//         }
//         break;
//       case "comedy": //희극
//         thisAmount = 30000;
//         if (perf.audience > 20) {
//           thisAmount += 10000 + 500 * (perf.audience - 20);
//         }
//         thisAmount += 300 * perf.audience;
//         break;
//       default:
//         throw new Error(`알 수 없는 장르: ${play.type}`);
//     }
//
//     //포인트 적립
//     volumeCredits += Math.max(perf.audience - 30, 0);
//     //희극 관객 5명마다 추가 포인트를 제공한다.
//     if ("comedy" === play.type) {
//       volumeCredits += Math.floor(perf.audience / 5);
//     }
//
//     //청구 내역을 출력한다.
//     result += `${play.name}: ${format(thisAmount / 100)} (${
//       perf.audience
//     }석)\n`;
//     totalAmount += thisAmount;
//   });
//
//   result += `총액: ${format(totalAmount / 100)}\n`;
//   result += `적립 포인트: ${volumeCredits}점\n`;
//   return result;
// }

/*refactoring*/
function statement(invoice, plays) {
  /*1-8 invoice 의 정보를 중간 데이터에 옮긴다.*/
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performance = invoice.performance.map(enrichPerformance);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  statementData.totalAmount = totalAmount(statementData);
  return renderPlainText(statementData);

  function enrichPerformance(aPerformance) {
    //스프레드 연산자. 객체 자체(aperformance)는 깊은 복사, 내부의 객체(playID, audience)는 얕은 복사
    //가변 데이터는 금방 상하기때문에, 최대한 불변으로 취급
    const result = { ...aPerformance };
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  /*1-3
   * play 변수 제거
   * aPerformance 의 경우 반복문이 돌면서 값이 변경되지만,
   * play 의 경우 aPerformance 에서 얻기 때문에 애초에 매개변수로 전달할 필요가 없다.
   * amountFor()에서 다시 계산하면 된다.
   * play 같은 임시 변수들은 로컬 범위에서 늘어남에 따라 추출 작업이 복잡해지기 때문에, 제거해준다.
   * 이에 따른 리팩터링 방식이 Replace Temp with Query(임시 변수를 질의 함수로 바꾸기) */
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  /*1-1
   * statement() 처럼 긴 함수를 리팩터링할 때는
   * 먼저 전체 동작을 각각의 부분으로 나눌 수 있는 지점을 찾는다.
   * switch 문 리팩터링 (Extract Function)
   * 함수를 추출할 때 유효범위를 벗어나는 변수 즉, 추출한 함수에서 곧바로 사용할 수 없는 변수가 있는지 확인
   * statement() 에서는 perf, play, thisAmount 가 유효 범위에서 벗어남
   * perf와 play는 값을 변경 시키지 않으므로 매개변수로 전달
   * thisAmount의 경우 값을 변경하므로 마지막에 변경된 thisAmount를 반환하도록 작성*/
  /*1-2
   * 변수의 역할을 쉽게 알 수 있도록 변수명 변경
   * performance 처럼 역할이 뚜렷하지 않을 때는 부정관사 (a/an)을 붙인다*/
  function amountFor(aPerformance) {
    // 1-1 변수를 초기화하는 코드
    // 1-2 thisAmount 를 좀 더 명확한 이름으로 변경
    let result = 0;

    switch (aPerformance.play.type) {
      case "tragedy": //비극
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy": //희극
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
    }
    //1-1 함수 안에서 값이 바뀌는 변수 반환.
    return result;
  }

  /*포인트 적립 로직 추출*/
  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    //희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === aPerformance.play.type) {
      result += Math.floor(aPerformance.audience / 5);
    }

    return result;
  }

  /*1-5
   * 반복문 쪼개기 Split Loop
   * 해당 예제에서는 지역 변수인 volumeCredits,totalAmount 를 제거하기 위해 사용*/
  /*1-6
   * 문장 슬라이드 Slide Statement
   * 관련 코드를 한곳에 모은다.*/
  /*1-7
   * 관련 코드들을 한곳에 모아두면 임시 변수를 질의 함수로 바꾸기(Replace Temp with Query)를 통해 함수 추출*/
  function totalVolumeCredits(data) {
    /*반복문 파이프라인으로 바꾸기.*/
    // let result = 0;
    // data.performance.forEach((perf) => {
    //   //포인트 적립
    //   result += perf.volumeCredits;
    // });
    // console.log(data.performance);
    // return result;
    return data.performance.reduce((total, p) => total + p.volumeCredits, 0);
  }
  function totalAmount(data) {
    /*반복문 파이프라인으로 바꾸기.*/
    // let result = 0;
    // data.performance.forEach((perf) => {
    //   /*1-4 임시 변수 thisAmount 변수 인라인하기 Inline Variable*/
    //   //Extract Function 호출
    //   result += perf.amount;
    // });
    //
    // return result;

    return data.performance.reduce((total, p) => total + p.amount, 0);
  }
}
/*1-8 단계 쪼개기 Split Phase*/
function renderPlainText(data) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  data.performance.forEach((perf) => {
    //청구 내역을 출력한다.
    result += `${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
  });
  //변수 인라인. 기존 지역 변수 제거.
  result += `총액: ${usd(data.totalAmount)}\n`;
  result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
  return result;
}
/*format 함수 추출*/
function usd(aNumber) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}

export default statement;
