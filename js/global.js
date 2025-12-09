(function ($) {
    'use strict';

    /*==================================================================
        [ Daterangepicker ]
    ==================================================================*/
    try {
        $('.js-datepicker').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: { format: 'DD/MM/YYYY' },
        });

        var myCalendar = $('.js-datepicker');
        var isClick = 0;

        $(window).on('click', function () {
            isClick = 0;
        });

        $('.js-btn-calendar').on('click', function (e) {
            e.stopPropagation();
            isClick = isClick === 1 ? 0 : 1;
            if (isClick === 1) myCalendar.focus();
        });

        $(myCalendar).on('click', function (e) {
            e.stopPropagation();
            isClick = 1;
        });

        $('.daterangepicker').on('click', function (e) {
            e.stopPropagation();
        });

    } catch (er) { console.log(er); }

    /*==================================================================
        [ Select2 ]
    ==================================================================*/
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


/*=============================
    Swiper (Banner Slider)
===============================*/
var swiper = new Swiper(".mySwiper", {
    loop: true,
    pagination: { el: ".swiper-pagination" },
});


/*=============================
    DOM Elements
===============================*/
const needPayment      = document.getElementById('paid_now');
const needPayLater     = document.getElementById('paid_later');
const registerForm     = document.getElementById('registerForm');
const NotRegister      = document.getElementById("NotRegister");
const btn_edit         = document.getElementById("btn_edit");
const userList         = document.getElementById("userList");
const concludeBox      = document.getElementById("conclude");
const copyBtn          = document.getElementById("copyBtn");
const btn_registerSubmit = document.getElementById("btn_registerSubmit");
const btn_paid         = document.getElementById("btn_paid");
const inf_error        = document.getElementById("inf_error");
const accountNumber    = document.getElementById("accountNumber").textContent;
const fileInput        = document.getElementById("paymentSlip");

const paymentForm      = document.getElementById("paymentForm");
const fullnameInput    = document.getElementById('fullname');
const nicknameInput    = document.getElementById('nickname');
const lineSelect       = document.getElementById('line');

let membersCache = [];
let selectedUser = null;


/*=============================
    Supabase Config
===============================*/
const SUPABASE_URL = "https://lrkaigodgewdhncqdzpz.supabase.co";
const SUPABASE_KEY = "sb_publishable_sKcAGI3Y4nuRRoazBdGQcw_lJZILGpg";

// ชื่อตารางจริงใน Supabase (เป็นตัวพิมพ์เล็กทั้งหมด)
const TABLE_MEMBERS  = "memberdb";
const TABLE_REGISTER = "artistry_reg";

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

        const data = await getAllMembers();
        membersCache = data || [];

        // เคลียร์ options แล้วใส่ค่าใหม่
        userList.innerHTML = '<option disabled selected>เลือกรายชื่อ</option>';

        membersCache.forEach(mb => {
            if (!mb.nickname || !mb.line_name) return;
            const opt = document.createElement("option");
            opt.value = `${mb.nickname}-${mb.line_name}`;
            opt.textContent = `${mb.nickname}-${mb.line_name}`;
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


/*=============================
    DOMContentLoaded – ตั้งค่าเริ่มต้น
===============================*/
window.addEventListener("DOMContentLoaded", function () {

    // ปิดการแก้ไขฟอร์มสมัครเริ่มต้น
    fullnameInput.readOnly = true;
    fullnameInput.style.opacity = "0.4";
    nicknameInput.readOnly = true;
    nicknameInput.style.opacity = "0.4";

    $("#line").next(".select2-container").css("pointer-events", "none");
    $("#line").next(".select2-container").css("opacity", "0.4");

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
        if (el.id !== "copyBtn") el.disabled = true;
    });

    function checkFormComplete() {
        const isFullname = fullnameInput.value.trim() !== "";
        const isNickname = nicknameInput.value.trim() !== "";
        const isLine = lineSelect.value.trim() !== "" && lineSelect.value.trim() !== "สายงาน";

        if (isFullname && isNickname && isLine) {
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
            needPayLater.style.opacity = "0.2";
        }
    }

    $('#line').on('change', checkLineAndTicket);
    fullnameInput.addEventListener("input", checkFormComplete);
    nicknameInput.addEventListener("input", checkFormComplete);
    lineSelect.addEventListener("change", () => setTimeout(checkFormComplete, 100));
    checkFormComplete();
});


