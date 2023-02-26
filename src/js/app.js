import { employeeServices, departmentServices } from "./services.js";
import { convertData, convertDate, convertDepartment } from "./utils.js";
import { listPageSize, menuData, urlIcon } from "./data.js";
import Toast from "./Toast.js";

// Biến toàn cục
var currentInputSearch = ""; // keySearch lọc nhân viên
var currentInputSearchSelect = "";
var currentPageSize = 20;
var currentPageIndex = 1;
var currentTotalPage = "";
var currentTotalRecord = 0; // Tổng số bản ghi hiện tại
var role = ["1"]; // 1: là khách hàng , 2: là nhà cung cấp
var listDepartment = [];
var modalMode = "CREATE";
var currentIdEmployee;
var listEmployeeSelected = [];
var isDeleteMultiple = false;

const app = () => {
  $(document).ready(() => {
    //render list menu sidebar
    renderMenuSidebar("list-menu");
    //Gán các sự kiện cho các element
    initEvents();
    // init data
    loadData();
  });
};

/*---Hàm sử lý các sự kiện---
 */
const initEvents = () => {
  // Đóng mở modal thêm mới
  $(".btn-close,.btn-cancel").click(() => {
    $(".modal-container").hide();
  });
  $(".btn-add").click(async () => {
    modalMode = "CREATE";
    refreshDataModal();
    let response = await employeeServices.getMaxEmployeeCode();
    let newEmployeeCode = response[0].MaxEmployeeCode;
    $("#EmployeeCode").val(newEmployeeCode);
    $(".modal-container").show();
  });

  //Xử lý sự kiện tìm kiếm (tìm kiếm sau 0.5s dừng gõ)
  let inputSearch = $(".input-search");
  let idTimeOutSearch;
  inputSearch.on("input", () => {
    // clear id timeout cũ và tạo id timeout mới khi gõ
    clearTimeout(idTimeOutSearch);
    idTimeOutSearch = setTimeout(async () => {
      currentInputSearch = inputSearch.val().trim();
      // Gọi api filter employee
      const data = await employeeServices.filterEmployee(currentInputSearch);
      // re-render component table
      renderTableContainer(data);
    }, 500);
  });

  // Xử lý click vào btn refresh
  $(".btn-reload").click(() => {
    reLoadDataAndreRender();
  });

  // Xử lý sự kiện gõ vào input select department
  let idTimeoutSearchSelect;
  $("#DepartmentID").on("input", (e) => {
    clearTimeout(idTimeoutSearchSelect);
    idTimeoutSearchSelect = setTimeout(async () => {
      currentInputSearchSelect = e.target.value.trim();
      let listFiltered = await departmentServices.filterDepartment(
        currentInputSearchSelect
      );
      ComboBox("select-department", listFiltered);
    }, 300);
  });

  //Xử lý chọn gender
  $(".radio").click((item) => {
    $("#Gender").attr("value", item.target.getAttribute("value")); //Gán mã gender đã chọn cho thẻ cha
  });

  // Xử lý sự kiện chọn role
  $(".inputCheckboxModal").click((item) => {
    if (role.includes(item.target.value)) {
      let index = role.indexOf(item.target.value);
      if (index > -1) {
        role.splice(index, 1);
      }
    } else {
      role.push(item.target.value);
    }
  });

  // Xử lý sự kiện nút Save
  $("#btn-save").click(async () => {
    if (modalMode === "CREATE") {
      //Thu thập dữ liệu
      let dataEmployee = {};
      let inputs = $("input.form-control");
      for (let input of inputs) {
        let propsValue = $(input).attr("id");
        let value = input.value;
        dataEmployee[propsValue] = value;
      }
      dataEmployee.DepartmentID = $("#DepartmentID").attr("value");
      dataEmployee.Gender = $("#Gender").attr("value");
      // Gọi api thêm nhân viên
      let res = await employeeServices.insertEmployee(dataEmployee);
      if (res && res.errorCode === "ok") {
        //Lấy data theo điều kiện hiện tại
        let data = await employeeServices.filterEmployee();
        //re-render table
        renderTableContainer(data);
        // Đóng modal
        $(".modal-container").hide();
        // show toast
        Toast({
          title: res.userMsg,
          duration: 3000,
        });
      } else {
        console.log(res);
        // Show toast
        Toast({
          type: "error",
          title: "Đã có lỗi xả ra ",
          message: res.userMsg,
          duration: 3000,
        });
      }
    } else if (modalMode === "UPDATE") {
      //Thu thập dữ liệu
      let dataEmployee = {};
      let inputs = $("input.form-control");
      for (let input of inputs) {
        let propsValue = $(input).attr("id");
        let value = input.value;
        dataEmployee[propsValue] = value;
      }
      dataEmployee.DepartmentID = $("#DepartmentID").attr("value");
      dataEmployee.Gender = $("#Gender").attr("value");
      // Gọi api sửa nhân viên
      let res = await employeeServices.updateEmployee(
        currentIdEmployee,
        dataEmployee
      );
      if (res && res.errorCode === "ok") {
        //Lấy data theo điều kiện hiện tại
        let data = await employeeServices.filterEmployee();
        //re-render table
        renderTableContainer(data);
        // Đóng modal
        $(".modal-container").hide();
        // show toast
        Toast({
          title: res.userMsg,
          duration: 3000,
        });
      } else {
        // Show toast
        Toast({
          type: "error",
          title: "Đã có lỗi xả ra",
          message: res.userMsg,
          duration: 3000,
        });
      }
    }
  });

  //Xử lý nút chuyển trang( next)
  $(".btn-next").click(async () => {
    if (currentPageIndex < currentTotalPage) {
      currentPageIndex += 1;
      // Lấy và load lại data
      reLoadDataAndreRender();

      checkUnPointer(currentPageIndex);
    }
  });
  //Xử lý nút chuyển trang(prev)
  $(".btn-prev").click(async () => {
    if (currentPageIndex > 1) {
      currentPageIndex -= 1;
      // Lấy và load lại data
      reLoadDataAndreRender();

      checkUnPointer(currentPageIndex);
    }
  });

  // Mở modal nhân bản
  $(".btn-clone").click(async () => {
    modalMode = "CREATE";
    refreshDataModal();

    // Fill thông tin nhân viên
    let employee = await employeeServices.getEmployeeById(currentIdEmployee);
    if (employee && employee.length > 0) {
      $(".modal-container").show();

      // fill data vào table
      let inputs = $("input.form-control");
      for (let input of inputs) {
        if ($(input).attr("id") === "EmployeeCode") {
          let response = await employeeServices.getMaxEmployeeCode();
          let newEmployeeCode = response[0].MaxEmployeeCode;
          input.value = newEmployeeCode;
        } else {
          let propsValue = $(input).attr("id");
          input.value = employee[0][propsValue];
        }
      }
      //Fill data vào input DateOfBirth
      $("#DateOfBirth").val(employee[0]["DateOfBirth"]?.split("T")[0]);

      //Fill data vào input IdentityIssuedDat
      $("#IdentityIssuedDate").val(
        employee[0]["IdentityIssuedDate"]?.split("T")[0]
      );

      //Fill data vào input department
      $("#DepartmentID").val(
        convertDepartment(employee[0]["DepartmentID"], listDepartment)
      );

      // Fill data select gender
      let genderCode = employee[0]["Gender"];
      $(".option >input").map((index, input) => {
        if (genderCode == input.id) {
          input.checked = true;
        }
      });
      //Gán value cho select gender
      $("#Gender").attr("value", employee[0]["Gender"]);

      // Gán value=DepartmentID cho comboBox Department
      $(`#select-department>input`).attr("value", employee[0]["DepartmentID"]);
    }
    $(".modal-container").show();
    $(".drop-list-more").hide();
  });

  // Xử lý click nút xoá nhân viên -> show message
  $(".btn-delete").click(async () => {
    isDeleteMultiple = false;
    $(".message-container").show();
  });

  // Xử lý nút accept xoá
  $(".btn-accept").click(async () => {
    if (!isDeleteMultiple) {
      let response = await employeeServices.deleteEmployeeById(
        currentIdEmployee
      );
      if (response) {
        Toast({
          title: response.userMsg,
          duration: 3000,
        });
        $(".message-container").hide();
      } else {
        Toast({
          type: "error",
          title: "Xoá nhân viên thất bại",
          message: "Đã có lỗi xảy ra",
          duration: 3000,
        });
      }
    } else {
      if (listEmployeeSelected.length > 1) {
        let response = await employeeServices.deleteMultipleEmployeeById(
          listEmployeeSelected
        );
        if (response) {
          Toast({
            title: response.userMsg,
            duration: 3000,
          });
          $(".message-container").hide();
        } else {
          Toast({
            type: "error",
            title: "Xoá nhân viên thất bại",
            message: "Đã có lỗi xảy ra",
            duration: 3000,
          });
        }
        listEmployeeSelected = [];
      }
    }
    reLoadDataAndreRender();
  });
  $(".btn-no").click(() => {
    $(".message-container").hide();
  });

  //Xử lý btn delete multiple
  $(".btn-deleteMultiple").click(async () => {
    isDeleteMultiple = true;
    $(".message-container").show();
  });
};

