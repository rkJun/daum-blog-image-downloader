/**
* Daum Blog Image Downloader
*
* Author : rkjun
* Created Date : 2015-05-09
**/
var LOGIN_ID = "다음_로그인_아이디";
var LOGIN_PWD = "다음_로그인_비밀번호";
var BLOG_ID = "YOUR_BLOD_ID";        // your BLOG ID
var CATEGORY_ID = "CATEGORYID";   // your Category ID

var fs = require('fs');

var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug',
  viewportSize: {
    width: 1024,
    height: 768
  },
  pageSettings: {
    webSecurityEnabled: false
  }
});

var TARGET_URL = "http://blog.daum.net/_blog/ArticleCateList.do";
var DISP_KIND = "B2201";

var loadUrl = TARGET_URL + "?";
loadUrl += "blogid=" + BLOG_ID + "&";
loadUrl += "CATEGORYID=" + CATEGORY_ID + "&";
loadUrl += "dispkind=" + DISP_KIND + "&";
loadUrl += "blogid=" + BLOG_ID;

var loginUrl = "http://www.daum.net";

var goPage = function (num) {
  // mojo function for lint pass
  console.log("goPage" + num);
};

var pageNo = 1;
var totalcnt;

var repeatModule = function () {

  // this.echo("--- Starting repeatModule ---");

  // 글 제목
  var mainTitle = this.evaluate(function () {
    var mainTitleText = document.querySelector("#mainTitleText1 .cB_Title");
    return mainTitleText.innerText.trim();
  });

  // 컨텐츠 내 이미지 SRC 목록
  var resultSrcList = this.evaluate(function () {
    var iframe = document.querySelector("#cContentBody iframe");
    var imgList = iframe.contentWindow.document.querySelectorAll("img");
    return Array.prototype.map.call(imgList, function (img) {
      return img.src;
    });
  });

  if (pageNo === 1) {
    // 전체 건수
    totalcnt = this.evaluate(function () {
      var paging_a = document.querySelectorAll("#cNumbering a");
      return paging_a[paging_a.length - 2].innerText.trim();
    });
  }

  var lpad = function (no) {
    var rtnStr = no;
    if (no < 10) {
      rtnStr = "00" + no;
    } else if (no < 100) {
      rtnStr = "0" + no;
    }
    return rtnStr;
  };

  this.echo("blog title:" + this.getTitle());
  this.echo("main title:" + mainTitle);
  this.echo("total count:" + totalcnt);

  // pageNo 폴더생성
  var dirName = "./" + lpad(pageNo) + "_" + lpad(resultSrcList.length) + "_" + mainTitle;
  if (fs.makeDirectory(dirName)) {
    console.log(dirName + ' was created.');
  } else {
    console.log(dirName + ' is NOT created.');
  }

  // 다운로드 개시
  resultSrcList.forEach(function (src, index) {
    var fileName = lpad(pageNo) + "_" + lpad(index + 1) + "_" + mainTitle + ".jpg";
    casper.download(src, dirName + "/" + fileName);
  });

  // var srcList = resultSrcList.join(",");

  //this.echo(srcList);

  pageNo++;

  this.evaluate(function (pgno) {
    goPage(pgno);
  }, pageNo);

  // this.echo("pageNo :" + pageNo);

};

casper.start(loginUrl, function () {

  // daum login
  this.evaluate(function (id, pwd) {
    document.querySelector("#id").value = id;
    document.querySelector("#inputPwd").value = pwd;
    document.querySelector("#loginForm").submit();
  }, LOGIN_ID, LOGIN_PWD);

});

casper.then(function () {

  var loginName = this.evaluate(function () {
    return document.querySelector(".name_user").innerText;
  });

  this.echo("loginName : " + loginName);

  // 로그인 실패시 중단
  if (loginName === null) {
    this.exit();
  }

});

casper.thenOpen(loadUrl, repeatModule);

casper.then(function () {

  casper.repeat(totalcnt - 1, function () {

    this.echo("Repeat-start-pageNo/totalcnt :" + pageNo + "/" + totalcnt);

    this.then(function () {
      loadUrl = this.getCurrentUrl();
      this.open(loadUrl);
      this.echo("Repeat-loadUrl :" + loadUrl);
    });

    this.then(repeatModule);

  });

});

casper.then(function () {
  this.echo("Done.. pageNo:" + pageNo + ", totalcnt:" + totalcnt);
});

casper.run();
// end


