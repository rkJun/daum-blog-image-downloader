# Daum Blog Image Downloader

다음 블로그에 올린 포스팅중에 이미지 파일을 다운로드하는 스크래핑 모듈입니다.

## 선행 설치 조건

- [phantomjs](http://phantomjs.org/)
- [casperjs](http://casperjs.org/)


## 사용법

```
$ casperjs init.js
```

### 소스내 변경해야할 값 
- LOGIN_ID : 다음로그인 아이디   
- LOGIN_PWD : 다음로그인 비밀번호   
- BLOG_ID : 다음블로그 아이디   
- CATEGORY_ID : 대상 카테고리(비우면, 전체)

### BLOG_ID 취득방법

1. 본인 다음블로그에서 소스보기
(view-source:blog.daum.net/YOUR_BLOG_ADDRESS)
2. blogid=로 소스검색(&앞까지 5byte)

## LICENSE

[LICENSE](https://github.com/rkJun/daum-blog-image-downloader/blob/master/LICENSE)
