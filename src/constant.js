//성공 스케줄 json으로 기록
const LOG_MODE = false;

//bizmeka 계정
const USERNAME = "dejay1105@dejay.co.kr";
const PASSWORD = "emwpdl(())1";

//크롤링 주기
const INTERVAL_TIME = 180;
const INTERVAL_TIME_DEV = 10;

//API
const POST_SCHEDULE_API_URL = "http://192.168.1.42:8090/meetingRoom/upload";
//const GET_SCHEDULE_API_URL = "http://192.168.1.42:8090/meetingRoom/get";

//bizmeka 회의실명 하드코딩
const ROOMNAMES = ["2층 대회의실", "3층 중회의실", "3층 소회의실"];

//근무시간. 이외 시간에 크롤링 정지
const WORK_TIME = {
  START: 7,
  END: 20,
};

module.exports = {
  USERNAME,
  PASSWORD,
  INTERVAL_TIME,
  INTERVAL_TIME_DEV,
  POST_SCHEDULE_API_URL,
  ROOMNAMES,
  WORK_TIME,
};
