(function ($) {
    'use strict';
    /*==================================================================
        [ Daterangepicker ]*/
    try {
        $('.js-datepicker').daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoUpdateInput": false,
            locale: {
                format: 'DD/MM/YYYY'
            },
        });
    
        var myCalendar = $('.js-datepicker');
        var isClick = 0;
    
        $(window).on('click',function(){
            isClick = 0;
        });
    
    
        $('.js-btn-calendar').on('click',function(e){
            e.stopPropagation();
    
            if(isClick === 1) isClick = 0;
            else if(isClick === 0) isClick = 1;
    
            if (isClick === 1) {
                myCalendar.focus();
            }
        });
    
        $(myCalendar).on('click',function(e){
            e.stopPropagation();
            isClick = 1;
        });
    
        $('.daterangepicker').on('click',function(e){
            e.stopPropagation();
        });
    
    
    } catch(er) {console.log(er);}
    /*[ Select 2 Config ]
        ===========================================================*/
    
    try {
        var selectSimple = $('.js-select-simple');
    
        selectSimple.each(function () {
            var that = $(this);
            var selectBox = that.find('select');
            var selectDropdown = that.find('.select-dropdown');
            selectBox.select2({
                dropdownParent: selectDropdown
            });
        });
    
    } catch (err) {
        console.log(err);
    }
    

})(jQuery);





const needPayment = document.getElementById('paid_now');
const needPayLater= document.getElementById('paid_later');
const registerForm = document.getElementById('registerForm');
const registerSubmit = document.getElementById('registerSubmit');
const NotRegister = document.getElementById("NotRegister")
const alreadyRegistered = document.getElementById("alreadyRegistered");
const btn_edit = document.getElementById("btn_edit");
const userList = document.getElementById("userList");
const concludeBox = document.getElementById("conclude");
const ticketSelect = document.getElementById("ticketType");
const copyBtn = document.getElementById("copyBtn");
const btn_registerSubmit = document.getElementById("btn_registerSubmit");
const btn_paid = document.getElementById("btn_paid");
const inf_error = document.getElementById("inf_error");
const accountNumber = document.getElementById("accountNumber").textContent;
const fileInput = document.getElementById("paymentSlip");

let membersCache = [];
let registerCache = [];
let selectedUser = null;

/*=============================
    Supabase Config
===============================*/
const SUPABASE_URL = "https://lrkaigodgewdhncqdzpz.supabase.co";
const SUPABASE_KEY = "sb_publishable_sKcAGI3Y4nuRRoazBdGQcw_lJZILGpg";

// ชื่อตารางจริงใน Supabase (เป็นตัวพิมพ์เล็กทั้งหมด)
const TABLE_MEMBERS  = "memberdb";
const TABLE_REGISTER = "beyond25";

const SUPABASE_HEADERS = {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
};



/*=============================
    Initial Load
===============================*/
window.onload = async function () {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    await loadMemberList();
};


/*=============================
    โหลดรายชื่อจาก MemberDB ใส่ dropdown
===============================*/
async function loadMemberList() {
    if (!userList) return;

    try {
        userList.innerHTML = '<option disabled selected>กำลังโหลดรายชื่อ....</option>';
        console.log(registerCache)

        const data1 = await getAllMembers();
        const data2 = await getAllRegister();
        membersCache  = data1 || [];
        registerCache = data2 || [];

        // เคลียร์ options แล้วใส่ค่าใหม่
        userList.innerHTML = '<option disabled selected>เลือกรายชื่อ</option>';

        membersCache.forEach(mb => {
            if (!mb.nickname || !mb.fullname) return;
            const opt = document.createElement("option");
            opt.value = `${mb.nickname} | ${mb.fullname}`;
            opt.textContent = `${mb.nickname} | ${mb.fullname}`;
            userList.appendChild(opt);
        });

        const notFoundOption = document.createElement("option");
        notFoundOption.value = "NOT_FOUND";
        notFoundOption.textContent = "❌ ไม่พบรายชื่อของฉัน";
        userList.appendChild(notFoundOption);

        $("#userList").trigger("change.select2");

    } catch (error) {
        console.error("❌ โหลดรายชื่อจาก MemberDB ไม่สำเร็จ:", error);
        userList.innerHTML = '<option disabled selected>โหลดรายชื่อไม่สำเร็จ</option>';
    }
}



