#!/usr/bin/env node

/**
 * Daum Blog Image Downloader V2
 *
 * Author : Juntai Park
 * Created Date : 2022-08-22
 **/
// import readline from 'readline'
import fs from 'fs'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { ElementHandle, NodeFor, Page, PuppeteerLaunchOptions } from 'puppeteer'
import axios from 'axios'

puppeteer.use(StealthPlugin())

const LOGIN_ID = '다음로그인아이디'
const LOGIN_PWD = '다음로그인비밀번호'
const BLOG_ID = '블로그아이디'

const LOGIN_URL = 'https://logins.daum.net/accounts/signinform.do'
const TARGET_URL = `https://blog.daum.net/${BLOG_ID}?page=`

const puppeteerOptions: PuppeteerLaunchOptions = {
  headless: true,
  // slowMo: 50,
}
const browser = await puppeteer.launch(puppeteerOptions)
const page: Page = await browser.newPage()
await page.setViewport({ width: 1240, height: 1080 })
await page.setExtraHTTPHeaders({
  'Accept-Language': 'ko',
})

async function login(): Promise<void> {
  await page.goto(LOGIN_URL)
  await page.waitForSelector('input[type=email]')
  await page.type('input[type=email]', LOGIN_ID)
  await page.waitForSelector('input[type=password]')
  await page.type('input[type=password]', LOGIN_PWD)
  await page.click('button[id^=loginBtn]')
  await page.waitForSelector('a[class=link_next]')
  await page.click('a[class=link_next]')
  await page.waitForSelector('body')
}

async function getAllCountWithText(page: Page): Promise<string> {
  await page.waitForSelector('div[id=cS_mainTitle_header]')
  const allCountWithText = await page.$eval('#cS_mainTitle_header', el => {
    const t = el as HTMLElement
    return t.innerText
  })
  return allCountWithText
}

async function downloadImage(
  imageLink: string,
  uploadPath: string,
  filename: string | undefined
): Promise<void> {
  await axios
    .get(imageLink, { responseType: 'arraybuffer' })
    .then(response => {
      fs.writeFileSync(uploadPath + filename, response.data)
    })
    .catch(err => {
      console.log(err)
    })
}

let pageNo = 1
let isDataExist = true
await login()

// first
fs.existsSync(`./download`) || fs.mkdirSync(`./download`)
const subPage: Page = await browser.newPage()
// first end

while (isDataExist) {
  console.log('pageNo : ', pageNo)
  await page.goto(TARGET_URL + pageNo)

  // 전체 글 (1151) - 비로그인 기준
  if (pageNo === 1) {
    console.log(await getAllCountWithText(page))
  }

  // 페이지당 12개 아티클 데이터
  const elementHandles: ElementHandle[] = await page.$$('.GalleryCList > li > a')
  const propertyJsHandles = await Promise.all(
    elementHandles.map(handle => handle.getProperty('href'))
  )
  const hrefs2: string[] = <string[]>(
    await Promise.all(propertyJsHandles.map(handle => handle.jsonValue()))
  )

  if (hrefs2.length === 0) {
    console.log('no data. page no : ', pageNo)
    isDataExist = false
    break
  }

  for (const link of hrefs2) {
    console.log('target link:', link)
    await subPage.goto(link)

    await subPage.waitForSelector('body')
    let title = await subPage.$eval('.cB_Title', el => {
      const t = el as HTMLElement
      return t.innerText.trim()
    })
    console.log('title :>> ', title)

    const category = await subPage.$eval('.cB_Folder', el => {
      const t = el as HTMLElement
      return t.innerText
    })
    console.log('category :>> ', category)

    fs.existsSync(`./download/${category}`) || fs.mkdirSync(`./download/${category}`)

    title = title.replace(/\//g, '-')
    const uploadPath = `./download/${category}/${title}/`

    fs.existsSync(uploadPath) || fs.mkdirSync(uploadPath)

    let elementHandles: ElementHandle[]
    let imageNames: (string | undefined)[] = []
    let propertyJsHandles
    let imageLinks: string[] = []

    if (pageNo >= 81) {
      // 2008 년 어느시점부터는 img 태그에서 긁어와야한다.
      imageLinks = await subPage.$$eval('#cContentBody img', els => {
        return els.map(el => {
          const t = el as HTMLImageElement
          const src = t.src
          return src
        })
      })

      imageNames = await subPage.$$eval('#cContentBody img', els => {
        return els.map(el => {
          const t = el as HTMLImageElement
          const src = t.src.split(';').pop()?.split('=').pop()
          return src
        })
      })
    } else {
      elementHandles = await subPage.$$('#cContentBody a')
      imageNames = await subPage.$$eval('#cContentBody a', els => {
        return els.map(el => {
          const t = el as HTMLElement
          return t.dataset.alt
        })
      })

      propertyJsHandles = await Promise.all(
        elementHandles.map(handle => handle.getProperty('href'))
      )

      imageLinks = <string[]>await Promise.all(propertyJsHandles.map(handle => handle.jsonValue()))
    }

    console.log('image Count:', imageLinks.length)

    for (const [index, imageLink] of imageLinks.entries()) {
      console.log('imageLink :>> ', imageLink, imageNames[index])

      if (imageLink.indexOf('creativecommons.org') > -1 || !imageNames[index]) {
        continue
      }

      // file name 중복처리는 하지 않음. 실제로 같은 이미지임.
      let filename = imageNames[index]

      if (filename === null || filename === 'null') {
        filename = imageLink.split('/').pop()?.split('?')[0] + '.jpg'
      }

      await downloadImage(imageLink, uploadPath, filename)
    }
  }
  pageNo++
}


await subPage.close()

console.log('처리 종료');