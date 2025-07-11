// Firebase config (แก้ไขให้ตรงกับโปรเจกต์ของคุณ)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ตัวแปรเก็บข้อมูล
let records = [];
let deposits = 0;
let withdrawals = 0;

const itemsPerPage = 5;
let currentPage = 1;

// elements
const loginPage = document.getElementById("loginPage");
const appContainer = document.getElementById("appContainer");
const loginError = document.getElementById("loginError");

auth.onAuthStateChanged(user => {
  if (user) {
    loginPage.style.display = "none";
    appContainer.style.display = "flex";
    showPage("deposit");
    updateSummary();
    renderPagination();
    renderList();
    setupPieChart();
  } else {
    loginPage.style.display = "block";
    appContainer.style.display = "none";
  }
});

// Login
function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  loginError.textContent = "";
  if (!email || !password) {
    loginError.textContent = "กรุณากรอกอีเมลและรหัสผ่าน";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      loginError.textContent = error.message;
    });
}

// Register
function register() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  loginError.textContent = "";
  if (!email || !password) {
    loginError.textContent = "กรุณากรอกอีเมลและรหัสผ่าน";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      loginError.style.color = "#4caf50";
      loginError.textContent = "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ";
    })
    .catch(error => {
      loginError.style.color = "#f44336";
      loginError.textContent = error.message;
    });
}

// Logout
function logout() {
  auth.signOut();
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(div => {
    div.classList.remove("active");
  });
  document.getElementById(page).classList.add("active");
  currentPage = 1;
  if (page === "all") {
    renderList();
    renderPagination();
  }
  if (page === "summary") {
    updateSummary();
  }
}

function deposit() {
  const input = document.getElementById("depositInput");
  let amount = parseFloat(input.value);
  if (isNaN(amount) || amount <= 0) {
    alert("กรุณาใส่จำนวนเงินเติมที่ถูกต้อง");
    return;
  }
  deposits += amount;
  records.unshift({
    type: "deposit",
    date: new Date().toISOString().slice(0,10),
    description: "เติมเงิน",
    amount: amount,
  });
  input.value = "";
  renderList();
  renderPagination();
  updateSummary();
  alert("เติมเงินเรียบร้อย");
}

function withdraw() {
  const input = document.getElementById("withdrawInput");
  let amount = parseFloat(input.value);
  if (isNaN(amount) || amount <= 0) {
    alert("กรุณาใส่จำนวนเงินถอนที่ถูกต้อง");
    return;
  }
  withdrawals += amount;
  records.unshift({
    type: "withdraw",
    date: new Date().toISOString().slice(0,10),
    description: "ถอนเงิน",
    amount: amount,
  });
  input.value = "";
  renderList();
  renderPagination();
  updateSummary();
  alert("ถอนเงินเรียบร้อย");
}

function placeBet() {
  const date = document.getElementById("betDate").value;
  const team = document.getElementById("betTeam").value.trim();
  const odd = parseFloat(document.getElementById("betOdd").value);
  const amount = parseFloat(document.getElementById("betAmount").value);

  if (!date || !team || isNaN(odd) || odd <= 0 || isNaN(amount) || amount <= 0) {
    alert("กรุณากรอกข้อมูลเดิมพันให้ครบถ้วนและถูกต้อง");
    return;
  }

  records.unshift({
    type: "bet",
    date,
    description: team,
    odd,
    amount,
    status: "รอผล",
  });

  document.getElementById("betDate").value = "";
  document.getElementById("betTeam").value = "";
  document.getElementById("betOdd").value = "";
  document.getElementById("betAmount").value = "";

  renderList();
  renderPagination();
  updateSummary();
  alert("เพิ่มเดิมพันเรียบร้อย");
}

function changeStatus(index, selectElem) {
  records[index].status = selectElem.value;
  updateSummary();
  renderList();
}

