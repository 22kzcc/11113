// 在沒有 OpenProcessing (OPC) 環境時提供簡單 shim，並設定預設變數
if (typeof OPC === 'undefined') {
    window.OPC = {
        slider: function (name, defaultValue /*, min, max, step */) {
            if (typeof window[name] === 'undefined') {
                window[name] = defaultValue;
            }
        }
    };
}

// 原本的 OPC 設定
/** OPC START **/
OPC.slider('seed', Math.floor(Math.random()*1000), 0, 1000);
OPC.slider('offset', 0.02, 0.001, 0.1, 0.01);
OPC.slider('speed', 0.001, 0, 0.002, 0.00001);
/** OPC END**/


let palette = ["#f4f1de" ,"#eae4d6" ,"#e9dbce" ];
let paletteSc=["#05668d","#028090","#00a896","#02c39a","#f0f3bd","#006d77","#83c5be","#edf6f9","#ffddd2","#e29578"];
let t = 0.0;

// --- 新增選單相關變數和物件 ---
let roundButton;      // 中心圓形按鈕 (資訊按鈕)
let sideMenu;         // 左側固定的選單容器
let unitOneButton;    // 側邊選單中「第一單元作品」的按鈕
let unitOneModal;     // 「第一單元作品」的模態介面
let exitUnitOneButton;// 退出「第一單元作品」的按鈕

// 新增 作品二 / 作品三 相關變數
let unitTwoButton;
let unitTwoModal;
let exitUnitTwoButton;

let unitThreeButton;
let unitThreeModal;
let exitUnitThreeButton;

// 新增：作品四與漢堡按鈕變數
let unitFourButton;
let unitFourModal;
let exitUnitFourButton;
let hamburgerBtn;
let sideMenuVisible = true;

// Quiz (作品三) 相關變數
let questionsTable;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let unitThreeContentDiv;
let questionEl;
let optionButtons = [];
let feedbackEl;

// 新增：作品五變數
let unitFiveButton;
let unitFiveModal;
let exitUnitFiveButton;
// --- 結束新增 ---

// 新增 preload 用來載入 questions.csv（請確保 questions.csv 與 sketch.js 同目錄）
function preload() {
    // 如果在本機或網頁環境執行，loadTable 會載入同目錄下的 questions.csv
    questionsTable = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB,360,100,100);
    
    // 將 CSV 轉成 quizQuestions 陣列
    if (questionsTable && questionsTable.getRowCount) {
        for (let r = 0; r < questionsTable.getRowCount(); r++) {
            let row = questionsTable.getRow(r);
            quizQuestions.push({
                q: row.get('Question'),
                A: row.get('OptionA'),
                B: row.get('OptionB'),
                C: row.get('OptionC'),
                D: row.get('OptionD'),
                correct: (row.get('CorrectOption') || '').trim().toUpperCase()
            });
        }
    }

    // 設定所有介面元素
    setupSideMenu();
    setupRoundButtonAndModal();
    setupUnitOneModal(); // 新增設定「第一單元作品」介面的函數
    setupUnitTwoModal(); // 新增「作品二」介面
    setupUnitThreeModal(); // 新增「作品三」介面
    setupUnitFourModal(); // 新增：作品四介面

    // 預設隱藏所有模態介面
    unitOneModal.hide();
    unitTwoModal.hide();
    unitThreeModal.hide();
    unitFourModal.hide();
    modalInterface.hide();
}

/**
 * 根據畫布大小計算圓形按鈕的精確位置
 */
function getRoundButtonPosition(btnSize) {
    // 最小圈 (i=0.4) 的中心點計算邏輯
    const i_min = 0.4; 
    let centerX = width / 2 + i_min - 10;
    let centerY = height / 2 - 10;
    
    // 按鈕的實際定位點
    let posX = centerX - btnSize / 2;
    let posY = centerY - btnSize / 2;
    
    return { x: posX, y: posY };
}