async function getAllMembers() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_MEMBERS}?select=*`,
        { headers: SUPABASE_HEADERS }
    );

    if (!res.ok) {
        throw new Error("Supabase select MemberDB failed");
    }

    return await res.json();
}

async function getAllRegister() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}?select=*`,
        { headers: SUPABASE_HEADERS }
    );

    if (!res.ok) {
        throw new Error("Supabase select Beyond25 failed");
    }

    const data = await res.json();

    return data;
}

//---------------------------
//Function WhenStart Hidden 
//---------------------------
window.addEventListener("DOMContentLoaded", function () {
  const paymentForm = document.getElementById("paymentForm");
  const fullname = document.getElementById('fullname');
  const nickname = document.getElementById('nickname');
  fullname.readOnly = true;
  fullname.style.opacity = "0.4";
  nickname.readOnly = true;
  nickname.style.opacity = "0.4";
  $("#line").next(".select2-container").css("pointer-events", "none");
  $("#ticketType").next(".select2-container").css("pointer-events", "none");
  $("#line").next(".select2-container").css("opacity", "0.4");
  $("#ticketType").next(".select2-container").css("opacity", "0.4");
  
  paymentForm.style.opacity = "0.6";
  paymentForm.style.pointerEvents = "none";

  btn_registerSubmit.disabled = true;
  btn_registerSubmit.style.opacity = "0.2";

  btn_paid.disabled = true;
  btn_paid.style.opacity = "0.2";
  btn_paid.style.pointerEvents = "none";

  needPayment.disabled = true;
  needPayment.style.opacity = "0.2";
  needPayLater.disabled = true;
  needPayLater.style.opacity = "0.2";

  const allPayFields = paymentForm.querySelectorAll("input, select, textarea, button");
  allPayFields.forEach(el => {
      if (el.id !== "copyBtn") {
        el.disabled = true;
      }
    });

//Function WhenStart CheckFullInput
function checkFormComplete() {
    const fullname = document.getElementById('fullname');
    const nickname = document.getElementById('nickname');
    const line = document.getElementById('line');
    const ticketType = document.getElementById('ticketType');
    const inf_error = document.getElementById('inf_error');

    const isFullname = fullname.value.trim() !== "";
    const isNickname = nickname.value.trim() !== "";
    const isLine = line.value.trim() !== "สายงาน";   
    const isTicket = ticketType.value.trim() !== 
    "เลือกประเภทบัตร";
    
    
    if (isFullname && isNickname && isLine && isTicket) {
      inf_error.textContent = "";
      needPayment.disabled = false;
      needPayment.style.opacity = "1";
      needPayLater.disabled = false;
      needPayLater.style.opacity = "1";

    } else {
      inf_error.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";
      inf_error.style.color = "red";
      needPayment.disabled = true;
      needPayment.style.opacity = "0.2";
      needPayLater.disabled = true;
      needPayLater.style.opacity = "0.2";}
    }
  $('#line').on('change', checkLineAndTicket);
  $('#ticketType').on('change', checkLineAndTicket);
  document.getElementById("fullname").addEventListener("input", checkFormComplete);
  document.getElementById("nickname").addEventListener("input", checkFormComplete);
  document.getElementById("line").addEventListener("change", () => setTimeout(checkFormComplete, 100));
  document.getElementById("ticketType").addEventListener("change", () => setTimeout(checkFormComplete, 100));
  checkFormComplete();
  
  
});


function enablePaymentForm() {
  const paymentForm = document.getElementById("paymentForm");
  const allPayFields = paymentForm.querySelectorAll("input, select, textarea, button");
  allPayFields.forEach(el => el.disabled = false);
  paymentForm.style.opacity = "1";
  paymentForm.style.pointerEvents = "auto";
}



