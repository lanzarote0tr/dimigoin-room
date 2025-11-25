function submit() {
    student = document.getElementById("student").value;
    date = document.getElementById("date").value;
    time = document.getElementById("time").value;
    description = document.getElementById("description").value;
    fetch("/api/room/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            student: student,
            date: date,
            time: time,
            description: description,
        }),
    })  .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("신청이 성공적으로 제출되었습니다.");
                window.location.href = "/applyroom";
            } else {
                alert("신청 제출에 실패했습니다: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("신청 제출 중 오류가 발생했습니다.");
        });

    return;
}