/*
---Hàm load data ban đầu---
*/
const loadData = async () => {
  // Lấy tất cả phòng ban
  listDepartment = await departmentServices.getAllDepartment();

  // Lấy data bảng nhân viên
  const data = await employeeServices.filterEmployee();
  renderTableContainer(data);

  // Render drop list page size
  ComboBox("select-department", listDepartment); // drop list department
  ComboBox("select-pageSize", listPageSize, "bottom"); // drop list page
  // Hide các drop list của comboBox
  $(`#select-department .drop-list`).hide();
  $(`#select-pageSize .drop-list`).hide();
  // Chặn không cho chọn ngày lớn hơn
  const today = new Date().toISOString().split("T")[0];
  $('input[type="date"]').attr("max", today);
};

/*
---Hàm Render table---
*/
const renderTableContainer = (data) => {
  const employees = data.employees;
  const totalCount = data.totalCount;
  const table = $("#body_table");
  table.html("");

  if (employees && employees.length > 0) {
    const ths = $("table thead th");

    // Lặp qua từng nhân viên
    for (const emp of employees) {
      var trHtml = $(`<tr></tr>`);

      //Lặp qua từng cột trong tiêu đề
      for (const th of ths) {
        let value = null;

        //Lấy ra giá trị tương ứng  propsValue từng cột
        let propsValue = $(th).attr("propsValue");

        // format data
        switch (propsValue) {
          case "employeeID":
            let checkboxID = emp[propsValue];
            value = `<input id=${checkboxID} type="checkbox" class="hide inputCheckboxTable" />
                <label class="checkbox" for=${checkboxID}><div class="tick">L</div></label>`;
            break;
          case "gender":
            let key = emp[propsValue];
            value = convertData(key, [0, 1, 2], ["Khác", "Nam", "Nữ"]);
            break;
          case "departmentID":
            let departmentID = emp[propsValue];
            value = convertDepartment(departmentID, listDepartment);
            break;
          case "dateOfBirth":
            let date = emp[propsValue];
            value = convertDate(date);
            break;
          case "action":
            value = `
            <div class="action df">
              <div class="btn-edit" idEmployee=${emp.employeeID}>
              Sửa    
              </div>
              <div class="btn-more icon-drop-list-table ml8" id="drop-list-action">
              </div>
              </div>
            `;
            break;
          default:
            value = emp[propsValue];
        }
        //Tạo td html
        let tdHtml = `<td>${value || ""}</td>`;

        // đẩy vào trHtml
        trHtml.append(tdHtml);
      }
      // Đẩy trHtml vào table
      table.append(trHtml);
    }
    $(".table-footer").show();
    // in số bản ghi
    $(".total").html(
      `Tổng số:<p class="totalCount">&nbsp${totalCount}&nbsp</p>bản ghi`
    );
    //render số trang
    currentTotalPage = Math.ceil(totalCount / currentPageSize);
    renderPagination(currentTotalPage, currentPageIndex, totalCount);
  } else {
    // Show image khi không có data
    let emptyData = `<div class="emptyData">
          <div class="img-empty-data">
        <img src="../assets/img/errorEmptyData.svg" alt="error">
      </div>
      <p>Không có dữ liệu</p>
    </div>`;
    $(".table-footer").hide();
    // Đẩy vào table
    table.html(emptyData);
    //re-render số trang
    currentTotalPage = Math.ceil(totalCount / currentPageSize);
    renderPagination(currentTotalPage, currentPageIndex);
  }

  $(`.drop-list-more`).hide(); // ẩn tất cả drop more action

  // Xử lý sự kiện sửa nhân viên
  $(".btn-edit").click(async (btn) => {
    modalMode = "UPDATE";
    refreshDataModal();

    currentIdEmployee = btn.target.getAttribute("idEmployee");
    let employee = await employeeServices.getEmployeeById(currentIdEmployee);

    if (employee && employee.length > 0) {
      $(".modal-container").show();

      // fill data vào table
      let inputs = $("input.form-control");
      for (let input of inputs) {
        let propsValue = $(input).attr("id");
        input.value = employee[0][propsValue];
      }
      //Fill data vào input DateOfBirth
      $("#DateOfBirth").val(employee[0]["DateOfBirth"]?.split("T")[0]);

      //Fill data vào input IdentityIssuedDat
      $("#IdentityIssuedDate").val(
        employee[0]["IdentityIssuedDate"]?.split("T")[0]
      );

      //Fill data vào input department
      $("#DepartmentID").val(
        convertDepartment(employee[0]["DepartmentID"], listDepartment)
      );

      // Fill data select gender
      let genderCode = employee[0]["Gender"];
      $(".option >input").map((index, input) => {
        if (genderCode == input.id) {
          input.checked = true;
        }
      });
      //Gán value cho select gender
      $("#Gender").attr("value", employee[0]["Gender"]);

      // Gán value=DepartmentID cho comboBox Department
      $(`#select-department>input`).attr("value", employee[0]["DepartmentID"]);
    }
  });

  // Xử lý sự kiện click action more
  $(".btn-more").click(function () {
    currentIdEmployee = $(this).siblings().attr("idEmployee");
  });
  //Xét toạ độ cho drop action more
  $(".table-wrapper").on("click", function (event) {
    var x = event.pageX;
    var y = event.pageY;
    if (event.target.id === "drop-list-action") {
      $(".drop-list-more").css({
        right: $(window).width() - x,
        top: y,
      });
      $(`.drop-list-more`).show();
    } else {
      $(`.drop-list-more`).hide();
    }
  });

  // Xử lý sự kiện checkbox
  $(".inputCheckboxTable").click((item) => {
    if (item.target.checked) {
      let idEmployee = item.target.id;
      listEmployeeSelected.push(idEmployee);
    } else {
      let idEmployee = item.target.id;
      let index = listEmployeeSelected.indexOf(idEmployee); // lấy ra index
      if (index !== -1) {
        listEmployeeSelected.splice(index, 1); // gỡ id khỏi list
      }
    }
    // active btn delete multiple
    if (listEmployeeSelected.length > 1) {
      $(".btn-deleteMultiple").removeClass("unPointer");
    } else {
      $(".btn-deleteMultiple").addClass("unPointer");
    }
  });

  // Xử lý sự kiện chọn tất cả checkbox
  $("#checkboxID").click(() => {
    if ($("#checkboxID").is(":checked")) {
      let arrCheckbox = $(".inputCheckboxTable").map((index, checkbox) => {
        checkbox.checked = true;
        return checkbox.id;
      });
      listEmployeeSelected = [...arrCheckbox];
    } else {
      $(".inputCheckboxTable").map((index, checkbox) => {
        checkbox.checked = false;
        return checkbox.id;
      });
      listEmployeeSelected = [];
    }
    // active btn delete multiple
    if (listEmployeeSelected.length > 1) {
      $(".btn-deleteMultiple").removeClass("unPointer");
    } else {
      $(".btn-deleteMultiple").addClass("unPointer");
    }
  });
};