// ===================================
// 1. 設定 左側選單 (Side Menu)
// ===================================
function setupSideMenu() {
    sideMenu = createDiv();
    sideMenu.style('position', 'absolute');
    sideMenu.style('top', '0');
    sideMenu.style('left', '0');
    sideMenu.style('width', '180px'); // 固定寬度
    sideMenu.style('height', '100%');
    sideMenu.style('background-color', 'rgba(51, 51, 51, 0.9)'); // 深色半透明背景
    sideMenu.style('padding', '15px');
    sideMenu.style('color', '#fff');
    sideMenu.style('z-index', '99'); // 略低於模態視窗
    // 加上平滑轉換，便於收合動畫
    sideMenu.elt.style.transition = 'transform 0.22s ease';

    // 漢堡按鈕（固定在左上方，始終可見）
    hamburgerBtn = createButton('☰');
    hamburgerBtn.style('position', 'absolute');
    hamburgerBtn.style('top', '10px');
    hamburgerBtn.style('left', '10px');
    hamburgerBtn.style('width', '36px');
    hamburgerBtn.style('height', '36px');
    hamburgerBtn.style('font-size', '20px');
    hamburgerBtn.style('line-height', '36px');
    hamburgerBtn.style('background', 'rgba(0,0,0,0.5)');
    hamburgerBtn.style('color', '#fff');
    hamburgerBtn.style('border', 'none');
    hamburgerBtn.style('border-radius', '6px');
    hamburgerBtn.style('z-index', '110');
    hamburgerBtn.style('cursor', 'pointer');
    hamburgerBtn.mousePressed(toggleSideMenu);

    // 將標題下移，避免與漢堡重疊
    let menuTitle = createElement('h4', '414730118專案選單');
    menuTitle.style('margin-top', '48px'); // 可調整數值
    menuTitle.style('margin-bottom', '12px');
    sideMenu.child(menuTitle);
    
    // 第一個按鈕：第一單元作品（改為直接在新分頁開啟）
    unitOneButton = createButton('作品一:泡泡爆破');
    unitOneButton.style('width', '100%');
    unitOneButton.style('margin-bottom', '10px');
    unitOneButton.style('padding', '10px');
    unitOneButton.style('background-color', '#1B3C53');
    unitOneButton.style('color', '#fff');
    unitOneButton.style('border', 'none');
    unitOneButton.style('cursor', 'pointer');
    unitOneButton.mousePressed(function(){
        // 直接在新分頁打開您提供的泡泡爆破網址
        window.open('https://22kzcc.github.io/20251014kzcc/', '_blank');
    });
    sideMenu.child(unitOneButton);
    
    // 第二個按鈕：作品二 - 作業筆記（新分頁）
    unitTwoButton = createButton('作品二:作業筆記');
    unitTwoButton.style('width', '100%');
    unitTwoButton.style('margin-bottom', '10px');
    unitTwoButton.style('padding', '10px');
    unitTwoButton.style('background-color', '#234C6A');
    unitTwoButton.style('color', '#fff');
    unitTwoButton.style('border', 'none');
    unitTwoButton.style('cursor', 'pointer');
    // 改為直接在新分頁打開 HackMD
    unitTwoButton.mousePressed(function(){
        window.open('https://hackmd.io/@HHtozuwiRZinSfbWorfvGA/r1ikF_Jhgx', '_blank');
    });
    sideMenu.child(unitTwoButton);

    // 第三個按鈕：作品三 - 測驗
    unitThreeButton = createButton('作品三:測驗');
    unitThreeButton.style('width', '100%');
    unitThreeButton.style('margin-bottom', '10px');
    unitThreeButton.style('padding', '10px');
    unitThreeButton.style('background-color', '#456882');
    unitThreeButton.style('color', '#fff');
    unitThreeButton.style('border', 'none');
    unitThreeButton.style('cursor', 'pointer');
    unitThreeButton.mousePressed(showUnitThreeModal);
    sideMenu.child(unitThreeButton);

    // 新增：第四個按鈕：作品四 - 自我介紹
    unitFourButton = createButton('作品四:自我介紹');
    unitFourButton.style('width', '100%');
    unitFourButton.style('margin-bottom', '10px');
    unitFourButton.style('padding', '10px');
    unitFourButton.style('background-color', '#6e9fc2df');
    unitFourButton.style('color', '#fff');
    unitFourButton.style('border', 'none');
    unitFourButton.style('cursor', 'pointer');
    unitFourButton.mousePressed(showUnitFourModal);
    sideMenu.child(unitFourButton);
    
    // 新增：第五個按鈕：作品五 - 期中筆記
    unitFiveButton = createButton('作品五:期中筆記');
    unitFiveButton.style('width', '100%');
    unitFiveButton.style('margin-bottom', '10px');
    unitFiveButton.style('padding', '10px');
    unitFiveButton.style('background-color', '#ff7f50');
    unitFiveButton.style('color', '#fff');
    unitFiveButton.style('border', 'none');
    unitFiveButton.style('cursor', 'pointer');
    // 點擊後直接在新分頁開啟指定 HackMD 網址
    unitFiveButton.mousePressed(function(){
        window.open('https://hackmd.io/@HHtozuwiRZinSfbWorfvGA/B1jnoFyx-x');
    });
    sideMenu.child(unitFiveButton);
    
    // 可以在這裡加入更多按鈕...
    // sideMenu.child(createButton('第二單元作品').style('width', '100%').style('padding', '10px'));
}

