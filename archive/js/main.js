'use strict'

{
  // ポジション生成
  function getVector() {
    // box内のポジション
    // ソートされた配列
    const box_pos = [1, 2, 3, 4, 5];

    // 取り出す範囲(箱の中)を末尾から狭める繰り返し
    for (let i = box_pos.length - 1; i > 0; i--) {
      //乱数生成を使ってランダムに取り出す値を決める
      let r = Math.floor(Math.random() * (i + 1));
      //取り出した値と箱の外の先頭の値を交換する
      const tmp = box_pos[i];
      box_pos[i] = box_pos[r];
      box_pos[r] = tmp;
    }

    // クイズのrotation
    let rota = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    // クイズのposition
    let posi = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    // クイズの座標
    // ソートされた配列
    const vector1 = [-45, -35, -25, -15, -5, 5, 15, 25, 35, 45];
    const vector2 = [-45, -35, -25, -15, -5, 5, 15, 25, 35, 45];

    // 取り出す範囲(箱の中)を末尾から狭める繰り返し
    for (let i = vector1.length - 1; i > 0; i--) {
      //乱数生成を使ってランダムに取り出す値を決める
      let r = Math.floor(Math.random() * (i + 1));
      //取り出した値と箱の外の先頭の値を交換する
      const tmp = vector1[i];
      vector1[i] = vector1[r];
      vector1[r] = tmp;
    }

    // 取り出す範囲(箱の中)を末尾から狭める繰り返し
    for (let i = vector2.length - 1; i > 0; i--) {
      //乱数生成を使ってランダムに取り出す値を決める
      let r = Math.floor(Math.random() * (i + 1));
      //取り出した値と箱の外の先頭の値を交換する
      const tmp = vector2[i];
      vector2[i] = vector2[r];
      vector2[r] = tmp;
    }

    let num = 0;
    while (num < 3) {
      switch (box_pos[num]) {
        case 1:
          // 前壁(0 0 0)
          rota[num].x = 0;
          rota[num].y = 0;
          rota[num].z = 0;

          // (-45～45, -45～45, -49.5)
          posi[num].z = -49.5;

          posi[num].x = vector1[num];
          posi[num].y = vector2[num];
          break;
        case 2:
          // 左壁(0 90 0)
          rota[num].x = 0;
          rota[num].y = 90;
          rota[num].z = 0;

          // (-49.5, -45～45, -45～45)
          posi[num].x = -49.5;

          posi[num].y = vector1[num];
          posi[num].z = vector2[num];
          break;
        case 3:
          // 右壁(0 -90 0)
          rota[num].x = 0;
          rota[num].y = -90;
          rota[num].z = 0;

          // (49.5, -45～45, -45～45)
          posi[num].x = 49.5;

          posi[num].y = vector1[num];
          posi[num].z = vector2[num];
          break;
        case 4:
          // 後壁(180 0 0)
          rota[num].x = 180;
          rota[num].y = 0;
          rota[num].z = 0;

          // (-45～45, -45～45, 49.5)
          posi[num].z = 49.5;

          posi[num].x = vector1[num];
          posi[num].y = vector2[num];
          break;
        case 5:
          // 天井(90 0 0)
          rota[num].x = 90;
          rota[num].y = 0;
          rota[num].z = 0;

          // (-45～45, 49.5, -45～45)
          posi[num].y = 49.5;

          posi[num].x = vector1[num];
          posi[num].z = vector2[num];
          break;
        default:
          break;
      }
      num++;
    }

    const vectorData = rota.concat(posi);
    return vectorData;
  }

  // 移動用
  AFRAME.registerComponent('move-check', {
    schema: {
      raycaster: { type: 'selector' },
    },
    dependencies: ['raycaster'],

    init: function () {
      const el = this.el;
      const data = this.data;
      const scene = document.querySelector('a-scene');
      const box = scene.querySelectorAll('.box-stage');

      this.time = 0;
      let text = scene.querySelector('a-text');

      el.addEventListener('raycaster-intersection', (evt) => {
        if (evt.target !== data.raycaster) { return; }
        this.target_el = evt.detail.els[0];

        if (this.target_el.classList.contains('first-end')) {
          // nav-mesh付替え
          document.getElementById('first-gate').removeAttribute('nav-mesh');
          document.getElementById('first-stage').setAttribute('nav-mesh', '');

          // トンネル&firstGate削除
          document.getElementById('first-tunnel').setAttribute('visible', false);
          document.getElementById('first-gate').setAttribute('visible', false);

          // 問題作成
          const vector = getVector();

          const quiz1 = document.createElement('a-plane');
          quiz1.setAttribute('material', { src: '#q-kou1', normalMap: '#q-kou1-NRM' });
          quiz1.setAttribute('scale', '10 10 1');
          quiz1.setAttribute('rotation', { x: vector[0].x, y: vector[0].y, z: vector[0].z });
          quiz1.setAttribute('position', { x: vector[3].x, y: vector[3].y, z: vector[3].z });
          quiz1.setAttribute('class', 'answer first-quiz-1');
          box[0].appendChild(quiz1);

          const quiz2 = document.createElement('a-plane');
          quiz2.setAttribute('material', { src: '#q-kou2', normalMap: '#q-kou2-NRM' });
          quiz2.setAttribute('scale', '10 10 1');
          quiz2.setAttribute('rotation', { x: vector[1].x, y: vector[1].y, z: vector[1].z });
          quiz2.setAttribute('position', { x: vector[4].x, y: vector[4].y, z: vector[4].z });
          quiz2.setAttribute('class', 'answer first-quiz-2');
          box[0].appendChild(quiz2);

          const quiz3 = document.createElement('a-plane');
          quiz3.setAttribute('material', { src: '#q-kou3', normalMap: '#q-kou3-NRM' });
          quiz3.setAttribute('scale', '10 10 1');
          quiz3.setAttribute('rotation', { x: vector[2].x, y: vector[2].y, z: vector[2].z });
          quiz3.setAttribute('position', { x: vector[5].x, y: vector[5].y, z: vector[5].z });
          quiz3.setAttribute('class', 'answer first-quiz-3');
          box[0].appendChild(quiz3);


          // タイマースタート
          this.timerStop = window.setInterval(() => {
            this.time += 1;
            text.setAttribute('value', this.time);
          }, 1000);


        } else if (this.target_el.classList.contains('second-start')) {
          // nav-mesh付替え
          document.getElementById('first-stage').removeAttribute('nav-mesh');
          document.getElementById('second-gate').setAttribute('nav-mesh', '');

          // firstStage削除
          document.getElementById('first-stage').setAttribute('visible', false);



        } else if (this.target_el.classList.contains('second-end')) {
          // nav-mesh付替え
          document.getElementById('second-gate').removeAttribute('nav-mesh');
          document.getElementById('second-stage').setAttribute('nav-mesh', '');

          // トンネル&secondGate削除
          document.getElementById('second-tunnel').setAttribute('visible', false);
          document.getElementById('second-gate').setAttribute('visible', false);


          // 問題作成
          const vector = getVector();

          const quiz4 = document.createElement('a-plane');
          quiz4.setAttribute('material', { src: '#q-gyoku1', normalMap: '#q-gyoku1-NRM' });
          quiz4.setAttribute('scale', '10 10 1');
          quiz4.setAttribute('rotation', { x: vector[0].x, y: vector[0].y, z: vector[0].z });
          quiz4.setAttribute('position', { x: vector[3].x, y: vector[3].y, z: vector[3].z });
          quiz4.setAttribute('class', 'answer second-quiz-1');
          box[1].appendChild(quiz4);

          const quiz5 = document.createElement('a-plane');
          quiz5.setAttribute('material', { src: '#q-gyoku2', normalMap: '#q-gyoku2-NRM' });
          quiz5.setAttribute('scale', '10 10 1');
          quiz5.setAttribute('rotation', { x: vector[1].x, y: vector[1].y, z: vector[1].z });
          quiz5.setAttribute('position', { x: vector[4].x, y: vector[4].y, z: vector[4].z });
          quiz5.setAttribute('class', 'answer second-quiz-2');
          box[1].appendChild(quiz5);

          const quiz6 = document.createElement('a-plane');
          quiz6.setAttribute('material', { src: '#q-gyoku3', normalMap: '#q-gyoku3-NRM' });
          quiz6.setAttribute('scale', '10 10 1');
          quiz6.setAttribute('rotation', { x: vector[2].x, y: vector[2].y, z: vector[2].z });
          quiz6.setAttribute('position', { x: vector[5].x, y: vector[5].y, z: vector[5].z });
          quiz6.setAttribute('class', 'answer second-quiz-3');
          box[1].appendChild(quiz6);



        } else if (this.target_el.classList.contains('third-start')) {
          // nav-mesh付替え
          document.getElementById('second-stage').removeAttribute('nav-mesh');
          document.getElementById('third-gate').setAttribute('nav-mesh', '');

          // secondStage削除
          document.getElementById('second-stage').setAttribute('visible', false);



        } else if (this.target_el.classList.contains('third-end')) {
          // nav-mesh付替え
          document.getElementById('third-gate').removeAttribute('nav-mesh');
          document.getElementById('third-stage').setAttribute('nav-mesh', '');

          // トンネル&thirdGate削除
          document.getElementById('third-tunnel').setAttribute('visible', false);
          document.getElementById('third-gate').setAttribute('visible', false);


          // 問題作成
          const vector = getVector();

          const quiz7 = document.createElement('a-plane');
          quiz7.setAttribute('material', { src: '#q-dou1', normalMap: '#q-dou1-NRM' });
          quiz7.setAttribute('scale', '10 10 1');
          quiz7.setAttribute('rotation', { x: vector[0].x, y: vector[0].y, z: vector[0].z });
          quiz7.setAttribute('position', { x: vector[3].x, y: vector[3].y, z: vector[3].z });
          quiz7.setAttribute('class', 'answer third-quiz-1');
          box[2].appendChild(quiz7);

          const quiz8 = document.createElement('a-plane');
          quiz8.setAttribute('material', { src: '#q-dou2', normalMap: '#q-dou2-NRM' });
          quiz8.setAttribute('scale', '10 10 1');
          quiz8.setAttribute('rotation', { x: vector[1].x, y: vector[1].y, z: vector[1].z });
          quiz8.setAttribute('position', { x: vector[4].x, y: vector[4].y, z: vector[4].z });
          quiz8.setAttribute('class', 'answer third-quiz-2');
          box[2].appendChild(quiz8);

          const quiz9 = document.createElement('a-plane');
          quiz9.setAttribute('material', { src: '#q-dou3', normalMap: '#q-dou3-NRM' });
          quiz9.setAttribute('scale', '10 10 1');
          quiz9.setAttribute('rotation', { x: vector[2].x, y: vector[2].y, z: vector[2].z });
          quiz9.setAttribute('position', { x: vector[5].x, y: vector[5].y, z: vector[5].z });
          quiz9.setAttribute('class', 'answer third-quiz-3');
          box[2].appendChild(quiz9);



        } else if (this.target_el.classList.contains('fourth-start')) {
          // nav-mesh付替え
          document.getElementById('third-stage').removeAttribute('nav-mesh');
          document.getElementById('fourth-gate').setAttribute('nav-mesh', '');

          // thirdStage削除
          document.getElementById('third-stage').setAttribute('visible', false);

        } else if (this.target_el.classList.contains('fourth-end')) {
          // nav-mesh付替え
          document.getElementById('fourth-gate').removeAttribute('nav-mesh');
          document.getElementById('fourth-stage').setAttribute('nav-mesh', '');

          // トンネル&fourthGate削除
          document.getElementById('fourth-tunnel').setAttribute('visible', false);
          document.getElementById('fourth-gate').setAttribute('visible', false);

          // 問題作成
          const vector = getVector();

          const quiz10 = document.createElement('a-plane');
          quiz10.setAttribute('material', { src: '#q-ryu1', normalMap: '#q-ryu1-NRM' });
          quiz10.setAttribute('scale', '10 10 1');
          quiz10.setAttribute('rotation', { x: vector[0].x, y: vector[0].y, z: vector[0].z });
          quiz10.setAttribute('position', { x: vector[3].x, y: vector[3].y, z: vector[3].z });
          quiz10.setAttribute('class', 'answer fourth-quiz-1');
          box[3].appendChild(quiz10);

          const quiz11 = document.createElement('a-plane');
          quiz11.setAttribute('material', { src: '#q-ryu2', normalMap: '#q-ryu2-NRM' });
          quiz11.setAttribute('scale', '10 10 1');
          quiz11.setAttribute('rotation', { x: vector[1].x, y: vector[1].y, z: vector[1].z });
          quiz11.setAttribute('position', { x: vector[4].x, y: vector[4].y, z: vector[4].z });
          quiz11.setAttribute('class', 'answer fourth-quiz-2');
          box[3].appendChild(quiz11);

          const quiz12 = document.createElement('a-plane');
          quiz12.setAttribute('material', { src: '#q-ryu3', normalMap: '#q-ryu3-NRM' });
          quiz12.setAttribute('scale', '10 10 1');
          quiz12.setAttribute('rotation', { x: vector[2].x, y: vector[2].y, z: vector[2].z });
          quiz12.setAttribute('position', { x: vector[5].x, y: vector[5].y, z: vector[5].z });
          quiz12.setAttribute('class', 'answer fourth-quiz-3');
          box[3].appendChild(quiz12);



        } else if (this.target_el.classList.contains('goal-start')) {
          // nav-mesh付替え
          document.getElementById('fourth-stage').removeAttribute('nav-mesh');
          document.getElementById('goal-gate').setAttribute('nav-mesh', '');

          // fourthStage削除
          document.getElementById('fourth-stage').setAttribute('visible', false);
        } else if (this.target_el.classList.contains('goal-end')) {

          // タイマーストップ
          window.clearInterval(this.timerStop);
          text.setAttribute('value', this.time);
          text.setAttribute('color', '#0000FF');
        }
      });
    }
  });

  // 解答用
  AFRAME.registerComponent('quiz-check', {
    schema: {
      raycaster: { type: 'selector' },
    },
    dependencies: ['raycaster'],

    init: function () {
      const el = this.el;
      const data = this.data;

      el.addEventListener('raycaster-intersection', (evt) => {
        if (evt.target !== data.raycaster) {
          this.target_el = evt.detail.els[0];

          evt.target.addEventListener('mousedown', () => {
            if (this.target_el.classList.contains('first-quiz-1')) {
              this.firstQuiz1 = true;
              this.target_el.setAttribute('material', { src: '#correct' });

              if (this.firstQuiz1 && this.firstQuiz2 && this.firstQuiz3) {
                document.getElementById('second-tunnel').setAttribute('visible', true);
                document.getElementById('second-gate').setAttribute('visible', true);
              }
            } else if (this.target_el.classList.contains('first-quiz-2')) {
              this.firstQuiz2 = true;
              this.target_el.setAttribute('material', { src: '#correct' });

              if (this.firstQuiz1 && this.firstQuiz2 && this.firstQuiz3) {
                document.getElementById('second-tunnel').setAttribute('visible', true);
                document.getElementById('second-gate').setAttribute('visible', true);
              }
            } else if (this.target_el.classList.contains('first-quiz-3')) {
              this.firstQuiz3 = true;
              this.target_el.setAttribute('material', { src: '#correct' });

              if (this.firstQuiz1 && this.firstQuiz2 && this.firstQuiz3) {
                document.getElementById('second-tunnel').setAttribute('visible', true);
                document.getElementById('second-gate').setAttribute('visible', true);
              }



            } else if (this.target_el.classList.contains('second-quiz-1')) {
              this.secondQuiz1 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.secondQuiz1 && this.secondQuiz2 && this.secondQuiz3) {
                document.getElementById('third-tunnel').setAttribute('visible', true);
                document.getElementById('third-gate').setAttribute('visible', true);
              }

            } else if (this.target_el.classList.contains('second-quiz-2')) {
              this.secondQuiz2 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.secondQuiz1 && this.secondQuiz2 && this.secondQuiz3) {
                document.getElementById('third-tunnel').setAttribute('visible', true);
                document.getElementById('third-gate').setAttribute('visible', true);
              }

            } else if (this.target_el.classList.contains('second-quiz-3')) {
              this.secondQuiz3 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.secondQuiz1 && this.secondQuiz2 && this.secondQuiz3) {
                document.getElementById('third-tunnel').setAttribute('visible', true);
                document.getElementById('third-gate').setAttribute('visible', true);
              }



            } else if (this.target_el.classList.contains('third-quiz-1')) {
              this.thirdQuiz1 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.thirdQuiz1 && this.thirdQuiz2 && this.thirdQuiz3) {
                document.getElementById('fourth-tunnel').setAttribute('visible', true);
                document.getElementById('fourth-gate').setAttribute('visible', true);
              }

            } else if (this.target_el.classList.contains('third-quiz-2')) {
              this.thirdQuiz2 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.thirdQuiz1 && this.thirdQuiz2 && this.thirdQuiz3) {
                document.getElementById('fourth-tunnel').setAttribute('visible', true);
                document.getElementById('fourth-gate').setAttribute('visible', true);
              }

            } else if (this.target_el.classList.contains('third-quiz-3')) {
              this.thirdQuiz3 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.thirdQuiz1 && this.thirdQuiz2 && this.thirdQuiz3) {
                document.getElementById('fourth-tunnel').setAttribute('visible', true);
                document.getElementById('fourth-gate').setAttribute('visible', true);
              }



            } else if (this.target_el.classList.contains('fourth-quiz-1')) {
              this.fourthQuiz1 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.fourthQuiz1 && this.fourthQuiz2 && this.fourthQuiz3) {
                document.getElementById('goal-tunnel').setAttribute('visible', true);
                document.getElementById('goal-gate').setAttribute('visible', true);
              }

            } else if (this.target_el.classList.contains('fourth-quiz-2')) {
              this.fourthQuiz2 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.fourthQuiz1 && this.fourthQuiz2 && this.fourthQuiz3) {
                document.getElementById('goal-tunnel').setAttribute('visible', true);
                document.getElementById('goal-gate').setAttribute('visible', true);
              }

            } else if (this.target_el.classList.contains('fourth-quiz-3')) {
              this.fourthQuiz3 = true;
              this.target_el.setAttribute('material', { src: '#correct' });
              if (this.fourthQuiz1 && this.fourthQuiz2 && this.fourthQuiz3) {
                document.getElementById('goal-tunnel').setAttribute('visible', true);
                document.getElementById('goal-gate').setAttribute('visible', true);
              }



            }
          });
        }
      });
    }
  });
}