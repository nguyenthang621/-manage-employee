// Chuyển đổi data key->value
const convertData = (key, arrKey, arrValue) => {
  if (arrKey.includes(key)) {
    return arrValue[key];
  } else {
    return "";
  }
};

// Chuyển đổi ngày tháng năm sinh
const convertDate = (dateTime) => {
  let date = "";

  if (dateTime !== null) {
    let arrDate = dateTime.split("T")[0].split("-");
    let i = arrDate.length - 1;
    while (i >= 0) {
      if (i === 0) {
        date += arrDate[i];
      } else {
        date += arrDate[i] + "/";
      }
      i--;
    }
    return date;
  } else {
    return "";
  }
};

// Hàm chuyển đổi DepartmentID -> DepartmentName

const convertDepartment = (departmentID, listDepartment) => {
  let result = null;
  listDepartment.forEach((item) => {
    if (item.id === departmentID) {
      result = item.name;
    }
  });
  return result;
};

// Hàm show hide loading
const LoadingTable = (isShow = true) => {
  if (isShow) {
    $(".loading-table").show();
  } else {
    $(".loading-table").hide();
  }
};

export { convertData, convertDate, convertDepartment, LoadingTable };
