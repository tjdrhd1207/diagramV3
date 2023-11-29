# designerV3
- [designerV3](#designerv3)
  - [Getting started](#getting-started)
    - [소스 내려 받기](#소스-내려-받기)
    - [개발 환경 구성 및 미리보기](#개발-환경-구성-및-미리보기)
  - [Development Rules](#development-rules)
    - [Semantic Versioning 2.0.0](#semantic-versioning-200)

## Getting started
### 소스 내려 받기
```
git clone https://pd.hansol.com/git/aicc/inticube-isac-ivr/ivr.designer/designerv3.git
git switch development
```
### 개발 환경 구성 및 미리보기
```
npm install
npx vite

  VITE v5.0.3  ready in 913 ms

  ➜  Local:   http://localhost:5173/  <- 이 링크로 접속
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Development Rules
### Semantic Versioning 2.0.0
이 프로젝트의 버전 규칙은 [Semantic Versioning 2.0.0](https://semver.org/) 와 사업부 개발프로세스를 따른다. :warning: *Commit 할 때 `package.json` 의 "version" 을 반드시 수정한다.*버전 명은 "v{X}.{Y}.{Z}-{@}" 로 구성되어 있으며, 배포 전까지는 "{X}" 는 0으로 유지한다. 임시 버전 생성이 필요한 경우 "{@}" 에 소문자로 키워드를 입력한다. (ex: 0.0.1-temp) 그리고 버전 정보 변경 및 Node Modules 에 대한 종속성 업데이트를 위하여 `npm istall` 을 한번 실행한 후 commit 한다.(이 과정에서 `package.json` 에서 변경한 버전 정보가 `package-lock.json` 에 함께 업데이트 된다.)