/*=============================
    Helper: เปิดฟอร์มชำระเงิน
===============================*/
function enablePaymentForm() {
    const allPayFields = paymentForm.querySelectorAll("input, select, textarea, button");
    allPayFields.forEach(el => el.disabled = false);
    paymentForm.style.opacity = "1";
    paymentForm.style.pointerEvents = "auto";
}


/*=============================
    ปุ่มแก้ไขฟอร์มสมัคร
===============================*/
btn_edit.addEventListener('click', function () {
    const allFields = registerForm.querySelectorAll("input, select, textarea, button");
    allFields.forEach(el => el.disabled = false);

    registerForm.style.opacity = "1";
    registerForm.style.pointerEvents = "auto";
    needPayment.checked = false;
    NotRegister.style.opacity = "1";

    registerForm.scrollIntoView({ behavior: "smooth", block: "start" });

    paymentForm.style.opacity = "0.6";
    paymentForm.style.pointerEvents = "none";
});


/*=============================
    ปุ่มคัดลอกเลขบัญชี
===============================*/
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(accountNumber)
        .then(() => {
            copyBtn.textContent = "คัดลอกแล้ว";
            copyBtn.style.backgroundColor = "#87196bff";
            setTimeout(() => {
                copyBtn.textContent = "คัดลอก";
                copyBtn.style.backgroundColor = "#8e2487ff";
            }, 2000);
        })
        .catch(err => {
            alert("เกิดข้อผิดพลาดในการคัดลอก: " + err);
        });
});


/*=============================
    Checkbox: ยังไม่เคยลงทะเบียน
===============================*/
NotRegister.addEventListener('change', function () {
    if (this.checked) {
        checkLineAndTicket();
        $("#line").next(".select2-container").css("pointer-events", "auto");
        $("#line").next(".select2-container").css("opacity", "1");
        $("#userList").next(".select2-container").css("pointer-events", "none");
        $("#userList").next(".select2-container").css("opacity", "0.4");
    } else {
        fullnameInput.readOnly = true;
        fullnameInput.style.opacity = "0.4";
        nicknameInput.readOnly = true;
        nicknameInput.style.opacity = "0.4";
        $("#line").next(".select2-container").css("pointer-events", "none");
        $("#line").next(".select2-container").css("opacity", "0.4");
        $("#userList").next(".select2-container").css("pointer-events", "auto");
        $("#userList").next(".select2-container").css("opacity", "1");
    }
});


