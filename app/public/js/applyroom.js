function submit() {
    const name = document.getElementById("people").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const reason = document.getElementById("reason").value;
    
    if (!name || !date || !time || !reason) {
        alert("모든 항목을 작성해주세요.");
        return;
    }
    fetch("/api/room/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, date, time, reason })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("방 신청이 완료되었습니다.");
            window.location.reload();
        } else {
            alert("방 신청에 실패했습니다: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("서버와의 통신 중 오류가 발생했습니다.");
    });
}
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("submit").addEventListener("click", submit);
    document.getElementById("view").addEventListener("click", function() {
        window.location.href = "/app/viewapplies";
    });
});