// ===================================
// 2. 設定 中央圓形按鈕 (資訊介面)
// (沿用上次的邏輯，但為了程式碼清晰度，拆分成獨立函數)
// ===================================
function setupRoundButtonAndModal() {
    // 圓形按鈕
    roundButton = createButton('TKU'); 
    const btnSize = 60; 
    // 調整：字體縮小並使用 flex 置中文字，移除內邊距以確保文字精確置中
    roundButton.style('width', `${btnSize}px`);
    roundButton.style('height', `${btnSize}px`);
    roundButton.style('font-size', '18px'); // 字體變小
    roundButton.style('line-height', `${btnSize}px`);
    roundButton.style('display', 'flex');
    roundButton.style('color', '#b91539af');
    roundButton.style('align-items', 'center');
    roundButton.style('justify-content', 'center');
    roundButton.style('padding', '0');
    roundButton.style('background-color', 'rgba(214, 209, 209, 0.9)');
    roundButton.style('border', '3px solid #b3aeaeff');
    roundButton.style('border-radius', '50%'); 
    roundButton.style('cursor', 'pointer');
    // 點擊 TKU 直接在新分頁開啟淡江大學官網
    roundButton.mousePressed(function(){
        window.open('https://www.tku.edu.tw/','_blank');
    });
    
    const pos = getRoundButtonPosition(btnSize);
    roundButton.position(pos.x, pos.y);

    // 模態介面容器 (沿用上次的 modalInterface 變數來作為資訊介面)
    modalInterface = createDiv();
    modalInterface.style('position', 'absolute');
    modalInterface.style('top', '0');
    modalInterface.style('left', '0');
    modalInterface.style('width', '100%');
    modalInterface.style('height', '100%');
    modalInterface.style('background-color', 'rgba(245, 201, 230, 0.95)'); 
    modalInterface.style('z-index', '100'); 
    
    let contentDiv = createDiv();
    contentDiv.style('width', '350px'); 
    contentDiv.style('margin', '200px auto'); 
    contentDiv.style('background-color', '#fff'); 
    contentDiv.style('padding', '30px');
    contentDiv.style('border-radius', '15px');
    contentDiv.style('text-align', 'center');
    modalInterface.child(contentDiv);

    // 「嗨!我是邱禾葳」訊息
    let message = createElement('h1', '淡江大學網站');
    message.style('color', '#05463bff');
    contentDiv.child(message);

    // 退出按鈕
    exitModalButton = createButton('X 關閉');
    exitModalButton.style('background-color', '#004d40');
    exitModalButton.style('color', '#fff');
    exitModalButton.style('border', 'none');
    exitModalButton.style('padding', '10px 20px');
    exitModalButton.style('border-radius', '5px');
    exitModalButton.style('cursor', 'pointer');
    exitModalButton.style('margin-top', '20px');
    exitModalButton.mousePressed(hideModal);
    contentDiv.child(exitModalButton); 
}