/*=============================
    เมื่อเลือกชื่อจาก dropdown (MemberDB)
===============================*/
$('#userList').on('select2:select', async function (e) {
    const selectedValue = e.params.data.id || e.params.data.text;
    console.log("🟢 เลือก:", selectedValue);

    if (selectedValue === "NOT_FOUND") {
        NotRegister.checked = true;
        NotRegister.disabled = false;
        NotRegister.style.opacity = "1";
        fullnameInput.value = "";
        nicknameInput.value = "";
        lineSelect.value = "";
        checkLineAndTicket();
        return;
    }

    const [nickname, line] = selectedValue.includes('-')
        ? selectedValue.split('-')
        : [selectedValue, ""];

    const member = membersCache.find(m => m.nickname === nickname && m.line_name === line);

    console.log("🧩 member:", member);

    if (member) {
        NotRegister.disabled = true;
        NotRegister.style.opacity = "0.4";

        fullnameInput.value = member.fullname;
        nicknameInput.value = member.nickname;
        $('#line').val(member.line_name).trigger('change');

        fullnameInput.readOnly = true;
        fullnameInput.style.opacity = "0.4";
        nicknameInput.readOnly = true;
        nicknameInput.style.opacity = "0.4";
        inf_error.textContent = "";

        needPayment.disabled = false;
        needPayment.style.opacity = "1";
        needPayLater.disabled = false;
        needPayLater.style.opacity = "1";

        selectedUser = {
            fullname: member.fullname,
            nickname: member.nickname,
            line: member.line_name,
        };

        checkPaidButtonStatus();

        // ตรวจสอบว่าลงทะเบียนแล้วหรือยังในตาราง artistryregister
        try {
            const existing = await findRegistration(member.nickname, member.line_name);
            const price = 220;

            setTimeout(() => {
                if (!concludeBox) return;
                concludeBox.style.display = "block";

                if (existing && existing.length > 0) {
                    const statusText = existing[0].status || "ไม่ทราบสถานะ";
                    concludeBox.querySelector("p").innerHTML = `
                        โปรดโอนจากบัญชีชื่อ: <strong>${member.fullname}</strong><br>
                        ยอดชำระ: <strong>${price} บาท</strong><br>
                        สถานะปัจจุบัน: <strong>${statusText}</strong>
                    `;
                } else {
                    concludeBox.querySelector("p").innerHTML = `
                        โปรดโอนจากบัญชีชื่อ: <strong>${member.fullname}</strong><br>
                        ยอดชำระ: <strong>${price} บาท</strong>
                    `;
                }
            }, 100);

        } catch (err) {
            console.warn("⚠️ ตรวจสอบข้อมูลลงทะเบียนไม่สำเร็จ:", err);
        }

    } else {
        console.warn("❌ ไม่พบสมาชิกใน memberdb:", selectedValue);
        NotRegister.disabled = false;
        NotRegister.style.opacity = "1";
    }
});


/*=============================
    เลือก "ชำระทีหลัง"
===============================*/
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


/*=============================
    เลือก "ชำระตอนนี้"
===============================*/
needPayment.addEventListener('change', function () {
    if (this.checked) {
        const allFields = registerForm.querySelectorAll("input, select, textarea, button");
        allFields.forEach(el => { if (el) el.disabled = true; });

        registerForm.style.opacity = "0.6";
        registerForm.style.pointerEvents = "none";
        registerForm.style.userSelect = "none";

        btn_paid.disabled = true;
        btn_paid.style.opacity = "0.2";
        btn_paid.style.pointerEvents = "none";

        paymentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        enablePaymentForm();

        const nickname = nicknameInput.value.trim();
        const fullname = fullnameInput.value.trim();
        const lineText = lineSelect.options[lineSelect.selectedIndex]?.text || "";

        const newOption = document.createElement("option");
        newOption.textContent = `${nickname}-${lineText}`;
        newOption.selected = true;
        userList.appendChild(newOption);
        userList.disabled = true;

        selectedUser = { fullname, nickname, line: lineText };

        const price = 220;
        concludeBox.style.display = "block";
        concludeBox.querySelector("p").innerHTML = `
            โปรดโอนจากบัญชีชื่อ: <strong>${fullname}</strong><br>
            ยอดชำระ: <strong>${price} บาท</strong>
        `;
    } else {
        btn_paid.disabled = true;
        btn_paid.style.opacity = "0.2";
        btn_paid.style.pointerEvents = "none";
    }
});


/*=============================
    เปิดให้กรอกชื่อเมื่อเลือกสายงานแล้ว
===============================*/
function checkLineAndTicket() {
    const isLineSelected = lineSelect.value.trim() !== "" && lineSelect.value.trim() !== "สายงาน";

    if (isLineSelected) {
        fullnameInput.readOnly = false;
        fullnameInput.style.opacity = "1";
        fullnameInput.style.pointerEvents = "auto";

        nicknameInput.readOnly = false;
        nicknameInput.style.opacity = "1";
        nicknameInput.style.pointerEvents = "auto";
    } else {
        fullnameInput.readOnly = true;
        fullnameInput.style.opacity = "0.4";
        fullnameInput.style.pointerEvents = "none";

        nicknameInput.readOnly = true;
        nicknameInput.style.opacity = "0.4";
        nicknameInput.style.pointerEvents = "none";
    }
}