btn_edit.addEventListener('click', function () {
    registerForm.style.opacity = "1";
    registerForm.style.pointerEvents = "auto";
    NotRegister.disabled = false;
    NotRegister.style.opacity = "0.4"; 
    $("#line").prop("disabled", false);
    $("#ticketType").prop("disabled", false);
    $("#line").select2();
    $("#ticketType").select2();
    $("#line").next(".select2-container").css({opacity: "1",pointerEvents: "auto"});
    $("#ticketType").next(".select2-container").css({opacity: "1",pointerEvents: "auto"});
    fullname.disabled = false;
    fullname.style.opacity = "1"; 
    nickname.disabled = false;
    nickname.style.opacity = "1"; 
    needPayment.checked = false;
    needPayment.disabled = false;
    NotRegister.checked = true;
    NotRegister.style.opacity = "1"; 
    registerForm.scrollIntoView({ behavior: "smooth", block: "start" });
    const paymentForm = document.getElementById("paymentForm");
    const allPayFields = paymentForm.querySelectorAll("input, select, textarea, button");
    allPayFields.forEach(el => {
      if (el.id !== "copyBtn") {
        el.disabled = true;
      }
    });
    paymentForm.style.opacity = "0.6";
    paymentForm.style.pointerEvents = "none";
  
});



copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(accountNumber)
      .then(() => {
        copyBtn.textContent = "คัดลอกแล้ว";
        copyBtn.style.backgroundColor = "#198754";
        setTimeout(() => {
          copyBtn.textContent = "คัดลอก";
          copyBtn.style.backgroundColor = "#28a745";
        }, 2000);
      })
      .catch(err => {
        alert("เกิดข้อผิดพลาดในการคัดลอก: " + err);
      });
  });



NotRegister.addEventListener('change', function () {
  const fullname = document.getElementById('fullname');
  const nickname = document.getElementById('nickname');
  const line = document.getElementById('line');
  const ticketType = document.getElementById('ticketType');
  

  if (this.checked) {
    checkLineAndTicket();
    $("#line").next(".select2-container").css("pointer-events", "auto");
    $("#ticketType").next(".select2-container").css("pointer-events", "auto");
    $("#line").next(".select2-container").css("opacity", "1");
    $("#ticketType").next(".select2-container").css("opacity", "1");
    $("#userList").next(".select2-container").css("pointer-events", "none");
    $("#userList").next(".select2-container").css("opacity", "0.4");
    
}else{
  fullname.readOnly = true;
  fullname.style.opacity = "0.4"; 
  nickname.readOnly = true;
  nickname.style.opacity = "0.4"; 
  $("#line").next(".select2-container").css("pointer-events", "none");
  $("#ticketType").next(".select2-container").css("pointer-events", "none");
  $("#line").next(".select2-container").css("opacity", "0.4");
  $("#ticketType").next(".select2-container").css("opacity", "0.4");
  $("#userList").next(".select2-container").css("pointer-events", "auto");
  $("#userList").next(".select2-container").css("opacity", "1");
  }

});



$('#userList').on('select2:select', function (e) {
  
  const selectedValue = e.params.data.id || e.params.data.text;
  console.log("🟢 เลือก:", selectedValue);

  const parts = selectedValue.split("|").map(x => x.trim());
  const nickname = parts[0] || "";
  const fullname = parts[1] || "";

  console.log("nickname:", nickname, "fullname:", fullname);

  let member = registerCache.find(
      m => m.nickname.trim() === nickname && m.fullname.trim() === fullname
  );

  if (!member) {
    member = membersCache.find(
        m => m.nickname.trim() === nickname && m.fullname.trim() === fullname
    );
    NotRegister.disabled = true;;
    NotRegister.style.opacity = "0.4"; 
    
    if (member) 
      member.ticket_type = null;
      selectTicketType(member);
    
    }else{
      passToPay(member);
    }
  console.log("🧩 member ที่พบ:", member);

});
  
  