// ===================================
// 3. 設定 「第一單元作品」介面
// ===================================
function setupUnitOneModal() {
    unitOneModal = createDiv();
    unitOneModal.style('position', 'absolute');
    unitOneModal.style('top', '0');
    unitOneModal.style('left', '0');
    unitOneModal.style('width', '100%');
    unitOneModal.style('height', '100%');
    unitOneModal.style('background-color', 'rgba(255, 50, 50, 0.95)');
    unitOneModal.style('z-index', '100');

    // 內容區域（調整為可嵌入 iframe）
    let contentDiv = createDiv();
    contentDiv.style('width', '80%');
    contentDiv.style('height', '80%');
    contentDiv.style('margin', '5% auto');
    contentDiv.style('background-color', '#fff');
    contentDiv.style('padding', '16px');
    contentDiv.style('border-radius', '10px');
    contentDiv.style('overflow', 'hidden');
    unitOneModal.child(contentDiv);

    // 標題與說明
    contentDiv.child(createElement('h1', '第一單元作品：泡泡爆破'));
    contentDiv.child(createP('以下內嵌您的作品。若瀏覽器限制無法顯示，可以按「在新分頁打開」。'));

    // iframe 容器：嵌入您的作品網址
    let iframeWrapper = createDiv();
    iframeWrapper.elt.innerHTML = '<iframe src="https://22kzcc.github.io/20251014kzcc/" style="width:100%;height:100%;border:0;" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>';
    // 設定高度（可依需要調整）
    iframeWrapper.style('width', '100%');
    iframeWrapper.style('height', 'calc(100% - 140px)');
    iframeWrapper.parent(contentDiv);

    // 在新分頁打開按鈕（備援）
    let openBtn = createButton('在新分頁打開泡泡爆破');
    openBtn.style('display', 'inline-block');
    openBtn.style('margin', '12px 8px 0 8px');
    openBtn.style('padding', '8px 12px');
    openBtn.style('background-color', '#0066cc');
    openBtn.style('color', '#fff');
    openBtn.style('border', 'none');
    openBtn.style('cursor', 'pointer');
    openBtn.mousePressed(function(){
        window.open('https://22kzcc.github.io/20251014kzcc/', '_blank');
    });
    contentDiv.child(openBtn);

    // 退出按鈕
    exitUnitOneButton = createButton('⬅️ 退出選單');
    exitUnitOneButton.style('background-color', '#333');
    exitUnitOneButton.style('color', '#fff');
    exitUnitOneButton.style('padding', '10px 20px');
    exitUnitOneButton.style('border', 'none');
    exitUnitOneButton.style('cursor', 'pointer');
    exitUnitOneButton.style('float', 'right');
    exitUnitOneButton.mousePressed(hideUnitOneModal);
    contentDiv.child(exitUnitOneButton);
}

// ===================================
// 新增：設定 「作品二: 作業筆記」介面
// ===================================
function setupUnitTwoModal() {
    unitTwoModal = createDiv();
    unitTwoModal.style('position', 'absolute');
    unitTwoModal.style('top', '0');
    unitTwoModal.style('left', '0');
    unitTwoModal.style('width', '100%');
    unitTwoModal.style('height', '100%');
    unitTwoModal.style('background-color', 'rgba(0, 123, 255, 0.12)'); 
    unitTwoModal.style('z-index', '100'); 

    let contentDiv = createDiv();
    contentDiv.style('width', '60%');
    contentDiv.style('height', '70%');
    contentDiv.style('margin', '8% auto');
    contentDiv.style('background-color', '#fff');
    contentDiv.style('padding', '30px');
    contentDiv.style('border-radius', '10px');
    unitTwoModal.child(contentDiv);

    contentDiv.child(createElement('h1', '作品二：作業筆記'));
    contentDiv.child(createP('這裡可以放置作業筆記、Markdown 或連結。'));

    exitUnitTwoButton = createButton('⬅️ 返回選單');
    exitUnitTwoButton.style('background-color', '#333');
    exitUnitTwoButton.style('color', '#fff');
    exitUnitTwoButton.style('padding', '10px 20px');
    exitUnitTwoButton.style('border', 'none');
    exitUnitTwoButton.style('cursor', 'pointer');
    exitUnitTwoButton.mousePressed(hideUnitTwoModal);
    contentDiv.child(exitUnitTwoButton);
}