/*=============================
    ปุ่ม "ลงทะเบียน (ยังไม่จ่าย)"
===============================*/
btn_registerSubmit.addEventListener("click", async () => {
    const fullname = fullnameInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const line = lineSelect.value.trim();

    if (!fullname || !nickname || !line) {
        alert("กรุณากรอกข้อมูลให้ครบก่อนลงทะเบียนค่ะ");
        return;
    }

    try {
        await registerUser(fullname, nickname, line);

        alert("บันทึกข้อมูลสำเร็จค่ะ!");
        window.location.href = "artistry_table.html";
    } catch (err) {
        console.error("❌ บันทึกข้อมูลไม่สำเร็จ:", err);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
});


/*=============================
    ตรวจสอบสถานะปุ่มชำระเงิน
===============================*/
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


/*=============================
    Helper: แปลงไฟล์เป็น Base64
===============================*/
function convertFileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}


/*=============================
    ปุ่ม "ชำระเงิน" – อัปโหลดสลิป
===============================*/
btn_paid.addEventListener("click", async () => {
    btn_paid.disabled = true;
    btn_paid.style.opacity = "0.2";
    const file = fileInput.files[0];
    if (!file || !selectedUser) {
        alert("กรุณาเลือกไฟล์สลิปและตรวจสอบชื่อผู้สมัครก่อนค่ะ");
        return;
    }

    try {
        const slipBase64 = await convertFileToBase64(file);
        await updateOrInsertSlip(
            selectedUser.fullname,
            selectedUser.nickname,
            slipBase64,
            selectedUser.line
        );
        alert("อัปโหลดสลิปสำเร็จค่ะ!");
        window.location.href = "artistry_table.html";
    } catch (err) {
        console.error("❌ อัปโหลดสลิปไม่สำเร็จ:", err);
        alert("เกิดข้อผิดพลาดในการอัปโหลดสลิป");
    }
});



/*========================================
    Supabase: REST helpers
========================================*/
/* ============================================================
   เช็กและเพิ่ม memberdb หากยังไม่มี
============================================================ */
async function ensureMemberExists(fullname, nickname, line) {
    const checkUrl =
        `${SUPABASE_URL}/rest/v1/${TABLE_MEMBERS}` +
        `?fullname=eq.${encodeURIComponent(fullname)}` +
        `&nickname=eq.${encodeURIComponent(nickname)}` +
        `&line_name=eq.${encodeURIComponent(line)}`;

    const res = await fetch(checkUrl, { headers: SUPABASE_HEADERS });
    const rows = await res.json();

    if (rows.length > 0) {
        console.log("มีใน memberdb แล้ว");
        return;
    }

    console.log("เพิ่มลง memberdb");

    const insertPayload = { fullname, nickname, line_name: line };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_MEMBERS}`, {
        method: "POST",
        headers: {
            ...SUPABASE_HEADERS,
            "Prefer": "return=representation"
        },
        body: JSON.stringify(insertPayload)
    });

    const text = await insertRes.text();
    if (!insertRes.ok) {
        throw new Error("Insert memberdb failed: " + text);
    }
}


/* ============================================================
   ลงทะเบียน (upsert) + บันทึก memberdb
============================================================ */
async function registerUser(fullname, nickname, line) {

    // ✨ 1) เพิ่ม / ยืนยันสมาชิกใน memberdb ก่อนเสมอ
    await ensureMemberExists(fullname, nickname, line);

    // ✨ 2) เช็กว่ามี record อยู่ใน artistry_reg แล้วหรือยัง
    const checkUrl =
        `${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}` +
        `?fullname=eq.${encodeURIComponent(fullname)}` +
        `&nickname=eq.${encodeURIComponent(nickname)}` +
        `&line_name=eq.${encodeURIComponent(line)}`;

    const resCheck = await fetch(checkUrl, { headers: SUPABASE_HEADERS });
    const existRows = await resCheck.json();

    const payload = {
        status: "ยังไม่จ่าย",
        slip: null
    };

    // ---------- UPDATE ถ้ามีแล้ว ----------
    if (existRows.length > 0) {
        console.log("มีใน artistry_reg → UPDATE");
        

        const updateRes = await fetch(checkUrl, {
            method: "PATCH",
            headers: {
                ...SUPABASE_HEADERS,
                "Prefer": "return=representation"
            },
            body: JSON.stringify(payload)
        });

        const text = await updateRes.text();
        if (!updateRes.ok) throw new Error("Update failed: " + text);

        return text ? JSON.parse(text) : {};
    }

    // ---------- INSERT ใหม่ ----------
    console.log("ยังไม่มีใน artistry_reg → INSERT");

    const insertPayload = {
        fullname,
        nickname,
        line_name: line,
        ...payload
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}`, {
        method: "POST",
        headers: {
            ...SUPABASE_HEADERS,
            "Prefer": "return=representation"
        },
        body: JSON.stringify(insertPayload)
    });

    const text = await insertRes.text();
    if (!insertRes.ok) throw new Error("Insert failed: " + text);

    return text ? JSON.parse(text) : {};
}