/*
--- Hàm refresh data trong modal---
*/
const refreshDataModal = () => {
  let inputs = $(".modal-container input");
  for (let input of inputs) {
    input.value = "";
  }
  // refresh attribute
  $("#DepartmentID").attr("value", "");
  $("#Gender").attr("value", "");

  // refresh radio gender
  $(".option >input").map((index, input) => {
    if (index === 0) {
      input.checked = true;
    } else {
      input.checked = false;
    }
  });
  $("#Gender").attr("value", 1);
};

/*
---Hàm render phân trang---
*/
const renderPagination = (TotalPage, PageIndex, TotalRecord) => {
  let pagesToShow = []; // Các trang cần hiển thị

  // Tính toán các trang cần hiển thị
  if (TotalRecord < currentPageSize) {
    pagesToShow = [1];
  } else if (TotalPage < 5) {
    for (let i = 1; i < TotalPage; i++) {
      pagesToShow.push(i);
    }
  } else {
    if (PageIndex < 3) {
      pagesToShow = [1, 2, 3, null, TotalPage];
    } else if (PageIndex >= TotalPage - 2) {
      pagesToShow = [1, null, TotalPage - 2, TotalPage - 1, TotalPage];
    } else {
      pagesToShow = [
        1,
        null,
        PageIndex,
        PageIndex + 1,
        PageIndex + 2,
        null,
        TotalPage,
      ];
    }
  }
  let listPageHtml = pagesToShow
    .map((item) => {
      return `<div index=${item} class=${
        item === PageIndex ? "selectedPage item" : "item"
      }>${item || "..."}</div>`;
    })
    .join("");

  $(".page-number").html(listPageHtml);

  //Xử lí khi click index chuyển trang
  $(".page-number .item").click(async (item) => {
    let index = $(item.target).attr("index");
    if (index !== "null") {
      currentPageIndex = parseInt(index);
      //Lấy data theo điều kiện

      let data = await employeeServices.filterEmployee(
        currentInputSearch,
        PageIndex,
        currentPageSize
      );
      //re-render table
      renderTableContainer(data);
      //re-render phân trang
      currentTotalRecord = data.totalCount;
      renderPagination(currentTotalPage, currentPageIndex, currentTotalRecord);
      checkUnPointer(currentPageIndex);
    }
  });
};

