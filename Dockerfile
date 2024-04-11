# Base Image 설정
FROM centos:7

# 필요한 소프트웨어 및 의존성 설치
RUN yum -y update && \
    yum -y install curl && \
    curl -sL https://rpm.nodesource.com/setup_17.x | bash - && \
    yum -y install nodejs

# Puppeteer 실행에 필요한 추가 라이브러리 설치
RUN yum -y install atk at-spi2-atk gtk3 libX11 libX11-xcb libxcb libXdamage libXtst libcups nss alsa-lib

# 애플리케이션 디렉토리 설정
WORKDIR /usr/src/app

# 애플리케이션의 package.json 및 package-lock.json 복사
COPY package*.json ./

# 애플리케이션 의존성 설치
RUN npm install

# 애플리케이션 코드 복사
COPY . .

# 애플리케이션에서 사용하는 포트 노출
EXPOSE 5001

# 애플리케이션 실행
CMD ["node", "src/index.js"]