async function updateOrInsertSlip(fullname, nickname, slipBase64, line_name) {

    // STEP 1 → ตรวจว่ามีข้อมูลหรือยัง
    const checkUrl =
        `${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}` +
        `?fullname=eq.${encodeURIComponent(fullname)}` +
        `&nickname=eq.${encodeURIComponent(nickname)}` +
        `&line_name=eq.${encodeURIComponent(line_name)}`;

    const checkRes = await fetch(checkUrl, {
        method: "GET",
        headers: SUPABASE_HEADERS
    });

    const existing = await checkRes.json();
    console.log("🔍 ตรวจเจอข้อมูล:", existing);
    alert("คุณได้ทำการลงทะเบียนซ้ำ! ข้อมูลเดิมจะถูกอัพเดรต");

    // ==============================
    // CASE 1 → UPDATE ถ้าพบข้อมูล
    // ==============================
    if (existing.length > 0) {
        console.log("🟣 พบข้อมูล → UPDATE");

        const updatePayload = {
            status: "จ่ายแล้ว",
            slip: slipBase64
        };

        const updateRes = await fetch(checkUrl, {
            method: "PATCH",
            headers: {
                ...SUPABASE_HEADERS,
                "Prefer": "return=representation"
            },
            body: JSON.stringify(updatePayload)
        });

        const updateText = await updateRes.text();

        if (!updateRes.ok) {
            throw new Error("UPDATE failed: " + updateText);
        }

        return updateText ? JSON.parse(updateText) : {};
    }

    // ==============================
    // CASE 2 → INSERT ถ้าไม่พบข้อมูล
    // ==============================
    console.log("🟢 ไม่พบข้อมูล → INSERT ใหม่");

    const insertPayload = {
        fullname,
        nickname,
        line_name,
        status: "จ่ายแล้ว",
        slip: slipBase64
    };

    const insertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}`,
        {
            method: "POST",
            headers: {
                ...SUPABASE_HEADERS,
                "Prefer": "return=representation"
            },
            body: JSON.stringify(insertPayload)
        }
    );

    const insertText = await insertRes.text();

    if (!insertRes.ok) {
        throw new Error("INSERT failed: " + insertText);
    }

    return insertText ? JSON.parse(insertText) : {};
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

async function findRegistration(nickname, line_name) {
    const url =
        `${SUPABASE_URL}/rest/v1/${TABLE_REGISTER}` +
        `?nickname=eq.${encodeURIComponent(nickname)}` +
        `&line_name=eq.${encodeURIComponent(line_name)}`;

    const res = await fetch(url, { headers: SUPABASE_HEADERS });

    if (!res.ok) {
        throw new Error("Supabase select registration failed");
    }

    return await res.json();
}
