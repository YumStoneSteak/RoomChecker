// CommonJS 스타일
const USERNAME = "ldh2163";
const PASSWORD = "qqwweerr11";
const INTERVAL_TIME = 180;
const INTERVAL_TIME_DEV = 10;
const POST_SCHEDULE_API_URL = "http://192.168.1.146:8090/meetingRoom/upload";
const GET_SCHEDULE_API_URL = "http://192.168.1.146:8090/meetingRoom/get";
const ROOMNAMES = ["2층 대회의실", "3층 중회의실", "3층 소회의실"];

module.exports = {
  USERNAME,
  PASSWORD,
  INTERVAL_TIME,
  INTERVAL_TIME_DEV,
  POST_SCHEDULE_API_URL,
  ROOMNAMES,
};
