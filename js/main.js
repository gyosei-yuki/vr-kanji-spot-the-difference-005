"use strict";

{
  // 💡 改善点2：ゲーム全体の進行状態を管理するオブジェクト
  // 各ステージで見つけた間違いの数をここで管理します
  const clearedQuizzes = { 1: 0, 2: 0, 3: 0, 4: 0 };

  // ポジション生成（※当時の執念のFisher-Yatesシャッフル＆3D座標ロジックをリスペクトしてそのまま残しています！）
  function getVector() {
    // box内のポジション
    const box_pos = [1, 2, 3, 4, 5];

    // 取り出す範囲(箱の中)を末尾から狭める繰り返し（Fisher-Yates shuffle）
    for (let i = box_pos.length - 1; i > 0; i--) {
      let r = Math.floor(Math.random() * (i + 1));
      const tmp = box_pos[i];
      box_pos[i] = box_pos[r];
      box_pos[r] = tmp;
    }

    let rota = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    let posi = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    const vector1 = [-45, -35, -25, -15, -5, 5, 15, 25, 35, 45];
    const vector2 = [-45, -35, -25, -15, -5, 5, 15, 25, 35, 45];

    for (let i = vector1.length - 1; i > 0; i--) {
      let r = Math.floor(Math.random() * (i + 1));
      const tmp = vector1[i];
      vector1[i] = vector1[r];
      vector1[r] = tmp;
    }

    for (let i = vector2.length - 1; i > 0; i--) {
      let r = Math.floor(Math.random() * (i + 1));
      const tmp = vector2[i];
      vector2[i] = vector2[r];
      vector2[r] = tmp;
    }

    let num = 0;
    while (num < 3) {
      switch (box_pos[num]) {
        case 1: // 前壁
          rota[num] = { x: 0, y: 0, z: 0 };
          posi[num] = { x: vector1[num], y: vector2[num], z: -49.5 };
          break;
        case 2: // 左壁
          rota[num] = { x: 0, y: 90, z: 0 };
          posi[num] = { x: -49.5, y: vector1[num], z: vector2[num] };
          break;
        case 3: // 右壁
          rota[num] = { x: 0, y: -90, z: 0 };
          posi[num] = { x: 49.5, y: vector1[num], z: vector2[num] };
          break;
        case 4: // 後壁
          rota[num] = { x: 180, y: 0, z: 0 };
          posi[num] = { x: vector1[num], y: vector2[num], z: 49.5 };
          break;
        case 5: // 天井
          rota[num] = { x: 90, y: 0, z: 0 };
          posi[num] = { x: vector1[num], y: 49.5, z: vector2[num] };
          break;
      }
      num++;
    }
    return rota.concat(posi);
  }

  // 移動用コンポーネント
  AFRAME.registerComponent("move-check", {
    schema: { raycaster: { type: "selector" } },
    dependencies: ["raycaster"],

    init: function () {
      const data = this.data;
      const text = document.getElementById("timer-text");
      this.time = 0;

      data.raycaster.addEventListener("raycaster-intersection", (evt) => {
        const target_el = evt.detail.els[0];

        // 💡 改善点3：DOMアクセスを変数化し、HTMLで設定した data-stage 番号を取得して使い回す
        const stageNum = parseInt(target_el.dataset.stage);

        // --- 部屋に入った時（ゲートの終点） ---
        if (target_el.classList.contains("gate-end")) {
          // ゴール（第5ステージ）の処理
          if (stageNum === 5) {
            window.clearInterval(this.timerStop);
            text.setAttribute("value", this.time);
            text.setAttribute("color", "#0000FF");
            return;
          }

          // nav-mesh付替え（今のゲートから権限を剥奪し、部屋に付与）
          document
            .getElementById(`gate-${stageNum}`)
            .removeAttribute("nav-mesh");
          document
            .getElementById(`stage-${stageNum}`)
            .setAttribute("nav-mesh", "");

          // トンネル&Gate削除
          document
            .getElementById(`tunnel-${stageNum}`)
            .setAttribute("visible", false);
          document
            .getElementById(`gate-${stageNum}`)
            .setAttribute("visible", false);

          // 💡 改善点2：問題作成をループ処理でDRYに！
          const vector = getVector();
          const box = document.getElementById(`box-${stageNum}`);

          for (let i = 1; i <= 3; i++) {
            const quiz = document.createElement("a-plane");
            quiz.setAttribute("material", {
              src: `#q-${stageNum}-${i}`,
              normalMap: `#q-${stageNum}-${i}-NRM`,
            });
            quiz.setAttribute("scale", "10 10 1");
            // getVectorで生成した配列の 0〜2 が rotation、3〜5 が position
            quiz.setAttribute("rotation", vector[i - 1]);
            quiz.setAttribute("position", vector[i + 2]);
            quiz.setAttribute("class", "answer");
            quiz.dataset.stage = stageNum; // クリックされた時に「何ステージ目の問題か」判別するため
            box.appendChild(quiz);
          }

          // 第1ステージに入った時だけタイマーをスタート
          if (stageNum === 1 && !this.timerStop) {
            this.timerStop = window.setInterval(() => {
              this.time += 1;
              text.setAttribute("value", this.time);
            }, 1000);
          }

          // --- 次の部屋へ向かうトンネルに入った時（ゲートの始点） ---
        } else if (target_el.classList.contains("gate-start")) {
          // nav-mesh付替え（前の部屋から権限を剥奪し、トンネルに付与）
          document
            .getElementById(`stage-${stageNum - 1}`)
            .removeAttribute("nav-mesh");
          document
            .getElementById(`gate-${stageNum}`)
            .setAttribute("nav-mesh", "");

          // 前のステージの床を非表示にする
          document
            .getElementById(`stage-${stageNum - 1}`)
            .setAttribute("visible", false);
        }
      });
    },
  });

  // 解答用コンポーネント
  AFRAME.registerComponent("quiz-check", {
    schema: { raycaster: { type: "selector" } },
    dependencies: ["raycaster"],

    init: function () {
      const raycasterEl = this.data.raycaster; // <a-cursor>

      // 💡 改善点1：イベントの増殖を防ぐため、raycaster-intersectionではなく、カーソル自体のクリック(mousedown)を1回だけ監視する
      raycasterEl.addEventListener("mousedown", () => {
        // 現在カーソルが重なっている要素を取得
        const intersectedEls = raycasterEl.components.raycaster.intersectedEls;
        if (intersectedEls.length === 0) return; // 何も見ていなければ終了

        const targetEl = intersectedEls[0];

        // 見つめているのが「間違い（answer）」であり、まだ正解していない場合
        if (targetEl.classList.contains("answer") && !targetEl.dataset.found) {
          targetEl.dataset.found = "true"; // 二重クリック防止フラグ
          targetEl.setAttribute("material", { src: "#correct" });

          // このクイズが属するステージ番号を取得して、正解数を+1
          const stageNum = parseInt(targetEl.dataset.stage);
          clearedQuizzes[stageNum]++;

          // 3つ正解したら、次のステージの扉を出現させる
          if (clearedQuizzes[stageNum] === 3) {
            const nextStage = stageNum + 1;
            document
              .getElementById(`tunnel-${nextStage}`)
              .setAttribute("visible", true);
            document
              .getElementById(`gate-${nextStage}`)
              .setAttribute("visible", true);
          }
        }
      });
    },
  });
}