function passToPay(member){
  if (member && member !== "NOT_FOUND") {
    NotRegister.disabled = true;;
    NotRegister.style.opacity = "0.4";
    fullname.value = member.fullname;
    nickname.value = member.nickname;
    $('#line').val(member.line_name).trigger('change');
    $('#ticketType').val(member.ticket_type).trigger('change');
    needPayment.disabled = false;;
    needPayment.style.opacity = "1"; 
    needPayLater.disabled = true;;
    needPayLater.style.opacity = "0.4"; 

    $("#line").next(".select2-container").css("pointer-events", "none");
    $("#ticketType").next(".select2-container").css("pointer-events", "none");
    $("#line").next(".select2-container").css("opacity", "0.4");
    $("#ticketType").next(".select2-container").css("opacity", "0.4");
    fullname.disabled = true;;
    fullname.style.opacity = "0.4"; 
    nickname.disabled = true;;
    nickname.style.opacity = "0.4"; 
    inf_error.textContent = "คุณได้ลงทะเบียนไว้แล้ว! สามารถชำระเงินได้หากคุณต้องการ";
    inf_error.style.color = "green";
    updateConcludeBox(member);
  } else {
    console.warn("❌ ไม่พบผู้ใช้ใน data:", selectedValue);
    NotRegister.disabled = false;
    NotRegister.style.opacity = "1"; 
  }
};

function selectTicketType(member) {

  $('#line').val(member.line_name).trigger('change');
  fullname.value = member.fullname;
  nickname.value = member.nickname;
  fullname.disabled = true;;
  fullname.style.opacity = "0.4"; 
  nickname.disabled = true;;
  nickname.style.opacity = "0.4"; 
  inf_error.textContent = "กรุณาเลือกประเภทบัตร";
  inf_error.style.color = "red";
  if (!member) return;

  if (!member.ticket_type) {
    selectedUser = {
      fullname: member.fullname,
      nickname: member.nickname,
      line: member.line_name,
      ticket_type: "",
    };
    console.log("🧩 สร้าง selectedUser เริ่มต้น:", selectedUser);

    // ✅ เปิด dropdown ให้เลือก
    const ticketTypeSelect = $('#ticketType');
    ticketTypeSelect.prop('disabled', false);
    ticketTypeSelect.next('.select2-container').css({
      opacity: '1',
      pointerEvents: 'auto',
      border: '2px solid red',         // 🟥 เพิ่มเส้นกรอบสีแดง
      borderRadius: '6px',             // มุมโค้งนิดหน่อย (สวยขึ้น)
      boxShadow: '0 0 5px rgba(255,0,0,0.4)' // เพิ่มเงาแดงเบา ๆ
    });
    ticketTypeSelect.on('change', function () {
    ticketTypeSelect.next('.select2-container').css({
      border: 'none',
      boxShadow: 'none'
      });
      inf_error.textContent = "คุณต้องการชำระเงินหรือไม่";
      inf_error.style.color = "green";
    });

    // ✅ รองรับ select2 change event
    ticketTypeSelect.off('change.ticketType'); // ล้าง event เดิมก่อน
    ticketTypeSelect.on('change.ticketType', function () {
      const value = $(this).val();
      if (!selectedUser) return;

      selectedUser.ticket_type = value;
      console.log("🎟️ TicketType ที่เลือก:", value);
      console.log("🟢 selectedUser ปัจจุบัน:", selectedUser);
      
      needPayment.disabled = false;;
      needPayment.style.opacity = "1"; 
      needPayLater.disabled = false;;
      needPayLater.style.opacity = "1"; 

      updateConcludeBox(selectedUser); 

    });
  }
}

$(document).ready(function () {
  $("#ticketType").off("change.ticketTypeAuto");
  $("#ticketType").on("change.ticketTypeAuto", handleTicketChange);
});

function handleTicketChange() {
  const value = $("#ticketType").val();
  if (!selectedUser) return;
  selectedUser.ticket_type = value;
  console.log("🎟️ TicketType ที่เลือก:", value);
  console.log("🟢 selectedUser ปัจจุบัน:", selectedUser);
  fullname.disabled = true;;
  fullname.style.opacity = "0.4"; 
  nickname.disabled = true;;
  nickname.style.opacity = "0.4"; 
}



function updateConcludeBox(user) {
  const ticketValue = user.ticket_type;
  let price = 0;
    if (ticketValue.includes("Early Bird")) price = 1100;
    else if (ticketValue.includes("ทั่วไป 2 วัน")) price = 1350;
    else if (ticketValue.includes("1 วัน")) price = 800;

  setTimeout(() => {
    if (concludeBox) {
      concludeBox.style.display = "block";
      concludeBox.querySelector("p").innerHTML = `
        โปรดโอนจากบัญชีชื่อ: <strong>${user.fullname}</strong><br>
        ประเภทบัตร: <strong>${user.ticket_type}</strong><br>
        ยอดชำระ: <strong>${price} บาท</strong>
      `;
    } else {
      console.warn("⚠️ ไม่พบ concludeBox ใน DOM ตอนนี้");
      }}, 100);

  console.log("✅ อัปเดต concludeBox แล้ว:", user);
}



