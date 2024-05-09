# KT bizmeka 회의실 예약 일정 크롤러

### 실행 및 빌드 명령어

- 실행 : node src/index.js

### 기술스택

- Node.js v16(centos7 환경 최적화)
- puppeteer

### 기능설명

- bizmeka의 일정 - 관리자 메뉴(회의실 관리) - 이용현황 조회 - 회의실 월간 이용 현황을 크롤링함.
- POST API 통해 meetingRoom DB에 저장. RoomWatcher 에서 GET API 통해 데이터 사용.
- console로 성공, 실패 시간 기록
- json으로 실패 시간 기록
- 주간 WORK_TIME 이내의 시간만 크롤링 작동.
- 로그인, 크롤링 실패 시 자동 재시작.

### Git Commit Convention

- Feat : 새로운 기능 추가
- Fix : 버그 수정
- Docs : 문서 수정
- Style : 스타일시트 수정
- Refactor : 코드 리펙토링
- Test : 테스트 코드, 리펙토링 테스트 코드 추가
- Chore : 빌드 업무 수정, 패키지 매니저 수정
- Update : 기능수정 또는 문구수정 등

**Convention Example**

    (Summary)
    Feat: 리스트 추가

    (Description)
    - map을 이용한 리스트 추가
