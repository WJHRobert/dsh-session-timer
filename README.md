# dsh-session-timer

涓€涓瀬绠€鐨?DSH锛圖eepSeek Harness锛夋彃浠讹細**鍦ㄦ瘡杞璇濈粨鏉熸椂锛屽線瀹夸富鏃ュ織鍐欎竴琛屾憳瑕?*鈥斺€旀湰杞€楁椂澶氬皯銆佹秷鑰椾簡澶氬皯 Token銆備笉璋冨閮?API锛屼笉鍐欎細璇濆巻鍙诧紝涓嶅仛 UI銆?
## 绠€浠?
DSH 鐨?`session/event` 浜嬩欢娴侀噷锛宍turn/start` 鍜?`turn/end` 鏍囪浜嗕竴杞璇濈殑濮嬬粓锛沗ctx.tokenMeter` 鑳界粰鍑轰細璇濆綋鍓嶇殑 Token 鍘嬪姏銆傝繖涓彃浠舵妸涓よ€呭涓婏細璁颁綇寮€濮嬫椂鍒讳笌 Token 鎬绘暟锛屽湪缁撴潫鏃剁畻鍑哄樊鍊煎苟鎵撲竴琛屾棩蹇椼€?
鏍稿績鐗规€э細

- **闆跺閮ㄤ緷璧?*锛氶櫎 `schemastery`锛圖SH 鑷甫鐨勯厤缃牎楠屽簱锛夊涓嶅紩鍏ヤ换浣曞寘
- **涓嶆薄鏌撲笂涓嬫枃**锛氬彧鍐欐棩蹇楋紝涓嶆敼妯″瀷鍘嗗彶銆佷笉娉ㄥ叆娑堟伅
- **浼橀泤闄嶇骇**锛氱粍鍚堥噷娌℃湁 `token-meter` 鏃惰緭鍑?`tokens=?`锛屾彃浠剁収甯稿伐浣?- **閰嶇疆鍖?*锛氬紑鍏炽€佽€楁椂銆乀oken銆佹棩蹇楀墠缂€閮藉彲閰?- **灏忓埌鑳借瀹?*锛歚lib/index.js` 绾?150 琛岋紝閫傚悎浣滀负 DSH 鎻掍欢寮€鍙戠殑鍙傜収瀹炵幇

## 瀹夎

浠?GitHub 瀹夎锛堟帹鑽愶級锛?
```bash
dsh plugin --profile web add github:WJHRobert/dsh-session-timer
```

瀹夎瀹屾垚鍚庨噸鍚?`dsh web`锛岀粓绔簲鍑虹幇锛?
```text
[session-timer] loaded! enabled=true showDuration=true showTokens=true
```

> **鍏充簬 profile**锛歚dsh` 鐨勬瘡涓?profile 鏄竴濂楃嫭绔嬮厤缃€備笂闈㈣杩涚殑鏄?`web` profile锛汥esktop 瀹㈡埛绔敤鐨勬槸 `desktop` profile锛屼笖琚?CLI 鏄庣‘绂佹绠＄悊锛岃鏀瑰湪瀹㈡埛绔噷瀹夎銆傝鍦ㄥ摢涓?profile锛屽氨鍙湪鍝釜 profile 鐢熸晥銆?
鏈湴寮€鍙戯紙涓嶅彂甯冧篃鑳借皟璇曪級锛?
```bash
# 鏂瑰紡 A锛歭ink 瀹夎锛岃蛋瀹屾暣瀹夎閾捐矾
dsh plugin --profile web add link:/absolute/path/to/dsh-session-timer

# 鏂瑰紡 B锛?-patch 瑕嗙洊灞傦紝鏀逛唬鐮佸悗閲嶅惎鍗崇敓鏁?dsh web --patch /absolute/path/to/dsh-session-timer/cordis.patch.yml
```

## 閰嶇疆

閰嶇疆椤归€氳繃 patch 瑕嗙洊 row 鐨?`config` 鐢熸晥銆傚瓧娈靛涓嬶細

| 瀛楁 | 绫诲瀷 | 榛樿鍊?| 璇存槑 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 鎬诲紑鍏筹紝鍏抽棴鍚庡彧淇濈暀鍔犺浇鏃ュ織 |
| `showDuration` | `boolean` | `true` | 鏄惁杈撳嚭鏈疆鑰楁椂 |
| `showTokens` | `boolean` | `true` | 鏄惁杈撳嚭鏈疆 Token 澧為噺锛堜緷璧?`token-meter`锛?|
| `prefix` | `string` | `"[session-timer]"` | 鏃ュ織琛屽墠缂€ |

鍦?profile 鐨?`cordis.patch.yml`锛堟垨 `--patch` 瑕嗙洊灞傦級閲岃拷鍔狅細

```yaml
- id: session-timer
  config:
    enabled: true
    showDuration: true
    showTokens: true
    prefix: '[my-timer]'
```

淇濆瓨鍚庯紝HMR 寮€鍚椂浼氬嵆鏃剁敓鏁堬紝鍚﹀垯閲嶅惎 `dsh web`銆?
## 浣跨敤

瑁呭ソ鍚庢甯稿璇濆嵆鍙€傚彂涓€鏉′細瑙﹀彂宸ュ叿璋冪敤鐨勬秷鎭紝渚嬪锛?
```text
甯垜鍐欎竴涓?Python 鑴氭湰鎵撳嵃 1 鍒?10锛岀劧鍚庤繍琛屽畠銆?```

杩欎竴杞粨鏉熷悗锛岀粓绔細澶氬嚭涓€琛岋細

```text
[session-timer] turn ended session=01J... duration=42.7s tokens=+3184 (total 9120)
```

- `duration`锛氫粠 `turn/start` 鍒?`turn/end` 鐨勫閽熸椂闂?- `tokens`锛氭嫭鍙峰鏄湰杞閲忥紝鎷彿鍐呮槸浼氳瘽绱锛堟潵鑷?`ctx.tokenMeter.measure()`锛?
## 宸茬煡闄愬埗

- **鍙湪鏃ュ織閲岋紝涓嶅湪鐣岄潰閲?*锛氭憳瑕佸啓杩涘涓荤粓绔棩蹇楋紝Web 鐣岄潰鐪嬩笉鍒般€傝鍦ㄧ晫闈㈠睍绀洪渶瑕侀澶栫殑瀹㈡埛绔彃浠讹紙`dsh.client` + 娴忚鍣ㄥ崐鍖咃級锛屽埢鎰忔病鏈夊仛銆?- **Token 鏁板瓧鏄及绠?*锛氭暟鍊兼潵鑷?`dsh-token-meter` 鐨勫惎鍙戝紡浼扮畻锛堢害 4 瀛楃/token锛夛紝涓嶆槸璐﹀崟绾х簿纭€硷紱鍙戠敓鍘嬬缉鎴栭噸璇曟椂锛屽崟杞閲忓彲鑳戒负璐熴€?- **鑰楁椂鏄閽熸椂闂?*锛氬寘鍚瓑寰呯敤鎴峰鎵广€佸伐鍏锋墽琛屻€佹ā鍨嬫帓闃燂紝涓嶇瓑浜庢ā鍨嬬函鐢熸垚鏃堕棿銆?
## License

[MIT](./LICENSE) 漏 2026 dsh-session-timer contributors