/**
 *---Xây dựng component comboBox---
 */
const ComboBox = (idComboBox, data, position = "top", distance = 8) => {
  /**
   * Xây dựng layout comboBox
   */
  let liHtml = data
    .map(
      (item) =>
        `<li class=${item.selected && "item-selected"} id=${item.id}>${
          item.name
        }</li>`
    )
    .join("");
  $(`#${idComboBox} .drop-list`).remove();

  //Thêm drop list vào thẻ cha
  $(`#${idComboBox}`).append(`<div class="drop-list"><ul>${liHtml}</ul></div>`);

  //xét width cho drop list (phụ thuộc thẻ cha)
  $(`#${idComboBox} .drop-list`).css(
    "width",
    $(`#${idComboBox}`).outerWidth() || "inherit"
  );

  //Xét khoảng cách drop list với thẻ cha
  let top = $(`#${idComboBox}`).outerHeight() + distance;
  $(`#${idComboBox} .drop-list`).css(position, top);

  /**
   * Xử lý sự kiện select drop list
   */
  $(`#${idComboBox} .drop-list ul li`).click(async (item) => {
    //Gỡ highline tất cả các thẻ
    $(`#${idComboBox} .drop-list ul li`).map((index, item) => {
      item.classList.remove("item-selected");
    });
    //gán ID item đã chọn cho thẻ cha
    $(`#${idComboBox}`).attr("currentIdSelected", item.target.id);

    // Highline item đã chọn
    item.target.classList.add("item-selected");

    //Đóng drop down
    $(`#${idComboBox} .drop-list`).hide();

    // Thay value cho thẻ input nếu có thẻ input bên trong combobox
    if ($(`#${idComboBox}>input`).length) {
      $(`#${idComboBox}>input`).val(item.target.textContent);
      // Gán id department cho comboBox
      $(`#${idComboBox}>input`).attr("value", item.target.id);
    } else {
      $(`#${idComboBox}>p`).text(item.target.textContent);
      //Gán currentPageSize đã chọn
      currentPageSize = $(`#${idComboBox}`).attr("currentIdSelected");

      //Gọi api GetPaging
      const data = await employeeServices.filterEmployee(
        currentInputSearchSelect,
        currentPageIndex,
        currentPageSize
      );
      renderTableContainer(data);
    }
  });

  // Xử lý khi ấn vào nút drop down
  $(`#${idComboBox} .btn-drop`).click((item) => {
    if ($(`#${idComboBox} .drop-list`).is(":hidden")) {
      $(`#${idComboBox} .btn-drop i`).addClass("rotate180"); // Add hiệu ứng
    } else {
      $(`#${idComboBox} .btn-drop i`).removeClass("rotate180"); // Add hiệu ứng
    }
    $(`#${idComboBox} .drop-list`).toggle();
  });
};

