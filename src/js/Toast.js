const $ = document.querySelector.bind(document);
function Toast({
  type = "success",
  title = "",
  message = "",
  duration = 1000,
}) {
  const mainToast = $("#toast");

  const icons = {
    success: "<i class='bx bxs-smile' ></i>",
    error: "<i class='bx bxs-sad'></i>",
    check: "<i class='bx bxs-smile' ></i>",
    warning: "<i class='bx bxs-error' ></i>",
  };
  if (mainToast) {
    const toast = document.createElement("div");
    // Tự động gỡ:
    const autoRemoveId = setTimeout(function () {
      mainToast.removeChild(toast);
    }, duration + 1000);
    //gỡ toast khi click
    toast.onclick = function (e) {
      if (e.target.closest(".toast__close")) {
        mainToast.removeChild(toast);
        clearTimeout(autoRemoveId);
      }
    };
    const icon = icons[type];
    const delay = duration / 1000;
    toast.classList.add("toast", `toast__${type}`);
    toast.style.animation = `slideToLeft ease 0.5s, fade linear 1s ${delay}s forwards`;
    toast.innerHTML = `           
            <div class="toast__icon">
                ${icon}
            </div>
            <div class="toast__body">
                <h3 class="toast__title">${title}</h3>
                <p class="toast__messege">${message}</p>
            </div>
            <div class="toast__close">
                <i class='bx bx-x'></i>
            </div>
            `;
    mainToast.appendChild(toast);
  }
}

export default Toast;