function renderList() {
  const listEl = document.getElementById("list");
  listEl.innerHTML = "";

  const startIndex = (currentPage -1) * itemsPerPage;
  const pageItems = records.slice(startIndex, startIndex + itemsPerPage);

  pageItems.forEach((item, i) => {
    const globalIndex = startIndex + i;
    const li = document.createElement("li");
    let content = `<strong>${item.date}</strong> - `;

    if (item.type === "deposit") {
      content += `<span style="color:#4caf50;">[เติมเงิน]</span> ${item.description} จำนวน: ${item.amount.toFixed(2)} บาท`;
      li.innerHTML = content;
    } else if (item.type === "withdraw") {
      content += `<span style="color:#f44336;">[ถอนเงิน]</span> ${item.description} จำนวน: ${item.amount.toFixed(2)} บาท`;
      li.innerHTML = content;
    } else if (item.type === "bet") {
      content += `[เดิมพัน] ทีม: ${item.description}, ค่าน้ำ: ${item.odd.toFixed(2)}, เดิมพัน: ${item.amount.toFixed(2)} บาท, สถานะ: `;
      const select = document.createElement("select");
      ["รอผล", "ชนะ", "แพ้"].forEach(statusOption => {
        const option = document.createElement("option");
        option.value = statusOption;
        option.textContent = statusOption;
        if (statusOption === item.status) option.selected = true;
        select.appendChild(option);
        select.classList.add("status-select");
        if (item.status === "ชนะ") {
          select.style.backgroundColor = "#336600";
        } else if (item.status === "แพ้") {
          select.style.backgroundColor = "#990000";
        } else {
          select.style.backgroundColor = "#FFD700";
        }
      });
      select.onchange = () => changeStatus(globalIndex, select);
      li.innerHTML = content;
      li.appendChild(select);
    }

    // ปุ่มลบรายการ
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "ลบ";
    deleteBtn.style.backgroundColor = "#f44336";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "5px";
    deleteBtn.style.padding = "5px 10px";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.onclick = () => {
      if (confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) {
        records.splice(globalIndex, 1);
        renderList();
        renderPagination();
        updateSummary();
      }
    };
    li.appendChild(deleteBtn);

    listEl.appendChild(li);
  });
}

function renderPagination() {
  const controls = document.getElementById("paginationControls");
  controls.innerHTML = "";
  const totalPages = Math.ceil(records.length / itemsPerPage);
  if (totalPages <= 1) return;

  for(let i=1; i<=totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.textDecoration = "underline";
    btn.onclick = () => {
      currentPage = i;
      renderList();
      renderPagination();
    }
    controls.appendChild(btn);
  }
}

function updateSummary() {
  let totalBetAmount = 0;
  let totalWinWithCapital = 0;
  let realWinProfit = 0;
  let totalLose = 0;
  let totalBetUsed = 0;

  records.forEach(r => {
    if (r.type === "bet") {
      totalBetAmount += r.amount;
      if (r.status === "ชนะ") {
        totalWinWithCapital += r.amount * r.odd;
        realWinProfit += r.amount * (r.odd - 1);
        totalBetUsed += r.amount;
      } else if (r.status === "แพ้") {
        totalLose += r.amount;
        totalBetUsed += r.amount;
      }
    }
  });

  // หักลบขาดทุนจากกำไรก่อน
  let totalLoseShown = totalLose;
  let netProfit = realWinProfit - totalLose;
  if (netProfit >= 0) {
    totalLoseShown = 0;
  } else {
    netProfit = 0;
    totalLoseShown = totalLose - realWinProfit;
  }

  let balance = (deposits - withdrawals - totalBetUsed) + totalWinWithCapital;
  const realProfit = deposits - withdrawals;

  document.getElementById("deposited").textContent = deposits.toFixed(2);
  document.getElementById("withdrawn").textContent = withdrawals.toFixed(2);
  document.getElementById("totalAmount").textContent = totalBetAmount.toFixed(2);
  document.getElementById("winAmount").textContent = totalWinWithCapital.toFixed(2);
  document.getElementById("loseAmount").textContent = totalLoseShown.toFixed(2);
  document.getElementById("net").textContent = netProfit.toFixed(2);
  document.getElementById("realProfit").textContent = realProfit.toFixed(2);
  document.getElementById("balance").textContent = balance.toFixed(2);

  updatePieChart(netProfit, totalLoseShown);
  document.getElementById("winAmount").parentNode.style.display = "none";
}

let pieChart;
function setupPieChart() {
  if (pieChart) return; // สร้างแค่ครั้งเดียว
  const ctx = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['กำไรรวมทุน', 'ขาดทุน'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
      }
    }
  });
}

function updatePieChart(win, lose) {
  if (!pieChart) return;
  pieChart.data.datasets[0].data = [win, lose];
  pieChart.update();
}