/**
 *---Xây dựng menu---
 */
const reLoadDataAndreRender = async () => {
  let data = await employeeServices.filterEmployee(
    currentInputSearch,
    currentPageIndex,
    currentPageSize
  );
  //re-render table
  renderTableContainer(data);
  //re-render phân trang
  currentTotalRecord = data.totalCount;
  renderPagination(currentTotalPage, currentPageIndex, currentTotalRecord);
};

/**
 *---Xây dựng menu---
 */
const renderMenuSidebar = (idElement) => {
  let itemHtml = menuData
    .map((item) => {
      let url = `url(${urlIcon}) no-repeat`;
      return `<div class="item-menu">
      <div class="icon-wrapper">
      <div class="item-menu--icon" style="background:${url};background-position:${item.position};"></div>       
      </div>
            <div class="item-menu--text">${item.title}</div>
          </div>`;
    })
    .join("");
  $(`#${idElement}`).html(itemHtml);
};

//Check unPointer cho nút chuyển trang
const checkUnPointer = (pageIndex) => {
  if (pageIndex === 1) {
    $(".btn-prev").addClass("unPointer");
  } else if (pageIndex === currentTotalPage) {
    $(".btn-next").addClass("unPointer");
  } else {
    $(".btn-prev").removeClass("unPointer");
    $(".btn-next").removeClass("unPointer");
  }
};

app();
