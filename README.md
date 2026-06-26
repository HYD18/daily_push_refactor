# daily_push

微信每日推送：每天给指定微信用户发送日期、天气、地区、恋爱纪念日、两个生日倒计时、今日建议和一言。

## 功能

- 微信公众号测试号/服务号模板消息推送
- 支持多个接收用户 `openid`
- 支持和风天气地区查询、三天天气、生活指数/今日建议
- 支持恋爱纪念日天数
- 支持两个生日倒计时，生日可用农历或公历
- 支持本地 `config.json`、旧版 `configs.json`、环境变量 `DAILY_PUSH_CONFIGS`
- 支持 GitHub Actions 定时运行和青龙面板运行
- 支持 `DRY_RUN=1` 只打印消息内容，不真正发送

## 模板消息格式

在微信公众号测试号后台创建模板，内容建议如下：

```text
日期：{{date.DATA}}
一言：{{oneWords.DATA}}{{oneWords2.DATA}}
地区：{{region.DATA}}
气温：{{temp.DATA}}
白昼：{{textDay.DATA}}
黑夜：{{textNight.DATA}}
今天是我们恋爱的第{{memorialDay.DATA}}天
距离{{name.DATA}}的生日还有{{birthdayDiff.DATA}}天
距离{{name2.DATA}}的生日还有{{birthdayDiff2.DATA}}天
今日建议：{{tip.DATA}}{{tip2.DATA}}
```

## 快速开始

```shell
npm install
cp config.example.json config.json
npm start
```

Windows PowerShell 可用：

```powershell
Copy-Item config.example.json config.json
npm install
npm start
```

## 配置

优先级从高到低：

1. `CONFIG_PATH` 指定的 JSON 文件
2. 环境变量 `DAILY_PUSH_CONFIGS`
3. 兼容旧项目的环境变量 `daliyPushConfigs`
4. 根目录 `config.json`
5. 兼容旧项目的根目录 `configs.json`

新配置示例见 `config.example.json`。旧版 `configs.json` 仍然可用，字段会自动映射：

```json
{
  "location": "滨江区",
  "adm": "杭州市",
  "weatherIndex": "1",
  "fullInLoveDate": "2000-01-01",
  "name": "用户1",
  "name2": "用户2",
  "birthday": "2000-01-01",
  "birthday2": "2000-01-01",
  "key": "和风天气Key",
  "appId": "微信公众号appId",
  "appSecret": "微信公众号appSecret",
  "templateId": "模板ID",
  "toUser": ["openid1", "openid2"],
  "oneType": "d"
}
```

## GitHub Actions

把完整 JSON 配置放到仓库 Secrets：

- `DAILY_PUSH_CONFIGS`

默认工作流在北京时间每天 7:30 运行。GitHub Actions 使用 UTC，所以 cron 是 `30 23 * * *`，对应北京时间次日 7:30。

## 青龙面板

拉库或上传项目后，添加 Node 依赖：

- `solarlunar`

环境变量推荐使用：

- `DAILY_PUSH_CONFIGS`

也兼容旧变量名：

- `daliyPushConfigs`

## 本地检查

```shell
npm run check
DRY_RUN=1 npm start
```

PowerShell：

```powershell
$env:DRY_RUN="1"
npm start
```