// ===================================
// 新增：設定 「作品三: 測驗」介面（加入 CSV 題庫與互動）
// ===================================
function setupUnitThreeModal() {
    unitThreeModal = createDiv();
    unitThreeModal.style('position', 'absolute');
    unitThreeModal.style('top', '0');
    unitThreeModal.style('left', '0');
    unitThreeModal.style('width', '100%');
    unitThreeModal.style('height', '100%');
    unitThreeModal.style('background-color', 'rgba(255, 193, 7, 0.12)'); 
    unitThreeModal.style('z-index', '100'); 

    unitThreeContentDiv = createDiv();
    unitThreeContentDiv.style('width', '60%');
    unitThreeContentDiv.style('height', '70%');
    unitThreeContentDiv.style('margin', '8% auto');
    unitThreeContentDiv.style('background-color', '#fff');
    unitThreeContentDiv.style('padding', '30px');
    unitThreeContentDiv.style('border-radius', '10px');
    unitThreeModal.child(unitThreeContentDiv);

    unitThreeContentDiv.child(createElement('h1', '作品三：測驗'));
    unitThreeContentDiv.child(createP('共有十題，一題為十分。'));

    // 建立 quiz UI 元件
    questionEl = createElement('h2', '');
    questionEl.parent(unitThreeContentDiv);

    // 建立選項按鈕 A~D
    const letters = ['A','B','C','D'];
    optionButtons = [];
    for (let i = 0; i < 4; i++) {
        let btn = createButton('');
        btn.style('display', 'block');
        btn.style('width', '80%');
        btn.style('margin', '8px auto');
        btn.style('padding', '10px');
        btn.style('cursor', 'pointer');
        // 使用立即函式保留當前 letter
        (function(letter){
            btn.mousePressed(function(){
                checkQuizAnswer(letter);
            });
        })(letters[i]);
        btn.parent(unitThreeContentDiv);
        optionButtons.push(btn);
    }

    feedbackEl = createP('');
    feedbackEl.parent(unitThreeContentDiv);

    nextQButton = createButton('下一題');
    nextQButton.style('background-color', '#0066cc');
    nextQButton.style('color', '#fff');
    nextQButton.style('padding', '8px 16px');
    nextQButton.style('border', 'none');
    nextQButton.style('cursor', 'pointer');
    nextQButton.mousePressed(nextQuizQuestion);
    nextQButton.parent(unitThreeContentDiv);
    nextQButton.hide();

    restartButton = createButton('重新開始測驗');
    restartButton.style('background-color', '#444');
    restartButton.style('color', '#fff');
    restartButton.style('padding', '8px 16px');
    restartButton.style('border', 'none');
    restartButton.style('cursor', 'pointer');
    restartButton.mousePressed(resetQuiz);
    restartButton.parent(unitThreeContentDiv);
    restartButton.hide();

    exitUnitThreeButton = createButton('⬅️ 返回選單');
    exitUnitThreeButton.style('background-color', '#333');
    exitUnitThreeButton.style('color', '#fff');
    exitUnitThreeButton.style('padding', '10px 20px');
    exitUnitThreeButton.style('border', 'none');
    exitUnitThreeButton.style('cursor', 'pointer');
    exitUnitThreeButton.mousePressed(hideUnitThreeModal);
    unitThreeContentDiv.child(exitUnitThreeButton);

    // 顯示第一題（若有題庫）
    resetQuiz();
}

// 檢查答案
function checkQuizAnswer(letter) {
    if (!quizQuestions || quizQuestions.length === 0) return;
    // 停用按鈕
    optionButtons.forEach(b => b.attribute('disabled', true));
    let current = quizQuestions[quizIndex];
    let isCorrect = (letter === current.correct);
    if (isCorrect) {
        quizScore++;
        feedbackEl.html('回答正確 ✅');
        feedbackEl.style('color', 'green');
    } else {
        feedbackEl.html('回答錯誤 ❌，正確答案：' + current.correct);
        feedbackEl.style('color', 'red');
    }
    nextQButton.show();
    // 如果已經是最後一題，改為顯示「查看結果」
    if (quizIndex >= quizQuestions.length - 1) {
        nextQButton.html('查看結果');
    } else {
        nextQButton.html('下一題');
    }
}

// 下一題或顯示結果
function nextQuizQuestion() {
    if (quizIndex >= quizQuestions.length - 1) {
        // 顯示結果
        unitThreeContentDiv.html(''); // 清空內容區
        unitThreeContentDiv.child(createElement('h1', '測驗結果'));
        unitThreeContentDiv.child(createP('總題數：' + quizQuestions.length));
        unitThreeContentDiv.child(createP('正確數：' + quizScore));
        unitThreeContentDiv.child(createP('得分：' + Math.round((quizScore / quizQuestions.length) * 100) + '%'));
        restartButton.show();
        unitThreeContentDiv.child(restartButton);
        unitThreeContentDiv.child(exitUnitThreeButton);
    } else {
        quizIndex++;
        showQuizQuestion();
    }
}