needPayLater.addEventListener('change', function () {
  if (this.checked) {
    btn_registerSubmit.disabled = false;
    btn_registerSubmit.style.opacity = "1";
    needPayment.disabled = true;
    needPayment.style.opacity = "0.2";


  } else {
    btn_registerSubmit.disabled = true;
    btn_registerSubmit.style.opacity = "0.2";
    needPayment.disabled = false;
    needPayment.style.opacity = "1";
  }
});



needPayment.addEventListener('change', function () {

    if (this.checked) {
      selectedUser = {
        fullname: fullname.value.trim(),
        nickname: nickname.value.trim(),
        line_name: line.value,
        ticket_type: ticketType.value
      };
      console.log("🧩 edit selectedUser:", selectedUser);
      updateConcludeBox(selectedUser);
      const allFields = registerForm.querySelectorAll("input, select, textarea, button");
      allFields.forEach(el => {
        if (el) { 
          el.disabled = true;
        }});
        registerForm.style.opacity = "0.6"; 
        registerForm.style.pointerEvents = "none"; 
        registerForm.style.userSelect = "none";

        btn_paid.disabled = true;
        btn_paid.style.opacity = "0.2";
        btn_paid.style.pointerEvents = "none";

      paymentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      enablePaymentForm();

    }
    else {
      alreadyRegistered.disabled = false;
      alreadyRegistered.style.opacity = "1";
    }
  });

function checkLineAndTicket() {
  const fullname = document.getElementById("fullname");
  const nickname = document.getElementById("nickname");
  const line = document.getElementById("line");
  const ticketType = document.getElementById("ticketType");

  const isLineSelected = line.value.trim() !== "" && line.value.trim() !== "สายงาน";
  const isTicketSelected = ticketType.value.trim() !== "" && ticketType.value.trim() !== "เลือกประเภทบัตร";

  if (isLineSelected && isTicketSelected) {
    // 🔓 เปิดให้กรอกชื่อ
    fullname.readOnly = false;
    fullname.style.opacity = "1";
    fullname.style.pointerEvents = "auto";

    nickname.readOnly = false;
    nickname.style.opacity = "1";
    nickname.style.pointerEvents = "auto";
  } else {
    // 🔒 ปิดไว้ก่อน ผู้ใช้ยังเลือกไม่ครบ
    fullname.readOnly = true;
    fullname.style.opacity = "0.4";
    fullname.style.pointerEvents = "none";

    nickname.readOnly = true;
    nickname.style.opacity = "0.4";
    nickname.style.pointerEvents = "none";
  }
}



// ===========บันทึกข้อมูล===============
btn_registerSubmit.addEventListener("click", async () => {
  const fullname = document.getElementById("fullname").value.trim();
  const nickname = document.getElementById("nickname").value.trim();
  const line_name = document.getElementById("line").value.trim();
  const ticket_type = document.getElementById("ticketType").value.trim();
  const status = "ยังไม่จ่าย";
  const slip = null;

  const payload = { fullname, nickname, line_name, ticket_type, status, slip };
  console.log("📦 ข้อมูลที่จะส่ง:", payload);

  try {
    // ✅ ตรวจสอบใน memberCache (ฝั่ง client)
    const found = membersCache.find(
      m => m.nickname === nickname && m.fullname === fullname
    );

    if (found) {
      console.log("✅ พบใน memberCache → เพิ่มลง register");
      await insertToRegister(payload);
    } else {
      console.log("🆕 ไม่พบใน memberCache → เพิ่มเข้า member ก่อน");
      await insertToMember({ fullname, nickname, line_name });
      await insertToRegister(payload);
    }

    alert("✅ บันทึกข้อมูลสำเร็จ!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    alert("เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
  }
});

async function insertToRegister(data) {
  console.log("-----insertToRegister Enter")
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data)
  });
  window.location.href = "display.html";

  if (!res.ok) throw new Error("insert register failed");
  const result = await res.json();
  console.log("📥 เพิ่มข้อมูล register:", result);
  return result;
}

