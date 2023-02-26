import { LoadingTable } from "./utils.js";

/* 
Lấy data qua api Employee
*/
export const employeeServices = {
  // Lấy tất cả nhân viên
  async getAllEmployee() {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees`,
        type: "GET",
      });
      if (data && data.errorCode === "ok") {
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Lấy nhân viên theo id
  async getEmployeeById(id) {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees/${id}`,
        type: "GET",
      });
      if (data && data.errorCode === "ok") {
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Lọc nhân viên
  async filterEmployee(keySearch = "", pageIndex = 1, pageSize = 20) {
    try {
      LoadingTable(true);
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees/filter?pageSize=${pageSize}&keySearch=${keySearch}&pageIndex=${pageIndex}`,
        type: "GET",
      });
      LoadingTable(false);
      if (data && data.errorCode === "ok") {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Thêm mới nhân viên
  async insertEmployee(employeeData) {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees`,
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(employeeData),
      });
      if (data && data.errorCode === "ok") {
        return data;
      } else {
        return {
          data: [],
          userMsg: data.userMsg,
        };
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Cập nhật tông tin nhân viên
  async updateEmployee(employeeID, dataEmployee) {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees/${employeeID}`,
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(dataEmployee),
      });
      if (data && data.errorCode === "ok") {
        return data;
      } else {
        return {
          data: [],
          userMsg: data.userMsg,
        };
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Lấy mã nhân viên lớn nhất
  async getMaxEmployeeCode() {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees/maxEmployeeCode`,
        type: "GET",
      });
      if (data && data.errorCode === "ok") {
        return data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },

  // xoá nhân viên
  async deleteEmployeeById(id) {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees/${id}`,
        type: "DELETE",
      });
      if (data && data.errorCode === "ok") {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },

  // xoá nhân viên
  async deleteMultipleEmployeeById(arrId) {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Employees/deleteMultiple`,
        type: "DELETE",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(arrId),
      });
      if (data && data.errorCode === "ok") {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },
};

/* 
Lấy data qua api Department
*/
export const departmentServices = {
  //Lấy tất cả phòng ban
  async getAllDepartment() {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Department`,
        type: "GET",
      });
      if (data && data.errorCode === "ok") {
        return data.data.map((item) => ({
          id: item.DepartmentID,
          name: item.DepartmentName,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },
  // Lọc phòng ban
  async filterDepartment(keySearch = "") {
    try {
      const data = await $.ajax({
        url: `http://localhost:37987/api/v1/Department/filter?keySearch=${keySearch}`,
        type: "GET",
      });
      if (data && data.errorCode === "ok") {
        return data.data.map((item) => ({
          id: item.DepartmentID,
          name: item.DepartmentName,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  },
};
