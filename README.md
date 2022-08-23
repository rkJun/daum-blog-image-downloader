# Daum Blog Image Downloader V2

다음 블로그에 올린 포스팅중에 이미지 파일을 다운로드하는 스크래핑 모듈입니다.

다음 블로그가 2022년 9월말 서비스를 종료함에 따라, 부모님 블로그 사진 백업을 위해 급조했습니다.

2015년에 casperjs 로 만든 V1 소스를, puppeteer 소스로 새롭게 V2 로 만들었습니다.

init.js 는 구 소스 (2022년 현재 미동작) 이고, index.ts 가 현재 소스 (2022년 8월 동작확인완료)입니다.

## 사용법

```
$ npm run dev
```

```
# 처리 중 오류 발생시 확인을 위해 다음과 같이 로그로 남길 것을 권합니다.
$ npm run dev > log.txt

# 로그 중에는 다음과 같은 keyword 정도만 잡아서 tail 해도 좋습니다.
tail -f log.txt | grep -e pageNo -e title -e category -e Count -e target
```


### 소스내 변경해야할 값 
- LOGIN_ID : 다음로그인 아이디   
- LOGIN_PWD : 다음로그인 비밀번호   
- BLOG_ID : 다음블로그 아이디  (주소값 https://blog.daum.net/ 다음에 들어갈 id값)

### 동작 설명

1. 실행시 다음로그인으로 로그인을 합니다 (카카오 통합로그인은 대응하지 않음) 
2. 블로그로 이동하여 포스팅에 포함된 이미지를 저장합니다. (download 폴더 > 카테고리 이름 > 글 제목 이름으로 폴더 생성)
3. 글 제목에 / (슬러시) 존재시 - (하이픈) 으로 대체합니다.
4. 이미지 파일 이름은 data-alt 속성값을 이용하고, 없을 경우 이미지 주소값을 사용합니다.
5. 이미지 파일 이름 중복시 다른 이름으로 처리하지 않고 덮어씌우기 합니다.
6. 소스상에서는 pageNo 81 이상부터 img 태그로 긁어오도록 되어 있는데 과거 (2008년 무렵) 시점에서 태그구조가 달라지는 분기점
으로 본인 블로그에 맞춰 수정할 필요가 있음. (2008년 이전 데이터가 아니라면 사용하지 않을 코드로 추정)
## LICENSE

[LICENSE](https://github.com/rkJun/daum-blog-image-downloader/blob/master/LICENSE)