async function insertToMember(data) {
  console.log("-----insertToMember Enter")
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_MEMBERS}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("insert member failed");
  const result = await res.json();
  console.log("📥 เพิ่มข้อมูล member:", result);
  return result;
}


fileInput.addEventListener("change", function () {
      checkPaidButtonStatus(); 
    });


function checkPaidButtonStatus() {
      const hasUser = selectedUser !== null;
      const hasFile = fileInput.files.length > 0;
      if (hasUser && hasFile) {
        btn_paid.disabled = false;
        btn_paid.style.opacity = "1";
        btn_paid.style.pointerEvents = "auto";
        console.log("✅ เปิดปุ่มชำระเงินแล้ว");
      } else {
        btn_paid.disabled = true;
        btn_paid.style.opacity = "0.2";
        btn_paid.style.pointerEvents = "none";
        console.log("⛔ ปิดปุ่มชำระเงิน (ยังไม่ครบเงื่อนไข)");
      }
    }

btn_paid.addEventListener("click", async () => {
  btn_paid.disabled = true;
  btn_paid.style.opacity = "0.4";

  const fileInput = document.getElementById("paymentSlip");
  const file = fileInput.files[0];

  if (!selectedUser) {
    alert("กรุณาเลือกรายชื่อก่อนค่ะ");
    resetButton();
    return;
  }

  if (!file) {
    alert("กรุณาแนบสลิปก่อนส่งค่ะ");
    resetButton();
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const img = new Image();
    img.src = reader.result;

    img.onload = async function () {
      // ✅ Resize image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const maxW = 800;
      const scale = maxW / img.width;
      canvas.width = maxW;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 🔄 Convert to base64
      const slipBase64 = canvas.toDataURL("image/jpeg", 0.8);

      // ✅ เตรียมข้อมูล
      const payload = {
        fullname: selectedUser.fullname,
        nickname: selectedUser.nickname,
        line_name: selectedUser.line_name,
        ticket_type: selectedUser.ticket_type,
        status: "จ่ายแล้ว",
        slip: slipBase64
      };

      console.log("📦 ข้อมูลเตรียมส่ง:", payload);

      try {
        
        
        const inRegister = registerCache.find(
          r => r.fullname === selectedUser.fullname && r.nickname === selectedUser.nickname
        );

        if (inRegister) {
          console.log("🔄 พบใน registerCache → อัปเดตข้อมูลแทน insert");

          await updateRegister(inRegister.id, {
            ticket_type: selectedUser.ticket_type,
            status: "จ่ายแล้ว",
            slip: slipBase64
          });
        }
        else{
          const exists = membersCache.find(
            m => m.nickname === selectedUser.nickname && m.fullname === selectedUser.fullname
          );
          if (exists) {
            console.log("✅ พบใน memberCache → เพิ่มลง register");
            await insertToRegister(payload);

          }else{
            console.log("🆕 ไม่พบใน memberCache → เพิ่มเข้า member ก่อน");
            await insertToMember({
                  fullname: selectedUser.fullname,
                  nickname: selectedUser.nickname,
                  line_name: selectedUser.line_name
                });
            await insertToRegister(payload);
          }
        } 
      alert("✅ บันทึกข้อมูลสำเร็จค่ะ!");
      } catch (err) {
        console.error("❌ เกิดข้อผิดพลาด:", err);
        alert("⚠️ เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
      } finally {
        resetButton();
      }
    };
  };

  reader.readAsDataURL(file);
});

function resetButton() {
  btn_paid.disabled = false;
  btn_paid.style.opacity = "1";
}


async function updateRegister(id, updateData) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(updateData)
  });

  if (!res.ok) throw new Error("update register failed");

  let result = null;
  try {
    result = await res.json();
    window.location.href = "display.html";

  } catch {
    console.warn("⚠️ Response ไม่มี body (204 No Content)");
  }

  console.log("🧾 อัปเดต register สำเร็จ:", result || "(no data)");
  return result;
}