// 顯示題目
function showQuizQuestion() {
    if (!quizQuestions || quizQuestions.length === 0) {
        questionEl.html('沒有題庫資料（請確認 questions.csv 是否存在且格式正確）');
        optionButtons.forEach(b => b.hide());
        nextQButton.hide();
        return;
    }
    let current = quizQuestions[quizIndex];
    questionEl.html((quizIndex + 1) + '. ' + current.q);
    optionButtons[0].html('A. ' + current.A).show().removeAttribute('disabled');
    optionButtons[1].html('B. ' + current.B).show().removeAttribute('disabled');
    optionButtons[2].html('C. ' + current.C).show().removeAttribute('disabled');
    optionButtons[3].html('D. ' + current.D).show().removeAttribute('disabled');
    feedbackEl.html('');
    nextQButton.hide();
    restartButton.hide();
}

// 重新開始
function resetQuiz() {
    quizIndex = 0;
    quizScore = 0;
    if (!unitThreeContentDiv) return;

    // 清空內容並重新建立完整的 Quiz UI（確保 restart 能正確重新啟動）
    unitThreeContentDiv.html('');
    unitThreeContentDiv.child(createElement('h1', '作品三：測驗'));
    unitThreeContentDiv.child(createP('共有十題，一題為十分。'));

    // 題目元素
    questionEl = createElement('h2', '');
    unitThreeContentDiv.child(questionEl);

    // 建立選項按鈕 A~D
    optionButtons = [];
    const letters = ['A','B','C','D'];
    for (let i = 0; i < 4; i++) {
        let btn = createButton('');
        btn.style('display', 'block');
        btn.style('width', '80%');
        btn.style('margin', '8px auto');
        btn.style('padding', '10px');
        btn.style('cursor', 'pointer');
        (function(letter){
            btn.mousePressed(function(){
                checkQuizAnswer(letter);
            });
        })(letters[i]);
        unitThreeContentDiv.child(btn);
        optionButtons.push(btn);
    }

    // 回饋與控制按鈕
    feedbackEl = createP('');
    unitThreeContentDiv.child(feedbackEl);

    nextQButton = createButton('下一題');
    nextQButton.style('background-color', '#0066cc');
    nextQButton.style('color', '#fff');
    nextQButton.style('padding', '8px 16px');
    nextQButton.style('border', 'none');
    nextQButton.style('cursor', 'pointer');
    nextQButton.mousePressed(nextQuizQuestion);
    nextQButton.parent(unitThreeContentDiv);
    nextQButton.hide();

    restartButton = createButton('重新開始測驗');
    restartButton.style('background-color', '#444');
    restartButton.style('color', '#fff');
    restartButton.style('padding', '8px 16px');
    restartButton.style('border', 'none');
    restartButton.style('cursor', 'pointer');
    restartButton.mousePressed(resetQuiz);
    restartButton.parent(unitThreeContentDiv);
    restartButton.hide();

    exitUnitThreeButton = createButton('⬅️ 返回選單');
    exitUnitThreeButton.style('background-color', '#333');
    exitUnitThreeButton.style('color', '#fff');
    exitUnitThreeButton.style('padding', '10px 20px');
    exitUnitThreeButton.style('border', 'none');
    exitUnitThreeButton.style('cursor', 'pointer');
    exitUnitThreeButton.mousePressed(hideUnitThreeModal);
    unitThreeContentDiv.child(exitUnitThreeButton);

    // 顯示第一題
    showQuizQuestion();
}

// ===================================
// 顯示/隱藏 邏輯
// ===================================

// 顯示資訊介面 (i 按鈕點擊)
function showModal() {
    modalInterface.show();
    roundButton.hide();
    noLoop(); 
}

// 隱藏資訊介面 (i 按鈕點擊)
function hideModal() {
    modalInterface.hide();
    roundButton.show();
    loop(); 
}

// 顯示「第一單元作品」介面 (側邊選單按鈕點擊)
function showUnitOneModal() {
    // 隱藏其他可能開啟的介面
    modalInterface.hide(); 
    roundButton.hide(); // 隱藏中央按鈕
    
    unitOneModal.show();
    unitTwoModal.hide();
    unitThreeModal.hide();
    noLoop(); 
}

// 隱藏「第一單元作品」介面
function hideUnitOneModal() {
    unitOneModal.hide();
    roundButton.show(); // 恢復中央按鈕
    loop(); 
}

