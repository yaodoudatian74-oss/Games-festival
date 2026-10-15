# Games-festival

ゲーム祭り。ブレインロットをテーマにしたゲームを41本まとめて遊べます。

## 遊び方

ブラウザで `index.html` を開くと一覧が出ます（ローカルで見る場合は、簡易サーバーを立てると確実です）。

```bash
python3 -m http.server 8000
# → http://localhost:8000/ を開く
```

## 作品

| 区分 | 作品 | 場所 |
| --- | --- | --- |
| ★ 本格3D | ブレインロットを盗め3D | `games/steal-a-brainrot-3d/index.html`（Three.js） |
| シリーズ40選 | 2Dアーケード40本 | `games/<id>.js`（共通エンジン上で動作） |

3Dゲームは、買う → 運ぶ → 台座に置く → 収入、の流れを中心に、ライバルの妨害、盗み、シールド、リバース（周回）を入れています。
操作はゲーム画面の「？」欄とスタート画面に書いてあります。

## 構成

```
index.html                 一覧ページ（作品カード）
play.html?game=<id>        2D作品のプレイ画面（games/<id>.js を読み込む）
shared/manifest.js         作品一覧（タイトル・ジャンル・アイコン）
shared/brainrot.js         2D共通エンジン（ループ・入力・スコア保存・タイトル/ゲームオーバー画面）
shared/brainrot.css        共通スタイル
games/<id>.js              各2D作品のルール（BR.register で登録）
games/steal-a-brainrot-3d/ 3D作品（単独のHTML。Three.js r128 を cdnjs から読み込み）
```

### 新しい2D作品を足すには

1. `shared/manifest.js` に `{ id, no, title, genre, emoji, color }` を追加する
2. `games/<id>.js` を作り、`BR.register('<id>', { howto, init(S,B,W,H), update(S,dt,I,B), draw(S,g,W,H,B) })` を書く
   - `S.score` にスコア、`S.over = true` でゲームオーバー、`S.msg` で見出しを変える
   - `I` は入力（`I.dx` / `I.dy`、`I.held(...)`、`I.tap(...)`、`I.action()`、`I.ptr`、`I.chars`）

## 注意

- キャラクター名は、ネットミームとして広まった名称です。3D作品・2D作品ともに、ゲームの仕組みと数値はこのリポジトリの独自実装で、Roblox作品のアセット・コードは使っていません。
- 3D作品は外部CDN（cdnjs）から Three.js を読み込みます。オフラインでは動きません。
- ハイスコアはブラウザの `localStorage` に保存されます。3D作品の進行状況も同じく `localStorage` です。
