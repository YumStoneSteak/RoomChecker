const puppeteer = require("puppeteer");
const fs = require("fs");
const fetch = require("node-fetch");
const {
  USERNAME,
  PASSWORD,
  INTERVAL_TIME,
  INTERVAL_TIME_DEV,
  POST_SCHEDULE_API_URL,
} = require("./constant");

(async () => {
  let browser;
  try {
    const browserSetting = async () => {
      // Puppeteer 브라우저 인스턴스 초기화
      browser = await puppeteer.launch({
        headless: false,
        userDataDir: "./data/myChromeProfile",
      });

      // 기존 탭을 가져오기
      const pages = await browser.pages();
      const page = pages[0];

      // 뷰포트 설정
      await page.setViewport({ width: 0, height: 0 });

      // 저장된 쿠키가 있으면 불러오기
      if (fs.existsSync("./data/cookies.json")) {
        const cookies = JSON.parse(
          fs.readFileSync("./data/cookies.json", "utf8")
        );
        await page.setCookie(...cookies);
      }

      return page;
    };

    const login = async () => {
      // 로그인 페이지로 이동
      await page.goto("https://ezsso.bizmeka.com/loginForm.do", {
        waitUntil: "networkidle0",
      });

      // 로그인 필드 확인 및 로그인
      const usernameField = await page.$("#username");
      const passwordField = await page.$("#password");

      // 로그인 필드가 있으면 로그인 과정 수행
      if (usernameField && passwordField) {
        console.log("로그인 시도");

        //id 자동완성 클리어
        await page.click("#username", { clickCount: 3 });
        await page.keyboard.press("Backspace");

        //로그인
        await page.type("#username", USERNAME);
        await page.type("#password", PASSWORD);
        await page.click("#btnSubmit");

        //3개월 비밀번호 미변경시 다음에 바꾸기
        //1초 동안 찾고 없으면 넘어감
        const nextBtn = await page
          .waitForSelector("#nextBtn", { timeout: 1000 })
          .catch(() => null);

        if (nextBtn) {
          await page.click("#nextBtn");
        }

        // 쿠키 저장
        const cookies = await page.cookies();
        fs.writeFileSync(
          "./data/cookies.json",
          JSON.stringify(cookies, null, 2)
        );

        await page.waitForSelector(
          'a[href="https://ezgroupware.bizmeka.com/groupware/planner/calendar.do"]'
        );
      }

      console.log("로그인 성공");
    };

    const goToDataPage = async () => {
      console.log("스케줄 페이지로 이동");
      // 일정 페이지로 이동
      await page.click(
        'a[href="https://ezgroupware.bizmeka.com/groupware/planner/calendar.do"]'
      );
      await page.waitForSelector(
        'a.sidebar-nav-menu[href="/groupware/facility/admin/conferenceRoomManage.do?"]'
      );

      // 회의실 관리 페이지로 이동
      await page.click(
        'a.sidebar-nav-menu[href="/groupware/facility/admin/conferenceRoomManage.do?"]'
      );
      await page.waitForSelector(
        "button.btn.btn-color5.br.btnUseCurrentStatus"
      );

      // 이용현황 조회 버튼 클릭
      await page.click("button.btn.btn-color5.br.btnUseCurrentStatus");
    };

    const getSchedule = async () => {
      // 페이지 내에서 테이블 데이터 추출
      const tableData = await page.evaluate(() => {
        const rows = document.querySelectorAll("table.table.table-striped tr");
        const year = document.querySelector("#searchDate").value.slice(0, 4);
        let currentDate = "";
        const results = [];

        rows.forEach((row) => {
          const columns = row.querySelectorAll("td");
          if (columns.length > 1 && columns[1].innerText.trim() !== "") {
            let data = Array.from(columns, (column) => column.innerText);

            // 현재 행에 날짜가 있으면 사용하고, 없으면 currentDate 사용
            if (!/^\d{2}\.\d{2}$/.test(data[0])) {
              data.unshift(currentDate);
            } else {
              currentDate = data[0];
            }

            results.push({
              meetingDt: year + "-" + currentDate.replace(".", "-"),
              roomNm: data[1],
              startTm: data[2].substring(0, 5),
              endTm: data[2].substring(8),
              title: data[3],
              registrant: data[4],
              regDt: data[5].replace(" ", "T").replace(/\./g, "-"),
              department: data[6],
            });
          }
        });

        return results;
      });

      const timestamp = new Date()
        .toLocaleString("sv-SE", {
          timeZone: "Asia/Seoul",
        })
        .replace(" ", "T");

      const data = {
        timestamp,
        data: tableData,
      };

      // JSON 파일로 저장
      fs.writeFileSync(
        "./data/scheduleData.json",
        JSON.stringify(data, null, 2)
      );

      const sendSchedule = async (url, data) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Post 실패, 서버 상태: ${response.status}`);
          }

          const result = await response.json();

          const successMsg = `[${++tryNum}] 저장 성공: ${timestamp}
    서버 응답: ${JSON.stringify(result)}`;

          console.log(successMsg);

          // Text 파일로 저장
          fs.appendFileSync("./data/scheduleSendLog.txt", successMsg + "\n");
        } catch (error) {
          console.error(
            "[",
            timestamp,
            "]",
            "Post 실패, 서버 응답:",
            error.message
          );
        }
      };

      sendSchedule(POST_SCHEDULE_API_URL, data);
    };

    // 영원히 주기적으로 테이블 데이터 추출
    const loopDataCrawl = async () => {
      console.log(
        "지속 스케줄 내보내기 시작. 새로고침 주기:",
        INTERVAL_TIME / 1000,
        "초"
      );
      while (true) {
        try {
          await page.waitForSelector(
            ".btn.btn-color7.br.pl7.ml5.btnExcelExport"
          );
          await getSchedule();
          await page.reload();
          await page.waitForNavigation({ waitUntil: "networkidle2" });
          await new Promise((resolve) => setTimeout(resolve, INTERVAL_TIME));
        } catch (error) {
          console.error("스케줄 내보내기 반복 중 오류 발생:", error);
          await browser.close();
          break;
        }
      }
    };

    //메인 실행부
    let tryNum = 0;
    const page = await browserSetting();
    await login();
    await goToDataPage();
    await loopDataCrawl();
  } catch (error) {
    console.error("스케줄 내보내기 실패: ", error);
    await browser.close();
  }
})();