// 顯示 / 隱藏 作品二
function showUnitTwoModal() {
    modalInterface.hide();
    roundButton.hide();
    unitTwoModal.show();
    unitOneModal.hide();
    unitThreeModal.hide();
    noLoop();
}
function hideUnitTwoModal() {
    unitTwoModal.hide();
    roundButton.show();
    loop();
}

// 顯示 / 隱藏 作品三
function showUnitThreeModal() {
    modalInterface.hide();
    roundButton.hide();
    unitThreeModal.show();
    unitOneModal.hide();
    unitTwoModal.hide();
    // 顯示題目
    resetQuiz();
    noLoop();
}
function hideUnitThreeModal() {
    unitThreeModal.hide();
    roundButton.show();
    loop();
}

// 新增：設定 「作品四: 自我介紹」介面
function setupUnitFourModal() {
    unitFourModal = createDiv();
    unitFourModal.style('position', 'absolute');
    unitFourModal.style('top', '0');
    unitFourModal.style('left', '0');
    unitFourModal.style('width', '100%');
    unitFourModal.style('height', '100%');
    unitFourModal.style('background-color', 'rgba(0,0,0,0.6)');
    unitFourModal.style('z-index', '200');

    let contentDiv = createDiv();
    contentDiv.style('width', '520px');
    contentDiv.style('margin', '6% auto');
    contentDiv.style('background-color', '#fff');
    contentDiv.style('padding', '24px');
    contentDiv.style('border-radius', '10px');
    contentDiv.style('text-align', 'left');
    unitFourModal.child(contentDiv);

    // 注入動畫樣式（只注入一次）
    if (!document.getElementById('unit-four-anim-styles')) {
        let style = document.createElement('style');
        style.id = 'unit-four-anim-styles';
        style.innerHTML = `
            @keyframes unitFourFloat {
                0% { transform: translateY(0); color: #333; }
                50% { transform: translateY(-6px); color: #b91539af; }
                100% { transform: translateY(0); color: #333; }
            }
            @keyframes unitFourFadeInUp {
                0% { opacity: 0; transform: translateY(8px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .unit-four-float {
                animation: unitFourFloat 2.6s ease-in-out infinite;
            }
            .unit-four-fade {
                opacity: 0;
                animation: unitFourFadeInUp 0.6s ease forwards;
            }
        `;
        document.head.appendChild(style);
    }

    // 標題（帶浮動動畫）
    let titleEl = createElement('h2', '作品四 — 自我介紹');
    titleEl.elt.classList.add('unit-four-float');
    contentDiv.child(titleEl);

    // 說明（淡入）
    let desc = createP('以下是我的Ai生成照片與自我介紹：');
    desc.elt.classList.add('unit-four-fade');
    desc.style('animation-delay', '0.08s');
    contentDiv.child(desc);

    // 顯示照片與自我介紹文字（請將 me.jpeg 放在同一資料夾）
    let profileImg = createImg('me.jpeg');
    profileImg.style('width', '220px');
    profileImg.style('height', 'auto');
    profileImg.style('display', 'block');
    profileImg.style('margin', '12px 0');
    // 圖片也淡入
    profileImg.elt.classList.add('unit-four-fade');
    profileImg.style('animation-delay', '0.18s');
    contentDiv.child(profileImg);

    let idP = createP('學號: 414730118');
    idP.elt.classList.add('unit-four-fade');
    idP.style('animation-delay', '0.28s');
    contentDiv.child(idP);

    let nameP = createP('姓名: 邱禾葳');
    nameP.elt.classList.add('unit-four-fade');
    nameP.style('animation-delay', '0.36s');
    contentDiv.child(nameP);

    // 退出按鈕
    exitUnitFourButton = createButton('⬅️ 返回選單');
    exitUnitFourButton.style('background-color', '#333');
    exitUnitFourButton.style('color', '#fff');
    exitUnitFourButton.style('padding', '8px 14px');
    exitUnitFourButton.style('border', 'none');
    exitUnitFourButton.style('cursor', 'pointer');
    exitUnitFourButton.mousePressed(hideUnitFourModal);
    // 按鈕也淡入
    exitUnitFourButton.elt.classList.add('unit-four-fade');
    exitUnitFourButton.style('animation-delay', '0.44s');
    contentDiv.child(exitUnitFourButton);
}

// 顯示/隱藏作品四
function showUnitFourModal() {
    if (!unitFourModal) setupUnitFourModal();
    unitFourModal.show();
}

function hideUnitFourModal() {
    if (unitFourModal) unitFourModal.hide();
}

// 新增：作品五模態設定
function setupUnitFiveModal() {
    unitFiveModal = createDiv();
    unitFiveModal.style('position', 'absolute');
    unitFiveModal.style('top', '0');
    unitFiveModal.style('left', '0');
    unitFiveModal.style('width', '100%');
    unitFiveModal.style('height', '100%');
    unitFiveModal.style('background-color', 'rgba(0,0,0,0.6)');
    unitFiveModal.style('z-index', '200');

    let contentDiv = createDiv();
    contentDiv.style('width', '520px');
    contentDiv.style('margin', '6% auto');
    contentDiv.style('background-color', '#fff');
    contentDiv.style('padding', '24px');
    contentDiv.style('border-radius', '10px');
    contentDiv.style('text-align', 'left');
    unitFiveModal.child(contentDiv);

    contentDiv.child(createElement('h2', '作品五 — 期中筆記'));
    contentDiv.child(createP('在這裡放期中筆記的內容、連結或檔案。'));

    // 退出按鈕
    exitUnitFiveButton = createButton('⬅️ 返回選單');
    exitUnitFiveButton.style('background-color', '#333');
    exitUnitFiveButton.style('color', '#fff');
    exitUnitFiveButton.style('padding', '8px 14px');
    exitUnitFiveButton.style('border', 'none');
    exitUnitFiveButton.style('cursor', 'pointer');
    exitUnitFiveButton.mousePressed(hideUnitFiveModal);
    contentDiv.child(exitUnitFiveButton);
}

// 顯示/隱藏 作品五
function showUnitFiveModal() {
    if (!unitFiveModal) setupUnitFiveModal();
    // 隱藏漢堡與其他介面，避免遮擋
    hideHamburger && hideHamburger();
    roundButton && roundButton.hide && roundButton.hide();
    unitFiveModal.show();
    noLoop && noLoop();
}

function hideUnitFiveModal() {
    if (unitFiveModal) unitFiveModal.hide();
    showHamburger && showHamburger();
    roundButton && roundButton.show && roundButton.show();
    loop && loop();
}

// 漢堡按鈕：切換側選單收合
function toggleSideMenu() {
    if (!sideMenu) return;
    sideMenuVisible = !sideMenuVisible;
    if (sideMenuVisible) {
        sideMenu.style('transform', 'translateX(0)');
        hamburgerBtn.html('☰');
    } else {
        // 向左隱藏一整個選單寬度
        sideMenu.style('transform', 'translateX(-180px)');
        hamburgerBtn.html('✕');
    }
}

function draw() {
    // 繪圖程式碼保持不變
    randomSeed(seed); 
    let cc = color(random(palette));
    background(cc || 255);
    let x = width / 2;
    let y = height / 2;
    for (let i = 0.4; i < 50; i += 0.4) { 
        noiseCircle(x, y, i);
    }
}

function noiseCircle(x, y, i) {
    let sc = color(random(paletteSc));
    push();
    stroke(sc);
    noFill();
    let rBase = pow(i, 2) / 10;
    let xInit = (x + i)-10; 
    let yInit = y - 10;

    let md = dist(mouseX, mouseY, width/2, height/2);
    let maxd = dist(0, 0, width/2, height/2);
    let spread = map(md, 0, maxd, 1, 4);
    
    let rDiv = width * offset * spread; 

    beginShape();
    for (let i = 0, points = 36, radian; i < points + 3; radian = i++/points) {
        let pN = noise(xInit + (rBase) * cos(TAU*radian) * (0.02), yInit + (rBase) * sin(TAU*radian) * 0.05+t); 
        let pR = (rBase) + rDiv * noise(pN);
        let pX = xInit + pR * cos(TAU*radian);
        let pY = yInit + pR * sin(TAU*radian);
        curveVertex(pX, pY);
    }
    endShape(CLOSE);

    pop();
    t+=speed; 
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 窗口大小改變時，重新計算圓形按鈕的位置
    const btnSize = 60;
    const pos = getRoundButtonPosition(btnSize);
    roundButton.position(pos.x, pos.y);
    // 側邊選單會自動伸縮，無需調整位置
}